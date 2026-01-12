import { Icon, IconString } from '@/components/Icon'
import Link from 'next/link'
import { ComponentProps, ElementType, MouseEvent, ReactNode } from 'react'
import { twJoin, twMerge } from 'tailwind-merge'

export type MenuItemProps<T extends 'button' | 'a' | typeof Link> = Omit<
  ComponentProps<T>,
  'children'
> & {
  as?: T
  label: ReactNode
  icon?: IconString
  iconLeft?: IconString
  iconRight?: IconString
  selected?: boolean
  disabled?: boolean
}

export function MenuItem<T extends 'button' | 'a' | typeof Link>({
  as,
  className,
  disabled,
  icon,
  iconLeft,
  iconRight,
  label,
  selected,
  onClick,
  ...props
}: MenuItemProps<T>) {
  const Component = (as ?? 'button') as ElementType

  const handleClick = (event: MouseEvent<any>) => {
    if (disabled) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    onClick?.(event)
  }

  // Extract id, ariaChecked, and dataEnabled from props
  const propsWithId = props as any
  const { id, ariaChecked, dataEnabled, ...restProps } = propsWithId

  return (
    <Component
      className={twMerge(
        'group/menuItem flex w-full items-center gap-2',
        'px-2 py-0.5',
        className,
      )}
      onClick={handleClick}
      disabled={disabled}
      {...(id ? { 'data-testid': id } : {})}
      aria-checked={ariaChecked ?? 'false'}
      data-enabled={dataEnabled ?? 'false'}
      {...restProps}
    >
      <span
        className={twJoin(
          'flex w-full items-center justify-between gap-2 px-2',
          'rounded-lg',
          !disabled &&
            'group-hover/menuItem:bg-bg-brand group-hover/menuItem:text-text-onbrand',
          disabled && 'pointer-events-none cursor-default opacity-50',
          selected && [
            'bg-bg-selected text-text-onselected',
            'hover:bg-bg-selected-hover hover:text-text-onselected',
          ],
        )}
      >
        <span className="flex w-full items-baseline gap-2">
          {(icon || iconLeft) && (
            <span className="flex size-8 shrink-0 items-center justify-center">
              <Icon name={icon ?? iconLeft ?? 'solid:circle-small'} />
            </span>
          )}

          <span className="flex w-full items-baseline justify-between">
            {label}
          </span>
        </span>

        {iconRight && (
          <span className="flex size-8 shrink-0 items-center justify-center">
            <Icon name={iconRight} />
          </span>
        )}
      </span>
    </Component>
  )
}
