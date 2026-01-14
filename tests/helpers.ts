import { Page, expect } from '@playwright/test'

export const TEST_TIMEOUT = 15000

export async function setupNewUser(page: Page): Promise<string> {
  const TEST_USER_ID = 'test-user-' + Date.now() + '-' + Math.random().toString(36).substring(7)

  // Set up listener script that will run on every page load
  await page.addInitScript(() => {
    // Reset the flag on each page load
    (window as any).__testSignalAppInitialDataLoaded = false
  })

  await page.goto(`/properties?figmaUserId=${TEST_USER_ID}`)

  await page.waitForSelector('text=Loading!', { state: 'hidden', timeout: 8000 }).catch(() => {
    // If Loading! text doesn't appear, that's fine - it means loading was fast
  })

  // Wait for property panel to appear
  // Use a timeout less than test timeout to leave buffer for other operations
  // The panel might be delayed if isFactoryResetting, isUserSettingsChanging, or isPresetLoading is true
  try {
    await page.getByTestId('property-panel-opacity').waitFor({ state: 'visible', timeout: 8000 })
  } catch (error) {
    // If panel doesn't appear, it might be in a loading state
    // Wait a bit more and try again with a shorter timeout
    await page.waitForTimeout(500)
    await page.getByTestId('property-panel-opacity').waitFor({ state: 'visible', timeout: 1500 })
  }

  // UI is visible, so app is ready - no need to wait for signal
  // Brief wait for React to render
  await page.waitForTimeout(200)

  return TEST_USER_ID
}

export async function waitForPropertyPanel(page: Page, propertyName: string) {
  const panelHeader = page.getByTestId(`property-panel-${propertyName}`)
  await expect(panelHeader).toBeVisible({ timeout: TEST_TIMEOUT })
  return panelHeader
}

export async function getPropertyToggle(page: Page, propertyName: string) {
  const toggle = page.getByTestId(`property-toggle-${propertyName}`)
  await toggle.waitFor({ state: 'visible', timeout: TEST_TIMEOUT })
  return toggle
}

export async function isPropertyEnabled(page: Page, propertyName: string): Promise<boolean> {
  const toggle = await getPropertyToggle(page, propertyName)
  const pressed = await toggle.getAttribute('aria-pressed')
  return pressed === 'true'
}

export async function enableProperty(page: Page, propertyName: string, waitForDbWrite = false) {
  const toggle = await getPropertyToggle(page, propertyName)
  const isEnabled = await isPropertyEnabled(page, propertyName)

  if (!isEnabled) {
    await toggle.scrollIntoViewIfNeeded()
    await toggle.click()

    // Verify UI state updated (this is synchronous)
    await expect(toggle).toHaveAttribute('aria-pressed', 'true', { timeout: TEST_TIMEOUT })

    // Only wait for DB write if explicitly requested (for persistence tests)
    if (waitForDbWrite) {
      // Wait for debounce time (300ms) + buffer to ensure DB write completes
      // We don't wait for signals here to avoid timeouts - UI state is already verified
      await page.waitForTimeout(500)
    }
  }
}

export async function getModeButtons(page: Page, propertyName: string) {
  const panelContent = page.getByTestId(`property-panel-${propertyName}`)
  const radiogroup = panelContent.locator('[role="radiogroup"]')
  await expect(radiogroup).toBeVisible({ timeout: 2000 })
  return radiogroup.locator('[role="radio"]')
}

export async function switchMode(
  page: Page,
  propertyName: string,
  mode: 'range' | 'list' | 'addition',
  waitForDbWrite = false,
) {
  const modeButton = page.getByTestId(`mode-button-${propertyName}-${mode}`)
  await modeButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUT })

  await modeButton.scrollIntoViewIfNeeded()
  await modeButton.click()

  // Verify the mode button is now active (this is synchronous)
  await expect(modeButton).toHaveAttribute('aria-selected', 'true', { timeout: TEST_TIMEOUT })

  // Only wait for DB write if explicitly requested
  if (waitForDbWrite) {
    // Wait for debounce time (300ms) + buffer to ensure DB write completes
    // We don't wait for signals here to avoid timeouts - UI state is already verified
    await page.waitForTimeout(500)
  }
}

export async function verifyRangeModeUI(page: Page, propertyName: string) {
  const panelContent = page.getByTestId(`property-panel-${propertyName}`)
  const minField = panelContent.getByTestId(`input-${propertyName}-min`)
  const maxField = panelContent.getByTestId(`input-${propertyName}-max`)
  await expect(minField).toBeVisible({ timeout: 2000 })
  await expect(maxField).toBeVisible({ timeout: 2000 })

  // Operator should NOT be visible in range mode
  const operatorLabel = panelContent.locator('label:has-text("operator")')
  const operatorVisible = await operatorLabel.isVisible().catch(() => false)
  expect(operatorVisible).toBe(false)
}

