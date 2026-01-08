import type {
    PluginAction,
    PropertyName,
    PropertySettingsRow,
} from '@/app/types'
import { PropertySettingsWithDetails } from '@/lib/services/propertySettingsService'
import { getRandomPropertyValue } from '@/lib/getRandomPropertyValue'
import { setNodeProperty } from '@/lib/setNodeProperty'
import pickBy from 'lodash/pickBy'
import naturalSort from 'natural-compare-lite'

function transformPropertySettingsForRandomization(
  propertySettings: PropertySettingsWithDetails,
): any {
  const { randomization_mode, min, max, operator } = propertySettings

  console.log('Transforming property settings for randomization:', {
    label: propertySettings.label,
    randomization_mode,
    min,
    max,
    operator,
    hasMin: 'min' in propertySettings,
    hasMax: 'max' in propertySettings,
    numericSettings: propertySettings.numeric_property_settings,
  })

  let mode: 'range' | 'calc' | 'list'
  let modeOptions: any

  switch (randomization_mode) {
    case 'range':
      mode = 'range'
      // Only use fallback if min/max are actually null/undefined
      // Don't use fallback if they're 0 (which is a valid value)
      const rangeMin = min != null ? min : 0
      const rangeMax = max != null ? max : 100
      modeOptions = {
        range: {
          min: rangeMin,
          max: rangeMax,
        },
      }
      break

    case 'addition':
      mode = 'calc'
      const addMin = min != null ? min : 0
      const addMax = max != null ? max : 100
      modeOptions = {
        calc: {
          operator: 'add',
          add: {
            min: addMin,
            max: addMax,
          },
        },
      }
      break

    case 'multiplication':
      mode = 'calc'
      const multMin = min != null ? min : 0
      const multMax = max != null ? max : 100
      modeOptions = {
        calc: {
          operator: 'multiply',
          multiply: {
            min: multMin,
            max: multMax,
          },
        },
      }
      break

    case 'list':
      mode = 'list'
      // Read list options from modeOptions.list.options (populated from database)
      const listOptions =
        propertySettings.modeOptions?.list?.options || []
      modeOptions = {
        list: {
          options: listOptions,
        },
      }
      break

    default:
      mode = 'range'
      const defaultMin = min != null ? min : 0
      const defaultMax = max != null ? max : 100
      modeOptions = {
        range: {
          min: defaultMin,
          max: defaultMax,
        },
      }
  }

  return {
    ...propertySettings,
    mode,
    modeOptions,
  }
}

declare const SITE_URL: string

const PLUGIN_HEIGHT = 550
const PLUGIN_WIDTH = 300

/*
  By enabling `theme-colors`, Figma will add either the figma-light or
  figma-dark class to the body element. It can take a second or two, so this
  code just waits until it sees either class and then redirects to the actual
  plugin, with the resulting display mode as a query parameter
*/

const initQueryParams = {
  figmaUserId: figma.currentUser?.id,
  isLightMode: `' + isLightMode + '`,
  selectionCount: figma.currentPage.selection.length,
}

const initQueryString = Object.entries(initQueryParams)
  .map(([key, value]) => `${key}=${value}`)
  .join('&')

const redirectionUrl = `${SITE_URL}?${initQueryString}`

figma.showUI(
  `
    <html>
      <body>
        <script>
          function redirectWhenLightOrDarkModeDetected() {
            const { classList } = document.body.parentElement
            const isLightMode = classList.contains('figma-light')
            const isDarkMode = classList.contains('figma-dark')
            if (isLightMode || isDarkMode) {
              window.location.href = '${redirectionUrl}';
              return
            }
            setTimeout(redirectWhenLightOrDarkModeDetected, 10)
          }
          setTimeout(redirectWhenLightOrDarkModeDetected, 10)
        </script>
      </body>
    </html>
  `,
  {
    height: PLUGIN_HEIGHT,
    width: PLUGIN_WIDTH,
    themeColors: true,
  },
)

// Helper function to get and send current selection
function sendCurrentSelection() {
  const selection = figma.currentPage.selection
  console.log('Sending current selection:', selection.length, 'nodes')

  const selectedNodePluginData = selection.map(
    (selectedNode) => {
      const pluginData = selectedNode.getPluginData('propertySettings')
      return JSON.parse(pluginData || '{}') as Partial<PropertySettingsRow>
    },
  )

  console.log('Sending selectedNodePluginData:', selectedNodePluginData.length, 'items')
  figma.ui.postMessage({
    type: 'setSelectedNodePluginData',
    payload: selectedNodePluginData,
  })
}

// Send initial data to UI
figma.ui.postMessage({
  type: 'init',
  payload: {
    figmaUserId: figma.currentUser?.id || null,
  },
})

// Send initial selection after a short delay to allow the app to set up message handlers
// The app will also request it when ready, so this is a backup
setTimeout(() => {
  console.log('Sending initial selection after delay')
  sendCurrentSelection()
}, 500)

figma.ui.onmessage = async (action: PluginAction, props) => {
  if (props.origin !== SITE_URL) {
    return
  }

  console.log('Plugin action:', { action })

  switch (action.type) {
    case 'execute': {
      const { propertySettings } = action.payload

      const enabledPropertySettings = pickBy(propertySettings, 'is_enabled')

      const { selection } = figma.currentPage

      if (!selection.length) {
        figma.notify('No nodes selected')
        break
      }

      ;(
        Object.entries(enabledPropertySettings) as [
          propertyName: PropertyName,
          PropertySettingsWithDetails,
        ][]
      ).forEach(async ([propertyName, propertySettings]) => {
        const { post_randomization_sort_order } = propertySettings

        const transformedPropertySettings = transformPropertySettingsForRandomization(
          propertySettings,
        )

        const randomValues = selection.map((node) =>
          getRandomPropertyValue({
            node,
            propertySettings: transformedPropertySettings,
            propertyName,
          }),
        )

        if (post_randomization_sort_order !== 'none') {
          randomValues.sort(naturalSort)

          if (post_randomization_sort_order === 'descending') {
            randomValues.reverse()
          }
        }

        await Promise.all(
          selection.map(async (node, index) => {
            const value = randomValues[index]
            await setNodeProperty({
              enabledPropertySettings,
              node,
              propertySettings,
              propertyName,
              value,
            })
          }),
        )
      })
      break
    }

    case 'setPluginHeight': {
      const { height } = action.payload
      figma.ui.resize(PLUGIN_WIDTH, height)
      break
    }

    case 'upgrade': {
      figma.notify('Upgrade action received')

      if (!figma.payments) {
        figma.notify('Payments API is not available')
        break
      }

      figma.notify('Opening upgrade modal...')

      await figma.payments.initiateCheckoutAsync({
        interstitial: 'PAID_FEATURE',
      })

      figma.notify('Upgrade modal should be open??')
      break
    }

    case 'getCurrentSelection': {
      console.log('Received getCurrentSelection request')
      sendCurrentSelection()
      break
    }

    default:
      break
  }

  console.log(`Plugin action "${action.type}" fired:`, { action })
}

figma.on('selectionchange', () => {
  sendCurrentSelection()
})
