import { expect, test } from '@playwright/test'
import {
    enableProperty,
    isPropertyEnabled,
    reloadAndWait,
    setupNewUser,
    waitForAllDatabaseWrites,
    waitForPropertyPanel,
} from './helpers'

test.describe('Property Enabling Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupNewUser(page)
  })

  test('can enable a single property', async ({ page }) => {
    await enableProperty(page, 'opacity')
    const isEnabled = await isPropertyEnabled(page, 'opacity')
    expect(isEnabled).toBe(true)
  })

  test('can enable multiple properties', async ({ page }) => {
    await enableProperty(page, 'opacity')
    await enableProperty(page, 'width')
    await enableProperty(page, 'height')

    expect(await isPropertyEnabled(page, 'opacity')).toBe(true)
    expect(await isPropertyEnabled(page, 'width')).toBe(true)
    expect(await isPropertyEnabled(page, 'height')).toBe(true)
  })

  test('enabled state persists after reload', async ({ page }) => {
    await enableProperty(page, 'opacity', true) // Wait for DB write
    // Verify opacity is enabled in UI before proceeding
    expect(await isPropertyEnabled(page, 'opacity')).toBe(true)

    await enableProperty(page, 'fillColor', true) // Wait for DB write
    // Verify fillColor is enabled in UI before proceeding
    expect(await isPropertyEnabled(page, 'fillColor')).toBe(true)

    // Wait for ALL pending database writes to complete
    await waitForAllDatabaseWrites(page, 10000)

    // Reload (page.reload() preserves the URL and query params including user ID)
    await reloadAndWait(page)

    // Wait for both property panels to be ready
    await page.getByTestId('property-panel-opacity').waitFor({ state: 'visible', timeout: 10000 })
    await page.getByTestId('property-panel-fillColor').waitFor({ state: 'visible', timeout: 10000 })

    // Wait for React to update the aria-pressed attributes after data load
    // Check that opacity is enabled (with retries)
    const opacityToggle = page.getByTestId('property-toggle-opacity')
    await expect(opacityToggle).toHaveAttribute('aria-pressed', 'true', { timeout: 10000 })

    // Check that fillColor is enabled (with retries) - give it more time
    const fillColorToggle = page.getByTestId('property-toggle-fillColor')
    await expect(fillColorToggle).toHaveAttribute('aria-pressed', 'true', { timeout: 10000 })

    expect(await isPropertyEnabled(page, 'opacity')).toBe(true)
    expect(await isPropertyEnabled(page, 'fillColor')).toBe(true)
  })

  test('enabling a property expands its panel', async ({ page }) => {
    const panelHeader = await waitForPropertyPanel(page, 'opacity')
    const isEnabled = await isPropertyEnabled(page, 'opacity')

    if (!isEnabled) {
      await enableProperty(page, 'opacity')
    }

    const panelContent = page.locator('#opacity-config-panel')
    const modeLabel = panelContent.locator('label:has-text("mode")')
    await expect(modeLabel).toBeVisible({ timeout: 2000 })
  })
})
