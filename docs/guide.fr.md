## À quoi ça sert

Savoir combien d'heures vous avez passées sur chaque client, et ce que cela représente à facturer. Ce script totalise une feuille de temps (CSV) par projet et par semaine, avec un taux horaire par ligne ou par défaut.

## Avant de commencer

- Un CSV : `date`, `project`, `hours` (heures décimales : 1,5 = 1 h 30), `rate` (taux horaire, facultatif), `note`.

## Pas à pas

1. Notez vos heures au fil de l'eau dans le CSV (une ligne par session).
2. Récapitulez le mois :
   ```bash
   node src/timesheet-summary.mjs samples/temps.csv --from 2026-10-01 --to 2026-10-31 --rate 20000
   ```
3. Servez-vous des totaux par projet pour préparer vos factures, et du total par semaine pour repérer les semaines surchargées.

## Lire le résultat

Heures et montant par projet, trié par volume d'heures, puis le total et les heures par **semaine ISO** (`2026-S43`, le lundi est le premier jour). Les lignes sans taux utilisent `--rate` ; sans `--rate`, elles comptent 0 à facturer (utile pour le temps interne).

## L'automatiser

Un récapitulatif hebdomadaire le vendredi, un export mensuel pour la facturation.

## Pièges à éviter

- Notez le temps **le jour même** : reconstituer de mémoire sous-estime presque toujours.
- Une date illisible est signalée avec le numéro de ligne : le script préfère s'arrêter plutôt que de fausser un total.
