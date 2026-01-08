'use client'

import { useAppContext } from '@/app/state/AppWrapper'
import { AutoScroller } from '@/components/AutoScroller'
import { ExecuteButton } from '@/components/ExecuteButton'
import { PropertySettingsLoadingPlaceholder } from '@/components/PropertySettingsLoadingPlaceholder'
import { PropertySettingsPanelsList } from '@/components/PropertySettingsPanelsList'
import { PropertySettingsPanelsListGrouped } from '@/components/PropertySettingsPanelsListGrouped'
import { PropertySettingsPanelsListGroupedByStatus } from '@/components/PropertySettingsPanelsListGroupedByStatus'
import { Toolbar } from '@/components/Toolbar'
import { Suspense } from 'react'
import { twJoin } from 'tailwind-merge'

export default function PropertiesPage() {
  const { isGroupedByType, isGroupedByStatus, isFactoryResetting, isUserSettingsChanging, isPresetLoading } = useAppContext()

  const renderPropertyList = () => {
    if (isGroupedByStatus) {
      return <PropertySettingsPanelsListGroupedByStatus />
    }
    if (isGroupedByType) {
      return <PropertySettingsPanelsListGrouped />
    }
    return <PropertySettingsPanelsList />
  }

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
        {isFactoryResetting || isUserSettingsChanging || isPresetLoading ? (
          <PropertySettingsLoadingPlaceholder />
        ) : (
          <Suspense fallback={<PropertySettingsLoadingPlaceholder />}>
            {renderPropertyList()}
          </Suspense>
        )}
      </div>

      <div className="bg-bg border-border flex flex-col border-t">
        <ExecuteButton />
      </div>
    </div>
  )
}
