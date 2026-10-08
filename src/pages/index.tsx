import React from 'react';
import clsx from 'clsx';
import SitePage from '@site/src/components/site/SitePage';
import SiteNav, { NavLink } from '@site/src/components/site/SiteNav';
import SiteFooter from '@site/src/components/site/SiteFooter';
import SmartLink from '@site/src/components/site/SmartLink';
import { C } from '@site/src/components/site/tokens';
import site from '@site/src/components/site/site.module.css';
import styles from './index.module.css';

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV: NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Strengths', href: '#strengths' },
  { label: 'Work', href: '#work' },
  { label: 'Life', href: '#life' },
  { label: 'Projects', href: '/projects' },
];

const ROLES = [
  { label: 'Software engineer', bg: C.mint },
  { label: 'Product owner', bg: C.lilac },
  { label: 'UX researcher', bg: C.yellow },
];

const BITS = [
  { label: 'Siena', emoji: '🏇', alt: 'Siena, the Palio', bg: C.yellow },
  { label: 'Munich', emoji: '🥨', alt: 'Brezel, Munich', bg: C.orange },
  { label: 'Basketball', emoji: '🏀', alt: 'Basketball', bg: C.peach },
  { label: 'Running', emoji: '🏃‍♂️', alt: 'Running', bg: C.mint },
  { label: 'Diving', emoji: '🤿', alt: 'Diving', bg: C.sky },
];

const MARQUEE = [
  { label: 'Java', star: C.orange },
  { label: 'Spring Boot', star: C.mint },
  { label: 'React + TypeScript', star: C.yellow },
  { label: 'GraphQL', star: C.lilac },
  { label: 'AWS + Terraform', star: C.orange },
  { label: 'Scrum', star: C.mint },
  { label: 'User research', star: C.yellow },
  { label: 'AI products', star: C.lilac },
];

const TIMELINE = [
  {
    period: 'Until 2017',
    city: 'Siena',
    emoji: '🏇',
    alt: 'Siena, the Palio',
    bg: C.yellow,
    text: 'Where I grew up, between the Palio and the Tuscan hills. Finished high school with 98/100.',
  },
  {
    period: '2017 – 2021',
    city: 'Milan',
    emoji: '🧑‍🎓',
    alt: 'Student in Milan',
    bg: C.lilac,
    text: 'BSc in Computer Engineering and the start of my MSc at Politecnico di Milano.',
  },
  {
    period: '2021 – 2022',
    city: 'Berlin',
    emoji: '🐻',
    alt: 'Berlin bear',
    bg: C.mint,
    text: 'Double MSc at TU Berlin, final grade 1.0, thesis on AR. UX and AR work at two startups.',
  },
  {
    period: '2022 – now',
    city: 'Munich',
    emoji: '🥨',
    alt: 'Brezel, Munich',
    bg: C.orange,
    text: 'Software Consultant, then Senior, at TNG Technology Consulting.',
    current: true,
  },
];

const LOGOS = [
  { src: '/img/site/logo-polimi.png', alt: 'Politecnico di Milano logo', height: 44 },
  { src: '/img/site/logo-tu-berlin.png', alt: 'TU Berlin logo', height: 54 },
  { src: '/img/site/logo-eit-digital.png', alt: 'EIT Digital logo', height: 46 },
];

const NUMBERS = [
  { value: '1M+', label: 'monthly requests on services I built from scratch', color: C.accent },
  { value: '~15', label: 'countries using the platforms I work on', color: C.burnt },
  { value: '125+', label: 'people interviewed for my AR research', color: C.ink },
  { value: '1.0', label: 'final grade, double MSc in Computer Science', color: C.green },
];

const STRENGTHS = [
  {
    title: 'Engineering that ships',
    text: 'Full-stack in Java, Spring Boot, React and GraphQL. I design services from zero and deploy them on AWS with Terraform and Docker.',
    img: '/img/site/strength-engineering.webp',
    alt: 'Abstract illustration of colorful stacked building blocks',
  },
  {
    title: 'Product ownership',
    text: "PSPO certified. I set priorities with leadership, run Scrum teams, and say “no” to the features that don't move the needle.",
    img: '/img/site/strength-product.webp',
    alt: 'Abstract illustration of a target with an arrow in the center',
  },
  {
    title: 'Listening to users',
    text: 'Interviews, focus groups, usability tests with UEQ scores, and prototypes in Figma. I bring developers into the room too.',
    img: '/img/site/strength-users.webp',
    alt: 'Abstract halftone illustration with speech bubbles',
  },
  {
    title: 'AI, made useful',
    text: "I've owned an AI assistant product and use AI every day to prototype and code faster. Simple for non-technical users is the goal.",
    img: '/img/site/strength-ai.webp',
    alt: 'Abstract illustration of colorful flowing lines on black',
  },
];

