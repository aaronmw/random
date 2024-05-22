import { Icon } from "@/app/components/Icon"
import { PropertyName } from "@/lib/types"
import { ComponentProps, MouseEvent, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"
import { FieldContainerProps } from "./FieldContainer"
import { ListInputField } from "./ListInputField"

export { ListInputFieldForColors }

interface ListInputFieldForColorsProps
  extends Omit<ComponentProps<"textarea">, "type">,
    Pick<FieldContainerProps, "label" | "variant"> {
  propertyName: PropertyName
}

interface LineContext {
  lineIndex: number
  setValues: (values: string[]) => void
  value: string
  values: string[]
}

const classNames = {
  colorSwatch: ({ isValid = false }) =>
    twMerge(
      `
        relative
        mr-1
        flex
        size-4
        cursor-pointer
        items-center
        justify-center
        shadow-inner
      `,
      isValid
        ? `
          `
        : `
            text-fadedTextColor
          `,
    ),
}

function ListInputFieldForColors({
  label,
  propertyName,
}: ListInputFieldForColorsProps) {
  const [lineContext, setLineContext] = useState<LineContext | null>(null)

  const colorPickerElementRef = useRef<HTMLInputElement>(null)

  function handleClickColorSwatch(
    lineContext: LineContext,
    event: MouseEvent<HTMLDivElement>,
  ) {
    event.preventDefault()
    event.stopPropagation()
    setLineContext(lineContext)

    requestAnimationFrame(() => {
      colorPickerElementRef.current?.click()
    })
  }

  return (
    <>
      {lineContext !== null && (
        <input
          className="hidden"
          ref={colorPickerElementRef}
          type="color"
          value={lineContext.values[lineContext.lineIndex]}
          onChange={(event) =>
            lineContext.setValues(
              lineContext.values.map((v, i) =>
                i === lineContext.lineIndex ? event.target.value : v,
              ),
            )
          }
        />
      )}

      <ListInputField
        label={label}
        propertyName={propertyName}
        renderLeftSlot={({ isValid, lineIndex, setValues, value, values }) => (
          <div
            className={classNames.colorSwatch({ isValid })}
            key={`${lineIndex}-${value}`}
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
            {isValid ? null : (
              <Icon
                name="ban"
                variant="solid"
              />
            )}
          </div>
        )}
        validatorFunction={(value) => {
          if (!CSS.supports("color", value)) {
            return "Color not recognized"
          }
          return true
        }}
      />
    </>
  )
}
