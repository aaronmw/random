import { removeNullProperties } from '@/lib/removeNullProperties'
import { AppState } from '@/lib/types'
import cloneDeep from 'lodash/cloneDeep'
import mergeWith from 'lodash/mergeWith'

export function mergeStateData({
  state,
  partialState,
}: {
  state: AppState
  partialState: Partial<AppState>
}): AppState {
  const finalState = mergeWith(cloneDeep(state), partialState, (objValue) => {
    if (typeof objValue === 'undefined') {
      return null
    }
  })

  const finalStateWithoutNullValues = removeNullProperties(finalState)

  return finalStateWithoutNullValues
}
