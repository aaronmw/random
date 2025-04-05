import { propertySettingsAtom } from '@/app/atoms/propertySettingsAtom'
import { PropertyName, PropertySettingsObject } from '@/lib/types'
import { atom } from 'jotai'
import pick from 'lodash/pick'

export const enabledPropertySettingsAtom = atom((get) => {
  const propertySettings = get(propertySettingsAtom)
  const enabledPropertyNames = Object.keys(propertySettings).filter(
    (key) => propertySettings[key as PropertyName].isEnabled,
  ) as PropertyName[]
  return pick(propertySettings, enabledPropertyNames) as PropertySettingsObject
})