export async function verifyListModeUI(page: Page, propertyName: string) {
  const panelContent = page.getByTestId(`property-panel-${propertyName}`)

  // Min/max/operator should NOT be visible
  const minField = panelContent.getByTestId(`input-${propertyName}-min`)
  const maxField = panelContent.getByTestId(`input-${propertyName}-max`)
  const operatorLabel = panelContent.locator('label:has-text("operator")')
  const minVisible = await minField.isVisible().catch(() => false)
  const maxVisible = await maxField.isVisible().catch(() => false)
  const operatorVisible = await operatorLabel.isVisible().catch(() => false)

  expect(minVisible).toBe(false)
  expect(maxVisible).toBe(false)
  expect(operatorVisible).toBe(false)
}

export async function verifyAdditionModeUI(page: Page, propertyName: string) {
  const panelContent = page.getByTestId(`property-panel-${propertyName}`)
  const minField = panelContent.getByTestId(`input-${propertyName}-min`)
  const maxField = panelContent.getByTestId(`input-${propertyName}-max`)
  const operatorLabel = panelContent.locator('label:has-text("operator")')
  await expect(minField).toBeVisible({ timeout: 2000 })
  await expect(maxField).toBeVisible({ timeout: 2000 })
  await expect(operatorLabel).toBeVisible({ timeout: 2000 })
}

export async function waitForAllDatabaseWrites(page: Page, timeout = TEST_TIMEOUT) {
  // Wait for all pending property setting updates to complete
  // We check for test signal classes on <html> element instead of network responses
  const startTime = Date.now()
  const seenSignals = new Set<string>()

  while (Date.now() - startTime < timeout) {
    try {
      // Check for any property-setting-updated classes that we haven't seen yet
      const htmlClasses = await page.evaluate(() => {
        return Array.from(document.documentElement.classList)
          .filter(cls => cls.startsWith('test-property-setting-updated-'))
      })

      let foundNew = false
      for (const className of htmlClasses) {
        // Extract propertyName and path from class name: test-property-setting-updated-{propertyName}-{path}
        const match = className.match(/^test-property-setting-updated-(.+?)-(.+)$/)
        if (match) {
          const [, propertyName, path] = match
          const signalKey = `${propertyName}:${path}`
          if (!seenSignals.has(signalKey)) {
            seenSignals.add(signalKey)
            foundNew = true
          }
        }
      }

      if (foundNew) {
        // Brief wait to see if more signals come
        await page.waitForTimeout(100)
      } else {
        // No new signals, likely no more pending writes
        // Wait for debounce time + buffer to ensure any final writes complete
        await page.waitForTimeout(400) // 300ms debounce + 100ms buffer
        break
      }
    } catch {
      // Error checking classes, wait for debounce time + buffer
      await page.waitForTimeout(400) // 300ms debounce + 100ms buffer
      break
    }
  }

  // Brief buffer to ensure any final writes complete
  await page.waitForTimeout(200)
}

export async function reloadAndWait(page: Page) {
  try {
    await page.reload({ waitUntil: 'domcontentloaded' })
  } catch (error: any) {
    // If page is already closed, rethrow
    if (error?.message?.includes('Target page, context or browser has been closed')) {
      throw error
    }
    // Otherwise, continue - reload might have succeeded
  }

  // Wait for initial loading to complete
  try {
    await page.waitForSelector('text=Loading!', { state: 'hidden', timeout: TEST_TIMEOUT })
  } catch (error: any) {
    // If page closed, rethrow
    if (error?.message?.includes('Target page, context or browser has been closed')) {
      throw error
    }
    // Otherwise, continue - loading might have been fast
  }

  // Wait for app to be ready - this handles cases where isUserSettingsChanging or isPresetLoading
  // might be true, which would show a loading placeholder instead of property panels
  try {
    await page.waitForFunction(
      () => document.documentElement.classList.contains('test-app-fully-ready'),
      { timeout: 25000 }
    )
  } catch (error: any) {
    // If page closed during wait, rethrow
    if (error?.message?.includes('Target page, context or browser has been closed')) {
      throw error
    }
    // Otherwise, continue - property panel check will verify
  }

  // Now wait for property panel to be visible
  // Use a try-catch to handle page closure gracefully
  try {
    await page.getByTestId('property-panel-opacity').waitFor({ state: 'visible', timeout: TEST_TIMEOUT })
  } catch (error: any) {
    // If page closed, rethrow
    if (error?.message?.includes('Target page, context or browser has been closed')) {
      throw error
    }
    // If panel doesn't appear, it might be in a loading state
    // Wait a bit more and try again with a shorter timeout
    await page.waitForTimeout(500)
    try {
      await page.getByTestId('property-panel-opacity').waitFor({ state: 'visible', timeout: 1500 })
    } catch (retryError: any) {
      // If page closed during retry, rethrow
      if (retryError?.message?.includes('Target page, context or browser has been closed')) {
        throw retryError
      }
      // Otherwise, rethrow the original error
      throw error
    }
  }

  // Brief wait for React to process the loaded data
  await page.waitForTimeout(300)
}

