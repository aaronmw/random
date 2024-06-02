import { twJoin } from 'tailwind-merge'

export const classNames = {
  container: twJoin(
    `
      grid
      h-full
      grid-cols-1
      grid-rows-[min-content,auto,min-content]
      overflow-hidden
    `,
  ),

  filterContainer: twJoin(
    `
      group
      row-start-1
      row-end-2
      items-center
      border-b
      bg-selectedBgColor
      px-2
      py-1
      backdrop-blur-sm
    `,
  ),

  filterIcon: twJoin(
    `
      absolute
      left-5
      top-1/2
      -translate-y-1/2
      pt-0.5
    `,
  ),

  filterInput: twJoin(
    `
      js-filter-input
      w-full
      rounded-full
      border
      bg-bgColor
      px-10
      py-1.5
      text-textColor
      [font-size:inherit]
      placeholder:text-fadedTextColor
    `,
  ),

  keyboardShortcut: twJoin(
    `
      absolute
      right-6
      top-1/2
      -translate-y-1/2
      pt-0.5
      text-sm
      text-fadedTextColor
      group-has-[input:focus]:opacity-0
    `,
  ),

  groupsContainer: twJoin(
    `
      relative
      row-start-2
      row-end-3
      scroll-pt-8
      overflow-y-auto
      scroll-smooth
    `,
  ),

  groupContainer: twJoin(
    `
    `,
  ),

  groupHeading: twJoin(
    `
      sticky
      top-0
      z-10
      bg-shadedBgColor
      px-4
      py-1
      text-fadedTextColor
    `,
  ),

  summaryContainer: twJoin(
    `
      row-start-3
      row-end-4
      border-t
      bg-shadedBgColor
    `,
  ),

  summaryItem: twJoin(
    `
      flex
      items-center
      justify-between
      pr-2
    `,
  ),

  summaryLink: twJoin(
    `
      flex
      w-full
      items-center
      justify-between
      px-4
      py-px
      hover:no-underline
    `,
  ),
}
