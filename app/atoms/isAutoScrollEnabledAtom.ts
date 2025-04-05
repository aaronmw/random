import { atomWithStorage } from 'jotai/utils'

export const isAutoScrollEnabledAtom = atomWithStorage(
  'isAutoScrollEnabled',
  true,
)
