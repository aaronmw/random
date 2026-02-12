import { useAppContext } from '@/app/state/AppWrapper'
import { tooltips } from '@/app/tooltips'
import { Icon } from '@/components/Icon'
import { MenuButton } from '@/components/MenuButton'
import { LoadPresetConfirmModal } from '@/components/LoadPresetConfirmModal'
import { PresetConfigModal } from '@/components/PresetConfigModal'
import { Tooltip } from '@/components/Tooltip'
import { useSettingsMenuItems } from '@/components/Toolbar/settingsMenuItems'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import { useFactoryReset } from '@/lib/hooks/useFactoryReset'
import { useLoadPresetFromNodes } from '@/lib/hooks/useLoadPresetFromNodes'
import { usePresetHandlers } from '@/lib/hooks/usePresetHandlers'
import { usePresetMenuItems } from '@/lib/hooks/usePresetMenuItems'
import { useToggleAllProperties } from '@/lib/hooks/useToggleAllProperties'
import { useState } from 'react'
import { twJoin } from 'tailwind-merge'

export function Toolbar() {
  const { dispatch, presets, pendingPublicPresetChanges, paymentStatus, publishPresetsEnabled } =
    useAppContext()
  const showUpgrade = paymentStatus !== 'PAID' && paymentStatus !== null

  const [isPresetConfigModalOpen, setIsPresetConfigModalOpen] = useState(false)
  const [nameOfPresetBeingEdited, setNameOfPresetBeingEdited] = useState<
    string | null
  >(null)
  const [loadConfirmOpen, setLoadConfirmOpen] = useState(false)
  const [loadConfirmPresetId, setLoadConfirmPresetId] = useState<string | null>(null)

  const { handleClickFactoryReset } = useFactoryReset()

  const { handleClickDisableAll, hasAnyEnabled } = useToggleAllProperties()

  const {
    saveCurrentSettingsAsPreset,
    handleClickCreateNew,
    handleClickLoadPreset,
    executeLoadPreset,
    handleClickOverwritePreset,
    handleClickToggleVisibility,
    handleClickRenamePreset,
    handleClickDeletePreset,
  } = usePresetHandlers({
    onOpenModal: () => setIsPresetConfigModalOpen(true),
    onSetPresetBeingEdited: setNameOfPresetBeingEdited,
    onOpenLoadConfirmModal: (presetId) => {
      if (hasAnyEnabled) {
        setLoadConfirmPresetId(presetId)
        setLoadConfirmOpen(true)
      } else {
        executeLoadPreset(presetId)
      }
    },
  })

  const handleSyncPublicPresetChanges = () => {
    if (dispatch) {
      dispatch({
        type: 'applyPendingPublicPresetChanges',
      })
    }
  }

  const handleToggleUpgradedStatus = () => {
    const next = paymentStatus === 'PAID' ? 'UNPAID' : 'PAID'
    dispatchPluginAction({
      type: 'setPaymentStatusInDevelopment',
      payload: { type: next },
    })
  }

  const { presetMenuItems } = usePresetMenuItems({
    pendingPublicPresetChangesCount: pendingPublicPresetChanges.length,
    hasCurrentSettingsToSave: hasAnyEnabled,
    publishPresetsEnabled,
    handleClickCreateNew,
    handleClickLoadPreset,
    handleClickRenamePreset,
    handleClickToggleVisibility,
    handleClickOverwritePreset,
    handleClickDeletePreset,
    handleSyncPublicPresetChanges,
  })

  const { foundPresetId, loadPresetFromFoundId } = useLoadPresetFromNodes()

  const settingsMenuItems = useSettingsMenuItems({
    handleFactoryReset: handleClickFactoryReset,
    onToggleUpgradedStatus: handleToggleUpgradedStatus,
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
        {showUpgrade && (
          <Tooltip tipContents="Subscribe to randomize multiple properties">
            <button
              type="button"
              className="button-icon text-text-brand"
              onClick={() => {
                dispatchPluginAction({ type: 'upgrade' })
                setTimeout(
                  () => dispatchPluginAction({ type: 'getPaymentStatus' }),
                  3000,
                )
              }}
            >
              <Icon name="solid:circle-up" />
              <span>Upgrade</span>
            </button>
          </Tooltip>
        )}
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

      {loadConfirmPresetId && (
        <LoadPresetConfirmModal
          isOpen={loadConfirmOpen}
          onClose={() => {
            setLoadConfirmOpen(false)
            setLoadConfirmPresetId(null)
          }}
          presetId={loadConfirmPresetId}
          presetName={presets.find((p) => p.id === loadConfirmPresetId)?.label ?? 'this preset'}
          isDefaultPreset={presets.find((p) => p.id === loadConfirmPresetId)?.label === '__default__'}
          hasCurrentSettingsToSave={hasAnyEnabled}
          onConfirmLoad={async () => {
            await executeLoadPreset(loadConfirmPresetId)
          }}
          onSaveAndLoad={async (newPresetName) => {
            await saveCurrentSettingsAsPreset({ newPresetName })
            await executeLoadPreset(loadConfirmPresetId)
          }}
        />
      )}
    </div>
  )
}
