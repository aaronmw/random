"use client"

import { Button } from "@/app/components/Button"
import { Icon } from "@/app/components/Icon"
import { PresetsMenu } from "@/app/components/PresetsMenu"
import { PropertyMenu } from "@/app/components/PropertyMenu"
import { AppContext, AppReducer, initialState } from "@/app/reducer"
import {
  AppAction,
  PluginAction,
  PropertyName,
  PropertySettings,
} from "@/lib/types"
import { useReducerWithPersistedStateKeys } from "@/lib/useReducerWithPersistedStateKeys"
import { useRouter } from "next/navigation"
import { ReactNode, useCallback, useEffect } from "react"
import { twJoin } from "tailwind-merge"

const classNames = {
  propertyMenu: twJoin(
    `
      col-start-1
      col-end-2
      row-start-2
      row-end-3
      overflow-hidden
      border-r
    `,
  ),

  footer: twJoin(
    `
      relative
      col-start-1
      col-end-3
      row-start-3
      row-end-4
      flex
      divide-x
      border-t
    `,
  ),

  executeButton: twJoin(
    `
      w-full
    `,
  ),
}

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
    persistedKeys: ["activePropertyName", "savedPropertySettings"],
    reducer: AppReducer,
  })

  const { propertySettings } = state

  const hasRandomizedProperties = Object.entries(propertySettings).some(
    ([_, { isRandomized }]) => isRandomized === true,
  )

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
  }, [dispatch, dispatchPluginAction, propertySettings])

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
      <PropertyMenu className={classNames.propertyMenu} />

      {children}

      <footer className={classNames.footer}>
        <PresetsMenu />

        <Button
          className={classNames.executeButton}
          disabled={!hasRandomizedProperties}
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
