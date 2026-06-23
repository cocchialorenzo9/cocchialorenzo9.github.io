import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';

const PACES = [
  { label: "Race Goal", pace: "4:16/km", color: "#e05c5c", desc: "Sub-3h marathon" },
  { label: "Marathon Pace (MP)", pace: "4:10–4:20/km", color: "#E8A838", desc: "Core of the plan" },
  { label: "Tempo run", pace: "4:30–4:40/km", color: "#7B68EE", desc: "Controlled effort" },
  { label: "Easy run", pace: "5:00–5:20/km", color: "#4CAF93", desc: "Can hold a conversation" },
  { label: "Long run", pace: "5:00–5:20/km", color: "#4CAF93", desc: "Never push hard" },
];

const PHASES = [
  {
    id: "base",
    name: "Base Phase",
    weeks: "1–4",
    dates: "Jul 5 – Aug 1",
    color: "#4CAF93",
    bg: "#f0faf6",
    border: "#b2ddd1",
    description: "Build aerobic endurance and routine. Start touching marathon pace in a controlled way. Monday swim class is still active — use it as your weekly warm-up.",
    nutrition: {
      points: [
        "Carbs: 55–60% of daily calories (pasta, rice, whole-grain bread, oats)",
        "Protein: 1.4–1.6g/kg of body weight to support muscular adaptation",
        "Hydration: 2–2.5L of water per day — daily cycling makes you sweat more than you realize",
        "Pre-run (1–2h before): banana, toast with jam, energy bar",
        "Post-workout (within 30min): protein + carbs (e.g. Greek yogurt + fruit)",
        "Avoid: excess alcohol, ultra-processed foods, heavy meals the night before a long run",
      ],
    },
  },
  {
    id: "build",
    name: "Build Phase",
    weeks: "5–9",
    dates: "Aug 2 – Sep 6",
    color: "#E8A838",
    bg: "#fdf8ee",
    border: "#f0d89a",
    description: "Increasing volume with more structured quality sessions. Monday swim class ends — real rest days open up. The bike becomes an active recovery tool.",
    nutrition: {
      points: [
        "Carbs: 60–65% — longer runs need more glycogen",
        "Carb load the night before long runs: risotto, pasta, polenta",
        "During long runs (>60min): gel or dates every 40–45 min — train your gut too",
        "Protein: 1.6–1.8g/kg — muscles are under greater stress",
        "Iron & B vitamins: red meat 2x/week, legumes, spinach",
        "Omega-3 to reduce inflammation: salmon, walnuts, flaxseeds 3–4x/week",
      ],
    },
  },
  {
    id: "peak",
    name: "Peak Phase",
    weeks: "10–13",
    dates: "Sep 7 – Oct 4",
    color: "#E05C5C",
    bg: "#fdf1f1",
    border: "#f0b8b8",
    description: "Maximum volume and race simulations. Daily cycling stays but ONLY at easy pace. Consider the U-Bahn on days after long runs or hard interval sessions.",
    nutrition: {
      points: [
        "Carbs: 65–70% — you're at peak load",
        "Test your race strategy during long runs (which gels, at what km, how much water)",
        "Electrolytes after long runs: water + pinch of salt + lemon, or sports drink",
        "Don't try new foods or supplements less than 3 weeks before the race",
        "Magnesium & potassium daily: banana, spinach, almonds to prevent cramps",
        "Sleep: minimum 8h — 70% of adaptation happens overnight",
      ],
    },
  },
  {
    id: "taper",
    name: "Tapering",
    weeks: "14–15",
    dates: "Oct 5 – Oct 11",
    color: "#7B68EE",
    bg: "#f5f3ff",
    border: "#ccc6f8",
    description: "Total volume reduction. Daily cycling is fine but at a relaxed pace. In race week consider cutting or skipping the bike Thursday–Saturday.",
    nutrition: {
      points: [
        "Day –3: start carbo-loading (pasta, rice, bread) — 8–10g of carbs/kg",
        "Day –1: light but carb-rich dinner, nothing new",
        "Race morning: breakfast 2–3h before — porridge or toast with honey, banana + coffee",
        "During the marathon: gel every 5–6km from km 15. Start at 4:20/km, hold to km 35, then give everything",
        "Post-race: protein + carbs within 30min, then celebrate!",
        "Avoid: alcohol, fatty foods, excess fiber in the 2 days before the race",
      ],
    },
  },
];

