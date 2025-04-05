import { enabledPropertySettingsAtom } from '@/app/atoms/enabledPropertySettingsAtom'
import { isAutoScrollEnabledAtom } from '@/app/atoms/isAutoScrollEnabledAtom'
import { isGroupedByStatusAtom } from '@/app/atoms/isGroupedByStatusAtom'
import { isGroupedByTypeAtom } from '@/app/atoms/isGroupedByTypeAtom'
import { loadPartialPropertySettingsAtom } from '@/app/atoms/loadPartialPropertySettingsAtom'
import { presetsAtom } from '@/app/atoms/presetsAtom'
import { tooltips } from '@/app/tooltips'
import { Atom } from '@/components/Atom'
import { Icon } from '@/components/Icon'
import { MenuButton } from '@/components/MenuButton'
import { MenuItemProps } from '@/components/MenuItem'
import { ModalWindow } from '@/components/ModalWindow'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import { PropertySettingsObject } from '@/lib/types'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import kebabCase from 'lodash/kebabCase'
import omit from 'lodash/omit'
import {
  FocusEvent,
  FormEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { twJoin } from 'tailwind-merge'

export function Toolbar() {
  const loadPartialPropertySettings = useSetAtom(
    loadPartialPropertySettingsAtom,
  )
  const [isGroupedByType, setisGroupedByType] = useAtom(isGroupedByTypeAtom)
  const [isGroupedByStatus, setisGroupedByStatus] = useAtom(
    isGroupedByStatusAtom,
  )
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useAtom(
    isAutoScrollEnabledAtom,
  )
  const [presets, setPresets] = useAtom(presetsAtom)
  const enabledPropertySettings = useAtomValue(enabledPropertySettingsAtom)
  const [isPresetConfigModalOpen, setIsPresetConfigModalOpen] = useState(false)
  const [nameOfPresetBeingEdited, setNameOfPresetBeingEdited] = useState<
    string | null
  >(null)
  const presetNameInputRef = useRef<HTMLInputElement>(null)
  const presetsAsEntries = Object.entries(presets)
  const hasEnabledProperties = Object.keys(enabledPropertySettings).length > 0
  const hasSavedPresets = presetsAsEntries.length > 0

  const savePresetMenuItems: MenuItemProps<'button'>[] = [
    {
      icon: 'plus',
      id: 'create-new-preset-button',
      label: 'Create New',
      onClick: handleClickCreateNew,
    },
    ...(presetsAsEntries.map(([presetName]) => ({
      onClick: handleClickResavePreset.bind(null, presetName),
      icon: 'file',
      id: `save-preset-button-${kebabCase(presetName)}`,
      label: presetName || '(Untitled)',
    })) as MenuItemProps<'button'>[]),
  ]

  const presetMenuItems: MenuItemProps<'button'>[] = presetsAsEntries.map(
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

  function saveCurrentSettingsAsPreset({
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
    let newPresets = { ...presets }

    if (newPresetName) {
      newPresets[newPresetName] = enabledPropertySettings
    } else if (presetName) {
      newPresets[presetName] = enabledPropertySettings
    }

    setPresets(newPresets)
    setNameOfPresetBeingEdited(null)
    setIsPresetConfigModalOpen(false)
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

  function handleClickLoadPreset(
    partialPropertySettings: Partial<PropertySettingsObject>,
  ) {
    loadPartialPropertySettings(partialPropertySettings)
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

  function handleClickDeletePreset(
    presetName: string,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation()

    if (!confirm('Are you sure you want to delete this preset?')) {
      return
    }

    const newPresets = omit(presets, presetName)

    setPresets(newPresets)
  }

  function handleClickDisableAll() {
    loadPartialPropertySettings({})
  }

  return (
    <>
      <div
        className={twJoin(
          'h-15 px-3',
          'flex items-center justify-between',
          'border-border bg-bg border-b',
        )}
      >
        <div className="flex items-center gap-1">
          <MenuButton
            id="save-preset-menu-button"
            items={savePresetMenuItems}
            disabled={!hasEnabledProperties}
            variant="button.icon"
            tooltip={
              !hasEnabledProperties
                ? tooltips.savePresetMenuDisabled
                : tooltips.savePresetMenu
            }
          >
            <Icon
              name="floppy-disk"
              variant="solid"
            />
            <span>Save</span>
          </MenuButton>

          <MenuButton
            id="load-preset-menu-button"
            disabled={!hasSavedPresets}
            items={presetMenuItems}
            tooltip={
              !hasSavedPresets
                ? tooltips.presetsMenuEmpty
                : tooltips.presetsMenu
            }
            variant="button.icon"
          >
            <Icon
              name="folder-open"
              variant="solid"
            />
            <span>Load</span>
          </MenuButton>

          <Atom
            as="button"
            id="disable-all-button"
            disabled={!hasEnabledProperties}
            variant="button.icon"
            onClick={handleClickDisableAll}
            tooltip={tooltips.disableAll}
          >
            <Icon
              name="toggle-large-off"
              variant="solid"
            />
            <span>Disable All</span>
          </Atom>
        </div>

        <MenuButton
          tooltip="Options"
          variant="button.icon"
          items={[
            {
              label: 'Group by status',
              icon: isGroupedByStatus ? 'solid:check' : 'blank',
              onClick: () => setisGroupedByStatus((v) => !v),
            },
            {
              label: 'Group by type',
              icon: isGroupedByType ? 'solid:check' : 'blank',
              onClick: () => setisGroupedByType((v) => !v),
            },
            {
              label: 'Auto scroll',
              icon: isAutoScrollEnabled ? 'solid:check' : 'blank',
              onClick: () => setIsAutoScrollEnabled((v) => !v),
            },
            {
              label: 'Upgrade',
              icon: 'solid:crown',
              onClick: async () => {
                dispatchPluginAction({ type: 'upgrade' })
              },
            },
          ]}
        >
          <Icon name="solid:gear" />
          <span className="sr-only">Options</span>
        </MenuButton>
      </div>

      <ModalWindow
        classNamesForCloseButton="hidden"
        isOpen={isPresetConfigModalOpen}
        onClose={() => setIsPresetConfigModalOpen(false)}
      >
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit}
        >
          <Atom
            as="input"
            id="preset-name-input"
            name="presetName"
            placeholder="Enter a name for the preset..."
            ref={presetNameInputRef}
            type="text"
            variant="input"
            onFocus={(event: FocusEvent<HTMLInputElement>) =>
              event.target.select()
            }
          />

          <div className="flex flex-row-reverse items-center gap-3">
            <Atom
              as="button"
              id="save-preset-button"
              type="submit"
              variant="button.primary"
            >
              Save
            </Atom>

            <Atom
              as="button"
              type="button"
              variant="button.secondary"
              onClick={() => setIsPresetConfigModalOpen(false)}
            >
              Cancel
            </Atom>
          </div>
        </form>
      </ModalWindow>
    </>
  )
}
