"use client"

import { useIsClient } from "@uidotdev/usehooks"
import { ReactNode } from "react"

export function ClientComponent({ children }: { children: ReactNode }) {
  const isClient = useIsClient()
  return isClient ? children : null
}
