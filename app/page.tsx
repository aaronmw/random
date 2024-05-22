"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PropertiesIndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.push(`properties/text`)
  }, [router])
}
