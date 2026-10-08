import React from 'react';
import clsx from 'clsx';
import SmartLink from './SmartLink';
import styles from './site.module.css';

export type FooterLink = { label: string; href: string };

type Props = {
  eyebrow?: string;
  heading: React.ReactNode;
  links: FooterLink[];
  // Middle item of the bottom row (between copyright and "Back to top").
  middle: React.ReactNode;
  compact?: boolean;
};

export default function SiteFooter({ eyebrow, heading, links, middle, compact }: Props) {
  return (
    <footer id="contact" className={styles.footer}>
      <div className={clsx(styles.footerInner, compact && styles.footerCompact)}>
        {eyebrow && <div className={styles.footerEyebrow}>{eyebrow}</div>}
        <h2 className={styles.footerTitle}>{heading}</h2>
        <div className={styles.footerLinks}>
          {links.map((l, i) => (
            <SmartLink
              key={l.label}
              href={l.href}
              className={i === 0 ? styles.footerBtnSolid : styles.footerBtnOutline}
            >
              {l.label}
            </SmartLink>
          ))}
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 Lorenzo Cocchia</span>
          {middle}
          <a href="#top" className={styles.footerBottomLink}>
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
