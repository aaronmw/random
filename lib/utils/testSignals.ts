/**
 * Test signal utilities for E2E testing
 * 
 * Instead of waiting for network responses (which can be unreliable),
 * the app adds/removes CSS classes on the <html> element when critical operations complete.
 * Tests can wait for these classes using page.waitForSelector() or similar methods.
 */

export type TestSignalEvent =
  | {
      type: 'property-setting-updated'
      propertyName: string
      path: string
      value: unknown
    }
  | {
      type: 'property-setting-enabled'
      propertyName: string
      isEnabled: boolean
    }
  | {
      type: 'app-initial-data-loaded'
    }
  | {
      type: 'app-fully-ready'
    }
  | {
      type: 'user-option-updated'
      optionName: string
      value: boolean
    }

/**
 * Add a test signal class to the <html> element that tests can wait for
 */
export function dispatchTestSignal(event: TestSignalEvent) {
  if (typeof document === 'undefined') return

  const htmlElement = document.documentElement
  if (!htmlElement) return

  let className: string

  switch (event.type) {
    case 'app-initial-data-loaded':
      className = 'test-app-initial-data-loaded'
      break
    case 'app-fully-ready':
      className = 'test-app-fully-ready'
      break
    case 'user-option-updated':
      className = `test-user-option-updated-${event.optionName}`
      break
    case 'property-setting-updated':
      className = `test-property-setting-updated-${event.propertyName}-${event.path}`
      break
    case 'property-setting-enabled':
      className = `test-property-setting-enabled-${event.propertyName}`
      break
    default:
      return
  }

  htmlElement.classList.add(className)
}
