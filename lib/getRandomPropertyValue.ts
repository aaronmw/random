import { PropertyName } from '@/app/types'
import { PropertySettingsWithDetails } from '@/lib/services/propertySettingsService'
import get from 'lodash/get'
import random from 'lodash/random'
import sample from 'lodash/sample'
import toInteger from 'lodash/toInteger'
import invariant from 'tiny-invariant'

export { getRandomPropertyValue }

function hasProp<T extends object, K extends PropertyKey>(
  obj: T,
  key: K,
): obj is T & Record<K, any> {
  return key in obj
}

const getRandomPropertyValue = ({
  node,
  propertySettings,
  propertyName,
}: {
  node: SceneNode
  propertySettings: PropertySettingsWithDetails
  propertyName: PropertyName
}) => {
  const { randomization_mode: mode, modeOptions } = propertySettings

  let randomValue, newPropertyValue

  switch (mode) {
    case 'range': {
      invariant(modeOptions?.range, `No range options for "${propertyName}"`)

      const { min, max } = modeOptions.range
      invariant(min !== undefined && max !== undefined, `Invalid range for "${propertyName}"`)

      randomValue = random(min, max)
      newPropertyValue = randomValue
      break
    }

    case 'addition':
    case 'multiplication': {
      invariant(modeOptions?.calc, `No calc options for "${propertyName}"`)

      const operator = mode === 'addition' ? 'add' : 'multiply'
      const calcOptions = modeOptions.calc as {
        add?: { min: number; max: number }
        multiply?: { min: number; max: number }
      }
      const operatorOptions = calcOptions[operator]
      invariant(operatorOptions, `No ${operator} options for "${propertyName}"`)
      const { min, max } = operatorOptions

      const currentPropValue =
        propertyName === 'text'
          ? toInteger(
              get(
                (node as TextNode).characters.match(/[0-9,]+(\.[0-9]+)?/),
                '0',
                '0',
              ).replace(/,/g, ''),
            )
          : hasProp(node, propertyName)
            ? node[propertyName]
            : 0

      randomValue = random(min, max)

      switch (operator) {
        case 'add':
          newPropertyValue = currentPropValue + randomValue
          break
        case 'multiply':
          newPropertyValue = currentPropValue * randomValue
          break
        default:
          newPropertyValue = currentPropValue
      }
      break
    }

    case 'list': {
      invariant(modeOptions?.list, `No list options for "${propertyName}"`)
      invariant(modeOptions.list.options, `No list options array for "${propertyName}"`)

      const enabledItems = modeOptions.list.options.filter(
        (listItem: string) => !String(listItem).startsWith('//'),
      )

      console.log('List mode - options:', {
        propertyName,
        totalOptions: modeOptions.list.options.length,
        enabledItemsCount: enabledItems.length,
        enabledItems,
      })

      if (enabledItems.length === 0) {
        console.error(`No enabled items in list for "${propertyName}"`)
        return undefined
      }

      randomValue = sample(enabledItems)
      newPropertyValue = randomValue

      console.log('Selected random value:', { propertyName, randomValue, newPropertyValue })
      break
    }
  }

  return newPropertyValue
}
