'use client'

import { twMerge } from 'tailwind-merge'
import { Popover, PopoverProps } from './Popover'

type SharedPopoverProps = Omit<
  PopoverProps,
  'childrenForPopover' | 'classNamesForPopover'
>

export interface TooltipProps extends SharedPopoverProps {
  classNamesForTooltip?: string
  tipContents: PopoverProps['childrenForPopover']
}

export function Tooltip({
  children,
  className,
  classNamesForTooltip,
  tipContents,
  ...otherProps
}: TooltipProps) {
  return (
    <Popover
      className={className}
      classNamesForPopover={twMerge(
        'pointer-events-none',
        'w-60 px-4 py-2',
        'rounded-2xl bg-black/90 text-white',
        'text-left text-sm font-normal',
        '**:[code]:text-text-oncomponent',
        '**:[code]:font-mono',
        '**:[code]:bg-bg-component',
        '**:[code]:rounded-md',
        '**:[code]:px-1',
        '**:[code]:py-0.5',
        classNamesForTooltip,
      )}
      childrenForPopover={tipContents}
      {...otherProps}
    >
      {children}
    </Popover>
  )
}
