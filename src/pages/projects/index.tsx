import React from 'react';
import clsx from 'clsx';
import SitePage from '@site/src/components/site/SitePage';
import SiteNav, { NavLink } from '@site/src/components/site/SiteNav';
import SiteFooter from '@site/src/components/site/SiteFooter';
import SmartLink from '@site/src/components/site/SmartLink';
import { C } from '@site/src/components/site/tokens';
import site from '@site/src/components/site/site.module.css';
import styles from './projects.module.css';

// ─── Data ────────────────────────────────────────────────────────────────────

type Status = 'live' | 'in-progress';

type Project = {
  name: string;
  emoji: string;
  emojiLabel: string;
  description: string;
  status: Status;
  img: string;
  alt: string;
  // Card link; omit for projects that aren't public yet.
  href?: string;
  // Card link label; defaults to "Open app".
  cta?: string;
  passwordProtected?: boolean;
  featured?: boolean;
  tags?: string[];
  actions?: { label: string; href: string }[];
};

const PROJECTS: Project[] = [
  {
    name: 'Vibe Marathon',
    emoji: '🏃‍♂️',
    emojiLabel: 'Running',
    description:
      'My own marathon coach. Every day it pulls my training data from Garmin, computes fitness and fatigue (ATL, CTL, TSB) and writes a coaching tip for the day. The dashboard shows readiness, training load and charts.',
    status: 'live',
    img: '/img/site/project-vibe-marathon.webp',
    alt: 'Abstract dashboard with a heart-rate line and training bars',
    featured: true,
    tags: ['Python', 'Garmin data', 'React', 'GitHub Pages'],
    actions: [
      { label: 'Open dashboard →', href: '/projects/vibe-marathon' },
      { label: 'Training plan', href: '/marathon' },
      { label: 'Code', href: 'https://github.com/cocchialorenzo9/vibe-marathon' },
    ],
  },
  {
    name: 'Vibe Plant Watering',
    emoji: '🪴',
    emojiLabel: 'Plant',
    description: 'A plant care tracker with watering schedules and reminders for every plant at home. No more sad leaves.',
    status: 'live',
    img: '/img/site/project-plant-watering.webp',
    alt: 'Illustration of a potted plant with water drops',
    href: 'https://cocchialorenzo9.github.io/vibe-plant-watering',
  },
  {
    name: 'Our Home',
    emoji: '🏠',
    emojiLabel: 'House',
    description:
      'A shared move-in checklist and shopping list, synced live: rooms, priorities and where to buy each item — plus research reports for the big buys.',
    status: 'live',
    img: '/img/site/project-our-home.webp',
    alt: 'Illustration of a small house next to a checklist',
    href: '/home',
    passwordProtected: true,
  },
  {
    name: 'Job Swipe',
    emoji: '💘',
    emojiLabel: 'Heart',
    description:
      'Job hunting like a dating app. An AI agent finds roles that fit, I swipe, and it learns from every like. Next step: sharing it with friends as a Claude plugin.',
    status: 'live',
    img: '/img/site/project-job-swipe.webp',
    alt: 'Illustration of swipeable job cards with a like and a pass button',
    href: 'https://github.com/cocchialorenzo9/job-swipe',
    cta: 'View on GitHub',
  },
];

const NAV: NavLink[] = [
  { label: 'About', href: '/#about' },
  { label: 'Strengths', href: '/#strengths' },
  { label: 'Work', href: '/#work' },
  { label: 'Life', href: '/#life' },
  { label: 'Projects', href: '/projects', current: true },
];

