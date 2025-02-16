'use client'

import { useAppContext } from '@/app/reducer/AppContext'
import { Icon } from '@/components/Icon'
import { PropertyMenu } from '@/components/PropertyMenu'
import { StyledText } from '@/components/StyledText'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import { pluralize } from '@/lib/pluralize'
import { PropertyName, PropertySettings } from '@/lib/types'
import { some } from 'lodash'
import omitBy from 'lodash/omitBy'
import { ReactNode, useEffect, useRef } from 'react'
import { twJoin } from 'tailwind-merge'
import { useLocalStorage } from 'usehooks-ts'

export default function PropertiesPageLayout({
  children,
}: {
  children: ReactNode
}) {
  const { state } = useAppContext()
  const { propertySettings, selectionCount } = state
  const hasPropertiesEnabled = some(propertySettings, (p) => !p.disabled)
  const hasNodesSelected = selectionCount > 0
  const canExecute = hasPropertiesEnabled && hasNodesSelected

  const phraseIndexRef = useRef(0)
  const lastUpdateTimeRef = useRef(0)
  const [storedPhraseIndex, setStoredPhraseIndex] = useLocalStorage(
    'propertyPhraseIndex',
    0,
  )

  // Initialize ref from localStorage on mount
  useEffect(() => {
    phraseIndexRef.current = storedPhraseIndex
    lastUpdateTimeRef.current = Date.now()
  }, [])

  // Only increment if 5 seconds have passed since last update
  useEffect(() => {
    const now = Date.now()
    if (now - lastUpdateTimeRef.current >= 2000) {
      phraseIndexRef.current += 1
      setStoredPhraseIndex(phraseIndexRef.current)
      lastUpdateTimeRef.current = now
    }
  })

  async function handleClickExecute() {
    const { propertySettings } = state

    const randomizedPropertySettings = omitBy(
      propertySettings,
      'disabled',
    ) as Record<PropertyName, PropertySettings>

    dispatchPluginAction({
      type: 'execute',
      payload: {
        propertySettings: randomizedPropertySettings,
      },
    })
  }

  return (
    <div
      className={twJoin(
        'grid grid-cols-1 grid-rows-[min-content_1fr_min-content]',
        'overflow-auto',
      )}
    >
      <PropertyMenu
        id="ui-property-menu"
        className={twJoin('overflow-hidden')}
      />

      <div
        className={twJoin(
          'grid grid-rows-[min-content_auto]',
          'overflow-hidden',
        )}
      >
        {children}
      </div>

      <StyledText
        variant="button.primary"
        as="button"
        className={twJoin('w-full')}
        disabled={!canExecute}
        onClick={handleClickExecute}
      >
        {!hasNodesSelected ? (
          'Select at least one node'
        ) : !hasPropertiesEnabled ? (
          'Enable at least one property'
        ) : (
          <>
            <span>Randomize {pluralize(selectionCount, 'node')}</span>
            <Icon name="shuffle" />
          </>
        )}
      </StyledText>
    </div>
  )
}
