'use client'

import { Button } from '@/components/Button'
import { useEffect, useState } from 'react'

const initialButtonLabel = 'Copy Old Settings to Clipboard'

export function CrashScreen() {
  const [buttonLabel, setButtonLabel] = useState(initialButtonLabel)
  const settingsInLocalStorage = window.localStorage.getItem('plugin-state')

  function handleClickCopyOldSettingsButton() {
    navigator.clipboard.writeText(
      JSON.stringify(settingsInLocalStorage, null, 2),
    )
    setButtonLabel('Copied!')
  }

  function resetToDefaultSettings() {
    window.localStorage.removeItem('plugin-state')
    window.location.reload()
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonLabel(initialButtonLabel)
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [buttonLabel])

  return (
    <div className="flex h-full w-screen flex-col items-center justify-center space-y-5 p-20 text-center">
      <p>
        Something went wrong. Most likely, your saved plugin state does not
        conform to a recent plugin update.
      </p>
      <div className="flex gap-5">
        {settingsInLocalStorage && (
          <Button
            variant="primary"
            onClick={handleClickCopyOldSettingsButton}
          >
            {buttonLabel}
          </Button>
        )}

        <Button
          variant="primary"
          onClick={resetToDefaultSettings}
        >
          Reset &amp; Reload
        </Button>
      </div>
    </div>
  )
}
