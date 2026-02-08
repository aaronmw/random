type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface Logger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

function shouldLog(level: LogLevel): boolean {
  if (isProduction) {
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error'
  }
  // In development, log everything
  return true
}

function createLogger(): Logger {
  return {
    debug: (...args: unknown[]) => {
      if (shouldLog('debug')) {
        console.debug('[DEBUG]', ...args)
      }
    },
    info: (...args: unknown[]) => {
      if (shouldLog('info')) {
        console.log('[INFO]', ...args)
      }
    },
    warn: (...args: unknown[]) => {
      if (shouldLog('warn')) {
        console.warn('[WARN]', ...args)
      }
    },
    error: (...args: unknown[]) => {
      if (shouldLog('error')) {
        console.error('[ERROR]', ...args)
      }
    },
  }
}

export const logger = createLogger()
