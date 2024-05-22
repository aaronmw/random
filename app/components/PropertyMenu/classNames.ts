import { twJoin, twMerge } from "tailwind-merge"

export const classNames = {
  container: twJoin(`
    group/sideNav
    grid
    grid-cols-1
    grid-rows-[min-content,1fr,min-content]
    whitespace-nowrap
    bg-shadedBgColor
  `),

  containerForRandomizedProperties: twJoin(`
    col-start-1
    col-end-2
    row-start-1
    row-end-2
    overflow-y-auto
  `),

  containerForUnrandomizedProperties: twJoin(`
    col-start-1
    col-end-2
    row-start-2
    row-end-3
    overflow-y-auto
    border-y
  `),

  groupHeading: twJoin(`
    sticky
    top-0
    bg-shadedBgColor
    px-4
    py-1
    text-[10px]
    uppercase
    leading-none
    text-fadedTextColor
  `),

  propertyButton: ({ isPropertyRouteActive = false, isRandomized = false }) =>
    twMerge(
      `
        group
        flex
        w-full
        items-center
        justify-between
        border
        border-transparent
        bg-bgColor
        pl-4
        pr-1
        leading-none
      `,
      isRandomized &&
        `
          bg-selectedBgColor
        `,
      isPropertyRouteActive &&
        `
          text-textColorInverted
          bg-accentColor
        `,
      !isRandomized &&
        `
          hover:border-accentColor
        `,
    ),

  checkbox: ({ isPropertyRouteActive = false, isRandomized = false }) =>
    twMerge(
      `
        bg-transparent
        text-fadedTextColor
        opacity-0
        group-hover:opacity-100
      `,
      (isRandomized || isPropertyRouteActive) &&
        `
          opacity-100
        `,
      isRandomized &&
        `
          text-accentColor
        `,
      isPropertyRouteActive &&
        `
          text-white
        `,
    ),

  filterContainer: twJoin(`
    group
    col-start-1
    col-end-2
    row-start-3
    row-end-4
    flex
    items-center
    bg-selectedBgColor
    p-1
    backdrop-blur-sm
  `),

  filterIcon: twJoin(`
    absolute
    left-3
    top-1/2
    -translate-y-1/2
    pt-0.5
  `),

  filterInput: twJoin(`
    js-filter-input
    w-full
    rounded-full
    border
    bg-bgColor
    py-1.5
    pl-6
    pr-2
    leading-none
    text-textColor
    [font-size:inherit]
    placeholder:text-fadedTextColor
  `),

  keyboardShortcut: twJoin(`
    absolute
    right-3.5
    top-1/2
    -translate-y-1/2
    pt-0.5
    text-fadedTextColor
    group-has-[input:focus]:opacity-0
  `),
}
