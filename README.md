# DayChain

Daily habit streaks - don't break the chain.

**Startup idea:** habits die quietly, one missed day at a time. DayChain makes the streak visible: check in daily, watch the count climb, and get an "at risk" flag when today's check-in is still missing. A 7-day strip makes recent gaps impossible to ignore.

## Use

Open `app.html`. Add habits, check in once per day. Each card shows the current streak (alive through yesterday until you check in), your longest run, total check-ins, and the last seven days. Data persists in localStorage.

## Engine

`engine.js` holds the pure streak logic (consecutive-day runs, alive-through-yesterday semantics, longest-run detection across gaps and month boundaries) and is covered by node tests. The UI is a thin render layer over it.

Part of the hourly app factory - 60+ small tools, one per hour.
