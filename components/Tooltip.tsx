'use client'

import { Tooltip as BaseUITooltip } from '@base-ui-components/react/tooltip'
import { twMerge } from 'tailwind-merge'

export function Tooltip({
  children,
  tipContents,
  classNamesForTooltip,
}: {
  children: React.ReactNode
  tipContents: React.ReactNode
  classNamesForTooltip?: string
}) {
  return (
    <BaseUITooltip.Root>
      <BaseUITooltip.Trigger render={<span />}>
        {children}
      </BaseUITooltip.Trigger>
      <BaseUITooltip.Portal>
        <BaseUITooltip.Positioner sideOffset={10} collisionPadding={16}>
          <BaseUITooltip.Popup>
            <div
              className={twMerge('popover max-w-72 px-5', classNamesForTooltip)}
            >
              {tipContents}
            </div>
          </BaseUITooltip.Popup>
        </BaseUITooltip.Positioner>
      </BaseUITooltip.Portal>
    </BaseUITooltip.Root>
  )
}
