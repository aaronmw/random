'use client'

import { ModalWindow } from '@/components/ModalWindow'
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'

type LoadPresetConfirmModalProps = {
  isOpen: boolean
  onClose: () => void
  presetId: string
  presetName: string
  isDefaultPreset: boolean
  hasCurrentSettingsToSave: boolean
  onConfirmLoad: () => Promise<void>
  onSaveAndLoad: (newPresetName: string) => Promise<void>
}

export function LoadPresetConfirmModal({
  isOpen,
  onClose,
  presetName,
  isDefaultPreset,
  hasCurrentSettingsToSave,
  onConfirmLoad,
  onSaveAndLoad,
}: LoadPresetConfirmModalProps) {
  const [step, setStep] = useState<'confirm' | 'saveAndLoad'>('confirm')
  const [isLoading, setIsLoading] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveNameError, setSaveNameError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setStep('confirm')
      setSaveName('')
      setSaveNameError(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && step === 'saveAndLoad') {
      requestAnimationFrame(() => nameInputRef.current?.focus())
    }
  }, [isOpen, step])

  const handleLoad = async () => {
    setIsLoading(true)
    try {
      await onConfirmLoad()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndLoadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = saveName.trim()
    if (!trimmed) {
      setSaveNameError('Enter a preset name')
      return
    }
    setSaveNameError(null)
    setIsLoading(true)
    try {
      await onSaveAndLoad(trimmed)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && step === 'saveAndLoad') {
      event.preventDefault()
      setStep('confirm')
      setSaveName('')
      setSaveNameError(null)
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const form = event.currentTarget.closest('form')
      if (form) form.requestSubmit()
    }
  }

  const title = isDefaultPreset ? 'Factory reset?' : 'Load preset?'
  const confirmBody = isDefaultPreset
    ? 'This will restore all settings to their default values and overwrite your current settings. This action cannot be undone.'
    : hasCurrentSettingsToSave
      ? `Load "${presetName}"? This will overwrite your current settings. You can save your current settings first with Save + Load.`
      : `Load "${presetName}"? This will overwrite your current settings.`

  return (
    <ModalWindow
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-text text-lg font-medium">{title}</h2>

        {step === 'confirm' ? (
          <>
            <p className="text-text-secondary text-sm">{confirmBody}</p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="button-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={handleLoad}
                disabled={isLoading}
              >
                {isLoading ? 'Loading…' : 'Load'}
              </button>
              {hasCurrentSettingsToSave && (
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => setStep('saveAndLoad')}
                  disabled={isLoading}
                >
                  Save + Load
                </button>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSaveAndLoadSubmit}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  className="label"
                  htmlFor="load-confirm-preset-name"
                >
                  Preset name
                </label>
                <input
                  ref={nameInputRef}
                  id="load-confirm-preset-name"
                  name="presetName"
                  className="input"
                  type="text"
                  value={saveName}
                  onChange={(e) => {
                    setSaveName(e.target.value)
                    setSaveNameError(null)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Name for current settings"
                  aria-invalid={!!saveNameError}
                  aria-describedby={
                    saveNameError ? 'load-confirm-name-error' : undefined
                  }
                />
                {saveNameError && (
                  <p
                    id="load-confirm-name-error"
                    className="text-text-danger text-sm"
                  >
                    {saveNameError}
                  </p>
                )}
              </div>
              <p className="text-text-secondary text-sm">
                Save current settings as this preset, then load the selected
                preset.
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => {
                    setStep('confirm')
                    setSaveName('')
                    setSaveNameError(null)
                  }}
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="button-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving…' : 'Save & load'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </ModalWindow>
  )
}
