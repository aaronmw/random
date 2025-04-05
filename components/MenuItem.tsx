import { Atom, AtomProps } from '@/components/Atom'
import { Icon, IconString } from '@/components/Icon'
import Link from 'next/link'
import { ElementType, MouseEvent, ReactNode } from 'react'
import { twJoin, twMerge } from 'tailwind-merge'

export type MenuItemProps<T extends 'button' | 'a' | typeof Link> = Omit<
  AtomProps<T>,
  'as' | 'children'
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

  return (
    <Atom
      as={Component}
      className={twMerge(
        'group flex w-full items-center gap-2',
        'px-2 py-0.5',
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <span
        className={twJoin(
          'flex w-full items-center justify-between gap-2 px-2',
          'rounded-lg',
          'group-hover:bg-bg-brand group-hover:text-text-onbrand',
          selected && [
            'bg-bg-selected text-text-onselected',
            'hover:bg-bg-selected-hover hover:text-text-onselected',
          ],
        )}
      >
        <span className="flex w-full items-center gap-2">
          {(icon || iconLeft) && (
            <span className="flex size-8 shrink-0 items-center justify-center">
              <Icon name={icon ?? iconLeft ?? 'solid:circle-small'} />
            </span>
          )}

          <span className="flex w-full items-center justify-between">
            {label}
          </span>
        </span>

        {iconRight && (
          <span className="flex size-8 shrink-0 items-center justify-center">
            <Icon name={iconRight} />
          </span>
        )}
      </span>
    </Atom>
  )
}
