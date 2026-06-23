import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

// ─── Data ────────────────────────────────────────────────────────────────────

const EXPERIENCE = [
  {
    title: 'Senior Software Consultant',
    company: 'TNG Technology Consulting',
    period: 'Jul 2025 – Present',
    location: 'Munich, DE',
    tech: ['Java', 'React', 'TypeScript', 'Node.js', 'AWS', 'Design Thinking'],
    groups: [
      {
        label: null,
        bullets: [
          'Drove product strategy for the company\'s AI chatbot assistant, defining the roadmap and facilitating Design Thinking workshops with cross-functional stakeholders.',
          'Owned end-to-end delivery of the Order History feature for a client, contributing to a 20 M€+ contract renewal through reliable, scalable execution.',
          'Led delivery of a safety-critical nuclear radiation monitoring system, coordinating a cross-functional team and ensuring compliance with strict reliability standards.',
        ],
      },
    ],
  },
  {
    title: 'Software Consultant',
    company: 'TNG Technology Consulting',
    period: 'Nov 2022 – Jul 2025',
    location: 'Munich, DE',
    tech: ['Java', 'React', 'TypeScript', 'Node.js', 'Terraform', 'AWS', 'GitLab', 'Grafana', 'Agile'],
    groups: [
      {
        label: 'Product Management & Leadership',
        bullets: [
          'Acted as Product Owner, managing a backlog of 50+ items and aligning priorities with business stakeholders across two delivery teams.',
          'Facilitated Agile ceremonies and drove adoption of a definition-of-ready process that cut mid-sprint scope changes by ~30%.',
          'Mentored junior consultants in both engineering practices and client communication.',
        ],
      },
      {
        label: 'Software Engineering',
        bullets: [
          'Built full-stack features and REST/GraphQL APIs serving 1 M+ monthly requests, using Java (Spring Boot) on the backend and React/TypeScript on the frontend.',
          'Maintained 10+ distributed microservices deployed on AWS, improving observability with structured logging and Grafana dashboards.',
          'Automated infrastructure provisioning with Terraform, reducing environment setup time from days to under an hour.',
        ],
      },
    ],
  },
];

const SKILLS = [
  {
    group: 'Languages',
    items: ['Java', 'TypeScript', 'HTML', 'CSS', 'SQL', 'HCL'],
  },
  {
    group: 'Frameworks & Tools',
    items: ['Spring Boot', 'React', 'Node.js', 'AWS', 'Terraform', 'GraphQL', 'REST', 'Git', 'GitLab CI', 'Grafana'],
  },
  {
    group: 'Practices',
    items: ['Agile / Scrum', 'Product Ownership', 'Design Thinking', 'Microservices', 'TDD'],
  },
  {
    group: 'Certifications',
    items: ['PSPO I (Scrum.org)', 'Google Project Management Certificate'],
  },
  {
    group: 'Spoken Languages',
    items: ['Italian (native)', 'English (C1)', 'German (B1)', 'Spanish (B1)'],
  },
];

const EDUCATION = [
  {
    degree: 'Double MSc in Computer Science & Engineering',
    school: 'EIT Digital — Politecnico di Milano & TU Berlin',
    period: 'Sep 2020 – Oct 2022',
    gpa: 'GPA 1.06 / 1.0 scale',
    detail: 'Major: Human-Computer Interaction & Design · Minor: Innovation & Entrepreneurship',
  },
  {
    degree: 'BSc in Engineering of Computing Systems',
    school: 'Politecnico di Milano',
    period: 'Sep 2017 – Sep 2020',
    gpa: 'GPA 26.28 / 30',
    detail: null,
  },
];

const PUBLICATIONS = [
  {
    citation: 'Cocchia L., et al. (2024). The Impact of Social Environment and Interaction Focus on User Experience and Social Acceptability of an Augmented Reality Game.',
    venue: 'arXiv:2404.16479',
    href: 'https://arxiv.org/abs/2404.16479',
  },
];

