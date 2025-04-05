import { singlePropertySettingsAtom } from '@/app/atoms/singlePropertySettingsAtom'
import {
  colorBasedPropertyOptions,
  colorChannelBasedPropertyOptions,
  degreeBasedPropertyOptions,
  integerBasedPropertyOptions,
  percentageBasedPropertyOptions,
  textBasedPropertyOptions,
} from '@/app/reducer/propertyModels'
import { PropertyName, PropertySettings } from '@/lib/types'
import { atomWithStorage } from 'jotai/utils'

export const initialPropertySettings = {
  arcEndingAngle: { ...degreeBasedPropertyOptions },
  arcInnerRadius: { ...percentageBasedPropertyOptions },
  arcStartingAngle: { ...degreeBasedPropertyOptions },
  bottomLeftRadius: { ...integerBasedPropertyOptions },
  bottomRadii: { ...integerBasedPropertyOptions },
  bottomRightRadius: { ...integerBasedPropertyOptions },
  cornerRadius: { ...integerBasedPropertyOptions },
  fillColor: { ...colorBasedPropertyOptions },
  fillColorBlueChannel: { ...colorChannelBasedPropertyOptions },
  fillColorGreenChannel: { ...colorChannelBasedPropertyOptions },
  fillColorHue: { ...degreeBasedPropertyOptions },
  fillColorLightness: { ...percentageBasedPropertyOptions },
  fillColorRedChannel: { ...colorChannelBasedPropertyOptions },
  fillColorSaturation: { ...percentageBasedPropertyOptions },
  fillOpacity: { ...percentageBasedPropertyOptions },
  height: {
    ...integerBasedPropertyOptions,
    anchorPosition: 'center-center',
    preserveAspectRatio: false,
  },
  innerRadius: { ...percentageBasedPropertyOptions },
  layerBlur: {
    ...integerBasedPropertyOptions,
    modeOptions: {
      ...integerBasedPropertyOptions.modeOptions,
      list: {
        options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      range: {
        max: 10,
        min: 1,
      },
    },
  },
  leftRadii: { ...integerBasedPropertyOptions },
  opacity: { ...percentageBasedPropertyOptions },
  pointCount: {
    ...integerBasedPropertyOptions,
    modeOptions: {
      ...integerBasedPropertyOptions.modeOptions,
      list: {
        options: [3, 4, 5, 6, 7, 8, 9, 10],
      },
      range: {
        max: 10,
        min: 3,
      },
    },
  },
  rightRadii: { ...integerBasedPropertyOptions },
  rotation: {
    ...degreeBasedPropertyOptions,
    anchorPosition: 'center-center',
  },
  strokeBottomWeight: { ...integerBasedPropertyOptions },
  strokeColor: { ...colorBasedPropertyOptions },
  strokeColorBlueChannel: { ...colorChannelBasedPropertyOptions },
  strokeColorGreenChannel: { ...colorChannelBasedPropertyOptions },
  strokeColorHue: { ...degreeBasedPropertyOptions },
  strokeColorLightness: { ...percentageBasedPropertyOptions },
  strokeColorRedChannel: { ...colorChannelBasedPropertyOptions },
  strokeColorSaturation: { ...percentageBasedPropertyOptions },
  strokeLeftWeight: { ...integerBasedPropertyOptions },
  strokeOpacity: { ...percentageBasedPropertyOptions },
  strokeRightWeight: { ...integerBasedPropertyOptions },
  strokeTopWeight: { ...integerBasedPropertyOptions },
  strokeWeight: { ...integerBasedPropertyOptions },
  text: { ...textBasedPropertyOptions },
  topLeftRadius: { ...integerBasedPropertyOptions },
  topRadii: { ...integerBasedPropertyOptions },
  topRightRadius: { ...integerBasedPropertyOptions },
  width: {
    ...integerBasedPropertyOptions,
    anchorPosition: 'center-center',
    preserveAspectRatio: false,
  },
  x: { ...integerBasedPropertyOptions },
  y: { ...integerBasedPropertyOptions },
} satisfies Record<PropertyName, PropertySettings>

export const propertySettingsAtom = atomWithStorage<
  Record<PropertyName, PropertySettings>
>('propertySettings', initialPropertySettings)

export const propertyAtoms = Object.fromEntries(
  (Object.keys(initialPropertySettings) as PropertyName[]).map(
    (propertyName) => [propertyName, singlePropertySettingsAtom(propertyName)],
  ),
)
