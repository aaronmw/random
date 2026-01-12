import { expect, test } from '@playwright/test'
import {
    enableProperty,
    isPropertyEnabled,
    reloadAndWait,
    setupNewUser,
    switchMode,
    waitForAllDatabaseWrites,
    waitForModeToBeSet,
} from './helpers'

test.describe('Mode Switching Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupNewUser(page)
    await enableProperty(page, 'opacity')
  })

  test('can switch to range mode', async ({ page }) => {
    await switchMode(page, 'opacity', 'range')

    const rangeButton = page.getByTestId('mode-button-opacity-range')
    const isSelected = await rangeButton.getAttribute('aria-selected')
    expect(isSelected).toBe('true')
  })

  test('can switch to list mode', async ({ page }) => {
    await switchMode(page, 'opacity', 'list')

    const listButton = page.getByTestId('mode-button-opacity-list')
    const isSelected = await listButton.getAttribute('aria-selected')
    expect(isSelected).toBe('true')
  })

  test('can switch to addition mode', async ({ page }) => {
    await switchMode(page, 'opacity', 'addition')

    const additionButton = page.getByTestId('mode-button-opacity-addition')
    const isSelected = await additionButton.getAttribute('aria-selected')
    expect(isSelected).toBe('true')
  })

  test('can switch between all modes', async ({ page }) => {
    await switchMode(page, 'opacity', 'range')
    await switchMode(page, 'opacity', 'list')
    await switchMode(page, 'opacity', 'addition')
    await switchMode(page, 'opacity', 'range')

    const rangeButton = page.getByTestId('mode-button-opacity-range')
    const isSelected = await rangeButton.getAttribute('aria-selected')
    expect(isSelected).toBe('true')
  })

  test('mode selection persists after reload', async ({ page }) => {
    await switchMode(page, 'opacity', 'list')

    // Verify the mode is set in UI before proceeding
    const listButton = page.getByTestId('mode-button-opacity-list')
    await expect(listButton).toHaveAttribute('aria-selected', 'true', { timeout: 5000 })

    // Wait for ALL pending database writes to complete
    await waitForAllDatabaseWrites(page, 10000)

    // Reload (page.reload() preserves the URL and query params including user ID)
    await reloadAndWait(page)

    // Wait for property panel to be ready
    await page.getByTestId('property-panel-opacity').waitFor({ state: 'visible', timeout: 5000 })

    // Check if property is enabled - if not, enable it to show the mode selector
    const isEnabled = await isPropertyEnabled(page, 'opacity')
    if (!isEnabled) {
      await enableProperty(page, 'opacity')
    }

    // Wait for the mode selector to be visible (it's in the expanded panel)
    const panelContent = page.getByTestId('property-panel-opacity')
    const radiogroup = panelContent.locator('[role="radiogroup"]').first()
    await expect(radiogroup).toBeVisible({ timeout: 2000 })

    // Wait for React to fully update the component state after data load
    await page.waitForTimeout(500)

    // Wait for the list mode to be set (this waits for React to update the component state)
    await waitForModeToBeSet(page, 'opacity', 'list', 5000)
  })
})
