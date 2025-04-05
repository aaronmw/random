import { propertySettingsAtom } from '@/app/atoms/propertySettingsAtom'
import { PropertyName, PropertySettings } from '@/lib/types'
import { atom, WritableAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'

// Create a memoized map of atoms
const propertySettingsAtoms = new Map<
  PropertyName,
  WritableAtom<PropertySettings, [newValue: PropertySettings], void>
>()

export const singlePropertySettingsAtom = (propertyName: PropertyName) => {
  if (!propertySettingsAtoms.has(propertyName)) {
    propertySettingsAtoms.set(
      propertyName,
      atom(
        (get) => get(propertySettingsAtom)[propertyName],
        (get, set, newValue: PropertySettings) => {
          const current = get(propertySettingsAtom)
          if (current[propertyName] === newValue) return
          set(propertySettingsAtom, {
            ...current,
            [propertyName]: newValue,
          })
        },
      ),
    )
  }

  const selectedNodePluginData = propertySettingsAtoms.get(propertyName)!

  console.log({
    selectedNodePluginData,
  })

  return selectedNodePluginData
}

export const singlePropertySettingsAtomFamily = atomFamily(
  (propertyName: PropertyName) => singlePropertySettingsAtom(propertyName),
)
