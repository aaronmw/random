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

  test('range mode shows min and max fields', async ({ page }) => {
    await switchMode(page, 'opacity', 'range')
    await verifyRangeModeUI(page, 'opacity')
  })

  test('list mode hides min/max and operator fields', async ({ page }) => {
    await switchMode(page, 'opacity', 'list')
    await verifyListModeUI(page, 'opacity')
  })

  test('addition mode shows min, max, and operator fields', async ({ page }) => {
    await switchMode(page, 'opacity', 'addition')
    await verifyAdditionModeUI(page, 'opacity')
  })

  test('switching from range to list updates UI correctly', async ({ page }) => {
    await switchMode(page, 'opacity', 'range')
    await verifyRangeModeUI(page, 'opacity')

    await switchMode(page, 'opacity', 'list')
    await verifyListModeUI(page, 'opacity')
  })

  test('switching from list to addition updates UI correctly', async ({ page }) => {
    await switchMode(page, 'opacity', 'list')
    await verifyListModeUI(page, 'opacity')

    await switchMode(page, 'opacity', 'addition')
    await verifyAdditionModeUI(page, 'opacity')
  })

  test('switching from addition to range updates UI correctly', async ({ page }) => {
    await switchMode(page, 'opacity', 'addition')
    await verifyAdditionModeUI(page, 'opacity')

    await switchMode(page, 'opacity', 'range')
    await verifyRangeModeUI(page, 'opacity')
  })
})
