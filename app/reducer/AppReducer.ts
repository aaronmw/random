import { AppAction, AppState } from "@/lib/types"
import update from "immutability-helper"
import { mapValues, set } from "lodash"
import invariant from "tiny-invariant"
import { getConstrainedAnchorPosition } from "./state-constraints/getConstrainedAnchorPosition"
import { getConstrainedPropertySettings } from "./state-constraints/getConstrainedPropertySettings"

export { AppReducer }

const AppReducer = (state: AppState, action: AppAction) => {
  let newState: AppState = state

  if (typeof action === "undefined") {
    return newState
  }

  switch (action.type) {
    case "receiveSettingsFromSelectedNodes": {
      const { propertySettingsFromSelectedNodes } = action.payload

      newState = {
        ...newState,
        propertySettings: {
          ...mapValues(state.propertySettings, (propertySetting) => ({
            ...propertySetting,
            isRandomized: false,
          })),
          ...propertySettingsFromSelectedNodes,
        },
      }
      break
    }

    case "setIsRandomized": {
      const { isRandomized, propertyName } = action.payload

      const constraints = isRandomized
        ? getConstrainedPropertySettings({ propertyName })
        : {}

      newState = update(newState, {
        propertySettings: {
          [propertyName]: {
            isRandomized: {
              $set: isRandomized,
            },
          },
          ...constraints,
        },
      })
      break
    }

    case "setPreserveAspectRatio": {
      const { preserveAspectRatio, propertyName } = action.payload

      invariant(
        propertyName === "width" || propertyName === "height",
        `Property "${propertyName}" is not a valid property name`,
      )

      const currentAnchor = newState.propertySettings[propertyName].anchor!

      const oppositePropertyName =
        propertyName === "height" ? "width" : "height"

      const oppositeProperty = newState.propertySettings[oppositePropertyName]

      const constrainedAnchor = getConstrainedAnchorPosition({
        currentAnchor,
        preserveAspectRatio,
        propertyName,
      })

      const oppositePropertyPreservesAspectRatio = preserveAspectRatio
        ? false
        : !!oppositeProperty.preserveAspectRatio

      const oppositePropertyAnchor = getConstrainedAnchorPosition({
        currentAnchor: oppositeProperty.anchor!,
        preserveAspectRatio: oppositePropertyPreservesAspectRatio,
        propertyName: oppositePropertyName,
      })

      const oppositePropertyIsRandomized =
        preserveAspectRatio && oppositeProperty.isRandomized
          ? false
          : oppositeProperty.isRandomized

      newState = update(newState, {
        propertySettings: {
          [oppositePropertyName]: {
            anchor: {
              $set: oppositePropertyAnchor,
            },
            isRandomized: {
              $set: oppositePropertyIsRandomized,
            },
            preserveAspectRatio: {
              $set: oppositePropertyPreservesAspectRatio,
            },
          },
          [propertyName]: {
            anchor: {
              $set: constrainedAnchor,
            },
            preserveAspectRatio: {
              $set: preserveAspectRatio,
            },
          },
        },
      })
      break
    }

    case "setState": {
      newState = {
        ...newState,
        ...action.payload,
      }
      break
    }

    case "setStateByPath": {
      const { path, value } = action.payload

      newState = set(
        {
          ...newState,
        },
        path,
        value,
      )
      break
    }
  }

  console.log(`App action ${action.type} fired:`, {
    action,
    prevState: state,
    newState,
  })

  return newState
}
