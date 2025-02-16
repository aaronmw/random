import { useAppContext } from '@/app/reducer/AppContext'
import { StyledText, StyledTextProps } from '@/components/StyledText'
import get from 'lodash/get'
import { ComponentProps, MouseEvent, createContext, useContext } from 'react'
import { FieldContainer, FieldContainerProps } from './FieldContainer'

export { SegmentedControlInputField }
export type { SegmentedControlInputFieldProps }

interface SegmentedControlInputFieldProps<V extends string | number | boolean>
  extends Omit<ComponentProps<'div'>, 'onChange'>,
    Pick<FieldContainerProps<'label'>, 'label' | 'description' | 'variant'> {
  path: string
  variantForButton?: StyledTextProps['variant']
  onChange?: (context: { path: string; value: V }) => void
}

interface SegmentedControlInputContextObject<
  V extends string | number | boolean,
> {
  currentValue?: V
  variantForButton?: StyledTextProps['variant']
  handleClickButton: (newValue: V, event: MouseEvent<HTMLButtonElement>) => void
}

const SegmentedControlInputContext = createContext<
  SegmentedControlInputContextObject<any>
>({
  currentValue: undefined,
  variantForButton: 'button.icon.togglable',
  handleClickButton: () => {},
})

const SegmentedControlInputField = <V extends string | number | boolean>({
  children,
  description,
  label,
  path,
  variant,
  variantForButton = 'button.icon.togglable',
  onChange,
}: SegmentedControlInputFieldProps<V>) => {
  const { dispatch, state } = useAppContext()
  const currentValue = get(state, path)

  function handleClickButton(
    newValue: V,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault()

    const payload = {
      path,
      value: newValue,
    }

    if (typeof onChange === 'function') {
      onChange?.(payload)
      return
    }

    dispatch({
      type: 'setStateByPath',
      payload,
    })
  }

  return (
    <SegmentedControlInputContext
      value={{ currentValue, handleClickButton, variantForButton }}
    >
      <FieldContainer
        label={label}
        description={description}
        variant={variant}
        className="bg-transparent"
      >
        <div className="flex w-fit flex-row-reverse overflow-hidden outline-0">
          {children}
        </div>
      </FieldContainer>
    </SegmentedControlInputContext>
  )
}

SegmentedControlInputField.OptionButton = function OptionButton({
  children,
  value,
  onClick,
  ...otherProps
}: Omit<ComponentProps<'button'>, 'value'> & {
  value: string | number | boolean
}) {
  const { currentValue, handleClickButton, variantForButton } = useContext(
    SegmentedControlInputContext,
  )

  const isSelected = value === currentValue

  function innerHandleClickButton(event: MouseEvent<HTMLButtonElement>) {
    handleClickButton(value, event)
    onClick?.(event)
  }

  return (
    <StyledText
      variant={variantForButton}
      as="button"
      data-active={isSelected ? 'true' : undefined}
      onClick={innerHandleClickButton}
      {...otherProps}
    >
      {children}
    </StyledText>
  )
}
