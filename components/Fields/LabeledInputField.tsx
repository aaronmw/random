import { ComponentProps, FocusEvent } from 'react'
import { twMerge } from 'tailwind-merge'
import { FieldContainer, FieldContainerProps } from './FieldContainer'

type LabeledInputFieldProps = ComponentProps<'input'> &
  Pick<FieldContainerProps<'label'>, 'label' | 'variant'> & {
    propertyName?: string
    fieldName?: string
  }

export function LabeledInputField({
  label,
  type,
  variant,
  className,
  propertyName,
  fieldName,
  ...otherProps
}: LabeledInputFieldProps) {
  const inputClass =
    variant === 'labelOnTop' ? 'input' : 'input-without-border'

  const testId =
    propertyName && fieldName
      ? `input-${propertyName}-${fieldName}`
      : undefined

  return (
    <FieldContainer
      label={label}
      variant={variant}
    >
      <input
        data-testid={testId}
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
