import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getUserOptions,
  getOrCreateUserOptions,
  updateUserOptions,
  type UserOptions,
} from '../userOptionsService'
import { supabaseClient } from '@/supabase/client'
import * as networkActivity from '@/lib/utils/networkActivity'

vi.mock('@/supabase/client', () => ({
  supabaseClient: {
    from: vi.fn(),
  },
}))
vi.mock('@/lib/utils/networkActivity', () => ({
  startNetworkActivity: vi.fn(),
  endNetworkActivity: vi.fn(),
}))

describe('userOptionsService', () => {
  const mockUserOptions: UserOptions = {
    id: '123',
    figma_user_id: 'test-user-123',
    is_auto_scroll_enabled: false,
    is_grouped_by_status: false,
    is_grouped_by_type: false,
    is_light_mode: false,
    is_auto_load_from_selected_nodes: false,
    date_created: '2024-01-01T00:00:00Z',
    date_modified: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserOptions', () => {
    it('should fetch user options successfully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: mockUserOptions,
              error: null,
            }),
          }),
        }),
      })

      ;(supabaseClient as any).from = mockFrom

      const result = await getUserOptions('test-user-123')

      expect(result).toEqual(mockUserOptions)
      expect(networkActivity.startNetworkActivity).toHaveBeenCalled()
      expect(networkActivity.endNetworkActivity).toHaveBeenCalled()
      expect(mockFrom).toHaveBeenCalledWith('user_options')
    })

    it('should return null when user options do not exist', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      ;(supabaseClient as any).from = mockFrom

      const result = await getUserOptions('non-existent-user')

      expect(result).toBeNull()
      expect(networkActivity.endNetworkActivity).toHaveBeenCalled()
    })

    it('should return null when table does not exist', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'relation does not exist' },
            }),
          }),
        }),
      })

      ;(supabaseClient as any).from = mockFrom

      const result = await getUserOptions('test-user-123')

      expect(result).toBeNull()
      expect(networkActivity.endNetworkActivity).toHaveBeenCalled()
    })

    it('should return null on other errors', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'OTHER_ERROR', message: 'Some error' },
            }),
          }),
        }),
      })

      ;(supabaseClient as any).from = mockFrom

      const result = await getUserOptions('test-user-123')

      expect(result).toBeNull()
      expect(networkActivity.endNetworkActivity).toHaveBeenCalled()
    })
  })

  describe('getOrCreateUserOptions', () => {
    it('should return existing user options', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: mockUserOptions,
              error: null,
            }),
          }),
        }),
      })

      ;(supabaseClient as any).from = mockFrom

      const result = await getOrCreateUserOptions('test-user-123')

      expect(result).toEqual(mockUserOptions)
      expect(mockFrom).toHaveBeenCalledTimes(1)
    })

    it('should create new user options with defaults for test users', async () => {
      const mockMaybeSingle = vi
        .fn()
        .mockResolvedValueOnce({
          data: null,
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockUserOptions,
          error: null,
        })

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      })

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockUserOptions,
            error: null,
          }),
        }),
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      })

      ;(supabaseClient as any).from = mockFrom

      const result = await getOrCreateUserOptions('test-user-new')

      expect(result).toEqual(mockUserOptions)
      expect(mockFrom).toHaveBeenCalledWith('user_options')
      expect(mockInsert).toHaveBeenCalledWith({
        figma_user_id: 'test-user-new',
        is_auto_scroll_enabled: false,
        is_grouped_by_status: false,
        is_grouped_by_type: false,
        is_light_mode: false,
        is_auto_load_from_selected_nodes: false,
      })
    })

    it('should create new user options using default template for non-test users', async () => {
      const defaultUserOptions: UserOptions = {
        ...mockUserOptions,
        figma_user_id: 'default',
        is_auto_scroll_enabled: true,
        is_grouped_by_status: true,
      }

      const newUserOptions: UserOptions = {
        ...mockUserOptions,
        figma_user_id: 'regular-user',
        is_auto_scroll_enabled: true,
        is_grouped_by_status: true,
      }

      const mockMaybeSingle = vi
        .fn()
        .mockResolvedValueOnce({
          data: null,
          error: null,
        })
        .mockResolvedValueOnce({
          data: defaultUserOptions,
          error: null,
        })
        .mockResolvedValueOnce({
          data: newUserOptions,
          error: null,
        })

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      })

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: newUserOptions,
            error: null,
          }),
        }),
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      })

      ;(supabaseClient as any).from = mockFrom

      const result = await getOrCreateUserOptions('regular-user')

      expect(result).toEqual(newUserOptions)
      expect(mockInsert).toHaveBeenCalledWith({
        figma_user_id: 'regular-user',
        is_auto_scroll_enabled: true,
        is_grouped_by_status: true,
        is_grouped_by_type: false,
        is_light_mode: false,
        is_auto_load_from_selected_nodes: false,
      })
    })

    it('should return null when table does not exist', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'relation does not exist' },
      })

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'relation does not exist' },
            }),
          }),
        }),
      })

      ;(supabaseClient as any).from = mockFrom

      const result = await getOrCreateUserOptions('test-user-123')

      expect(result).toBeNull()
    })
  })

  describe('updateUserOptions', () => {
    it('should update user options successfully', async () => {
      const updatedOptions: UserOptions = {
        ...mockUserOptions,
        is_auto_scroll_enabled: true,
        date_modified: '2024-01-02T00:00:00Z',
      }

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: updatedOptions,
              error: null,
            }),
          }),
        }),
      })

      const mockFrom = vi.fn().mockReturnValue({
        update: mockUpdate,
      })

      ;(supabaseClient as any).from = mockFrom

      const result = await updateUserOptions('test-user-123', {
        is_auto_scroll_enabled: true,
      })

      expect(result).toEqual(updatedOptions)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          is_auto_scroll_enabled: true,
          date_modified: expect.any(String),
        }),
      )
      expect(networkActivity.startNetworkActivity).toHaveBeenCalled()
      expect(networkActivity.endNetworkActivity).toHaveBeenCalled()
    })

    it('should update multiple options at once', async () => {
      const updatedOptions: UserOptions = {
        ...mockUserOptions,
        is_auto_scroll_enabled: true,
        is_grouped_by_status: true,
        date_modified: '2024-01-02T00:00:00Z',
      }

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: updatedOptions,
              error: null,
            }),
          }),
        }),
      })

      const mockFrom = vi.fn().mockReturnValue({
        update: mockUpdate,
      })

      ;(supabaseClient as any).from = mockFrom

      const result = await updateUserOptions('test-user-123', {
        is_auto_scroll_enabled: true,
        is_grouped_by_status: true,
      })

      expect(result).toEqual(updatedOptions)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          is_auto_scroll_enabled: true,
          is_grouped_by_status: true,
          date_modified: expect.any(String),
        }),
      )
    })

    it('should return null when table does not exist', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'relation does not exist' },
            }),
          }),
        }),
      })

      const mockFrom = vi.fn().mockReturnValue({
        update: mockUpdate,
      })

      ;(supabaseClient as any).from = mockFrom

      const result = await updateUserOptions('test-user-123', {
        is_auto_scroll_enabled: true,
      })

      expect(result).toBeNull()
    })

    it('should throw error on other database errors', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'OTHER_ERROR', message: 'Database error' },
            }),
          }),
        }),
      })

      const mockFrom = vi.fn().mockReturnValue({
        update: mockUpdate,
      })

      ;(supabaseClient as any).from = mockFrom

      await expect(
        updateUserOptions('test-user-123', {
          is_auto_scroll_enabled: true,
        }),
      ).rejects.toThrow()
    })
  })
})
