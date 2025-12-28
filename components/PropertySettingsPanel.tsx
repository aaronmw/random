'use client'

import { useAppContext } from '@/app/state/AppWrapper'
import { tooltips } from '@/app/tooltips'
import { PropertyName, RandomizationMode } from '@/app/types'
import { Atom } from '@/components/Atom'
import { CollapsibleBox } from '@/components/CollapsibleBox'
import { AnchorPositionField } from '@/components/Fields/AnchorPositionField'
import { LabeledInputField } from '@/components/Fields/LabeledInputField'
import { ListInputField } from '@/components/Fields/ListInputField'
import { SegmentedControlInputField } from '@/components/Fields/SegmentedControlInputField'
import { Icon, IconString } from '@/components/Icon'
import { dataTypes } from '@/lib/dataTypes'
import { dataTypesByPropertyName } from '@/lib/dataTypesByPropertyName'
import { hasProperty } from '@/lib/hasProperty'
import {
  updateDimensionPropertySettings,
  updateNumericPropertySettings,
  updatePropertySettingEnabled,
  updatePropertySettingMode,
  updatePropertySettingSortOrder,
  updateTextPropertySettings,
} from '@/lib/services/propertySettingsService'
import get from 'lodash/get'
import { ChangeEvent, memo, ReactNode, useCallback, useMemo } from 'react'
import { twJoin, twMerge } from 'tailwind-merge'

const EMPTY_INPUT_PLACEHOLDER_TEXT = '(none)'

