import { describe, expect, it, vi } from 'vitest'
import { AppState } from '@/app/types'
import { AppAction } from '@/app/state/AppReducer'
import { loadPreset } from '@/lib/services/propertySettingsService'
import { loadPresetFromId } from '../presetUtils'

// Mock the service
vi.mock('@/lib/services/propertySettingsService', () => ({
  loadPreset: vi.fn(),
}))

describe('loadPresetFromId', () => {
  const mockDispatch = vi.fn()
  const mockPropertySettings: AppState['propertySettings'] = {
    opacity: {
      id: 'local-opacity-id',
      preset_id: 'local-preset-id',
      label: 'opacity',
      is_enabled: true,
      randomization_mode: 'range',
      post_randomization_sort_order: null,
      date_created: '2024-01-01',
      date_modified: '2024-01-01',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load preset and map IDs correctly', async () => {
    const mockPresetSettings = [
      {
        id: 'remote-opacity-id',
        preset_id: 'remote-preset-id',
        label: 'opacity',
        is_enabled: true,
        randomization_mode: 'range',
        date_created: '2024-01-01',
        date_modified: '2024-01-01',
      },
    ]

    vi.mocked(loadPreset).mockResolvedValue(mockPresetSettings as any)

    await loadPresetFromId(
      'test-preset-id',
      'test-user-id',
      mockDispatch,
      mockPropertySettings,
    )

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'setPresetLoading',
      payload: { isLoading: true },
    })

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'setActivePresetId',
      payload: { presetId: 'test-preset-id' },
    })

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'setFoundPresetId',
      payload: { presetId: null },
    })

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'loadPreset',
      payload: {
        presetPropertySettings: [
          expect.objectContaining({
            label: 'opacity',
            id: 'local-opacity-id', // Should use local ID
            preset_id: 'local-preset-id', // Should use local preset_id
          }),
        ],
      },
    })

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'setPresetLoading',
      payload: { isLoading: false },
    })
  })

  it('should handle errors gracefully', async () => {
    vi.mocked(loadPreset).mockRejectedValue(new Error('Database error'))

    await loadPresetFromId(
      'test-preset-id',
      'test-user-id',
      mockDispatch,
      mockPropertySettings,
    )

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'setPresetLoading',
      payload: { isLoading: false },
    })
  })

  it('should reject invalid propertySettings', async () => {
    await expect(
      loadPresetFromId('test-preset-id', 'test-user-id', mockDispatch, null as any),
    ).resolves.toBeUndefined()

    expect(mockDispatch).not.toHaveBeenCalled()
  })
})
