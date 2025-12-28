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

  const enabledPropertySettings = pickBy(propertySettings, 'isEnabled')

  const propertyNamesToRender = propertyNames.filter((propertyName) => {
    const isEnabled = propertyName in enabledPropertySettings
    return status === 'enabled' ? isEnabled : !isEnabled
  })

  return propertyNamesToRender.map((propertyName) => (
    <PropertySettingsPanel
      key={String(propertyName)}
      propertyName={propertyName}
    />
  ))
}
