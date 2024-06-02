import { AppState, PropertyName } from "@/lib/types"
import { mutualExclusivityMap } from "./mutualExclusivityMap"

export function getSideEffectsForEnablingRandomization({
  propertyName,
  state,
}: {
  propertyName: PropertyName
  state: AppState
}) {
  const mutuallyExclusiveConstraints =
    mutualExclusivityMap[propertyName]?.reduce(
      (acc, propertyNameToStopRandomizing) => {
        return {
          ...acc,
          [propertyNameToStopRandomizing]: {
            mode: {
              $set: "disabled",
            },
          },
        }
      },
      {},
    ) ?? {}

  let widthAndHeightConstraints = {}

  if (propertyName === "height" || propertyName === "width") {
    const oppositePropertyName = propertyName === "height" ? "width" : "height"

    const oppositePropertySettings =
      state.propertySettings[oppositePropertyName]

    widthAndHeightConstraints =
      oppositePropertySettings.mode !== "disabled" &&
      oppositePropertySettings.preserveAspectRatio
        ? {
            [oppositePropertyName]: {
              preserveAspectRatio: { $set: false },
            },
          }
        : {}
  }

  return {
    ...mutuallyExclusiveConstraints,
    ...widthAndHeightConstraints,
  }
}
