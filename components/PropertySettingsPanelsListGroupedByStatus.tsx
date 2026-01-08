import { useAppContext } from '@/app/state/AppWrapper'
import { PropertyName } from '@/app/types'
import { PropertySettingsPanelsByStatus } from '@/components/PropertySettingsPanelsByStatus'
import { dataTypesByPropertyName } from '@/lib/dataTypesByPropertyName'
import { Fragment } from 'react'

const allPropertyNames = Object.keys(dataTypesByPropertyName) as PropertyName[]

export function PropertySettingsPanelsListGroupedByStatus() {
  return (
    <div className="flex flex-col">
      <Fragment key="enabled">
        <div className="label-group">Enabled</div>
        <div className="flex flex-col">
          <PropertySettingsPanelsByStatus
            propertyNames={allPropertyNames}
            status="enabled"
          />
        </div>
      </Fragment>

      <Fragment key="disabled">
        <div className="label-group">Disabled</div>
        <div className="flex flex-col">
          <PropertySettingsPanelsByStatus
            propertyNames={allPropertyNames}
            status="disabled"
          />
        </div>
      </Fragment>
    </div>
  )
}
