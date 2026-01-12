import { AppState, AnchorPosition, PropertyName } from '@/app/types'
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

  const { anchor_position } = propertySettings
  const oppositePropertyName = propertyName === 'height' ? 'width' : 'height'
  const oppositePropertySettings = get(state.propertySettings, oppositePropertyName)

  invariant(
    anchor_position,
    `Property "${propertyName}" is missing "anchor_position" property`,
  )
  invariant(
    get(oppositePropertySettings, 'anchor_position'),
    `Property "${oppositePropertyName}" is missing "anchor_position" property`,
  )
  invariant(
    typeof get(propertySettings, 'preserve_aspect_ratio') === 'boolean',
    `Property "${propertyName}" is missing "preserve_aspect_ratio" property`,
  )
  invariant(
    typeof get(oppositePropertySettings, 'preserve_aspect_ratio') === 'boolean',
    `Property "${oppositePropertyName}" is missing "preserve_aspect_ratio" property`,
  )

  const sideEffects: [string, unknown][] = []

  sideEffects.push([
    `propertySettings.${oppositePropertyName}.preserve_aspect_ratio`,
    false,
  ])

  if (preserveAspectRatio === true) {
    sideEffects.push([
      `propertySettings.${oppositePropertyName}.is_enabled`,
      false,
    ])
  }

  const oppositeAnchorPosition = get(oppositePropertySettings, 'anchor_position', 'center-center') as AnchorPosition
  const newOppositePropertyAnchorPosition = getConstrainedAnchorPosition({
    anchorPosition: oppositeAnchorPosition,
    preserveAspectRatio: false,
    propertyName: oppositePropertyName,
  })

  sideEffects.push([
    `propertySettings.${oppositePropertyName}.anchor_position`,
    newOppositePropertyAnchorPosition,
  ])

  sideEffects.push([
    `propertySettings.${propertyName}.anchor_position`,
    getConstrainedAnchorPosition({
      anchorPosition: anchor_position,
      preserveAspectRatio,
      propertyName,
    }),
  ])

  sideEffects.push([
    `propertySettings.${propertyName}.preserve_aspect_ratio`,
    preserveAspectRatio,
  ])

  return sideEffects
}
