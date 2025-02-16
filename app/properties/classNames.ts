import { twJoin } from 'tailwind-merge'

export const classNames = {
  container: twJoin(
    `grid h-full grid-cols-1 grid-rows-[min-content_auto_min-content] overflow-hidden`,
  ),

  filterContainer: twJoin(
    `group bg-bg-hover relative row-start-1 row-end-2 items-center border-b px-2 py-[4px]`,
  ),

  filterIcon: twJoin(`absolute top-1/2 left-5 -translate-y-1/2 pt-0.5`),

  filterInput: twJoin(
    `js-filter-input bg-bg text-text placeholder:text-text/50 w-full rounded-full border px-10 py-1.5 [font-size:inherit]`,
  ),

  keyboardShortcut: twJoin(
    `text-text-secondary absolute top-1/2 right-6 -translate-y-1/2 pt-0.5 text-sm group-has-[input:focus]:opacity-0`,
  ),

  groupsContainer: twJoin(
    `relative row-start-2 row-end-3 scroll-pt-8 overflow-y-auto scroll-smooth`,
  ),

  groupContainer: twJoin(` `),

  groupHeading: twJoin(`bg-bg-hover text-text/50 sticky top-0 z-10 px-4 py-1`),

  summaryContainer: twJoin(`bg-bg-hover row-start-3 row-end-4 border-t`),

  summaryItem: twJoin(`flex items-center justify-between pr-2`),

  summaryLink: twJoin(
    `flex w-full items-center justify-between px-4 py-px hover:no-underline`,
  ),
}
