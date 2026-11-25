import { test, expect } from '@playwright/test'
import { seedUserWithBalance } from '../helpers/seedUser'

/**
 * KAN-4 (SLOT-002) — Bet validation & balance integrity at the API layer.
 * Per the test pyramid, financial math and server-side bet validation are
 * validated here (not through the UI).
 */

const BASE = process.env.SLOT_API_URL || 'http://localhost:3001'

const VALID_BETS = [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]

function uniqueUser(prefix = 'qa_kan4_api') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
}

async function register(
  request: import('@playwright/test').APIRequestContext,
  username = uniqueUser()
): Promise<{ key: string; balance: number }> {
  const res = await request.post(`${BASE}/auth/login`, {
    data: { username, password: 'pass123' },
  })
  expect(res.status()).toBe(200)
  return res.json()
}

test.describe('KAN-4 API — Bet validation & balance integrity', () => {
  // TC-011
  test('TC-011 — /spin rejects bets not in BETS list', async ({ request }) => {
    const { key } = await register(request)
    const invalidBets: (number | string | null)[] = [0.07, -1, 0, 3, 10, 'abc', null]
    for (const bad of invalidBets) {
      await test.step(`bet=${JSON.stringify(bad)} -> 400`, async () => {
        const res = await request.post(`${BASE}/spin`, { data: { key, bet: bad } })
        expect(res.status(), `bet=${JSON.stringify(bad)} should be rejected`).toBe(400)
        const body = await res.json()
        expect(body.error).toBeTruthy()
      })
    }
  })

  // TC-012
  test('TC-012 — balance_after == balance_before - bet + win (financial integrity)', async ({
    request,
  }) => {
    const { key } = await register(request)
    const initRes = await request.post(`${BASE}/init`, { data: { key } })
    expect(initRes.status()).toBe(200)
    let balance: number = (await initRes.json()).balance
    expect(balance).toBe(10000)

    for (const bet of [0.05, 0.5, 5]) {
      await test.step(`bet=${bet}: balance math holds`, async () => {
        const before = balance
        const res = await request.post(`${BASE}/spin`, { data: { key, bet } })
        expect(res.status()).toBe(200)
        const body = await res.json()
        const expected = +(before - bet + body.win).toFixed(2)
        expect(body.balance).toBeCloseTo(expected, 2)
        expect(body.balance).toBeGreaterThanOrEqual(0)
        balance = body.balance
      })
    }
  })

  // TC-012b
  test('TC-012b — every valid bet in BETS list is accepted', async ({ request }) => {
    const { key } = await register(request)
    for (const bet of VALID_BETS) {
      const res = await request.post(`${BASE}/spin`, { data: { key, bet } })
      expect(res.status(), `valid bet ${bet} accepted`).toBe(200)
      const body = await res.json()
      expect(body.bet).toBe(bet)
    }
  })

  // TC-013
  test('TC-013 — /spin blocks bet greater than balance (HTTP 400)', async ({ request }) => {
    // Deterministic low-balance precondition via DB helper (RNG makes API
    // draining a random walk and thus unreliable/flaky).
    const seeded = seedUserWithBalance(0.05)

    const loginRes = await request.post(`${BASE}/auth/login`, {
      data: { username: seeded.username, password: seeded.password },
    })
    expect(loginRes.status()).toBe(200)
    const { key, balance } = await loginRes.json()
    expect(balance).toBe(0.05)

    const res = await request.post(`${BASE}/spin`, { data: { key, bet: 5 } })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/insufficient/i)

    const initRes = await request.post(`${BASE}/init`, { data: { key } })
    expect((await initRes.json()).balance).toBe(0.05)
  })
})