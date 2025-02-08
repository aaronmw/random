'use client'

import { Icon } from '@/components/Icon'
import { useIsClient } from '@uidotdev/usehooks'
import { ComponentPropsWithoutRef, MouseEvent, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { twJoin, twMerge } from 'tailwind-merge'

export { ModalWindow }
export type { ModalWindowProps }

type ModalWindowVariant = keyof typeof windowClassNamesByVariant

interface ModalWindowProps extends ComponentPropsWithoutRef<'div'> {
  classNamesForCloseButton?: string | string[]
  isOpen: boolean
  variant?: ModalWindowVariant
  onClose: () => void
}

const classNames = {
  backdrop: twJoin(
    `fixed top-0 left-0 z-40 h-full w-full bg-black/50 backdrop-blur-[1px]`,
  ),

  container: ({ isOpen = false }) =>
    twMerge(
      `relative z-50 transition-opacity`,
      isOpen
        ? `pointer-events-auto opacity-100`
        : `pointer-events-none opacity-0`,
    ),

  window: ({ variant = 'default' }) =>
    twMerge(
      `fixed top-1/2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col justify-stretch`,
      windowClassNamesByVariant[variant as ModalWindowVariant],
    ),

  closeButton: twJoin(`absolute top-5 right-5`),
}

const windowClassNamesByVariant = {
  default: twJoin(
    `bg-bgColor max-h-[90vh] w-[90vw] gap-9 overflow-auto border p-px`,
  ),
}

const ModalWindow = ({
  children,
  className,
  classNamesForCloseButton,
  isOpen,
  variant = 'default',
  onClose,
  ...otherProps
}: ModalWindowProps) => {
  const isClient = useIsClient()

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const activeElement = document.activeElement

      if (event.key === 'Escape') {
        if (
          activeElement &&
          ['INPUT', 'TEXTAREA'].includes(activeElement.tagName ?? '')
        ) {
          const activeInputElement = activeElement as
            | HTMLTextAreaElement
            | HTMLInputElement

          activeInputElement.blur()

          return
        }

        onClose()
      }
    }

    document.addEventListener('keyup', handleKeyPress)

    return () => {
      document.removeEventListener('keyup', handleKeyPress)
    }
  }, [onClose])

  const handleClickClose = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    onClose()
  }

  return !isClient
    ? null
    : createPortal(
        <div
          className={twMerge(classNames.container({ isOpen }), className)}
          {...otherProps}
        >
          <div
            className={classNames.backdrop}
            onClick={onClose}
          />

          <div className={twMerge(classNames.window({ variant }))}>
            <button
              className={twMerge(
                classNames.closeButton,
                classNamesForCloseButton,
              )}
            >
              <Icon
                name="xmark"
                onClick={handleClickClose}
              />
            </button>

            {children}
          </div>
        </div>,
        document.body,
      )
}
