'use client'

import { isGroupedByStatusAtom } from '@/app/atoms/isGroupedByStatusAtom'
import { initialPropertySettings } from '@/app/atoms/propertySettingsAtom'
import { singlePropertySettingsAtom } from '@/app/atoms/singlePropertySettingsAtom'
import { tooltips } from '@/app/tooltips'
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
import { PropertyName, RandomizationType } from '@/lib/types'
import { useAtom, useAtomValue } from 'jotai'
import get from 'lodash/get'
import merge from 'lodash/merge'
import set from 'lodash/set'
import { ChangeEvent, memo, ReactNode, useCallback, useMemo } from 'react'
import { twJoin, twMerge } from 'tailwind-merge'
import invariant from 'tiny-invariant'

const EMPTY_INPUT_PLACEHOLDER_TEXT = '(none)'

function PreMemoPropertySettingsPanel({
  className,
  propertyName,
}: {
  className?: string
  propertyName: PropertyName
}) {
  const panelId = `${propertyName}-config-panel`

  const propertyAtom = useMemo(
    () => singlePropertySettingsAtom(propertyName),
    [propertyName],
  )

  const [singlePropertySettings, setSinglePropertySettings] =
    useAtom(propertyAtom)

  const isGroupedByStatus = useAtomValue(isGroupedByStatusAtom)

  const initialSinglePropertySettings = initialPropertySettings[propertyName]

  const {
    anchorPosition = initialSinglePropertySettings.anchorPosition,
    decimalPlaces = initialSinglePropertySettings.decimalPlaces,
    decimalCharacter = initialSinglePropertySettings.decimalCharacter,
    isEnabled = initialSinglePropertySettings.isEnabled,
    mode = initialSinglePropertySettings.mode,
    modeOptions = initialSinglePropertySettings.modeOptions,
    prefix = initialSinglePropertySettings.prefix,
    preserveAspectRatio = initialSinglePropertySettings.preserveAspectRatio,
    sortOrder = initialSinglePropertySettings.sortOrder,
    suffix = initialSinglePropertySettings.suffix,
    thousandsSeparator = initialSinglePropertySettings.thousandsSeparator,
  } = singlePropertySettings

  const dataType = dataTypesByPropertyName[propertyName]
  const dataTypeConfig = dataTypes[dataType]

  const dataTypeHasMinimumValue = hasProperty(dataTypeConfig, 'min')
  const dataTypeHasMaximumValue = hasProperty(dataTypeConfig, 'max')

  const modeButtons = useMemo<[RandomizationType, ReactNode, IconString][]>(
    () => [
      ['range', tooltips.range(propertyName), 'arrows-left-right-to-line'],
      ['list', tooltips.list(propertyName), 'bars'],
      ['calc', tooltips.calc(propertyName), 'calculator-simple'],
    ],
    [propertyName],
  )

  const handleChange = useCallback(
    (path: string, event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      const currentValue = get(singlePropertySettings, path)

      if (currentValue === value) return

      const newSinglePropertySettings = merge({}, singlePropertySettings)
      set(newSinglePropertySettings, path, value)
      setSinglePropertySettings(newSinglePropertySettings)
    },
    [singlePropertySettings, setSinglePropertySettings],
  )

  const handleSegmentedControlChange = useCallback(
    (path: string, newValue: unknown) => {
      const currentValue = get(singlePropertySettings, path)
      if (currentValue === newValue) return
      const newSinglePropertySettings = merge({}, singlePropertySettings)
      set(newSinglePropertySettings, path, newValue)
      setSinglePropertySettings(newSinglePropertySettings)
    },
    [singlePropertySettings, setSinglePropertySettings],
  )

  const handleClickSetIsEnabled = useCallback(
    (newIsEnabled: boolean) => {
      setSinglePropertySettings(
        merge({}, singlePropertySettings, {
          isEnabled: newIsEnabled,
        }),
      )
    },
    [singlePropertySettings, setSinglePropertySettings],
  )

  return (
    <div
      id={panelId}
      className={twMerge(
        'relative transition-all duration-300 ease-out will-change-transform',
        'focus:ring-border-brand focus:z-10 focus:ring-2',
        isEnabled && 'm-2 overflow-hidden rounded-2xl',
        isGroupedByStatus && isEnabled ? 'order-1' : 'order-99',
        className,
      )}
      key={panelId}
      tabIndex={0}
    >
      <div
        id={`${panelId}-header`}
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
        key={`${panelId}-content`}
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
            onChange={handleSegmentedControlChange.bind(null, 'mode')}
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

          {mode === 'calc' && (
            <SegmentedControlInputField
              label="operator"
              description={tooltips.operator(propertyName)}
              value={modeOptions.calc?.operator}
              variant="full"
              variantForButton="button.icon.togglable.secondary"
              onChange={handleSegmentedControlChange.bind(
                null,
                'modeOptions.calc.operator',
              )}
            >
              {[
                {
                  iconName: 'plus',
                  label: 'Add / Subtract',
                  value: 'add',
                },
                {
                  iconName: 'xmark',
                  label: 'Multiply / Divide',
                  value: 'multiply',
                },
              ].map(({ iconName, label, value, ...otherProps }) => (
                <SegmentedControlInputField.OptionButton
                  key={value}
                  title={label}
                  value={value}
                  {...otherProps}
                >
                  <Icon name={iconName as IconString} />
                </SegmentedControlInputField.OptionButton>
              ))}
            </SegmentedControlInputField>
          )}

          {(() => {
            if (!(mode === 'calc' || mode === 'range')) {
              return null
            }

            invariant(
              dataTypeHasMinimumValue,
              `Numeric type ${dataType} is missing \`min\` property`,
            )
            invariant(
              dataTypeHasMaximumValue,
              `Numeric type ${dataType} is missing \`max\` property`,
            )

            const { min: dataTypeMin, max: dataTypeMax } = dataTypeConfig

            const pathToCurrentValue = `modeOptions.${
              mode === 'calc' ? `calc.${modeOptions.calc!.operator}` : 'range'
            }`

            const currentMin = get(
              singlePropertySettings,
              `${pathToCurrentValue}.min`,
            )
            const currentMax = get(
              singlePropertySettings,
              `${pathToCurrentValue}.max`,
            )

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
                      defaultValue={prefix}
                      label="prefix"
                      placeholder={EMPTY_INPUT_PLACEHOLDER_TEXT}
                      type="text"
                      variant="half"
                      onChange={handleChange.bind(null, 'prefix')}
                    />
                    <LabeledInputField
                      defaultValue={suffix}
                      label="suffix"
                      placeholder={EMPTY_INPUT_PLACEHOLDER_TEXT}
                      type="text"
                      variant="half"
                      onChange={handleChange.bind(null, 'suffix')}
                    />
                  </>
                )}
                {decimalPlaces !== undefined && (
                  <LabeledInputField
                    defaultValue={decimalPlaces}
                    label="decimal places"
                    placeholder={EMPTY_INPUT_PLACEHOLDER_TEXT}
                    type="number"
                    variant="full"
                    className="text-center"
                    onChange={handleChange.bind(null, 'decimalPlaces')}
                  />
                )}
                {thousandsSeparator !== undefined && (
                  <LabeledInputField
                    defaultValue={thousandsSeparator}
                    label="thousands separator"
                    placeholder={EMPTY_INPUT_PLACEHOLDER_TEXT}
                    type="text"
                    variant="full"
                    className="text-center"
                    onChange={handleChange.bind(null, 'thousandsSeparator')}
                  />
                )}
                {decimalCharacter !== undefined && (
                  <LabeledInputField
                    defaultValue={decimalCharacter}
                    label="decimal character"
                    placeholder={EMPTY_INPUT_PLACEHOLDER_TEXT}
                    type="text"
                    variant="full"
                    className="text-center"
                    onChange={handleChange.bind(null, 'decimalCharacter')}
                  />
                )}
              </>
            )
          })()}

          {mode === 'list' && <ListInputField propertyName={propertyName} />}

          {preserveAspectRatio !== undefined && (
            <SegmentedControlInputField
              label="lock aspect ratio"
              value={preserveAspectRatio}
              variant="full"
              variantForButton="button.icon.togglable.secondary"
              onChange={handleSegmentedControlChange.bind(
                null,
                'preserveAspectRatio',
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

          {anchorPosition !== undefined && (
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
              value={sortOrder}
              variant="full"
              variantForButton="button.icon.togglable.secondary"
              onChange={handleSegmentedControlChange.bind(
                null,
                `modeOptions.${mode}.sortOrder`,
              )}
            >
              {[
                {
                  iconName: 'shuffle',
                  label: 'Random (default)',
                  value: 'random',
                },
                {
                  iconName: 'arrow-down',
                  label: 'Largest to Smallest',
                  value: 'desc',
                },
                {
                  iconName: 'arrow-up',
                  label: 'Smallest to Largest',
                  value: 'asc',
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
