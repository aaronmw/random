"use client"

import { AnchorPositionField } from "@/app/components/Fields/AnchorPositionField"
import { LabeledInputField } from "@/app/components/Fields/LabeledInputField"
import { ListInputFieldForColors } from "@/app/components/Fields/ListInputFieldForColors"
import { ListInputFieldForNumbers } from "@/app/components/Fields/ListInputFieldForNumbers"
import { ListInputFieldForStrings } from "@/app/components/Fields/ListInputFieldForStrings"
import { SegmentedControlInputField } from "@/app/components/Fields/SegmentedControlInputField"
import { GridContainer } from "@/app/components/GridContainer"
import { IconName } from "@/app/components/Icon"
import { AppContext } from "@/app/reducer"
import { hasProperty } from "@/lib/hasProperty"
import {
  DATA_TYPES,
  PropertyName,
  dataTypesByPropertyName,
} from "@/lib/pluginTypes"
import { useContext, useEffect } from "react"
import { twMerge } from "tailwind-merge"
import invariant from "tiny-invariant"

export default function PropertiesPage({
  params: { propertyName },
}: {
  params: {
    propertyName: PropertyName
  }
}) {
  const { dispatch, state } = useContext(AppContext)

  useEffect(() => {
    dispatch({
      type: "setStateByPath",
      payload: {
        path: "activePropertyName",
        value: propertyName,
      },
    })
  }, [dispatch, propertyName])

  const { propertySettings } = state

  const activePropertySettings = propertySettings[propertyName]

  const { isRandomized, mode, modeOptions } = activePropertySettings

  const dataType = dataTypesByPropertyName[propertyName]

  const dataTypeConfig = DATA_TYPES[dataType]

  const randomizationModeOptions: {
    iconName: IconName
    label: string
    value: string
  }[] = []

  if (hasProperty(modeOptions, "range") && modeOptions.range !== null) {
    randomizationModeOptions.push({
      iconName: "arrows-left-right-to-line",
      label: "Pick from a range",
      value: "range",
    })
  }

  if (hasProperty(modeOptions, "list") && modeOptions.list !== null) {
    randomizationModeOptions.push({
      iconName: "bars",
      label: "Pick from a list",
      value: "list",
    })
  }

  if (hasProperty(modeOptions, "calc") && modeOptions.calc !== null) {
    randomizationModeOptions.push({
      iconName: "calculator-simple",
      label: "Add / Subtract / Multiply / Divide",
      value: "calc",
    })
  }

  return (
    <div
      className={twMerge(
        `
          col-start-2
          col-end-3
          row-start-2
          row-end-3
          overflow-y-auto
          transition-opacity
        `,
        !isRandomized &&
          `
            pointer-events-none
            opacity-30
          `,
      )}
    >
      <div
        className="
          flex
          items-center
          justify-between
          px-4
          py-2
        "
      >
        <div className="font-bold">{propertyName}</div>
        <SegmentedControlInputField
          label="Randomization Mode"
          options={randomizationModeOptions}
          path={`propertySettings.${propertyName}.mode`}
        />
      </div>

      <GridContainer>
        {mode === "calc" && (
          <SegmentedControlInputField
            label="operator"
            path={`propertySettings.${propertyName}.modeOptions.calc.operator`}
            variant="full"
            options={[
              {
                iconName: "plus",
                label: "Add / Subtract",
                value: "add",
              },
              {
                iconName: "xmark",
                label: "Multiply / Divide",
                value: "multiply",
              },
            ]}
          />
        )}

        {(() => {
          if (!(mode === "calc" || mode === "range")) {
            return null
          }

          invariant(
            hasProperty(dataTypeConfig, "min"),
            `Numeric type ${dataType} is missing \`min\` property`,
          )
          invariant(
            hasProperty(dataTypeConfig, "max"),
            `Numeric type ${dataType} is missing \`max\` property`,
          )

          const { min, max } = dataTypeConfig

          const pathToCurrentValue = `propertySettings.${propertyName}.modeOptions.${
            mode === "range" ? "range" : `calc.${modeOptions.calc!.operator}`
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
              {hasProperty(activePropertySettings, "thousandsSeparator") && (
                <SegmentedControlInputField
                  label="format"
                  path={`propertySettings.${propertyName}.thousandsSeparator`}
                  variant="full"
                  options={[
                    {
                      label: "1000",
                      title: "Unformatted",
                      value: "",
                    },
                    {
                      label: "1,000",
                      title: "Group Thousands with Comma",
                      value: ",",
                    },
                    {
                      label: "1 000",
                      title: "Group Thousands with Space",
                      value: " ",
                    },
                  ]}
                />
              )}
              {hasProperty(activePropertySettings, "prefix") && (
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

        {mode === "list" && (
          <>
            {dataType === "color" && (
              <ListInputFieldForColors
                label="colors"
                propertyName={propertyName}
              />
            )}

            {(dataType === "degree" ||
              dataType === "percent" ||
              dataType === "int" ||
              dataType === "pointCount" ||
              dataType === "udegree" ||
              dataType === "uint") && (
              <ListInputFieldForNumbers
                dataType={dataType}
                label="numbers"
                propertyName={propertyName}
              />
            )}

            {dataType === "string" && (
              <ListInputFieldForStrings
                label="strings"
                propertyName={propertyName}
              />
            )}
          </>
        )}

        {hasProperty(activePropertySettings, "preserveAspectRatio") && (
          <SegmentedControlInputField
            label="lock aspect ratio"
            path={`propertySettings.${propertyName}.preserveAspectRatio`}
            variant="full"
            options={[
              {
                label: "OFF",
                value: false,
              },
              {
                label: "ON",
                value: true,
              },
            ]}
            onChange={({ value }) => {
              dispatch({
                type: "setPreserveAspectRatio",
                payload: {
                  propertyName,
                  preserveAspectRatio: value,
                },
              })
            }}
          />
        )}

        {hasProperty(activePropertySettings, "anchor") && (
          <AnchorPositionField
            label="transform origin"
            propertyName={propertyName}
            variant="full"
          />
        )}

        {hasProperty(activePropertySettings, "sortOrder") && (
          <SegmentedControlInputField
            label="sort order"
            path={`propertySettings.${propertyName}.sortOrder`}
            variant="full"
            options={[
              {
                iconName: "shuffle",
                label: "Random (No Sort)",
                value: "random",
              },
              {
                iconName: "arrow-down",
                label: "Descending (Largest to Smallest)",
                value: "desc",
              },
              {
                iconName: "arrow-up",
                label: "Ascending (Smallest to Largest)",
                value: "asc",
              },
            ]}
          />
        )}
      </GridContainer>
    </div>
  )
}
