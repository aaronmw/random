import { PropertySettingsObject } from '@/lib/types'
import { atomWithStorage } from 'jotai/utils'

export const presetsAtom = atomWithStorage<
  Record<string, Partial<PropertySettingsObject>>
>('presets', {})
