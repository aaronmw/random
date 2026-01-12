import { IconString } from '@/components/Icon'
import { MenuItemProps } from '@/components/MenuItem'
import { PresetLabel } from '@/components/PresetLabel'
import { usePresets } from '@/lib/hooks/usePresets'
import { formatPropertyName } from '@/lib/utils/presetUtils'
import kebabCase from 'lodash/kebabCase'
import React, { MouseEvent, useMemo, useState } from 'react'

type Preset = {
  id: string
  label: string | null
  figma_user_id: string
  visibility?: 'public' | 'private' | 'hidden'
}

type PresetForMenu = {
  id: string
  label: string | null
  figma_user_id: string
  visibility?: 'public' | 'private' | 'hidden'
}

type UsePresetMenuItemsParams = {
  pendingPublicPresetChangesCount: number
  handleClickCreateNew: (event: MouseEvent) => void
  handleClickLoadPreset: (presetId: string) => void
  handleClickRenamePreset: (
    presetName: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => void
  handleClickToggleVisibility: (
    presetId: string,
    newVisibility: 'private' | 'public',
    event: MouseEvent<HTMLButtonElement>,
  ) => void
  handleClickOverwritePreset: (
    presetId: string,
    presetName: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => void
  handleClickDeletePreset: (
    presetName: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => void
  handleSyncPublicPresetChanges: () => void
}

const createDividerMenuItem = (): MenuItemProps<'button'> => ({
  id: 'presets-divider',
  label: React.createElement('div', {
    className: 'horizontal-rule',
  }),
  onClick: () => {},
  disabled: true,
  className: 'pointer-events-none',
})

const createGroupHeaderMenuItem = (
  label: string,
  id: string,
): MenuItemProps<'button'> => ({
  id,
  label: <span className="label">{label}</span>,
  onClick: () => {},
  disabled: true,
  className: 'pointer-events-none',
})

const getEnabledPropertiesText = (
  presetId: string,
  presetEnabledProperties: Record<string, string[]>,
): string | null => {
  const enabledProperties = presetEnabledProperties[presetId] || []
  if (enabledProperties.length === 0) {
    return null
  }

  const MAX_PROPERTIES_TO_SHOW = 5
  const propertiesToShow = enabledProperties.slice(0, MAX_PROPERTIES_TO_SHOW)
  const remainingCount = enabledProperties.length - MAX_PROPERTIES_TO_SHOW

  const formattedProperties = propertiesToShow
    .map(formatPropertyName)
    .join(', ')

  return remainingCount > 0
    ? `${formattedProperties} + ${remainingCount}`
    : formattedProperties
}

const createActionsMenuItems = (
  preset: Preset,
  setPresetActionsMenuOpen: (id: string | null) => void,
  handleClickRenamePreset: (
    presetName: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => void,
  handleClickToggleVisibility: (
    presetId: string,
    newVisibility: 'private' | 'public',
    event: MouseEvent<HTMLButtonElement>,
  ) => void,
  handleClickOverwritePreset: (
    presetId: string,
    presetName: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => void,
  handleClickDeletePreset: (
    presetName: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => void,
): MenuItemProps<'button'>[] => {
  // Special handling for __default__ preset - only show "Overwrite with Current" action
  if (preset.label === '__default__') {
    return [
      {
        id: 'overwrite',
        icon: 'floppy-disk',
        label: 'Overwrite with Current',
        onClick: (e: MouseEvent) => {
          e.stopPropagation()
          setPresetActionsMenuOpen(null)
          handleClickOverwritePreset(preset.id, preset.label || '', e as any)
        },
      },
    ]
  }

  return [
    {
      id: 'rename',
      icon: 'pencil',
      label: 'Rename',
      onClick: (e: MouseEvent) => {
        e.stopPropagation()
        setPresetActionsMenuOpen(null)
        handleClickRenamePreset(preset.label || '', e as any)
      },
    },
    {
      id: 'visibility',
      icon: (preset.visibility === 'public' ? 'lock' : 'globe') as IconString,
      label: preset.visibility === 'public' ? 'Unpublish' : 'Publish',
      onClick: (e: MouseEvent) => {
        e.stopPropagation()
        setPresetActionsMenuOpen(null)
        handleClickToggleVisibility(
          preset.id,
          preset.visibility === 'public' ? 'private' : 'public',
          e as any,
        )
      },
    },
    {
      id: 'overwrite',
      icon: 'floppy-disk',
      label: 'Overwrite with Current',
      onClick: (e: MouseEvent) => {
        e.stopPropagation()
        setPresetActionsMenuOpen(null)
        handleClickOverwritePreset(preset.id, preset.label || '', e as any)
      },
    },
    {
      id: 'delete',
      icon: 'trash',
      label: 'Delete',
      className:
        'text-text-danger [&>span]:group-hover/menuItem:bg-bg-danger [&>span]:group-hover/menuItem:text-white [&>span>*]:group-hover/menuItem:text-white',
      onClick: (e: MouseEvent) => {
        e.stopPropagation()
        setPresetActionsMenuOpen(null)
        handleClickDeletePreset(preset.label || '', e as any)
      },
    },
  ]
}

const createPresetMenuItem = (
  preset: Preset,
  presetEnabledProperties: Record<string, string[]>,
  presetActionsMenuOpen: string | null,
  setPresetActionsMenuOpen: (id: string | null) => void,
  handleClickLoadPreset: (presetId: string) => void,
  isOwnPreset: boolean,
  actionsMenuItems?: MenuItemProps<'button'>[],
): MenuItemProps<'button'> => {
  const enabledPropertiesText = getEnabledPropertiesText(
    preset.id,
    presetEnabledProperties,
  )

  return {
    onClick: (e: MouseEvent) => {
      e.stopPropagation()
      if (
        isOwnPreset &&
        (e.target as HTMLElement).closest('.preset-actions-menu')
      ) {
        return
      }
      handleClickLoadPreset(preset.id)
    },
    icon: 'bookmark' as IconString,
    id: `preset-button-${kebabCase(preset.label || '')}`,
    label: (
      <PresetLabel
        preset={preset}
        enabledPropertiesText={enabledPropertiesText}
        isOwnPreset={isOwnPreset}
        actionsMenuItems={actionsMenuItems}
        presetActionsMenuOpen={presetActionsMenuOpen}
        onToggleActionsMenu={(presetId) =>
          setPresetActionsMenuOpen(
            presetActionsMenuOpen === presetId ? null : presetId,
          )
        }
      />
    ),
  }
}

export function usePresetMenuItems({
  pendingPublicPresetChangesCount,
  handleClickCreateNew,
  handleClickLoadPreset,
  handleClickRenamePreset,
  handleClickToggleVisibility,
  handleClickOverwritePreset,
  handleClickDeletePreset,
  handleSyncPublicPresetChanges,
}: UsePresetMenuItemsParams): { presetMenuItems: MenuItemProps<'button'>[] } {
  const { userPresets, publicPresets, allPresets, presetEnabledProperties } =
    usePresets()

  const [presetActionsMenuOpen, setPresetActionsMenuOpen] = useState<
    string | null
  >(null)

  const buildPresetMenuItems = (): MenuItemProps<'button'>[] => {
    const defaultPreset = userPresets.find((p) => p.label === '__default__')
    const privatePresets = userPresets.filter(
      (p) => p.visibility !== 'public' && p.label !== '__default__',
    )
    const publishedPresets = userPresets.filter(
      (p) => p.visibility === 'public',
    )
    const hasAnyPresets =
      defaultPreset !== undefined ||
      privatePresets.length > 0 ||
      publishedPresets.length > 0 ||
      publicPresets.length > 0

    if (!hasAnyPresets) {
      return []
    }

    const items: MenuItemProps<'button'>[] = []

    if (
      defaultPreset !== undefined ||
      privatePresets.length > 0 ||
      publishedPresets.length > 0
    ) {
      items.push(createDividerMenuItem())
    }

    // Show default preset first if it exists (admin only)
    if (defaultPreset) {
      items.push(
        createPresetMenuItem(
          defaultPreset,
          presetEnabledProperties,
          presetActionsMenuOpen,
          setPresetActionsMenuOpen,
          handleClickLoadPreset,
          true,
          createActionsMenuItems(
            defaultPreset,
            setPresetActionsMenuOpen,
            handleClickRenamePreset,
            handleClickToggleVisibility,
            handleClickOverwritePreset,
            handleClickDeletePreset,
          ),
        ),
      )
    }

    if (privatePresets.length > 0) {
      items.push(createGroupHeaderMenuItem('Private', 'private-group-header'))
      items.push(
        ...privatePresets.map((preset) =>
          createPresetMenuItem(
            preset,
            presetEnabledProperties,
            presetActionsMenuOpen,
            setPresetActionsMenuOpen,
            handleClickLoadPreset,
            true,
            createActionsMenuItems(
              preset,
              setPresetActionsMenuOpen,
              handleClickRenamePreset,
              handleClickToggleVisibility,
              handleClickOverwritePreset,
              handleClickDeletePreset,
            ),
          ),
        ),
      )
    }

    if (publishedPresets.length > 0 || publicPresets.length > 0) {
      items.push(
        createGroupHeaderMenuItem('Published', 'published-group-header'),
      )
      items.push(
        ...publishedPresets.map((preset) =>
          createPresetMenuItem(
            preset,
            presetEnabledProperties,
            presetActionsMenuOpen,
            setPresetActionsMenuOpen,
            handleClickLoadPreset,
            true,
            createActionsMenuItems(
              preset,
              setPresetActionsMenuOpen,
              handleClickRenamePreset,
              handleClickToggleVisibility,
              handleClickOverwritePreset,
              handleClickDeletePreset,
            ),
          ),
        ),
        ...publicPresets.map((preset) =>
          createPresetMenuItem(
            preset,
            presetEnabledProperties,
            presetActionsMenuOpen,
            setPresetActionsMenuOpen,
            handleClickLoadPreset,
            false,
          ),
        ),
      )
    }

    return items
  }

  const buildSyncMenuItems = (): MenuItemProps<'button'>[] => {
    const hasAnyPublicPresets = allPresets.some(
      (preset) =>
        preset.visibility === 'public' &&
        preset.label !== '__local__' &&
        preset.label !== '__default__',
    )
    const shouldShowSyncButton =
      hasAnyPublicPresets || pendingPublicPresetChangesCount > 0

    if (!shouldShowSyncButton) {
      return []
    }

    const publishedUserPresets = userPresets.filter(
      (p) => p.visibility === 'public',
    )
    const hasPublishedUserPresets = publishedUserPresets.length > 0

    const items: MenuItemProps<'button'>[] = []

    if (hasPublishedUserPresets || publicPresets.length > 0) {
      items.push({
        ...createDividerMenuItem(),
        id: 'public-presets-divider',
      })
    }

    items.push({
      icon: 'arrows-rotate' as IconString,
      id: 'sync-public-presets-button',
      label:
        pendingPublicPresetChangesCount > 0
          ? `Sync ${pendingPublicPresetChangesCount} Change${pendingPublicPresetChangesCount === 1 ? '' : 's'}`
          : 'Up to date',
      onClick: (e: MouseEvent) => {
        e.stopPropagation()
        if (pendingPublicPresetChangesCount > 0) {
          handleSyncPublicPresetChanges()
        }
      },
      disabled: pendingPublicPresetChangesCount === 0,
    })

    return items
  }

  const presetMenuItems: MenuItemProps<'button'>[] = useMemo(
    () => [
      {
        icon: 'plus' as IconString,
        id: 'create-new-preset-button',
        label: 'Create New',
        onClick: handleClickCreateNew,
      },
      ...buildPresetMenuItems(),
      ...buildSyncMenuItems(),
    ],
    [
      pendingPublicPresetChangesCount,
      presetActionsMenuOpen,
      handleClickCreateNew,
      handleClickLoadPreset,
      handleClickRenamePreset,
      handleClickToggleVisibility,
      handleClickOverwritePreset,
      handleClickDeletePreset,
      handleSyncPublicPresetChanges,
      userPresets,
      publicPresets,
      allPresets,
      presetEnabledProperties,
    ],
  )

  return { presetMenuItems }
}
