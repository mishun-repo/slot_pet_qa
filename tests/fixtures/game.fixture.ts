import { test as base, expect, type Page } from '@playwright/test'
import { BetControlsPage } from '../pages/BetControlsPage'

export const API_URL = process.env.SLOT_API_URL || 'http://localhost:3001'

/** Unique username generator for isolated test users. */
export function uniqueUser(prefix = 'qa_kan4'): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
}

/**
 * UI login helper.
 * The SUT client keeps the session key in a module-level variable inside
 * src/game/api.ts (NOT a cookie/localStorage), so each test MUST log in through
 * the UI — we cannot pre-seed auth via storageState.
 */
export async function loginViaUI(
  page: Page,
  username: string,
  password = 'pass123'
): Promise<void> {
  await page.goto('/')
  await page.getByTestId('input-username').fill(username)
  await page.getByTestId('input-password').fill(password)
  await page.getByTestId('btn-login').click()
  await expect(page.getByTestId('hud')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByTestId('bet-controls')).toBeVisible()
}

export type Fixtures = {
  bet: BetControlsPage
}

/**
 * Extended test with a `bet` page object.
 * Every test gets a fresh user already on the game screen.
 */
export const test = base.extend<Fixtures>({
  bet: async ({ page }, use) => {
    await loginViaUI(page, uniqueUser())
    await use(new BetControlsPage(page))
  },
})

export { expect }