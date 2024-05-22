import { ComponentPropsWithoutRef, MouseEvent, useEffect } from "react"
import { createPortal } from "react-dom"
import { twJoin, twMerge } from "tailwind-merge"
import { Icon } from "./Icon"

export { ModalWindow }
export type { ModalWindowProps }

interface ModalWindowProps extends ComponentPropsWithoutRef<"div"> {
  classNamesForCloseButton?: string | string[]
  isOpen: boolean
  variant?: keyof typeof classNamesByVariant
  onClose: () => void
}

const classNames = {
  backdrop: twJoin(`
    fixed
    left-0
    top-0
    z-40
    h-full
    w-full
    bg-black/50
    backdrop-blur-[1px]
  `),

  container: ({ isOpen = false }) =>
    twMerge(
      `
        relative
        z-50
        transition-opacity
      `,
      isOpen
        ? `
            pointer-events-auto
            opacity-100
          `
        : `
            pointer-events-none
            opacity-0
          `,
    ),

  window: twJoin(
    `
      fixed
      left-1/2
      top-1/2
      z-50
      flex
      -translate-x-1/2
      -translate-y-1/2
      flex-col
      justify-stretch
    `,
  ),

  closeButton: twJoin(`
    absolute
    right-3
    top-3
  `),
}

const classNamesByVariant = {
  default: twJoin(`
    max-h-[90vh]
    min-w-60
    max-w-screen-sm
    gap-6
    overflow-auto
    border
    bg-bgColor
    p-px
  `),
}

const ModalWindow = ({
  children,
  className,
  classNamesForCloseButton,
  isOpen,
  variant = "default",
  onClose,
  ...otherProps
}: ModalWindowProps) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const activeElement = document.activeElement

      if (event.key === "Escape") {
        if (
          activeElement &&
          ["INPUT", "TEXTAREA"].includes(activeElement.tagName ?? "")
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

    document.addEventListener("keyup", handleKeyPress)

    return () => {
      document.removeEventListener("keyup", handleKeyPress)
    }
  }, [onClose])

  const handleClickClose = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    onClose()
  }

  return createPortal(
    <div
      className={twMerge(classNames.container({ isOpen }), className)}
      {...otherProps}
    >
      <div
        className={classNames.backdrop}
        onClick={onClose}
      />

      <div className={twMerge(classNames.window, classNamesByVariant[variant])}>
        <button
          className={twMerge(classNames.closeButton, classNamesForCloseButton)}
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
