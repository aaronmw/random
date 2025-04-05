import { Atom, AtomProps } from '@/components/Atom'
import { MenuItem, MenuItemProps } from '@/components/MenuItem'
import { Menu as BaseUIMenu } from '@base-ui-components/react'
import { MouseEvent } from 'react'

export type MenuButtonProps = AtomProps<'span'> & {
  items: MenuItemProps<'button'>[]
  disabled?: boolean
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
      item.onClick?.(event)
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    },
  }))

  return (
    <BaseUIMenu.Root disabled={disabled}>
      <BaseUIMenu.Trigger render={<span />}>
        <Atom
          disabled={disabled}
          variant="button.icon"
          {...otherProps}
        >
          {children}
        </Atom>
      </BaseUIMenu.Trigger>
      <BaseUIMenu.Portal>
        <BaseUIMenu.Positioner sideOffset={8}>
          <Atom
            as={BaseUIMenu.Popup}
            variant="popover"
          >
            {itemsModifiedToBlurOnClick.map((item, index) => (
              <BaseUIMenu.Item key={index}>
                <MenuItem
                  key={index}
                  {...item}
                />
              </BaseUIMenu.Item>
            ))}
          </Atom>
        </BaseUIMenu.Positioner>
      </BaseUIMenu.Portal>
    </BaseUIMenu.Root>
  )
}
