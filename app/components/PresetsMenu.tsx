import { Box } from "@/app/components/Box"
import { Button } from "@/app/components/Button"
import { Icon } from "@/app/components/Icon"
import { Menu, MenuItem, MenuItemDivider } from "@/app/components/Menu"
import { ModalWindow } from "@/app/components/ModalWindow"
import { AppContext } from "@/app/reducer"
import { PropertyName, PropertySettings } from "@/lib/types"
import {
  ChangeEvent,
  FormEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { twJoin } from "tailwind-merge"

const classNames = {
  menuButton: ({ isPresetsMenuOpen = false }) =>
    twJoin(
      isPresetsMenuOpen &&
        `
          relative
          z-50
        `,
    ),

  menu: twJoin(
    `
      absolute
      bottom-8
      left-1
      z-50
    `,
  ),
}

export function PresetsMenu() {
  const { state, dispatch } = useContext(AppContext)

  const { propertySettings, savedPropertySettings } = state

  const [isPresetsMenuOpen, setIsPresetsMenuOpen] = useState(false)

  const [isPresetConfigModalOpen, setIsPresetConfigModalOpen] = useState(false)

  const [presetName, setPresetName] = useState<string | null>(null)

  const hasRandomizedProperties = Object.entries(propertySettings).some(
    ([_, { isRandomized }]) => isRandomized === true,
  )

  const presetNameInputRef = useRef<HTMLInputElement>(null)

  const savedPropertySettingsEntries = Object.entries(savedPropertySettings)

  const handleClickSaveAsPreset = () => {
    setPresetName(null)
    setIsPresetConfigModalOpen(true)
  }

  const handleClickSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()

    dispatch({
      type: "setStateByPath",
      payload: {
        path: `savedPropertySettings.${presetName}`,
        value: propertySettings,
      },
    })

    setPresetName(null)
    setIsPresetConfigModalOpen(false)
  }

  const handleClickPreset = (
    settings: Record<PropertyName, PropertySettings>,
  ) => {
    dispatch({
      type: "receiveSettingsFromSelectedNodes",
      payload: {
        propertySettingsFromSelectedNodes: settings,
      },
    })

    setIsPresetsMenuOpen(false)
  }

  useEffect(() => {
    if (isPresetConfigModalOpen) {
      requestAnimationFrame(() => {
        presetNameInputRef.current?.focus()
      })
    }
  }, [isPresetConfigModalOpen])

  return (
    <>
      <Button
        className={classNames.menuButton({ isPresetsMenuOpen })}
        title="Saved Presets Menu"
        variant="primary"
        onClick={() => setIsPresetsMenuOpen(!isPresetsMenuOpen)}
      >
        <Icon
          name="floppy-disk"
          variant="solid"
        />
      </Button>

      <Menu
        className={classNames.menu}
        isOpen={isPresetsMenuOpen}
        onClose={() => setIsPresetsMenuOpen(false)}
      >
        <MenuItem
          disabled={!hasRandomizedProperties}
          icon="floppy-disk"
          onClick={handleClickSaveAsPreset}
        >
          Save as Preset...
        </MenuItem>

        <MenuItemDivider />

        {savedPropertySettingsEntries.length === 0 ? (
          <MenuItem disabled>No Saved Presets</MenuItem>
        ) : (
          savedPropertySettingsEntries.map(([presetName, settings]) => (
            <MenuItem
              key={presetName}
              onClick={handleClickPreset.bind(null, settings)}
            >
              {presetName}
            </MenuItem>
          ))
        )}
      </Menu>

      <ModalWindow
        classNamesForCloseButton="hidden"
        isOpen={isPresetConfigModalOpen}
        onClose={() => setIsPresetConfigModalOpen(false)}
      >
        <form
          className="
            flex
            flex-col
            gap-3
            p-3
          "
          onSubmit={handleClickSave}
        >
          <Box
            as="input"
            placeholder="Enter a name for the preset..."
            ref={presetNameInputRef}
            type="text"
            variant="input"
            value={presetName || ""}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setPresetName(event.target.value)
            }
          />

          <div
            className="
              flex
              flex-row-reverse
              items-center
              gap-3
            "
          >
            <Button
              type="submit"
              variant="primary"
            >
              Save
            </Button>

            <Button
              variant="link"
              onClick={() => setIsPresetConfigModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </ModalWindow>
    </>
  )
}