// ─── Components ──────────────────────────────────────────────────────────────

function Hero() {
  return (
    <header className={styles.hero}>
      <div className="container">
        <p className={styles.heroEyebrow}>Hey, I'm</p>
        <h1 className={styles.heroName}>Lorenzo Cocchia</h1>
        <p className={styles.heroTitle}>Senior Software Consultant</p>
        <p className={styles.heroMeta}>TNG Technology Consulting · Munich, DE</p>
        <div className={styles.heroCtas}>
          <Link
            className={clsx('button button--primary button--lg', styles.ctaPrimary)}
            href="mailto:cocchialorenzo@gmail.com">
            Get in touch
          </Link>
          <Link
            className={clsx('button button--outline button--lg', styles.ctaOutline)}
            href="https://www.linkedin.com/in/lorenzo-cocchia/">
            LinkedIn
          </Link>
        </div>
      </div>
    </header>
  );
}

function SectionTitle({children}: {children: React.ReactNode}) {
  return <h2 className={styles.sectionTitle}>{children}</h2>;
}

function TechTag({label}: {label: string}) {
  return <span className={styles.techTag}>{label}</span>;
}

function ExperienceSection() {
  return (
    <section id="experience" className={styles.section}>
      <div className="container">
        <SectionTitle>Experience</SectionTitle>
        {EXPERIENCE.map((job, i) => (
          <div key={i} className={styles.expCard}>
            <div className={styles.expDot} />
            <div className={styles.expHeader}>
              <div>
                <h3 className={styles.expTitle}>{job.title}</h3>
                <p className={styles.expCompany}>{job.company} · {job.location}</p>
              </div>
              <span className={styles.expPeriod}>{job.period}</span>
            </div>
            {job.groups.map((g, gi) => (
              <div key={gi}>
                {g.label && <p className={styles.expGroupLabel}>{g.label}</p>}
                <ul className={styles.expBullets}>
                  {g.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                </ul>
              </div>
            ))}
            <div className={styles.techTags}>
              {job.tech.map(t => <TechTag key={t} label={t} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SkillsSection() {
  return (
    <section id="skills" className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <SectionTitle>Skills</SectionTitle>
        <div className={styles.skillsGrid}>
          {SKILLS.map((s, i) => (
            <div key={i} className={styles.skillGroup}>
              <p className={styles.skillGroupTitle}>{s.group}</p>
              <div className={styles.skillPills}>
                {s.items.map(item => (
                  <span key={item} className={styles.skillPill}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EducationSection() {
  return (
    <section id="education" className={styles.section}>
      <div className="container">
        <SectionTitle>Education</SectionTitle>
        {EDUCATION.map((ed, i) => (
          <div key={i} className={clsx(styles.eduCard, i < EDUCATION.length - 1 && styles.eduCardBorder)}>
            <div className={styles.eduMeta}>
              <span className={styles.eduPeriod}>{ed.period}</span>
              <span className={styles.eduGpa}>{ed.gpa}</span>
            </div>
            <div>
              <h3 className={styles.eduDegree}>{ed.degree}</h3>
              <p className={styles.eduSchool}>{ed.school}</p>
              {ed.detail && <p className={styles.eduDetail}>{ed.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PublicationsSection() {
  return (
    <section id="publications" className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <SectionTitle>Publications</SectionTitle>
        {PUBLICATIONS.map((pub, i) => (
          <div key={i} className={styles.pubCard}>
            <p className={styles.pubCitation}>{pub.citation}</p>
            <Link href={pub.href} className={styles.pubLink}>
              {pub.venue} ↗
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Lorenzo Cocchia"
      description="Senior Software Consultant specialising in full-stack engineering and product management.">
      <Hero />
      <main>
        <ExperienceSection />
        <SkillsSection />
        <EducationSection />
        <PublicationsSection />
      </main>
    </Layout>
  );
}