const WEEKS = [
  {
    week: 1, phase: "base", label: "Jul 5–11",
    sessions: [
      { day: "Mon 7", type: "swim", title: "🏊 Swim class", detail: "Swim class as scheduled — counts as aerobic cross-training. Don't add a run today." },
      { day: "Tue 8", type: "easy", title: "Adaptation run", detail: "30 min at easy pace (5:10–5:20/km) — calibrate how you feel, first session of the plan" },
      { day: "Thu 10", type: "easy", title: "Easy run + strides", detail: "35 min easy + 4×80m progressive accelerations at the end (not sprints, just smooth pick-ups)" },
      { day: "Sat 12", type: "long", title: "Long run", detail: "45 min continuous, easy pace (5:10–5:20/km) — ~8 km" },
    ],
    bikeNote: "Bike every day is fine — but 14km/day (7km each way) is already real aerobic load, treat it as extra zone 1. The day after the long run (Sun) take the U-Bahn if your legs are heavy.",
    swimNote: "Monday: active swim class. Use it as your weekly warm-up — improves shoulder mobility and breathing.",
    tip: "Week 1 with Monday swim: your first run shifts to Tuesday. You have 4 total sessions — that's the maximum load for this phase.",
  },
  {
    week: 2, phase: "base", label: "Jul 12–18",
    sessions: [
      { day: "Mon 14", type: "swim", title: "🏊 Swim class", detail: "Swim class — aerobic pace, technique focus. Don't push: it's active recovery from last week." },
      { day: "Tue 15", type: "easy", title: "Easy run", detail: "35 min at aerobic pace (5:00–5:15/km)" },
      { day: "Thu 17", type: "tempo", title: "First contact with MP", detail: "40 min: 10' wu + 3×5' at marathon pace (4:15–4:20/km) + 90'' walking rec + 10' cd" },
      { day: "Sat 19", type: "long", title: "Long run", detail: "55 min continuous, easy pace (~9–10 km)" },
    ],
    bikeNote: "Thursday (intervals): ride to the office as usual, but EASY. Don't warm up your legs before the intervals — save energy for the session.",
    swimNote: "Monday swim: perfect as active recovery after Saturday's long run. Do laps at moderate pace, no sprinting.",
    tip: "Marathon pace (4:15–4:20/km) should feel challenging but manageable. If you're gasping, slow down — fitness comes from consistency.",
  },
  {
    week: 3, phase: "base", label: "Jul 19–25",
    sessions: [
      { day: "Mon 21", type: "swim", title: "🏊 Swim class", detail: "Swim class — last or second-to-last week. Enjoy the technical work." },
      { day: "Tue 22", type: "easy", title: "Easy run", detail: "35 min (5:00–5:15/km)" },
      { day: "Thu 24", type: "tempo", title: "1km repeats", detail: "45 min: 10' wu + 4×1km at 4:20/km + 90'' rec + 10' cd — first real quality session" },
      { day: "Sat 26", type: "long", title: "Long run", detail: "60 min (~11 km), easy pace" },
    ],
    bikeNote: "Thursday morning: easy bike to the office. Evening after intervals: bike home is fine, helps active leg recovery.",
    swimNote: "Monday swim: Thursday's intervals may leave your legs heavy. The water loosens them up — easy crawl.",
    tip: "1km repeats build muscular memory at marathon pace. Take the full recovery: it's not weakness, it's correctness.",
  },
  {
    week: 4, phase: "base", label: "Jul 26 – Aug 1",
    sessions: [
      { day: "Mon 28", type: "swim", title: "🏊 Swim class (last?)", detail: "Probably the last week of the class — enjoy it and consider signing up for open swim." },
      { day: "Tue 29", type: "easy", title: "Recovery run", detail: "25 min very slow (5:20–5:30/km) — recovery week" },
      { day: "Thu 31", type: "easy", title: "Easy run + strides", detail: "30 min + 4×80m accelerations" },
      { day: "Sat 2", type: "long", title: "Reduced long run", detail: "45 min — let the body absorb the last 3 weeks of load" },
    ],
    bikeNote: "Recovery week: daily bike is fine, actually helpful. But no efforts on the bike — no hills, no fast pace. Take the U-Bahn if it rains.",
    swimNote: "Swim class ends. From August switch to open swim 1x/week — ideally Wednesday (see next phase).",
    tip: "Recovery week: never skip it. The body adapts during rest. Higdon calls it the 'invisible' week — the most important one.",
  },
  {
    week: 5, phase: "build", label: "Aug 2–8",
    sessions: [
      { day: "Tue 5", type: "easy", title: "Easy run", detail: "38 min (5:00–5:10/km) — Monday is now full rest" },
      { day: "Wed 6", type: "swim", title: "🏊 Open swim", detail: "30–35 min in the pool, aerobic pace. Continuous crawl with focus on breathing. No interval training." },
      { day: "Sat 9", type: "long", title: "Long run with MP", detail: "70 min: first 50 at easy pace, last 15 at 4:20/km (~13–14 km total)" },
    ],
    bikeNote: "From this week Monday = rest. Bike all other days is fine. Friday evening (before long run): easy bike, or U-Bahn if your legs are tired.",
    swimNote: "Swim moved to Wednesday — between Tuesday's run and Saturday's long run. Perfect: active recovery mid-week. 30–35 min of moderate crawl, no sprints. Note: if today you bike to work (14km) + bike to pool (11km) = 25km total — drink and eat well, and keep it in mind for Thursday.",
    tip: "Swim class is over — now you manage Wednesday at the pool yourself. Goal: active recovery and aerobic capacity, not performance in the water.",
  },
  {
    week: 6, phase: "build", label: "Aug 9–15",
    sessions: [
      { day: "Tue 11", type: "easy", title: "Easy run", detail: "40 min" },
      { day: "Wed 13", type: "swim", title: "🏊 Open swim", detail: "35 min, aerobic crawl. You can add 4×50m slightly faster at the end if you feel good." },
      { day: "Thu 14", type: "tempo", title: "1.5km repeats", detail: "55 min: 10' wu + 4×1.5km at 4:20/km + 2' walking rec + cd" },
      { day: "Sat 16", type: "long", title: "Long run", detail: "80 min (~15 km), easy pace (5:00–5:15/km)" },
    ],
    bikeNote: "Thursday: bike TO work (7km, fresh legs), U-Bahn BACK after intervals — 14km extra on post-session legs is too much. Friday: bike fine, but don't push.",
    swimNote: "Wednesday in the pool: between Tuesday's run and Thursday's intervals. The ideal time for water — recover from Tuesday and prepare legs for Thursday. If today you do 25km on the bike (work + pool), bike there and U-Bahn back from work — fresh legs needed for the intervals.",
    tip: "15 km long run: bring gels or dates. Your gut needs training just as much as your legs — testing race nutrition in training is part of the plan.",
  },
  {
    week: 7, phase: "build", label: "Aug 16–22",
    sessions: [
      { day: "Tue 18", type: "easy", title: "Easy run", detail: "40 min" },
      { day: "Wed 20", type: "swim", title: "🏊 Open swim", detail: "35 min aerobic. Try 200m crawl / 1' rest × 4–5 sets — builds endurance with no leg impact." },
      { day: "Thu 21", type: "tempo", title: "MP progression", detail: "55 min: 15' wu + 20' at 4:30/km then 10' at 4:15/km (real MP) + cd" },
      { day: "Sat 23", type: "long", title: "Long run", detail: "90 min (~17 km), easy pace" },
    ],
    bikeNote: "17 km long run = legs engaged. Sunday after: U-Bahn or VERY slow bike. Monday return to normal cycling.",
    swimNote: "Wednesday: legs recovering from Tuesday, preparing for Thursday. Swimming is the perfect tool — no impact, heart working. With 25km on the bike (work + pool), this is your aerobically heaviest day of the week — manage it consciously.",
    tip: "The progression teaches your body to accelerate when already tired — exactly what happens at km 30 of a marathon.",
  },
  {
    week: 8, phase: "build", label: "Aug 23–29",
    sessions: [
      { day: "Tue 25", type: "easy", title: "Recovery run", detail: "30 min very slow — mid-block recovery" },
      { day: "Wed 27", type: "swim", title: "🏊 Swim (optional)", detail: "Recovery week: 25 min of light swimming is fine, or skip if the body feels tired. Nothing forced." },
      { day: "Thu 28", type: "easy", title: "Easy run + strides", detail: "35 min + 5×80m progressive" },
      { day: "Sat 30", type: "long", title: "Reduced long run", detail: "60 min — active recovery" },
    ],
    bikeNote: "Recovery week: daily bike is fine and beneficial. Helps move the legs without stressing them. No restrictions.",
    swimNote: "Optional swim this week. If you're tired, skip it — rest is worth more than a pool session. Recovery week: if you do go, take the U-Bahn to work that day (save your legs).",
    tip: "Second recovery week. Don't add km to compensate. The last 3 weeks have packed adaptation into your legs — let it consolidate.",
  },
  {
    week: 9, phase: "build", label: "Aug 30 – Sep 5",
    sessions: [
      { day: "Tue 1", type: "easy", title: "Easy run", detail: "42 min" },
      { day: "Wed 3", type: "swim", title: "🏊 Open swim", detail: "35–40 min. This week add 6×50m fast at the end — simulates the effort you'll do in Thursday's intervals." },
      { day: "Thu 4", type: "tempo", title: "2km repeats", detail: "60 min: 10' wu + 3×2km at 4:15–4:20/km + 2'30'' rec + cd — race section simulation" },
      { day: "Sat 6", type: "long", title: "Long run with MP finish", detail: "100 min: first 60 easy, last 30 at 4:20/km — first 'quality long run'" },
    ],
    bikeNote: "Thursday: hardest session of the block. Bike TO work (easy), U-Bahn BACK after intervals — don't add 7km on already-stressed muscles. Friday: U-Bahn — save legs for the 100 min long run.",
    swimNote: "Wednesday in the pool before Thursday's hard intervals. Don't fatigue yourself — it's preparation, not training. With 25km on the bike Wednesday (work + pool), take the U-Bahn Thursday morning — fresh legs for the 3×2km.",
    tip: "The long run with 30 min at MP is the key session for sub-3h. You learn to run fast when already tired — exactly km 30–42.",
  },
  {
    week: 10, phase: "peak", label: "Sep 6–12",
    sessions: [
      { day: "Tue 8", type: "easy", title: "Easy run", detail: "45 min" },
      { day: "Wed 10", type: "swim", title: "🏊 Swim — active recovery", detail: "35 min aerobic crawl. Peak phase: swimming is now primarily recovery, not additional training." },
      { day: "Thu 11", type: "tempo", title: "Long tempo run", detail: "65 min: 10' wu + 40' at 4:20–4:25/km + cd" },
      { day: "Sat 13", type: "long", title: "Long run", detail: "110 min (~20–21 km), easy pace" },
    ],
    bikeNote: "Peak phase: daily bike fine but ONLY easy pace. Thursday morning: U-Bahn or very easy bike — legs are needed for the intervals. Sunday post-long run: U-Bahn strongly recommended.",
    swimNote: "Wednesday: swimming as active recovery between Tuesday and Thursday. 35 min max, nothing fast. Goal: loosen legs, don't add fatigue. Peak Phase: 25km on the bike (work + pool) is too much before Thursday's intervals — choose one trip by bike, U-Bahn for the other.",
    tip: "Peak phase: if you feel unusual pain, don't ignore it. One rest day now is worth 2 weeks of downtime later. Sub-3h is built by staying healthy.",
  },
  {
    week: 11, phase: "peak", label: "Sep 13–19",
    sessions: [
      { day: "Tue 15", type: "easy", title: "Easy run", detail: "45 min" },
      { day: "Wed 17", type: "swim", title: "🏊 Swim — active recovery", detail: "30–35 min light swim. Legs heavy from Tuesday? Water is your best friend today." },
      { day: "Thu 18", type: "tempo", title: "3km repeats", detail: "65 min: 10' wu + 3×3km at 4:15/km + 3' rec + cd — hardest session of the plan" },
      { day: "Sat 20", type: "long", title: "Peak long run", detail: "120 min (~22–23 km) with last 20 min at 4:20/km — your longest run ever" },
    ],
    bikeNote: "Hardest week of the plan. Thursday: U-Bahn BOTH ways — the 3×3km needs completely fresh legs, no bike today. Sunday post-22km: U-Bahn. Monday: easy bike to loosen up.",
    swimNote: "Wednesday between the hardest sessions. LIGHT swim — 30 min max, easy crawl. No extra efforts in the water this week. Hardest week of the plan: take the U-Bahn for work Wednesday and bike only to the pool (or vice versa) — don't do 25km today.",
    tip: "22–23 km is your training maximum. You don't need more: the marathon is completed through 15 weeks of work, not one single session.",
  },
  {
    week: 12, phase: "peak", label: "Sep 20–26",
    sessions: [
      { day: "Tue 22", type: "easy", title: "Recovery run", detail: "35 min very slow — mandatory unload after peak week" },
      { day: "Wed 24", type: "swim", title: "🏊 Swim — unload", detail: "30 min relaxed swimming. Backstroke, floating, whatever feels good. Pure recovery." },
      { day: "Thu 25", type: "easy", title: "Easy run", detail: "35 min, free pace without watching the watch" },
      { day: "Sat 27", type: "long", title: "Reduced long run", detail: "70 min — recovery from peak" },
    ],
    bikeNote: "Post-peak recovery week: daily bike is fine and very beneficial. Helps keep circulation going and loosen legs after the 22 km.",
    swimNote: "Wednesday: swimming as therapy. You can spend just 20 min in the water. The goal is to come out feeling lighter than when you went in. Post-peak recovery week: 25km on the bike today is ok — running load is reduced.",
    tip: "Third recovery week. The body is consolidating the 22 km and 3km repeats. You may feel 'out of shape' — it's a feeling, not reality.",
  },
  {
    week: 13, phase: "peak", label: "Sep 27 – Oct 3",
    sessions: [
      { day: "Tue 29", type: "easy", title: "Easy run", detail: "40 min" },
      { day: "Wed 1", type: "swim", title: "🏊 Swim — last serious session", detail: "35 min. Last time swimming counts as training. After this, recovery only." },
      { day: "Thu 2", type: "tempo", title: "Final race simulation", detail: "55 min: 10' wu + 3×10' at 4:16/km (EXACT sub-3h pace) + cd — last hard session" },
      { day: "Sat 4", type: "long", title: "Moderate long run", detail: "90 min (~17 km) at easy pace — last real long run" },
    ],
    bikeNote: "Thursday (3×10' at 4:16/km): U-Bahn BOTH ways — this is the definitive proof you can run sub-3h, legs fresh at 100%. Friday: bike fine (7km one way). Saturday before long run: U-Bahn.",
    swimNote: "Wednesday: last 'serious' swim session. From here on, swim only if you feel like it — taper starts in a few days. Thursday you have 3×10' at 4:16/km: don't do 25km on the bike Wednesday — U-Bahn to work, bike only to pool (11km).",
    tip: "The 3×10' at exactly 4:16/km give you definitive proof: you have the fitness for sub-3h. From here, protect the work you've done.",
  },
  {
    week: 14, phase: "taper", label: "Oct 4–10",
    sessions: [
      { day: "Tue 7", type: "easy", title: "Easy run", detail: "30 min, free pace — enjoy the lightness" },
      { day: "Wed 8", type: "swim", title: "🏊 Swim (optional)", detail: "20–25 min light swim if you feel good. If you're tired, skip without guilt." },
      { day: "Thu 9", type: "tempo", title: "Last quality session", detail: "35 min: 10' wu + 3×1km at 4:16/km + 90'' rec + cd — short but at race pace" },
      { day: "Sat 11", type: "easy", title: "Pre-race jog", detail: "15 min very easy — move the legs, don't tire them" },
    ],
    bikeNote: "Tapering: easy bike fine Monday–Wednesday. Thursday (quality session): U-Bahn in the morning. Friday–Saturday: U-Bahn or walk — legs to preserve for Sunday.",
    swimNote: "Wednesday swim optional — only if you feel good and not tired. 20 min of easy arm work is enough. Don't add water kilometers.",
    tip: "Tapering: legs feel heavy or strange? That's normal — the body is 'loading up'. Eat well, sleep a lot, avoid standing for long periods.",
  },
  {
    week: 15, phase: "taper", label: "Oct 11 — RACE",
    sessions: [
      { day: "Sun Oct 11", type: "race", title: "🏅 MUNICH MARATHON — SUB 3H", detail: "Start at 4:20/km for the first 5 km (even if it feels slow). Hold 4:16 to km 35. Then give everything. No bike, no pool today — just run." },
    ],
    bikeNote: "Saturday before race: U-Bahn or taxi. No bike. Sunday post-race: whatever gets you home — just don't run.",
    swimNote: "No pool from Thursday onwards. Final recovery is rest, carbo-loading, and sleep only.",
    tip: "Sub-3h strategy: do NOT start fast. Runners who finish sub-3h run the second half faster than the first. Control the ego at km 1–10.",
  },
];

