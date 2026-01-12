import { Icon } from '@/components/Icon'
import { MenuItemProps } from '@/components/MenuItem'
import { copyToClipboard } from '@/lib/copyToClipboard'
import { twJoin } from 'tailwind-merge'

type SettingsMenuItemsParams = {
  isGroupedByStatus: boolean
  isGroupedByType: boolean
  isAutoScrollEnabled: boolean
  isAutoLoadFromSelectedNodes: boolean
  dispatch: any
  handleFactoryReset: () => void
  currentUserId?: string | null
}

export function getSettingsMenuItems({
  isGroupedByStatus,
  isGroupedByType,
  isAutoScrollEnabled,
  isAutoLoadFromSelectedNodes,
  dispatch,
  handleFactoryReset,
  currentUserId,
}: SettingsMenuItemsParams): MenuItemProps<'button'>[] {
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

  return items
}
