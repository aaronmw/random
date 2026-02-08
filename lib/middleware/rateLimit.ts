import {
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
} from '@/lib/constants'
import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (for production behind proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'

  return ip
}

function cleanupExpiredEntries() {
  const now = Date.now()
  const keysToDelete: string[] = []
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetTime < now) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach((key) => {
    rateLimitStore.delete(key)
  })
}

export function rateLimit(request: NextRequest): {
  success: boolean
  response?: NextResponse
  remaining?: number
  resetTime?: number
} {
  // Clean up expired entries periodically
  if (Math.random() < 0.1) {
    // 10% chance to clean up on each request
    cleanupExpiredEntries()
  }

  const clientId = getClientIdentifier(request)
  const now = Date.now()

  const entry = rateLimitStore.get(clientId)

  if (!entry || entry.resetTime < now) {
    // New entry or expired entry
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    })
    return {
      success: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    }
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    // Rate limit exceeded
    const response = NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again after ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`,
      },
      { status: 429 },
    )

    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS))
    response.headers.set('X-RateLimit-Remaining', '0')
    response.headers.set(
      'X-RateLimit-Reset',
      String(Math.ceil(entry.resetTime / 1000)),
    )
    response.headers.set(
      'Retry-After',
      String(Math.ceil((entry.resetTime - now) / 1000)),
    )

    return {
      success: false,
      response,
    }
  }

  // Increment count
  entry.count++

  const remaining = RATE_LIMIT_MAX_REQUESTS - entry.count

  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set(
    'X-RateLimit-Reset',
    String(Math.ceil(entry.resetTime / 1000)),
  )

  return {
    success: true,
    response,
    remaining,
    resetTime: entry.resetTime,
  }
}
