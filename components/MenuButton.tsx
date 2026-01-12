import { MenuItem, MenuItemProps } from '@/components/MenuItem'
import { Menu as BaseUIMenu } from '@base-ui-components/react'
import { ComponentProps, MouseEvent, useState } from 'react'
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
  const [isOpen, setIsOpen] = useState(false)

  const itemsModifiedToCloseMenu = items.map((item) => ({
    ...item,
    onClick: (event: MouseEvent<any>) => {
      // Close menu immediately when any item is clicked
      setIsOpen(false)
      // Call the original onClick handler (may be async)
      item.onClick?.(event)
    },
  }))

  return (
    <BaseUIMenu.Root
      disabled={disabled}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
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
        <BaseUIMenu.Positioner sideOffset={8} collisionPadding={16}>
          <BaseUIMenu.Popup className="popover">
            {itemsModifiedToCloseMenu.map((item, index) => {
              const { id, 'aria-checked': ariaChecked, 'data-enabled': dataEnabled, ...itemPropsWithoutId } = item
              // Ensure attributes are always strings (default to 'false' if undefined)
              const ariaCheckedValue = ariaChecked ?? 'false'
              const dataEnabledValue = dataEnabled ?? 'false'
              const wrapperProps = id
                ? {
                    render: (props: any) => (
                      <div 
                        {...props} 
                        data-testid={id}
                        aria-checked={ariaCheckedValue}
                        data-enabled={dataEnabledValue}
                      />
                    ),
                  }
                : {}
              return (
                <BaseUIMenu.Item
                  key={id || index}
                  {...wrapperProps}
                >
                  <MenuItem
                    key={id || index}
                    {...itemPropsWithoutId}
                    ariaChecked={ariaCheckedValue as any}
                    dataEnabled={dataEnabledValue as any}
                  />
                </BaseUIMenu.Item>
              )
            })}
          </BaseUIMenu.Popup>
        </BaseUIMenu.Positioner>
      </BaseUIMenu.Portal>
    </BaseUIMenu.Root>
  )
}
