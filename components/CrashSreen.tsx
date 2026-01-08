'use client'

import { copyToClipboard } from '@/lib/copyToClipboard'
import { useEffect, useState } from 'react'

const initialButtonLabel = 'Copy Old Settings to Clipboard'

export function CrashScreen() {
  const [buttonLabel, setButtonLabel] = useState(initialButtonLabel)
  const settingsInLocalStorage = window.localStorage.getItem('plugin-state')

  async function handleClickCopyOldSettingsButton() {
    const textToCopy = JSON.stringify(settingsInLocalStorage, null, 2)

    const success = await copyToClipboard(textToCopy)

    if (success) {
      setButtonLabel('Copied!')
    } else {
      setButtonLabel('Copy Failed - Manual Copy')
      alert(`Please manually copy this text:\n\n${textToCopy}`)
    }
  }

  function resetToDefaultSettings() {
    window.localStorage.removeItem('plugin-state')
    window.location.reload()
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonLabel(initialButtonLabel)
    }, 2000)

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
          <button
            className="button-primary"
            onClick={handleClickCopyOldSettingsButton}
          >
            {buttonLabel}
          </button>
        )}

        <button
          className="button-primary"
          onClick={resetToDefaultSettings}
        >
          Reset &amp; Reload
        </button>
      </div>
    </div>
  )
}
