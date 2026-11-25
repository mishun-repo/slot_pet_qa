import { test, expect } from '@playwright/test'
import { BetControlsPage } from '../pages/BetControlsPage'
import { seedUserWithBalance } from '../helpers/seedUser'

/**
 * @regression @bug-KAN-5
 * KAN-4 / TC-009 — FINANCIAL-INVARIANT defect (Jira: KAN-5):
 * Bet controls let the player select a bet greater than their available
 * balance, via BOTH the "+" button and the bet-selection modal.
 *
 * Violates the domain invariant: "bet > balance must be blocked on the UI".
 *
 * Marked test.fail() so CI stays green until KAN-5 is fixed; when the bug is
 * fixed this test will start PASSING and Playwright will flag the stale
 * expectation (telling us to flip it to a normal assertion).
 */

const BUG_KEY = 'KAN-5'

test.describe(`Regression — ${BUG_KEY}: bet must never exceed balance`, () => {
  test(`TC-009 — plus/modal must not allow bet > balance @regression @bug-${BUG_KEY}`, async ({
    page,
  }) => {
    test.fail(true, `Known defect ${BUG_KEY}: bet selection ignores available balance`)

    // Arrange: deterministic user with $0.05 balance
    const seeded = seedUserWithBalance(0.05)
    await page.goto('/')
    await page.getByTestId('input-username').fill(seeded.username)
    await page.getByTestId('input-password').fill(seeded.password)
    await page.getByTestId('btn-login').click()
    await expect(page.getByTestId('hud')).toBeVisible({ timeout: 20_000 })

    const bet = new BetControlsPage(page)
    const balance = await bet.getBalance()
    expect(balance).toBe(0.05)

    // Act 1: try to increase bet above balance via "+"
    await bet.clickIncrease()
    const afterPlus = await bet.getBet()
    expect(
      afterPlus,
      `bet after "+" (${afterPlus}) must not exceed balance (${balance})`
    ).toBeLessThanOrEqual(balance)

    // Act 2: try to pick an unaffordable option from the modal
    await bet.openBetModal()
    await bet.betOption(5).click()
    const afterModal = await bet.getBet()
    expect(
      afterModal,
      `bet selected from modal (${afterModal}) must not exceed balance (${balance})`
    ).toBeLessThanOrEqual(balance)
  })
})