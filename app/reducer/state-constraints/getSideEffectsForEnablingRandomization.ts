import { AppState, PropertyName } from '@/lib/types'
import { mutualExclusivityMap } from './mutualExclusivityMap'

export function getSideEffectsForEnablingRandomization({
  propertyName,
  state,
}: {
  propertyName: PropertyName
  state: AppState
}) {
  const sideEffects = []

  mutualExclusivityMap[propertyName]?.forEach((propName) => {
    sideEffects.push([`${propName}.disabled`, true])
  })

  if (propertyName === 'height' || propertyName === 'width') {
    const oppositePropertyName = propertyName === 'height' ? 'width' : 'height'

    const oppositePropertySettings =
      state.propertySettings[oppositePropertyName]

    if (
      oppositePropertySettings.disabled === false &&
      oppositePropertySettings.preserveAspectRatio === true
    ) {
      sideEffects.push([`${oppositePropertyName}.preserveAspectRatio`, false])
    }
  }

  return sideEffects
}
