import { Box } from '@/app/components/Box'
import { Button } from '@/app/components/Button'
import { Icon } from '@/app/components/Icon'
import { IconButton } from '@/app/components/IconButton'
import { Menu } from '@/app/components/Menu'
import { ModalWindow } from '@/app/components/ModalWindow'
import { AppContext } from '@/app/reducer'
import { PropertyName, PropertySettings } from '@/lib/types'
import { pickBy } from 'lodash'
import {
  FocusEvent,
  FormEvent,
  MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { twJoin } from 'tailwind-merge'

const classNames = {
  container: twJoin(
    `
      relative
      flex
      w-full
      items-center
      justify-around
      border-t
      py-3
    `,
  ),

  menu: twJoin(
    `
      bottom-24
      left-4
      right-4
    `,
  ),

  menuItemContentsContainer: twJoin(
    `
      relative
      flex
      w-full
      items-center
      justify-between
      whitespace-normal
    `,
  ),

  hoverContainer: twJoin(
    `
      absolute
      right-0
      top-1/2
      flex
      h-full
      -translate-y-1/2
      flex-row-reverse
      items-center
      justify-center
      gap-1
      bg-bgColor
      pl-3
      opacity-0
      before:absolute
      before:right-full
      before:top-0
      before:h-full
      before:w-10
      before:bg-gradient-to-l
      before:from-bgColor
      before:to-transparent
      group-hover/menuItem:bg-accentColor
      group-hover/menuItem:opacity-100
      group-hover/menuItem:before:from-accentColor
    `,
  ),

  presetConfigForm: twJoin(
    `
      flex
      flex-col
      gap-5
      p-5
    `,
  ),

  presetConfigFormButtonsContainer: twJoin(
    `
      flex
      flex-row-reverse
      items-center
      gap-5
    `,
  ),
}

export function PresetButtons() {
  const { state, dispatch } = useContext(AppContext)

  const { propertySettings, savedPropertySettings } = state

  const [presetMenuMode, setPresetMenuMode] = useState<
    'saving' | 'loading' | 'closed'
  >('closed')

  const [isPresetConfigModalOpen, setIsPresetConfigModalOpen] = useState(false)

  const [presetIndexBeingEdited, setPresetIndexBeingEdited] = useState<
    number | null
  >(null)

  const presetNameInputRef = useRef<HTMLInputElement>(null)

  const hasRandomizedProperties = Object.entries(propertySettings).some(
    ([_, { mode }]) => mode !== 'disabled',
  )

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
      ({ mode }) => mode !== 'disabled',
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

  return (
    <div className={classNames.container}>
      <Button
        disabled={!hasRandomizedProperties}
        id="save-preset-menu-button"
        title="Save as Preset"
        variant="link"
        onClick={() => setPresetMenuMode('saving')}
      >
        <Icon
          name="floppy-disk"
          variant="solid"
        />
        Save as Preset
      </Button>

      <Button
        disabled={savedPropertySettings.length === 0}
        id="load-preset-menu-button"
        title="Presets Menu"
        variant="link"
        onClick={() => setPresetMenuMode('loading')}
      >
        <Icon
          name="folder-open"
          variant="solid"
        />
        Load Preset
      </Button>

      <Menu
        className={classNames.menu}
        isOpen={presetMenuMode !== 'closed'}
      >
        <Menu.Backdrop onClick={() => setPresetMenuMode('closed')} />

        {presetMenuMode === 'saving' && (
          <>
            <Menu.Item
              icon="plus-large"
              onClick={handleClickCreateNew}
            >
              Create New...
            </Menu.Item>
            <Menu.Divider />
          </>
        )}

        {savedPropertySettings.length === 0 ? (
          <Menu.Item disabled>No Saved Presets</Menu.Item>
        ) : (
          savedPropertySettings.map(([presetName, settings], presetIndex) => (
            <Menu.Item
              icon="file"
              id={`${presetMenuMode === 'saving' ? 'save' : 'load'}-preset-button-${presetIndex}`}
              key={presetName}
              onClick={
                presetMenuMode === 'saving'
                  ? handleClickResavePreset.bind(null, presetIndex)
                  : handleClickLoadPreset.bind(null, settings)
              }
            >
              <div className={classNames.menuItemContentsContainer}>
                <div>{presetName || '(Untitled)'}</div>

                <div className={classNames.hoverContainer}>
                  {presetMenuMode === 'loading' && (
                    <>
                      <IconButton
                        iconName="pencil"
                        id={`rename-preset-button-${presetIndex}`}
                        label="Rename"
                        variant="primary"
                        onClick={handleClickRenamePreset.bind(
                          null,
                          presetIndex,
                        )}
                      />
                      <IconButton
                        iconName="trash"
                        id={`delete-preset-button-${presetIndex}`}
                        label="Delete"
                        variant="primary"
                        onClick={handleClickDeletePreset.bind(
                          null,
                          presetIndex,
                        )}
                      />
                    </>
                  )}

                  {presetMenuMode === 'saving' && (
                    <div className="text-fadedTextColor">Re-Save</div>
                  )}
                </div>
              </div>
            </Menu.Item>
          ))
        )}
      </Menu>

      <ModalWindow
        classNamesForCloseButton="hidden"
        isOpen={isPresetConfigModalOpen}
        onClose={() => setIsPresetConfigModalOpen(false)}
      >
        <form
          className={classNames.presetConfigForm}
          onSubmit={handleSubmit}
        >
          <Box
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

          <div className={classNames.presetConfigFormButtonsContainer}>
            <Button
              id="save-preset-button"
              type="submit"
              variant="primary"
            >
              Save
            </Button>

            <Button
              type="button"
              variant="link"
              onClick={() => setIsPresetConfigModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </ModalWindow>
    </div>
  )
}
