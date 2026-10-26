import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv, toDate } from '../lib/csv.mjs'

const sample = (n) => readFileSync(new URL(`../samples/${n}`, import.meta.url), 'utf8')
const mod = (n) => import(`../src/${n}.mjs`)
const run = (n, args = []) => spawnSync(process.execPath, [fileURLToPath(new URL(`../src/${n}.mjs`, import.meta.url)), ...args], { encoding: 'utf8' })
const samplePath = (n) => fileURLToPath(new URL(`../samples/${n}`, import.meta.url))

test('34 feuille de temps : semaines ISO, totaux, filtre de dates, taux par défaut', async () => {
  const { isoWeek, summarise } = await mod('timesheet-summary')
  assert.equal(isoWeek(new Date('2026-01-01T00:00:00Z')), '2026-S01'); assert.equal(isoWeek(new Date('2024-12-30T00:00:00Z')), '2025-S01'); assert.equal(isoWeek(new Date('2021-01-03T00:00:00Z')), '2020-S53')
  const recs = parseCsv(sample('temps.csv')).records
  const s = summarise(recs); assert.deepEqual([s.hours, s.amount], [25.5, 542500]); assert.deepEqual(s.byProject[0], ['Audit processus client A', { hours: 18.5, amount: 462500, entries: 3 }]); assert.deepEqual(s.byWeek, [['2026-S43', 17.5], ['2026-S44', 8]])
  assert.equal(summarise(recs, { from: toDate('2026-10-26') }).hours, 8); assert.equal(summarise(recs, { defaultRate: 10000 }).amount, 542500 + 30000)
  assert.throws(() => summarise([{ date: 'x', hours: '1' }]), /ligne 2/)
})
