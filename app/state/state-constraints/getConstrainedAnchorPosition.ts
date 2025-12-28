import { AnchorPosition, PropertyName } from '@/app/types'
import xor from 'lodash/xor'

export const anchorPositions = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center-center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as AnchorPosition[]

const anchorConstraints = {
  height: ['top-center', 'center-center', 'bottom-center'],
  width: ['center-left', 'center-center', 'center-right'],
} as Record<PropertyName, AnchorPosition[]>

const anchorFallbackPositions = {
  height: {
    'top-left': 'top-center',
    'top-right': 'top-center',
    'bottom-left': 'bottom-center',
    'bottom-right': 'bottom-center',
    'center-left': 'center-center',
    'center-right': 'center-center',
    'center-center': 'center-center',
  },
  width: {
    'top-left': 'center-left',
    'top-right': 'center-right',
    'bottom-left': 'center-left',
    'bottom-right': 'center-right',
    'center-center': 'center-center',
    'center-left': 'center-left',
    'center-right': 'center-right',
  },
} as Record<PropertyName, Record<AnchorPosition, AnchorPosition>>

export const getConstrainedAnchorPosition = ({
  anchorPosition,
  preserveAspectRatio,
  propertyName,
}: {
  anchorPosition: AnchorPosition
  preserveAspectRatio: boolean
  propertyName: PropertyName
}) => {
  const allowedAnchorPositions = anchorConstraints[propertyName]
  const disallowedAnchorPositions = xor(anchorPositions, allowedAnchorPositions)

  return !preserveAspectRatio &&
    disallowedAnchorPositions.includes(anchorPosition)
    ? anchorFallbackPositions[propertyName][anchorPosition]
    : anchorPosition
}