const typeStyle = {
  easy: { label: "Easy", bg: "#e8f5e9", color: "#2e7d32", dot: "#4caf50" },
  tempo: { label: "Quality", bg: "#fff3e0", color: "#e65100", dot: "#ff9800" },
  long: { label: "Long Run", bg: "#e3f2fd", color: "#1565c0", dot: "#2196f3" },
  race: { label: "RACE", bg: "#f3e5f5", color: "#6a1b9a", dot: "#9c27b0" },
  swim: { label: "Swim", bg: "#e0f7fa", color: "#00695c", dot: "#00bcd4" },
};

const phaseMap = Object.fromEntries(PHASES.map((p) => [p.id, p]));

const RESOURCES = [
  {
    category: "📋 Training Plans",
    items: [
      { name: "Hal Higdon — Novice 1 (free)", url: "https://www.halhigdon.com/training-programs/marathon-training/novice-1-marathon/", desc: "The most widely used plan for first-time marathoners. Free downloadable PDF. Gold-standard reference cited across r/firstmarathon." },
      { name: "Hal Higdon — Marathon 3 (3 days/week)", url: "https://www.halhigdon.com/training-programs/marathon-training/marathon-3/", desc: "The Higdon plan designed for 3 runs per week. Includes structured cross-training — the inspiration behind this plan." },
      { name: "Marathon Handbook — Guide & Training", url: "https://marathonhandbook.com/", desc: "Free guides, daily newsletter. Great for nutrition, shoes, and cross-training. Read by 320k+ runners." },
    ],
  },
  {
    category: "💬 Reddit Community",
    items: [
      { name: "r/running", url: "https://www.reddit.com/r/running/", desc: "The main subreddit. Wiki with beginner resources, discussions on training plans, injuries, and gear." },
      { name: "r/firstmarathon", url: "https://www.reddit.com/r/firstmarathon/", desc: "Specific to first-time marathoners. Very supportive community." },
      { name: "r/runningshoegeeks", url: "https://www.reddit.com/r/runningshoegeeks/", desc: "Shoe discussions with no sponsors or ads. Real reviews from real runners." },
    ],
  },
  {
    category: "👟 Shoes — Buying Guide",
    items: [
      { name: "iRunFar — Best Marathon Shoes 2026", url: "https://www.irunfar.com/best-marathon-shoes", desc: "For beginners: ASICS Superblast 3 (top pick — cushioning + versatility in one shoe). Alternative: Adidas Adizero EVO SL." },
      { name: "The Run Testers — Best Shoes 2026", url: "https://theruntesters.com/the-best-marathon-running-shoes/", desc: "For beginners: ASICS Novablast 5 (value). For maximum comfort: Nike Vomero Plus." },
      { name: "r/runningshoegeeks", url: "https://www.reddit.com/r/runningshoegeeks/", desc: "Before buying, post your gait/pronation and budget. The community responds within hours." },
      { name: "laufshop.de — Best German online running store", url: "https://www.laufshop.de/", desc: "Germany's largest running-specific online retailer. Wide selection, 30-day returns, reliable sizing. Best first stop after your Laufanalyse if the in-store price is high." },
      { name: "SportScheck — Online + Munich store", url: "https://www.sportscheck.com/", desc: "Large sports chain with an online store and Munich locations. Easy 30-day returns in-store or by post. Good for price-comparing before buying." },
    ],
  },
  {
    category: "⌚ GPS Watches — Buying Guide",
    items: [
      { name: "Coros Pace 3 — Best value (~€200)", url: "https://www.coros.com/", desc: "r/running's favorite for price-to-performance. Extremely accurate GPS, 38h battery in continuous GPS mode, weighs 39g — you barely feel it. No subscription required. Has full triathlon mode + open-water swim GPS — already future-proof if you move into tri." },
      { name: "Garmin Forerunner 165 — Entry Garmin (~€250)", url: "https://www.garmin.com/", desc: "The entry point into the Garmin ecosystem. All essential features: GPS, HR, heart rate zones, VO2Max, intervals. Has basic multisport mode — check tri features against your goals before committing. More than enough for a first marathon." },
      { name: "Garmin Forerunner 265 — Recommended (~€350)", url: "https://www.garmin.com/", desc: "Garmin's best-seller for serious runners. AMOLED display, HRV status (tells you each morning how recovered you are), Training Readiness score, Body Battery. Full triathlon mode with open-water swim GPS and transition support — covers sprint to 70.3 Ironman." },
      { name: "Garmin Forerunner 955 — Dedicated tri watch (~€500)", url: "https://www.garmin.com/", desc: "The Garmin built specifically for triathlon. Full Ironman support, ClimbPro for cycling, PacePro for running, Training Readiness, ~20h GPS battery. Overkill for a first marathon — but worth knowing it exists. Buy the FR265 first; consider upgrading when you sign up for your first 70.3." },
      { name: "DC Rainmaker — Independent GPS Reviews", url: "https://www.dcrainmaker.com/", desc: "The absolute reference site for GPS sports watch reviews. Every watch gets an 8,000+ word review with real GPS testing and HR comparisons. Search 'best triathlon GPS watch' for tri-specific content covering sprint to full Ironman." },
      { name: "r/Garmin — Community & advice", url: "https://www.reddit.com/r/Garmin/", desc: "Large Garmin users community (~180k members). Best place for watch-specific questions: feature setup, firmware updates, training metrics explained. Much more specific than r/running for watch topics." },
      { name: "r/COROS — Community & advice", url: "https://www.reddit.com/r/COROS/", desc: "Coros users community. Smaller but focused — firmware updates, triathlon mode setup, open water swim tips. Useful if you go with the Pace 3." },
    ],
  },
  {
    category: "🏊🚴🏃 Triathlon & Ironman",
    items: [
      { name: "r/triathlon — Main community", url: "https://www.reddit.com/r/triathlon/", desc: "The main triathlon subreddit. Beginner-friendly wiki, gear advice, training plans, race reports. Great place to ask 'I come from running, how do I start tri?'" },
      { name: "r/IronmanTriathlon — Ironman-specific", url: "https://www.reddit.com/r/IronmanTriathlon/", desc: "Focused on full and 70.3 Ironman distances. Race reports, long-course nutrition, bike setup, and taper advice. Read before committing to a registration." },
      { name: "r/Swimming — technique & open water", url: "https://www.reddit.com/r/Swimming/", desc: "Pool and open water swimming community. Your weekly swim sessions are a head start — this community helps you build efficiency before you need it for a tri." },
      { name: "DC Rainmaker — Best triathlon GPS watches", url: "https://www.dcrainmaker.com/", desc: "Search 'best triathlon GPS watch' on this site for dedicated tri content with real test data, covering sprint-distance up to full Ironman watches." },
    ],
  },
];