const CONTACT = [
  { label: 'cocchialorenzo@gmail.com', href: 'mailto:cocchialorenzo@gmail.com' },
  { label: 'GitHub', href: 'https://github.com/cocchialorenzo9' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lorenzo-cocchia/' },
];

// ─── Components ──────────────────────────────────────────────────────────────

function StatusBadge({ status, dark }: { status: Status; dark?: boolean }) {
  if (status === 'in-progress') {
    return (
      <span className={styles.badge} style={{ background: C.yellow }}>
        In progress
      </span>
    );
  }
  return (
    <span className={clsx(styles.badge, dark && styles.badgeOnDark)} style={{ background: C.mint }}>
      <span className={styles.liveDot} />
      Live
    </span>
  );
}

function Featured({ p }: { p: Project }) {
  return (
    <section aria-label="Featured project" className={clsx(site.container, styles.featuredSection)}>
      <article className={styles.featured}>
        <img src={p.img} alt={p.alt} className={styles.featuredImg} width={1200} height={900} />
        <div className={styles.featuredBody}>
          <div className={styles.badgeRow}>
            <StatusBadge status={p.status} dark />
            <span className={styles.featuredLabel}>Featured</span>
          </div>
          <h2 className={styles.featuredTitle}>
            <span role="img" aria-label={p.emojiLabel} className={styles.featuredEmoji}>
              {p.emoji}
            </span>{' '}
            {p.name}
          </h2>
          <p className={styles.featuredText}>{p.description}</p>
          {p.tags && (
            <div className={site.chipRow} style={{ gap: 8 }}>
              {p.tags.map((t) => (
                <span key={t} className={styles.tag}>
                  {t}
                </span>
              ))}
            </div>
          )}
          {p.actions && (
            <div className={styles.actions}>
              {p.actions.map((a, i) => (
                <SmartLink key={a.label} href={a.href} className={i === 0 ? styles.actionPrimary : styles.actionOutline}>
                  {a.label}
                </SmartLink>
              ))}
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

function ProjectCard({ p }: { p: Project }) {
  const body = (
    <>
      <img src={p.img} alt={p.alt} className={styles.cardImg} loading="lazy" />
      <div className={styles.cardBody}>
        <div className={styles.badgeRow}>
          <StatusBadge status={p.status} />
          {p.passwordProtected && (
            <span className={styles.badge} style={{ background: C.lilac }}>
              Password protected
            </span>
          )}
        </div>
        <h3 className={styles.cardTitle}>
          <span role="img" aria-label={p.emojiLabel}>
            {p.emoji}
          </span>{' '}
          {p.name}
        </h3>
        <p className={styles.cardText}>{p.description}</p>
        {p.href ? (
          <span className={styles.cardCta}>
            {p.cta ?? 'Open app'} <span className={styles.arrow}>→</span>
          </span>
        ) : (
          <span className={styles.cardSoon}>Coming soon</span>
        )}
      </div>
    </>
  );

  return p.href ? (
    <SmartLink href={p.href} className={clsx(styles.card, styles.cardLink)}>
      {body}
    </SmartLink>
  ) : (
    <article className={styles.card}>{body}</article>
  );
}

export default function Projects(): JSX.Element {
  const featured = PROJECTS.filter((p) => p.featured);
  const rest = PROJECTS.filter((p) => !p.featured);
  const live = PROJECTS.filter((p) => p.status === 'live').length;
  const stats = [
    { value: PROJECTS.length, label: PROJECTS.length === 1 ? 'project' : 'projects', color: C.ink },
    { value: live, label: 'live now', color: C.green },
    { value: PROJECTS.length - live, label: 'in progress', color: C.rust },
  ].filter((s) => s.value > 0);

  return (
    <SitePage
      title="Projects — Lorenzo Cocchia"
      description="Small tools for my real life: side projects Lorenzo Cocchia builds with AI as a co-pilot."
    >
      <SiteNav logoHref="/" links={NAV} contactHref="#contact" />
      <main>
        <section id="top" className={clsx(site.container, styles.hero)}>
          <div className={site.chipRow}>
            <span className={site.chip} style={{ background: C.yellow }}>
              Side projects
            </span>
            <span className={site.chip} style={{ background: C.mint }}>
              Built with AI
            </span>
          </div>
          <h1 className={styles.heroTitle}>
            Small tools for my <span className={site.serif} style={{ color: C.accent }}>real</span> life.
          </h1>
          <div className={styles.heroRow}>
            <p className={styles.heroLead}>
              In my free time I build little apps that fix my own problems. They are also my playground to try new
              tech — with AI as my co-pilot. Most of them are live, so click around.
            </p>
            <div className={styles.stats}>
              {stats.map((s) => (
                <div key={s.label} className={styles.stat}>
                  <span className={styles.statValue} style={{ color: s.color }}>
                    {s.value}
                  </span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {featured.map((p) => (
          <Featured key={p.name} p={p} />
        ))}

        <section aria-label="More projects" className={clsx(site.container, styles.gridSection)}>
          <div className={styles.grid}>
            {rest.map((p) => (
              <ProjectCard key={p.name} p={p} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter
        compact
        heading={
          <>
            Got an idea? <span className={site.serif}>Let's talk.</span>
          </>
        }
        links={CONTACT}
        middle={
          <SmartLink href="/" className={site.footerBottomLink}>
            ← Back home
          </SmartLink>
        }
      />
    </SitePage>
  );
}
