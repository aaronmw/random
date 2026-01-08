import {
  startNetworkActivity,
  endNetworkActivity,
} from './networkActivity'

/**
 * Wraps an async function to track network activity
 */
export function withNetworkActivity<T extends (...args: any[]) => Promise<any>>(
  fn: T,
): T {
  return (async (...args: Parameters<T>) => {
    startNetworkActivity()
    try {
      return await fn(...args)
    } finally {
      endNetworkActivity()
    }
  }) as T
}
