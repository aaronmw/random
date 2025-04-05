import { getRandomPropertyValue } from '@/lib/getRandomPropertyValue'
import { setNodeProperty } from '@/lib/setNodeProperty'
import type {
  PluginAction,
  PropertyName,
  PropertySettings,
  PropertySettingsObject,
} from '@/lib/types'
import pickBy from 'lodash/pickBy'
import naturalSort from 'natural-compare-lite'

declare const SITE_URL: string

const PLUGIN_HEIGHT = 550
const PLUGIN_WIDTH = 300

/*
  By enabling `theme-colors`, Figma will add either the figma-light or
  figma-dark class to the body element. It can take a second or two, so this
  code just waits until it sees either class and then redirects to the actual
  plugin, with the resulting display mode as a query parameter
*/
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
              window.location.href = '${SITE_URL}?isLightMode=' + isLightMode + '&selectionCount=' + ${figma.currentPage.selection.length};
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

figma.ui.onmessage = async (action: PluginAction, props) => {
  if (props.origin !== SITE_URL) {
    return
  }

  console.log('Plugin action:', { action })

  switch (action.type) {
    case 'execute': {
      const { propertySettings } = action.payload

      const enabledPropertySettings = pickBy(propertySettings, 'isEnabled')

      const { selection } = figma.currentPage

      if (!selection.length) {
        figma.notify('No nodes selected')
        break
      }

      ;(
        Object.entries(enabledPropertySettings) as [
          propertyName: PropertyName,
          PropertySettings,
        ][]
      ).forEach(async ([propertyName, propertySettings]) => {
        const { sortOrder } = propertySettings

        const randomValues = selection.map((node) =>
          getRandomPropertyValue({
            node,
            propertySettings,
            propertyName,
          }),
        )

        if (sortOrder !== 'random') {
          randomValues.sort(naturalSort)

          if (sortOrder === 'desc') {
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

    default:
      break
  }

  console.log(`Plugin action "${action.type}" fired:`, { action })
}

figma.on('selectionchange', () => {
  const selectedNodePluginData = figma.currentPage.selection.map(
    (selectedNode) => {
      const pluginData = selectedNode.getPluginData('propertySettings')
      return JSON.parse(pluginData || '{}') as Partial<PropertySettingsObject>
    },
  )

  figma.ui.postMessage({
    type: 'setSelectedNodePluginData',
    payload: selectedNodePluginData,
  })
})
