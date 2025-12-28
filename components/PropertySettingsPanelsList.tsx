import { useAppContext } from '@/app/state/AppWrapper'
import { PropertyName } from '@/app/types'
import { PropertySettingsPanel } from '@/components/PropertySettingsPanel'
import { memo } from 'react'

export const PropertySettingsPanelsList = memo(
  function PropertySettingsPanelsList() {
    const { propertySettings } = useAppContext()
    const allPropertyNames = Object.keys(propertySettings) as PropertyName[]

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
