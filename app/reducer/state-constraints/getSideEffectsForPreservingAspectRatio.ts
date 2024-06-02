import { AppState, PropertyName } from "@/lib/types"
import invariant from "tiny-invariant"
import { getConstrainedAnchorPosition } from "./getConstrainedAnchorPosition"

export function getSideEffectsForPreservingAspectRatio({
  preserveAspectRatio,
  propertyName,
  state,
}: {
  preserveAspectRatio: boolean
  propertyName: PropertyName
  state: AppState
}) {
  invariant(
    propertyName === "width" || propertyName === "height",
    `Property "${propertyName}" is not a valid property name`,
  )

  const propertySettings = state.propertySettings[propertyName]
  const { anchor } = propertySettings
  const oppositePropertyName = propertyName === "height" ? "width" : "height"
  const oppositePropertySettings = state.propertySettings[oppositePropertyName]

  invariant(anchor, `Property "${propertyName}" is missing "anchor" property`)
  invariant(
    oppositePropertySettings.anchor,
    `Property "${oppositePropertyName}" is missing "anchor" property`,
  )
  invariant(
    typeof propertySettings.preserveAspectRatio === "boolean",
    `Property "${propertyName}" is missing "preserveAspectRatio" property`,
  )
  invariant(
    typeof oppositePropertySettings.preserveAspectRatio === "boolean",
    `Property "${oppositePropertyName}" is missing "preserveAspectRatio" property`,
  )

  const constrainedAnchor = getConstrainedAnchorPosition({
    anchor,
    preserveAspectRatio,
    propertyName,
  })

  // No matter what, if this property is being randomized
  // at all, the opposite cannot preserve aspect ratio
  const newOppositePropertyPreserveAspectRatio = false
  const newOppositePropertyAnchor = getConstrainedAnchorPosition({
    anchor: oppositePropertySettings.anchor,
    preserveAspectRatio: newOppositePropertyPreserveAspectRatio,
    propertyName: oppositePropertyName,
  })
  const newOppositePropertyMode =
    preserveAspectRatio && oppositePropertySettings.mode !== "disabled"
      ? "disabled"
      : oppositePropertySettings.mode

  return {
    [oppositePropertyName]: {
      anchor: {
        $set: newOppositePropertyAnchor,
      },
      mode: {
        $set: newOppositePropertyMode,
      },
      preserveAspectRatio: {
        $set: newOppositePropertyPreserveAspectRatio,
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
  }
}
