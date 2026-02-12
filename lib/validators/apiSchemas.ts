import { z } from 'zod'

export const PresetCreateSchema = z.object({
  label: z
    .string()
    .min(1, 'Label is required')
    .max(255, 'Label must be 255 characters or less')
    .trim(),
  figma_user_id: z
    .string()
    .min(1, 'figma_user_id is required')
    .max(255, 'figma_user_id must be 255 characters or less'),
  id: z.string().uuid().optional(),
  visibility: z.enum(['private', 'public', 'hidden']).optional(),
})

export const PresetDeleteSchema = z.object({
  id: z.string().uuid('Invalid preset ID'),
})

export const ChatGPTQuerySchema = z.object({
  prompt: z
    .string()
    .min(1, 'Prompt is required')
    .max(100, 'Prompt must be 100 characters or less'),
  isColor: z.boolean().optional().default(false),
  resultCount: z.number().int().min(2).max(50).default(20),
})

export type PresetCreateInput = z.infer<typeof PresetCreateSchema>
export type PresetDeleteInput = z.infer<typeof PresetDeleteSchema>
export type ChatGPTQueryInput = z.infer<typeof ChatGPTQuerySchema>
