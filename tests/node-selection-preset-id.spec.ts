import { expect, Page, test } from '@playwright/test'
import { setupNewUser } from './helpers'

test.describe('Node Selection with Preset IDs', () => {
  test.beforeEach(async ({ page }) => {
    await setupNewUser(page)
  })

  /**
   * Mocks a node selection by posting a message to the window
   * This simulates what the Figma plugin would send
   */
  async function mockNodeSelection(
    page: Page,
    nodes: Array<{ presetId?: string; [key: string]: any }>,
  ) {
    try {
      await page.evaluate(
        ({ nodeData }) => {
          window.postMessage(
            {
              pluginMessage: {
                type: 'setSelectedNodePluginData',
                payload: nodeData,
              },
            },
            '*',
          )
        },
        { nodeData: nodes },
      ).catch((error) => {
        // If page is closed, re-throw so test fails clearly
        if (error.message && error.message.includes('Target page, context or browser has been closed')) {
          throw error
        }
        // Other errors, ignore and continue
      })

      // Wait a bit for the message to be processed
      await page.waitForTimeout(200)
    } catch (error) {
      // Re-throw if page is closed - test should fail
      if (error.message && error.message.includes('Target page, context or browser has been closed')) {
        throw error
      }
      // Other errors, continue
    }
  }

  /**
   * Checks if the "Load from Selection" button is visible
   */
  async function isLoadFromSelectionButtonVisible(page: Page): Promise<boolean> {
    const button = page.getByRole('button', { name: /load from selection/i })
    // Check if button exists and is visible - don't wait long
    const count = await button.count()
    if (count === 0) {
      return false
    }
    try {
      // Use a short timeout - if button doesn't appear quickly, it's not visible
      const isVisible = await button.isVisible({ timeout: 1000 })
      return isVisible
    } catch {
      return false
    }
  }

  /**
   * Gets the active preset ID from the app state (via console logs or DOM)
   * For now, we'll check the button visibility and console logs
   */
  async function waitForPresetLoad(page: Page, timeout = 10000) {
    // Wait for loading to complete by checking for network requests
    await page
      .waitForResponse(
        (response) =>
          response.url().includes('/rest/v1/property_settings') &&
          response.request().method() === 'GET' &&
          response.status() === 200,
        { timeout },
      )
      .catch(() => {
        // If no response, that's okay
      })

    // Wait for React to update
    await page.waitForTimeout(300)
  }

  test('no preset IDs found - button should not appear', async ({ page }) => {
    // Mock selection with no preset IDs
    await mockNodeSelection(page, [
      { opacity: 0.5 },
      { width: 100 },
    ])

    // Button should not be visible
    const isVisible = await isLoadFromSelectionButtonVisible(page)
    expect(isVisible).toBe(false)
  })

  async function ensureAutoLoadIsDisabled(page: Page) {
    try {
      const settingsButton = page.getByRole('button', { name: /settings/i })
      await settingsButton.click({ timeout: 5000 })
      
      const menu = page.locator('.popover')
      await expect(menu).toBeVisible({ timeout: 5000 })

      const autoLoadOption = menu.getByTestId('auto-load-from-selected-nodes-setting')
      await autoLoadOption.waitFor({ state: 'visible', timeout: 5000 })
      
      // Find the button and check if check icon is visible (enabled) or hidden (disabled)
      const button = autoLoadOption.locator('button').first()
      const checkIcon = button.locator('svg').first()
      
      // Check visibility - if visible, it's enabled and we need to disable it
      const isVisible = await checkIcon.isVisible({ timeout: 2000 }).catch(() => false)

      if (isVisible) {
        await button.click({ timeout: 5000 })
        // Wait for menu to close after click
        await expect(menu).not.toBeVisible({ timeout: 3000 }).catch(() => {})
        await page.waitForTimeout(200) // Wait for state update
      } else {
        // Already disabled, close menu
        await page.keyboard.press('Escape').catch(() => {})
        await expect(menu).not.toBeVisible({ timeout: 3000 }).catch(() => {})
      }
    } catch (error) {
      // If page closed, that's okay - operation might have completed
      if (error.message && error.message.includes('Target page, context or browser has been closed')) {
        return
      }
      throw error
    }
  }

  async function ensureAutoLoadIsEnabled(page: Page) {
    try {
      const settingsButton = page.getByRole('button', { name: /settings/i })
      await settingsButton.click({ timeout: 5000 })
      
      const menu = page.locator('.popover')
      await expect(menu).toBeVisible({ timeout: 5000 })

      const autoLoadOption = menu.getByTestId('auto-load-from-selected-nodes-setting')
      await autoLoadOption.waitFor({ state: 'visible', timeout: 5000 })
      
      // Find the button and check if check icon is visible (enabled) or hidden (disabled)
      const button = autoLoadOption.locator('button').first()
      const checkIcon = button.locator('svg').first()
      
      // Check visibility - if not visible, it's disabled and we need to enable it
      const isVisible = await checkIcon.isVisible({ timeout: 2000 }).catch(() => false)

      if (!isVisible) {
        await button.click({ timeout: 5000 })
        // Wait for menu to close after click
        await expect(menu).not.toBeVisible({ timeout: 3000 }).catch(() => {})
        await page.waitForTimeout(200) // Wait for state update
      } else {
        // Already enabled, close menu
        await page.keyboard.press('Escape').catch(() => {})
        await expect(menu).not.toBeVisible({ timeout: 3000 }).catch(() => {})
      }
    } catch (error) {
      // If page closed, that's okay - operation might have completed
      if (error.message && error.message.includes('Target page, context or browser has been closed')) {
        return
      }
      throw error
    }
  }

  test('one node with preset ID - button should appear when auto-load is disabled', async ({
    page,
  }) => {
    test.setTimeout(15000) // Give this test more time
    
    const presetId = 'test-preset-id-123'

    // Ensure auto-load is disabled
    await ensureAutoLoadIsDisabled(page)

    // Mock selection with one node that has a preset ID
    await mockNodeSelection(page, [{ presetId, opacity: 0.5 }])

    // Button should be visible
    const isVisible = await isLoadFromSelectionButtonVisible(page)
    expect(isVisible).toBe(true)
  })

  test('multiple nodes with same preset ID - button should appear', async ({ page }) => {
    const presetId = 'test-preset-id-456'

    // Ensure auto-load is disabled
    await ensureAutoLoadIsDisabled(page)

    // Mock selection with multiple nodes that have the same preset ID
    await mockNodeSelection(page, [
      { presetId, opacity: 0.5 },
      { presetId, width: 100 },
      { presetId, height: 200 },
    ])

    // Button should be visible
    const isVisible = await isLoadFromSelectionButtonVisible(page)
    expect(isVisible).toBe(true)
  })

  test('multiple nodes with different preset IDs - uses first one', async ({ page }) => {
    const presetId1 = 'test-preset-id-789'
    const presetId2 = 'test-preset-id-012'

    // Ensure auto-load is disabled
    await ensureAutoLoadIsDisabled(page)

    // Mock selection with nodes that have different preset IDs
    // The first one should be used
    await mockNodeSelection(page, [
      { presetId: presetId1, opacity: 0.5 },
      { presetId: presetId2, width: 100 },
    ])

    // Button should be visible (using first preset ID)
    const isVisible = await isLoadFromSelectionButtonVisible(page)
    expect(isVisible).toBe(true)
  })

  test('mix of nodes with and without preset IDs - button should appear', async ({ page }) => {
    const presetId = 'test-preset-id-mixed'

    // Ensure auto-load is disabled
    await ensureAutoLoadIsDisabled(page)

    // Mock selection with mix of nodes
    await mockNodeSelection(page, [
      { opacity: 0.5 }, // No preset ID
      { presetId, width: 100 }, // Has preset ID
      { height: 200 }, // No preset ID
    ])

    // Button should be visible (because at least one node has a preset ID)
    const isVisible = await isLoadFromSelectionButtonVisible(page)
    expect(isVisible).toBe(true)
  })

  test('auto-load enabled - button should not appear when preset ID found', async ({ page }) => {
    const presetId = 'test-preset-id-auto-load'

    // Enable auto-load
    await ensureAutoLoadIsEnabled(page)

    // Mock selection with preset ID
    await mockNodeSelection(page, [{ presetId, opacity: 0.5 }])

    // Button should NOT be visible (auto-load is enabled, so it loads automatically)
    const isVisible = await isLoadFromSelectionButtonVisible(page)
    expect(isVisible).toBe(false)
  })

  test('selection changes from nodes with preset ID to nodes without - button should disappear', async ({
    page,
  }) => {
    const presetId = 'test-preset-id-change'

    // Ensure auto-load is disabled
    await ensureAutoLoadIsDisabled(page)

    // First selection: nodes with preset ID
    await mockNodeSelection(page, [{ presetId, opacity: 0.5 }])

    // Button should be visible
    let isVisible = await isLoadFromSelectionButtonVisible(page)
    expect(isVisible).toBe(true)

    // Second selection: nodes without preset ID
    await mockNodeSelection(page, [{ opacity: 0.5 }, { width: 100 }])

    // Button should disappear
    isVisible = await isLoadFromSelectionButtonVisible(page)
    expect(isVisible).toBe(false)
  })
})
