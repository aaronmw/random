import { AppState } from '@/app/types'
import { AppAction } from '@/app/state/AppReducer'
import {
  DEBOUNCE_TIMEOUT,
  USER_OPTIONS_CLEAR_TIMEOUT,
} from '@/lib/constants'
import { updateUserOptions } from '@/lib/services/userOptionsService'
import { dispatchTestSignal } from '@/lib/utils/testSignals'
import { useEffect } from 'react'

interface UseUserOptionsPersistenceParams {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  isLoading: boolean
  hasLoadedInitialOptionsRef: React.MutableRefObject<boolean>
  pendingUserOptionsUpdateRef: React.MutableRefObject<{
    timestamp: number
    values: {
      is_auto_scroll_enabled: boolean
      is_grouped_by_status: boolean
      is_grouped_by_type: boolean
      is_auto_load_from_selected_nodes: boolean
    }
  } | null>
  sessionId: string
}

export function useUserOptionsPersistence({
  state,
  dispatch,
  isLoading,
  hasLoadedInitialOptionsRef,
  pendingUserOptionsUpdateRef,
  sessionId,
}: UseUserOptionsPersistenceParams) {
  // Persist user options when they change (but not on initial load)
  useEffect(() => {
    // Use currentUserId from state (which was set from URL on mount)
    const userIdToUse = state.currentUserId

    console.log('Persistence useEffect triggered:', {
      currentUserId: state.currentUserId,
      userIdToUse,
      isLoading,
      hasLoadedInitialOptions: hasLoadedInitialOptionsRef.current,
      isGroupedByStatus: state.isGroupedByStatus,
      isGroupedByType: state.isGroupedByType,
    })

    if (!userIdToUse || isLoading || !hasLoadedInitialOptionsRef.current) {
      console.log('Skipping persistence:', {
        reason: !userIdToUse
          ? 'no userId'
          : isLoading
            ? 'isLoading'
            : 'ref not set',
      })
      return
    }

    // Debounce updates to avoid excessive database calls
    const timeoutId = setTimeout(async () => {
      try {
        // Defensive check - ensure we still have a valid userId
        if (!userIdToUse) {
          console.log('[DEBUG] Skipping persistence - no userId')
          return
        }

        const updateValues = {
          is_auto_scroll_enabled: state.isAutoScrollEnabled,
          is_grouped_by_status: state.isGroupedByStatus,
          is_grouped_by_type: state.isGroupedByType,
          is_auto_load_from_selected_nodes: state.isAutoLoadFromSelectedNodes,
        }

        console.log(
          '[DEBUG] Persisting user options to database...',
          updateValues,
        )

        // Track this update so we can ignore it in realtime handler
        pendingUserOptionsUpdateRef.current = {
          timestamp: Date.now(),
          values: updateValues,
        }

        try {
          console.log('💾 Calling updateUserOptions with:', {
            userIdToUse,
            updateValues,
            sessionId,
          })
          const result = await updateUserOptions(userIdToUse, updateValues)
          console.log('📦 updateUserOptions returned:', result)

          if (result) {
            console.log('✅ User options persisted successfully:', {
              isAutoScrollEnabled: result.is_auto_scroll_enabled,
              isGroupedByStatus: result.is_grouped_by_status,
              isGroupedByType: result.is_grouped_by_type,
              sessionId,
              date_modified: result.date_modified,
            })

            // Dispatch test signals for each updated option
            dispatchTestSignal({
              type: 'user-option-updated',
              optionName: 'isAutoScrollEnabled',
              value: result.is_auto_scroll_enabled,
            })
            dispatchTestSignal({
              type: 'user-option-updated',
              optionName: 'isGroupedByStatus',
              value: result.is_grouped_by_status,
            })
            dispatchTestSignal({
              type: 'user-option-updated',
              optionName: 'isGroupedByType',
              value: result.is_grouped_by_type,
            })
            dispatchTestSignal({
              type: 'user-option-updated',
              optionName: 'isAutoLoadFromSelectedNodes',
              value: result.is_auto_load_from_selected_nodes,
            })

            // Realtime subscription will update the UI automatically
            // Clear pending update after successful save (with a small delay to allow realtime to process)
            setTimeout(() => {
              pendingUserOptionsUpdateRef.current = null
            }, USER_OPTIONS_CLEAR_TIMEOUT)
          } else {
            console.warn(
              '⚠️ User options update returned null (table may not exist)',
            )
            pendingUserOptionsUpdateRef.current = null
          }
        } catch (error) {
          console.error('[DEBUG] Error in persistence timeout callback:', error)
          console.error('❌ Error persisting user options:', error)
          pendingUserOptionsUpdateRef.current = null
          // Don't throw - allow app to continue with defaults
        }
      } catch (error) {
        console.error('❌ Outer error persisting user options:', error)
        pendingUserOptionsUpdateRef.current = null
      }
    }, DEBOUNCE_TIMEOUT)

    return () => {
      try {
        clearTimeout(timeoutId)
      } catch (error) {
        console.error('[DEBUG] Error clearing timeout:', error)
      }
    }
  }, [
    state.currentUserId,
    state.isAutoScrollEnabled,
    state.isGroupedByStatus,
    state.isGroupedByType,
    state.isAutoLoadFromSelectedNodes,
    isLoading,
    dispatch,
    hasLoadedInitialOptionsRef,
    pendingUserOptionsUpdateRef,
    sessionId,
  ])
}
