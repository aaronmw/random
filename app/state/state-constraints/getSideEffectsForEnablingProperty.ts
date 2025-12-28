import { AppState, PropertyName, SideEffect } from '@/app/types'
import { mutualExclusivityMap } from './mutualExclusivityMap'

export function getSideEffectsForEnablingProperty({
  propertyName,
  state,
}: {
  propertyName: PropertyName
  state: AppState
}): SideEffect[] {
  const sideEffects: SideEffect[] = []

  mutualExclusivityMap[propertyName]?.forEach((propName) => {
    sideEffects.push([`propertySettings.${propName}.isEnabled`, false])
  })

  if (propertyName === 'height' || propertyName === 'width') {
    const oppositePropertyName = propertyName === 'height' ? 'width' : 'height'

    const oppositePropertySettings =
      state.propertySettings[oppositePropertyName]

    if (
      oppositePropertySettings.isEnabled === true &&
      oppositePropertySettings.preserveAspectRatio === true
    ) {
      sideEffects.push([
        `propertySettings.${oppositePropertyName}.preserveAspectRatio`,
        false,
      ])
    }
  }

  return sideEffects
}
