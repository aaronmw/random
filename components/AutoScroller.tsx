'use client'

import { enabledPropertySettingsAtom } from '@/app/atoms/enabledPropertySettingsAtom'
import { isAutoScrollEnabledAtom } from '@/app/atoms/isAutoScrollEnabledAtom'
import { useAtomValue } from 'jotai'
import xor from 'lodash/xor'
import { useEffect, useRef } from 'react'

export function AutoScroller() {
  const isAutoScrollEnabled = useAtomValue(isAutoScrollEnabledAtom)
  const enabledPropertySettings = useAtomValue(enabledPropertySettingsAtom)
  const previouslyEnabledPropertyNamesRef = useRef<string[]>([])

  useEffect(() => {
    const enabledPropertyNames = Object.keys(enabledPropertySettings)

    const previouslyEnabledPropertyNames =
      previouslyEnabledPropertyNamesRef.current

    const diff = xor(previouslyEnabledPropertyNames, enabledPropertyNames)

    previouslyEnabledPropertyNamesRef.current = [...enabledPropertyNames]

    if (diff.length === 1) {
      const newPropertyName = diff[0]
      const isNewPropertyEnabled = newPropertyName in enabledPropertySettings
      const newPropertyPanelId = `${newPropertyName}-config-panel`
      const newPropertyPanel = document.getElementById(newPropertyPanelId)

      if (isAutoScrollEnabled && newPropertyPanel && isNewPropertyEnabled) {
        const timer = setTimeout(() => {
          newPropertyPanel.focus({ preventScroll: true })
          newPropertyPanel.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }, 150)

        return () => clearTimeout(timer)
      }
    }
  }, [enabledPropertySettings, isAutoScrollEnabled])

  return null
}
