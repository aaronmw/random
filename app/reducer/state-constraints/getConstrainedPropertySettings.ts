import { PropertyName } from "@/lib/types"

const mutuallyExclusiveConstraints: Partial<
  Record<PropertyName, PropertyName[]>
> = {
  cornerRadius: [
    "bottomLeftRadius",
    "bottomRadii",
    "bottomRightRadius",
    "leftRadii",
    "rightRadii",
    "topLeftRadius",
    "topRadii",
    "topRightRadius",
  ],
  fillColor: [
    "fillColorBlueChannel",
    "fillColorBrightness",
    "fillColorGreenChannel",
    "fillColorHue",
    "fillColorLightness",
    "fillColorRedChannel",
    "fillColorSaturation",
  ],
  fillColorRedChannel: [
    "fillColor",
    "fillColorBrightness",
    "fillColorHue",
    "fillColorLightness",
    "fillColorSaturation",
  ],
  fillColorGreenChannel: [
    "fillColor",
    "fillColorBrightness",
    "fillColorHue",
    "fillColorLightness",
    "fillColorSaturation",
  ],
  fillColorBlueChannel: [
    "fillColor",
    "fillColorHue",
    "fillColorBrightness",
    "fillColorLightness",
    "fillColorSaturation",
  ],
  fillColorHue: [
    "fillColor",
    "fillColorBlueChannel",
    "fillColorGreenChannel",
    "fillColorRedChannel",
  ],
  fillColorSaturation: [
    "fillColor",
    "fillColorBlueChannel",
    "fillColorGreenChannel",
    "fillColorRedChannel",
  ],
  fillColorBrightness: [
    "fillColor",
    "fillColorBlueChannel",
    "fillColorGreenChannel",
    "fillColorLightness",
    "fillColorRedChannel",
  ],
  fillColorLightness: [
    "fillColor",
    "fillColorBlueChannel",
    "fillColorBrightness",
    "fillColorGreenChannel",
    "fillColorRedChannel",
  ],
  topLeftRadius: ["leftRadii", "topRadii"],
  topRightRadius: ["rightRadii", "topRadii"],
  bottomRightRadius: ["bottomRadii", "rightRadii"],
  bottomLeftRadius: ["bottomRadii", "leftRadii"],
  topRadii: ["leftRadii", "rightRadii", "topLeftRadius", "topRightRadius"],
  rightRadii: [
    "bottomRadii",
    "bottomRightRadius",
    "topRadii",
    "topRightRadius",
  ],
  bottomRadii: [
    "bottomLeftRadius",
    "bottomRightRadius",
    "leftRadii",
    "rightRadii",
  ],
  leftRadii: ["bottomLeftRadius", "bottomRadii", "topLeftRadius", "topRadii"],
  strokeWeight: [
    "strokeBottomWeight",
    "strokeLeftWeight",
    "strokeRightWeight",
    "strokeTopWeight",
  ],
  strokeLeftWeight: ["strokeWeight"],
  strokeRightWeight: ["strokeWeight"],
  strokeBottomWeight: ["strokeWeight"],
  strokeTopWeight: ["strokeWeight"],
}

export function getConstrainedPropertySettings({
  propertyName,
}: {
  propertyName: PropertyName
}) {
  return (
    mutuallyExclusiveConstraints[propertyName]?.reduce(
      (acc, propertyNameToStopRandomizing) => {
        return {
          ...acc,
          [propertyNameToStopRandomizing]: {
            isRandomized: {
              $set: false,
            },
          },
        }
      },
      {},
    ) ?? {}
  )
}
