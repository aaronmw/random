import { AppContext } from '@/app/reducer'
import { Box } from '@/components/Box'
import { get } from 'lodash'
import {
  ChangeEvent,
  ComponentProps,
  FocusEvent,
  Ref,
  forwardRef,
  useContext,
} from 'react'
import { FieldContainer, FieldContainerProps } from './FieldContainer'

export { LabeledInputField }

type LabeledInputFieldProps<P extends string, V extends string | number> = Omit<
  ComponentProps<'input'>,
  'value'
> &
  Pick<FieldContainerProps, 'label' | 'variant'> &
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
  const { dispatch, state } = useContext(AppContext)

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
      <Box
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
