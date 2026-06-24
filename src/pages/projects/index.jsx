import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

const PROJECTS = [
  {
    slug: "vibe-marathon",
    name: "Vibe Marathon",
    description: "Live marathon preparation dashboard — readiness, training load, and daily coaching recommendations.",
    status: "Active",
    statusColor: "#4CAF93",
    emoji: "🏃",
  },
];

export default function ProjectsIndex() {
  return (
    <Layout title="Projects" description="Live dashboards for ongoing personal projects.">
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px", fontFamily: "inherit" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", marginBottom: 8 }}>Projects</h1>
        <p style={{ color: "#666", fontSize: 15, marginBottom: 32 }}>
          Live dashboards for ongoing personal projects.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {PROJECTS.map(p => (
            <Link key={p.slug} to={`/projects/${p.slug}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  border: "1.5px solid #e0e0e0",
                  borderRadius: 14,
                  padding: "18px 22px",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <span style={{ fontSize: 36 }}>{p.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 17, color: "#1a1a2e" }}>{p.name}</span>
                    <span style={{
                      background: `${p.statusColor}22`,
                      color: p.statusColor,
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {p.status}
                    </span>
                  </div>
                  <p style={{ color: "#666", fontSize: 14, margin: 0 }}>{p.description}</p>
                </div>
                <span style={{ color: "#ccc", fontSize: 20 }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