export async function waitForModeToBeSet(
  page: Page,
  propertyName: string,
  expectedMode: 'range' | 'list' | 'addition',
  timeout = 5000,
) {
  const modeButton = page.getByTestId(`mode-button-${propertyName}-${expectedMode}`)
  await modeButton.waitFor({ state: 'visible', timeout })
  // Wait for the mode to be selected (might take a moment for React to update)
  await expect(modeButton).toHaveAttribute('aria-selected', 'true', { timeout })
}

export async function openSettingsMenu(page: Page) {
  const settingsButton = page.getByRole('button', { name: /settings/i })
  await settingsButton.waitFor({ state: 'visible', timeout: 5000 })
  await expect(settingsButton).not.toBeDisabled({ timeout: 2000 })
  await settingsButton.scrollIntoViewIfNeeded()
  await page.waitForTimeout(100)
  await settingsButton.click({ timeout: 5000 })
  
  const menu = page.getByRole('menu', { name: 'Settings' }).or(page.locator('.popover')).first()
  await expect(menu).toBeVisible({ timeout: 5000 })
  await page.waitForTimeout(300)
  return menu
}

export async function closeSettingsMenu(page: Page) {
  await page.keyboard.press('Escape').catch(() => {})
  const menu = page.getByRole('menu', { name: 'Settings' }).or(page.locator('.popover')).first()
  await expect(menu).not.toBeVisible({ timeout: 3000 }).catch(() => {})
}

export async function toggleSettingOption(page: Page, optionId: string) {
  try {
    const menu = await openSettingsMenu(page)
    const option = menu.getByTestId(optionId)
    await option.waitFor({ state: 'visible', timeout: 5000 })
    const button = option.locator('button').first()
    await button.click({ timeout: 5000 })
    await closeSettingsMenu(page)
    await page.waitForTimeout(200)
  } catch (error: any) {
    if (error?.message?.includes('Target page, context or browser has been closed')) {
      return
    }
    throw error
  }
}

export async function isSettingOptionEnabled(page: Page, optionId: string): Promise<boolean> {
  try {
    const menu = await openSettingsMenu(page)
    const option = menu.getByTestId(optionId)
    await option.waitFor({ state: 'visible', timeout: 5000 })
    const button = option.locator('button').first()
    await button.waitFor({ state: 'attached', timeout: 2000 })
    
    const checkIcon = button.locator('svg').first()
    const isVisible = await checkIcon.isVisible({ timeout: 2000 }).catch(() => false)
    
    await closeSettingsMenu(page)
    return isVisible
  } catch (error: any) {
    if (error?.message?.includes('Target page, context or browser has been closed')) {
      return false
    }
    throw error
  }
}

export async function ensureSettingOptionState(page: Page, optionId: string, enabled: boolean) {
  try {
    const menu = await openSettingsMenu(page)
    const option = menu.getByTestId(optionId)
    await option.waitFor({ state: 'visible', timeout: 5000 })
    const button = option.locator('button').first()
    const checkIcon = button.locator('svg').first()
    const isVisible = await checkIcon.isVisible({ timeout: 2000 }).catch(() => false)
    
    if (enabled !== isVisible) {
      await button.click({ timeout: 5000 })
      await page.waitForTimeout(200)
    }
    
    await closeSettingsMenu(page)
  } catch (error: any) {
    if (error?.message?.includes('Target page, context or browser has been closed')) {
      return
    }
    throw error
  }
}

export async function verifyModeIsSelected(
  page: Page,
  propertyName: string,
  mode: 'range' | 'list' | 'addition',
) {
  const modeButton = page.getByTestId(`mode-button-${propertyName}-${mode}`)
  await modeButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUT })
  const isSelected = await modeButton.getAttribute('aria-selected')
  expect(isSelected).toBe('true')
}

export async function waitForPropertyPanels(page: Page, propertyNames: string[]) {
  for (const propertyName of propertyNames) {
    await page.getByTestId(`property-panel-${propertyName}`).waitFor({ state: 'visible', timeout: TEST_TIMEOUT })
  }
}
