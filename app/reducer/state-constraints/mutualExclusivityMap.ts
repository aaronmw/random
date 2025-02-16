import { PropertyName } from '@/lib/types'

// If the property in the key is set, the properties in the array
// get automatically unset
export const mutualExclusivityMap: Partial<
  Record<PropertyName, PropertyName[]>
> = {
  strokeTopWeight: ['strokeWeight'],
  strokeRightWeight: ['strokeWeight'],
  strokeBottomWeight: ['strokeWeight'],
  strokeLeftWeight: ['strokeWeight'],

  topRadii: [
    'leftRadii',
    'rightRadii',
    'topLeftRadius',
    'topRightRadius',
    'cornerRadius',
  ],
  rightRadii: [
    'bottomRadii',
    'bottomRightRadius',
    'topRadii',
    'topRightRadius',
    'cornerRadius',
  ],
  bottomRadii: [
    'bottomLeftRadius',
    'bottomRightRadius',
    'leftRadii',
    'rightRadii',
    'cornerRadius',
  ],
  leftRadii: [
    'bottomLeftRadius',
    'bottomRadii',
    'topLeftRadius',
    'topRadii',
    'cornerRadius',
  ],

  cornerRadius: [
    'topRadii',
    'rightRadii',
    'bottomRadii',
    'leftRadii',
    'topLeftRadius',
    'topRightRadius',
    'bottomRightRadius',
    'bottomLeftRadius',
  ],
  topLeftRadius: ['leftRadii', 'topRadii', 'cornerRadius'],
  topRightRadius: ['rightRadii', 'topRadii', 'cornerRadius'],
  bottomRightRadius: ['bottomRadii', 'rightRadii', 'cornerRadius'],
  bottomLeftRadius: ['bottomRadii', 'leftRadii', 'cornerRadius'],

  strokeWeight: [
    'strokeTopWeight',
    'strokeRightWeight',
    'strokeBottomWeight',
    'strokeLeftWeight',
  ],

  fillColor: [
    'fillColorBlueChannel',
    'fillColorBrightness',
    'fillColorGreenChannel',
    'fillColorHue',
    'fillColorLightness',
    'fillColorRedChannel',
    'fillColorSaturation',
  ],

  fillColorHue: [
    'fillColor',
    'fillColorBlueChannel',
    'fillColorGreenChannel',
    'fillColorRedChannel',
  ],
  fillColorSaturation: [
    'fillColor',
    'fillColorBlueChannel',
    'fillColorGreenChannel',
    'fillColorRedChannel',
  ],
  fillColorBrightness: [
    'fillColor',
    'fillColorBlueChannel',
    'fillColorGreenChannel',
    'fillColorLightness',
    'fillColorRedChannel',
  ],
  fillColorLightness: [
    'fillColor',
    'fillColorBlueChannel',
    'fillColorBrightness',
    'fillColorGreenChannel',
    'fillColorRedChannel',
  ],

  fillColorRedChannel: [
    'fillColor',
    'fillColorBrightness',
    'fillColorHue',
    'fillColorLightness',
    'fillColorSaturation',
  ],
  fillColorGreenChannel: [
    'fillColor',
    'fillColorBrightness',
    'fillColorHue',
    'fillColorLightness',
    'fillColorSaturation',
  ],
  fillColorBlueChannel: [
    'fillColor',
    'fillColorHue',
    'fillColorBrightness',
    'fillColorLightness',
    'fillColorSaturation',
  ],
}
