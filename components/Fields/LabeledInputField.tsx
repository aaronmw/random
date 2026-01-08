import { ComponentProps, FocusEvent } from 'react'
import { twMerge } from 'tailwind-merge'
import { FieldContainer, FieldContainerProps } from './FieldContainer'

type LabeledInputFieldProps = ComponentProps<'input'> &
  Pick<FieldContainerProps<'label'>, 'label' | 'variant'>

export function LabeledInputField({
  label,
  type,
  variant,
  className,
  ...otherProps
}: LabeledInputFieldProps) {
  const inputClass =
    variant === 'labelOnTop' ? 'input' : 'input-without-border'

  return (
    <FieldContainer
      label={label}
      variant={variant}
    >
      <input
        className={twMerge(inputClass, className)}
        placeholder={
          type === 'number' ? '0' : type === 'text' ? '-' : undefined
        }
        type={type}
        onFocus={(event: FocusEvent<HTMLInputElement>) => event.target.select()}
        {...otherProps}
      />
    </FieldContainer>
  )
}
