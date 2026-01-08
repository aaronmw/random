import { useRef } from 'react'

let globalSessionId: string | null = null

function generateSessionId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export function useSessionId(): string {
  const sessionIdRef = useRef<string | null>(null)

  if (!sessionIdRef.current) {
    if (!globalSessionId) {
      globalSessionId = generateSessionId()
    }
    sessionIdRef.current = globalSessionId
  }

  return sessionIdRef.current
}
