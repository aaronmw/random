"use client"

import { Button } from "@/app/components/Button"
import { Icon } from "@/app/components/Icon"
import { Menu, MenuItem, MenuItemDivider } from "@/app/components/Menu"
import { PropertyMenu } from "@/app/components/PropertyMenu"
import { AppContext, AppReducer, initialState } from "@/app/reducer"
import {
  AppAction,
  PluginAction,
  PropertyName,
  PropertySettings,
} from "@/lib/pluginTypes"
import { useReducerWithPersistedStateKeys } from "@/lib/useReducerWithPersistedStateKeys"
import { useRouter } from "next/navigation"
import { ReactNode, useCallback, useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()

  const [state, dispatch] = useReducerWithPersistedStateKeys({
    initializer: ({ finalState }) => {
      requestAnimationFrame(() => {
        router.push(`/properties/${finalState.activePropertyName}`)
      })

      return finalState
    },
    initialState,
    localStorageKeyName: "plugin-state",
    persistedKeys: ["activePropertyName"],
    reducer: AppReducer,
  })

  const [isPresetsMenuOpen, setIsPresetsMenuOpen] = useState(false)

  const dispatchPluginAction = useCallback((pluginAction: PluginAction) => {
    parent.postMessage(
      {
        pluginMessage: pluginAction,
        pluginId: "829089184334973766",
      },
      "*",
    )
  }, [])

  useEffect(() => {
    window.onmessage = (event: {
      data: {
        pluginMessage: AppAction
      }
    }) => {
      dispatch(event.data.pluginMessage)
    }
  }, [dispatch])

  useEffect(() => {
    const { propertySettings } = state

    const randomizedPropertySettings = Object.entries(propertySettings).filter(
      ([, { isRandomized }]) => isRandomized,
    )

    if (randomizedPropertySettings.length === 0) {
      return
    }

    dispatchPluginAction({
      type: "saveSettingsToSelectedNodes",
      payload: {
        propertySettings: Object.fromEntries(
          randomizedPropertySettings,
        ) as Record<PropertyName, PropertySettings>,
      },
    })
  }, [dispatch, dispatchPluginAction, state])

  useEffect(() => {
    dispatchPluginAction({
      type: "requestSettingsFromSelectedNodes",
    })
  }, [dispatchPluginAction])

  async function handleClickExecute() {
    const { propertySettings } = state

    dispatchPluginAction({
      type: "execute",
      payload: {
        propertySettings,
      },
    })
  }

  return (
    <AppContext.Provider
      value={{
        dispatch,
        state,
      }}
    >
      <PropertyMenu
        className="
          col-start-1
          col-end-2
          row-start-2
          row-end-3
          overflow-hidden
          border-r
        "
      />

      {children}

      <footer
        className="
          relative
          col-start-1
          col-end-3
          row-start-3
          row-end-4
          flex
          divide-x
          border-t
        "
      >
        <Button
          className={twMerge(
            isPresetsMenuOpen &&
              `
                relative
                z-50
              `,
          )}
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
          className="
            absolute
            bottom-8
            left-0
            z-50
          "
          isOpen={isPresetsMenuOpen}
          onClose={() => setIsPresetsMenuOpen(false)}
        >
          <MenuItem icon="floppy-disk">Save as Preset...</MenuItem>
          <MenuItemDivider />
          <MenuItem>Vertical Bars</MenuItem>
          <MenuItem>Horizontal Bars</MenuItem>
          <MenuItem>Pie Slices</MenuItem>
          <MenuItem>Confetti</MenuItem>
        </Menu>

        <Button
          className="w-full"
          variant="primary"
          onClick={handleClickExecute}
        >
          Execute
          <Icon name="shuffle" />
        </Button>
      </footer>
    </AppContext.Provider>
  )
}
