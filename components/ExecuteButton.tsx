'use client'

import { enabledPropertySettingsAtom } from '@/app/atoms/enabledPropertySettingsAtom'
import { selectedNodePluginDataAtom } from '@/app/atoms/selectedNodePluginDataAtom'
import { Atom } from '@/components/Atom'
import { Icon } from '@/components/Icon'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import { pluralize } from '@/lib/pluralize'
import { useAtomValue } from 'jotai'

export function ExecuteButton() {
  const enabledPropertySettings = useAtomValue(enabledPropertySettingsAtom)
  const enabledPropertyNames = Object.keys(enabledPropertySettings)
  const selectedNodePluginData = useAtomValue(selectedNodePluginDataAtom)
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
