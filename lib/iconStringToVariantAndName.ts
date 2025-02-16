import {
  IconName,
  IconString,
  IconVariant,
  RegularIconName,
} from '@/components/Icon/types'

export function iconStringToVariantAndName(
  iconString: IconString,
): [IconVariant | undefined, IconName] {
  return iconString.includes(':')
    ? (iconString.split(':') as [IconVariant, IconName])
    : [undefined, iconString as RegularIconName]
}
