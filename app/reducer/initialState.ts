import {
  colorBasedPropertyOptions,
  colorChannelBasedPropertyOptions,
  degreeBasedPropertyOptions,
  integerBasedPropertyOptions,
  percentageBasedPropertyOptions,
  textBasedPropertyOptions,
} from "@/app/reducer/propertyModels"
import { AppState } from "@/lib/types"

export const initialState: AppState = {
  activePropertyName: "",
  propertySettings: {
    arcEndingAngle: degreeBasedPropertyOptions,
    arcInnerRadius: percentageBasedPropertyOptions,
    arcStartingAngle: degreeBasedPropertyOptions,
    bottomLeftRadius: integerBasedPropertyOptions,
    bottomRadii: integerBasedPropertyOptions,
    bottomRightRadius: integerBasedPropertyOptions,
    cornerRadius: integerBasedPropertyOptions,
    fillColor: colorBasedPropertyOptions,
    fillColorAlphaChannel: percentageBasedPropertyOptions,
    fillColorBlueChannel: colorChannelBasedPropertyOptions,
    fillColorBrightness: percentageBasedPropertyOptions,
    fillColorGreenChannel: colorChannelBasedPropertyOptions,
    fillColorHue: degreeBasedPropertyOptions,
    fillColorLightness: percentageBasedPropertyOptions,
    fillColorRedChannel: colorChannelBasedPropertyOptions,
    fillColorSaturation: percentageBasedPropertyOptions,
    fillOpacity: percentageBasedPropertyOptions,
    height: {
      ...integerBasedPropertyOptions,
      anchor: "center-center",
      preserveAspectRatio: false,
    },
    innerRadius: percentageBasedPropertyOptions,
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
    leftRadii: integerBasedPropertyOptions,
    opacity: percentageBasedPropertyOptions,
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
    position: integerBasedPropertyOptions,
    rightRadii: integerBasedPropertyOptions,
    rotation: {
      ...degreeBasedPropertyOptions,
      anchor: "center-center",
    },
    strokeBottomWeight: integerBasedPropertyOptions,
    strokeColor: colorBasedPropertyOptions,
    strokeLeftWeight: integerBasedPropertyOptions,
    strokeOpacity: percentageBasedPropertyOptions,
    strokeRightWeight: integerBasedPropertyOptions,
    strokeTopWeight: integerBasedPropertyOptions,
    strokeWeight: integerBasedPropertyOptions,
    text: textBasedPropertyOptions,
    topLeftRadius: integerBasedPropertyOptions,
    topRadii: integerBasedPropertyOptions,
    topRightRadius: integerBasedPropertyOptions,
    width: {
      ...integerBasedPropertyOptions,
      anchor: "center-center",
      preserveAspectRatio: false,
    },
    x: integerBasedPropertyOptions,
    y: integerBasedPropertyOptions,
  },
  savedPropertySettings: [],
}
