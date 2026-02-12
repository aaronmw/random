'use client'

import { useAppContext } from '@/app/state/AppWrapper'
import { Icon } from '@/components/Icon'
import { MenuItemProps } from '@/components/MenuItem'
import { copyToClipboard } from '@/lib/copyToClipboard'
import { getAdminUserId } from '@/lib/utils/getAdminUserId'
import { useMemo } from 'react'
import { twJoin } from 'tailwind-merge'

type UseSettingsMenuItemsParams = {
  handleFactoryReset: () => void
  onToggleUpgradedStatus?: () => void
}

export function useSettingsMenuItems({
  handleFactoryReset,
  onToggleUpgradedStatus,
}: UseSettingsMenuItemsParams): MenuItemProps<'button'>[] {
  const {
    dispatch,
    isGroupedByStatus,
    isGroupedByType,
    isAutoScrollEnabled,
    isAutoLoadFromSelectedNodes,
    currentUserId,
    paymentStatus,
    publishPresetsEnabled,
  } = useAppContext()
  const isAdmin = currentUserId === getAdminUserId()

  return useMemo(
    () => {
      const items: MenuItemProps<'button'>[] = [
        {
          id: 'group-by-status-setting',
          'aria-checked': isGroupedByStatus ? 'true' : 'false',
          'data-enabled': isGroupedByStatus ? 'true' : 'false',
          label: (
            <span className="flex items-center gap-2">
              <span
                className={twJoin(
                  'flex size-8 shrink-0 items-center justify-center',
                  !isGroupedByStatus && 'opacity-0',
                )}
              >
                <Icon name="check" />
              </span>
              <span>Enabled On Top</span>
            </span>
          ),
          onClick: () => {
            try {
              if (dispatch) {
                dispatch({
                  type: 'setStateByPath',
                  payload: {
                    path: 'isGroupedByStatus',
                    value: !isGroupedByStatus,
                  },
                })
              }
            } catch (error) {
              console.error('Error toggling grouped by status:', error)
            }
          },
        },
        {
          id: 'group-by-type-setting',
          'aria-checked': isGroupedByType ? 'true' : 'false',
          'data-enabled': isGroupedByType ? 'true' : 'false',
          label: (
            <span className="flex items-center gap-2">
              <span
                className={twJoin(
                  'flex size-8 shrink-0 items-center justify-center',
                  !isGroupedByType && 'opacity-0',
                )}
              >
                <Icon name="check" />
              </span>
              <span>Group by Type</span>
            </span>
          ),
          onClick: () => {
            try {
              if (dispatch) {
                dispatch({
                  type: 'setStateByPath',
                  payload: {
                    path: 'isGroupedByType',
                    value: !isGroupedByType,
                  },
                })
              }
            } catch (error) {
              console.error('Error toggling grouped by type:', error)
            }
          },
        },
        {
          id: 'auto-scroll-setting',
          'aria-checked': isAutoScrollEnabled ? 'true' : 'false',
          'data-enabled': isAutoScrollEnabled ? 'true' : 'false',
          label: (
            <span className="flex items-center gap-2">
              <span
                className={twJoin(
                  'flex size-8 shrink-0 items-center justify-center',
                  !isAutoScrollEnabled && 'opacity-0',
                )}
              >
                <Icon name="check" />
              </span>
              <span>Auto Scroll</span>
            </span>
          ),
          onClick: () => {
            try {
              if (dispatch) {
                dispatch({
                  type: 'setStateByPath',
                  payload: {
                    path: 'isAutoScrollEnabled',
                    value: !isAutoScrollEnabled,
                  },
                })
              }
            } catch (error) {
              console.error('Error toggling auto-scroll:', error)
            }
          },
        },
        {
          id: 'auto-load-from-selected-nodes-setting',
          'aria-checked': isAutoLoadFromSelectedNodes ? 'true' : 'false',
          'data-enabled': isAutoLoadFromSelectedNodes ? 'true' : 'false',
          label: (
            <span className="flex items-center gap-2">
              <span
                className={twJoin(
                  'flex size-8 shrink-0 items-center justify-center',
                  !isAutoLoadFromSelectedNodes && 'opacity-0',
                )}
              >
                <Icon name="check" />
              </span>
              <span>Auto-Load from Selection</span>
            </span>
          ),
          onClick: () => {
            try {
              if (dispatch) {
                dispatch({
                  type: 'setStateByPath',
                  payload: {
                    path: 'isAutoLoadFromSelectedNodes',
                    value: !isAutoLoadFromSelectedNodes,
                  },
                })
              }
            } catch (error) {
              console.error('Error toggling auto-load from selected nodes:', error)
            }
          },
        },
        {
          id: 'settings-divider',
          label: <div className="horizontal-rule" />,
          onClick: () => {},
          disabled: true,
          className: 'pointer-events-none',
        } as MenuItemProps<'button'>,
        {
          id: 'factory-reset-setting',
          icon: 'power-off',
          label: 'Factory Reset',
          onClick: handleFactoryReset,
        },
      ]

      if (process.env.NODE_ENV === 'development' && currentUserId) {
        items.push({
          id: 'user-id-display',
          icon: 'user',
          label: <span className="font-mono opacity-60">{currentUserId}</span>,
          onClick: () => {
            copyToClipboard(currentUserId)
          },
        } as MenuItemProps<'button'>)
      }

      if (process.env.NODE_ENV === 'development' && isAdmin && onToggleUpgradedStatus) {
        items.push({
          id: 'toggle-upgraded-status',
          'aria-checked': paymentStatus === 'PAID' ? 'true' : 'false',
          label: (
            <span className="flex items-center gap-2">
              <span
                className={twJoin(
                  'flex size-8 shrink-0 items-center justify-center',
                  paymentStatus !== 'PAID' && 'opacity-0',
                )}
              >
                <Icon name="check" />
              </span>
              <span>Upgraded</span>
            </span>
          ),
          onClick: onToggleUpgradedStatus,
        })
      }

      if (process.env.NODE_ENV === 'development' && isAdmin) {
        items.push({
          id: 'toggle-publish-presets',
          'aria-checked': publishPresetsEnabled ? 'true' : 'false',
          label: (
            <span className="flex items-center gap-2">
              <span
                className={twJoin(
                  'flex size-8 shrink-0 items-center justify-center',
                  !publishPresetsEnabled && 'opacity-0',
                )}
              >
                <Icon name="check" />
              </span>
              <span>Publish presets</span>
            </span>
          ),
          onClick: () => {
            if (dispatch) {
              dispatch({
                type: 'setPublishPresetsEnabled',
                payload: { publishPresetsEnabled: !publishPresetsEnabled },
              })
            }
          },
        })
      }

      return items
    },
    [
      dispatch,
      isGroupedByStatus,
      isGroupedByType,
      isAutoScrollEnabled,
      isAutoLoadFromSelectedNodes,
      currentUserId,
      paymentStatus,
      publishPresetsEnabled,
      isAdmin,
      handleFactoryReset,
      onToggleUpgradedStatus,
    ],
  )
}
