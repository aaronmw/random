import { useAppContext } from '@/app/state/AppWrapper'
import { tooltips } from '@/app/tooltips'
import { PropertySettingsRow } from '@/app/types'
import { Icon } from '@/components/Icon'
import { MenuButton } from '@/components/MenuButton'
import { MenuItemProps } from '@/components/MenuItem'
import { ModalWindow } from '@/components/ModalWindow'
import { Tooltip } from '@/components/Tooltip'
import {
  createPreset,
  loadPreset,
  getLocalPresetId,
  updatePreset,
  deletePreset,
  getOrCreateLocalPreset,
  getUserPresets,
  updatePresetVisibility,
  updatePresetLabel,
} from '@/lib/services/propertySettingsService'
import { supabaseClient } from '@/supabase/client'
import kebabCase from 'lodash/kebabCase'
import { useSearchParams } from 'next/navigation'
import { FormEvent, MouseEvent, useEffect, useRef, useState } from 'react'
import { twJoin } from 'tailwind-merge'

export function Toolbar() {
  const {
    dispatch,
    propertySettings,
    presets,
    isGroupedByStatus,
    isGroupedByType,
    isAutoScrollEnabled,
    currentUserId,
  } = useAppContext()
  const searchParams = useSearchParams()
  const figmaUserIdFromUrl = searchParams.get('figmaUserId')
  const [isPresetConfigModalOpen, setIsPresetConfigModalOpen] = useState(false)

  // Debug: Log context values
  useEffect(() => {
    console.log('Toolbar - currentUserId from context:', currentUserId)
    console.log('Toolbar - figmaUserIdFromUrl from hook:', figmaUserIdFromUrl)
  }, [currentUserId, figmaUserIdFromUrl])
  const [nameOfPresetBeingEdited, setNameOfPresetBeingEdited] = useState<
    string | null
  >(null)
  const presetNameInputRef = useRef<HTMLInputElement>(null)
  const hasSavedPresets = presets.length > 0

  // Separate presets into user's own and others' public presets
  const userPresets = presets.filter((preset) => {
    // Always filter out local preset - it's managed automatically
    if (preset.label === '__local__') {
      return false
    }
    return preset.figma_user_id === currentUserId
  })

  const publicPresets = presets.filter((preset) => {
    if (preset.label === '__local__' || preset.label === '__default__') {
      return false
    }
    return preset.figma_user_id !== currentUserId
  })

  const [presetActionsMenuOpen, setPresetActionsMenuOpen] = useState<string | null>(null)

  const presetMenuItems: MenuItemProps<'button'>[] = [
    {
      icon: 'plus',
      id: 'create-new-preset-button',
      label: 'Create New',
      onClick: handleClickCreateNew,
    },
    ...(userPresets.length > 0 || publicPresets.length > 0
      ? [
          {
            id: 'presets-divider',
            label: <div className="border-border my-1 border-t" />,
            onClick: () => {},
            disabled: true,
            className: 'pointer-events-none',
          } as MenuItemProps<'button'>,
        ]
      : []),
    ...userPresets.map((preset) => {
      const actionsMenuItems: MenuItemProps<'button'>[] = [
        {
          id: 'rename',
          icon: 'pencil',
          label: 'Rename',
          onClick: (e: MouseEvent) => {
            e.stopPropagation()
            handleClickRenamePreset(preset.label, e as any)
            setPresetActionsMenuOpen(null)
          },
        },
        {
          id: 'visibility',
          icon: preset.visibility === 'public' ? 'lock' : 'globe',
          label: preset.visibility === 'public' ? 'Make Private' : 'Make Public',
          onClick: (e: MouseEvent) => {
            e.stopPropagation()
            handleClickToggleVisibility(preset.id, preset.visibility === 'public' ? 'private' : 'public', e as any)
            setPresetActionsMenuOpen(null)
          },
        },
        {
          id: 'overwrite',
          icon: 'floppy-disk',
          label: 'Overwrite with Current',
          onClick: (e: MouseEvent) => {
            e.stopPropagation()
            handleClickOverwritePreset(preset.id, preset.label, e as any)
            setPresetActionsMenuOpen(null)
          },
        },
        {
          id: 'delete',
          icon: 'trash',
          label: 'Delete',
          onClick: (e: MouseEvent) => {
            e.stopPropagation()
            handleClickDeletePreset(preset.label, e as any)
            setPresetActionsMenuOpen(null)
          },
        },
      ]

      return {
        onClick: (e: MouseEvent) => {
          e.stopPropagation()
          if ((e.target as HTMLElement).closest('.preset-actions-menu')) {
            return // Don't load if clicking actions menu
          }
          handleClickLoadPreset(preset.id)
        },
        icon: preset.visibility === 'public' ? 'globe' : 'lock',
        id: `preset-button-${kebabCase(preset.label)}`,
        label: (
          <span className="flex w-full items-center justify-between gap-2">
            <span className="whitespace-nowrap">
              {preset.label || '(Untitled)'}
            </span>
            <span
              className="preset-actions-menu"
              onClick={(e: MouseEvent) => {
                e.stopPropagation()
                setPresetActionsMenuOpen(presetActionsMenuOpen === preset.id ? null : preset.id)
              }}
            >
              <MenuButton items={actionsMenuItems}>
                <Icon name="ellipsis-vertical" />
              </MenuButton>
            </span>
          </span>
        ),
      }
    }),
    ...publicPresets.map((preset) => ({
      onClick: (e: MouseEvent) => {
        e.stopPropagation()
        handleClickLoadPreset(preset.id)
      },
      icon: 'globe',
      id: `preset-button-${kebabCase(preset.label)}`,
      label: (
        <span className="flex w-full items-center justify-between gap-2">
          <span className="whitespace-nowrap">
            {preset.label || '(Untitled)'}
            <span className="text-text-secondary ml-2 text-xs">
              by {preset.figma_user_id.slice(0, 8)}
            </span>
          </span>
        </span>
      ),
    })),
  ]

  async function handleClickFactoryReset() {
    // Try multiple sources for the user ID
    // 1. From context (should be set from plugin init message or URL)
    // 2. From URL query params
    // 3. From useSearchParams hook
    const urlParams = new URLSearchParams(window.location.search)
    const userIdFromUrl = urlParams.get('figmaUserId')
    const userId = currentUserId || userIdFromUrl || figmaUserIdFromUrl

    console.log('Factory reset - user ID sources:', {
      currentUserId,
      figmaUserIdFromUrl,
      userIdFromUrl,
      finalUserId: userId,
      fullUrl: window.location.href,
    })

    if (!userId) {
      alert(
        'Cannot factory reset: no user ID found. Please ensure you are logged in and the plugin is running.',
      )
      console.error('Cannot factory reset: no user ID found', {
        currentUserId,
        figmaUserIdFromUrl,
        userIdFromUrl,
        url: window.location.href,
      })
      return
    }

    if (
      !confirm(
        'Are you sure you want to factory reset? This will delete your local preset and restore all settings to their default values. This action cannot be undone.',
      )
    ) {
      return
    }

    try {
      // Set loading state
      if (dispatch) {
        dispatch({
          type: 'setFactoryResetting',
          payload: { isResetting: true },
        })
      }

      // Set flag to ignore realtime events during Factory Reset (5 seconds should be enough for all operations)
      const ignoreUntil = Date.now() + 5000
      if (dispatch) {
        dispatch({
          type: 'setIgnoreRealtimeUntil',
          payload: { timestamp: ignoreUntil },
        })
      }

      // Get or create local preset (ensures it exists)
      const localPreset = await getOrCreateLocalPreset(userId)
      const localPresetId = localPreset.id

      // Get default preset and reset it to seed values if needed
      const { data: defaultPreset, error: defaultError } = await supabaseClient
        .from('presets')
        .select('*')
        .eq('figma_user_id', 'default')
        .eq('label', '__default__')
        .maybeSingle()

      if (defaultError || !defaultPreset) {
        throw new Error('Default preset not found. Please ensure seed.sql has been executed.')
      }

      // Load default preset's property settings
      let defaultSettings = await loadPreset(defaultPreset.id)

      // Check if default preset has been modified (any property enabled)
      const hasEnabledProperties = defaultSettings.some(ps => ps.is_enabled)

      if (hasEnabledProperties) {
        console.log('Default preset has been modified - resetting to seed values')
        // Reset default preset to seed values (all properties disabled)
        // First, disable all properties in the default preset
        const { error: resetError } = await supabaseClient
          .from('property_settings')
          .update({ is_enabled: false })
          .eq('preset_id', defaultPreset.id)

        if (resetError) {
          console.error('Error resetting default preset:', resetError)
        } else {
          // Reload after reset
          defaultSettings = await loadPreset(defaultPreset.id)
        }
      }

      // Verify default settings have opacity disabled
      const defaultOpacity = defaultSettings.find(ps => ps.label === 'opacity')
      console.log('Factory reset - default settings:', {
        opacityEnabled: defaultOpacity?.is_enabled,
        opacitySetting: defaultOpacity,
        totalSettings: defaultSettings.length,
        allDisabled: defaultSettings.every(ps => !ps.is_enabled),
      })

      // Update the local preset with default settings (keeps same preset ID)
      // This triggers DELETE+INSERT events, but we're ignoring realtime during this operation
      console.log('Factory reset - calling updatePreset:', {
        localPresetId,
        userId,
        defaultSettingsCount: defaultSettings.length,
      })

      try {
        await updatePreset(localPresetId, userId, defaultSettings)
        console.log('Factory reset - updatePreset completed successfully')
      } catch (updateError) {
        console.error('Factory reset - updatePreset failed:', updateError)
        throw updateError
      }

      // Small delay to ensure database commits
      console.log('Factory reset - waiting 100ms for database commits')
      await new Promise(resolve => setTimeout(resolve, 100))

      // Reload the updated preset to get fresh data
      console.log('Factory reset - reloading preset:', localPresetId)
      const propertySettings = await loadPreset(localPresetId)
      console.log('Factory reset - preset reloaded, got', propertySettings.length, 'settings')

      // Verify the loaded settings have the correct preset_id
      const opacitySetting = propertySettings.find(ps => ps.label === 'opacity')
      console.log('Factory reset - loaded local preset settings:', {
        localPresetId,
        opacityId: opacitySetting?.id,
        opacityPresetId: opacitySetting?.preset_id,
        opacityEnabled: opacitySetting?.is_enabled,
        allPresetIds: propertySettings.map(ps => ({ label: ps.label, id: ps.id, preset_id: ps.preset_id })),
      })

      // Double-check what's actually in the database
      const { data: dbOpacity, error: dbError } = await supabaseClient
        .from('property_settings')
        .select('*, presets!inner(figma_user_id)')
        .eq('preset_id', localPresetId)
        .eq('label', 'opacity')
        .maybeSingle()

      console.log('Factory reset - database check:', {
        dbOpacityEnabled: dbOpacity?.is_enabled,
        dbOpacityId: dbOpacity?.id,
        dbOpacityPresetId: dbOpacity?.preset_id,
        dbPresetFigmaUserId: (dbOpacity as any)?.presets?.figma_user_id,
        dbError,
      })
      const userPresets = await getUserPresets(userId)

      // Verify opacity is disabled (opacitySetting already defined above)
      console.log('Factory reset - loaded property settings:', {
        presetId: localPresetId,
        propertySettingsCount: propertySettings.length,
        opacityEnabled: opacitySetting?.is_enabled,
        opacityRandomizationMode: opacitySetting?.randomization_mode,
        opacityFullSetting: opacitySetting,
        allOpacitySettings: propertySettings.filter(ps => ps.label === 'opacity'),
      })

      // Verify ALL properties are disabled
      const enabledProperties = propertySettings.filter(ps => ps.is_enabled)
      console.log('Factory reset - enabled properties:', {
        count: enabledProperties.length,
        labels: enabledProperties.map(ps => ps.label),
      })

      // Update the state with the fresh data - this will update the UI immediately
      // The ignoreRealtimeUntil flag will be cleared by setInitialData
      if (dispatch) {
        console.log('Factory reset - dispatching setInitialData')
        dispatch({
          type: 'setInitialData',
          payload: {
            propertySettings,
            presets: userPresets,
            currentUserId: userId,
          },
        })
        console.log('Factory reset - setInitialData dispatched')
      } else {
        console.error('Factory reset - dispatch is null!')
      }

      console.log('Factory reset complete - UI updated via state dispatch')

      // Clear loading state
      if (dispatch) {
        dispatch({
          type: 'setFactoryResetting',
          payload: { isResetting: false },
        })
      }
    } catch (error) {
      console.error('Error during factory reset:', error)
      alert('Failed to factory reset. Please try again.')

      // Clear flags on error
      if (dispatch) {
        dispatch({
          type: 'setIgnoreRealtimeUntil',
          payload: { timestamp: 0 },
        })
        dispatch({
          type: 'setFactoryResetting',
          payload: { isResetting: false },
        })
      }
    }
  }

  const settingsMenuItems: MenuItemProps<'button'>[] = [
    {
      id: 'group-by-status-setting',
      label: (
        <span className="flex items-center gap-2">
          <span
            className={twJoin(
              'flex size-8 shrink-0 items-center justify-center',
              !isGroupedByStatus && 'opacity-0',
            )}
          >
            <Icon name="check" />
          </span>
          <span>Group by Status</span>
        </span>
      ),
      onClick: () => {
        if (dispatch) {
          dispatch({
            type: 'setStateByPath',
            payload: {
              path: 'isGroupedByStatus',
              value: !isGroupedByStatus,
            },
          })
        }
      },
    },
    {
      id: 'group-by-type-setting',
      label: (
        <span className="flex items-center gap-2">
          <span
            className={twJoin(
              'flex size-8 shrink-0 items-center justify-center',
              !isGroupedByType && 'opacity-0',
            )}
          >
            <Icon name="check" />
          </span>
          <span>Group by Type</span>
        </span>
      ),
      onClick: () => {
        if (dispatch) {
          dispatch({
            type: 'setStateByPath',
            payload: {
              path: 'isGroupedByType',
              value: !isGroupedByType,
            },
          })
        }
      },
    },
    {
      id: 'auto-scroll-setting',
      label: (
        <span className="flex items-center gap-2">
          <span
            className={twJoin(
              'flex size-8 shrink-0 items-center justify-center',
              !isAutoScrollEnabled && 'opacity-0',
            )}
          >
            <Icon name="check" />
          </span>
          <span>Auto Scroll</span>
        </span>
      ),
      onClick: () => {
        if (dispatch) {
          dispatch({
            type: 'setStateByPath',
            payload: {
              path: 'isAutoScrollEnabled',
              value: !isAutoScrollEnabled,
            },
          })
        }
      },
    },
    {
      id: 'factory-reset-setting',
      label: (
        <span className="flex items-center gap-2">
          <span
            className={twJoin(
              'flex size-8 shrink-0 items-center justify-center',
              'opacity-0',
            )}
          >
            <Icon name="check" />
          </span>
          <span>Factory Reset</span>
        </span>
      ),
      onClick: handleClickFactoryReset,
    },
  ]

  useEffect(() => {
    if (isPresetConfigModalOpen) {
      requestAnimationFrame(() => {
        presetNameInputRef.current?.focus()
      })
    }
  }, [isPresetConfigModalOpen])

  async function saveCurrentSettingsAsPreset({
    presetName,
    presetId,
    newPresetName,
  }:
    | {
        presetName?: never
        presetId?: never
        newPresetName: string
      }
    | {
        presetName: string
        presetId: string
        newPresetName?: never
      }) {
    if (!propertySettings || !currentUserId || !dispatch) return

    try {
      const propertySettingsArray = Object.values(propertySettings)
      const presetLabel = newPresetName || presetName || 'Untitled'

      if (presetId) {
        // Update existing preset
        await updatePreset(presetId, currentUserId, propertySettingsArray)
      } else {
        // Create new preset
        await createPreset(currentUserId, presetLabel, propertySettingsArray)
      }

      // Manually refresh presets list to ensure UI updates immediately
      // (realtime subscription should also handle this, but this ensures immediate update)
      const updatedPresets = await getUserPresets(currentUserId)
      dispatch({
        type: 'setPresets',
        payload: {
          presets: updatedPresets.map(p => ({
            id: p.id,
            label: p.label,
            figma_user_id: p.figma_user_id,
            visibility: p.visibility,
          })),
        },
      })

      setNameOfPresetBeingEdited(null)
      setIsPresetConfigModalOpen(false)
    } catch (error) {
      console.error('Error saving preset:', error)
    }
  }

  function handleClickCreateNew(event: MouseEvent) {
    event.stopPropagation()
    setNameOfPresetBeingEdited(null)
    setIsPresetConfigModalOpen(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.stopPropagation()

    const formData = new FormData(event.currentTarget)
    const presetName = formData.get('presetName') as string

    if (nameOfPresetBeingEdited === null) {
      saveCurrentSettingsAsPreset({
        newPresetName: presetName,
      })
    } else {
      const preset = presets.find((p) => p.label === nameOfPresetBeingEdited)
      if (preset && currentUserId) {
        try {
          await updatePresetLabel(preset.id, currentUserId, presetName)
          setIsPresetConfigModalOpen(false)
          setNameOfPresetBeingEdited(null)
        } catch (error) {
          console.error('Error renaming preset:', error)
        }
      }
    }

    event.currentTarget.reset()
  }

  async function handleClickLoadPreset(presetId: string) {
    if (!currentUserId || !dispatch) return

    // Find preset name for confirmation message
    const preset = presets.find((p) => p.id === presetId)
    const presetName = preset?.label || 'this preset'

    // Ask for confirmation before loading
    if (
      !confirm(
        `Are you sure you want to load "${presetName}"? This will overwrite your current settings. ` +
          `If you want to preserve your current settings, save them as a new preset first.`,
      )
    ) {
      return
    }

    // Set loading state
    dispatch({
      type: 'setPresetLoading',
      payload: { isLoading: true },
    })

    try {
      // Load preset from database
      const presetPropertySettings = await loadPreset(presetId)

      // Update local preset with loaded settings FIRST (before updating state)
      // This ensures the database has the correct data before we update the UI
      const localPresetId = await getLocalPresetId(currentUserId)
      if (!localPresetId) {
        console.error('Local preset ID not found')
        return
      }

      // Update local preset to match loaded preset
      await updatePreset(
        localPresetId,
        currentUserId,
        presetPropertySettings,
      )

      // Small delay to ensure database commits
      await new Promise(resolve => setTimeout(resolve, 100))

      // Reload the updated local preset to get the correct IDs
      const updatedPropertySettings = await loadPreset(localPresetId)

      // Dispatch action to load preset with the updated settings (which have correct IDs)
      dispatch({
        type: 'loadPreset',
        payload: {
          presetPropertySettings: updatedPropertySettings,
        },
      })
    } catch (error) {
      console.error('Error loading preset:', error)
    } finally {
      // Clear loading state
      dispatch({
        type: 'setPresetLoading',
        payload: { isLoading: false },
      })
    }
  }

  async function handleClickOverwritePreset(
    presetId: string,
    presetName: string,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation()

    if (!confirm(`Are you sure you want to overwrite "${presetName}" with your current settings?`)) {
      return
    }

    if (!propertySettings || !currentUserId || !dispatch) return

    try {
      const propertySettingsArray = Object.values(propertySettings)
      await updatePreset(presetId, currentUserId, propertySettingsArray)

      // Manually refresh presets list to ensure UI updates immediately
      const updatedPresets = await getUserPresets(currentUserId)
      dispatch({
        type: 'setPresets',
        payload: {
          presets: updatedPresets.map(p => ({
            id: p.id,
            label: p.label,
            figma_user_id: p.figma_user_id,
            visibility: p.visibility,
          })),
        },
      })
    } catch (error) {
      console.error('Error overwriting preset:', error)
    }
  }

  async function handleClickToggleVisibility(
    presetId: string,
    newVisibility: 'private' | 'public',
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation()

    if (!currentUserId) return

    try {
      await updatePresetVisibility(presetId, currentUserId, newVisibility)
    } catch (error) {
      console.error('Error updating preset visibility:', error)
    }
  }

  function handleClickRenamePreset(
    presetName: string,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation()
    const preset = presets.find((p) => p.label === presetName)
    if (!preset) return

    setNameOfPresetBeingEdited(presetName)
    setIsPresetConfigModalOpen(true)

    if (!presetNameInputRef.current) return

    presetNameInputRef.current.value = presetName
  }

  async function handleClickDeletePreset(
    presetName: string,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation()

    if (!confirm('Are you sure you want to delete this preset?')) {
      return
    }

    try {
      const preset = presets.find((p) => p.label === presetName)
      if (preset) {
        await deletePreset(preset.id)
      }
    } catch (error) {
      console.error('Error deleting preset:', error)
    }
  }

  function handleClickDisableAll() {
    // TODO: Implement disable all properties
    console.log('Disabling all properties')
  }

  function handleClickEnableAll() {
    // TODO: Implement enable all properties
    console.log('Enabling all properties')
  }

  return (
    <div
      className={twJoin(
        'bg-bg border-border flex items-center justify-between border-b px-3 py-2',
        'sticky top-0 z-10',
      )}
    >
      <div className="flex items-center gap-2">
        <Tooltip tipContents={tooltips.loadPreset}>
          <MenuButton items={presetMenuItems}>
            <Icon name="folder-open" />
            <span>Presets</span>
          </MenuButton>
        </Tooltip>

        <div className="border-border h-4 w-px border-r" />

        <Tooltip tipContents={tooltips.disableAll}>
          <button
            className="button-icon"
            onClick={handleClickDisableAll}
          >
            <Icon name="eye-slash" />
            <span className="sr-only">Disable All</span>
          </button>
        </Tooltip>

        <Tooltip tipContents={tooltips.enableAll}>
          <button
            className="button-icon"
            onClick={handleClickEnableAll}
          >
            <Icon name="eye" />
            <span className="sr-only">Enable All</span>
          </button>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip tipContents="Settings">
          <MenuButton items={settingsMenuItems}>
            <Icon name="gear" />
            <span className="sr-only">Settings</span>
          </MenuButton>
        </Tooltip>
      </div>

      <ModalWindow
        isOpen={isPresetConfigModalOpen}
        onClose={() => {
          setIsPresetConfigModalOpen(false)
          setNameOfPresetBeingEdited(null)
        }}
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
                className="input"
                id="presetName"
                name="presetName"
                ref={presetNameInputRef}
                required
                type="text"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="button-secondary"
                onClick={() => {
                  setIsPresetConfigModalOpen(false)
                  setNameOfPresetBeingEdited(null)
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
    </div>
  )
}
