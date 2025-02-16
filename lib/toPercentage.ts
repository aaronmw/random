import clamp from 'lodash/clamp'

export function toPercentage(val: string | number) {
  return clamp(parseFloat(String(val)) / 100, 0, 1)
}
