import { AppState, PropertyName } from '@/lib/types'
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
  invariant(
    propertyName === 'width' || propertyName === 'height',
    `Property "${propertyName}" is not a valid property name`,
  )

  const propertySettings = state.propertySettings[propertyName]
  const { anchorPosition } = propertySettings
  const oppositePropertyName = propertyName === 'height' ? 'width' : 'height'
  const oppositePropertySettings = state.propertySettings[oppositePropertyName]

  invariant(
    anchorPosition,
    `Property "${propertyName}" is missing "anchorPosition" property`,
  )
  invariant(
    oppositePropertySettings.anchorPosition,
    `Property "${oppositePropertyName}" is missing "anchorPosition" property`,
  )
  invariant(
    typeof propertySettings.preserveAspectRatio === 'boolean',
    `Property "${propertyName}" is missing "preserveAspectRatio" property`,
  )
  invariant(
    typeof oppositePropertySettings.preserveAspectRatio === 'boolean',
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
    anchorPosition: oppositePropertySettings.anchorPosition,
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
