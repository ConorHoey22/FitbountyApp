# Weight Tracker (Web)

A simple client-side weight tracker. Log weights in kg or lbs, see weekly averages, and visualize them on a chart. Data is stored locally in your browser (localStorage).

## How to run

- Open `index.html` in a browser (Chrome/Edge/Firefox/Safari).
- No server or build step is required.

## Features

- Add daily entries with date, weight, and unit (kg or lbs)
- Stores data in localStorage
- Computes weekly averages (ISO week starting Monday)
- Line chart of weekly averages (Chart.js)
- Toggle display unit (kg/lbs) for entries and chart
- Delete individual entries or clear all

## Usage

1. Open the page and pick a date (defaults to today).
2. Enter your weight and select the unit (kg or lbs).
3. Click Add. The entry will be saved; your weekly averages and chart will update.
4. Use the Display unit selector to switch how values are shown.
5. Use Delete to remove a single entry or Clear All to remove all.

## Notes

- Internally, values are stored in kilograms for accuracy; conversions are applied on display.
- Weekly averages are grouped by ISO week (e.g., 2025-W03).
