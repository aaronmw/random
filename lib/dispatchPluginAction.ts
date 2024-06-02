import { PluginAction } from "@/lib/types"

export function dispatchPluginAction(pluginAction: PluginAction) {
  // For Cypress tests
  if (process.env.NODE_ENV === "development") {
    console.log("dispatchPluginAction", pluginAction)
  }

  parent.postMessage(
    {
      pluginMessage: pluginAction,
      pluginId: "829089184334973766",
    },
    "*",
  )
}
