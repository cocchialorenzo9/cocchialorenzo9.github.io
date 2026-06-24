import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COACH_URL = 'https://raw.githubusercontent.com/cocchialorenzo9/vibe-marathon/main/data/coach.json';
const HISTORY_URL = 'https://raw.githubusercontent.com/cocchialorenzo9/vibe-marathon/main/data/chart-data.json';

const typeColors = {
  easy: "#4CAF93",
  tempo: "#E8A838",
  long: "#7B68EE",
  race: "#E05C5C",
  swim: "#4FC3F7",
  rest: "#9E9E9E",
};

const phaseColors = {
  base: "#4CAF93",
  build: "#E8A838",
  peak: "#E05C5C",
  taper: "#7B68EE",
};

function scoreColor(score) {
  if (score == null) return "#9E9E9E";
  if (score >= 70) return "#4CAF93";
  if (score >= 50) return "#E8A838";
  return "#E05C5C";
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div style={{
      flex: "1 1 130px",
      background: "#f8f9fa",
      border: "1.5px solid #e0e0e0",
      borderRadius: 12,
      padding: "14px 16px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 12, color: "#666", fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || "#1a1a2e", lineHeight: 1.2 }}>
        {value ?? "—"}
      </div>
      {sub && <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function groupByWeek(history) {
  const weeks = {};
  for (const entry of history) {
    const d = new Date(entry.date + 'T00:00:00');
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    const key = `W${String(weekNum).padStart(2, '0')}`;
    if (!weeks[key]) weeks[key] = { week: key, distance_km: 0 };
    weeks[key].distance_km = Math.round((weeks[key].distance_km + (entry.distance_km || 0)) * 10) / 10;
  }
  return Object.values(weeks).slice(-12);
}

export default function VibeDashboard() {
  const [coach, setCoach] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(COACH_URL).then(r => r.json()).catch(() => null),
      fetch(HISTORY_URL).then(r => r.json()).catch(() => []),
    ]).then(([coachData, histData]) => {
      setCoach(coachData);
      setHistory(Array.isArray(histData) ? histData : []);
      setLoading(false);
    });
  }, []);

  const readiness = coach?.readiness;
  const rec = coach?.recommendation;
  const recColor = typeColors[rec?.type] || "#9E9E9E";
  const scoreCol = scoreColor(readiness?.score);

  const notStarted = readiness?.score == null && history.length === 0;
  const noHistory = readiness?.score != null && history.length === 0;

  const last90 = history.slice(-90).map(e => ({ ...e, date: e.date?.slice(5) }));
  const weeklyVol = groupByWeek(history);
  const hasCharts = history.length > 0;

  // Derive race date from coach.date + daysToRace
  const raceDate = (() => {
    if (!coach?.date || !coach?.daysToRace) return null;
    const d = new Date(coach.date + 'T00:00:00');
    d.setDate(d.getDate() + coach.daysToRace);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  const px = isMobile ? "12px 14px" : "32px 28px";

  return (
    <Layout title="Vibe Marathon — Dashboard" description="Live marathon preparation dashboard">
      <div style={{ maxWidth: 900, margin: "0 auto", padding: px, fontFamily: "inherit" }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 20 }}>
          <Link to="/projects" style={{ fontSize: 13, color: "#4CAF93", fontWeight: 600, textDecoration: "none" }}>
            ← Projects
          </Link>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: "#1a1a2e", marginBottom: 4 }}>
            🏃 Vibe Marathon
          </h1>
          <p style={{ color: "#666", fontSize: 14, margin: 0 }}>
            Munich Marathon 2026 · live preparation dashboard
          </p>
        </div>

        {loading ? (
          <div style={{ color: "#888", textAlign: "center", padding: 64, fontSize: 15 }}>Loading…</div>
        ) : !coach ? (
          <div style={{ color: "#E05C5C", textAlign: "center", padding: 64 }}>Could not load coach data.</div>
        ) : notStarted ? (
          /* ── Pre-training state ── */
          <div style={{ textAlign: "center", padding: isMobile ? "32px 0" : "56px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🗓️</div>
            <div style={{
              fontSize: isMobile ? 64 : 88,
              fontWeight: 900,
              color: "#1a1a2e",
              lineHeight: 1,
              marginBottom: 8,
            }}>
              {coach.daysToRace}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#555", marginBottom: 4 }}>
              days to race day
            </div>
            {raceDate && (
              <div style={{ fontSize: 13, color: "#999", marginBottom: 32 }}>
                Munich Marathon · {raceDate}
              </div>
            )}
            <div style={{
              display: "inline-block",
              background: "#f8f9fa",
              border: "1.5px solid #e0e0e0",
              borderRadius: 14,
              padding: "20px 28px",
              maxWidth: 420,
              textAlign: "left",
            }}>
              <p style={{ fontSize: 14, color: "#444", margin: "0 0 12px 0", lineHeight: 1.6 }}>
                Training hasn't started yet. This dashboard will come alive once daily coach
                updates begin — showing readiness scores, workout recommendations, and
                training load trends.
              </p>
              <Link
                to="/marathon"
                style={{
                  display: "inline-block",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#4CAF93",
                  textDecoration: "none",
                }}
              >
                View the training plan →
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              <MetricCard label="Days to Race" value={coach.daysToRace} color="#1a1a2e" />
              <MetricCard
                label="Phase"
                value={coach.phase ? coach.phase.charAt(0).toUpperCase() + coach.phase.slice(1) : "—"}
                color={phaseColors[coach.phase] || "#1a1a2e"}
              />
              <MetricCard
                label="Readiness"
                value={readiness?.score ?? "—"}
                sub={readiness?.score != null
                  ? readiness.score >= 70 ? "Good" : readiness.score >= 50 ? "Moderate" : "Low"
                  : "No data yet"}
                color={scoreCol}
              />
            </div>

            {/* Recommendation */}
            {rec && (
              <div style={{
                border: `2px solid ${recColor}`,
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 24,
                background: `${recColor}12`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{
                    background: recColor,
                    color: "white",
                    borderRadius: 8,
                    padding: "3px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    {rec.type}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: isMobile ? 15 : 17, color: "#1a1a2e" }}>
                    {rec.title}
                  </span>
                </div>
                {rec.reasoning && (
                  <p style={{ fontSize: 14, color: "#444", margin: "0 0 10px 0", lineHeight: 1.55 }}>
                    {rec.reasoning}
                  </p>
                )}
                {rec.sessionDetail && (
                  <p style={{
                    fontSize: 13,
                    color: "#555",
                    margin: "0 0 8px 0",
                    borderLeft: `3px solid ${recColor}`,
                    paddingLeft: 12,
                    lineHeight: 1.5,
                  }}>
                    {rec.sessionDetail}
                  </p>
                )}
                {rec.bikeNote && (
                  <p style={{ fontSize: 12, color: "#777", margin: "6px 0 0 0" }}>🚴 {rec.bikeNote}</p>
                )}
                {rec.swimNote && (
                  <p style={{ fontSize: 12, color: "#777", margin: "4px 0 0 0" }}>🏊 {rec.swimNote}</p>
                )}
              </div>
            )}

            {/* Key metrics */}
            {readiness && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
                <MetricCard
                  label="HRV"
                  value={readiness.hrv?.value ?? "—"}
                  sub={readiness.hrv?.delta_pct != null
                    ? `${readiness.hrv.delta_pct > 0 ? "+" : ""}${readiness.hrv.delta_pct}% vs baseline`
                    : null}
                  color={
                    readiness.hrv?.delta_pct == null ? "#9E9E9E"
                    : readiness.hrv.delta_pct >= 0 ? "#4CAF93"
                    : readiness.hrv.delta_pct >= -10 ? "#E8A838"
                    : "#E05C5C"
                  }
                />
                <MetricCard
                  label="Sleep Score"
                  value={readiness.sleep?.score ?? "—"}
                  sub={readiness.sleep?.hours != null ? `${readiness.sleep.hours}h` : null}
                  color={
                    readiness.sleep?.score == null ? "#9E9E9E"
                    : readiness.sleep.score >= 70 ? "#4CAF93"
                    : readiness.sleep.score >= 50 ? "#E8A838"
                    : "#E05C5C"
                  }
                />
                <MetricCard
                  label="Resting HR"
                  value={readiness.restingHR?.value ?? "—"}
                  sub={readiness.restingHR?.trend ?? null}
                  color={
                    readiness.restingHR?.trend === "normal" ? "#4CAF93"
                    : readiness.restingHR?.trend === "elevated" ? "#E05C5C"
                    : "#1a1a2e"
                  }
                />
                <MetricCard
                  label="TSB (Form)"
                  value={readiness.tsb != null ? readiness.tsb.toFixed(1) : "—"}
                  sub="CTL − ATL"
                  color={
                    readiness.tsb == null ? "#9E9E9E"
                    : readiness.tsb >= 0 ? "#4CAF93"
                    : readiness.tsb >= -15 ? "#E8A838"
                    : "#E05C5C"
                  }
                />
              </div>
            )}

            {/* Training Load Chart */}
            {hasCharts && last90.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginBottom: 12 }}>
                  Training Load — last 90 days
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={last90} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(last90.length / 6)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="ctl" stroke="#4CAF93" dot={false} name="CTL (Fitness)" strokeWidth={2} />
                    <Line type="monotone" dataKey="atl" stroke="#E8A838" dot={false} name="ATL (Fatigue)" strokeWidth={2} />
                    <Line type="monotone" dataKey="tsb" stroke="#7B68EE" dot={false} name="TSB (Form)" strokeWidth={1.5} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Weekly Volume */}
            {hasCharts && weeklyVol.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginBottom: 12 }}>
                  Weekly Volume (km)
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={weeklyVol} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="distance_km" fill="#4CAF93" name="km" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {noHistory && (
              <div style={{
                border: "1.5px solid #e0e0e0",
                borderRadius: 14,
                padding: "28px 24px",
                textAlign: "center",
                background: "#fafafa",
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📈</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e", marginBottom: 6 }}>
                  Training has started — charts building up
                </div>
                <p style={{ fontSize: 13, color: "#888", margin: 0, lineHeight: 1.6 }}>
                  Today's data is in. Training load, weekly volume, and trend charts will
                  appear here as daily updates accumulate over the coming days.
                </p>
              </div>
            )}
          </>
        )}

        <div style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 40 }}>
          Updated daily via{' '}
          <a href="https://github.com/cocchialorenzo9/vibe-marathon" style={{ color: "#bbb" }}>
            vibe-marathon
          </a>
        </div>
      </div>
    </Layout>
  );
}
