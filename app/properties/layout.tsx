'use client'

import { Button } from '@/app/components/Button'
import { Icon } from '@/app/components/Icon'
import { AppContext, AppReducer, initialState } from '@/app/reducer'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import { AppAction, PropertyName, PropertySettings } from '@/lib/types'
import { useReducerWithPersistedStateKeys } from '@/lib/useReducerWithPersistedStateKeys'
import { pickBy } from 'lodash'
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
  const [state, dispatch] = useReducerWithPersistedStateKeys({
    initialState,
    localStorageKeyName: 'plugin-state',
    persistedKeys: ['propertySettings', 'savedPropertySettings'],
    reducer: AppReducer,
  })

  const { propertySettings } = state

  const hasRandomizedProperties = Object.entries(propertySettings).some(
    ([_, { mode }]) => mode !== 'disabled',
  )

  useEffect(() => {
    window.onmessage = (event: {
      data: {
        pluginMessage: AppAction
      }
    }) => {
      dispatch(event.data.pluginMessage)
    }
  }, [dispatch])

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
