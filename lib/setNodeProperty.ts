import { hasProperty } from '@/lib/hasProperty'
import { rotateOriginXY } from '@/lib/rotateOriginXY'
import { setCharacters } from '@/lib/setCharacters'
import { toDegrees } from '@/lib/toDegrees'
import { toPercentage } from '@/lib/toPercentage'
import type {
  AnchorPosition,
  PropertyName,
  PropertySettings,
  PropertySettingsObject,
} from '@/lib/types'
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
  enabledPropertySettings: Partial<PropertySettingsObject>
  node: SceneNode
  propertySettings: PropertySettings
  propertyName: PropertyName
  value: string | number
}) {
  switch (propertyName) {
    case 'text': {
      if (!hasProperty(node, 'characters')) {
        break
      }

      const {
        decimalPlaces = 0,
        decimalCharacter = '.',
        thousandsSeparator = '',
        prefix = '',
        suffix = '',
      } = propertySettings

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
      const roundedDecimalPart = decimalPart.slice(0, decimalPlaces)

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
        propertySettings.preserveAspectRatio === true
          ? currentOppositeValue * scaleFactor
          : currentOppositeValue
      const [verticalOriginName, horizontalOriginName] =
        propertySettings.anchorPosition!.split('-')
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

      const colorOrOpacity = isColorProperty
        ? (() => {
            const rgb = colord(String(value)).toRgb()
            return {
              r: rgb.r / 255,
              g: rgb.g / 255,
              b: rgb.b / 255,
            }
          })()
        : toPercentage(value)

      newFillsOrStrokes[0][colorOrOpacityPropertyName] = colorOrOpacity
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
      const { anchorPosition = 'center-center' } = propertySettings

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
