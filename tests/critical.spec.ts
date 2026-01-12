import { expect, test } from '@playwright/test'
import { enableProperty, isPropertyEnabled, reloadAndWait, setupNewUser } from './helpers'

test.describe('Critical Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupNewUser(page)
  })

  test('new user can see all presets', async ({ page }) => {
    const presetsButton = page.getByRole('button', { name: /presets/i })
    await presetsButton.click()

    const presetMenu = page.locator('.popover')
    await expect(presetMenu).toBeVisible()

    const presetItems = presetMenu.locator('button, [role="menuitem"]')
    const presetCount = await presetItems.count()

    expect(presetCount).toBeGreaterThan(0)
  })

  test('property is disabled initially for new user', async ({ page }) => {
    const isEnabled = await isPropertyEnabled(page, 'opacity')
    expect(isEnabled).toBe(false)
  })

  test('can enable property randomization, reload, and it persists', async ({ page }) => {
    await enableProperty(page, 'opacity')

    await reloadAndWait(page)

    const isEnabledAfterReload = await isPropertyEnabled(page, 'opacity')
    expect(isEnabledAfterReload).toBe(true)
  })
})