type WorkItem = {
  title: string;
  text: string;
  tags: string[];
  img?: string;
  alt?: string;
  quote?: string;
  link?: { label: string; href: string };
};

const WORK: WorkItem[] = [
  {
    title: 'An AI assistant, from idea to customers',
    text: 'I owned the roadmap of an in-house AI assistant built for external sale. I led a Scrum team of four, ran usability tests with real users, and pitched it in customer demos.',
    tags: ['Product Owner', 'GenAI', 'UX research'],
    img: '/img/site/work-ai-assistant.webp',
    alt: 'Abstract illustration of a chat conversation',
  },
  {
    title: 'An order history that helped win a €20M+ deal',
    text: 'For a B2B procurement platform, I built a key feature end to end — React and Apollo on top, a GraphQL layer over many REST services, Spring Boot below — in short loops with the UX team.',
    tags: ['Full-stack', 'React + GraphQL', 'Spring Boot'],
    img: '/img/site/work-order-history.webp',
    alt: 'Abstract illustration of stacked order cards',
  },
  {
    title: 'Stopping the wrong project early',
    text: 'As Product Owner of a new business idea, I tested it with real users first. What we learned made management stop the project mid-way — and save a large budget.',
    tags: ['Discovery', 'Design thinking', 'Figma'],
    quote: "Sometimes the best feature is the one you don't build.",
  },
  {
    title: 'How people feel playing AR in public',
    text: 'My master thesis became a paper. I presented it at QoMEX 2024 in Sweden and was nominated for the Best Student Award.',
    tags: ['Research', 'Augmented reality', 'Unity'],
    link: { label: 'Read the paper on arXiv →', href: 'https://arxiv.org/abs/2404.16479' },
    img: '/img/site/work-ar-research.webp',
    alt: 'Abstract illustration of figures standing on an isometric grid',
  },
];

const STEPS = [
  { title: 'Listen', text: 'User interviews, story mapping and stakeholder talks — before a single line of code.', bg: C.mint },
  { title: 'Shape', text: 'Clear priorities, quick prototypes in Figma or with AI, and decisions written down.', bg: C.lilac },
  { title: 'Build', text: 'Clean full-stack code, tests, and infrastructure as code — shipped in small steps.', bg: C.yellow },
  { title: 'Measure', text: 'KPIs in Grafana, UX scores, real feedback. Then the loop starts again.', bg: C.orange },
];

const LIFE = [
  { label: 'Running', text: 'Training for the Munich Marathon with a sub-3-hour goal. I bike to work every day.' },
  { label: 'Water', text: 'Regular swimmer and Advanced Open Water diver.' },
  {
    label: 'Basketball',
    text: '18 years on court: national level as a junior, regional level as a senior. It taught me everything about leadership and teamwork.',
  },
  { label: 'Teaching', text: 'I run in-house workshops on REST APIs and on presentation skills.' },
  { label: 'Languages', text: 'Italian (native), English (fluent), German and Spanish (learning).' },
];

