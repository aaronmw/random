'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  subscribe as subscribeToNetworkActivity,
  isNetworkActive,
} from '@/lib/utils/networkActivity'

interface NetworkActivityContextType {
  isActive: boolean
}

const NetworkActivityContext = createContext<NetworkActivityContextType | null>(null)

export function NetworkActivityProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    setIsActive(isNetworkActive())
    const unsubscribe = subscribeToNetworkActivity((active) => {
      setIsActive(active)
    })
    return unsubscribe
  }, [])

  return (
    <NetworkActivityContext.Provider value={{ isActive }}>
      {children}
    </NetworkActivityContext.Provider>
  )
}

export function useNetworkActivity() {
  const context = useContext(NetworkActivityContext)
  if (!context) {
    throw new Error('useNetworkActivity must be used within NetworkActivityProvider')
  }
  return context
}
