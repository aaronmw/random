'use client'

import { useAppContext } from '@/app/state/AppWrapper'
import { tooltips } from '@/app/tooltips'
import { PropertyName, RandomizationMode } from '@/app/types'
import { CollapsibleBox } from '@/components/CollapsibleBox'
import { AnchorPositionField } from '@/components/Fields/AnchorPositionField'
import { LabeledInputField } from '@/components/Fields/LabeledInputField'
import { ListInputField } from '@/components/Fields/ListInputField'
import { SegmentedControlInputField } from '@/components/Fields/SegmentedControlInputField'
import { Icon, IconString } from '@/components/Icon'
import { Tooltip } from '@/components/Tooltip'
import { FREE_USER_MAX_ENABLED_PROPERTIES } from '@/lib/constants'
import { dataTypes } from '@/lib/dataTypes'
import { dataTypesByPropertyName } from '@/lib/dataTypesByPropertyName'
import {
  bulkDisableProperties,
  updateDimensionPropertySettings,
  updateNumericPropertySettings,
  updatePropertySettingEnabled,
  updatePropertySettingMode,
  updatePropertySettingSortOrder,
  updateTextPropertySettings,
} from '@/lib/services/propertySettingsService'
import { Database } from '@/supabase/generated-types'
import { dispatchTestSignal } from '@/lib/utils/testSignals'
import get from 'lodash/get'
import pickBy from 'lodash/pickBy'
import {
  ChangeEvent,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'
import { twJoin, twMerge } from 'tailwind-merge'

const EMPTY_INPUT_PLACEHOLDER_TEXT = '(none)'
const STATE_UPDATE_DEBOUNCE_MS = 100
const DB_UPDATE_DEBOUNCE_MS = 300

const extractFieldName = (path: string, prefix: string): string => {
  return path.replace(`${prefix}.`, '')
}

function PreMemoPropertySettingsPanel({
  className,
  propertyName,
}: {
  className?: string
  propertyName: PropertyName
}) {
  const { propertySettings, dispatch, currentUserId, paymentStatus } =
    useAppContext()
  const isUnpaid =
    paymentStatus === 'UNPAID' || paymentStatus === 'NOT_SUPPORTED'
  const enabledCount = Object.keys(pickBy(propertySettings, 'is_enabled')).length
  const propertySetting = propertySettings[propertyName]
  const isEnabled = propertySetting?.is_enabled ?? false
  const wouldBeSecond =
    isUnpaid && !isEnabled && enabledCount >= FREE_USER_MAX_ENABLED_PROPERTIES

  const [, startTransition] = useTransition()
  const dbUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const stateUpdateTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined)

  const propertySettingId = propertySetting?.id
  const mode = (propertySetting?.randomization_mode ?? 'range') as RandomizationMode
  const textSettings = propertySetting?.text_property_settings
  const dimensionSettings = propertySetting?.dimension_property_settings
  const numericSettings = propertySetting?.numeric_property_settings
  const sortOrderMap: Partial<
    Record<
      RandomizationMode,
      Database['public']['Enums']['post_randomization_sort_order'] | undefined
    >
  > = {
    range: (propertySetting as any)?.post_range_randomization_sort_order,
    list: (propertySetting as any)?.post_list_randomization_sort_order,
    addition: (propertySetting as any)?.post_addition_randomization_sort_order,
    multiplication: (propertySetting as any)
      ?.post_multiplication_randomization_sort_order,
  }
  const sortOrder = (sortOrderMap[mode as keyof typeof sortOrderMap] ??
    'none') as Database['public']['Enums']['post_randomization_sort_order']

  const operator = numericSettings?.operator || 'add'
  const showMinMax =
    mode === 'range' || mode === 'addition' || mode === 'multiplication'
  const showOperator = mode === 'addition' || mode === 'multiplication'

  const dataType = dataTypesByPropertyName[propertyName]
  const dataTypeConfig = dataTypes[dataType]

  const [localMin, setLocalMin] = useState<number | null>(
    numericSettings?.min ?? null,
  )
  const [localMax, setLocalMax] = useState<number | null>(
    numericSettings?.max ?? null,
  )
  const [localPrefix, setLocalPrefix] = useState<string>(
    textSettings?.prefix || '',
  )
  const [localSuffix, setLocalSuffix] = useState<string>(
    textSettings?.suffix || '',
  )
  const [localDecimalPlaces, setLocalDecimalPlaces] = useState<number>(
    textSettings?.decimal_places ?? 0,
  )
  const [localThousandsSeparator, setLocalThousandsSeparator] =
    useState<string>(textSettings?.thousands_separator || '')

  // Sync local state when prop changes (e.g., from database updates)
  useEffect(() => {
    setLocalMin(numericSettings?.min ?? null)
    setLocalMax(numericSettings?.max ?? null)
    setLocalPrefix(textSettings?.prefix || '')
    setLocalSuffix(textSettings?.suffix || '')
    setLocalDecimalPlaces(textSettings?.decimal_places ?? 0)
    setLocalThousandsSeparator(textSettings?.thousands_separator || '')
  }, [
    numericSettings?.min,
    numericSettings?.max,
    textSettings?.prefix,
    textSettings?.suffix,
    textSettings?.decimal_places,
    textSettings?.thousands_separator,
  ])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (dbUpdateTimeoutRef.current) {
        clearTimeout(dbUpdateTimeoutRef.current)
      }
      if (stateUpdateTimeoutRef.current) {
        clearTimeout(stateUpdateTimeoutRef.current)
      }
    }
  }, [])

  const modeButtons = useMemo<[RandomizationMode, ReactNode, IconString][]>(
    () => [
      ['range', tooltips.range(propertyName), 'arrows-left-right-to-line'],
      ['list', tooltips.list(propertyName), 'bars'],
      ['addition', tooltips.calc(propertyName), 'calculator-simple'],
    ],
    [propertyName],
  )

  const updateLocalState = useCallback((path: string, value: string) => {
    if (path === 'numeric_property_settings.min') {
      setLocalMin(value !== '' ? Number(value) : null)
    } else if (path === 'numeric_property_settings.max') {
      setLocalMax(value !== '' ? Number(value) : null)
    } else if (path === 'text_property_settings.prefix') {
      setLocalPrefix(value)
    } else if (path === 'text_property_settings.suffix') {
      setLocalSuffix(value)
    } else if (path === 'text_property_settings.decimal_places') {
      setLocalDecimalPlaces(Number(value) || 0)
    } else if (path === 'text_property_settings.thousands_separator') {
      setLocalThousandsSeparator(value)
    }
  }, [])

  const updateStateByPath = useCallback(
    (path: string, value: unknown) => {
      if (!dispatch) return

      startTransition(() => {
        dispatch({
          type: 'setStateByPath',
          payload: {
            path: `propertySettings.${propertyName}.${path}`,
            value,
          },
        })

        // For numeric fields, also update the top-level min/max fields
        // that the plugin code reads from
        if (path.startsWith('numeric_property_settings.')) {
          const field = extractFieldName(path, 'numeric_property_settings')
          dispatch({
            type: 'setStateByPath',
            payload: {
              path: `propertySettings.${propertyName}.${field}`,
              value,
            },
          })
        }
      })
    },
    [dispatch, propertyName],
  )

  const updateDatabase = useCallback(
    async (path: string, value: string | number) => {
      try {
        if (path.startsWith('text_property_settings.')) {
          const field = extractFieldName(path, 'text_property_settings')
          await updateTextPropertySettings(propertySettingId, {
            [field]: value,
          })
        } else if (path.startsWith('dimension_property_settings.')) {
          const field = extractFieldName(path, 'dimension_property_settings')
          await updateDimensionPropertySettings(propertySettingId, {
            [field]: value,
          })
        } else if (path.startsWith('numeric_property_settings.')) {
          const field = extractFieldName(path, 'numeric_property_settings')
          await updateNumericPropertySettings(propertySettingId, {
            [field]: Number(value),
          })
        }
      } catch (error) {
        console.error('Error updating property setting:', error)
        throw error
      }
    },
    [propertySettingId],
  )

  const revertStateOnError = useCallback(
    (path: string) => {
      if (!dispatch) return

      const originalValue = get(propertySetting, path)
      dispatch({
        type: 'setStateByPath',
        payload: {
          path: `propertySettings.${propertyName}.${path}`,
          value: originalValue,
        },
      })

      if (path.startsWith('numeric_property_settings.')) {
        const field = extractFieldName(path, 'numeric_property_settings')
        const originalTopLevelValue = get(propertySetting, field)
        dispatch({
          type: 'setStateByPath',
          payload: {
            path: `propertySettings.${propertyName}.${field}`,
            value: originalTopLevelValue,
          },
        })
      }
    },
    [dispatch, propertyName, propertySetting],
  )

  // Helper function for optimistic updates with error handling
  const updateWithOptimisticState = useCallback(
    async (path: string, newValue: unknown, updateFn: () => Promise<void>) => {
      // For sort order, update the correct mode-specific column
      const actualPath =
        path === 'post_randomization_sort_order'
          ? `post_${mode}_randomization_sort_order`
          : path

      const currentValue = get(propertySetting, actualPath)
      if (currentValue === newValue) return

      // Optimistically update local state immediately
      if (dispatch) {
        dispatch({
          type: 'setStateByPath',
          payload: {
            path: `propertySettings.${propertyName}.${actualPath}`,
            value: newValue,
          },
        })
      }

      try {
        await updateFn()
        // Dispatch test signal after successful DB update
        dispatchTestSignal({
          type: 'property-setting-updated',
          propertyName,
          path: actualPath,
          value: newValue,
        })
        // Also dispatch specific signal for enabled state changes
        if (actualPath === 'is_enabled') {
          dispatchTestSignal({
            type: 'property-setting-enabled',
            propertyName,
            isEnabled: newValue as boolean,
          })
        }
      } catch (error) {
        console.error('Error updating property setting:', error)
        // Revert on error
        if (dispatch) {
          dispatch({
            type: 'setStateByPath',
            payload: {
              path: `propertySettings.${propertyName}.${actualPath}`,
              value: currentValue,
            },
          })
        }
      }
    },
    [dispatch, propertyName, propertySetting, mode],
  )

  const handleChange = useCallback(
    async (path: string, event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target

      // Update local state immediately for responsive input
      updateLocalState(path, value)

      // Clear any pending state update
      if (stateUpdateTimeoutRef.current) {
        clearTimeout(stateUpdateTimeoutRef.current)
      }

      // Store the latest value for the debounced update
      const numericValue = path.startsWith('numeric_property_settings.')
        ? Number(value)
        : value

      // Debounce state updates (shorter delay than DB updates)
      stateUpdateTimeoutRef.current = setTimeout(() => {
        updateStateByPath(path, numericValue)
      }, STATE_UPDATE_DEBOUNCE_MS)

      // Clear any pending database update
      if (dbUpdateTimeoutRef.current) {
        clearTimeout(dbUpdateTimeoutRef.current)
      }

      // Schedule database update in a transition (non-urgent)
      // This keeps the UI responsive while typing
      dbUpdateTimeoutRef.current = setTimeout(() => {
        startTransition(async () => {
          try {
            await updateDatabase(path, value)
          } catch (error) {
            revertStateOnError(path)
          }
        })
      }, DB_UPDATE_DEBOUNCE_MS)
    },
    [updateLocalState, updateStateByPath, updateDatabase, revertStateOnError],
  )

  const handleSegmentedControlChange = useCallback(
    async (path: string, newValue: unknown) => {
      if (path === 'randomization_mode') {
        await updateWithOptimisticState(path, newValue, async () => {
          await updatePropertySettingMode(
            propertySettingId,
            newValue as RandomizationMode,
          )
        })
      } else if (path === 'post_randomization_sort_order') {
        await updateWithOptimisticState(path, newValue, async () => {
          await updatePropertySettingSortOrder(
            propertySettingId,
            mode,
            newValue as Database['public']['Enums']['post_randomization_sort_order'],
          )
        })
      } else if (path.startsWith('dimension_property_settings.')) {
        const field = extractFieldName(path, 'dimension_property_settings')
        const updates: Record<string, unknown> = { [field]: newValue }
        if (propertyName === 'width' || propertyName === 'height') {
          updates.dimension = propertyName
        }
        await updateWithOptimisticState(path, newValue, async () => {
          await updateDimensionPropertySettings(propertySettingId, updates)
        })
      } else if (path.startsWith('numeric_property_settings.')) {
        const field = extractFieldName(path, 'numeric_property_settings')
        await updateWithOptimisticState(path, newValue, async () => {
          await updateNumericPropertySettings(propertySettingId, {
            [field]: newValue,
          })
        })
      }
    },
    [propertySettingId, propertyName, updateWithOptimisticState, mode],
  )

  const handleClickSetIsEnabled = useCallback(
    async (newIsEnabled: boolean) => {
      if (
        newIsEnabled &&
        isUnpaid &&
        enabledCount >= FREE_USER_MAX_ENABLED_PROPERTIES
      ) {
        const othersEnabled = Object.entries(propertySettings).filter(
          ([name, ps]) => name !== propertyName && ps?.is_enabled,
        )
        if (othersEnabled.length > 0) {
          const otherIds = othersEnabled.map(([, ps]) => ps.id)
          othersEnabled.forEach(([otherName]) => {
            if (dispatch) {
              dispatch({
                type: 'setStateByPath',
                payload: {
                  path: `propertySettings.${otherName}.is_enabled`,
                  value: false,
                },
              })
            }
          })
          try {
            await bulkDisableProperties(otherIds)
          } catch (error) {
            console.error('Error disabling other properties:', error)
            othersEnabled.forEach(([otherName]) => {
              if (dispatch) {
                dispatch({
                  type: 'setStateByPath',
                  payload: {
                    path: `propertySettings.${otherName}.is_enabled`,
                    value: true,
                  },
                })
              }
            })
            return
          }
        }
      }
      console.log('handleClickSetIsEnabled - property setting:', {
        label: propertyName,
        id: propertySettingId,
        preset_id: propertySetting.preset_id,
        currentUserId,
      })
      await updateWithOptimisticState('is_enabled', newIsEnabled, async () => {
        await updatePropertySettingEnabled(propertySettingId, newIsEnabled)
      })
    },
    [
      propertySettingId,
      propertySetting,
      propertyName,
      propertySettings,
      dispatch,
      currentUserId,
      isUnpaid,
      enabledCount,
      updateWithOptimisticState,
    ],
  )

  if (!propertySetting) {
    return null
  }

  return (
    <div
      id={`${propertyName}-config-panel`}
      aria-expanded={isEnabled}
      data-testid={`property-panel-${propertyName}`}
      className={twMerge(
        'relative transition-all duration-300 ease-out will-change-transform',
        'focus:ring-border-brand focus:z-10 focus:ring-2',
        isEnabled && 'm-2 overflow-hidden rounded-2xl',
        className,
      )}
      tabIndex={0}
    >
      <div
        id={`${propertyName}-config-panel-header`}
        className={twJoin(
          'group',
          'pr-3 pl-5',
          'flex items-center justify-between',
          'transition-all duration-300 ease-out',
          isEnabled
            ? ['h-15', 'bg-bg']
            : [
                'h-11',
                'text-text-secondary',
                'hover:text-text',
                'hover:bg-bg-brand-tertiary',
              ],
        )}
        onClick={
          !isEnabled ? handleClickSetIsEnabled.bind(null, true) : undefined
        }
      >
        <span
          className={twMerge(
            isEnabled ? 'badge-property-name' : 'font-mono',
            !isEnabled && 'font-mono',
          )}
        >
          {propertyName}
        </span>

        <Tooltip
          tipContents={
            wouldBeSecond
              ? 'Enable randomization (will switch from other property)'
              : isEnabled
                ? 'Disable randomization'
                : 'Enable randomization'
          }
        >
          <button
            aria-pressed={isEnabled}
            aria-label={
              isEnabled
                ? `Disable ${propertyName} randomization`
                : `Enable ${propertyName} randomization`
            }
            data-testid={`property-toggle-${propertyName}`}
            className={twJoin(
              'button-icon relative z-50',
              isEnabled
                ? 'text-text-brand'
                : ['text-text-disabled', 'group-hover:text-text'],
            )}
            onClick={handleClickSetIsEnabled.bind(null, !isEnabled)}
          >
            <Icon
              name={
                isEnabled ? 'solid:toggle-large-on' : 'regular:toggle-large-off'
              }
            />
            <span className="sr-only">{isEnabled ? 'Disable' : 'Enable'}</span>
          </button>
        </Tooltip>
      </div>

      <CollapsibleBox
        isCollapsed={!isEnabled}
        className="duration-300 ease-out"
        key={`${propertyName}-config-panel-content`}
      >
        <div
          className={twJoin(
            'group grid grid-cols-4 gap-3 px-3 py-3',
            'border-border bg-bg border-b',
            'transition-all duration-300 ease-out',
            !isEnabled && 'py-0',
          )}
        >
          <SegmentedControlInputField
            label="mode"
            value={mode}
            variant="full"
            propertyName={propertyName}
            onChange={handleSegmentedControlChange.bind(
              null,
              'randomization_mode',
            )}
          >
            {modeButtons.map(([mode, tooltip, iconName]) => (
              <SegmentedControlInputField.OptionButton
                key={mode}
                value={mode}
                ariaLabel={`${mode} mode`}
              >
                <Tooltip tipContents={tooltip}>
                  <Icon name={iconName as IconString} />
                  <span className="sr-only">{mode}</span>
                </Tooltip>
              </SegmentedControlInputField.OptionButton>
            ))}
          </SegmentedControlInputField>

          {showMinMax &&
            (() => {
              const pathToCurrentValue = `numeric_property_settings`
              const dataTypeMin = dataTypeConfig.min
              const dataTypeMax = dataTypeConfig.max

              return (
                <>
                  <LabeledInputField
                    value={localMin ?? dataTypeMin}
                    label="min"
                    min={dataTypeMin}
                    max={dataTypeMax}
                    placeholder={String(dataTypeMin)}
                    type="number"
                    variant="half"
                    propertyName={propertyName}
                    fieldName="min"
                    onChange={handleChange.bind(
                      null,
                      `${pathToCurrentValue}.min`,
                    )}
                  />
                  <LabeledInputField
                    value={localMax ?? dataTypeMax}
                    label="max"
                    min={dataTypeMin}
                    max={dataTypeMax}
                    placeholder={String(dataTypeMax)}
                    type="number"
                    variant="half"
                    propertyName={propertyName}
                    fieldName="max"
                    onChange={handleChange.bind(
                      null,
                      `${pathToCurrentValue}.max`,
                    )}
                  />
                  {/* Only show full text formatting UI for the 'text' property */}
                  {propertyName === 'text' &&
                    textSettings?.prefix !== undefined &&
                    textSettings?.suffix !== undefined && (
                      <>
                        <LabeledInputField
                          value={localPrefix}
                          label="prefix"
                          placeholder={EMPTY_INPUT_PLACEHOLDER_TEXT}
                          type="text"
                          variant="half"
                          propertyName={propertyName}
                          fieldName="prefix"
                          onChange={handleChange.bind(
                            null,
                            'text_property_settings.prefix',
                          )}
                        />
                        <LabeledInputField
                          value={localSuffix}
                          label="suffix"
                          placeholder={EMPTY_INPUT_PLACEHOLDER_TEXT}
                          type="text"
                          variant="half"
                          propertyName={propertyName}
                          fieldName="suffix"
                          onChange={handleChange.bind(
                            null,
                            'text_property_settings.suffix',
                          )}
                        />
                      </>
                    )}
                  {propertyName === 'text' &&
                    textSettings?.decimal_places !== undefined && (
                      <LabeledInputField
                        value={localDecimalPlaces}
                        label="decimal places"
                        placeholder={EMPTY_INPUT_PLACEHOLDER_TEXT}
                        type="number"
                        variant="full"
                        className="text-center"
                        propertyName={propertyName}
                        fieldName="decimal-places"
                        onChange={handleChange.bind(
                          null,
                          'text_property_settings.decimal_places',
                        )}
                      />
                    )}
                  {propertyName === 'text' &&
                    textSettings?.thousands_separator !== undefined && (
                      <LabeledInputField
                        value={localThousandsSeparator}
                        label="thousands separator"
                        placeholder={EMPTY_INPUT_PLACEHOLDER_TEXT}
                        type="text"
                        variant="full"
                        className="text-center"
                        propertyName={propertyName}
                        fieldName="thousands-separator"
                        onChange={handleChange.bind(
                          null,
                          'text_property_settings.thousands_separator',
                        )}
                      />
                    )}
                </>
              )
            })()}

          {showOperator && (
            <SegmentedControlInputField
              label="operator"
              description={tooltips.operator(propertyName)}
              value={operator}
              variant="full"
              variantForButton="button.icon.togglable.secondary"
              propertyName={propertyName}
              onChange={handleSegmentedControlChange.bind(
                null,
                'numeric_property_settings.operator',
              )}
            >
              {[
                {
                  iconName: 'plus',
                  label: 'Add',
                  value: 'add',
                },
                {
                  iconName: 'xmark',
                  label: 'Multiply',
                  value: 'multiply',
                },
              ].map(({ iconName, label, value }) => (
                <SegmentedControlInputField.OptionButton
                  key={value}
                  value={value}
                  ariaLabel={label}
                >
                  <Tooltip tipContents={label}>
                    <Icon name={iconName as IconString} />
                    <span className="sr-only">{label}</span>
                  </Tooltip>
                </SegmentedControlInputField.OptionButton>
              ))}
            </SegmentedControlInputField>
          )}

          {mode === 'list' && <ListInputField propertyName={propertyName} />}

          {(propertyName === 'width' || propertyName === 'height') && (
            <SegmentedControlInputField
              label={
                propertyName === 'width'
                  ? 'auto-scale height'
                  : 'auto-scale width'
              }
              value={dimensionSettings?.preserve_aspect_ratio ?? false}
              variant="full"
              variantForButton="button.icon.togglable.secondary"
              onChange={handleSegmentedControlChange.bind(
                null,
                'dimension_property_settings.preserve_aspect_ratio',
              )}
            >
              {[
                {
                  id: `${propertyName}-preserve-aspect-ratio-off`,
                  label: 'no',
                  value: false,
                },
                {
                  id: `${propertyName}-preserve-aspect-ratio-on`,
                  label: 'yes',
                  value: true,
                },
              ].map(({ id, label, value }) => (
                <SegmentedControlInputField.OptionButton
                  key={id}
                  value={value}
                >
                  {label}
                </SegmentedControlInputField.OptionButton>
              ))}
            </SegmentedControlInputField>
          )}

          {(propertyName === 'width' ||
            propertyName === 'height' ||
            propertyName === 'rotation') && (
            <AnchorPositionField
              label="transform origin"
              propertyName={propertyName}
              variant="full"
            />
          )}

          {sortOrder !== undefined && (
            <SegmentedControlInputField
              label="sort order"
              description={tooltips.sortOrder(propertyName)}
              value={sortOrder || 'none'}
              variant="full"
              variantForButton="button.icon.togglable.secondary"
              onChange={handleSegmentedControlChange.bind(
                null,
                'post_randomization_sort_order',
              )}
            >
              {[
                {
                  iconName: 'shuffle',
                  label: 'Random (default)',
                  value: 'none',
                },
                {
                  iconName: 'arrow-down',
                  label: 'Largest to Smallest',
                  value: 'descending',
                },
                {
                  iconName: 'arrow-up',
                  label: 'Smallest to Largest',
                  value: 'ascending',
                },
              ].map(({ iconName, label, value }) => (
                <SegmentedControlInputField.OptionButton
                  key={value}
                  value={value}
                >
                  <Tooltip tipContents={label}>
                    <Icon name={iconName as IconString} />
                    <span className="sr-only">{label}</span>
                  </Tooltip>
                </SegmentedControlInputField.OptionButton>
              ))}
            </SegmentedControlInputField>
          )}
        </div>
      </CollapsibleBox>
    </div>
  )
}

export const PropertySettingsPanel = memo(PreMemoPropertySettingsPanel)
