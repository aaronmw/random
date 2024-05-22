import { AppContext } from "@/app/reducer"
import { get } from "lodash"
import { ChangeEvent, ComponentProps, useContext } from "react"
import { FieldContainer, FieldContainerProps } from "./FieldContainer"

export { LabeledInputField }

type LabeledInputFieldProps<P extends string, V extends string | number> = Omit<
  ComponentProps<"input">,
  "value"
> &
  Pick<FieldContainerProps, "label" | "variant"> &
  (
    | {
        path: P
        value?: never
      }
    | {
        path?: never
        value: V
      }
  )

const LabeledInputField = <P extends string, V extends string | number>({
  defaultValue,
  label,
  path,
  type,
  value,
  variant,
  onChange,
  ...otherProps
}: LabeledInputFieldProps<P, V>) => {
  const { dispatch, state } = useContext(AppContext)

  const currentValue = value ?? (path ? String(get(state, path)) : undefined)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value: newValue } = event.target

    if (path) {
      dispatch({
        type: "setStateByPath",
        payload: {
          path,
          value: newValue,
        },
      })
      return
    }

    onChange?.(event)
  }

  return (
    <FieldContainer
      label={label}
      variant={variant}
    >
      <input
        className="
          w-full
          border-0
          bg-bgColor
          text-textColor
          outline-0
          [font-size:inherit]
          placeholder:text-fadedTextColor
        "
        placeholder={type === "number" ? "0" : "text" ? "-" : ""}
        type={type}
        value={String(currentValue ?? defaultValue)}
        onChange={handleChange}
        onFocus={(e) => e.target.select()}
        {...otherProps}
      />
    </FieldContainer>
  )
}
