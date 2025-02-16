'use client'

import { AppAction, AppState } from '@/lib/types'
import { Dispatch, createContext, useContext } from 'react'
import { initialState } from './initialState'

export { AppContext }
export type { AppContextObject }

interface AppContextObject {
  dispatch: Dispatch<AppAction>
  state: AppState
}

const AppContext = createContext<AppContextObject>({
  dispatch: () => {},
  state: initialState,
})

export function useAppContext() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useAppContext must be used within an AppContext')
  }

  return context
}
