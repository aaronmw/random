'use client'

import { useAppContext } from '@/app/state/AppWrapper'
import { tooltips } from '@/app/tooltips'
import { Icon } from '@/components/Icon'
import { Tooltip } from '@/components/Tooltip'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import { pluralize } from '@/lib/pluralize'
import pickBy from 'lodash/pickBy'

export function ExecuteButton() {
  const { propertySettings, selectedNodePluginData } = useAppContext()
  const enabledPropertySettings = pickBy(propertySettings, 'is_enabled')
  const hasNodesSelected = selectedNodePluginData.length > 0
  const hasPropertiesEnabled = Object.keys(enabledPropertySettings).length > 0
  const canExecute = hasNodesSelected && hasPropertiesEnabled

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('ExecuteButton render:', {
      selectedNodeCount: selectedNodePluginData.length,
      hasNodesSelected,
      hasPropertiesEnabled,
      canExecute,
    })
  }

  async function handleClickExecute() {
    // Log the property settings being sent for debugging
    Object.entries(enabledPropertySettings).forEach(([key, value]) => {
      if (key === 'opacity') {
        const numericValue = value as any
        console.log('Opacity property settings being sent:', {
          min: numericValue.min,
          max: numericValue.max,
          randomization_mode: numericValue.randomization_mode,
          numeric_property_settings: numericValue.numeric_property_settings,
        })
      }
    })

    dispatchPluginAction({
      type: 'execute',
      payload: {
        propertySettings: enabledPropertySettings,
      },
    })
  }

  return (
    <div className="w-full p-3">
      <Tooltip tipContents={tooltips.execute}>
        <button
          className="button-primary w-full"
          data-disabled={!canExecute || undefined}
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
        </button>
      </Tooltip>
    </div>
  )
}
