'use client'

import { useAppContext } from '@/app/state/AppWrapper'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import { MouseEvent, useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

export function ResizeHandle() {
  const { preferredPluginHeight } = useAppContext()
  const [storedPluginHeight, setStoredPluginHeight] = useLocalStorage<
    number | null
  >('pluginHeight', null)

  const heightToRestore = preferredPluginHeight ?? storedPluginHeight

  const [startingWindowHeight, setStartingWindowHeight] =
    useState(heightToRestore)

  const [startingClientY, setStartingClientY] = useState<number | null>(null)

  const [isResizing, setIsResizing] = useState(false)

  function handleMouseDown(event: MouseEvent) {
    setStartingWindowHeight(window.innerHeight)
    setStartingClientY(event.clientY)
    setIsResizing(true)
  }

  useEffect(() => {
    if (!heightToRestore) return

    function restore() {
      dispatchPluginAction({
        type: 'setPluginHeight',
        payload: { height: heightToRestore },
      })
    }

    restore()

    const delay = setTimeout(restore, 1000)
    return () => clearTimeout(delay)
  }, [heightToRestore])

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (!(startingWindowHeight && startingClientY)) {
        return
      }

      const deltaFromStart = event.clientY - startingClientY
      const newHeight = startingWindowHeight + deltaFromStart

      dispatchPluginAction({
        type: 'setPluginHeight',
        payload: { height: newHeight },
      })

      setStoredPluginHeight(newHeight)
    }

    function handleMouseUp() {
      setStartingWindowHeight(null)
      setStartingClientY(null)
      setIsResizing(false)
    }

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove as any)
      window.addEventListener('mouseup', handleMouseUp)
    } else {
      window.removeEventListener('mousemove', handleMouseMove as any)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, setStoredPluginHeight, startingClientY, startingWindowHeight])

  return (
    <div
      className="fixed bottom-0 left-0 h-2 w-full cursor-ns-resize"
      onMouseDown={handleMouseDown}
    />
  )
}
