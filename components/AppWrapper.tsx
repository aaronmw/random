'use client'

import { AppContext, AppReducer, initialState } from '@/app/reducer'
import { AppHeader } from '@/components/AppHeader'
import { CrashScreen } from '@/components/CrashSreen'
import { ResizeHandle } from '@/components/ResizeHandle'
import { AppAction } from '@/lib/types'
import { useReducerWithPersistedStateKeys } from '@/lib/useReducerWithPersistedStateKeys'
import { ReactNode, Suspense, useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { twJoin } from 'tailwind-merge'

export function AppWrapper({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducerWithPersistedStateKeys({
    initialState,
    localStorageKeyName: 'plugin-state',
    persistedKeys: ['propertySettings', 'savedPropertySettings'],
    reducer: AppReducer,
  })

  useEffect(() => {
    window.onmessage = (event: {
      data: {
        pluginMessage: AppAction
      }
    }) => {
      dispatch(event.data.pluginMessage)
    }
  }, [dispatch])

  return (
    <AppContext
      value={{
        dispatch,
        state,
      }}
    >
      <div
        id="ui-container"
        className={twJoin('fixed inset-0 grid grid-rows-[min-content_auto]')}
      >
        <AppHeader />

        <ErrorBoundary fallback={<CrashScreen />}>
          <Suspense fallback={null}>{children}</Suspense>
        </ErrorBoundary>
      </div>

      <ResizeHandle />
    </AppContext>
  )
}
