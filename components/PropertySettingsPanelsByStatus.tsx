import { enabledPropertySettingsAtom } from '@/app/atoms/enabledPropertySettingsAtom'
import { PropertySettingsPanel } from '@/components/PropertySettingsPanel'
import { PropertyName } from '@/lib/types'
import { useAtomValue } from 'jotai'

export function PropertySettingsPanelsByStatus({
  propertyNames,
  status,
}: {
  propertyNames: PropertyName[]
  status: 'enabled' | 'disabled'
}) {
  const enabledPropertySettings = useAtomValue(enabledPropertySettingsAtom)

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
