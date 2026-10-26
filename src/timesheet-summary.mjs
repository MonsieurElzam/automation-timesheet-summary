#!/usr/bin/env node
/* Feuille de temps : heures et montants à facturer par projet et par semaine, à partir d'un CSV de saisies. */
import { readFileSync } from 'node:fs'
import { parseCsv, toNumber, toDate } from '../lib/csv.mjs'
import { money, round } from '../lib/format.mjs'
import { isMain, parseArgs, usage, fail } from '../lib/cli.mjs'

/** Numéro de semaine ISO « AAAA-Sxx » (le lundi est le premier jour). */
export function isoWeek(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return `${d.getUTCFullYear()}-S${String(Math.ceil(((d - yearStart) / 86_400_000 + 1) / 7)).padStart(2, '0')}`
}

/** Saisies : date, project, hours, rate (taux horaire, facultatif), note. */
export function summarise(records, { from, to, defaultRate = 0 } = {}) {
  const byProject = new Map(), byWeek = new Map()
  let hours = 0, amount = 0
  for (const [i, r] of records.entries()) {
    const date = toDate(r.date), h = toNumber(r.hours)
    if (!date || Number.isNaN(h) || h < 0) throw new Error(`ligne ${i + 2} : date ou heures illisibles.`)
    if ((from && date < from) || (to && date > to)) continue
    const rate = r.rate === undefined || r.rate === '' ? defaultRate : toNumber(r.rate)
    const value = Number.isNaN(rate) ? 0 : h * rate
    const p = byProject.get(r.project || '(sans projet)') ?? { hours: 0, amount: 0, entries: 0 }
    byProject.set(r.project || '(sans projet)', { hours: round(p.hours + h), amount: round(p.amount + value), entries: p.entries + 1 })
    const w = isoWeek(date)
    byWeek.set(w, round((byWeek.get(w) ?? 0) + h))
    hours = round(hours + h); amount = round(amount + value)
  }
  return { hours, amount, byProject: [...byProject].sort((a, b) => b[1].hours - a[1].hours), byWeek: [...byWeek].sort() }
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2), ['help'])
  usage(`
Usage : node src/timesheet-summary.mjs temps.csv [--rate 25000] [--from 2026-10-01] [--to 2026-10-31]
Colonnes : date, project, hours, rate (facultatif ; sinon --rate), note.`, args, 1)
  let s
  try { s = summarise(parseCsv(readFileSync(args._[0], 'utf8')).records, { from: args.from ? toDate(args.from) : undefined, to: args.to ? toDate(args.to) : undefined, defaultRate: Number(args.rate ?? 0) }) } catch (e) { fail(e.message) }
  console.log('Projet                       Heures    À facturer')
  s.byProject.forEach(([p, v]) => console.log(`${p.padEnd(28)} ${String(v.hours).padStart(6)}  ${money(v.amount).padStart(12)}`))
  console.log(`${'TOTAL'.padEnd(28)} ${String(s.hours).padStart(6)}  ${money(s.amount).padStart(12)}`)
  console.log('\nPar semaine :'); s.byWeek.forEach(([w, h]) => console.log(`  ${w}  ${h} h`))
}
