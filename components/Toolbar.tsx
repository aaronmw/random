import { useAppContext } from '@/app/state/AppWrapper'
import { tooltips } from '@/app/tooltips'
import { Icon } from '@/components/Icon'
import { MenuButton } from '@/components/MenuButton'
import { PresetConfigModal } from '@/components/PresetConfigModal'
import { Tooltip } from '@/components/Tooltip'
import { getSettingsMenuItems } from '@/components/Toolbar/settingsMenuItems'
import { useFactoryReset } from '@/lib/hooks/useFactoryReset'
import { useLoadPresetFromNodes } from '@/lib/hooks/useLoadPresetFromNodes'
import { usePresetHandlers } from '@/lib/hooks/usePresetHandlers'
import { usePresetMenuItems } from '@/lib/hooks/usePresetMenuItems'
import { useToggleAllProperties } from '@/lib/hooks/useToggleAllProperties'
import { useEffect, useState } from 'react'
import { twJoin } from 'tailwind-merge'

export function Toolbar() {
  const {
    dispatch,
    propertySettings,
    presets,
    isGroupedByStatus,
    isGroupedByType,
    isAutoScrollEnabled,
    isLightMode,
    isAutoLoadFromSelectedNodes,
    currentUserId,
    pendingPublicPresetChanges,
  } = useAppContext()

  const [isPresetConfigModalOpen, setIsPresetConfigModalOpen] = useState(false)
  const [nameOfPresetBeingEdited, setNameOfPresetBeingEdited] = useState<
    string | null
  >(null)

  // Debug: Log context values
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const figmaUserIdFromUrl = searchParams.get('figmaUserId')
    console.log('Toolbar - currentUserId from context:', currentUserId)
    console.log('Toolbar - figmaUserIdFromUrl from hook:', figmaUserIdFromUrl)
  }, [currentUserId])

  // Debug: Log presets changes
  useEffect(() => {
    console.log('Toolbar - presets changed:', {
      count: presets.length,
      labels: presets.map((p) => ({ id: p.id, label: p.label })),
    })
  }, [presets])

  const { handleClickFactoryReset } = useFactoryReset({
    dispatch,
    currentUserId,
  })

  const {
    saveCurrentSettingsAsPreset,
    handleClickCreateNew,
    handleClickLoadPreset,
    handleClickOverwritePreset,
    handleClickToggleVisibility,
    handleClickRenamePreset,
    handleClickDeletePreset,
  } = usePresetHandlers({
    dispatch,
    propertySettings,
    presets,
    currentUserId,
    isAutoScrollEnabled,
    isGroupedByStatus,
    isGroupedByType,
    isLightMode,
    onOpenModal: () => setIsPresetConfigModalOpen(true),
    onSetPresetBeingEdited: setNameOfPresetBeingEdited,
  })

  const handleSyncPublicPresetChanges = () => {
    if (dispatch) {
      dispatch({
        type: 'applyPendingPublicPresetChanges',
      })
    }
  }

  const { presetMenuItems } = usePresetMenuItems({
    pendingPublicPresetChangesCount: pendingPublicPresetChanges.length,
    handleClickCreateNew,
    handleClickLoadPreset,
    handleClickRenamePreset,
    handleClickToggleVisibility,
    handleClickOverwritePreset,
    handleClickDeletePreset,
    handleSyncPublicPresetChanges,
  })

  const { handleClickDisableAll, hasAnyEnabled } = useToggleAllProperties({
    dispatch,
    propertySettings,
    currentUserId,
  })

  const { foundPresetId, loadPresetFromFoundId } = useLoadPresetFromNodes()

  const settingsMenuItems = getSettingsMenuItems({
    isGroupedByStatus,
    isGroupedByType,
    isAutoScrollEnabled,
    isAutoLoadFromSelectedNodes,
    dispatch,
    handleFactoryReset: handleClickFactoryReset,
    currentUserId,
  })

  async function handleSavePreset(presetName: string) {
    await saveCurrentSettingsAsPreset({
      newPresetName: presetName,
    })
    setIsPresetConfigModalOpen(false)
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
            <Icon name="bookmark" />
            <span>Presets</span>
          </MenuButton>
        </Tooltip>
        {foundPresetId && (
          <Tooltip tipContents="Load preset from selected nodes">
            <button
              className="button-icon text-text-brand"
              onClick={loadPresetFromFoundId}
            >
              <Icon name="download" />
              <span>Load from Selection</span>
            </button>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Tooltip
          tipContents={
            !hasAnyEnabled ? tooltips.disableAllDisabled : tooltips.disableAll
          }
        >
          <button
            className="button-icon"
            disabled={!hasAnyEnabled}
            onClick={handleClickDisableAll}
          >
            <Icon name="regular:toggle-large-off" />
            <span>All</span>
          </button>
        </Tooltip>

        <Tooltip tipContents="Settings">
          <MenuButton items={settingsMenuItems}>
            <Icon name="gear" />
            <span className="sr-only">Settings</span>
          </MenuButton>
        </Tooltip>
      </div>

      <PresetConfigModal
        isOpen={isPresetConfigModalOpen}
        nameOfPresetBeingEdited={nameOfPresetBeingEdited}
        onClose={() => {
          setIsPresetConfigModalOpen(false)
          setNameOfPresetBeingEdited(null)
        }}
        onPresetNameChange={setNameOfPresetBeingEdited}
        onSave={handleSavePreset}
      />
    </div>
  )
}
