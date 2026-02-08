import { expect, test } from '@playwright/test'
import {
  setupNewUser,
  enableProperty,
  switchMode,
  verifyRangeModeUI,
  verifyListModeUI,
  verifyAdditionModeUI,
} from './helpers'

test.describe('Mode UI Updates Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupNewUser(page)
    await enableProperty(page, 'opacity')
  })

  test('each mode shows correct UI fields', async ({ page }) => {
    await switchMode(page, 'opacity', 'range')
    await verifyRangeModeUI(page, 'opacity')

    await switchMode(page, 'opacity', 'list')
    await verifyListModeUI(page, 'opacity')

    await switchMode(page, 'opacity', 'addition')
    await verifyAdditionModeUI(page, 'opacity')
  })

  test('switching between modes updates UI correctly', async ({ page }) => {
    const modeTransitions = [
      { from: 'range' as const, verify: verifyRangeModeUI },
      { from: 'list' as const, verify: verifyListModeUI },
      { from: 'addition' as const, verify: verifyAdditionModeUI },
      { from: 'range' as const, verify: verifyRangeModeUI },
    ]

    for (const { from, verify } of modeTransitions) {
      await switchMode(page, 'opacity', from)
      await verify(page, 'opacity')
    }
  })
})
