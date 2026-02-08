import { expect, test } from '@playwright/test'
import {
    enableProperty,
    isPropertyEnabled,
    reloadAndWait,
    setupNewUser,
    switchMode,
    TEST_TIMEOUT,
    verifyModeIsSelected,
    waitForAllDatabaseWrites,
    waitForModeToBeSet,
    waitForPropertyPanel,
} from './helpers'

test.describe('Mode Switching Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupNewUser(page)
    await enableProperty(page, 'opacity')
  })

  const modes: Array<'range' | 'list' | 'addition'> = ['range', 'list', 'addition']

  for (const mode of modes) {
    test(`can switch to ${mode} mode`, async ({ page }) => {
      await switchMode(page, 'opacity', mode)
      await verifyModeIsSelected(page, 'opacity', mode)
    })
  }

  test('can switch between all modes', async ({ page }) => {
    await switchMode(page, 'opacity', 'range')
    await switchMode(page, 'opacity', 'list')
    await switchMode(page, 'opacity', 'addition')
    await switchMode(page, 'opacity', 'range')
    await verifyModeIsSelected(page, 'opacity', 'range')
  })

  test('mode selection persists after reload', async ({ page }) => {
    await switchMode(page, 'opacity', 'list')

    await verifyModeIsSelected(page, 'opacity', 'list')

    // Wait for ALL pending database writes to complete
    await waitForAllDatabaseWrites(page, TEST_TIMEOUT)

    // Reload (page.reload() preserves the URL and query params including user ID)
    await reloadAndWait(page)

    await waitForPropertyPanel(page, 'opacity')

    const isEnabled = await isPropertyEnabled(page, 'opacity')
    if (!isEnabled) {
      await enableProperty(page, 'opacity')
    }

    const panelContent = page.getByTestId('property-panel-opacity')
    const radiogroup = panelContent.locator('[role="radiogroup"]').first()
    await expect(radiogroup).toBeVisible({ timeout: 2000 })

    // Wait for React to fully update the component state after data load
    await page.waitForTimeout(500)

    // Wait for the list mode to be set (this waits for React to update the component state)
    await waitForModeToBeSet(page, 'opacity', 'list', 5000)
  })
})
