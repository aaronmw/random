'use client'

import { useAppContext } from '@/app/state/AppWrapper'
import { Atom } from '@/components/Atom'
import { Icon } from '@/components/Icon'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import { pluralize } from '@/lib/pluralize'

export function ExecuteButton() {
  const { enabledPropertySettings, selectedNodePluginData } = useAppContext()
  const enabledPropertyNames = Object.keys(enabledPropertySettings)
  const hasNodesSelected = selectedNodePluginData.length > 0
  const hasPropertiesEnabled = enabledPropertyNames.length > 0
  const canExecute = hasNodesSelected && hasPropertiesEnabled

  async function handleClickExecute() {
    dispatchPluginAction({
      type: 'execute',
      payload: {
        propertySettings: enabledPropertySettings,
      },
    })
  }

  return (
    <Atom
      variant="button.primary"
      as="button"
      className="m-3"
      disabled={!canExecute}
      onClick={handleClickExecute}
    >
      {!hasNodesSelected ? (
        'Select at least one node'
      ) : !hasPropertiesEnabled ? (
        'Enable at least one property'
      ) : (
        <>
          <span>
            Randomize {pluralize(selectedNodePluginData.length, 'node')}
          </span>
          <Icon name="shuffle" />
        </>
      )}
    </Atom>
  )
}
