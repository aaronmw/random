import { isGroupedByStatusAtom } from '@/app/atoms/isGroupedByStatusAtom'
import { groupedPropertyNames } from '@/app/properties/groupedPropertyNames'
import { Atom } from '@/components/Atom'
import { PropertySettingsPanel } from '@/components/PropertySettingsPanel'
import { useAtomValue } from 'jotai'
import { Fragment } from 'react'

export function PropertySettingsPanelsListGrouped() {
  const isGroupedByStatus = useAtomValue(isGroupedByStatusAtom)

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
            {propertyNamesInGroup.map((propertyName) => (
              <PropertySettingsPanel
                key={propertyName}
                propertyName={propertyName}
              />
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  )
}
