import { PropertySettingsObject } from '@/lib/types'
import { atomWithStorage } from 'jotai/utils'

export const selectedNodePluginDataAtom = atomWithStorage<
  Partial<PropertySettingsObject>[]
>('selectedNodePluginData', [])