const WATCH_TIPS = [
  "Essential features for this plan: real-time GPS pace, interval timer (for repeats), HR monitor, at least 10–12h GPS battery (for the full race).",
  "Coros Pace 3 (~€200): best price-to-performance, outstanding battery, precise GPS. Great if you want serious data without paying the Garmin premium.",
  "Garmin Forerunner 265 (~€350): recommended if you want Training Readiness (tells you 0–100 each morning how ready you are to train hard — very useful with daily cycling).",
  "You don't need the watch before week 1: buy it by end of June so you have July to learn the features. First 2 weeks use it only for pace — then add HR and intervals.",
  "Apple Watch works (with Strava or Garmin Connect), but the battery doesn't last 3h GPS in continuous workout mode — borderline for the marathon.",
  "Thinking about triathlon? Both the Coros Pace 3 and Garmin FR265 already support tri mode (swim → bike → run auto-transitions, open water GPS). The Coros Pace 3's 38h battery also covers a full Ironman. No need to buy a separate watch later.",
];

const SHOE_TIPS = [
  "First step: free gait analysis at a store in Munich. They analyze your running on a treadmill — filters out half the choices.",
  "Budget guide: €130–180 for a training shoe. Avoid carbon plate shoes — they add no value during a beginner's prep.",
  "Buy them in July, break them in over the first 3–4 weeks. In September consider a second identical pair to keep fresh for race day.",
  "Size: go 0.5–1 size up from your regular shoes. Feet swell during long runs.",
  "Top picks 2026 for beginners: ASICS Superblast 3 (versatile top pick), ASICS Novablast 5 (value), Nike Vomero Plus (maximum comfort).",
];

