import { groupedPropertyNames } from '@/app/properties/groupedPropertyNames'
import { useAppContext } from '@/app/state/AppWrapper'
import { PropertySettingsPanel } from '@/components/PropertySettingsPanel'
import { Fragment } from 'react'

export function PropertySettingsPanelsListGroupedByTypeWithEnabledOnTop() {
  const { propertySettings } = useAppContext()

  return (
    <div className="flex flex-col">
      {groupedPropertyNames.map(([groupName, propertyNamesInGroup]) => {
        const sortedPropertyNames = [...propertyNamesInGroup]
          .filter((propertyName) => propertySettings[propertyName])
          .sort((a, b) => {
            const aSetting = propertySettings[a]
            const bSetting = propertySettings[b]

            if (!aSetting || !bSetting) return 0

            const aEnabled = aSetting.is_enabled === true
            const bEnabled = bSetting.is_enabled === true

            if (aEnabled === bEnabled) {
              const aIndex = propertyNamesInGroup.indexOf(a)
              const bIndex = propertyNamesInGroup.indexOf(b)
              return aIndex - bIndex
            }
            return aEnabled ? -1 : 1
          })

        return (
          <Fragment key={groupName}>
            <div className="label-group">{groupName}</div>

            <div className="flex flex-col">
              {sortedPropertyNames.map((propertyName) => (
                <PropertySettingsPanel
                  key={propertyName}
                  propertyName={propertyName}
                />
              ))}
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
