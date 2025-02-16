'use client'

import {
  ComponentProps,
  FocusEvent,
  MouseEvent,
  ReactNode,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { twMerge } from 'tailwind-merge'
import { useIsClient } from 'usehooks-ts'

export interface PopoverProps extends Omit<ComponentProps<'div'>, 'content'> {
  children: ReactNode
  childrenForPopover: ReactNode
  disabled?: boolean
  classNamesForPopover?: string
  triggerType?: 'hover' | 'click'
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  popoverPosition?: 'above' | 'below'
}

export function Popover({
  children,
  childrenForPopover,
  disabled,
  className,
  classNamesForPopover,
  triggerType = 'hover',
  mouseEnterDelay = 350,
  mouseLeaveDelay = 350,
  popoverPosition = 'above',
  ...otherProps
}: PopoverProps) {
  const isClient = useIsClient()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isOpen, setIsOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  if (!isClient) return null

  if (disabled) {
    return (
      <div
        className={twMerge('inline-block w-min', className)}
        {...otherProps}
      >
        {children}
      </div>
    )
  }

  function updateCoords(element: HTMLDivElement) {
    const targetCoords = element.getBoundingClientRect()
    const popoverElement = popoverRef.current

    if (!popoverElement) {
      return
    }

    const popoverWidth = popoverElement.offsetWidth
    const popoverHeight = popoverElement.offsetHeight
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let xPosition = targetCoords.x + targetCoords.width / 2

    // Ensure the popover doesn't overflow left
    const minX = popoverWidth / 2
    // Ensure the popover doesn't overflow right
    const maxX = viewportWidth - popoverWidth / 2

    xPosition = Math.max(minX, Math.min(xPosition, maxX))

    // Calculate both possible vertical positions
    const abovePosition = targetCoords.y - popoverHeight + window.scrollY
    const belowPosition = targetCoords.y + targetCoords.height + window.scrollY

    // Check if the preferred position would overflow
    let finalPosition =
      popoverPosition === 'above' ? abovePosition : belowPosition
    const relativeToViewport = finalPosition - window.scrollY

    // Flip position if it would overflow
    if (popoverPosition === 'above' && relativeToViewport < 0) {
      finalPosition = belowPosition
    } else if (
      popoverPosition === 'below' &&
      relativeToViewport + popoverHeight > viewportHeight
    ) {
      finalPosition = abovePosition
    }

    setPosition({
      x: xPosition,
      y: finalPosition,
    })
  }

  function handleMouseEnter(event: MouseEvent<HTMLDivElement>) {
    if (triggerType !== 'hover') return

    if (timer.current) {
      clearTimeout(timer.current)
    }

    updateCoords(event.currentTarget)

    timer.current = setTimeout(() => {
      setIsOpen(true)
    }, mouseEnterDelay)
  }

  function handleMouseLeave() {
    if (triggerType !== 'hover') return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setIsOpen(false)
    }, mouseLeaveDelay)
  }

  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    updateCoords(event.currentTarget)
    setIsOpen(true)
  }

  function handleBlur() {
    timer.current = setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  return (
    <div
      className={twMerge(
        'group/popover relative z-10 inline-block w-min',
        className,
      )}
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...otherProps}
    >
      {children}

      {createPortal(
        <div
          ref={popoverRef}
          className={twMerge(
            'absolute left-1/2 z-50 mt-1 -translate-x-1/2',
            'pointer-events-none opacity-0 transition-opacity',
            isOpen && 'pointer-events-auto opacity-100',
            classNamesForPopover,
          )}
          style={{
            top: position.y,
            left: position.x,
          }}
        >
          {childrenForPopover}
        </div>,
        document.body,
      )}
    </div>
  )
}
