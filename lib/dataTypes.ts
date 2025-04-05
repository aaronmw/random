import { isColor } from '@/lib/isColor'
import { isNumericAndInRange } from '@/lib/isNumericAndInRange'
import { DataTypeDescriptor } from '@/lib/types'

export const dataTypes = {
  int: {
    label: 'Signed Integer',
    min: -9999,
    max: 9999,
    validator: isNumericAndInRange,
  },
  uint: {
    label: 'Unsigned Integer',
    min: 0,
    max: 9999,
    validator: isNumericAndInRange,
  },
  uint16: {
    label: 'Unsigned Integer (16-bit)',
    min: 0,
    max: 65535,
    validator: isNumericAndInRange,
  },
  udegree: {
    label: 'Unsigned Degree',
    min: 0,
    max: 9999,
    validator: isNumericAndInRange,
  },
  degree: {
    label: 'Degree',
    min: -9999,
    max: 9999,
    validator: isNumericAndInRange,
  },
  percent: {
    label: 'Percentage',
    min: 0,
    max: 100,
    validator: isNumericAndInRange,
  },
  pointCount: {
    label: 'Point Count',
    min: 3,
    max: 100,
    validator: isNumericAndInRange,
  },
  color: {
    label: 'Color',
    min: 0,
    max: 255,
    validator: isColor,
  },
  string: {
    label: 'String',
    min: Infinity * -1,
    max: Infinity,
    validator: () => true,
  },
} satisfies Record<string, DataTypeDescriptor>
