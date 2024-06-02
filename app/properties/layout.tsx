'use client'

import { Button } from '@/app/components/Button'
import { Icon } from '@/app/components/Icon'
import { PresetButtons } from '@/app/components/PresetButtons'
import { AppContext, AppReducer, initialState } from '@/app/reducer'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import {
  AppAction,
  PluginAction,
  PropertyName,
  PropertySettings,
} from '@/lib/types'
import { useReducerWithPersistedStateKeys } from '@/lib/useReducerWithPersistedStateKeys'
import { pickBy } from 'lodash'
import { useParams, useRouter } from 'next/navigation'
import { ReactNode, useCallback, useEffect } from 'react'
import { twJoin } from 'tailwind-merge'

const classNames = {
  container: twJoin(
    `
      grid
      h-full
      grid-rows-[auto,min-content]
      gap-px
      overflow-hidden
    `,
  ),

  contentContainer: twJoin(
    `
      row-start-1
      row-end-2
      h-full
      overflow-hidden
    `,
  ),

  footer: twJoin(
    `
      relative
      row-start-2
      row-end-3
      flex
      gap-px
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

  const { propertyName } = useParams()

  const [state, dispatch] = useReducerWithPersistedStateKeys({
    initializer: ({ finalState }) => {
      if (propertyName) {
        return finalState
      }

      requestAnimationFrame(() => {
        router.push(`/properties/${finalState.activePropertyName}`)
      })

      return finalState
    },
    initialState,
    localStorageKeyName: 'plugin-state',
    persistedKeys: ['activePropertyName', 'savedPropertySettings'],
    reducer: AppReducer,
  })

  const { propertySettings } = state

  const hasRandomizedProperties = Object.entries(propertySettings).some(
    ([_, { mode }]) => mode !== 'disabled',
  )

  useEffect(() => {
    console.log(`Writing ${propertyName} to state`)
    dispatch({
      type: 'setStateByPath',
      payload: {
        path: 'activePropertyName',
        value: propertyName,
      },
    })
  }, [dispatch, propertyName])

  useEffect(() => {
    window.onmessage = (event: {
      data: {
        pluginMessage: AppAction
      }
    }) => {
      dispatch(event.data.pluginMessage)
    }
  }, [dispatch])

  // For some reason React can't tell when propertySettings changes
  // const stringifiedPropertySettings = JSON.stringify(propertySettings)

  const saveSettingsToSelectedNodes = useCallback(() => {
    const randomizedPropertySettings = Object.entries(propertySettings).filter(
      ([, { mode }]) => mode !== 'disabled',
    )

    if (randomizedPropertySettings.length === 0) {
      return
    }

    dispatchPluginAction({
      type: 'saveSettingsToSelectedNodes',
      payload: {
        propertySettings: Object.fromEntries(
          randomizedPropertySettings,
        ) as Record<PropertyName, PropertySettings>,
      },
    })
  }, [propertySettings])

  useEffect(() => {
    dispatchPluginAction({
      type: 'requestSettingsFromSelectedNodes',
    })
  }, [])

  async function handleClickExecute() {
    const { propertySettings } = state

    const randomizedPropertySettings = pickBy(
      propertySettings,
      ({ mode }) => mode !== 'disabled',
    ) as Record<PropertyName, PropertySettings>

    dispatchPluginAction({
      type: 'execute',
      payload: {
        propertySettings: randomizedPropertySettings,
      },
    })

    saveSettingsToSelectedNodes()
  }

  return (
    <AppContext.Provider
      value={{
        dispatch,
        state,
      }}
    >
      <main className={classNames.container}>
        <div className={classNames.contentContainer}>{children}</div>

        <footer className={classNames.footer}>
          <Button
            className={classNames.executeButton}
            disabled={!hasRandomizedProperties}
            variant="primary"
            onClick={handleClickExecute}
          >
            Run
            <Icon name="shuffle" />
          </Button>
        </footer>
      </main>
    </AppContext.Provider>
  )
}
