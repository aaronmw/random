import { useAppContext } from '@/app/reducer/AppContext'
import { StyledText } from '@/components/StyledText'
import get from 'lodash/get'
import { ChangeEvent, ComponentProps, FocusEvent, Ref, forwardRef } from 'react'
import { FieldContainer, FieldContainerProps } from './FieldContainer'

export { LabeledInputField }

type LabeledInputFieldProps<P extends string, V extends string | number> = Omit<
  ComponentProps<'input'>,
  'value'
> &
  Pick<FieldContainerProps<'label'>, 'label' | 'variant'> &
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

const InnerLabeledInputField = <P extends string, V extends string | number>(
  {
    defaultValue,
    label,
    path,
    type,
    value,
    variant,
    onChange,
    ...otherProps
  }: LabeledInputFieldProps<P, V>,
  ref: Ref<HTMLInputElement>,
) => {
  const { dispatch, state } = useAppContext()

  const currentValue = value ?? (path ? String(get(state, path)) : undefined)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value: newValue } = event.target

    if (path) {
      dispatch({
        type: 'setStateByPath',
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
      <StyledText
        as="input"
        placeholder={
          type === 'number' ? '0' : type === 'text' ? '-' : undefined
        }
        ref={ref}
        type={type}
        value={String(currentValue ?? defaultValue)}
        variant={variant === 'labelOnTop' ? 'input' : 'inputWithoutBorder'}
        onChange={handleChange}
        onFocus={(event: FocusEvent<HTMLInputElement>) => event.target.select()}
        {...otherProps}
      />
    </FieldContainer>
  )
}

const LabeledInputField = forwardRef(InnerLabeledInputField)
