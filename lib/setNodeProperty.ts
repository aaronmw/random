import type {
    AnchorPosition,
    PropertyName,
    PropertySettingsRow,
} from '@/app/types'
import { hasProperty } from '@/lib/hasProperty'
import { rotateOriginXY } from '@/lib/rotateOriginXY'
import type { PropertySettingsWithDetails } from '@/lib/services/propertySettingsService'
import { setCharacters } from '@/lib/setCharacters'
import { toDegrees } from '@/lib/toDegrees'
import { toPercentage } from '@/lib/toPercentage'
import { colord, extend } from 'colord'
import a11yPlugin from 'colord/plugins/a11y'
import namesPlugin from 'colord/plugins/names'
import cloneDeep from 'lodash/cloneDeep'

extend([a11yPlugin, namesPlugin])

export async function setNodeProperty({
  enabledPropertySettings,
  node,
  propertySettings,
  propertyName,
  value,
}: {
  enabledPropertySettings: Partial<PropertySettingsRow>
  node: SceneNode
  propertySettings: PropertySettingsWithDetails
  propertyName: PropertyName
  value: string | number
}) {
  switch (propertyName) {
    case 'text': {
      if (!hasProperty(node, 'characters')) {
        break
      }

      const {
        decimal_places: decimalPlaces = 0,
        thousands_separator: thousandsSeparator = '',
        prefix = '',
        suffix = '',
      } = propertySettings

      const decimalCharacter = '.'
      const formattedValue = String(value)
        .split('.')
        .map((part, index) => {
          if (index === 0 && thousandsSeparator) {
            return part.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
          }
          return part
        })
        .join(decimalCharacter)

      const decimalPart = formattedValue.split(decimalCharacter)[1] || ''
      const roundedDecimalPart = decimalPart.slice(0, decimalPlaces ?? 0)

      await setCharacters({
        node,
        characters: [
          prefix,
          formattedValue.split(decimalCharacter)[0],
          roundedDecimalPart ? decimalCharacter + roundedDecimalPart : '',
          suffix,
        ].join(''),
      })
      break
    }

    case 'height':
    case 'width': {
      const oppositeDimension = propertyName === 'width' ? 'height' : 'width'
      const currentValue = node[propertyName]
      const currentOppositeValue = node[oppositeDimension]
      const newValue = Number(value)
      const scaleFactor = newValue / currentValue
      const newOppositeValue =
        propertySettings.preserve_aspect_ratio === true
          ? currentOppositeValue * scaleFactor
          : currentOppositeValue
      const [verticalOriginName, horizontalOriginName] =
        (propertySettings.anchor_position || 'center-center').split('-')
      const currentWidth = node.width
      const currentHeight = node.height
      const newWidth = propertyName === 'width' ? newValue : newOppositeValue
      const newHeight = propertyName === 'width' ? newOppositeValue : newValue

      if (!('resize' in node)) {
        break
      }

      node.resize(newWidth, newHeight)

      const newNodeX =
        horizontalOriginName === 'center'
          ? node.x + (newWidth - currentWidth) / -2
          : horizontalOriginName === 'right'
            ? node.x + (newWidth - currentWidth) / -1
            : node.x

      const newNodeY =
        verticalOriginName === 'center'
          ? node.y + (newHeight - currentHeight) / 2
          : verticalOriginName === 'top'
            ? node.y + (newHeight - currentHeight)
            : node.y

      node.x = newNodeX
      node.y = newNodeY
      break
    }

    case 'fillColorRedChannel':
    case 'fillColorGreenChannel':
    case 'fillColorBlueChannel':
    case 'strokeColorRedChannel':
    case 'strokeColorGreenChannel':
    case 'strokeColorBlueChannel': {
      const fillsOrStrokes = propertyName.startsWith('fill')
        ? 'fills'
        : 'strokes'

      if (!hasProperty(node, fillsOrStrokes)) {
        break
      }

      const channel = propertyName
        .replaceAll(/(fill|stroke)Color/, '')
        .charAt(0)
        .toLowerCase()
      const newfillsOrStrokes = cloneDeep(node[fillsOrStrokes])

      // Initialize fills/strokes array if empty
      if (newfillsOrStrokes.length === 0) {
        newfillsOrStrokes.push({
          type: 'SOLID',
          color: { r: 0, g: 0, b: 0 },
          opacity: 1,
          visible: true,
        })
      }

      newfillsOrStrokes[0].color[channel] = Number(value) / 255
      node[fillsOrStrokes] = newfillsOrStrokes

      break
    }

    case 'fillColorHue':
    case 'fillColorSaturation':
    case 'fillColorLightness':
    case 'strokeColorHue':
    case 'strokeColorSaturation':
    case 'strokeColorLightness': {
      const fillsOrStrokes = propertyName.startsWith('fill')
        ? 'fills'
        : 'strokes'

      if (!hasProperty(node, fillsOrStrokes)) {
        break
      }

      const newFillsOrStrokes = cloneDeep(node[fillsOrStrokes])

      // Initialize fills/strokes array if empty
      if (newFillsOrStrokes.length === 0) {
        newFillsOrStrokes.push({
          type: 'SOLID',
          color: { r: 0, g: 0, b: 0 },
          opacity: 1,
          visible: true,
        })
      }

      const currentColorObj = newFillsOrStrokes[0].color
      const hslProperty = propertyName
        .replace(/(fill|stroke)Color/, '')
        .charAt(0)
        .toLowerCase() as 'h' | 's' | 'l'
      const currentHSL = colord({
        r: Math.round(currentColorObj.r * 255),
        g: Math.round(currentColorObj.g * 255),
        b: Math.round(currentColorObj.b * 255),
      }).toHsl()
      const newHSL = colord({
        ...currentHSL,
        [hslProperty]: Number(value),
      })
      const newRGB = newHSL.toRgb()

      newFillsOrStrokes[0].color = {
        r: newRGB.r / 255,
        g: newRGB.g / 255,
        b: newRGB.b / 255,
      }
      node[fillsOrStrokes] = newFillsOrStrokes

      break
    }

    case 'fillColor':
    case 'strokeColor':
    case 'fillOpacity':
    case 'strokeOpacity': {
      const isFillProperty =
        propertyName === 'fillColor' || propertyName === 'fillOpacity'
      const isColorProperty =
        propertyName === 'fillColor' || propertyName === 'strokeColor'
      const fillsOrStrokesPropertyName = isFillProperty ? 'fills' : 'strokes'
      const colorOrOpacityPropertyName = isColorProperty ? 'color' : 'opacity'

      if (!hasProperty(node, fillsOrStrokesPropertyName)) {
        break
      }

      const newFillsOrStrokes = cloneDeep(node[fillsOrStrokesPropertyName])

      // Initialize fills/strokes array if empty
      if (newFillsOrStrokes.length === 0) {
        if (isColorProperty) {
          // Initialize with a solid color fill/stroke
          newFillsOrStrokes.push({
            type: 'SOLID',
            color: { r: 0, g: 0, b: 0 },
            opacity: 1,
            visible: true,
          })
        } else {
          // Initialize with a solid fill/stroke for opacity
          newFillsOrStrokes.push({
            type: 'SOLID',
            color: { r: 0, g: 0, b: 0 },
            opacity: 1,
            visible: true,
          })
        }
      }

      const colorOrOpacity = isColorProperty
        ? (() => {
            // Trim whitespace and normalize hex value
            let colorValue = String(value).trim()

            // Ensure hex values start with # if they don't already
            if (colorValue.match(/^[0-9A-Fa-f]{6}$/)) {
              colorValue = '#' + colorValue
            }

            console.log('Setting color:', { propertyName, colorValue, originalValue: value })

            // Try to parse the color
            const color = colord(colorValue)
            if (!color.isValid()) {
              console.error('Invalid color value:', colorValue, 'Original:', value)
              // Fallback to black if invalid
              return { r: 0, g: 0, b: 0 }
            }

            const rgb = color.toRgb()
            console.log('Parsed RGB:', rgb, 'Normalized:', { r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 })
            return {
              r: rgb.r / 255,
              g: rgb.g / 255,
              b: rgb.b / 255,
            }
          })()
        : toPercentage(value)

      // Set the color or opacity
      newFillsOrStrokes[0][colorOrOpacityPropertyName] = colorOrOpacity

      // Ensure the fill/stroke is visible and of type SOLID
      if (isColorProperty) {
        newFillsOrStrokes[0].type = 'SOLID'
        newFillsOrStrokes[0].visible = true
        // Ensure opacity is set if not already set
        if (newFillsOrStrokes[0].opacity === undefined) {
          newFillsOrStrokes[0].opacity = 1
        }
      } else {
        // For opacity, ensure it's between 0 and 1
        newFillsOrStrokes[0].opacity = Math.max(0, Math.min(1, colorOrOpacity as number))
        newFillsOrStrokes[0].visible = true
      }

      console.log('Final fill/stroke:', JSON.stringify(newFillsOrStrokes[0], null, 2))
      node[fillsOrStrokesPropertyName] = newFillsOrStrokes
      break
    }

    case 'layerBlur': {
      if (!hasProperty(node, 'effects')) {
        break
      }

      const effects = cloneDeep(node.effects)

      effects[0] = {
        type: 'LAYER_BLUR',
        radius: Number(value),
        visible: true,
      }

      node.effects = effects
      break
    }

    case 'arcInnerRadius':
    case 'arcEndingAngle':
    case 'arcStartingAngle': {
      if (!hasProperty(node, 'arcData')) {
        break
      }

      const { arcPropertyName, valueTransformer } = {
        arcStartingAngle: {
          arcPropertyName: 'startingAngle',
          valueTransformer: toDegrees,
        },
        arcEndingAngle: {
          arcPropertyName: 'endingAngle',
          valueTransformer: toDegrees,
        },
        arcInnerRadius: {
          arcPropertyName: 'innerRadius',
          valueTransformer: toPercentage,
        },
      }[propertyName]

      const arcData = cloneDeep(node.arcData)

      arcData[arcPropertyName] = valueTransformer(value)
      node.arcData = arcData
      break
    }

    case 'rotation': {
      const anchorPosition = (propertySettings.anchor_position || 'center-center') as AnchorPosition

      const [xOffset, yOffset] = (
        {
          'top-left': [0, 0],
          'top-center': [0.5, 0],
          'top-right': [1, 0],
          'center-left': [0, 0.5],
          'center-center': [0.5, 0.5],
          'center-right': [1, 0.5],
          'bottom-left': [0, 1],
          'bottom-center': [0.5, 1],
          'bottom-right': [1, 1],
        } as Record<AnchorPosition, [number, number]>
      )[anchorPosition]

      rotateOriginXY([node], Number(value), xOffset, yOffset, '%', '%')
      break
    }

    case 'pointCount': {
      if (!hasProperty(node, propertyName)) {
        break
      }

      node[propertyName] = Math.max(3, Number(value))
      break
    }

    case 'x':
    case 'y':
    case 'innerRadius':
    case 'opacity':
    case 'strokeWeight':
    case 'strokeTopWeight':
    case 'strokeRightWeight':
    case 'strokeBottomWeight':
    case 'strokeLeftWeight':
    case 'cornerRadius':
    case 'topLeftRadius':
    case 'topRightRadius':
    case 'bottomRightRadius':
    case 'bottomLeftRadius': {
      if (!hasProperty(node, propertyName)) {
        break
      }

      const valueTransformer =
        propertyName === 'innerRadius' || propertyName === 'opacity'
          ? toPercentage
          : Number

      ;(node[propertyName] as any) = valueTransformer(value)
      break
    }
  }

  node.setPluginData(
    'propertySettings',
    JSON.stringify(enabledPropertySettings),
  )

  return true
}