function PreMemoPropertySettingsPanel({
  className,
  propertyName,
}: {
  className?: string
  propertyName: PropertyName
}) {
  const { propertySettings, dispatch } = useAppContext()
  const propertySetting = propertySettings[propertyName]

  if (!propertySetting) {
    return null
  }

  const {
    id: propertySettingId,
    is_enabled: isEnabled = false,
    randomization_mode: mode = 'range',
    post_randomization_sort_order: sortOrder = 'none',
    text_property_settings: textSettings,
    dimension_property_settings: dimensionSettings,
    numeric_property_settings: numericSettings,
  } = propertySetting

  const dataType = dataTypesByPropertyName[propertyName]
  const dataTypeConfig = dataTypes[dataType]

  const dataTypeHasMinimumValue = hasProperty(dataTypeConfig, 'min')
  const dataTypeHasMaximumValue = hasProperty(dataTypeConfig, 'max')

  const modeButtons = useMemo<[RandomizationMode, ReactNode, IconString][]>(
    () => [
      ['range', tooltips.range(propertyName), 'arrows-left-right-to-line'],
      ['list', tooltips.list(propertyName), 'bars'],
      ['addition', tooltips.calc(propertyName), 'calculator-simple'],
    ],
    [propertyName],
  )

  const handleChange = useCallback(
    async (path: string, event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      const currentValue = get(propertySetting, path)

      if (currentValue === value) return

      try {
        if (path.startsWith('text_property_settings.')) {
          const field = path.replace('text_property_settings.', '')
          await updateTextPropertySettings(propertySettingId, {
            [field]: value,
          })
        } else if (path.startsWith('dimension_property_settings.')) {
          const field = path.replace('dimension_property_settings.', '')
          await updateDimensionPropertySettings(propertySettingId, {
            [field]: value,
          })
        } else if (path.startsWith('numeric_property_settings.')) {
          const field = path.replace('numeric_property_settings.', '')
          await updateNumericPropertySettings(propertySettingId, {
            [field]: Number(value),
          })
        }
      } catch (error) {
        console.error('Error updating property setting:', error)
      }
    },
    [propertySetting, propertySettingId],
  )

  const handleSegmentedControlChange = useCallback(
    async (path: string, newValue: unknown) => {
      const currentValue = get(propertySetting, path)
      if (currentValue === newValue) return

      try {
        if (path === 'randomization_mode') {
          await updatePropertySettingMode(
            propertySettingId,
            newValue as RandomizationMode,
          )
        } else if (path === 'post_randomization_sort_order') {
          await updatePropertySettingSortOrder(
            propertySettingId,
            newValue as any,
          )
        }
      } catch (error) {
        console.error('Error updating property setting:', error)
      }
    },
    [propertySetting, propertySettingId],
  )

  const handleClickSetIsEnabled = useCallback(
    async (newIsEnabled: boolean) => {
      try {
        await updatePropertySettingEnabled(propertySettingId, newIsEnabled)
      } catch (error) {
        console.error('Error updating property setting enabled state:', error)
      }
    },
    [propertySettingId],
  )

  return (
    <div
      id={`${propertyName}-config-panel`}
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
            : ['h-11', 'text-text-secondary', 'hover:text-text'],
        )}
        onClick={
          !isEnabled ? handleClickSetIsEnabled.bind(null, true) : undefined
        }
      >
        <Atom
          variant={isEnabled ? 'badge.propertyName' : undefined}
          className={twJoin(!isEnabled && 'font-mono')}
        >
          {propertyName}
        </Atom>

        <Atom
          variant="button.icon"
          tooltip={isEnabled ? 'Disable randomization' : 'Enable randomization'}
          className={twJoin(
            'relative z-50',
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
        </Atom>
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
            onChange={handleSegmentedControlChange.bind(
              null,
              'randomization_mode',
            )}
          >
            {modeButtons.map(([mode, tooltip, iconName]) => (
              <SegmentedControlInputField.OptionButton
                key={mode}
                tooltip={tooltip}
                value={mode}
              >
                <Icon name={iconName as IconString} />
                <span className="sr-only">{mode}</span>
              </SegmentedControlInputField.OptionButton>
            ))}
          </SegmentedControlInputField>

          {(() => {
            const pathToCurrentValue = `numeric_property_settings`
            const currentMin = numericSettings?.min
            const currentMax = numericSettings?.max
            const dataTypeMin = dataTypeConfig.min
            const dataTypeMax = dataTypeConfig.max
            const prefix = textSettings?.prefix
            const suffix = textSettings?.suffix
            const decimalPlaces = textSettings?.decimal_places
            const thousandsSeparator = textSettings?.thousands_separator

            return (
              <>
                <LabeledInputField
                  defaultValue={currentMin ?? dataTypeMin}
                  label="min"
                  min={dataTypeMin}
                  max={dataTypeMax}
                  placeholder={String(dataTypeMin)}
                  type="number"
                  variant="half"
                  onChange={handleChange.bind(
                    null,
                    `${pathToCurrentValue}.min`,
                  )}
                />
                <LabeledInputField
                  defaultValue={currentMax ?? dataTypeMax}
                  label="max"
                  min={dataTypeMin}
                  max={dataTypeMax}
                  placeholder={String(dataTypeMax)}
                  type="number"
                  variant="half"
                  onChange={handleChange.bind(
                    null,
                    `${pathToCurrentValue}.max`,
                  )}
                />
                {prefix !== undefined && suffix !== undefined && (
                  <>
                    <LabeledInputField
                      defaultValue={prefix || ''}
                      label="prefix"
                      placeholder={EMPTY_INPUT_PLACEHOLDER_TEXT}
                      type="text"
                      variant="half"
                      onChange={handleChange.bind(
                        null,
                        'text_property_settings.prefix',
                      )}
                    />
                    <LabeledInputField
                      defaultValue={suffix || ''}
                      label="suffix"
                      placeholder={EMPTY_INPUT_PLACEHOLDER_TEXT}
                      type="text"
                      variant="half"
                      onChange={handleChange.bind(
                        null,
                        'text_property_settings.suffix',
                      )}
                    />
                  </>
                )}
                {decimalPlaces !== undefined && (
                  <LabeledInputField
                    defaultValue={decimalPlaces || 0}
                    label="decimal places"
                    placeholder={EMPTY_INPUT_PLACEHOLDER_TEXT}
                    type="number"
                    variant="full"
                    className="text-center"
                    onChange={handleChange.bind(
                      null,
                      'text_property_settings.decimal_places',
                    )}
                  />
                )}
                {thousandsSeparator !== undefined && (
                  <LabeledInputField
                    defaultValue={thousandsSeparator || ''}
                    label="thousands separator"
                    placeholder={EMPTY_INPUT_PLACEHOLDER_TEXT}
                    type="text"
                    variant="full"
                    className="text-center"
                    onChange={handleChange.bind(
                      null,
                      'text_property_settings.thousands_separator',
                    )}
                  />
                )}
              </>
            )
          })()}

          {mode === 'list' && <ListInputField propertyName={propertyName} />}

          {dimensionSettings?.preserve_aspect_ratio !== undefined && (
            <SegmentedControlInputField
              label="lock aspect ratio"
              value={dimensionSettings.preserve_aspect_ratio || false}
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
                  label: 'OFF',
                  value: false,
                },
                {
                  id: `${propertyName}-preserve-aspect-ratio-on`,
                  label: 'ON',
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

          {dimensionSettings?.anchor_position !== undefined && (
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
                  tooltip={label}
                  value={value}
                >
                  <Icon name={iconName as IconString} />
                  <span className="sr-only">{label}</span>
                </SegmentedControlInputField.OptionButton>
              ))}
            </SegmentedControlInputField>
          )}
        </div>
      </CollapsibleBox>
    </div>
  )
}

export const PropertySettingsPanel = memo(
  PreMemoPropertySettingsPanel,
  (prevProps, nextProps) => {
    return (
      prevProps.propertyName === nextProps.propertyName &&
      prevProps.className === nextProps.className
    )
  },
)
