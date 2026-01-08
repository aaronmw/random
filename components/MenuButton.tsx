import { MenuItem, MenuItemProps } from '@/components/MenuItem'
import { Menu as BaseUIMenu } from '@base-ui-components/react'
import { ComponentProps, ElementType, MouseEvent } from 'react'
import { twMerge } from 'tailwind-merge'

export type MenuButtonProps = Omit<ComponentProps<'span'>, 'children'> & {
  items: MenuItemProps<'button'>[]
  disabled?: boolean
  children: React.ReactNode
}

export function MenuButton({
  children,
  disabled,
  items,
  ...otherProps
}: MenuButtonProps) {
  const itemsModifiedToBlurOnClick = items.map((item) => ({
    ...item,
    onClick: (event: MouseEvent<any>) => {
      // Close menu immediately by blurring all potential trigger elements
      // Use requestAnimationFrame to ensure blur happens before any blocking operations
      requestAnimationFrame(() => {
        // Find all button-icon elements that might be menu triggers
        const triggers = document.querySelectorAll('.button-icon[aria-expanded="true"]')
        triggers.forEach((trigger) => {
          if (trigger instanceof HTMLElement) {
            trigger.blur()
          }
        })

        // Also blur activeElement
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
      })

      // Also blur synchronously as immediate fallback
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }

      // Call the original onClick handler
      item.onClick?.(event)
    },
  }))

  return (
    <BaseUIMenu.Root disabled={disabled}>
      <BaseUIMenu.Trigger
        render={<span />}
        nativeButton={false}
      >
        <span
          className={twMerge('button-icon', otherProps.className)}
          data-disabled={disabled || undefined}
          {...otherProps}
        >
          {children}
        </span>
      </BaseUIMenu.Trigger>
      <BaseUIMenu.Portal>
        <BaseUIMenu.Positioner sideOffset={8}>
          <BaseUIMenu.Popup className="popover">
            {itemsModifiedToBlurOnClick.map((item, index) => (
              <BaseUIMenu.Item key={index}>
                <MenuItem
                  key={index}
                  {...item}
                />
              </BaseUIMenu.Item>
            ))}
          </BaseUIMenu.Popup>
        </BaseUIMenu.Positioner>
      </BaseUIMenu.Portal>
    </BaseUIMenu.Root>
  )
}
