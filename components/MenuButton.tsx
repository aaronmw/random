import { Menu } from '@/components/Menu'
import { MenuItemProps } from '@/components/MenuItem'
import Link from 'next/link'
import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'
import { Popover } from './Popover'

export interface MenuButtonProps<T extends 'button' | 'a' | typeof Link>
  extends ComponentProps<'div'> {
  className?: string
  buttons: MenuItemProps<T>[]
  disabled?: boolean
}

export function MenuButton<T extends 'button' | 'a' | typeof Link>({
  children,
  className,
  buttons,
  disabled,
  ...otherProps
}: MenuButtonProps<T>) {
  return (
    <Popover
      className={className}
      disabled={disabled}
      triggerType="click"
      popoverPosition="below"
      classNamesForPopover={twMerge(
        'rounded-2xl bg-black/90 text-white',
        'min-w-60 py-2',
      )}
      childrenForPopover={<Menu items={buttons} />}
      {...otherProps}
    >
      {children}
    </Popover>
  )
}
