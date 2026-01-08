import { groupedPropertyNames } from '@/app/properties/groupedPropertyNames'
import { useAppContext } from '@/app/state/AppWrapper'
import { PropertySettingsPanel } from '@/components/PropertySettingsPanel'
import { Fragment } from 'react'

export function PropertySettingsPanelsListGrouped() {
  const { propertySettings } = useAppContext()

  return (
    <div className="flex flex-col">
      {groupedPropertyNames.map(([groupName, propertyNamesInGroup]) => (
        <Fragment key={groupName}>
          <div className="label-group">
            {groupName}
          </div>

          <div className="flex flex-col">
            {propertyNamesInGroup.map((propertyName) => {
              if (!propertySettings[propertyName]) {
                return null
              }
              return (
                <PropertySettingsPanel
                  key={propertyName}
                  propertyName={propertyName}
                />
              )
            })}
          </div>
        </Fragment>
      ))}
    </div>
  )
}
