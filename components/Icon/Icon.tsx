'use client'

import { iconStringToVariantAndName } from '@/lib/iconStringToVariantAndName'
import { twMerge } from 'tailwind-merge'
import { IconProps } from './types'

export function Icon({
  className,
  name,
  rotate,
  spin = false,
  variant = 'regular',
  ...otherProps
}: IconProps) {
  const [iconVariant = variant, iconName] = iconStringToVariantAndName(name)

  return (
    <span
      className={twMerge(`no-underline!`, className)}
      {...otherProps}
    >
      <i
        className={twMerge(
          `
            fa
            fa-fw
            fa-${iconName}
          `,
          typeof rotate === 'string' && `fa-${rotate}`,
          typeof rotate === 'number' && `fa-rotate-${rotate}`,
          spin && `fa-spin`,
          iconVariant && iconVariant.startsWith('sharp-')
            ? `
              fa-sharp
              fa-${iconVariant.replace('sharp-', '')}
            `
            : `
              fa-${iconVariant}
            `,
        )}
      />
    </span>
  )
}
