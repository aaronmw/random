import { groupedPropertyNames } from '@/app/properties/groupedPropertyNames'
import { useAppContext } from '@/app/state/AppWrapper'
import { Atom } from '@/components/Atom'
import { PropertySettingsPanel } from '@/components/PropertySettingsPanel'
import { Fragment } from 'react'

export function PropertySettingsPanelsListGrouped() {
  const { propertySettings } = useAppContext()

  return (
    <div className="flex flex-col">
      {groupedPropertyNames.map(([groupName, propertyNamesInGroup]) => (
        <Fragment key={groupName}>
          <Atom
            as="div"
            variant="label.group"
          >
            {groupName}
          </Atom>

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
