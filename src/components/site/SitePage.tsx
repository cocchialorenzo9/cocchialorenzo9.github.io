import React from 'react';
import Head from '@docusaurus/Head';
import styles from './site.module.css';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&display=swap';

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

// Standalone page shell: deliberately skips @theme/Layout so the Docusaurus
// navbar and footer never render on the redesigned pages.
export default function SitePage({ title, description, children }: Props) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS} />
      </Head>
      <div className={styles.root}>{children}</div>
    </>
  );
}
