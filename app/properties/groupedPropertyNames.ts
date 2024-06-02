import { PropertyName } from "@/lib/types"

export const groupedPropertyNames: [
  groupName: string,
  propertyNames: PropertyName[],
][] = [
  ["text", ["text"]],
  ["layout", ["width", "height", "x", "y", "rotation", "position"]],
  [
    "fill",
    [
      "opacity",
      "fillOpacity",
      "fillColor",
      "fillColorRedChannel",
      "fillColorGreenChannel",
      "fillColorBlueChannel",
      "fillColorHue",
      "fillColorSaturation",
      "fillColorBrightness",
      "fillColorLightness",
      "fillColorAlphaChannel",
    ],
  ],
  [
    "stroke",
    [
      "strokeWeight",
      "strokeBottomWeight",
      "strokeTopWeight",
      "strokeLeftWeight",
      "strokeRightWeight",
      "strokeColor",
      "strokeOpacity",
    ],
  ],
  [
    "corners",
    [
      "cornerRadius",
      "topLeftRadius",
      "topRightRadius",
      "bottomLeftRadius",
      "bottomRightRadius",
      "topRadii",
      "rightRadii",
      "bottomRadii",
      "leftRadii",
    ],
  ],
  ["arc", ["arcStartingAngle", "arcEndingAngle", "arcInnerRadius"]],
  ["stars", ["pointCount", "innerRadius"]],
]
