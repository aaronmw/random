import { PropertyName } from '@/app/types'

export const groupedPropertyNames: [
  groupName: string,
  propertyNames: PropertyName[],
][] = [
  ['special', ['text']],
  ['layout', ['width', 'height', 'x', 'y', 'rotation']],
  [
    'fill',
    [
      'opacity',
      'fillOpacity',
      'fillColor',
      'fillColorRedChannel',
      'fillColorGreenChannel',
      'fillColorBlueChannel',
      'fillColorHue',
      'fillColorSaturation',
      'fillColorLightness',
    ],
  ],
  [
    'stroke',
    [
      'strokeWeight',
      'strokeBottomWeight',
      'strokeTopWeight',
      'strokeLeftWeight',
      'strokeRightWeight',
      'strokeColor',
      'strokeColorRedChannel',
      'strokeColorGreenChannel',
      'strokeColorBlueChannel',
      'strokeColorHue',
      'strokeColorSaturation',
      'strokeColorLightness',
      'strokeOpacity',
    ],
  ],
  [
    'corners',
    [
      'cornerRadius',
      'topLeftRadius',
      'topRightRadius',
      'bottomLeftRadius',
      'bottomRightRadius',
      'topRadii',
      'rightRadii',
      'bottomRadii',
      'leftRadii',
    ],
  ],
  ['arc', ['arcStartingAngle', 'arcEndingAngle', 'arcInnerRadius']],
  ['stars', ['pointCount', 'innerRadius']],
]
