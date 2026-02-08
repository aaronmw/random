import { AppState, PluginToAppMessage, PropertySettingsRow } from '@/app/types'
import { AppAction } from '@/app/state/AppReducer'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import { getLocalPresetId, loadPreset } from '@/lib/services/propertySettingsService'
import { loadPresetFromId } from '@/lib/utils/presetUtils'
import { useEffect, useRef } from 'react'

interface UseMessageHandlerParams {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  propertySettingsRef: React.MutableRefObject<AppState['propertySettings']>
  currentUserIdRef: React.MutableRefObject<string | null>
  isAutoLoadFromSelectedNodesRef: React.MutableRefObject<boolean>
  activePresetIdRef: React.MutableRefObject<string | null>
}

export function useMessageHandler({
  state,
  dispatch,
  propertySettingsRef,
  currentUserIdRef,
  isAutoLoadFromSelectedNodesRef,
  activePresetIdRef,
}: UseMessageHandlerParams) {
  // Track if we've already requested initial selection to avoid doing it on every re-run
  const hasRequestedInitialSelectionRef = useRef(false)

  useEffect(
    () => {
      // Synchronous logging to catch errors before page crashes
      console.log('[DEBUG] Message handler useEffect starting', {
        hasState: !!state,
        hasDispatch: !!dispatch,
        currentUserId: state?.currentUserId,
        isAutoLoadFromSelectedNodes: state?.isAutoLoadFromSelectedNodes,
      })

      // Defensive check - ensure state and dispatch are valid
      if (!state || !dispatch) {
        console.error(
          '[DEBUG] Invalid state or dispatch in message handler setup',
        )
        return
      }

      // Ensure refs are initialized with current state values
      // This prevents using stale values if the effect runs before refs are updated
      // Use defensive checks to ensure values are valid
      try {
        if (state.propertySettings) {
          propertySettingsRef.current = state.propertySettings
        }
        if (state.currentUserId !== undefined && state.currentUserId !== null) {
          currentUserIdRef.current = state.currentUserId
        }
        if (state.isAutoLoadFromSelectedNodes !== undefined) {
          isAutoLoadFromSelectedNodesRef.current =
            state.isAutoLoadFromSelectedNodes
        }
        if (state.activePresetId !== undefined) {
          activePresetIdRef.current = state.activePresetId
        }
        console.log('[DEBUG] Refs initialized successfully')
      } catch (error) {
        console.error('[DEBUG] Error initializing refs:', error)
        return
      }

      const handleMessage = (event: {
        data: {
          pluginMessage:
            | PluginToAppMessage
            | { type: 'init'; payload: { figmaUserId: string | null } }
        }
      }) => {
        try {
          switch (event.data?.pluginMessage?.type) {
            case 'init': {
              const { figmaUserId } = event.data.pluginMessage.payload
              if (figmaUserId) {
                // Always update currentUserId if we receive it from plugin
                // This ensures we have it even if URL doesn't have it
                dispatch({
                  type: 'setStateByPath',
                  payload: {
                    path: 'currentUserId',
                    value: figmaUserId,
                  },
                })
                console.log(
                  'Received figmaUserId from plugin init:',
                  figmaUserId,
                )
              }
              break
            }
            case 'setSelectedNodePluginData': {
              const data = event.data.pluginMessage.payload
              console.log(
                'Received selected node plugin data:',
                data.length,
                'nodes',
              )

              // Check if any selected nodes have a preset ID
              const nodeData = data as (Partial<PropertySettingsRow> & {
                presetId?: string
              })[]
              const presetIds = nodeData
                .map((node) => (node as any).presetId)
                .filter((id): id is string => !!id)

              console.log('Preset ID extraction:', {
                nodeDataLength: nodeData.length,
                nodeDataSample: nodeData.slice(0, 2).map((node) => ({
                  hasPresetId: 'presetId' in node,
                  presetId: (node as any).presetId,
                })),
                presetIds,
                presetIdsLength: presetIds.length,
                currentUserId: state.currentUserId,
              })

              if (presetIds.length > 0 && currentUserIdRef.current) {
                // Use the first preset ID found (if multiple nodes have different IDs, use the first one)
                const presetIdToLoad = presetIds[0]

                // Check if auto-load is enabled
                if (isAutoLoadFromSelectedNodesRef.current) {
                  // No-op: if this preset is already active, skip loading
                  if (activePresetIdRef.current === presetIdToLoad) {
                    console.log(
                      'Preset already active, skipping reload:',
                      presetIdToLoad,
                    )
                  } else {
                    console.log(
                      'Found preset ID on selected nodes, auto-loading preset:',
                      presetIdToLoad,
                    )

                    // Clear found preset ID since we're auto-loading (no button needed)
                    dispatch({
                      type: 'setFoundPresetId',
                      payload: {
                        presetId: null,
                      },
                    })

                    // Set loading state
                    dispatch({
                      type: 'setPresetLoading',
                      payload: { isLoading: true },
                    })

                    // Set this preset as active
                    dispatch({
                      type: 'setActivePresetId',
                      payload: {
                        presetId: presetIdToLoad,
                      },
                    })

                    // Load the preset and merge into local preset for editing
                    // Wrap in catch to prevent unhandled promise rejections
                    // Defensive check - ensure we have valid state
                    if (!state.currentUserId || !state.propertySettings) {
                      console.error(
                        'Invalid state when trying to load preset:',
                        {
                          currentUserId: state.currentUserId,
                          hasPropertySettings: !!state.propertySettings,
                        },
                      )
                      return
                    }
                    // Use ref to get latest propertySettings without including it in dependencies
                    const currentPropertySettings = propertySettingsRef.current
                    if (
                      !currentPropertySettings ||
                      typeof currentPropertySettings !== 'object'
                    ) {
                      console.error(
                        'Invalid propertySettings when trying to load preset',
                      )
                      return
                    }
                    loadPresetFromId(
                      presetIdToLoad,
                      currentUserIdRef.current!,
                      dispatch,
                      currentPropertySettings,
                    ).catch((error) => {
                      console.error('Error in loadPresetFromId:', error)
                    })
                  }
                } else {
                  // Auto-load disabled - track the preset ID for manual loading button
                  // But only if this preset isn't already active (user may have already loaded it)
                  if (activePresetIdRef.current !== presetIdToLoad) {
                    dispatch({
                      type: 'setFoundPresetId',
                      payload: {
                        presetId: presetIdToLoad,
                      },
                    })
                    console.log(
                      'Found preset ID on selected nodes (auto-load disabled):',
                      presetIdToLoad,
                    )
                  } else {
                    // Preset is already active, clear found preset ID to hide button
                    dispatch({
                      type: 'setFoundPresetId',
                      payload: {
                        presetId: null,
                      },
                    })
                    console.log(
                      'Preset already active, hiding load button:',
                      presetIdToLoad,
                    )
                  }
                }
              } else {
                // No preset IDs found - clear found preset ID
                dispatch({
                  type: 'setFoundPresetId',
                  payload: {
                    presetId: null,
                  },
                })
                // No preset IDs found - switch back to local preset
                if (activePresetIdRef.current !== null) {
                  console.log(
                    'No preset IDs found on nodes, switching back to local preset',
                  )

                  // Set loading state
                  dispatch({
                    type: 'setPresetLoading',
                    payload: { isLoading: true },
                  })

                  // Clear active preset
                  dispatch({
                    type: 'setActivePresetId',
                    payload: {
                      presetId: null,
                    },
                  })

                  // Reload local preset
                  if (currentUserIdRef.current) {
                    getLocalPresetId(currentUserIdRef.current)
                      .then((localPresetId) => {
                        if (localPresetId) {
                          loadPreset(localPresetId)
                            .then((localPresetPropertySettings) => {
                              dispatch({
                                type: 'loadPreset',
                                payload: {
                                  presetPropertySettings:
                                    localPresetPropertySettings,
                                },
                              })
                              // Clear loading state
                              dispatch({
                                type: 'setPresetLoading',
                                payload: { isLoading: false },
                              })
                            })
                            .catch((error) => {
                              console.error(
                                'Error loading local preset:',
                                error,
                              )
                              dispatch({
                                type: 'setPresetLoading',
                                payload: { isLoading: false },
                              })
                            })
                        } else {
                          dispatch({
                            type: 'setPresetLoading',
                            payload: { isLoading: false },
                          })
                        }
                      })
                      .catch((error) => {
                        console.error('Error getting local preset ID:', error)
                        dispatch({
                          type: 'setPresetLoading',
                          payload: { isLoading: false },
                        })
                      })
                  } else {
                    dispatch({
                      type: 'setPresetLoading',
                      payload: { isLoading: false },
                    })
                  }
                }
              }
              dispatch({
                type: 'setSelectedNodePluginData',
                payload: {
                  partialPropertySettings: nodeData.map(
                    ({ presetId, ...rest }) => rest,
                  ),
                },
              })
              break
            }
          }
        } catch (error) {
          console.error('Error handling plugin message:', error)
        }
      }

      try {
        console.log('[DEBUG] Setting window.onmessage handler')
        window.onmessage = handleMessage
        console.log('[DEBUG] window.onmessage handler set successfully')

        // Only request current selection on initial setup, not on every re-run
        // This prevents excessive message sending when dependencies change
        if (
          currentUserIdRef.current &&
          !hasRequestedInitialSelectionRef.current
        ) {
          try {
            console.log('[DEBUG] Requesting initial selection')
            dispatchPluginAction({ type: 'getCurrentSelection' })
            hasRequestedInitialSelectionRef.current = true
            console.log('[DEBUG] Initial selection requested')
          } catch (error) {
            // Ignore errors from dispatchPluginAction (e.g., in test environment)
            console.warn(
              '[DEBUG] Failed to dispatch getCurrentSelection:',
              error,
            )
          }
        }
        console.log('[DEBUG] Message handler setup completed successfully')
      } catch (error) {
        console.error('[DEBUG] Error in message handler setup:', error)
        console.error('Error setting up message handler:', error)
      }

      // Cleanup
      // Note: In StrictMode, this cleanup runs before the effect runs again
      // We always clear window.onmessage here, and the effect will set it again
      return () => {
        try {
          console.log('[DEBUG] Cleaning up message handler')
          // Always clear - the effect will set it again if needed
          // This is safe because the effect runs after cleanup in StrictMode
          window.onmessage = null as any
          console.log('[DEBUG] Message handler cleaned up')
        } catch (error) {
          console.error('[DEBUG] Error cleaning up message handler:', error)
        }
      }
    },
    [
      // Note: We intentionally don't include dispatch or state values in dependencies
      // because:
      // 1. dispatch from useReducer is stable and doesn't need to be in deps
      // 2. We use refs to always get the latest state values without causing
      //    the message handler to be recreated
      // 3. The refs are updated in a separate useEffect whenever state changes
      // IMPORTANT: This effect should only run once on mount, not on every state change
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ],
  )
}
