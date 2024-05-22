import { IconName, IconVariant } from "@/app/components/Icon"
import { IconButton } from "@/app/components/IconButton"
import { AppContext } from "@/app/reducer"
import { get } from "lodash"
import { ComponentProps, MouseEvent, useContext } from "react"
import { twMerge } from "tailwind-merge"
import { FieldContainer, FieldContainerProps } from "./FieldContainer"

export { SegmentedControlInputField }
export type { SegmentedControlInputFieldProps }

interface SegmentedControlInputFieldProps<V extends string | number | boolean>
  extends Omit<
      ComponentProps<"input">,
      "defaultValue" | "name" | "value" | "onChange"
    >,
    Pick<FieldContainerProps, "label" | "variant"> {
  options: {
    iconName?: IconName
    iconVariant?: IconVariant
    title?: string
    label: string
    value: V
  }[]
  path: string
  onChange?: (context: { path: string; value: V }) => void
}

const SegmentedControlInputField = <V extends string | number | boolean>({
  label,
  options,
  path,
  variant,
  onChange,
}: SegmentedControlInputFieldProps<V>) => {
  const { dispatch, state } = useContext(AppContext)

  const currentValue = get(state, path)

  const handleClickButton = (
    newValue: V,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault()

    const payload = {
      path,
      value: newValue,
    }

    if (typeof onChange === "function") {
      onChange?.(payload)
      return
    }

    dispatch({
      type: "setStateByPath",
      payload,
    })
  }

  return (
    <FieldContainer
      label={label}
      variant={variant}
    >
      <div
        className="
          flex
          w-fit
          flex-row-reverse
          overflow-hidden
          outline-0
        "
      >
        {options.map(
          (
            { iconName, iconVariant, label, title, value: optionValue },
            index,
          ) => {
            const isSelected = optionValue === currentValue

            return (
              <IconButton
                className={twMerge(
                  isSelected && "is-selected",
                  `
                    [&.is-selected]:bg-selectedBgColor
                  `,
                )}
                iconName={iconName}
                iconVariant={iconVariant}
                key={`${optionValue}-${index}`}
                label={label}
                title={title ?? label}
                onClick={handleClickButton.bind(null, optionValue)}
              />
            )
          },
        )}
      </div>
    </FieldContainer>
  )
}
