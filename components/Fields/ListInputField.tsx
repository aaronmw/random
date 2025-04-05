import { singlePropertySettingsAtom } from '@/app/atoms/singlePropertySettingsAtom'
import { Atom } from '@/components/Atom'
import { ConditionalWrapper } from '@/components/ConditionalWrapper'
import { Icon } from '@/components/Icon'
import { Randy } from '@/components/Randy'
import { Tooltip } from '@/components/Tooltip'
import { dataTypes } from '@/lib/dataTypes'
import { dataTypesByPropertyName } from '@/lib/dataTypesByPropertyName'
import { pluralize } from '@/lib/pluralize'
import { PropertyName } from '@/lib/types'
import { useAtom } from 'jotai'
import get from 'lodash/get'
import merge from 'lodash/merge'
import set from 'lodash/set'
import {
  ChangeEvent,
  MouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
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
  const propertyAtom = useMemo(
    () => singlePropertySettingsAtom(propertyName),
    [propertyName],
  )
  const [singlePropertySettings, setSinglePropertySettings] =
    useAtom(propertyAtom)

  const colorPickerElementRef = useRef<HTMLInputElement>(null)
  const scrollingElementRef = useRef<HTMLElement>(null)
  const textareaElementRef = useRef<HTMLTextAreaElement>(null)

  const [clickedLineIndex, setClickedLineIndex] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isShowingRandy, setIsShowingRandy] = useState(false)
  const [lineContext, setLineContext] = useState<LineContext | null>(null)
  const [scrollTop, setScrollTop] = useState<number | null>(null)
  const [isClient, setIsClient] = useState(false)

  const pathToValue = 'modeOptions.list.options'
  const values = get(singlePropertySettings, pathToValue) as string[]
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

  const stopEditing = useCallback(() => {
    setIsEditing(false)
  }, [])

  const setValues = useCallback(
    (values: string[]) => {
      const newSinglePropertySettings = merge({}, singlePropertySettings)
      set(newSinglePropertySettings, pathToValue, values)
      setSinglePropertySettings(newSinglePropertySettings)
    },
    [pathToValue, singlePropertySettings, setSinglePropertySettings],
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
              {process.env.NODE_ENV === 'development' && (
                <Atom
                  variant="link"
                  as="button"
                  className="flex items-center gap-1"
                  onClick={() => setIsShowingRandy(true)}
                >
                  <Icon
                    name="robot"
                    variant="solid"
                  />
                  Randy
                </Atom>
              )}

              {errorMessages.length >= 1 && (
                <Atom
                  className="cursor-help"
                  tooltip="Number of invalid values omitted"
                  variant="pill.danger"
                >
                  <Icon
                    name="triangle-exclamation"
                    variant="solid"
                  />{' '}
                  {errorMessages.length}
                </Atom>
              )}

              {numDisabledValues >= 1 && (
                <Atom
                  tooltip={`${pluralize(
                    numDisabledValues,
                    'value is',
                    'values are',
                  )} commented out`}
                  variant="pill.neutral"
                >
                  {'// '}
                  {numDisabledValues}
                </Atom>
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
                <Atom
                  variant="input"
                  as="textarea"
                  className={twJoin(
                    'w-full resize-none px-0 outline-hidden',
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
                          <Atom
                            variant="badge.propertyValue"
                            role="button"
                            className={twJoin(
                              !isValid && [
                                'bg-bg-danger text-text-ondanger border-transparent',
                                'hover:bg-bg-danger-hover',
                              ],
                            )}
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
                          </Atom>
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
          onResponse={(response) => {
            const newSinglePropertySettings = merge({}, singlePropertySettings)
            set(newSinglePropertySettings, `modeOptions.list.options`, response)
            setSinglePropertySettings(newSinglePropertySettings)
          }}
        />
      )}
    </>
  )
}
