import { expect, Page, test } from '@playwright/test'
import { reloadAndWait, setupNewUser, TEST_TIMEOUT, toggleSettingOption } from './helpers'

test.describe('User Options Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await setupNewUser(page)
    
    // Wait for app to be fully ready (options + property settings loaded, refs set)
    await page.waitForFunction(
      () => document.documentElement.classList.contains('test-app-fully-ready'),
      { timeout: TEST_TIMEOUT }
    )
  })

  async function waitForUserOptionSignal(
    page: Page,
    optionName: string,
  ): Promise<void> {
    // Wait for the class to be added to <html> element
    // Use waitForFunction to poll for the class, which is more reliable for dynamic additions
    await page.waitForFunction(
      (name) => document.documentElement.classList.contains(`test-user-option-updated-${name}`),
      optionName,
      { timeout: TEST_TIMEOUT }
    )
  }

  async function waitForAppReadyAfterReload(page: Page): Promise<void> {
    // Wait for app to be fully ready after reload
    await page.waitForFunction(
      () => document.documentElement.classList.contains('test-app-fully-ready'),
      { timeout: 25000 }
    )
    
    // Wait for toolbar to be visible to ensure Settings button is ready
    await page.getByRole('button', { name: /settings/i }).waitFor({ state: 'visible', timeout: 5000 })
    
    // Small delay to ensure React has finished rendering
    await page.waitForTimeout(200)
  }

  async function toggleUserOption(
    page: Page,
    optionId: string,
    optionName: string,
  ) {
    await toggleSettingOption(page, optionId)
  }

  async function isUserOptionEnabled(page: Page, optionId: string, expectedEnabled?: boolean): Promise<boolean> {
    try {
      // If we have an expected state, retry opening the menu until we get the correct state
      if (expectedEnabled !== undefined) {
        return await expect(async () => {
          const settingsButton = page.getByRole('button', { name: /settings/i })
          await settingsButton.waitFor({ state: 'visible', timeout: 5000 })
          // Ensure button is not disabled
          await expect(settingsButton).not.toBeDisabled({ timeout: 2000 })
          await settingsButton.scrollIntoViewIfNeeded()
          // Wait a bit for any animations/transitions to complete
          await page.waitForTimeout(100)
          
          // Click the button
          await settingsButton.click({ timeout: 5000 })
          
          // Wait for menu to appear and be stable
          const menu = page.getByRole('menu', { name: 'Settings' })
          await expect(menu).toBeVisible({ timeout: 5000 })
          // Wait a bit longer to ensure menu is fully rendered and stable
          await page.waitForTimeout(300)

          const option = menu.getByTestId(optionId)
          await option.waitFor({ state: 'visible', timeout: 5000 })

          // Check attributes on either the wrapper div or the button
          const button = option.locator('button').first()
          await button.waitFor({ state: 'attached', timeout: 2000 })
          
          // Wait for the attribute to match expected state
          // Check both wrapper and button - at least one should have the correct attribute
          if (expectedEnabled) {
            // Wait for either element to have the enabled attribute
            // Use a single retry loop that checks all possible locations
            let foundEnabled = false
            for (let attempt = 0; attempt < 10; attempt++) {
              const wrapperDataEnabled = await option.getAttribute('data-enabled').catch(() => null)
              const buttonDataEnabled = await button.getAttribute('data-enabled').catch(() => null)
              const wrapperAriaChecked = await option.getAttribute('aria-checked').catch(() => null)
              const buttonAriaChecked = await button.getAttribute('aria-checked').catch(() => null)
              
              foundEnabled = 
                wrapperDataEnabled === 'true' || 
                buttonDataEnabled === 'true' || 
                wrapperAriaChecked === 'true' || 
                buttonAriaChecked === 'true'
              
              if (foundEnabled) {
                break
              }
              
              // Also check if checkmark icon is visible (more reliable than attributes)
              // The checkmark icon is in a span - check if any icon container has opacity > 0
              const iconContainers = option.locator('span[class*="size-8"]')
              const count = await iconContainers.count()
              for (let i = 0; i < count; i++) {
                const container = iconContainers.nth(i)
                const isCheckVisible = await container.evaluate((el) => {
                  const style = window.getComputedStyle(el)
                  return parseFloat(style.opacity) > 0 && style.visibility !== 'hidden'
                }).catch(() => false)
                
                if (isCheckVisible) {
                  foundEnabled = true
                  break
                }
              }
              
              if (foundEnabled) {
                break
              }
              
              // Wait a bit before retrying (allows React to re-render)
              await page.waitForTimeout(100)
            }
            
            if (!foundEnabled) {
              const wrapperDataEnabled = await option.getAttribute('data-enabled').catch(() => null)
              const buttonDataEnabled = await button.getAttribute('data-enabled').catch(() => null)
              const wrapperAriaChecked = await option.getAttribute('aria-checked').catch(() => null)
              const buttonAriaChecked = await button.getAttribute('aria-checked').catch(() => null)
              throw new Error(`Expected enabled state but got: wrapper data-enabled=${wrapperDataEnabled}, aria-checked=${wrapperAriaChecked}, button data-enabled=${buttonDataEnabled}, aria-checked=${buttonAriaChecked}`)
            }
          } else {
            // For disabled, verify attributes are 'false' or null/undefined
            const wrapperDataEnabled = await option.getAttribute('data-enabled')
            const buttonDataEnabled = await button.getAttribute('data-enabled')
            const wrapperAriaChecked = await option.getAttribute('aria-checked')
            const buttonAriaChecked = await button.getAttribute('aria-checked')
            
            const foundEnabled = 
              wrapperDataEnabled === 'true' || 
              buttonDataEnabled === 'true' || 
              wrapperAriaChecked === 'true' || 
              buttonAriaChecked === 'true'
            
            if (foundEnabled) {
              throw new Error('Expected disabled state but got enabled')
            }
          }
          
          // Close menu before returning
          await page.keyboard.press('Escape').catch(() => {})
          await expect(menu).not.toBeVisible({ timeout: 2000 }).catch(() => {})
          
          // Return final state by checking attributes one more time
          const wrapperDataEnabled = await option.getAttribute('data-enabled').catch(() => null)
          const buttonDataEnabled = await button.getAttribute('data-enabled').catch(() => null)
          const wrapperAriaChecked = await option.getAttribute('aria-checked').catch(() => null)
          const buttonAriaChecked = await button.getAttribute('aria-checked').catch(() => null)
          
          return Boolean(
            wrapperDataEnabled === 'true' || 
            buttonDataEnabled === 'true' || 
            wrapperAriaChecked === 'true' || 
            buttonAriaChecked === 'true'
          )
        }).toPass({ timeout: TEST_TIMEOUT })
      }
      
      // No expected state - just check current state
      const settingsButton = page.getByRole('button', { name: /settings/i })
      await settingsButton.waitFor({ state: 'visible', timeout: 5000 })
      // Ensure button is not disabled
      await expect(settingsButton).not.toBeDisabled({ timeout: 2000 })
      await settingsButton.scrollIntoViewIfNeeded()
      // Wait a bit for any animations/transitions to complete
      await page.waitForTimeout(100)
      
      // Click the button
      await settingsButton.click({ timeout: 5000 })
      
      // Wait for menu to appear and be stable
      const menu = page.getByRole('menu', { name: 'Settings' })
      await expect(menu).toBeVisible({ timeout: 5000 })
      // Wait a bit longer to ensure menu is fully rendered and stable
      await page.waitForTimeout(300)

      const option = menu.getByTestId(optionId)
      await option.waitFor({ state: 'visible', timeout: 5000 })

      const button = option.locator('button').first()
      await button.waitFor({ state: 'attached', timeout: 2000 })
      
      // Wait for attributes to be set (they might not be set immediately after menu opens)
      // Retry checking attributes until we get a valid value
      let isEnabled = false
      for (let attempt = 0; attempt < 10; attempt++) {
        const wrapperAriaChecked = await option.getAttribute('aria-checked').catch(() => null)
        const wrapperDataEnabled = await option.getAttribute('data-enabled').catch(() => null)
        const buttonAriaChecked = await button.getAttribute('aria-checked').catch(() => null)
        const buttonDataEnabled = await button.getAttribute('data-enabled').catch(() => null)
        
        isEnabled = 
          wrapperAriaChecked === 'true' || 
          wrapperDataEnabled === 'true' || 
          buttonAriaChecked === 'true' || 
          buttonDataEnabled === 'true'
        
        if (isEnabled) {
          break
        }
        
        // Also check if checkmark icon is visible (more reliable than attributes)
        // The checkmark icon is in a span - check if any icon container has opacity > 0
        const iconContainers = option.locator('span[class*="size-8"]')
        const count = await iconContainers.count()
        for (let i = 0; i < count; i++) {
          const container = iconContainers.nth(i)
          const isCheckVisible = await container.evaluate((el) => {
            const style = window.getComputedStyle(el)
            return parseFloat(style.opacity) > 0 && style.visibility !== 'hidden'
          }).catch(() => false)
          
          if (isCheckVisible) {
            isEnabled = true
            break
          }
        }
        
        if (isEnabled) {
          break
        }
        
        await page.waitForTimeout(100)
      }

      // Close menu
      try {
        const isMenuVisible = await menu.isVisible().catch(() => false)
        if (isMenuVisible) {
          await page.keyboard.press('Escape').catch(() => {})
          await expect(menu).not.toBeVisible({ timeout: 2000 }).catch(() => {})
        }
      } catch (error) {
        // Page might have closed, ignore
      }

      return isEnabled
    } catch (error) {
      // If page closed, return false as fallback
      if (error.message && error.message.includes('Target page, context or browser has been closed')) {
        return false
      }
      throw error
    }
  }

  const userOptionTests = [
    {
      optionId: 'auto-scroll-setting',
      signalName: 'isAutoScrollEnabled',
    },
    {
      optionId: 'group-by-status-setting',
      signalName: 'isGroupedByStatus',
    },
    {
      optionId: 'group-by-type-setting',
      signalName: 'isGroupedByType',
    },
    {
      optionId: 'auto-load-from-selected-nodes-setting',
      signalName: 'isAutoLoadFromSelectedNodes',
    },
  ]

  for (const { optionId, signalName } of userOptionTests) {
    test(`${optionId} persists across reloads`, async ({ page }) => {
      test.setTimeout(30000)
      
      let isEnabled = await isUserOptionEnabled(page, optionId)
      expect(isEnabled).toBe(false)

      const signalPromise = waitForUserOptionSignal(page, signalName)
      await toggleUserOption(page, optionId, signalName)
      await signalPromise

      isEnabled = await isUserOptionEnabled(page, optionId)
      expect(isEnabled).toBe(true)

      await reloadAndWait(page)
      await waitForAppReadyAfterReload(page)

      isEnabled = await isUserOptionEnabled(page, optionId)
      expect(isEnabled).toBe(true)
    })
  }

  test('multiple user options persist together across reloads', async ({ page }) => {
    test.setTimeout(30000)
    
    // Enable first option
    const signalPromise1 = waitForUserOptionSignal(page, 'isAutoScrollEnabled')
    await toggleUserOption(page, 'auto-scroll-setting', 'isAutoScrollEnabled')
    await signalPromise1
    let isEnabled = await isUserOptionEnabled(page, 'auto-scroll-setting')
    expect(isEnabled).toBe(true)

    // Enable second option
    const signalPromise2 = waitForUserOptionSignal(page, 'isGroupedByStatus')
    await toggleUserOption(page, 'group-by-status-setting', 'isGroupedByStatus')
    await signalPromise2
    isEnabled = await isUserOptionEnabled(page, 'group-by-status-setting')
    expect(isEnabled).toBe(true)

    // Enable third option
    const signalPromise3 = waitForUserOptionSignal(page, 'isGroupedByType')
    await toggleUserOption(page, 'group-by-type-setting', 'isGroupedByType')
    await signalPromise3
    isEnabled = await isUserOptionEnabled(page, 'group-by-type-setting')
    expect(isEnabled).toBe(true)

    // Reload
    await reloadAndWait(page)
    await waitForAppReadyAfterReload(page)

    // Verify all are still enabled
    expect(await isUserOptionEnabled(page, 'auto-scroll-setting')).toBe(true)
    expect(await isUserOptionEnabled(page, 'group-by-status-setting')).toBe(true)
    expect(await isUserOptionEnabled(page, 'group-by-type-setting')).toBe(true)
    expect(await isUserOptionEnabled(page, 'auto-load-from-selected-nodes-setting')).toBe(false)
  })
})
