'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function PropertiesIndexPage() {
  const router = useRouter()
  const params = useSearchParams()
  const isLightModeFromQuery = params.get('isLightMode')
  const isLightMode = isLightModeFromQuery === 'true'

  useEffect(() => {
    // Set dark class based on query string if available
    // Otherwise, the state will handle it via AppWrapper
    if (isLightModeFromQuery !== null) {
      document.querySelector('body')?.classList.toggle('dark', !isLightMode)
    }
    router.push('/properties')
  }, [isLightMode, isLightModeFromQuery, router])
}
