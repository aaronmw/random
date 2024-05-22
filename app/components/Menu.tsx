import { Icon, IconName } from "@/app/components/Icon"
import { ComponentProps, MouseEvent, createContext, useContext } from "react"
import { createPortal } from "react-dom"
import { twJoin, twMerge } from "tailwind-merge"

export { Menu, MenuItem, MenuItemDivider }

interface MenuProps extends ComponentProps<"ul"> {
  isOpen: boolean
  onClose: () => void
}

interface MenuItemProps extends Omit<ComponentProps<"li">, "onClick"> {
  icon?: IconName
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

interface MenuItemDividerProps
  extends Omit<ComponentProps<"div">, "children"> {}

const MenuContext = createContext({ isOpen: false, onClose: () => {} })

const classNames = {
  backdrop: ({ isOpen = false }) =>
    twMerge(
      `
        fixed
        left-0
        top-0
        z-40
        h-full
        w-full
        bg-bgColor
        transition-opacity
      `,
      !isOpen
        ? `
            pointer-events-none
            opacity-0
          `
        : `
            pointer-events-auto
            opacity-50
            backdrop-blur-sm
          `,
    ),

  container: ({ isOpen = false }) =>
    twMerge(
      `
        whitespace-nowrap
        border
        bg-bgColor
        py-2
        shadow
        transition-opacity
      `,
      !isOpen
        ? `
            pointer-events-none
            opacity-0
          `
        : `
            pointer-events-auto
            opacity-100
          `,
    ),

  menuItem: twJoin(`
    flex
    w-full
    items-center
    gap-3
    px-4
    py-1
    hover:bg-accentColor
    hover:text-white
  `),
}

function Menu({
  children,
  className,
  isOpen,
  onClose,
  ...otherProps
}: MenuProps) {
  return createPortal(
    <MenuContext.Provider value={{ isOpen, onClose }}>
      <div
        className={classNames.backdrop({ isOpen })}
        onClick={onClose}
      />

      <ul
        className={twMerge(classNames.container({ isOpen }), className)}
        {...otherProps}
      >
        {children}
      </ul>
    </MenuContext.Provider>,
    document.body,
  )
}

function MenuItem({
  children,
  className,
  icon,
  onClick,
  ...otherProps
}: MenuItemProps) {
  const { onClose } = useContext(MenuContext)

  return (
    <li
      className={twMerge(``, className)}
      {...otherProps}
    >
      <button
        className={classNames.menuItem}
        onClick={(e) => {
          onClick?.(e)
          onClose()
        }}
      >
        <Icon
          className={twJoin(!icon && "opacity-0")}
          name={icon ?? "circle-small"}
        />
        {children}
      </button>
    </li>
  )
}

function MenuItemDivider({ className, ...otherProps }: MenuItemDividerProps) {
  return (
    <div
      className={twMerge(
        `
          my-2
          border-b
        `,
        className,
      )}
      {...otherProps}
    />
  )
}
