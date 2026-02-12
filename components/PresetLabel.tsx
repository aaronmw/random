import { Icon } from '@/components/Icon'
import { MenuButton } from '@/components/MenuButton'
import { MenuItemProps } from '@/components/MenuItem'
import { getPresetDisplayLabel } from '@/lib/utils/presetUtils'
import { MouseEvent } from 'react'
import { twJoin } from 'tailwind-merge'

export type PresetLabelProps = {
  preset: {
    id: string
    label: string | null
    figma_user_id: string
    visibility?: 'public' | 'private' | 'hidden'
  }
  enabledPropertiesText: string | null
  isOwnPreset: boolean
  actionsMenuItems?: MenuItemProps<'button'>[]
  onToggleActionsMenu: (presetId: string) => void
}

export function PresetLabel({
  preset,
  enabledPropertiesText,
  isOwnPreset,
  actionsMenuItems,
  onToggleActionsMenu,
}: PresetLabelProps) {
  return (
    <span
      className={twJoin(
        'flex',
        'w-full',
        'items-baseline',
        'justify-between',
        'gap-6',
        'py-2',
      )}
    >
      <span className="flex flex-col items-start">
        <span className={isOwnPreset ? '' : 'whitespace-nowrap'}>
          {getPresetDisplayLabel(preset.label)}
          {!isOwnPreset && (
            <span className="text-text-secondary ml-2 text-xs">
              by {preset.figma_user_id.slice(0, 8)}
            </span>
          )}
        </span>
        {enabledPropertiesText && (
          <span
            className={twJoin(
              '-mt-0.5',
              'font-mono font-bold lowercase opacity-60',
              'text-left',
            )}
          >
            {enabledPropertiesText}
          </span>
        )}
      </span>
      <span className="flex items-baseline gap-3">
        {isOwnPreset && actionsMenuItems && (
          <span
            className="preset-actions-menu"
            onClick={(e: MouseEvent) => {
              e.stopPropagation()
              onToggleActionsMenu(preset.id)
            }}
          >
            <MenuButton items={actionsMenuItems}>
              <Icon
                name="ellipsis-vertical"
                className="transition-none"
              />
            </MenuButton>
          </span>
        )}
      </span>
    </span>
  )
}
