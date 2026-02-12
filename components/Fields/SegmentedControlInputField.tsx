import {
  ComponentProps,
  MouseEvent,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { twJoin, twMerge } from 'tailwind-merge'
import { FieldContainer, FieldContainerProps } from './FieldContainer'

export { SegmentedControlInputField }
export type { SegmentedControlInputFieldProps }

type ButtonVariant =
  | 'button.icon.togglable'
  | 'button.icon.togglable.secondary'

interface SegmentedControlInputFieldProps<V extends string | number | boolean>
  extends Omit<ComponentProps<'div'>, 'onChange'>,
    Pick<FieldContainerProps<'label'>, 'label' | 'description' | 'variant'> {
  variantForButton?: ButtonVariant
  onChange?: (newValue: V, event: MouseEvent<HTMLButtonElement>) => void
  value?: V
  propertyName?: string
}

interface SegmentedControlInputContextObject<
  V extends string | number | boolean,
> {
  currentValue?: V
  variantForButton?: ButtonVariant
  handleClickButton: (newValue: V, event: MouseEvent<HTMLButtonElement>) => void
  propertyName?: string
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
  propertyName,
  ...otherProps
}: SegmentedControlInputFieldProps<V>) => {
  const [currentValue, setCurrentValue] = useState<V | undefined>(value)

  // Sync local state when value prop changes (e.g., after reload)
  useEffect(() => {
    setCurrentValue(value)
  }, [value])

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
      value={{ currentValue, handleClickButton, variantForButton, propertyName }}
    >
      <FieldContainer
        label={label}
        description={description}
        variant={variant}
        className={twMerge('bg-transparent', className)}
        id={propertyName ? `mode-label-${propertyName}` : undefined}
        {...otherProps}
      >
        <div
          role="radiogroup"
          aria-labelledby={propertyName ? `mode-label-${propertyName}` : undefined}
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
  className,
  ariaLabel,
  ...otherProps
}: Omit<ComponentProps<'button'>, 'value'> & {
  value: string | number | boolean
  ariaLabel?: string
}) {
  const { currentValue, handleClickButton, variantForButton, propertyName } =
    useContext(SegmentedControlInputContext)

  const isSelected = value === currentValue

  function innerHandleClickButton(event: MouseEvent<HTMLButtonElement>) {
    handleClickButton(value, event)
    onClick?.(event)
  }

  const variantClass =
    variantForButton === 'button.icon.togglable.secondary'
      ? 'button-icon-togglable-secondary'
      : 'button-icon-togglable'

  const testId =
    propertyName && typeof value === 'string'
      ? `mode-button-${propertyName}-${value}`
      : undefined

  return (
    <button
      role="radio"
      aria-checked={isSelected}
      aria-label={ariaLabel || (typeof value === 'string' ? value : String(value))}
      data-testid={testId}
      className={twMerge(variantClass, className)}
      data-active={isSelected ? 'true' : undefined}
      onClick={innerHandleClickButton}
      {...otherProps}
    >
      {children}
    </button>
  )
}
