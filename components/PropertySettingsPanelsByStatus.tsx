import { useAppContext } from '@/app/state/AppWrapper'
import { PropertyName } from '@/app/types'
import { PropertySettingsPanel } from '@/components/PropertySettingsPanel'
import pickBy from 'lodash/pickBy'

export function PropertySettingsPanelsByStatus({
  propertyNames,
  status,
}: {
  propertyNames: PropertyName[]
  status: 'enabled' | 'disabled'
}) {
  const { propertySettings } = useAppContext()

  const propertyNamesToRender = propertyNames.filter((propertyName) => {
    const propertySetting = propertySettings[propertyName]
    if (!propertySetting) return false
    const isEnabled = propertySetting.is_enabled === true
    return status === 'enabled' ? isEnabled : !isEnabled
  })

  return propertyNamesToRender.map((propertyName) => (
    <PropertySettingsPanel
      key={String(propertyName)}
      propertyName={propertyName}
    />
  ))
}
