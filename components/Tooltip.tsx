'use client'

import { Atom } from '@/components/Atom'
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
        <BaseUITooltip.Positioner sideOffset={10}>
          <BaseUITooltip.Popup>
            <Atom
              variant="popover"
              className={twMerge('max-w-72 px-5', classNamesForTooltip)}
            >
              {tipContents}
            </Atom>
          </BaseUITooltip.Popup>
        </BaseUITooltip.Positioner>
      </BaseUITooltip.Portal>
    </BaseUITooltip.Root>
  )
}
