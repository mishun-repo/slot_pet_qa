import { type Page, type Locator, expect } from '@playwright/test'

/**
 * Page Object for the in-game Bet Controls (KAN-4 / SLOT-002) of the SUT.
 *
 * Selectors rely on stable data-testid attributes present in the target app
 * (src/App.tsx, src/ui/BetControls/*).
 */
export class BetControlsPage {
  readonly page: Page

  readonly root: Locator
  readonly decreaseBtn: Locator
  readonly increaseBtn: Locator
  readonly totalBetBtn: Locator

  readonly balanceDisplay: Locator

  readonly betModal: Locator
  readonly betModalClose: Locator

  readonly spinBtn: Locator

  constructor(page: Page) {
    this.page = page
    this.root = page.getByTestId('bet-controls')
    this.decreaseBtn = page.getByTestId('btn-bet-decrease')
    this.increaseBtn = page.getByTestId('btn-bet-increase')
    this.totalBetBtn = page.getByTestId('btn-total-bet')

    this.balanceDisplay = page.getByTestId('display-balance')

    this.betModal = page.getByTestId('modal-bet-select')
    this.betModalClose = page.getByTestId('modal-close')

    this.spinBtn = page.getByTestId('btn-spin')
  }

  /** Current total bet as a number (e.g. "$0.50" -> 0.5). */
  async getBet(): Promise<number> {
    return parseMoney(await this.totalBetBtn.innerText())
  }

  /** Current balance as a number ("$10,000.00" -> 10000). */
  async getBalance(): Promise<number> {
    return parseMoney(await this.balanceDisplay.innerText())
  }

  async clickIncrease(): Promise<void> {
    await this.increaseBtn.click()
  }

  async clickDecrease(): Promise<void> {
    await this.decreaseBtn.click()
  }

  async openBetModal(): Promise<void> {
    await this.totalBetBtn.click()
    await expect(this.betModal).toBeVisible()
  }

  betOption(value: number): Locator {
    return this.page.getByTestId(`bet-option-${value}`)
  }
}

/** Parse a money/text string ("$10,000.00", "$0.05\nTOTAL BET") into a number. */
export function parseMoney(text: string): number {
  const match = text.replace(/,/g, '').match(/-?\d+(\.\d+)?/)
  if (!match) throw new Error(`Cannot parse money from: "${text}"`)
  return Number(match[0])
}