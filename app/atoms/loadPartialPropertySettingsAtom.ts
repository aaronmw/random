import { propertySettingsAtom } from '@/app/atoms/propertySettingsAtom'
import {
  PropertyName,
  PropertySettings,
  PropertySettingsObject,
} from '@/lib/types'
import { atom } from 'jotai'
import mapValues from 'lodash/mapValues'

export const loadPartialPropertySettingsAtom = atom(
  null,
  (get, set, newValue: Partial<PropertySettingsObject>) => {
    set(
      propertySettingsAtom,
      (current) =>
        mapValues(current, (propertySettings, propertyName) => {
          const baseSettings = propertySettings.isEnabled
            ? { ...propertySettings, isEnabled: false }
            : propertySettings

          return propertyName in newValue
            ? {
                ...baseSettings,
                ...newValue[propertyName as PropertyName],
                isEnabled: true,
              }
            : baseSettings
        }) as Record<PropertyName, PropertySettings>,
    )
  },
)
