Follow these steps exactly, in order. Do not skip steps.

## Step 1 — Fetch today's Garmin data

Run the fetch script:
```
python3 scripts/fetch_garmin.py
```

The script reads `GARMIN_EMAIL` and `GARMIN_PASSWORD` from environment variables. If they are not set, ask the user to set them before continuing (e.g. `export GARMIN_EMAIL=... GARMIN_PASSWORD=...`).

The script prints a JSON object to stdout with today's biometric data. Parse it.

## Step 2 — Load rolling history

Read the file `static/data/coach_history.json`. It is an array of daily entries. Each entry has: `date`, `tss` (Training Stress Score), `distance_km`, `avg_hr`, `hrv`, `resting_hr`, `sleep_hours`, `sleep_score`.

Compute:
- **ATL** (Acute Training Load): exponential weighted average of `tss` over the last 7 days, time constant 7
- **CTL** (Chronic Training Load): exponential weighted average of `tss` over the last 42 days, time constant 42  
- **TSB** = CTL − ATL

If the history file is empty or missing, start ATL=0, CTL=0.

## Step 3 — Identify tomorrow's scheduled session

Read `src/pages/marathon.jsx`. Find the `WEEKS` array. Identify the entry whose `label` date range covers **tomorrow**'s date. Extract the sessions for tomorrow. Also identify the current `phase`.

If tomorrow falls outside all weeks in the plan (before week 1 or after race day), note that.

## Step 4 — Reason and generate the recommendation

Given:
- Today's HRV vs baseline (higher = more recovered, lower = more fatigued)
- Resting HR trend
- Sleep score
- TSB (positive = rested, negative = accumulated fatigue; below -20 is a warning)
- CTL (fitness level)
- Tomorrow's scheduled session

Decide whether tomorrow's session should:
- **Proceed as planned** (readiness is good)
- **Proceed with reduced intensity** (readiness is slightly low: e.g. HRV 10-20% below baseline OR TSB below -15)
- **Swap to easy/recovery** (readiness is poor: HRV >20% below baseline OR TSB below -25 OR sleep score <60)

Write a recommendation with:
- `type`: one of `easy`, `tempo`, `long`, `race`, `swim`, `rest`
- `title`: 5-8 words, direct
- `reasoning`: 2-4 sentences explaining exactly WHY, referencing the specific numbers (e.g. "HRV is 13% below baseline", "TSB is -18")
- `sessionDetail`: the actual workout instructions (copy/adapt from the plan)
- `bikeNote`: advice on the 14km/day commute bike given the session
- `swimNote`: advice on Wednesday pool session if applicable

Be direct. No padding. Reference actual numbers from the data.

## Step 5 — Write the output files

Write `static/data/coach.json` with this exact schema:

```json
{
  "date": "<today's date YYYY-MM-DD>",
  "generatedFor": "<tomorrow's date YYYY-MM-DD>",
  "readiness": {
    "score": <0-100 computed from HRV delta + sleep score + TSB>,
    "hrv": { "value": <int>, "baseline": <int>, "delta_pct": <int, negative means below> },
    "restingHR": { "value": <int>, "trend": "normal|elevated|low" },
    "sleep": { "hours": <float>, "score": <int 0-100> },
    "tsb": <float>,
    "ctl": <float>,
    "atl": <float>
  },
  "recommendation": {
    "type": "<easy|tempo|long|race|swim|rest>",
    "title": "<short title>",
    "reasoning": "<2-4 sentences with numbers>",
    "sessionDetail": "<workout instructions>",
    "bikeNote": "<bike commute advice>",
    "swimNote": "<swim advice or empty string>"
  },
  "phase": "<base|build|peak|taper>",
  "daysToRace": <int>
}
```

Append today's data as a new entry at the end of `static/data/coach_history.json`:
```json
{
  "date": "<today YYYY-MM-DD>",
  "tss": <computed from activity: roughly (duration_min * avg_hr / max_hr) * intensity_factor * 100>,
  "distance_km": <float>,
  "avg_hr": <int or null>,
  "hrv": <int>,
  "resting_hr": <int>,
  "sleep_hours": <float>,
  "sleep_score": <int>
}
```

## Step 6 — Commit and push

Run:
```
git add static/data/coach.json static/data/coach_history.json
git commit -m "chore: coach update $(date +%Y-%m-%d) [skip ci]"
git push
```

Then tell the user:
- What readiness score was computed and why
- What tomorrow's recommendation is
- Whether any plan adjustment was made and why
