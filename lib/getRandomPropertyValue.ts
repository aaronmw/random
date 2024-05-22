import { PropertyName, PropertySettings } from "@/lib/pluginTypes"
import { get, random, sample, toInteger } from "lodash"
import invariant from "tiny-invariant"

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
  propertySettings: PropertySettings
  propertyName: PropertyName
}) => {
  const { mode, modeOptions } = propertySettings

  let randomValue, newPropertyValue

  switch (mode) {
    case "range": {
      invariant(modeOptions.range, `No range options for "${propertyName}"`)

      const { min, max } = modeOptions.range

      randomValue = random(min, max)
      newPropertyValue = randomValue
      break
    }

    case "calc": {
      invariant(modeOptions.calc, `No calc options for "${propertyName}"`)

      const {
        operator,
        [operator]: { min, max },
      } = modeOptions.calc

      const currentPropValue =
        propertyName === "text"
          ? toInteger(
              get(
                (node as TextNode).characters.match(/[0-9,]+(\.[0-9]+)?/),
                "0",
                "0",
              ).replace(/,/g, ""),
            )
          : hasProp(node, propertyName)
            ? node[propertyName]
            : 0

      randomValue = random(min, max)

      switch (operator) {
        case "add":
          newPropertyValue = currentPropValue + randomValue
          break
        case "multiply":
          newPropertyValue = currentPropValue * randomValue
          break
        default:
          newPropertyValue = currentPropValue
      }
      break
    }

    case "list": {
      invariant(modeOptions.list, `No list options for "${propertyName}"`)

      const enabledItems = modeOptions.list.options.filter(
        (listItem) => !String(listItem).startsWith("//"),
      )

      randomValue = sample(enabledItems)
      newPropertyValue = randomValue
      break
    }
  }

  return newPropertyValue
}
