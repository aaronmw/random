import { AppContext } from '@/app/reducer'
import get from 'lodash/get'
import { ComponentProps, MouseEvent, createContext, useContext } from 'react'
import { twMerge } from 'tailwind-merge'
import { FieldContainer, FieldContainerProps } from './FieldContainer'

export { SegmentedControlInputField }
export type { SegmentedControlInputFieldProps }

interface SegmentedControlInputFieldProps<V extends string | number | boolean>
  extends Omit<ComponentProps<'div'>, 'onChange'>,
    Pick<FieldContainerProps, 'label' | 'variant'> {
  path: string
  onChange?: (context: { path: string; value: V }) => void
}

interface SegmentedControlInputContextObject<
  V extends string | number | boolean,
> {
  currentValue?: V
  handleClickButton: (newValue: V, event: MouseEvent<HTMLButtonElement>) => void
}

const SegmentedControlInputContext = createContext<
  SegmentedControlInputContextObject<any>
>({
  currentValue: undefined,
  handleClickButton: () => {},
})

const SegmentedControlInputField = <V extends string | number | boolean>({
  children,
  label,
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
    <SegmentedControlInputContext.Provider
      value={{ currentValue, handleClickButton }}
    >
      <FieldContainer
        label={label}
        variant={variant}
      >
        <div className="flex w-fit flex-row-reverse overflow-hidden outline-0">
          {children}
        </div>
      </FieldContainer>
    </SegmentedControlInputContext.Provider>
  )
}

SegmentedControlInputField.OptionButton = function OptionButton({
  children,
  className,
  value,
  onClick,
  ...otherProps
}: Omit<ComponentProps<'button'>, 'value'> & {
  value: string | number | boolean
}) {
  const { currentValue, handleClickButton } = useContext(
    SegmentedControlInputContext,
  )

  const isSelected = value === currentValue

  function innerHandleClickButton(event: MouseEvent<HTMLButtonElement>) {
    handleClickButton(value, event)
    onClick?.(event)
  }

  return (
    <button
      className={twMerge(
        `flex h-9 min-w-9 items-center justify-center px-2`,
        isSelected && `bg-bg-hover`,
        className,
      )}
      onClick={innerHandleClickButton}
      {...otherProps}
    >
      {children}
    </button>
  )
}
