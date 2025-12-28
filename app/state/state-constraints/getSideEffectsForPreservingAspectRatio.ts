import { AppState, PropertyName } from '@/app/types'
import get from 'lodash/get'
import invariant from 'tiny-invariant'
import { getConstrainedAnchorPosition } from './getConstrainedAnchorPosition'

export function getSideEffectsForPreservingAspectRatio({
  preserveAspectRatio,
  propertyName,
  state,
}: {
  preserveAspectRatio: boolean
  propertyName: PropertyName
  state: AppState
}): [string, unknown][] {
  if (!state.propertySettings) {
    return []
  }

  const propertySettings = get(state.propertySettings, propertyName)

  if (!propertySettings) {
    return []
  }

  const { anchorPosition } = propertySettings
  const oppositePropertyName = propertyName === 'height' ? 'width' : 'height'
  const oppositePropertySettings = get(state.propertySettings, oppositePropertyName)

  invariant(
    anchorPosition,
    `Property "${propertyName}" is missing "anchorPosition" property`,
  )
  invariant(
    get(oppositePropertySettings, 'anchorPosition'),
    `Property "${oppositePropertyName}" is missing "anchorPosition" property`,
  )
  invariant(
    typeof get(propertySettings, 'preserveAspectRatio') === 'boolean',
    `Property "${propertyName}" is missing "preserveAspectRatio" property`,
  )
  invariant(
    typeof get(oppositePropertySettings, 'preserveAspectRatio') === 'boolean',
    `Property "${oppositePropertyName}" is missing "preserveAspectRatio" property`,
  )

  const sideEffects: [string, unknown][] = []

  sideEffects.push([
    `propertySettings.${oppositePropertyName}.preserveAspectRatio`,
    false,
  ])

  if (preserveAspectRatio === true) {
    sideEffects.push([
      `propertySettings.${oppositePropertyName}.isEnabled`,
      false,
    ])
  }

  const newOppositePropertyAnchorPosition = getConstrainedAnchorPosition({
    anchorPosition: get(oppositePropertySettings, 'anchorPosition', 'center-center'),
    preserveAspectRatio: false,
    propertyName: oppositePropertyName,
  })

  sideEffects.push([
    `propertySettings.${oppositePropertyName}.anchorPosition`,
    newOppositePropertyAnchorPosition,
  ])

  sideEffects.push([
    `propertySettings.${propertyName}.anchorPosition`,
    getConstrainedAnchorPosition({
      anchorPosition,
      preserveAspectRatio,
      propertyName,
    }),
  ])

  sideEffects.push([
    `propertySettings.${propertyName}.preserveAspectRatio`,
    preserveAspectRatio,
  ])

  return sideEffects
}
