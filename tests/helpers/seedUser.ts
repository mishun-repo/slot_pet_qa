import fs from 'fs'
import path from 'path'

/**
 * Test-data helper: seed a user with an exact balance directly into the SUT
 * persistence file (server/data/users.json).
 *
 * Why DB-seed instead of UI/API draining: the spin RNG makes the balance a
 * random walk (it can grow unbounded), so draining through the API would be
 * flaky for balance-boundary tests. The server reads the users file on each
 * login (server/src/session/users.ts), so a freshly seeded user yields a
 * deterministic session balance.
 *
 * BOM note: the server's JSON.parse does not tolerate a UTF-8 BOM, so we always
 * write BOM-free UTF-8.
 *
 * SUT location resolution (first match wins):
 *   1. SLOT_PROJECT_ROOT env var (absolute path to slot_pet_project)
 *   2. ../../slot_pet_project relative to this repo (local dev layout)
 *   3. ../../slot_pet_project relative to GITHUB_WORKSPACE (CI sibling checkout)
 */

function resolveUsersFile(): string {
  const candidates: string[] = []
  if (process.env.SLOT_PROJECT_ROOT) {
    candidates.push(path.join(process.env.SLOT_PROJECT_ROOT, 'server', 'data', 'users.json'))
  }
  // local: repo sibling  (C:/.../repo/slot-pet-qa -> C:/.../repo/slot_pet_project)
  candidates.push(path.resolve(__dirname, '../../../slot_pet_project/server/data/users.json'))
  // CI: actions/checkout places both under GITHUB_WORKSPACE
  if (process.env.GITHUB_WORKSPACE) {
    candidates.push(path.join(process.env.GITHUB_WORKSPACE, 'slot_pet_project', 'server', 'data', 'users.json'))
  }

  const found = candidates.find((p) => fs.existsSync(path.dirname(p)))
  if (!found) {
    throw new Error(
      `Cannot locate SUT users.json. Tried:\n${candidates.join('\n')}\n` +
        `Set SLOT_PROJECT_ROOT to the slot_pet_project repo root.`
    )
  }
  return found
}

export interface SeededUser {
  username: string
  password: string
  balance: number
}

export function seedUserWithBalance(balance: number, password = 'pass123'): SeededUser {
  const usersFile = resolveUsersFile()
  const username = `qa_kan4_seed_${Date.now()}_${Math.floor(Math.random() * 1e6)}`

  let users: Record<string, unknown> = {}
  if (fs.existsSync(usersFile)) {
    const raw = fs.readFileSync(usersFile, 'utf-8').replace(/^\uFEFF/, '')
    users = raw.trim() ? JSON.parse(raw) : {}
  }

  // key is lowercase username (server uses username.toLowerCase())
  users[username.toLowerCase()] = {
    username,
    password,
    balance,
    lastSpin: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  fs.mkdirSync(path.dirname(usersFile), { recursive: true })
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), { encoding: 'utf-8' })

  return { username, password, balance }
}