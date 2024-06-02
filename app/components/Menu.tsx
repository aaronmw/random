"use client"

import { Icon, IconName } from "@/app/components/Icon"
import { useIsClient } from "@uidotdev/usehooks"
import { divide } from "lodash"
import { ComponentProps, MouseEvent, createContext, useContext } from "react"
import { createPortal } from "react-dom"
import { twJoin, twMerge } from "tailwind-merge"

export { Menu }

interface MenuProps extends ComponentProps<"ul"> {
  isOpen: boolean
}

interface MenuItemProps extends Omit<ComponentProps<"li">, "onClick"> {
  disabled?: boolean
  icon?: IconName
  onClick?: (event: MouseEvent<HTMLLIElement>) => void
}

interface MenuItemDividerProps
  extends Omit<ComponentProps<"div">, "children"> {}

const MenuContext = createContext({ isOpen: false })

const classNames = {
  backdrop: ({ isOpen = false }) =>
    twMerge(
      `
        fixed
        left-0
        top-0
        z-10
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
        group/menu
        absolute
        z-50
        max-h-[80vh]
        overflow-y-auto
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

  menuItem: ({ disabled = false }) =>
    twMerge(
      `
        group/menuItem
        flex
        w-full
        items-center
        gap-5
        px-4
        py-2.5
      `,
      !disabled
        ? `
            hover:bg-accentColor
            hover:text-white
          `
        : `
            pointer-events-none
            cursor-default
            opacity-50
          `,
    ),

  divider: twJoin(
    `
      my-2
      border-b
    `,
  ),

  groupHeading: twJoin(
    `
      sticky
      top-0
      bg-shadedBgColor
      px-4
      py-1
      text-[10px]
      uppercase
      text-fadedTextColor
    `,
  ),
}

function Menu({ children, className, isOpen, ...otherProps }: MenuProps) {
  const isClient = useIsClient()

  return !isClient
    ? null
    : createPortal(
        <MenuContext.Provider value={{ isOpen }}>
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

Menu.Backdrop = function MenuBackdrop({
  className,
  ...otherProps
}: ComponentProps<"div">) {
  const { isOpen } = useContext(MenuContext)

  return createPortal(
    <div
      className={twMerge(classNames.backdrop({ isOpen }), className)}
      {...otherProps}
    />,
    document.body,
  )
}

Menu.Item = function MenuItem({
  children,
  className,
  disabled,
  icon,
  ...otherProps
}: MenuItemProps) {
  return (
    <li
      className={twMerge(classNames.menuItem({ disabled }), className)}
      role="button"
      tabIndex={0}
      {...otherProps}
    >
      <Icon
        className={twJoin(!icon && "opacity-0")}
        name={icon ?? "circle-small"}
      />

      {children}
    </li>
  )
}

Menu.Divider = function MenuItemDivider({
  className,
  ...otherProps
}: MenuItemDividerProps) {
  return (
    <div
      className={twMerge(classNames.divider, className)}
      {...otherProps}
    />
  )
}

Menu.GroupHeading = function MenuGroupHeading({
  children,
  className,
  ...otherProps
}: ComponentProps<"li">) {
  return (
    <li
      className={twMerge(classNames.groupHeading, className)}
      {...otherProps}
    >
      {children}
    </li>
  )
}
