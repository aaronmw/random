import { useAppContext } from '@/app/state/AppWrapper'
import { PropertyName } from '@/app/types'
import { ConditionalWrapper } from '@/components/ConditionalWrapper'
import { Icon } from '@/components/Icon'
import { Randy } from '@/components/Randy'
import { Tooltip } from '@/components/Tooltip'
import { dataTypes } from '@/lib/dataTypes'
import { dataTypesByPropertyName } from '@/lib/dataTypesByPropertyName'
import { pluralize } from '@/lib/pluralize'
import { updateListPropertySettings } from '@/lib/services/propertySettingsService'
import get from 'lodash/get'
import {
  ChangeEvent,
  MouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { twJoin, twMerge } from 'tailwind-merge'
import { useOnClickOutside } from 'usehooks-ts'
import { FieldContainer } from './FieldContainer'

interface ListInputFieldProps {
  propertyName: PropertyName
}

interface LineContext {
  lineIndex: number
  setValues: (values: string[]) => void
  value: string
  values: string[]
}

export function ListInputField({ propertyName }: ListInputFieldProps) {
  const { propertySettings, dispatch } = useAppContext()
  const singlePropertySettings = propertySettings[propertyName]

  if (!singlePropertySettings || !dispatch) {
    return null
  }

  const { id: propertySettingId, randomization_mode } = singlePropertySettings

  const colorPickerElementRef = useRef<HTMLInputElement>(null)
  const scrollingElementRef = useRef<HTMLElement>(null)
  const textareaElementRef = useRef<HTMLTextAreaElement>(null)

  const [clickedLineIndex, setClickedLineIndex] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isShowingRandy, setIsShowingRandy] = useState(false)
  const [lineContext, setLineContext] = useState<LineContext | null>(null)
  const [scrollTop, setScrollTop] = useState<number | null>(null)
  const [isClient, setIsClient] = useState(false)

  const pathToValue = 'list_property_settings.options'
  const rawOptionsString = get(singlePropertySettings, pathToValue)
  const optionsString =
    typeof rawOptionsString === 'string' ? rawOptionsString : ''
  // Filter out empty lines to avoid validation errors on empty strings
  const values: string[] = optionsString
    .split('\n')
    .filter((line) => line.trim() !== '')
  const dataType = dataTypesByPropertyName[propertyName]
  const dataTypeConfig = dataTypes[dataType]
  const { label, min, max, validator } = dataTypeConfig

  const validationMessagesByLineIndex = values.map((value) => {
    return String(value).startsWith('//')
      ? true
      : validator({ value, min, max })
  })

  const numDisabledValues = values.filter((value) =>
    String(value).startsWith('//'),
  ).length

  const errorMessages = validationMessagesByLineIndex.filter(
    (validationMessage) => typeof validationMessage === 'string',
  )

  useOnClickOutside(scrollingElementRef as RefObject<HTMLElement>, () => {
    setLineContext(null)
  })

  useEffect(() => {
    const scrollingElement = scrollingElementRef.current
    if (!scrollingElement) return
    const handleScroll = () => setScrollTop(scrollingElement.scrollTop)
    scrollingElement.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      scrollingElement.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (isEditing) {
      const scrollingElement = scrollingElementRef.current
      const textareaElement = textareaElementRef.current

      if (scrollingElement && scrollTop) {
        scrollingElement.scrollTo(0, scrollTop)
      }

      if (textareaElement && clickedLineIndex !== null) {
        const startingIndex = values
          .slice(0, clickedLineIndex)
          .reduce((totalOffset, value) => totalOffset + value.length + 1, 0)
        const endingIndex = startingIndex + values[clickedLineIndex].length
        textareaElement.setSelectionRange(startingIndex, endingIndex)
        setClickedLineIndex(null)
      }
    }
  }, [clickedLineIndex, isEditing, scrollTop, values])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const startEditingLineIndex = useCallback(
    ({ lineIndex }: { lineIndex: number }) => {
      setClickedLineIndex(lineIndex)
      setIsEditing(true)
    },
    [],
  )

  const stopEditing = useCallback(async () => {
    setIsEditing(false)
    // Persist to database when editing stops
    const currentValues = get(singlePropertySettings, pathToValue)
    const optionsString =
      typeof currentValues === 'string' ? currentValues : values.join('\n')
    try {
      await updateListPropertySettings(propertySettingId, {
        options: optionsString,
      })
    } catch (error) {
      console.error('Error updating list property settings:', error)
    }
  }, [propertySettingId, singlePropertySettings, pathToValue, values])

  const setValues = useCallback(
    async (newValues: string[]) => {
      const currentValues = get(singlePropertySettings, pathToValue)
      const currentString =
        typeof currentValues === 'string' ? currentValues : ''
      const newString = newValues.join('\n')

      // Optimistically update local state immediately
      dispatch({
        type: 'setStateByPath',
        payload: {
          path: `propertySettings.${propertyName}.${pathToValue}`,
          value: newString,
        },
      })

      // Persist to database (debounced by onBlur for textarea, immediate for other changes)
      try {
        await updateListPropertySettings(propertySettingId, {
          options: newString,
        })
      } catch (error) {
        console.error('Error updating list property settings:', error)
        // Revert on error
        dispatch({
          type: 'setStateByPath',
          payload: {
            path: `propertySettings.${propertyName}.${pathToValue}`,
            value: currentString,
          },
        })
      }
    },
    [
      dispatch,
      propertyName,
      pathToValue,
      propertySettingId,
      singlePropertySettings,
    ],
  )

  const handleChange = useCallback(
    (event: { target: { value: string } }) => {
      const { value } = event.target
      const newValues = value.split('\n')
      setValues(newValues)
    },
    [setValues],
  )

  const handleClickColorSwatch = useCallback(
    (lineContext: LineContext, event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()

      setLineContext(lineContext)

      requestAnimationFrame(() => {
        colorPickerElementRef.current?.click()
      })
    },
    [],
  )

  const handleChangeColorPicker = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!lineContext) return

      lineContext.setValues(
        lineContext.values.map((v, i) =>
          i === lineContext.lineIndex ? event.target.value : v,
        ),
      )
    },
    [lineContext],
  )

  return (
    <>
      <div className="relative col-span-4 w-full">
        <span className="absolute top-0 right-0 z-10 flex gap-3">
          {isClient && (
            <>
              {randomization_mode === 'list' && (
                <button
                  className="link flex items-center gap-1"
                  onClick={() => setIsShowingRandy(true)}
                >
                  <Icon
                    name="robot"
                    variant="solid"
                  />
                  Randy
                </button>
              )}

              {errorMessages.length >= 1 && (
                <Tooltip tipContents="Number of invalid values omitted">
                  <span className="pill-danger cursor-help">
                    <Icon
                      name="triangle-exclamation"
                      variant="solid"
                    />{' '}
                    {errorMessages.length}
                  </span>
                </Tooltip>
              )}

              {numDisabledValues >= 1 && (
                <Tooltip
                  tipContents={`${pluralize(
                    numDisabledValues,
                    'value is',
                    'values are',
                  )} commented out`}
                >
                  <span className="pill-neutral">
                    {'// '}
                    {numDisabledValues}
                  </span>
                </Tooltip>
              )}
            </>
          )}
        </span>

        <FieldContainer
          variant="labelOnTop"
          classNamesForInteractiveSurface="outline-hidden bg-transparent"
          label={pluralize(2, label, undefined, false)}
          className="relative lowercase outline-hidden"
        >
          {!isClient ? (
            <span className="block h-8 w-full" />
          ) : (
            <span
              className="overflow-x-hidden overflow-y-auto"
              ref={scrollingElementRef}
            >
              {isEditing ? (
                <textarea
                  className={twJoin(
                    'input w-full resize-none px-0 outline-hidden',
                    'border-0 bg-transparent text-left',
                    'text-text font-mono',
                  )}
                  spellCheck={false}
                  ref={textareaElementRef}
                  rows={values.length}
                  value={values.join('\n')}
                  onBlur={stopEditing}
                  onChange={handleChange}
                />
              ) : (
                <span className="flex flex-wrap items-center gap-1 p-1">
                  {values
                    .filter((value) => !String(value).startsWith('//'))
                    .map((value, lineIndex) => {
                      const validationMessage =
                        validationMessagesByLineIndex[lineIndex]
                      const isValid = validationMessage === true

                      return (
                        <ConditionalWrapper
                          condition={!isValid}
                          key={lineIndex}
                          wrapper={(children) => (
                            <Tooltip tipContents={validationMessage}>
                              {children}
                            </Tooltip>
                          )}
                        >
                          <span
                            className={twJoin(
                              'badge-property-value',
                              !isValid && [
                                'bg-bg-danger text-text-ondanger border-transparent',
                                'hover:bg-bg-danger-hover',
                              ],
                            )}
                            role="button"
                            onClick={startEditingLineIndex.bind(null, {
                              lineIndex,
                            })}
                          >
                            {dataType === 'color' && (
                              <div
                                className={twJoin(
                                  'relative',
                                  '-ml-0.5 size-4 -translate-y-[0.5px]',
                                  'rounded-xs',
                                )}
                                style={{
                                  backgroundColor: isValid ? value : undefined,
                                }}
                                onClick={handleClickColorSwatch.bind(null, {
                                  lineIndex,
                                  setValues,
                                  value,
                                  values,
                                })}
                              >
                                <div
                                  className={twMerge(
                                    'absolute inset-0 rounded-xs',
                                    'border-text border mix-blend-overlay',
                                    !isValid && 'border-text-ondanger',
                                  )}
                                />
                              </div>
                            )}

                            {value}
                          </span>
                        </ConditionalWrapper>
                      )
                    })}

                  {lineContext !== null && (
                    <input
                      className="absolute top-full left-0 size-1"
                      ref={colorPickerElementRef}
                      type="color"
                      value={lineContext.values[lineContext.lineIndex]}
                      onChange={handleChangeColorPicker}
                    />
                  )}
                </span>
              )}
            </span>
          )}
        </FieldContainer>
      </div>

      {isClient && (
        <Randy
          isOpen={isShowingRandy}
          onClose={() => setIsShowingRandy(false)}
          isColor={dataType === 'color'}
          onResponse={async (response) => {
            const currentValues = get(singlePropertySettings, pathToValue)
            const currentString =
              typeof currentValues === 'string' ? currentValues : ''
            const responseString = Array.isArray(response)
              ? response.join('\n')
              : String(response)

            // Optimistically update local state immediately
            dispatch({
              type: 'setStateByPath',
              payload: {
                path: `propertySettings.${propertyName}.${pathToValue}`,
                value: responseString,
              },
            })

            // Persist to database
            try {
              await updateListPropertySettings(propertySettingId, {
                options: responseString,
              })
            } catch (error) {
              console.error('Error updating list property settings:', error)
              // Revert on error
              dispatch({
                type: 'setStateByPath',
                payload: {
                  path: `propertySettings.${propertyName}.${pathToValue}`,
                  value: currentString,
                },
              })
            }
          }}
        />
      )}
    </>
  )
}
