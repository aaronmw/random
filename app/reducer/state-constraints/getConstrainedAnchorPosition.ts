import { AnchorPosition } from "@/lib/types"
import { xor } from "lodash"

export const anchorPositions = [
  "top-left",
  "top-center",
  "top-right",
  "center-left",
  "center-center",
  "center-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const

const anchorConstraints = {
  height: ["top-center", "center-center", "bottom-center"],

  width: ["center-left", "center-center", "center-right"],
} as const

export const getConstrainedAnchorPosition = ({
  currentAnchor,
  preserveAspectRatio,
  propertyName,
}: {
  currentAnchor: AnchorPosition
  preserveAspectRatio: boolean
  propertyName: "width" | "height"
}) => {
  const allowedAnchorPositions = anchorConstraints[propertyName]

  const disallowedAnchorPositions = xor(anchorPositions, allowedAnchorPositions)

  let constrainedAnchor = currentAnchor

  if (
    !preserveAspectRatio &&
    disallowedAnchorPositions.includes(currentAnchor)
  ) {
    constrainedAnchor = "center-center"
  }

  return constrainedAnchor
}