const CONTACT = [
  { label: 'cocchialorenzo@gmail.com', href: 'mailto:cocchialorenzo@gmail.com' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lorenzo-cocchia/' },
  { label: 'GitHub', href: 'https://github.com/cocchialorenzo9' },
  { label: 'Download CV', href: '/cv/Lorenzo_Cocchia_CV.pdf' },
];

// ─── Components ──────────────────────────────────────────────────────────────

function Emoji({ symbol, label, className }: { symbol: string; label: string; className?: string }) {
  return (
    <span role="img" aria-label={label} className={className}>
      {symbol}
    </span>
  );
}

function Hero() {
  return (
    <section id="top" className={clsx(site.container, styles.hero)}>
      <div className={styles.heroText}>
        <div className={site.chipRow}>
          {ROLES.map((r) => (
            <span key={r.label} className={site.chip} style={{ background: r.bg }}>
              {r.label}
            </span>
          ))}
        </div>
        <h1 className={styles.heroTitle}>
          Hi, I'm Lorenzo. I build software people <span className={clsx(site.serif, styles.accentText)}>actually</span>{' '}
          want to use.
        </h1>
        <p className={styles.heroLead}>
          Senior Software Consultant in Munich. I sit between code and product: I talk to users, decide what matters,
          and then build it myself — from the React screen down to the cloud.
        </p>
        <div className={styles.heroCtas}>
          <a href="#work" className={styles.btnPrimary}>
            See my work
          </a>
          <a href="#contact" className={styles.btnOutline}>
            Get in touch
          </a>
        </div>
        <div className={styles.bits}>
          <div className={styles.bitsLabel}>A bit of me</div>
          <div className={styles.bitsRow}>
            {BITS.map((b) => (
              <div key={b.label} className={styles.bit}>
                <div className={styles.bitIcon} style={{ background: b.bg }}>
                  <Emoji symbol={b.emoji} label={b.alt} />
                </div>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.portrait}>
        <div className={styles.portraitBack} />
        <img
          src="/img/site/portrait.webp"
          alt="Portrait of Lorenzo Cocchia, smiling with arms crossed"
          className={styles.portraitImg}
          width={1120}
          height={1400}
        />
        <div className={clsx(styles.sticker, styles.stickerMunich)}>
          <Emoji symbol="🥨" label="Brezel, Munich" className={styles.stickerEmoji} />
          Based in Munich
        </div>
        <div className={clsx(styles.sticker, styles.stickerSiena)}>
          <Emoji symbol="🇮🇹" label="Italy" className={styles.stickerEmoji} />
          Made in Siena, Italy
        </div>
        <div className={styles.seal}>
          PSPO
          <br />
          certified
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  // Two identical copies, each with its own trailing gap, so translating the
  // track by -50% lands exactly on the start of the second copy.
  const copy = (
    <div className={styles.marqueeCopy}>
      {MARQUEE.map((m) => (
        <React.Fragment key={m.label}>
          <span>{m.label}</span>
          <span style={{ color: m.star }}>✦</span>
        </React.Fragment>
      ))}
    </div>
  );
  return (
    <div aria-hidden="true" className={styles.marquee}>
      <div className={styles.marqueeTrack}>
        {copy}
        {copy}
      </div>
    </div>
  );
}

function About() {
  return (
    <section id="about" className={clsx(site.container, styles.about)}>
      <div className={site.eyebrow}>01 — About me</div>
      <p className={styles.aboutLead}>
        I'm an Italian engineer with a{' '}
        <span className={styles.highlight} style={{ background: C.lilac }}>
          product brain
        </span>
        . I studied computer science in Milan and Berlin, did research on{' '}
        <span className={site.serif}>User Experience</span>, and today I help teams turn fuzzy ideas into{' '}
        <span className={styles.highlight} style={{ background: C.mint }}>
          working software
        </span>{' '}
        that real people enjoy.
      </p>
      <div className={styles.timeline}>
        {TIMELINE.map((t) => (
          <div key={t.city} className={clsx(site.lift, styles.stop, t.current && styles.stopCurrent)}>
            <div className={styles.stopHead}>
              <div className={styles.stopPeriod}>{t.period}</div>
              <div className={styles.stopIcon} style={{ background: t.bg }}>
                <Emoji symbol={t.emoji} label={t.alt} />
              </div>
            </div>
            <div className={styles.stopCity}>{t.city}</div>
            <div className={styles.stopText}>{t.text}</div>
          </div>
        ))}
      </div>
      <div className={styles.logos}>
        <div className={site.eyebrow}>Studied &amp; certified with</div>
        <div className={styles.logoRow}>
          {LOGOS.map((l) => (
            <div key={l.alt} className={styles.logoBox}>
              <img src={l.src} alt={l.alt} style={{ height: l.height }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Numbers() {
  return (
    <section aria-label="Numbers" className={clsx(site.container, styles.numbersSection)}>
      <div className={styles.numbers}>
        {NUMBERS.map((n) => (
          <div key={n.value} className={styles.number}>
            <div className={styles.numberValue} style={{ color: n.color }}>
              {n.value}
            </div>
            <div className={styles.numberLabel}>{n.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Strengths() {
  return (
    <section id="strengths" className={clsx(site.container, styles.strengths)}>
      <div className={styles.sectionHeadSplit}>
        <div className={styles.sectionHead}>
          <div className={site.eyebrow}>02 — Strengths</div>
          <h2 className={styles.h2}>
            Four hats, <span className={site.serif}>one head.</span>
          </h2>
        </div>
        <p className={styles.sectionAside}>
          Most teams split these roles across many people. I connect them, so less gets lost between the idea and the
          release.
        </p>
      </div>
      <div className={styles.strengthGrid}>
        {STRENGTHS.map((s) => (
          <article key={s.title} className={clsx(site.lift, styles.card)}>
            <img src={s.img} alt={s.alt} className={styles.cardImg} loading="lazy" />
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardText}>{s.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="work" className={styles.work}>
      <div className={clsx(site.container, styles.workInner)}>
        <div className={styles.sectionHead}>
          <div className={site.eyebrow} style={{ color: C.mint }}>
            03 — Selected work
          </div>
          <h2 className={styles.h2}>
            Things I'm{' '}
            <span className={site.serif} style={{ color: C.yellow }}>
              proud
            </span>{' '}
            of.
          </h2>
        </div>
        <div className={styles.workGrid}>
          {WORK.map((w) => (
            <article key={w.title} className={styles.workItem}>
              {w.quote ? (
                <div className={styles.quoteCard}>
                  <div className={styles.quoteMark} aria-hidden="true">
                    “
                  </div>
                  <div className={styles.quoteText}>{w.quote}</div>
                </div>
              ) : (
                <img src={w.img} alt={w.alt} className={styles.workImg} loading="lazy" />
              )}
              <div className={site.chipRow} style={{ gap: 8 }}>
                {w.tags.map((t) => (
                  <span key={t} className={styles.tag}>
                    {t}
                  </span>
                ))}
              </div>
              <h3 className={styles.workTitle}>{w.title}</h3>
              <p className={styles.workText}>{w.text}</p>
              {w.link && (
                <SmartLink href={w.link.href} className={styles.workLink}>
                  {w.link.label}
                </SmartLink>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowIWork() {
  return (
    <section className={styles.how}>
      <div className={clsx(site.container, styles.howInner)}>
        <div className={styles.sectionHead}>
          <div className={site.eyebrow} style={{ color: C.yellow }}>
            04 — How I work
          </div>
          <h2 className={styles.h2}>
            Listen. Shape. Build. <span className={site.serif}>Measure.</span>
          </h2>
        </div>
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={s.title} className={styles.step}>
              <div className={styles.stepNum} style={{ background: s.bg }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepText}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Life() {
  return (
    <section id="life" className={clsx(site.container, styles.life)}>
      <div className={styles.lifeVisual}>
        <img
          src="/img/site/life-route.webp"
          alt="Abstract topographic map with a running route"
          className={styles.lifeImg}
          loading="lazy"
        />
        <div className={styles.lifeBadge}>
          42.195
          <br />
          km
        </div>
      </div>
      <div className={styles.lifeText}>
        <div className={site.eyebrow}>05 — Beyond the code</div>
        <h2 className={styles.h2Life}>
          Long runs, <span className={site.serif}>deep</span> water, good games.
        </h2>
        <div className={styles.lifeRows}>
          {LIFE.map((l) => (
            <div key={l.label} className={styles.lifeRow}>
              <div className={styles.lifeLabel}>{l.label}</div>
              <div className={styles.lifeDesc}>{l.text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  return (
    <SitePage
      title="Lorenzo Cocchia — Product-minded engineer"
      description="Lorenzo Cocchia — Senior Software Consultant in Munich. Software engineer, product owner and UX researcher."
    >
      <SiteNav logoHref="#top" links={NAV} contactHref="#contact" />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Numbers />
        <Strengths />
        <Work />
        <HowIWork />
        <Life />
      </main>
      <SiteFooter
        eyebrow="06 — Contact"
        heading={
          <>
            Let's build something <span className={site.serif}>people love.</span>
          </>
        }
        links={CONTACT}
        middle={<span>Munich, Germany</span>}
      />
    </SitePage>
  );
}
