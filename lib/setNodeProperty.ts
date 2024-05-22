import { hasProperty } from "@/lib/hasProperty"
import { rotateOriginXY } from "@/lib/rotateOriginXY"
import { setCharacters } from "@/lib/setCharacters"
import { toDegrees } from "@/lib/toDegrees"
import { toPercentage } from "@/lib/toPercentage"
import type {
  AnchorPosition,
  DataType,
  PropertyName,
  PropertySettings,
} from "@/lib/types"
import { cloneDeep } from "lodash"

export async function setNodeProperty({
  node,
  propertySettings,
  propertyName,
  value,
}: {
  node: SceneNode
  propertySettings: PropertySettings
  propertyName: PropertyName
  value: string | number
}) {
  console.log({ node, propertySettings, propertyName, value })

  switch (propertyName) {
    case "text": {
      if (!hasProperty(node, "characters")) {
        break
      }

      const { thousandsSeparator, prefix, suffix } = propertySettings

      const formattedValue = thousandsSeparator
        ? Number(value).toLocaleString()
        : value

      setCharacters({ node, characters: `${prefix}${formattedValue}${suffix}` })
      break
    }

    case "height":
    case "width": {
      const oppositeDimension = propertyName === "width" ? "height" : "width"
      const currentValue = node[propertyName]
      const currentOppositeValue = node[oppositeDimension]
      const newValue = Number(value)
      const scaleFactor = newValue / currentValue
      const newOppositeValue =
        propertySettings.preserveAspectRatio === true
          ? currentOppositeValue * scaleFactor
          : currentOppositeValue
      const [verticalOriginName, horizontalOriginName] =
        propertySettings.anchor!.split("-")
      const currentWidth = node.width
      const currentHeight = node.height
      const newWidth = propertyName === "width" ? newValue : newOppositeValue
      const newHeight = propertyName === "width" ? newOppositeValue : newValue

      if (!("resize" in node)) {
        break
      }

      node.resize(newWidth, newHeight)

      const newNodeX =
        horizontalOriginName === "center"
          ? node.x + (newWidth - currentWidth) / -2
          : horizontalOriginName === "right"
            ? node.x + (newWidth - currentWidth) / -1
            : node.x

      const newNodeY =
        verticalOriginName === "center"
          ? node.y + (newHeight - currentHeight) / 2
          : verticalOriginName === "top"
            ? node.y + (newHeight - currentHeight)
            : node.y

      node.x = newNodeX
      node.y = newNodeY
      break
    }

    case "fillColor":
    case "strokeColor":
    case "fillOpacity":
    case "strokeOpacity": {
      const paintShit = (property: "fill" | "stroke", dataType: DataType) => {}

      const isFillProperty =
        propertyName === "fillColor" || propertyName === "fillOpacity"
      const isColorProperty =
        propertyName === "fillColor" || propertyName === "strokeColor"
      const fillsOrStrokesPropertyName = isFillProperty ? "fills" : "strokes"
      const colorOrOpacityPropertyName = isColorProperty ? "color" : "opacity"

      if (!hasProperty(node, fillsOrStrokesPropertyName)) {
        break
      }

      const fillsOrStrokes = cloneDeep(node[fillsOrStrokesPropertyName])
      const colorOrOpacity = isColorProperty
        ? figma.util.solidPaint(String(value))
        : toPercentage(value)

      fillsOrStrokes[0][colorOrOpacityPropertyName] = colorOrOpacity
      node[fillsOrStrokesPropertyName] = fillsOrStrokes
      break
    }

    case "layerBlur": {
      if (!hasProperty(node, "effects")) {
        break
      }

      const effects = cloneDeep(node.effects)

      effects[0] = {
        type: "LAYER_BLUR",
        radius: Number(value),
        visible: true,
      }

      node.effects = effects
      break
    }

    case "arcInnerRadius":
    case "arcEndingAngle":
    case "arcStartingAngle": {
      if (!hasProperty(node, "arcData")) {
        break
      }

      const { arcPropertyName, valueTransformer } = {
        arcStartingAngle: {
          arcPropertyName: "startingAngle",
          valueTransformer: toDegrees,
        },
        arcEndingAngle: {
          arcPropertyName: "endingAngle",
          valueTransformer: toDegrees,
        },
        arcInnerRadius: {
          arcPropertyName: "innerRadius",
          valueTransformer: toPercentage,
        },
      }[propertyName]

      const arcData = cloneDeep(node.arcData)

      arcData[arcPropertyName] = valueTransformer(value)
      node.arcData = arcData
      break
    }

    case "rotation": {
      const { anchor = "center-center" } = propertySettings

      const [xOffset, yOffset] = (
        {
          "top-left": [0, 0],
          "top-center": [0.5, 0],
          "top-right": [1, 0],
          "center-left": [0, 0.5],
          "center-center": [0.5, 0.5],
          "center-right": [1, 0.5],
          "bottom-left": [0, 1],
          "bottom-center": [0.5, 1],
          "bottom-right": [1, 1],
        } as Record<AnchorPosition, [number, number]>
      )[anchor]

      rotateOriginXY([node], Number(value), xOffset, yOffset, "%", "%")
      break
    }

    case "pointCount": {
      if (!hasProperty(node, propertyName)) {
        break
      }

      node[propertyName] = Math.max(3, Number(value))
      break
    }

    case "x":
    case "y":
    case "innerRadius":
    case "opacity":
    case "strokeWeight":
    case "cornerRadius":
    case "topLeftRadius":
    case "topRightRadius":
    case "bottomRightRadius":
    case "bottomLeftRadius": {
      if (!hasProperty(node, propertyName)) {
        break
      }

      const valueTransformer =
        propertyName === "innerRadius" || propertyName === "opacity"
          ? toPercentage
          : Number

      ;(node[propertyName] as any) = valueTransformer(value)
      break
    }
  }

  return true
}
