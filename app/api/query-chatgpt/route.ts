import { ChatGPTQuerySchema } from '@/lib/validators/apiSchemas'
import { rateLimit } from '@/lib/middleware/rateLimit'
import { NextRequest, NextResponse } from 'next/server'
import invariant from 'tiny-invariant'

const endpoint = 'https://api.openai.com/v1/chat/completions'

interface ChatGPTResponse {
  results: string[]
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  error?: {
    message: string
    type: string
  }
}

function isChatGPTResponse(data: unknown): data is ChatGPTResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    Array.isArray((data as any).results) &&
    (data as any).results.every(
      (item: unknown) => typeof item === 'string',
    )
  )
}

function isOpenAIResponse(data: unknown): data is OpenAIResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'choices' in data &&
    Array.isArray((data as any).choices) &&
    (data as any).choices.length > 0 &&
    typeof (data as any).choices[0] === 'object' &&
    (data as any).choices[0] !== null &&
    'message' in (data as any).choices[0] &&
    typeof (data as any).choices[0].message === 'object' &&
    (data as any).choices[0].message !== null &&
    'content' in (data as any).choices[0].message
  )
}

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request)
  if (!rateLimitResult.success) {
    return rateLimitResult.response!
  }

  try {
    const body = await request.json()

    const validationResult = ChatGPTQuerySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { prompt, isColor, resultCount } = validationResult.data

    invariant(process.env.OPENAI_API_KEY, 'Missing OPENAI_API_KEY')

    const fullPrompt = `Give me ${resultCount} random ${prompt}`
    const safePrompt = isColor
      ? `${fullPrompt}. Return only hex color codes (format: #RRGGBB), one per line, with no additional text or descriptions.`
      : fullPrompt

    const systemMessage = isColor
      ? "You always respond with a JSON object with a single key named 'results' and it contains an array of hex color codes (format: #RRGGBB). Each result must be a valid hex color code starting with # followed by 6 hexadecimal characters. Do not include any descriptions or additional text, only hex codes."
      : "You always respond with a JSON object with a single key named 'results' and it contains an array of strings"

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          { role: 'user', content: safePrompt },
        ],
        model: 'gpt-3.5-turbo',
        n: 1,
        response_format: {
          type: 'json_object',
        },
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: 'OpenAI API error',
          details: errorData.error?.message || 'Unknown error',
        },
        { status: response.status },
      )
    }

    const data: unknown = await response.json()

    if (!isOpenAIResponse(data)) {
      return NextResponse.json(
        { error: 'Invalid response format from OpenAI' },
        { status: 500 },
      )
    }

    if (data.error) {
      return NextResponse.json(
        {
          error: 'OpenAI API error',
          details: data.error.message,
        },
        { status: 500 },
      )
    }

    const content = data.choices[0].message.content.trim()
    let parsedContent: unknown

    try {
      parsedContent = JSON.parse(content)
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Failed to parse OpenAI response as JSON' },
        { status: 500 },
      )
    }

    if (!isChatGPTResponse(parsedContent)) {
      return NextResponse.json(
        { error: 'Invalid response structure from OpenAI' },
        { status: 500 },
      )
    }

    let { results } = parsedContent

    if (isColor) {
      results = results
        .map((result: string) => {
          const trimmed = String(result).trim()
          if (trimmed.match(/^#[0-9A-Fa-f]{6}$/)) {
            return trimmed.toUpperCase()
          }
          return null
        })
        .filter((result: string | null) => result !== null) as string[]
    }

    return new Response(JSON.stringify(results))
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 },
      )
    }
    if (error instanceof Error && error.message.includes('Missing')) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      )
    }
    console.error('Error querying ChatGPT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
