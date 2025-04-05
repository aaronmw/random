import inRange from 'lodash/inRange'
import invariant from 'tiny-invariant'

export function isNumericAndInRange({
  value,
  min,
  max,
}: {
  value: string
  min: number | null
  max: number | null
}) {
  invariant(typeof min === 'number', 'Numeric type is missing `min` property')
  invariant(typeof max === 'number', 'Numeric type is missing `max` property')

  if (!`${value}`.trim().match(/^-?[0-9]+$/)) {
    return 'Not numeric'
  }

  return inRange(Number(value), min, max + 1) ? true : 'Out of Range'
}
