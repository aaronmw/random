import { useAppContext } from '@/app/state/AppWrapper'
import { loadPresetFromId } from '@/lib/utils/presetUtils'

export function useLoadPresetFromNodes() {
  const { dispatch, currentUserId, foundPresetId, propertySettings } = useAppContext()

  const loadPresetFromFoundId = async () => {
    if (!foundPresetId || !currentUserId || !dispatch) {
      return
    }

    await loadPresetFromId(
      foundPresetId,
      currentUserId,
      dispatch,
      propertySettings,
    )
  }

  return {
    foundPresetId,
    loadPresetFromFoundId,
  }
}
