import { Atom } from '@/components/Atom'
import { ComponentProps, FocusEvent } from 'react'
import { FieldContainer, FieldContainerProps } from './FieldContainer'

type LabeledInputFieldProps = Omit<ComponentProps<'input'>, 'value'> &
  Pick<FieldContainerProps<'label'>, 'label' | 'variant'>

export function LabeledInputField({
  label,
  type,
  variant,
  ...otherProps
}: LabeledInputFieldProps) {
  return (
    <FieldContainer
      label={label}
      variant={variant}
    >
      <Atom
        as="input"
        placeholder={
          type === 'number' ? '0' : type === 'text' ? '-' : undefined
        }
        type={type}
        variant={variant === 'labelOnTop' ? 'input' : 'inputWithoutBorder'}
        onFocus={(event: FocusEvent<HTMLInputElement>) => event.target.select()}
        {...otherProps}
      />
    </FieldContainer>
  )
}
