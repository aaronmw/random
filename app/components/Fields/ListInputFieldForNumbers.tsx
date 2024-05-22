import { hasProperty } from "@/lib/hasProperty"
import { DATA_TYPES, DataType, PropertyName } from "@/lib/pluginTypes"
import { inRange } from "lodash"
import { ComponentProps } from "react"
import invariant from "tiny-invariant"
import { FieldContainerProps } from "./FieldContainer"
import { ListInputField } from "./ListInputField"

export { ListInputFieldForNumbers }

interface ListInputFieldForNumbersProps
  extends Omit<ComponentProps<"textarea">, "type">,
    Pick<FieldContainerProps, "label" | "variant"> {
  dataType: DataType
  propertyName: PropertyName
  validatorFunction?: (value: string) => string | true
}

function ListInputFieldForNumbers({
  dataType,
  label,
  propertyName,
}: ListInputFieldForNumbersProps) {
  const dataTypeConfig = DATA_TYPES[dataType]

  invariant(
    hasProperty(dataTypeConfig, "min"),
    "Numeric type is missing `min` property",
  )
  invariant(
    hasProperty(dataTypeConfig, "max"),
    "Numeric type is missing `max` property",
  )

  const { min, max } = dataTypeConfig

  return (
    <ListInputField
      label={label}
      propertyName={propertyName}
      validatorFunction={(value) => {
        if (!`${value}`.trim().match(/^-?[0-9]+$/)) {
          return "Not numeric"
        }

        return inRange(Number(value), min, max) ? true : "Out of Range"
      }}
    />
  )
}
