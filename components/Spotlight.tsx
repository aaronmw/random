import { Icon } from '@/components/Icon'
import { StyledText } from '@/components/StyledText'
import { useEffect, useState } from 'react'
import { twJoin } from 'tailwind-merge'
import { useLocalStorage } from 'usehooks-ts'

export function Spotlight({
  targetSelector,
  isSpotlighting = false,
  borderRadius = 8,
  classNamesForBackdrop = 'fill-black/80',
  classNamesForSpotlight = 'stroke-2 stroke-border-brand-strong',
  message,
  id,
}: {
  targetSelector: string
  isSpotlighting?: boolean
  borderRadius?: number
  classNamesForBackdrop?: string
  classNamesForSpotlight?: string
  message: string
  id: string
}) {
  const [maskDimensions, setMaskDimensions] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  const [isDismissed, setIsDismissed] = useLocalStorage(
    `spotlight-${id}`,
    false,
  )

  useEffect(() => {
    if (isSpotlighting) {
      const target = document.querySelector(targetSelector)
      if (target) {
        const rect = target.getBoundingClientRect()
        setMaskDimensions({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        })
      }
    }
  }, [isSpotlighting, targetSelector])

  if (!isSpotlighting || isDismissed) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <svg className="h-full w-full">
        <defs>
          <mask id="spotlight-mask">
            <rect
              width="100%"
              height="100%"
              fill="white"
            />
            <rect
              x={maskDimensions.x}
              y={maskDimensions.y}
              width={maskDimensions.width}
              height={maskDimensions.height}
              rx={borderRadius}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          mask="url(#spotlight-mask)"
          className={classNamesForBackdrop}
        />
        {classNamesForSpotlight && (
          <rect
            x={maskDimensions.x}
            y={maskDimensions.y}
            width={maskDimensions.width}
            height={maskDimensions.height}
            rx={borderRadius}
            fill="none"
            className={classNamesForSpotlight}
          />
        )}
      </svg>

      <div
        className={twJoin(
          'absolute p-2 pl-4 whitespace-nowrap',
          'bg-bg-brand text-text-onbrand rounded-2xl',
          'flex items-center gap-1',
        )}
        style={{
          top: maskDimensions.y + maskDimensions.height + 8,
          left: maskDimensions.x + maskDimensions.width / 2,
          transform: 'translateX(-50%)',
          pointerEvents: 'auto',
        }}
      >
        <span>{message}</span>

        <StyledText
          variant="button.icon"
          as="button"
          aria-label="Dismiss message"
          onClick={() => setIsDismissed(true)}
        >
          <Icon name="xmark" />
          <span className="sr-only">Dismiss message</span>
        </StyledText>
      </div>
    </div>
  )
}
