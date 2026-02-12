import { NextRequest, NextResponse } from 'next/server'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/supabase/client', () => ({
  supabaseClient: {
    from: vi.fn(),
  },
}))

vi.mock('@/lib/middleware/rateLimit', () => ({
  rateLimit: vi.fn(),
}))

import { rateLimit } from '@/lib/middleware/rateLimit'
import { supabaseClient } from '@/supabase/client'

let GET: typeof import('../presets/route').GET
let POST: typeof import('../presets/route').POST
let DELETE: typeof import('../presets/route').DELETE

beforeAll(async () => {
  const routeModule = await import('../presets/route')
  GET = routeModule.GET
  POST = routeModule.POST
  DELETE = routeModule.DELETE
})

describe('API Route: /api/presets', () => {
  const mockSupabaseClient = vi.mocked(supabaseClient)
  const mockRateLimit = vi.mocked(rateLimit)

  beforeEach(() => {
    vi.clearAllMocks()
    mockRateLimit.mockReturnValue({ success: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET /api/presets', () => {
    it('should return all presets', async () => {
      const mockPresets = [
        { id: '1', label: 'Preset 1', figma_user_id: 'user1' },
        { id: '2', label: 'Preset 2', figma_user_id: 'user2' },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockPresets,
          error: null,
        }),
      })

      mockSupabaseClient.from = mockFrom

      const request = new NextRequest('http://localhost:4000/api/presets')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual(mockPresets)
      expect(mockFrom).toHaveBeenCalledWith('presets')
    })

    it('should handle database errors', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      })

      mockSupabaseClient.from = mockFrom

      const request = new NextRequest('http://localhost:4000/api/presets')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database connection failed')
    })

    it('should handle rate limiting', async () => {
      mockRateLimit.mockReturnValue({
        success: false,
        response: NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 }),
      })

      const request = new NextRequest('http://localhost:4000/api/presets')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Rate limit exceeded')
    })
  })

  describe('POST /api/presets', () => {
    it('should create a preset with valid input', async () => {
      const mockPreset = {
        id: 'new-preset-id',
        label: 'Test Preset',
        figma_user_id: 'test-user-id',
        visibility: 'private' as const,
      }

      const mockUpsert = vi.fn().mockResolvedValue({
        data: [mockPreset],
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        upsert: mockUpsert,
      })

      mockSupabaseClient.from = mockFrom

      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'POST',
        body: JSON.stringify({
          label: 'Test Preset',
          figma_user_id: 'test-user-id',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual([mockPreset])
      expect(mockFrom).toHaveBeenCalledWith('presets')
    })

    it('should create a preset with optional fields', async () => {
      const mockPreset = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        label: 'Test Preset',
        figma_user_id: 'test-user-id',
        visibility: 'public' as const,
      }

      const mockUpsert = vi.fn().mockResolvedValue({
        data: [mockPreset],
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        upsert: mockUpsert,
      })

      mockSupabaseClient.from = mockFrom

      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'POST',
        body: JSON.stringify({
          id: '123e4567-e89b-12d3-a456-426614174000',
          label: 'Test Preset',
          figma_user_id: 'test-user-id',
          visibility: 'public',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual([mockPreset])
    })

    it('should reject invalid input - empty label', async () => {
      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'POST',
        body: JSON.stringify({
          label: '',
          figma_user_id: 'test-user-id',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details).toBeDefined()
      expect(data.details[0].path).toContain('label')
    })

    it('should reject invalid input - missing figma_user_id', async () => {
      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'POST',
        body: JSON.stringify({
          label: 'Test Preset',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details).toBeDefined()
    })

    it('should reject invalid input - invalid UUID', async () => {
      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'POST',
        body: JSON.stringify({
          label: 'Test Preset',
          figma_user_id: 'test-user-id',
          id: 'not-a-uuid',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should reject invalid input - invalid visibility', async () => {
      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'POST',
        body: JSON.stringify({
          label: 'Test Preset',
          figma_user_id: 'test-user-id',
          visibility: 'invalid',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should handle database errors', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const mockFrom = vi.fn().mockReturnValue({
        upsert: mockUpsert,
      })

      mockSupabaseClient.from = mockFrom

      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'POST',
        body: JSON.stringify({
          label: 'Test Preset',
          figma_user_id: 'test-user-id',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database error')
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid JSON in request body')
    })

    it('should enforce rate limiting', async () => {
      mockRateLimit.mockReturnValue({
        success: false,
        response: NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 }),
      })

      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'POST',
        body: JSON.stringify({
          label: 'Test Preset',
          figma_user_id: 'test-user-id',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Rate limit exceeded')
    })
  })

  describe('DELETE /api/presets', () => {
    it('should delete a preset with valid UUID', async () => {
      const mockDelete = vi.fn().mockResolvedValue({
        data: [{ id: 'preset-id' }],
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(mockDelete()),
        }),
      })

      mockSupabaseClient.from = mockFrom

      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'DELETE',
        body: JSON.stringify({
          id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockFrom).toHaveBeenCalledWith('presets')
    })

    it('should reject invalid UUID', async () => {
      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'DELETE',
        body: JSON.stringify({
          id: 'not-a-uuid',
        }),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details).toBeDefined()
      expect(data.details[0].path).toContain('id')
    })

    it('should reject missing id', async () => {
      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'DELETE',
        body: JSON.stringify({}),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should handle database errors', async () => {
      const mockDelete = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(mockDelete()),
        }),
      })

      mockSupabaseClient.from = mockFrom

      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'DELETE',
        body: JSON.stringify({
          id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database error')
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'DELETE',
        body: 'invalid json',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid JSON in request body')
    })

    it('should enforce rate limiting', async () => {
      mockRateLimit.mockReturnValue({
        success: false,
        response: NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 }),
      })

      const request = new NextRequest('http://localhost:4000/api/presets', {
        method: 'DELETE',
        body: JSON.stringify({
          id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Rate limit exceeded')
    })
  })
})
