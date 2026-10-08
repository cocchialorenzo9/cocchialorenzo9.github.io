import React from 'react';
import clsx from 'clsx';
import SmartLink from './SmartLink';
import styles from './site.module.css';

export type NavLink = { label: string; href: string; current?: boolean };

type Props = {
  logoHref: string;
  links: NavLink[];
  contactHref: string;
};

export default function SiteNav({ logoHref, links, contactHref }: Props) {
  return (
    <div className={styles.navBar}>
      <header className={styles.navInner}>
        <SmartLink href={logoHref} className={styles.logo}>
          lorenzo<span className={styles.logoDot}>.</span>cocchia
        </SmartLink>
        <nav aria-label="Main" className={styles.navLinks}>
          {links.map((l) => (
            <SmartLink
              key={l.label}
              href={l.href}
              className={clsx(styles.navLink, l.current && styles.navLinkOn)}
              aria-current={l.current ? 'page' : undefined}
            >
              {l.label}
            </SmartLink>
          ))}
          <a href={contactHref} className={styles.navCta}>
            Say hi
          </a>
        </nav>
      </header>
    </div>
  );
}
