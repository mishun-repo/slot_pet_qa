import { test, expect } from '../fixtures/game.fixture'

/**
 * KAN-4 (SLOT-002) — Bet Controls
 * Acceptance Criteria:
 *  - Default bet is first from list after init
 *  - + increases to next step; at max + disabled
 *  - - decreases; at min - disabled
 *  - Click total bet opens modal with options
 *  - Select option updates bet and closes modal
 *  - Controls disabled while spinning / autoplay / modal open
 *
 * Domain invariants (enterprise QA): balance integrity, bet <= balance.
 *
 * TC-009 (bet must not exceed balance) lives in tests/regression/bug-KAN-5.spec.ts
 * because it currently reproduces known defect KAN-5 (marked test.fail).
 */

const BETS = [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5] as const

test.describe('KAN-4 — Bet Controls (E2E)', () => {
  // TC-001
  test('TC-001 — default total bet is first value from BETS after init', async ({ bet }) => {
    await test.step('Read total bet label', async () => {
      expect(await bet.getBet()).toBe(BETS[0])
    })
  })

  // TC-002
  test('TC-002 — increase steps up through BETS list in order', async ({ bet }) => {
    await expect.poll(() => bet.getBet()).toBe(BETS[0])
    for (let i = 1; i < BETS.length; i++) {
      await test.step(`Click + -> expect $${BETS[i].toFixed(2)}`, async () => {
        await bet.clickIncrease()
        await expect.poll(() => bet.getBet()).toBe(BETS[i])
      })
    }
  })

  // TC-003
  test('TC-003 — decrease steps down through BETS list in order', async ({ bet }) => {
    for (let i = 1; i < BETS.length; i++) await bet.clickIncrease()
    await expect.poll(() => bet.getBet()).toBe(BETS[BETS.length - 1])
    for (let i = BETS.length - 2; i >= 0; i--) {
      await test.step(`Click - -> expect $${BETS[i].toFixed(2)}`, async () => {
        await bet.clickDecrease()
        await expect.poll(() => bet.getBet()).toBe(BETS[i])
      })
    }
  })

  // TC-004
  test('TC-004 — minus button is disabled at minimum bet (BVA min)', async ({ bet }) => {
    await test.step('At default (min) the decrease button is disabled', async () => {
      await expect.poll(() => bet.getBet()).toBe(BETS[0])
      await expect(bet.decreaseBtn).toBeDisabled()
    })
  })

  // TC-005
  test('TC-005 — plus button is disabled at maximum bet (BVA max)', async ({ bet }) => {
    await test.step('Walk up to max bet', async () => {
      for (let i = 1; i < BETS.length; i++) await bet.clickIncrease()
      await expect.poll(() => bet.getBet()).toBe(BETS[BETS.length - 1])
    })
    await test.step('Increase is disabled at max', async () => {
      await expect(bet.increaseBtn).toBeDisabled()
    })
  })

  // TC-006
  test('TC-006 — click total bet opens selection modal with all options', async ({ bet }) => {
    await bet.openBetModal()
    await test.step('Modal shows all options', async () => {
      await expect(bet.betModal).toBeVisible()
      for (const value of BETS) await expect(bet.betOption(value)).toBeVisible()
    })
  })

  // TC-007
  test('TC-007 — selecting an option updates bet and closes modal', async ({ bet }) => {
    await bet.openBetModal()
    await test.step('Pick $0.50', async () => {
      await bet.betOption(0.5).click()
    })
    await test.step('Bet updated and modal closed', async () => {
      await expect(bet.betModal).toBeHidden()
      await expect.poll(() => bet.getBet()).toBe(0.5)
    })
  })

  // TC-008
  test('TC-008 — bet +/- controls are disabled while bet modal is open', async ({ bet }) => {
    await bet.openBetModal()
    await test.step('Both +/- disabled while modal open', async () => {
      await expect(bet.decreaseBtn).toBeDisabled()
      await expect(bet.increaseBtn).toBeDisabled()
    })
    await test.step('After closing modal, controls re-enabled per boundaries', async () => {
      await bet.betModalClose.click()
      await expect(bet.betModal).toBeHidden()
      await expect(bet.decreaseBtn).toBeDisabled()
      await expect(bet.increaseBtn).toBeEnabled()
    })
  })
})