import { PluginAction } from "@/app/types"

export function dispatchPluginAction(pluginAction: PluginAction) {
  // For Cypress tests
  if (process.env.NODE_ENV === "development") {
    console.log("dispatchPluginAction", pluginAction)
  }

  // Defensive check - ensure parent is available (not available in all test environments)
  if (typeof parent === 'undefined' || !parent.postMessage) {
    console.warn('parent.postMessage not available, skipping plugin action:', pluginAction.type)
    return
  }

  try {
    parent.postMessage(
      {
        pluginMessage: pluginAction,
        pluginId: "829089184334973766",
      },
      "*",
    )
  } catch (error) {
    console.error('Error dispatching plugin action:', error)
    // Don't throw - allow app to continue
  }
}