const typeColors = {
  easy:  { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
  tempo: { bg: "#fff3e0", color: "#e65100", border: "#ffcc80" },
  long:  { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" },
  race:  { bg: "#f3e5f5", color: "#6a1b9a", border: "#ce93d8" },
  swim:  { bg: "#e0f7fa", color: "#00695c", border: "#80deea" },
  rest:  { bg: "#f5f5f5", color: "#616161", border: "#bdbdbd" },
};

function ReadinessBar({ value, label, color }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#666", marginBottom: 3 }}>
        <span>{label}</span><span style={{ fontWeight: 700, color }}>{value ?? "—"}</span>
      </div>
      <div style={{ height: 5, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

export default function MarathonPage() {
  const [activeWeek, setActiveWeek] = useState(null);
  const [activePhase, setActivePhase] = useState(null);
  const [activeRes, setActiveRes] = useState(null);
  const [view, setView] = useState("today");
  const [isMobile, setIsMobile] = useState(false);
  const [coach, setCoach] = useState(null);
  const [coachLoading, setCoachLoading] = useState(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 480);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    fetch('/data/coach.json')
      .then(r => r.json())
      .then(data => { setCoach(data); setCoachLoading(false); })
      .catch(() => setCoachLoading(false));
  }, []);

  const TABS = [
    { id: "today", label: "🤖 Today" },
    { id: "weeks", label: "📅 Plan" },
    { id: "nutrition", label: "🥗 Nutrition" },
    { id: "resources", label: "📚 Resources" },
  ];

  const pad = isMobile ? "10px" : "14px";

  return (
    <Layout title="Munich Marathon Plan — Sub 3h" description="15-week sub-3h marathon training plan for the Munich Marathon 2026, with cycling and swimming cross-training.">
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#f7f8fc", minHeight: "100vh" }}>

        <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)", color: "white", padding: isMobile ? "18px 14px 16px" : "24px 18px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", opacity: 0.5, marginBottom: 5 }}>Training Plan</div>
          <div style={{ fontSize: isMobile ? 19 : 24, fontWeight: 800, letterSpacing: -0.5 }}>Munich Marathon</div>
          <div style={{ fontSize: isMobile ? 11 : 13, opacity: 0.6, marginTop: 3 }}>October 11, 2026 · 15 weeks · 3 sessions/week</div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(224,92,92,0.25)", border: "1.5px solid rgba(224,92,92,0.6)", borderRadius: 20, padding: "5px 14px", marginTop: 12 }}>
            <span style={{ fontSize: 15 }}>🎯</span>
            <span style={{ fontWeight: 800, fontSize: isMobile ? 12 : 14, color: "#ff8a8a" }}>SUB 3 HOURS</span>
            <span style={{ fontSize: 11, opacity: 0.7 }}>→ 4:16/km</span>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: "4px 10px", fontSize: 11 }}>📍 Jul 5, 2026</div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: "4px 10px", fontSize: 11 }}>⏱ 5km in 22min</div>
            <div style={{ background: "rgba(0,188,212,0.2)", borderRadius: 16, padding: "4px 10px", fontSize: 11, color: "#80deea" }}>🏊 Swim Mon (→Jul) then Wed</div>
            <div style={{ background: "rgba(76,175,80,0.2)", borderRadius: 16, padding: "4px 10px", fontSize: 11, color: "#a5d6a7" }}>🚲 Bike 14km/day (7km each way)</div>
            <div style={{ background: "rgba(76,175,80,0.15)", borderRadius: 16, padding: "4px 10px", fontSize: 11, color: "#a5d6a7" }}>🏊🚲 Wed: up to 25km (work + pool)</div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 5, overflowX: "auto", paddingBottom: 2 }}>
            {PACES.map((p, i) => (
              <div key={i} style={{ flexShrink: 0, background: "rgba(255,255,255,0.07)", borderRadius: 7, padding: "5px 9px", textAlign: "left", minWidth: isMobile ? 82 : 100 }}>
                <div style={{ fontSize: 9, opacity: 0.55, marginBottom: 1 }}>{p.label}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: p.color }}>{p.pace}</div>
                <div style={{ fontSize: 9, opacity: 0.45 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#fffbf0", borderBottom: "1px solid #f0e0a0", padding: "10px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b8860b", marginBottom: 5 }}>🚲🏊 Personalized cross-training rules</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { icon: "🏊", text: "Jul: swim MON (class) → run moved to TUE", color: "#00695c" },
              { icon: "🏊", text: "Aug–Oct: open swim WED (active recovery)", color: "#00695c" },
              { icon: "🚲", text: "14km/day = real load (zone 1) — EASY on pre-quality days", color: "#2e7d32" },
              { icon: "🚇", text: "U-Bahn: before long run, after hard intervals, one leg in Peak", color: "#1565c0" },
              { icon: "🏊🚲", text: "Wed: 14km work + 11km pool = 25km — ok in Base, cut to one in Peak", color: "#7B68EE" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "white", borderRadius: 12, padding: "4px 9px", fontSize: isMobile ? 10 : 11, color: r.color, border: "1px solid #f0e0a0" }}>
                <span>{r.icon}</span><span>{r.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", borderBottom: "2px solid #eee", background: "white" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setView(t.id)} style={{
              flex: 1, padding: "12px 4px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: view === t.id ? "white" : "#fafafa",
              color: view === t.id ? "#1a1a2e" : "#999",
              borderBottom: view === t.id ? "3px solid #1a1a2e" : "3px solid transparent",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {view === "today" && (
          <div style={{ padding: pad }}>
            {coachLoading && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#999", fontSize: 13 }}>Loading coaching data…</div>
            )}

            {!coachLoading && !coach && (
              <div style={{ background: "#fff3e0", border: "1.5px solid #ffcc80", borderRadius: 11, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>⚠️</div>
                <div style={{ fontWeight: 700, color: "#e65100", marginBottom: 6 }}>No coaching data yet</div>
                <div style={{ fontSize: 12, color: "#555" }}>Run <code style={{ background: "#fbe9e7", padding: "2px 6px", borderRadius: 4 }}>/update-coach</code> in Claude Code at the end of your training day to generate tomorrow's recommendation.</div>
              </div>
            )}

            {!coachLoading && coach && (() => {
              const rec = coach.recommendation || {};
              const ready = coach.readiness || {};
              const tc = typeColors[rec.type] || typeColors.easy;
              const noData = ready.score == null;
              const readyScore = ready.score ?? 0;
              const readyColor = readyScore >= 70 ? "#22c55e" : readyScore >= 45 ? "#f59e0b" : "#ef4444";
              const hrvDelta = ready.hrv?.delta_pct;
              const hrvColor = hrvDelta == null ? "#999" : hrvDelta >= 0 ? "#22c55e" : hrvDelta >= -15 ? "#f59e0b" : "#ef4444";

              return (
                <>
                  {/* Header card */}
                  <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)", borderRadius: 12, padding: isMobile ? "14px" : "18px", color: "white", marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: 2, opacity: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Tomorrow's coaching</div>
                        <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 800 }}>{rec.title || "—"}</div>
                        <div style={{ fontSize: 10, opacity: 0.5, marginTop: 3 }}>Generated {coach.date} · {coach.daysToRace} days to race · {coach.phase} phase</div>
                      </div>
                      {!noData && (
                        <div style={{ textAlign: "center", background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", flexShrink: 0 }}>
                          <div style={{ fontSize: 26, fontWeight: 900, color: readyColor, lineHeight: 1 }}>{ready.score}</div>
                          <div style={{ fontSize: 9, opacity: 0.6, marginTop: 2 }}>READINESS</div>
                        </div>
                      )}
                    </div>

                    {!noData && (
                      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                        {ready.hrv?.value && (
                          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "5px 10px", fontSize: 11 }}>
                            <span style={{ opacity: 0.5 }}>HRV </span>
                            <span style={{ fontWeight: 700, color: hrvColor }}>{ready.hrv.value}</span>
                            {hrvDelta != null && <span style={{ opacity: 0.5 }}> ({hrvDelta > 0 ? "+" : ""}{hrvDelta}%)</span>}
                          </div>
                        )}
                        {ready.restingHR?.value && (
                          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "5px 10px", fontSize: 11 }}>
                            <span style={{ opacity: 0.5 }}>RHR </span>
                            <span style={{ fontWeight: 700 }}>{ready.restingHR.value}</span>
                          </div>
                        )}
                        {ready.sleep?.hours && (
                          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "5px 10px", fontSize: 11 }}>
                            <span style={{ opacity: 0.5 }}>Sleep </span>
                            <span style={{ fontWeight: 700 }}>{ready.sleep.hours}h</span>
                            {ready.sleep.score && <span style={{ opacity: 0.5 }}> / {ready.sleep.score}</span>}
                          </div>
                        )}
                        {ready.tsb != null && (
                          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "5px 10px", fontSize: 11 }}>
                            <span style={{ opacity: 0.5 }}>TSB </span>
                            <span style={{ fontWeight: 700, color: ready.tsb >= 0 ? "#4ade80" : ready.tsb >= -15 ? "#fbbf24" : "#f87171" }}>{ready.tsb > 0 ? "+" : ""}{Math.round(ready.tsb)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Recommendation card */}
                  <div style={{ border: `1.5px solid ${tc.border}`, background: tc.bg, borderRadius: 11, padding: isMobile ? "12px" : "16px", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ background: tc.color, color: "white", borderRadius: 8, padding: "3px 9px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{rec.type || "—"}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#333", lineHeight: 1.6, marginBottom: 10 }}>{rec.sessionDetail}</div>
                    {rec.reasoning && (
                      <div style={{ background: "rgba(0,0,0,0.04)", borderRadius: 8, padding: "10px 12px", borderLeft: `3px solid ${tc.color}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: tc.color, marginBottom: 4 }}>WHY</div>
                        <div style={{ fontSize: 12, color: "#444", lineHeight: 1.5 }}>{rec.reasoning}</div>
                      </div>
                    )}
                  </div>

                  {/* Bike + swim notes */}
                  {rec.bikeNote && (
                    <div style={{ background: "#f0faf2", border: "1.5px solid #b2ddd1", borderRadius: 9, padding: "10px 12px", marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#2e7d32", marginBottom: 3 }}>🚲 Cycling</div>
                      <div style={{ fontSize: 12, color: "#444" }}>{rec.bikeNote}</div>
                    </div>
                  )}
                  {rec.swimNote && (
                    <div style={{ background: "#e0f7fa", border: "1.5px solid #80deea", borderRadius: 9, padding: "10px 12px", marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#00695c", marginBottom: 3 }}>🏊 Swimming</div>
                      <div style={{ fontSize: 12, color: "#444" }}>{rec.swimNote}</div>
                    </div>
                  )}

                  {/* Training load bars */}
                  {(ready.ctl != null || ready.atl != null) && (
                    <div style={{ background: "white", border: "1.5px solid #e0e0e0", borderRadius: 9, padding: "12px 14px", marginTop: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a2e", marginBottom: 10 }}>Training Load</div>
                      <ReadinessBar value={Math.round(ready.ctl)} label="CTL — Fitness (42-day)" color="#3b82f6" />
                      <ReadinessBar value={Math.round(ready.atl)} label="ATL — Fatigue (7-day)" color="#f59e0b" />
                    </div>
                  )}

                  <div style={{ marginTop: 12, fontSize: 10, color: "#bbb", textAlign: "center" }}>
                    Run <code>/update-coach</code> in Claude Code to refresh
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {view === "weeks" && (
          <div style={{ padding: pad }}>
            <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
              {PHASES.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 4, background: p.bg, border: `1px solid ${p.border}`, borderRadius: 16, padding: "3px 9px", fontSize: 10, fontWeight: 600, color: p.color }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, display: "inline-block" }} />
                  {p.name}
                </div>
              ))}
            </div>

            {WEEKS.map((w) => {
              const phase = phaseMap[w.phase];
              const isOpen = activeWeek === w.week;
              return (
                <div key={w.week} style={{ marginBottom: 8 }}>
                  <button onClick={() => setActiveWeek(isOpen ? null : w.week)} style={{
                    width: "100%", textAlign: "left", border: `1.5px solid ${isOpen ? phase.color : phase.border}`,
                    borderRadius: isOpen ? "12px 12px 0 0" : 12, background: isOpen ? phase.bg : "white",
                    padding: "11px 13px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: phase.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                      {w.week === 15 ? "🏅" : w.week}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>
                        Wk. {w.week} <span style={{ fontWeight: 400, color: "#888", fontSize: 11 }}>· {w.label}</span>
                      </div>
                      <div style={{ fontSize: 10, color: phase.color, fontWeight: 600 }}>{phase.name}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#bbb", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</div>
                  </button>

                  {isOpen && (
                    <div style={{ border: `1.5px solid ${phase.color}`, borderTop: "none", borderRadius: "0 0 12px 12px", background: "white", padding: "13px" }}>
                      {w.sessions.map((s, i) => {
                        const t = typeStyle[s.type];
                        return (
                          <div key={i} style={{ display: "flex", gap: 9, marginBottom: i < w.sessions.length - 1 ? 11 : 0, alignItems: "flex-start" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.dot, flexShrink: 0, marginTop: 5 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>{s.day}</span>
                                <span style={{ background: t.bg, color: t.color, borderRadius: 8, padding: "2px 7px", fontSize: 10, fontWeight: 700 }}>{t.label}</span>
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#222", marginTop: 1 }}>{s.title}</div>
                              <div style={{ fontSize: 11, color: "#666", marginTop: 1, lineHeight: 1.4 }}>{s.detail}</div>
                            </div>
                          </div>
                        );
                      })}

                      <div style={{ marginTop: 11, background: "#f8f9fa", borderRadius: 7, padding: "8px 10px", borderLeft: `3px solid ${phase.color}` }}>
                        <span style={{ fontSize: 11, color: "#555" }}>💡 {w.tip}</span>
                      </div>
                      <div style={{ marginTop: 7, background: "#f0faf2", borderRadius: 7, padding: "8px 10px", borderLeft: "3px solid #4CAF93" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#2e7d32", marginBottom: 2 }}>🚲 Cycling this week</div>
                        <span style={{ fontSize: 11, color: "#444" }}>{w.bikeNote}</span>
                      </div>
                      <div style={{ marginTop: 7, background: "#e0f7fa", borderRadius: 7, padding: "8px 10px", borderLeft: "3px solid #00bcd4" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#00695c", marginBottom: 2 }}>🏊 Swimming this week</div>
                        <span style={{ fontSize: 11, color: "#444" }}>{w.swimNote}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {view === "nutrition" && (
          <div style={{ padding: pad }}>
            <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)", borderRadius: 11, padding: "13px", marginBottom: 13, color: "white" }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 5 }}>⚡ Nutrition for sub-3h</div>
              <div style={{ fontSize: 11, opacity: 0.8, lineHeight: 1.5 }}>
                A sub-3h marathon burns ~2,500–2,800 kcal during the race. Strategy: gel every 5–6 km from km 15 (every ~25 min). Train your gut in training — never try anything new on race day. Daily cycling (14km/day) adds ~500 kcal: eat accordingly. Wednesday with pool (25km bike total) → ~800 kcal extra vs a no-bike day.
              </div>
            </div>

            <div style={{ fontSize: 11, color: "#888", marginBottom: 11 }}>Tap a phase for period-specific advice.</div>
            {PHASES.map((p) => {
              const isOpen = activePhase === p.id;
              return (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <button onClick={() => setActivePhase(isOpen ? null : p.id)} style={{
                    width: "100%", textAlign: "left", border: `1.5px solid ${isOpen ? p.color : p.border}`,
                    borderRadius: isOpen ? "11px 11px 0 0" : 11, background: isOpen ? p.bg : "white",
                    padding: "12px 13px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: "#888" }}>Wks. {p.weeks} · {p.dates}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#bbb", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</div>
                  </button>
                  {isOpen && (
                    <div style={{ border: `1.5px solid ${p.color}`, borderTop: "none", borderRadius: "0 0 11px 11px", background: "white", padding: "13px" }}>
                      <div style={{ fontSize: 11, color: "#666", marginBottom: 11, fontStyle: "italic" }}>{p.description}</div>
                      {p.nutrition.points.map((point, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                          <div style={{ width: 19, height: 19, borderRadius: "50%", background: p.bg, border: `1.5px solid ${p.border}`, color: p.color, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <div style={{ fontSize: 12, color: "#333", lineHeight: 1.5, paddingTop: 1 }}>{point}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ background: "#1a1a2e", borderRadius: 11, padding: "14px", marginTop: 7, color: "white" }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 9 }}>🔑 Golden Rules</div>
              {[
                "Don't change nutrition or gear within 2 weeks of the race",
                "Weigh pasta/rice uncooked to calculate grams correctly",
                "Strategic caffeine: coffee or caffeine gels tested in training, used at km 25–30 on race day",
                "Daily bike = 500–600 kcal extra (14km/day): don't undereat on run days. Wednesday with pool = ~800 kcal extra",
                "Alcohol: minimize during Peak weeks. One drink on the weekend is ok in Base/Build",
                "If you're hungry at night, eat — your body in intense training needs constant fuel",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 7, fontSize: 11, opacity: 0.85 }}>
                  <span style={{ color: "#ffd700", flexShrink: 0 }}>→</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "resources" && (
          <div style={{ padding: pad }}>
            <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: 11, padding: "13px", marginBottom: 14, color: "white", border: "1.5px solid rgba(123,104,238,0.4)" }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 7 }}>⌚ Before buying a GPS watch</div>
              {WATCH_TIPS.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, fontSize: 11, opacity: 0.85 }}>
                  <span style={{ color: "#b39ddb", flexShrink: 0 }}>→</span>
                  <span style={{ lineHeight: 1.4 }}>{tip}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)", borderRadius: 11, padding: "13px", marginBottom: 14, color: "white" }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 7 }}>👟 Before buying shoes</div>
              {SHOE_TIPS.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, fontSize: 11, opacity: 0.85 }}>
                  <span style={{ color: "#ffd700", flexShrink: 0 }}>→</span>
                  <span style={{ lineHeight: 1.4 }}>{tip}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "linear-gradient(135deg, #0f3460, #1a1a2e)", borderRadius: 11, padding: "13px", marginBottom: 14, color: "white", border: "1.5px solid rgba(232,168,56,0.4)" }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 7 }}>🏊🚴🏃 If you're thinking about triathlon</div>
              {[
                "Your current setup (running + daily cycling + weekly swimming) is already a triathlon base. Key differences to add: open-water swim, bike-to-run brick sessions, and transitions.",
                "Entry path: Sprint (750m swim / 20km bike / 5km run) → Olympic (1.5km / 40km / 10km) → Half Ironman 70.3 (1.9km / 90km / 21km) → Full Ironman (3.8km / 180km / 42km).",
                "Your watch: both Coros Pace 3 and Garmin FR265 already handle all three disciplines — no extra gear needed to start.",
                "For triathlon, swimming is usually the priority weak point for runners. 3 months of consistent pool work before your first tri makes a big difference.",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, fontSize: 11, opacity: 0.85 }}>
                  <span style={{ color: "#E8A838", flexShrink: 0 }}>→</span>
                  <span style={{ lineHeight: 1.4 }}>{tip}</span>
                </div>
              ))}
            </div>

            {RESOURCES.map((cat, ci) => (
              <div key={ci} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 7 }}>{cat.category}</div>
                {cat.items.map((item, ii) => {
                  const resKey = `${ci}-${ii}`;
                  const isOpen = activeRes === resKey;
                  return (
                    <div key={ii} style={{ marginBottom: 6 }}>
                      <button onClick={() => setActiveRes(isOpen ? null : resKey)} style={{
                        width: "100%", textAlign: "left", border: `1.5px solid ${isOpen ? "#1a1a2e" : "#e0e0e0"}`,
                        borderRadius: isOpen ? "9px 9px 0 0" : 9, background: isOpen ? "#f0f4ff" : "white",
                        padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                      }}>
                        <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#1a1a2e" }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: "#bbb", transform: isOpen ? "rotate(180deg)" : "none" }}>▼</div>
                      </button>
                      {isOpen && (
                        <div style={{ border: "1.5px solid #1a1a2e", borderTop: "none", borderRadius: "0 0 9px 9px", background: "white", padding: "11px 12px" }}>
                          <div style={{ fontSize: 11, color: "#555", lineHeight: 1.5, marginBottom: 9 }}>{item.desc}</div>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
                            display: "inline-flex", alignItems: "center", gap: 4, background: "#1a1a2e", color: "white",
                            borderRadius: 7, padding: "6px 11px", fontSize: 11, fontWeight: 600, textDecoration: "none",
                          }}>
                            Open →
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            <div style={{ background: "#f0faf6", border: "1.5px solid #b2ddd1", borderRadius: 11, padding: "13px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2e7d32", marginBottom: 7 }}>📍 Gait analysis in Munich</div>
              {[
                { name: "Running Point München", addr: "Schillerstraße 6, 80336 München" },
                { name: "ASICS Store München", addr: "Kaufingerstraße 15, 80331 München" },
                { name: "Intersport Running", addr: "Various locations in the city" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 7, marginBottom: 5, fontSize: 11 }}>
                  <span style={{ color: "#4CAF93", flexShrink: 0 }}>📍</span>
                  <div><strong>{s.name}</strong><div style={{ color: "#666", fontSize: 10 }}>{s.addr}</div></div>
                </div>
              ))}
              <div style={{ marginTop: 7, fontSize: 10, color: "#666", fontStyle: "italic" }}>
                Free — bring your current shoes so they can see your wear pattern.
              </div>
            </div>

            <div style={{ background: "#f0faf6", border: "1.5px solid #b2ddd1", borderRadius: 11, padding: "13px", marginTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2e7d32", marginBottom: 7 }}>✅ After your Laufanalyse: what to do next</div>
              {[
                "During the analysis: write down your pronation type (neutral / overpronation / underpronation), the recommended shoe category (neutral / stability / motion control), specific model names, and the size they suggest.",
                "You're not obligated to buy in-store. The analysis is free because they hope you'll buy there — but it's totally normal to take the info and shop online.",
                "If they have your model in stock: try it on to confirm the fit and size. Those 5 minutes are worth it. Then buy wherever is cheapest.",
                "Online is usually 20–40% cheaper. Good German retailers: laufshop.de, SportScheck.de, running24.de, and brand sites (asics.com, nike.com) — which often run sales.",
                "Return policy matters: laufshop.de and SportScheck offer 30-day returns. Some even accept returns on worn shoes — check before ordering.",
                "Before clicking buy: post your pronation type + recommended model on r/runningshoegeeks for a quick second opinion.",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, fontSize: 11 }}>
                  <span style={{ color: "#4CAF93", flexShrink: 0 }}>→</span>
                  <span style={{ color: "#444", lineHeight: 1.4 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: "12px", textAlign: "center", fontSize: 10, color: "#bbb" }}>
          5km in 22min → Sub-3h · Bike 14km/day · Wed: up to 25km (work + pool) · Swim Mon (Jul) then Wed · Plan based on Hal Higdon &amp; r/running
        </div>
      </div>
    </Layout>
  );
}
