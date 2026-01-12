import { useAppContext } from '@/app/state/AppWrapper'
import { ModalWindow } from '@/components/ModalWindow'
import {
  getUserPresets,
  updatePresetLabel,
} from '@/lib/services/propertySettingsService'
import { FormEvent, KeyboardEvent, useEffect, useRef } from 'react'

type PresetConfigModalProps = {
  isOpen: boolean
  nameOfPresetBeingEdited: string | null
  onClose: () => void
  onPresetNameChange: (name: string | null) => void
  onSave: (presetName: string) => Promise<void>
}

export function PresetConfigModal({
  isOpen,
  nameOfPresetBeingEdited,
  onClose,
  onPresetNameChange,
  onSave,
}: PresetConfigModalProps) {
  const { dispatch, presets, currentUserId } = useAppContext()
  const presetNameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        presetNameInputRef.current?.focus()
        if (nameOfPresetBeingEdited && presetNameInputRef.current) {
          presetNameInputRef.current.value = nameOfPresetBeingEdited
        }
      })
    }
  }, [isOpen, nameOfPresetBeingEdited])

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      const form = event.currentTarget.closest('form')
      if (form) {
        form.requestSubmit()
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.stopPropagation()

    const formData = new FormData(event.currentTarget)
    const presetName = formData.get('presetName') as string
    const form = event.currentTarget

    // Check if we're renaming an existing preset
    if (nameOfPresetBeingEdited !== null) {
      const preset = presets.find((p) => p.label === nameOfPresetBeingEdited)
      if (!preset) {
        console.error('Preset not found for renaming:', nameOfPresetBeingEdited)
        return
      }
      if (!currentUserId || !dispatch) {
        console.error('Missing currentUserId or dispatch')
        return
      }

      // Don't do anything if the name hasn't changed
      if (presetName === nameOfPresetBeingEdited) {
        form.reset()
        onClose()
        onPresetNameChange(null)
        return
      }

      try {
        // Update preset label
        await updatePresetLabel(preset.id, currentUserId, presetName)

        // Fallback: Refresh presets after a short delay if realtime doesn't update
        // This ensures the UI updates even if realtime events are delayed or not received
        setTimeout(async () => {
          if (currentUserId && dispatch) {
            const updatedPresets = await getUserPresets(currentUserId)
            dispatch({
              type: 'setPresets',
              payload: {
                presets: updatedPresets.map((p) => ({
                  id: p.id,
                  label: p.label,
                  figma_user_id: p.figma_user_id,
                  visibility: (p as any).visibility || 'private',
                })),
              },
            })
          }
        }, 500) // 500ms delay to give realtime a chance to update first

        form.reset()
        onClose()
        onPresetNameChange(null)
        return
      } catch (error) {
        console.error('Error renaming preset:', error)
        return
      }
    }

    // Creating a new preset (only reached if nameOfPresetBeingEdited is null)
    await onSave(presetName)
    form.reset()
  }

  return (
    <ModalWindow
      isOpen={isOpen}
      onClose={onClose}
      title={
        nameOfPresetBeingEdited === null
          ? 'Create New Preset'
          : 'Rename Preset'
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              className="label"
              htmlFor="presetName"
            >
              Preset Name
            </label>
            <input
              key={nameOfPresetBeingEdited || 'new'}
              className="input"
              id="presetName"
              name="presetName"
              ref={presetNameInputRef}
              defaultValue={nameOfPresetBeingEdited || ''}
              onKeyDown={handleKeyDown}
              required
              type="text"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="button-secondary"
              onClick={() => {
                onClose()
                onPresetNameChange(null)
              }}
            >
              Cancel
            </button>
            <button
              className="button-primary"
              type="submit"
            >
              {nameOfPresetBeingEdited === null ? 'Create' : 'Rename'}
            </button>
          </div>
        </div>
      </form>
    </ModalWindow>
  )
}
