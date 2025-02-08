'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function PropertiesIndexPage() {
  const router = useRouter()
  const params = useSearchParams()
  const isLightMode = params.get('isLightMode') === 'true'

  useEffect(() => {
    document.querySelector('html')?.classList.toggle('dark', !isLightMode)
    router.push(`properties`)
  }, [isLightMode, router])
}
