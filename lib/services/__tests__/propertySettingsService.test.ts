import { describe, expect, it, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import type { PropertySettingsWithDetails } from '../propertySettingsService'

vi.mock('@/supabase/client', () => ({
  supabaseClient: {
    from: vi.fn(),
  },
}))

vi.mock('@/lib/utils/getAdminUserId', () => ({
  getAdminUserId: vi.fn(),
}))

vi.mock('@/lib/utils/networkActivity', () => ({
  startNetworkActivity: vi.fn(),
  endNetworkActivity: vi.fn(),
}))

import {
  endNetworkActivity,
  startNetworkActivity,
} from '@/lib/utils/networkActivity'
import { getAdminUserId } from '@/lib/utils/getAdminUserId'
import { supabaseClient } from '@/supabase/client'

let createPreset: typeof import('../propertySettingsService').createPreset
let updatePreset: typeof import('../propertySettingsService').updatePreset
let deletePreset: typeof import('../propertySettingsService').deletePreset
let updatePresetLabel: typeof import('../propertySettingsService').updatePresetLabel

beforeAll(async () => {
  const serviceModule = await import('../propertySettingsService')
  createPreset = serviceModule.createPreset
  updatePreset = serviceModule.updatePreset
  deletePreset = serviceModule.deletePreset
  updatePresetLabel = serviceModule.updatePresetLabel
})

describe('propertySettingsService', () => {
  const mockSupabaseClient = vi.mocked(supabaseClient)
  const mockGetAdminUserId = vi.mocked(getAdminUserId)

  const mockPropertySettings: PropertySettingsWithDetails[] = [
    {
      id: 'ps-1',
      preset_id: 'preset-1',
      label: 'opacity',
      is_enabled: true,
      randomization_mode: 'range',
      post_randomization_sort_order: null,
      date_created: '2024-01-01',
      date_modified: '2024-01-01',
    },
    {
      id: 'ps-2',
      preset_id: 'preset-1',
      label: 'fillColor',
      is_enabled: true,
      randomization_mode: 'list',
      post_randomization_sort_order: null,
      date_created: '2024-01-01',
      date_modified: '2024-01-01',
      list_property_settings: {
        id: 'lps-1',
        property_setting_id: 'ps-2',
        options: 'red\ngreen\nblue',
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAdminUserId.mockReturnValue('admin-user-id')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createPreset', () => {
    it('should create a preset with property settings', async () => {
      const mockPreset = {
        id: 'new-preset-id',
        label: 'Test Preset',
        figma_user_id: 'user-1',
        visibility: 'private' as const,
        date_created: '2024-01-01',
        date_modified: '2024-01-01',
      }

      const mockInsertPreset = vi.fn().mockResolvedValue({
        data: mockPreset,
        error: null,
      })

      const mockInsertPropertySettings = vi.fn().mockResolvedValue({
        data: [
          { id: 'new-ps-1', label: 'opacity', preset_id: 'new-preset-id' },
          { id: 'new-ps-2', label: 'fillColor', preset_id: 'new-preset-id' },
        ],
        error: null,
      })

      const mockInsertListSettings = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      let fromCallCount = 0
      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'presets') {
          fromCallCount++
          if (fromCallCount === 1) {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(mockInsertPreset()),
                }),
              }),
            }
          }
        }
        if (table === 'property_settings') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockResolvedValue(mockInsertPropertySettings()),
            }),
          }
        }
        if (table === 'list_property_settings') {
          return {
            insert: vi.fn().mockResolvedValue(mockInsertListSettings()),
          }
        }
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }
      })

      const result = await createPreset(
        'user-1',
        'Test Preset',
        mockPropertySettings,
        'private',
      )

      expect(result).toEqual(mockPreset)
      expect(startNetworkActivity).toHaveBeenCalled()
      expect(endNetworkActivity).toHaveBeenCalled()
    })

    it('should handle preset creation errors', async () => {
      const mockInsertPreset = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'presets') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockInsertPreset()),
              }),
            }),
          }
        }
        return {
          insert: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      await expect(
        createPreset('user-1', 'Test Preset', mockPropertySettings),
      ).rejects.toMatchObject({ message: 'Database error' })
    })

    it('should clean up preset if property settings creation fails', async () => {
      const mockPreset = {
        id: 'new-preset-id',
        label: 'Test Preset',
        figma_user_id: 'user-1',
        visibility: 'private' as const,
        date_created: '2024-01-01',
        date_modified: '2024-01-01',
      }

      const mockInsertPreset = vi.fn().mockResolvedValue({
        data: mockPreset,
        error: null,
      })

      const mockInsertPropertySettings = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Property settings error' },
      })

      const mockDeletePreset = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      let fromCallCount = 0
      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'presets') {
          fromCallCount++
          if (fromCallCount === 1) {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(mockInsertPreset()),
                }),
              }),
            }
          }
          if (fromCallCount === 2) {
            return {
              delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue(mockDeletePreset()),
              }),
            }
          }
        }
        if (table === 'property_settings') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockResolvedValue(mockInsertPropertySettings()),
            }),
          }
        }
        return {
          insert: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      await expect(
        createPreset('user-1', 'Test Preset', mockPropertySettings),
      ).rejects.toMatchObject({ message: 'Property settings error' })

      expect(mockDeletePreset).toHaveBeenCalled()
    })
  })

  describe('updatePreset', () => {
    it('should update a preset with new property settings', async () => {
      const existingPreset = {
        id: 'preset-1',
        label: 'Test Preset',
        figma_user_id: 'user-1',
        visibility: 'private' as const,
        date_created: '2024-01-01',
        date_modified: '2024-01-01',
      }

      const mockFetchPreset = vi.fn().mockResolvedValue({
        data: existingPreset,
        error: null,
      })

      const mockUpdatePreset = vi.fn().mockResolvedValue({
        data: { ...existingPreset, date_modified: '2024-01-02' },
        error: null,
      })

      const mockGetExistingSettings = vi.fn().mockResolvedValue({
        data: [
          { id: 'ps-1', label: 'opacity' },
          { id: 'ps-2', label: 'fillColor' },
        ],
        error: null,
      })

      const mockUpsertPropertySettings = vi.fn().mockResolvedValue({
        data: [{ id: 'ps-1', label: 'opacity' }],
        error: null,
      })

      const mockUpdatePropertySettings = vi.fn().mockResolvedValue({
        data: [{ id: 'ps-1', label: 'opacity' }],
        error: null,
      })

      let fromCallCount = 0
      let propertySettingsCallCount = 0
      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'presets') {
          fromCallCount++
          if (fromCallCount === 1) {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(mockFetchPreset()),
                }),
              }),
            }
          }
          if (fromCallCount === 2) {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue(mockUpdatePreset()),
                  }),
                }),
              }),
            }
          }
        }
        if (table === 'property_settings') {
          propertySettingsCallCount++
          if (propertySettingsCallCount === 1) {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue(mockGetExistingSettings()),
              }),
            }
          }
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(mockUpdatePropertySettings()),
                }),
              }),
            }),
          }
        }
        if (table === 'text_property_settings' || table === 'dimension_property_settings' || table === 'numeric_property_settings') {
          return {
            insert: vi.fn().mockResolvedValue({ data: [], error: null }),
          }
        }
        return {
          insert: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      const result = await updatePreset(
        'preset-1',
        'user-1',
        mockPropertySettings,
      )

      expect(result).toMatchObject({
        id: 'preset-1',
        label: 'Test Preset',
      })
      expect(startNetworkActivity).toHaveBeenCalled()
      expect(endNetworkActivity).toHaveBeenCalled()
    })

    it('should reject updates to presets not owned by user', async () => {
      const existingPreset = {
        id: 'preset-1',
        label: 'Test Preset',
        figma_user_id: 'other-user',
        visibility: 'private' as const,
        date_created: '2024-01-01',
        date_modified: '2024-01-01',
      }

      const mockFetchPreset = vi.fn().mockResolvedValue({
        data: existingPreset,
        error: null,
      })

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'presets') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockFetchPreset()),
              }),
            }),
          }
        }
        return {
          insert: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      await expect(
        updatePreset('preset-1', 'user-1', mockPropertySettings),
      ).rejects.toThrow('Preset not found or access denied')
    })

    it('should allow admin to update default preset', async () => {
      const existingPreset = {
        id: 'preset-1',
        label: '__default__',
        figma_user_id: 'default',
        visibility: 'private' as const,
        date_created: '2024-01-01',
        date_modified: '2024-01-01',
      }

      const mockFetchPreset = vi.fn().mockResolvedValue({
        data: existingPreset,
        error: null,
      })

      const mockUpdatePreset = vi.fn().mockResolvedValue({
        data: { ...existingPreset, date_modified: '2024-01-02' },
        error: null,
      })

      const mockGetExistingSettings = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      const mockInsertPropertySettings = vi.fn().mockResolvedValue({
        data: [{ id: 'ps-1', label: 'opacity' }],
        error: null,
      })

      let fromCallCount = 0
      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'presets') {
          fromCallCount++
          if (fromCallCount === 1) {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(mockFetchPreset()),
                }),
              }),
            }
          }
          if (fromCallCount === 2) {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue(mockUpdatePreset()),
                  }),
                }),
              }),
            }
          }
        }
        if (table === 'property_settings') {
          fromCallCount++
          if (fromCallCount === 3) {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue(mockGetExistingSettings()),
              }),
            }
          }
          if (fromCallCount === 4) {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue(mockInsertPropertySettings()),
              }),
            }
          }
        }
        if (table === 'text_property_settings' || table === 'dimension_property_settings' || table === 'numeric_property_settings') {
          return {
            insert: vi.fn().mockResolvedValue({ data: [], error: null }),
          }
        }
        return {
          insert: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      const result = await updatePreset(
        'preset-1',
        'admin-user-id',
        mockPropertySettings,
      )

      expect(result).toMatchObject({
        id: 'preset-1',
        label: '__default__',
      })
    })

    it('should prevent non-admin from updating default preset', async () => {
      const existingPreset = {
        id: 'preset-1',
        label: '__default__',
        figma_user_id: 'default',
        visibility: 'private' as const,
        date_created: '2024-01-01',
        date_modified: '2024-01-01',
      }

      const mockFetchPreset = vi.fn().mockResolvedValue({
        data: existingPreset,
        error: null,
      })

      mockGetAdminUserId.mockReturnValue('admin-user-id')

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'presets') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockFetchPreset()),
              }),
            }),
          }
        }
        return {
          insert: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      await expect(
        updatePreset('preset-1', 'user-1', mockPropertySettings),
      ).rejects.toThrow('Preset not found or access denied')
    })
  })

  describe('deletePreset', () => {
    it('should delete a preset', async () => {
      const mockDelete = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'presets') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue(mockDelete()),
            }),
          }
        }
        return {
          insert: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      await deletePreset('preset-1')

      expect(startNetworkActivity).toHaveBeenCalled()
      expect(endNetworkActivity).toHaveBeenCalled()
      expect(mockDelete).toHaveBeenCalled()
    })

    it('should handle deletion errors', async () => {
      const mockDelete = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'presets') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue(mockDelete()),
            }),
          }
        }
        return {
          insert: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      await expect(deletePreset('preset-1')).rejects.toMatchObject({
        message: 'Database error',
      })
    })
  })

  describe('updatePresetLabel', () => {
    it('should update preset label', async () => {
      const existingPreset = {
        id: 'preset-1',
        label: 'Old Label',
        figma_user_id: 'user-1',
        visibility: 'private' as const,
        date_created: '2024-01-01',
        date_modified: '2024-01-01',
      }

      const updatedPreset = {
        ...existingPreset,
        label: 'New Label',
        date_modified: '2024-01-02',
      }

      const mockFetchPreset = vi.fn().mockResolvedValue({
        data: existingPreset,
        error: null,
      })

      const mockUpdatePreset = vi.fn().mockResolvedValue({
        data: updatedPreset,
        error: null,
      })

      let fromCallCount = 0
      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'presets') {
          fromCallCount++
          if (fromCallCount === 1) {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue(mockFetchPreset()),
                  }),
                }),
              }),
            }
          }
          if (fromCallCount === 2) {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue(mockUpdatePreset()),
                  }),
                }),
              }),
            }
          }
        }
        return {
          insert: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      const result = await updatePresetLabel(
        'preset-1',
        'user-1',
        'New Label',
      )

      expect(result).toEqual(updatedPreset)
      expect(startNetworkActivity).toHaveBeenCalled()
      expect(endNetworkActivity).toHaveBeenCalled()
    })

    it('should reject label updates to presets not owned by user', async () => {
      const mockFetchPreset = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Preset not found', code: 'PGRST116' },
      })

      mockSupabaseClient.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'presets') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(mockFetchPreset()),
                }),
              }),
            }),
          }
        }
        return {
          insert: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      await expect(
        updatePresetLabel('preset-1', 'user-1', 'New Label'),
      ).rejects.toThrow('Preset not found or access denied')
    })
  })
})
