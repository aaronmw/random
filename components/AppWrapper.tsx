'use client'

import { selectedNodePluginDataAtom } from '@/app/atoms/selectedNodePluginDataAtom'
import { CrashScreen } from '@/components/CrashSreen'
import { ResizeHandle } from '@/components/ResizeHandle'
import { PluginToAppMessage } from '@/lib/types'
import { useSetAtom } from 'jotai'
import { ReactNode, StrictMode, Suspense, useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export function AppWrapper({ children }: { children: ReactNode }) {
  const setSelectedNodePluginData = useSetAtom(selectedNodePluginDataAtom)

  useEffect(() => {
    window.onmessage = (event: {
      data: {
        pluginMessage: PluginToAppMessage
      }
    }) => {
      switch (event.data?.pluginMessage?.type) {
        case 'setSelectedNodePluginData': {
          setSelectedNodePluginData(event.data.pluginMessage.payload)
          break
        }
      }
    }
  }, [setSelectedNodePluginData])

  return (
    <StrictMode>
      <div
        id="ui-container"
        className="fixed inset-0 grid"
      >
        <ErrorBoundary fallback={<CrashScreen />}>
          <Suspense fallback={null}>{children}</Suspense>
        </ErrorBoundary>
      </div>

      <ResizeHandle />
    </StrictMode>
  )
}
