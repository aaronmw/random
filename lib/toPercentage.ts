import { clamp } from "lodash"

export function toPercentage(val: string | number) {
  return clamp(parseFloat(String(val)) / 100, 0, 1)
}
