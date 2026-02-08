import { expect, test } from '@playwright/test'
import {
  isSettingOptionEnabled,
  reloadAndWait,
  setupNewUser,
  TEST_TIMEOUT,
  toggleSettingOption,
} from './helpers'

test.describe('User Options Persistence (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await setupNewUser(page)

    await page.waitForFunction(
      () => document.documentElement.classList.contains('test-app-fully-ready'),
      { timeout: TEST_TIMEOUT },
    )
  })

  async function waitForUserOptionSignal(
    page: any,
    optionName: string,
  ): Promise<void> {
    await page.waitForFunction(
      (name: string) =>
        document.documentElement.classList.contains(
          `test-user-option-updated-${name}`,
        ),
      optionName,
      { timeout: TEST_TIMEOUT },
    )
  }

  async function waitForAppReadyAfterReload(page: any): Promise<void> {
    await page.waitForFunction(
      () => document.documentElement.classList.contains('test-app-fully-ready'),
      { timeout: 25000 },
    )

    await page
      .getByRole('button', { name: /settings/i })
      .waitFor({ state: 'visible', timeout: 5000 })

    await page.waitForTimeout(200)
  }

  test('multiple user options persist together across reloads', async ({
    page,
  }) => {
    test.setTimeout(30000)

    const options = [
      { optionId: 'auto-scroll-setting', signalName: 'isAutoScrollEnabled' },
      {
        optionId: 'group-by-status-setting',
        signalName: 'isGroupedByStatus',
      },
      { optionId: 'group-by-type-setting', signalName: 'isGroupedByType' },
    ]

    for (const { optionId, signalName } of options) {
      const signalPromise = waitForUserOptionSignal(page, signalName)
      await toggleSettingOption(page, optionId)
      await signalPromise

      // Wait for UI state to update after signal (React re-render)
      await expect(async () => {
        const isEnabled = await isSettingOptionEnabled(page, optionId)
        expect(isEnabled).toBe(true)
      }).toPass({ timeout: TEST_TIMEOUT })
    }

    await reloadAndWait(page)
    await waitForAppReadyAfterReload(page)

    expect(await isSettingOptionEnabled(page, 'auto-scroll-setting')).toBe(true)
    expect(await isSettingOptionEnabled(page, 'group-by-status-setting')).toBe(
      true,
    )
    expect(await isSettingOptionEnabled(page, 'group-by-type-setting')).toBe(
      true,
    )
    expect(
      await isSettingOptionEnabled(page, 'auto-load-from-selected-nodes-setting'),
    ).toBe(false)
  })
})
