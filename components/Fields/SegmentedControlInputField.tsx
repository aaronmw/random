import { Atom, AtomProps } from '@/components/Atom'
import {
  ComponentProps,
  MouseEvent,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react'
import { twJoin, twMerge } from 'tailwind-merge'
import { FieldContainer, FieldContainerProps } from './FieldContainer'

export { SegmentedControlInputField }
export type { SegmentedControlInputFieldProps }

interface SegmentedControlInputFieldProps<V extends string | number | boolean>
  extends Omit<ComponentProps<'div'>, 'onChange'>,
    Pick<FieldContainerProps<'label'>, 'label' | 'description' | 'variant'> {
  variantForButton?: AtomProps['variant']
  onChange?: (newValue: V, event: MouseEvent<HTMLButtonElement>) => void
  value?: V
}

interface SegmentedControlInputContextObject<
  V extends string | number | boolean,
> {
  currentValue?: V
  variantForButton?: AtomProps['variant']
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
  className,
  description,
  label,
  value,
  variant,
  variantForButton = 'button.icon.togglable',
  onChange,
  ...otherProps
}: SegmentedControlInputFieldProps<V>) => {
  const [currentValue, setCurrentValue] = useState<V | undefined>(value)

  // Add key to force re-render on hot reload
  const instanceId = useRef(Math.random().toString(36).slice(2))

  function handleClickButton(
    newValue: V,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault()
    setCurrentValue(newValue)
    onChange?.(newValue, event)
  }

  return (
    <SegmentedControlInputContext
      key={instanceId.current}
      value={{ currentValue, handleClickButton, variantForButton }}
    >
      <FieldContainer
        label={label}
        description={description}
        variant={variant}
        className={twMerge('bg-transparent', className)}
        {...otherProps}
      >
        <div
          className={twJoin(
            'group w-fit outline-0',
            'flex flex-row-reverse',
            'overflow-hidden',
            'hover:inset-shadow-white',
          )}
        >
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
}: Omit<AtomProps<'button'>, 'value'> & {
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
    <Atom
      variant={variantForButton}
      as="button"
      data-active={isSelected ? 'true' : undefined}
      onClick={innerHandleClickButton}
      {...otherProps}
    >
      {children}
    </Atom>
  )
}
