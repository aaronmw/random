'use client'

import { AnchorPositionField } from '@/app/components/Fields/AnchorPositionField'
import { LabeledInputField } from '@/app/components/Fields/LabeledInputField'
import { ListInputFieldForColors } from '@/app/components/Fields/ListInputFieldForColors'
import { ListInputFieldForNumbers } from '@/app/components/Fields/ListInputFieldForNumbers'
import { ListInputFieldForStrings } from '@/app/components/Fields/ListInputFieldForStrings'
import { SegmentedControlInputField } from '@/app/components/Fields/SegmentedControlInputField'
import { Icon, IconName } from '@/app/components/Icon'
import { AppContext } from '@/app/reducer'
import { hasProperty } from '@/lib/hasProperty'
import { DATA_TYPES, PropertyName, dataTypesByPropertyName } from '@/lib/types'
import { usePrevious } from '@uidotdev/usehooks'
import { ComponentProps, useContext } from 'react'
import { twJoin, twMerge } from 'tailwind-merge'
import invariant from 'tiny-invariant'

const classNames = ({ isRandomized = false }) => ({
  container: twMerge(
    isRandomized && 'is-randomized',
    `
      transition-all
    `,
    isRandomized
      ? `
          border-y
          pb-3
          [.is-randomized+&]:border-t-0
        `
      : `
          pb-0
        `,
  ),

  headingContainer: twMerge(
    `
      group
      flex
      items-center
      justify-between
      py-2
      pl-4
      pr-2
    `,
    !isRandomized
      ? `
          opacity-50
        `
      : `
          font-bold
          opacity-100
        `,
  ),

  propertyNameContainer: twMerge(
    `
      transition-opacity
    `,
    !isRandomized
      ? `
          opacity-50
        `
      : `
          font-bold
          opacity-100
        `,
  ),

  modeOptionButton: twJoin(
    !isRandomized &&
      `
        opacity-0
        transition-opacity
        group-hover:opacity-100
      `,
  ),

  contentContainer: twMerge(
    `
      grid
      grid-cols-4
      gap-2
      px-2
      transition-all
    `,
    !isRandomized
      ? `
          max-h-0
          overflow-hidden
          opacity-0
        `
      : `
          max-h-[2000px]
          opacity-100
        `,
  ),
})
export function PropertyConfigPanel({
  className,
  propertyName,
  ...otherProps
}: Omit<ComponentProps<'div'>, 'children'> & {
  propertyName: PropertyName
}) {
  const { dispatch, state } = useContext(AppContext)
  const { propertySettings } = state
  const thisPropertySettings = propertySettings[propertyName]
  const { mode, modeOptions } = thisPropertySettings
  const previousMode = usePrevious(mode)
  const modeToRender = mode === 'disabled' ? previousMode : mode
  const dataType = dataTypesByPropertyName[propertyName]
  const dataTypeConfig = DATA_TYPES[dataType]
  const renderedClassNames = classNames({ isRandomized: mode !== 'disabled' })

  const randomizationModeOptions: {
    className?: string
    iconName: IconName
    label: string
    value: string
  }[] = [
    {
      className: 'bg-transparent',
      iconName: 'power-off',
      label: 'Randomize this Property',
      value: 'disabled',
    },
  ]

  if (hasProperty(modeOptions, 'range') && modeOptions.range !== null) {
    randomizationModeOptions.push({
      className: renderedClassNames.modeOptionButton,
      iconName: 'arrows-left-right-to-line',
      label: 'Pick from a range',
      value: 'range',
    })
  }

  if (hasProperty(modeOptions, 'list') && modeOptions.list !== null) {
    randomizationModeOptions.push({
      className: renderedClassNames.modeOptionButton,
      iconName: 'bars',
      label: 'Pick from a list',
      value: 'list',
    })
  }

  if (hasProperty(modeOptions, 'calc') && modeOptions.calc !== null) {
    randomizationModeOptions.push({
      className: renderedClassNames.modeOptionButton,
      iconName: 'calculator-simple',
      label: 'Add / Subtract / Multiply / Divide',
      value: 'calc',
    })
  }

  return (
    <div
      className={twMerge(renderedClassNames.container, className)}
      {...otherProps}
    >
      <div className={renderedClassNames.headingContainer}>
        <div className={renderedClassNames.propertyNameContainer}>
          {propertyName}
        </div>

        <SegmentedControlInputField
          label="Randomization Mode"
          path={`propertySettings.${propertyName}.mode`}
        >
          {randomizationModeOptions.map(
            ({ iconName, label, value, ...otherProps }) => (
              <SegmentedControlInputField.OptionButton
                key={value}
                title={label}
                value={value}
                {...otherProps}
              >
                <Icon name={iconName} />
              </SegmentedControlInputField.OptionButton>
            ),
          )}
        </SegmentedControlInputField>
      </div>

      <div className={renderedClassNames.contentContainer}>
        {modeToRender === 'calc' && (
          <SegmentedControlInputField
            label="operator"
            path={`propertySettings.${propertyName}.modeOptions.calc.operator`}
            variant="full"
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
                <Icon name={iconName as IconName} />
              </SegmentedControlInputField.OptionButton>
            ))}
          </SegmentedControlInputField>
        )}

        {(() => {
          if (!(modeToRender === 'calc' || modeToRender === 'range')) {
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
            modeToRender === 'range'
              ? 'range'
              : `calc.${modeOptions.calc!.operator}`
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

        {modeToRender === 'list' && (
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

        {hasProperty(thisPropertySettings, 'anchor') && (
          <AnchorPositionField
            label="transform origin"
            propertyName={propertyName}
            variant="full"
          />
        )}

        {hasProperty(thisPropertySettings, 'sortOrder') && (
          <SegmentedControlInputField
            label="sort order"
            path={`propertySettings.${propertyName}.sortOrder`}
            variant="full"
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
                <Icon name={iconName as IconName} />
              </SegmentedControlInputField.OptionButton>
            ))}
          </SegmentedControlInputField>
        )}
      </div>
    </div>
  )
}
