import { describe, expect, it } from 'vitest'
import {
  ChatGPTQuerySchema,
  PresetCreateSchema,
  PresetDeleteSchema,
} from '../apiSchemas'

describe('PresetCreateSchema', () => {
  it('should validate a valid preset create input', () => {
    const validInput = {
      label: 'Test Preset',
      figma_user_id: '123456789',
    }

    const result = PresetCreateSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.label).toBe('Test Preset')
      expect(result.data.figma_user_id).toBe('123456789')
    }
  })

  it('should reject empty label', () => {
    const invalidInput = {
      label: '',
      figma_user_id: '123456789',
    }

    const result = PresetCreateSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should reject label longer than 255 characters', () => {
    const invalidInput = {
      label: 'a'.repeat(256),
      figma_user_id: '123456789',
    }

    const result = PresetCreateSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should reject missing figma_user_id', () => {
    const invalidInput = {
      label: 'Test Preset',
    }

    const result = PresetCreateSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should accept optional id as UUID', () => {
    const validInput = {
      label: 'Test Preset',
      figma_user_id: '123456789',
      id: '550e8400-e29b-41d4-a716-446655440000',
    }

    const result = PresetCreateSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('should reject invalid UUID for id', () => {
    const invalidInput = {
      label: 'Test Preset',
      figma_user_id: '123456789',
      id: 'not-a-uuid',
    }

    const result = PresetCreateSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should accept optional visibility', () => {
    const validInput = {
      label: 'Test Preset',
      figma_user_id: '123456789',
      visibility: 'public' as const,
    }

    const result = PresetCreateSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.visibility).toBe('public')
    }
  })

  it('should reject invalid visibility', () => {
    const invalidInput = {
      label: 'Test Preset',
      figma_user_id: '123456789',
      visibility: 'invalid',
    }

    const result = PresetCreateSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })
})

describe('PresetDeleteSchema', () => {
  it('should validate a valid UUID', () => {
    const validInput = {
      id: '550e8400-e29b-41d4-a716-446655440000',
    }

    const result = PresetDeleteSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('should reject non-UUID string', () => {
    const invalidInput = {
      id: 'not-a-uuid',
    }

    const result = PresetDeleteSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should reject missing id', () => {
    const invalidInput = {}

    const result = PresetDeleteSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })
})

describe('ChatGPTQuerySchema', () => {
  it('should validate a valid query', () => {
    const validInput = {
      prompt: 'Generate some colors',
      isColor: true,
    }

    const result = ChatGPTQuerySchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.prompt).toBe('Generate some colors')
      expect(result.data.isColor).toBe(true)
    }
  })

  it('should default isColor to false when not provided', () => {
    const validInput = {
      prompt: 'Generate some values',
    }

    const result = ChatGPTQuerySchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isColor).toBe(false)
    }
  })

  it('should reject empty prompt', () => {
    const invalidInput = {
      prompt: '',
    }

    const result = ChatGPTQuerySchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should reject prompt longer than 100 characters', () => {
    const invalidInput = {
      prompt: 'a'.repeat(101),
    }

    const result = ChatGPTQuerySchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should accept prompt at exactly 100 characters', () => {
    const validInput = {
      prompt: 'a'.repeat(100),
    }

    const result = ChatGPTQuerySchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('should default resultCount to 20 when not provided', () => {
    const validInput = {
      prompt: 'american cities',
    }

    const result = ChatGPTQuerySchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.resultCount).toBe(20)
    }
  })

  it('should accept resultCount between 2 and 50', () => {
    const validInput = {
      prompt: 'cities',
      resultCount: 25,
    }

    const result = ChatGPTQuerySchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.resultCount).toBe(25)
    }
  })

  it('should reject resultCount less than 2', () => {
    const invalidInput = {
      prompt: 'cities',
      resultCount: 1,
    }

    const result = ChatGPTQuerySchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should reject resultCount greater than 50', () => {
    const invalidInput = {
      prompt: 'cities',
      resultCount: 51,
    }

    const result = ChatGPTQuerySchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should reject non-integer resultCount', () => {
    const invalidInput = {
      prompt: 'cities',
      resultCount: 20.5,
    }

    const result = ChatGPTQuerySchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })
})
