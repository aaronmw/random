import { useAppContext } from '@/app/reducer/AppContext'
import { Icon } from '@/components/Icon'
import { MenuButton } from '@/components/MenuButton'
import { MenuItemProps } from '@/components/MenuItem'
import { ModalWindow } from '@/components/ModalWindow'
import { StyledText } from '@/components/StyledText'
import { Tooltip } from '@/components/Tooltip'
import { PropertyName, PropertySettings } from '@/lib/types'
import pickBy from 'lodash/pickBy'
import {
  FocusEvent,
  FormEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

export function PresetButtons() {
  const { state, dispatch } = useAppContext()
  const { propertySettings, savedPropertySettings } = state
  const [presetMenuMode, setPresetMenuMode] = useState<
    'write' | 'read' | 'closed'
  >('closed')
  const [isPresetConfigModalOpen, setIsPresetConfigModalOpen] = useState(false)
  const [presetIndexBeingEdited, setPresetIndexBeingEdited] = useState<
    number | null
  >(null)
  const presetNameInputRef = useRef<HTMLInputElement>(null)
  const hasRandomizedProperties = Object.entries(propertySettings).some(
    ([_, settings]) => settings.disabled !== true,
  )

  const disabled = savedPropertySettings.length === 0

  useEffect(() => {
    if (isPresetConfigModalOpen) {
      requestAnimationFrame(() => {
        presetNameInputRef.current?.focus()
      })
    }
  }, [isPresetConfigModalOpen])

  function saveCurrentSettingsAsPreset({
    presetIndex,
    presetName,
  }:
    | {
        presetIndex: null
        presetName: string
      }
    | {
        presetIndex: number
        presetName?: never
      }) {
    const randomizedPropertySettings = pickBy(
      propertySettings,
      (settings) => settings.disabled !== true,
    ) as Record<PropertyName, PropertySettings>

    let newSavedPropertySettings = [...savedPropertySettings]

    if (presetIndex === null) {
      newSavedPropertySettings.push([presetName, randomizedPropertySettings])
    } else {
      newSavedPropertySettings = savedPropertySettings.map(
        ([name, settings], index) => {
          if (index === presetIndex) {
            return [name, randomizedPropertySettings]
          }
          return [name, settings]
        },
      )
    }

    dispatch({
      type: 'setStateByPath',
      payload: {
        path: `savedPropertySettings`,
        value: newSavedPropertySettings,
      },
    })

    setPresetIndexBeingEdited(null)
    setIsPresetConfigModalOpen(false)
  }

  function handleClickCreateNew(event: MouseEvent<HTMLLIElement>) {
    event.stopPropagation()
    setPresetIndexBeingEdited(null)
    setIsPresetConfigModalOpen(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.stopPropagation()

    const formData = new FormData(event.currentTarget)
    const presetName = formData.get('presetName') as string

    if (presetIndexBeingEdited === null) {
      saveCurrentSettingsAsPreset({ presetIndex: null, presetName })
    } else {
      dispatch({
        type: 'setStateByPath',
        payload: {
          path: `savedPropertySettings.${presetIndexBeingEdited}.0`,
          value: presetName,
        },
      })
    }

    setIsPresetConfigModalOpen(false)
    setPresetIndexBeingEdited(null)

    event.currentTarget.reset()
  }

  function handleClickLoadPreset(
    settings: Record<PropertyName, PropertySettings>,
  ) {
    dispatch({
      type: 'loadPropertySettings',
      payload: {
        loadedProperties: settings,
      },
    })

    setPresetMenuMode('closed')
  }

  function handleClickResavePreset(presetIndex: number, event: MouseEvent) {
    event.stopPropagation()

    if (!confirm('Are you sure you want to overwrite this preset?')) {
      return
    }

    saveCurrentSettingsAsPreset({ presetIndex })
    setPresetMenuMode('closed')
  }

  function handleClickRenamePreset(
    presetIndex: number,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation()
    setPresetIndexBeingEdited(presetIndex)
    setIsPresetConfigModalOpen(true)

    if (!presetNameInputRef.current) return

    presetNameInputRef.current.value = savedPropertySettings[presetIndex][0]
  }

  function handleClickDeletePreset(
    presetIndex: number,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation()

    if (!confirm('Are you sure you want to delete this preset?')) {
      return
    }

    const filteredSavedPropertySettings = savedPropertySettings.filter(
      (_, index) => index !== presetIndex,
    )

    dispatch({
      type: 'setStateByPath',
      payload: {
        path: `savedPropertySettings`,
        value: filteredSavedPropertySettings,
      },
    })
  }

  const savedPresetButtons = savedPropertySettings.map(
    ([presetName, settings], presetIndex) => {
      const menuItem: MenuItemProps<'button'> = {
        onClick:
          presetMenuMode === 'write'
            ? handleClickResavePreset.bind(null, presetIndex)
            : handleClickLoadPreset.bind(null, settings),
        icon: 'file',
        id: `${presetMenuMode === 'write' ? 'save' : 'load'}-preset-button-${presetIndex}`,
        label: (
          <span className="flex w-full items-center justify-between">
            <span>{presetName || '(Untitled)'}</span>

            <span className="flex items-center">
              {presetMenuMode === 'read' && (
                <>
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
                    <StyledText
                      key={id}
                      as="span"
                      variant="button.icon"
                      id={`${id}-preset-button-${presetIndex}`}
                      onClick={onClick.bind(null, presetIndex)}
                    >
                      <Icon name={icon} />
                      <span className="sr-only">{label}</span>
                    </StyledText>
                  ))}
                </>
              )}
              {presetMenuMode === 'write' && (
                <span className="text-text-secondary">Re-Save</span>
              )}
            </span>
          </span>
        ),
      }

      return menuItem
    },
  )

  return (
    <>
      <MenuButton
        disabled={disabled}
        buttons={savedPresetButtons}
      >
        <div className="flex items-center gap-1">
          <Tooltip tipContents="Save this configuration as a preset">
            <StyledText
              as="button"
              disabled={!hasRandomizedProperties}
              id="save-preset-menu-button"
              variant="button.icon"
              onClick={() => setPresetMenuMode('write')}
            >
              <Icon
                name="floppy-disk"
                variant="solid"
              />
              <span className="sr-only">Save as Preset</span>
            </StyledText>
          </Tooltip>

          <Tooltip tipContents={disabled ? 'No presets' : 'Load Preset...'}>
            <StyledText
              as="button"
              disabled={disabled}
              id="load-preset-menu-button"
              title="Presets Menu"
              variant="button.icon"
              onClick={() => setPresetMenuMode('read')}
            >
              <Icon
                name="folder-open"
                variant="solid"
              />
              <span className="sr-only">Load Preset</span>
            </StyledText>
          </Tooltip>
        </div>
      </MenuButton>

      <ModalWindow
        classNamesForCloseButton="hidden"
        isOpen={isPresetConfigModalOpen}
        onClose={() => setIsPresetConfigModalOpen(false)}
      >
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit}
        >
          <StyledText
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
            <StyledText
              as="button"
              id="save-preset-button"
              type="submit"
              variant="button.primary"
            >
              Save
            </StyledText>

            <StyledText
              as="button"
              type="button"
              variant="button.secondary"
              onClick={() => setIsPresetConfigModalOpen(false)}
            >
              Cancel
            </StyledText>
          </div>
        </form>
      </ModalWindow>
    </>
  )
}
