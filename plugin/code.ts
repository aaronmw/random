import { getRandomPropertyValue } from "@/lib/getRandomPropertyValue"
import type {
  AppAction,
  PluginAction,
  PropertyName,
  PropertySettings,
} from "@/lib/pluginTypes"
import { setNodeProperty } from "@/lib/setNodeProperty"
import { merge } from "lodash"
import naturalSort from "natural-compare-lite"

declare const SITE_URL: string

/*
  By enabling `theme-colors`, the plugin will add either the figma-light or
  figma-dark class to the body element. It can take a second or two, so this
  code just waits until it sees either class and then redirects to the actual
  plugin, with the mode as a query parameter
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
              window.location.href = '${SITE_URL}?isLightMode=' + isLightMode
            }
          }
          window.setInterval(redirectWhenLightOrDarkModeDetected, 10)
        </script>
      </body>
    </html>
  `,
  {
    height: 500,
    width: 450,
    themeColors: true,
  },
)

const dispatchAppAction = (action: AppAction) => {
  figma.ui.postMessage(action, {
    origin: "*",
  })
}

function sendSettingsFromSelectedNodes() {
  const { selection } = figma.currentPage

  let propertySettingsFromSelectedNodes: {
    [k in PropertyName]?: PropertySettings
  } = {}

  if (selection.length) {
    propertySettingsFromSelectedNodes = merge(
      {},
      ...selection.map((node) =>
        JSON.parse(node.getPluginData("property-settings") || "{}"),
      ),
    )
  } else {
    propertySettingsFromSelectedNodes = JSON.parse(
      figma.currentPage.getPluginData("property-settings") || "{}",
    )
  }

  dispatchAppAction({
    type: "receiveSettingsFromSelectedNodes",
    payload: {
      propertySettingsFromSelectedNodes,
    },
  })
}

figma.on("selectionchange", sendSettingsFromSelectedNodes)

figma.ui.onmessage = async (action: PluginAction, props) => {
  if (props.origin !== SITE_URL) {
    return
  }

  switch (action.type) {
    case "execute": {
      const { propertySettings } = action.payload

      const propertiesToRandomize = Object.entries(propertySettings).filter(
        ([, { isRandomized }]) => isRandomized,
      ) as [PropertyName, PropertySettings][]

      const { selection } = figma.currentPage

      if (!selection.length) {
        figma.notify("No layers selected")
        break
      }

      propertiesToRandomize.forEach(
        async ([propertyName, propertySettings]) => {
          const { sortOrder } = propertySettings

          const randomValues = selection.map((node) =>
            getRandomPropertyValue({
              node,
              propertySettings,
              propertyName,
            }),
          )

          if (sortOrder !== "random") {
            randomValues.sort(naturalSort)

            if (sortOrder === "desc") {
              randomValues.reverse()
            }
          }

          await Promise.all(
            selection.map(async (node, index) => {
              const value = randomValues[index]

              await setNodeProperty({
                node,
                propertySettings,
                propertyName,
                value,
              })
            }),
          )
        },
      )
      break
    }

    case "requestSettingsFromSelectedNodes": {
      sendSettingsFromSelectedNodes()
      break
    }

    case "saveSettingsToSelectedNodes": {
      const { propertySettings } = action.payload

      const { selection } = figma.currentPage

      selection.forEach((node) => {
        node.setPluginData(
          "property-settings",
          JSON.stringify(propertySettings),
        )
      })

      figma.currentPage.setPluginData(
        "property-settings",
        JSON.stringify(propertySettings),
      )
      break
    }

    default:
      break
  }

  console.log(`Plugin action "${action.type}" fired:`, { action })
}
