'use client'

import { Atom } from '@/components/Atom'
import { Icon } from '@/components/Icon'
import { ComponentPropsWithoutRef, MouseEvent, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { twJoin, twMerge } from 'tailwind-merge'
import { useIsClient } from 'usehooks-ts'

export { ModalWindow }
export type { ModalWindowProps }

type ModalWindowVariant = keyof typeof windowClassNamesByVariant

interface ModalWindowProps extends ComponentPropsWithoutRef<'div'> {
  classNamesForCloseButton?: string | string[]
  isOpen: boolean
  variant?: ModalWindowVariant
  onClose: () => void
}

const windowClassNamesByVariant = {
  default: twJoin('max-h-[75vh] w-[75vw]', 'p-3', 'overflow-auto'),
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
  const modalWindowContainerId = useId()

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
          id={`modal-window-container-${modalWindowContainerId}`}
          className={twMerge(
            'relative z-50 transition-opacity',
            isOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0',
            className,
          )}
          {...otherProps}
        >
          <div
            id={`modal-window-backdrop-${modalWindowContainerId}`}
            className="fixed top-0 left-0 z-40 h-full w-full bg-black/50 backdrop-blur-[1px]"
            onClick={onClose}
          />

          <div
            id={`modal-window-${modalWindowContainerId}`}
            className={twMerge(
              'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
              'flex flex-col justify-stretch',
              'bg-bg border-border rounded-2xl shadow-2xl',
              windowClassNamesByVariant[variant as ModalWindowVariant],
            )}
          >
            <Atom
              as="button"
              id={`modal-window-close-button-${modalWindowContainerId}`}
              variant="button.icon"
              className={twMerge(
                'absolute top-3 right-3',
                classNamesForCloseButton,
              )}
            >
              <Icon
                name="xmark"
                onClick={handleClickClose}
              />
            </Atom>

            {children}
          </div>
        </div>,
        document.body,
      )
}
