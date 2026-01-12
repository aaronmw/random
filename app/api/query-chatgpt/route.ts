import { NextRequest, NextResponse } from 'next/server'
import invariant from 'tiny-invariant'

const endpoint = 'https://api.openai.com/v1/chat/completions'

export async function POST(request: NextRequest) {
  const { prompt, isColor } = await request.json()

  try {
    invariant(process.env.OPENAI_API_KEY, 'Missing OPENAI_API_KEY')

    const systemMessage = isColor
      ? "You always respond with a JSON object with a single key named 'results' and it contains an array of hex color codes (format: #RRGGBB). Each result must be a valid hex color code starting with # followed by 6 hexadecimal characters. Do not include any descriptions or additional text, only hex codes."
      : "You always respond with a JSON object with a single key named 'results' and it contains an array of strings"

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          { role: 'user', content: prompt },
        ],
        model: 'gpt-3.5-turbo',
        n: 1,
        response_format: {
          type: 'json_object',
        },
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    let { results } = JSON.parse(data.choices[0].message.content.trim())

    if (isColor) {
      results = results
        .map((result: string) => {
          const trimmed = String(result).trim()
          if (trimmed.match(/^#[0-9A-Fa-f]{6}$/)) {
            return trimmed.toUpperCase()
          }
          return null
        })
        .filter((result: string | null) => result !== null)
    }

    return new Response(JSON.stringify(results))
  } catch (error) {
    console.error('Error querying ChatGPT:', error)
    return new NextResponse('Error querying ChatGPT', { status: 500 })
  }
}
