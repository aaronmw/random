'use client'

import { useAppContext } from '@/app/reducer/AppContext'
import { tooltips } from '@/app/tooltips'
import { AnchorPositionField } from '@/components/Fields/AnchorPositionField'
import { LabeledInputField } from '@/components/Fields/LabeledInputField'
import { ListInputFieldForColors } from '@/components/Fields/ListInputFieldForColors'
import { ListInputFieldForNumbers } from '@/components/Fields/ListInputFieldForNumbers'
import { ListInputFieldForStrings } from '@/components/Fields/ListInputFieldForStrings'
import { SegmentedControlInputField } from '@/components/Fields/SegmentedControlInputField'
import { Icon, IconString } from '@/components/Icon'
import { Spotlight } from '@/components/Spotlight'
import { Tooltip } from '@/components/Tooltip'
import { hasProperty } from '@/lib/hasProperty'
import {
  DATA_TYPES,
  dataTypesByPropertyName,
  PropertyName,
  RandomizationType,
} from '@/lib/types'
import { useParams } from 'next/navigation'
import { ReactNode } from 'react'
import { twJoin } from 'tailwind-merge'
import invariant from 'tiny-invariant'

export default function PropertyPage() {
  const params = useParams()
  const propertyName = params.propertyName as PropertyName
  const { dispatch, state } = useAppContext()
  const { propertySettings } = state
  const isPropertySupported = hasProperty(propertySettings, propertyName)

  if (!isPropertySupported) {
    return (
      <div className="row-span-2 grid place-content-center text-center text-2xl">
        <div className="flex flex-col gap-3">
          <span>Property not supported:</span>{' '}
          <code className="bg-bg-secondary inline-block rounded-md border px-2 py-1">
            {propertyName}
          </code>
        </div>
      </div>
    )
  }

  const thisPropertySettings = propertySettings[propertyName]
  const { disabled, mode, modeOptions } = thisPropertySettings
  const dataType = dataTypesByPropertyName[propertyName]
  const dataTypeConfig = DATA_TYPES[dataType]

  const modeButtons: [
    mode: RandomizationType,
    label: ReactNode,
    iconName: IconString,
  ][] = [
    ['range', tooltips.range(propertyName), 'arrows-left-right-to-line'],
    ['list', tooltips.list(propertyName), 'bars'],
    ['calc', tooltips.calc(propertyName), 'calculator-simple'],
  ]

  return (
    <>
      <Spotlight
        id={`select-a-randomization-mode`}
        targetSelector={`#${propertyName}-config-panel-header`}
        isSpotlighting={true}
        message="Choose a randomization mode"
      />

      <div
        id={`${propertyName}-config-panel-header`}
        className={twJoin(
          'group',
          'h-15 pr-3 pl-5',
          'flex items-center justify-between',
        )}
      >
        <div className="font-bold">{propertyName}</div>

        <SegmentedControlInputField
          label="Randomization Mode"
          path={`propertySettings.${propertyName}.mode`}
        >
          {modeButtons.map(([mode, label, iconName]) => {
            if (!hasProperty(modeOptions, mode)) {
              return null
            }

            return (
              <Tooltip
                key={mode}
                tipContents={label}
              >
                <SegmentedControlInputField.OptionButton value={mode}>
                  <Icon name={iconName} />
                </SegmentedControlInputField.OptionButton>
              </Tooltip>
            )
          })}
        </SegmentedControlInputField>
      </div>

      <div className="overflow-auto py-2">
        <div className="grid grid-cols-4 gap-3 px-2">
          {mode === 'calc' && (
            <SegmentedControlInputField
              label="operator"
              description={tooltips.operator(propertyName)}
              path={`propertySettings.${propertyName}.modeOptions.calc.operator`}
              variant="full"
              variantForButton="button.icon.togglable.secondary"
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
              hasProperty(dataTypeConfig, 'min'),
              `Numeric type ${dataType} is missing \`min\` property`,
            )
            invariant(
              hasProperty(dataTypeConfig, 'max'),
              `Numeric type ${dataType} is missing \`max\` property`,
            )

            const { min, max } = dataTypeConfig

            const pathToCurrentValue = `propertySettings.${propertyName}.modeOptions.${
              mode === 'range' ? 'range' : `calc.${modeOptions.calc!.operator}`
            }`

            return (
              <>
                <LabeledInputField
                  defaultValue={min}
                  label="min"
                  min={min}
                  max={max}
                  placeholder={String(min ?? 0)}
                  path={`${pathToCurrentValue}.min`}
                  type="number"
                  variant="half"
                />
                <LabeledInputField
                  defaultValue={max}
                  label="max"
                  min={min}
                  max={max}
                  placeholder={String(max ?? 100)}
                  path={`${pathToCurrentValue}.max`}
                  type="number"
                  variant="half"
                />
                {hasProperty(thisPropertySettings, 'thousandsSeparator') && (
                  <SegmentedControlInputField
                    label="format"
                    path={`propertySettings.${propertyName}.thousandsSeparator`}
                    variant="full"
                    variantForButton="button.icon.togglable.secondary"
                  >
                    {[
                      {
                        label: '1000',
                        title: 'Unformatted',
                        value: '',
                      },
                      {
                        label: '1,000',
                        title: 'Group Thousands with Comma',
                        value: ',',
                      },
                      {
                        label: '1 000',
                        title: 'Group Thousands with Space',
                        value: ' ',
                      },
                    ].map(({ label, title, value }) => (
                      <SegmentedControlInputField.OptionButton
                        key={value}
                        title={title}
                        value={value}
                      >
                        {label}
                      </SegmentedControlInputField.OptionButton>
                    ))}
                  </SegmentedControlInputField>
                )}
                {hasProperty(thisPropertySettings, 'prefix') && (
                  <>
                    <LabeledInputField
                      defaultValue="0"
                      label="prefix"
                      placeholder="(none)"
                      path={`propertySettings.${propertyName}.prefix`}
                      type="text"
                      variant="half"
                    />
                    <LabeledInputField
                      defaultValue="100"
                      label="suffix"
                      placeholder="(none)"
                      path={`propertySettings.${propertyName}.suffix`}
                      type="text"
                      variant="half"
                    />
                  </>
                )}
              </>
            )
          })()}

          {mode === 'list' && (
            <>
              {dataType === 'color' && (
                <ListInputFieldForColors
                  label="colors"
                  propertyName={propertyName}
                />
              )}

              {(dataType === 'degree' ||
                dataType === 'percent' ||
                dataType === 'int' ||
                dataType === 'pointCount' ||
                dataType === 'udegree' ||
                dataType === 'uint') && (
                <ListInputFieldForNumbers
                  dataType={dataType}
                  label="numbers"
                  propertyName={propertyName}
                />
              )}

              {dataType === 'string' && (
                <ListInputFieldForStrings
                  label="strings"
                  propertyName={propertyName}
                />
              )}
            </>
          )}

          {hasProperty(thisPropertySettings, 'preserveAspectRatio') && (
            <SegmentedControlInputField
              label="lock aspect ratio"
              path={`propertySettings.${propertyName}.preserveAspectRatio`}
              variant="full"
              variantForButton="button.icon.togglable.secondary"
              onChange={({ value }) => {
                dispatch({
                  type: 'setPreserveAspectRatio',
                  payload: {
                    propertyName,
                    preserveAspectRatio: Boolean(value),
                  },
                })
              }}
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

          {hasProperty(thisPropertySettings, 'anchorPosition') && (
            <AnchorPositionField
              label="transform origin"
              propertyName={propertyName}
              variant="full"
            />
          )}

          {hasProperty(thisPropertySettings, 'sortOrder') && (
            <SegmentedControlInputField
              label="sort order"
              description={tooltips.sortOrder(propertyName)}
              path={`propertySettings.${propertyName}.sortOrder`}
              variant="full"
              variantForButton="button.icon.togglable.secondary"
            >
              {[
                {
                  iconName: 'shuffle',
                  label: 'Random (No Sort)',
                  value: 'random',
                },
                {
                  iconName: 'arrow-down',
                  label: 'Descending (Largest to Smallest)',
                  value: 'desc',
                },
                {
                  iconName: 'arrow-up',
                  label: 'Ascending (Smallest to Largest)',
                  value: 'asc',
                },
              ].map(({ iconName, label, value }) => (
                <SegmentedControlInputField.OptionButton
                  key={value}
                  title={label}
                  value={value}
                >
                  <Icon name={iconName as IconString} />
                </SegmentedControlInputField.OptionButton>
              ))}
            </SegmentedControlInputField>
          )}
        </div>
      </div>
    </>
  )
}
