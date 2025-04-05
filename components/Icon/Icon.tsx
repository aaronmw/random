'use client'

import { iconStringToVariantAndName } from '@/lib/iconStringToVariantAndName'
import { useEffect, useState } from 'react'
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
  const [mounted, setMounted] = useState(false)
  const [iconVariant = variant, iconName] = iconStringToVariantAndName(
    name === 'blank' ? 'circle-small' : name,
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR and initial client render, return a placeholder
  if (!mounted) {
    return (
      <span
        className={twMerge(`inline-block no-underline!`, className)}
        style={{ width: '1em', height: '1em' }}
        {...otherProps}
      />
    )
  }

  return (
    <span
      className={twMerge(`no-underline!`, className)}
      {...otherProps}
    >
      <i
        className={twMerge(
          `fa fa-fw fa-${iconName} `,
          typeof rotate === 'string' && `fa-${rotate}`,
          typeof rotate === 'number' && `fa-rotate-${rotate}`,
          spin && `fa-spin`,
          iconVariant && iconVariant.startsWith('sharp-')
            ? `fa-sharp fa-${iconVariant.replace('sharp-', '')} `
            : ` fa-${iconVariant} `,
          name === 'blank' && 'invisible',
        )}
        aria-hidden="true"
      />
    </span>
  )
}
