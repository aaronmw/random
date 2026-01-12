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
      oppositePropertySettings.is_enabled === true &&
      oppositePropertySettings.preserve_aspect_ratio === true
    ) {
      sideEffects.push([
        `propertySettings.${oppositePropertyName}.preserve_aspect_ratio`,
        false,
      ])
    }
  }

  return sideEffects
}
