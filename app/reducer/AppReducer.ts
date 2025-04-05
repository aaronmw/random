import { AppState, PluginToAppMessage } from '@/lib/types'

export { AppReducer }

const AppReducer = (state: AppState, action: PluginToAppMessage) => {
  return state

  /*
  if (typeof action === 'undefined') {
    return state
  }

  const newState = produce(state, (draft) => {
    switch (action.type) {
      case 'setSelectedNodePluginData': {
        const { partialPropertySettings } = action.payload

        const recognizedProperties = Object.fromEntries(
          Object.entries(partialPropertySettings).filter(
            ([key]) => key in draft.propertySettings,
          ),
        )

        // Turn off enabled properties
        Object.values(draft.propertySettings).forEach((propertySettings) => {
          propertySettings.isEnabled = false
        })

        merge(draft.propertySettings, recognizedProperties)
        break
      }

      case 'setPreserveAspectRatio': {
        const { preserveAspectRatio, propertyName } = action.payload

        const sideEffects = getSideEffectsForPreservingAspectRatio({
          preserveAspectRatio,
          propertyName,
          state: draft,
        })

        draft.propertySettings[propertyName].preserveAspectRatio =
          preserveAspectRatio

        sideEffects.forEach(([path, value]) => {
          set(draft, path, value)
        })
        break
      }

      case 'setStateByPath': {
        const { path, value } = action.payload
        set(draft, path, value)
        break
      }
    }
  })

  const stateHasChanged = !isEqual(state, newState)

  console.log(
    `App action ${action.type} fired${!stateHasChanged ? ', but no state change' : ''}:`,
    {
      action,
      prevState: state,
      newState,
    },
  )

  return stateHasChanged ? newState : state
  */
}
