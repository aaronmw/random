import { useAppContext } from '@/app/state/AppWrapper'
import { tooltips } from '@/app/tooltips'
import { PropertySettingsRow } from '@/app/types'
import { Atom } from '@/components/Atom'
import { Icon } from '@/components/Icon'
import { MenuButton } from '@/components/MenuButton'
import { MenuItemProps } from '@/components/MenuItem'
import { ModalWindow } from '@/components/ModalWindow'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import { createPreset } from '@/lib/services/propertySettingsService'
import kebabCase from 'lodash/kebabCase'
import pickBy from 'lodash/pickBy'
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
  const [isPresetConfigModalOpen, setIsPresetConfigModalOpen] = useState(false)
  const [nameOfPresetBeingEdited, setNameOfPresetBeingEdited] = useState<
    string | null
  >(null)
  const presetNameInputRef = useRef<HTMLInputElement>(null)
  const enabledPropertySettings = pickBy(propertySettings, 'is_enabled')
  const hasEnabledProperties = Object.keys(enabledPropertySettings).length > 0
  const hasSavedPresets = presets.length > 0

  const savePresetMenuItems: MenuItemProps<'button'>[] = [
    {
      icon: 'plus',
      id: 'create-new-preset-button',
      label: 'Create New',
      onClick: handleClickCreateNew,
    },
    ...(presets.map(([presetName]) => ({
      onClick: handleClickResavePreset.bind(null, presetName),
      icon: 'file',
      id: `save-preset-button-${kebabCase(presetName)}`,
      label: presetName || '(Untitled)',
    })) as MenuItemProps<'button'>[]),
  ]

  const presetMenuItems: MenuItemProps<'button'>[] = presets.map(
    ([presetName, partialPropertySettings]) => ({
      onClick: handleClickLoadPreset.bind(null, partialPropertySettings),
      icon: 'file',
      id: `load-preset-button-${kebabCase(presetName)}`,
      label: (
        <span className="flex w-full items-center justify-between gap-2">
          <span className="whitespace-nowrap">
            {presetName || '(Untitled)'}
          </span>
          <span className="flex items-center">
            {(
              [
                {
                  id: 'rename',
                  icon: 'pencil',
                  label: 'Rename',
                  onClick: handleClickRenamePreset,
                },
                {
                  id: 'delete',
                  icon: 'trash',
                  label: 'Delete',
                  onClick: handleClickDeletePreset,
                },
              ] as const
            ).map(({ id, icon, onClick, label }) => (
              <Atom
                variant="button.icon"
                as="span"
                id={`${id}-preset-button-${kebabCase(presetName)}`}
                key={id}
                tooltip={label}
                onClick={onClick.bind(null, presetName)}
              >
                <Icon name={icon} />
                <span className="sr-only">{label}</span>
              </Atom>
            ))}
          </span>
        </span>
      ),
    }),
  )

  useEffect(() => {
    if (isPresetConfigModalOpen) {
      requestAnimationFrame(() => {
        presetNameInputRef.current?.focus()
      })
    }
  }, [isPresetConfigModalOpen])

  async function saveCurrentSettingsAsPreset({
    presetName,
    newPresetName,
  }:
    | {
        presetName?: never
        newPresetName: string
      }
    | {
        presetName: string
        newPresetName?: never
      }) {
    if (!propertySettings || !currentUserId) return

    try {
      const propertySettingsArray = Object.values(propertySettings)
      const presetLabel = newPresetName || presetName || 'Untitled'

      await createPreset(currentUserId, presetLabel, propertySettingsArray)

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.stopPropagation()

    const formData = new FormData(event.currentTarget)
    const presetName = formData.get('presetName') as string

    if (nameOfPresetBeingEdited === null) {
      saveCurrentSettingsAsPreset({
        newPresetName: presetName,
      })
    } else {
      saveCurrentSettingsAsPreset({
        presetName: presetName,
      })
    }

    setIsPresetConfigModalOpen(false)
    setNameOfPresetBeingEdited(null)

    event.currentTarget.reset()
  }

  async function handleClickLoadPreset(
    partialPropertySettings: Partial<PropertySettingsRow>,
  ) {
    // TODO: Implement loading preset from database
    console.log('Loading preset:', partialPropertySettings)
  }

  function handleClickResavePreset(
    presetName: string,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation()

    if (!confirm('Are you sure you want to overwrite this preset?')) {
      return
    }

    saveCurrentSettingsAsPreset({ presetName })
  }

  function handleClickRenamePreset(
    presetName: string,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation()
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
      const preset = presets.find(([name]) => name === presetName)
      if (preset) {
        // TODO: Get preset ID and delete from database
        console.log('Deleting preset:', presetName)
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

  function handleClickExecute() {
    if (!hasEnabledProperties) {
      return
    }

    dispatchPluginAction({
      type: 'execute',
      payload: {
        propertySettings: enabledPropertySettings,
      },
    })
  }

  return (
    <div
      className={twJoin(
        'bg-bg border-border flex items-center justify-between border-b px-3 py-2',
        'sticky top-0 z-10',
      )}
    >
      <div className="flex items-center gap-2">
        <MenuButton
          items={savePresetMenuItems}
          tooltip={tooltips.savePreset}
        >
          <Icon name="floppy-disk" />
          <span>Save</span>
        </MenuButton>

        <MenuButton
          items={presetMenuItems}
          tooltip={tooltips.loadPreset}
        >
          <Icon name="folder-open" />
          <span>Load</span>
        </MenuButton>

        <div className="border-border h-4 w-px border-r" />

        <Atom
          variant="button.icon"
          tooltip={tooltips.disableAll}
          onClick={handleClickDisableAll}
        >
          <Icon name="eye-slash" />
          <span className="sr-only">Disable All</span>
        </Atom>

        <Atom
          variant="button.icon"
          tooltip={tooltips.enableAll}
          onClick={handleClickEnableAll}
        >
          <Icon name="eye" />
          <span className="sr-only">Enable All</span>
        </Atom>
      </div>

      <div className="flex items-center gap-2">
        <Atom
          variant="button.icon"
          tooltip={tooltips.groupByStatus}
          onClick={() => {
            if (dispatch) {
              dispatch({
                type: 'setStateByPath',
                payload: {
                  path: 'isGroupedByStatus',
                  value: !isGroupedByStatus,
                },
              })
            }
          }}
        >
          <Icon name={isGroupedByStatus ? 'solid:list' : 'regular:list'} />
          <span className="sr-only">Group by Status</span>
        </Atom>

        <Atom
          variant="button.icon"
          tooltip={tooltips.groupByType}
          onClick={() => {
            if (dispatch) {
              dispatch({
                type: 'setStateByPath',
                payload: {
                  path: 'isGroupedByType',
                  value: !isGroupedByType,
                },
              })
            }
          }}
        >
          <Icon name={isGroupedByType ? 'solid:folder' : 'regular:folder'} />
          <span className="sr-only">Group by Type</span>
        </Atom>

        <Atom
          variant="button.icon"
          tooltip={tooltips.autoScroll}
          onClick={() => {
            if (dispatch) {
              dispatch({
                type: 'setStateByPath',
                payload: {
                  path: 'isAutoScrollEnabled',
                  value: !isAutoScrollEnabled,
                },
              })
            }
          }}
        >
          <Icon
            name={
              isAutoScrollEnabled
                ? 'solid:arrow-down-to-line'
                : 'regular:arrow-down-to-line'
            }
          />
          <span className="sr-only">Auto Scroll</span>
        </Atom>

        <div className="border-border h-4 w-px border-r" />

        <Atom
          variant="button.primary"
          disabled={!hasEnabledProperties}
          tooltip={tooltips.execute}
          onClick={handleClickExecute}
        >
          <Icon name="play" />
          <span>Execute</span>
        </Atom>
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
              <Atom
                as="label"
                variant="label"
                htmlFor="presetName"
              >
                Preset Name
              </Atom>
              <Atom
                as="input"
                variant="input"
                id="presetName"
                name="presetName"
                ref={presetNameInputRef}
                required
                type="text"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Atom
                variant="button.secondary"
                onClick={() => {
                  setIsPresetConfigModalOpen(false)
                  setNameOfPresetBeingEdited(null)
                }}
              >
                Cancel
              </Atom>
              <Atom
                as="button"
                variant="button.primary"
                type="submit"
              >
                {nameOfPresetBeingEdited === null ? 'Create' : 'Rename'}
              </Atom>
            </div>
          </div>
        </form>
      </ModalWindow>
    </div>
  )
}
