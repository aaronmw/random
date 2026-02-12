'use client'

import { useAppContext } from '@/app/state/AppWrapper'
import pickBy from 'lodash/pickBy'
import xor from 'lodash/xor'
import { useEffect, useRef } from 'react'

export function AutoScroller() {
  const { propertySettings, isAutoScrollEnabled } = useAppContext()
  const previouslyEnabledPropertyNamesRef = useRef<string[]>([])

  const enabledPropertySettings = pickBy(propertySettings, 'is_enabled')
  const enabledPropertyNames = Object.keys(enabledPropertySettings)

  useEffect(() => {
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
  }, [enabledPropertySettings, isAutoScrollEnabled, enabledPropertyNames])

  return null
}
