import { initialPropertySettings } from '@/app/atoms/propertySettingsAtom'
import { PropertySettingsPanel } from '@/components/PropertySettingsPanel'
import { PropertyName } from '@/lib/types'
import { memo } from 'react'

const allPropertyNames = Object.keys(initialPropertySettings) as PropertyName[]

export const PropertySettingsPanelsList = memo(
  function PropertySettingsPanelsList() {
    return (
      <div className="flex flex-col">
        {allPropertyNames.map((propertyName) => (
          <PropertySettingsPanel
            key={propertyName}
            propertyName={propertyName}
          />
        ))}
      </div>
    )
  },
)
