## What it's for

Knowing how many hours you spent on each client, and what that is worth to invoice. This script totals a timesheet (CSV) by project and by week, with an hourly rate per line or a default.

## Before you start

- A CSV: `date`, `project`, `hours` (decimal hours: 1.5 = 1 h 30), `rate` (hourly rate, optional), `note`.

## Step by step

1. Log your hours as you go in the CSV (one line per session).
2. Summarise the month:
   ```bash
   node src/timesheet-summary.mjs samples/temps.csv --from 2026-10-01 --to 2026-10-31 --rate 20000
   ```
3. Use the per-project totals to prepare your invoices, and the weekly totals to spot overloaded weeks.

## Reading the output

Hours and amount per project, sorted by hours, then the total and hours per **ISO week** (`2026-S43`, Monday is the first day). Lines without a rate use `--rate`; without `--rate`, they count as 0 to invoice (useful for internal time).

## Automating it

A weekly summary on Fridays, a monthly export for invoicing.

## Pitfalls

- Log time **the same day**: reconstructing from memory almost always underestimates.
- An unreadable date is reported with its line number: the script prefers to stop rather than distort a total.
