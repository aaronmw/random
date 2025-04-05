'use client'

import { isGroupedByTypeAtom } from '@/app/atoms/isGroupedByTypeAtom'
import { AutoScroller } from '@/components/AutoScroller'
import { ExecuteButton } from '@/components/ExecuteButton'
import { PropertySettingsPanelsList } from '@/components/PropertySettingsPanelsList'
import { PropertySettingsPanelsListGrouped } from '@/components/PropertySettingsPanelsListGrouped'
import { Toolbar } from '@/components/Toolbar'
import { useAtomValue } from 'jotai'
import { twJoin } from 'tailwind-merge'

export default function PropertiesPage() {
  const isGroupedByType = useAtomValue(isGroupedByTypeAtom)

  return (
    <div
      className={twJoin(
        'grid grid-cols-1 grid-rows-[min-content_1fr_min-content]',
        'bg-bg-secondary',
        'overflow-hidden',
      )}
    >
      <AutoScroller />

      <Toolbar />

      <div className="scroll-pt-12 overflow-auto">
        {isGroupedByType ? (
          <PropertySettingsPanelsListGrouped />
        ) : (
          <PropertySettingsPanelsList />
        )}
      </div>

      <div className="bg-bg border-border flex flex-col border-t">
        <ExecuteButton />
      </div>
    </div>
  )
}
