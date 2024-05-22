"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function PropertiesIndexPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const router = useRouter()

  const params = useSearchParams()

  useEffect(() => {
    const isLightMode = params.get("isLightMode") === "true"

    if (!isLightMode) {
      document.body.classList.add("dark")
    }

    router.push(`properties/text`)
  }, [params, router])
}
