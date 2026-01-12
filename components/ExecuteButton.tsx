'use client'

import { useAppContext } from '@/app/state/AppWrapper'
import { tooltips } from '@/app/tooltips'
import { Icon } from '@/components/Icon'
import { Tooltip } from '@/components/Tooltip'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import { pluralize } from '@/lib/pluralize'
import {
  duplicatePreset,
  getLocalPresetId,
  updatePreset,
} from '@/lib/services/propertySettingsService'
import pickBy from 'lodash/pickBy'

export function ExecuteButton() {
  const {
    propertySettings,
    selectedNodePluginData,
    currentUserId,
    activePresetId,
  } = useAppContext()
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
      const settings = value as any
      if (settings.randomization_mode === 'list') {
        console.log('List property settings being sent:', {
          propertyName: key,
          randomization_mode: settings.randomization_mode,
          hasModeOptions: !!settings.modeOptions,
          modeOptionsListOptions:
            settings.modeOptions?.list?.options?.length || 0,
          hasListPropertySettings: !!settings.list_property_settings,
          listPropertySettingsOptions:
            settings.list_property_settings?.options?.substring(0, 100) ||
            'none',
        })
      }
    })

    // Execute the randomization
    dispatchPluginAction({
      type: 'execute',
      payload: {
        propertySettings: enabledPropertySettings,
      },
    })

    // Update or create preset and write preset ID to nodes
    if (currentUserId && hasNodesSelected) {
      try {
        const localPresetId = await getLocalPresetId(currentUserId)
        if (!localPresetId) {
          console.error('Local preset ID not found')
          return
        }

        // If there's an active preset (not local), update it instead of creating a new one
        if (activePresetId && activePresetId !== localPresetId) {
          console.log('Updating active preset:', activePresetId)

          // Convert property settings to array format for updatePreset
          const propertySettingsArray = Object.values(enabledPropertySettings)

          // Update the active preset with current property settings
          await updatePreset(
            activePresetId,
            currentUserId,
            propertySettingsArray,
          )

          // Write the active preset ID to all selected nodes
          dispatchPluginAction({
            type: 'setPresetIdOnNodes',
            payload: {
              presetId: activePresetId,
            },
          })
        } else {
          // No active preset or active preset is local - duplicate local preset as before
          const newPreset = await duplicatePreset(
            localPresetId,
            currentUserId,
            'hidden',
          )

          // Write the preset ID to all selected nodes
          dispatchPluginAction({
            type: 'setPresetIdOnNodes',
            payload: {
              presetId: newPreset.id,
            },
          })
        }
      } catch (error) {
        console.error(
          'Error updating/duplicating preset and setting preset ID on nodes:',
          error,
        )
      }
    }
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
