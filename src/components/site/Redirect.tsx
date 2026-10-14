import React, { useEffect } from 'react';
import Head from '@docusaurus/Head';

// Static-site redirect for pages that moved off this site: a meta refresh for
// crawlers and no-JS, plus location.replace() so the old URL leaves history.
export default function Redirect({ to, keepSearch = false }: { to: string; keepSearch?: boolean }) {
  useEffect(() => {
    window.location.replace(keepSearch ? withSearch(to, window.location.search) : to);
  }, [to, keepSearch]);

  return (
    <>
      <Head>
        {/* A meta refresh would win the race and drop the query string. */}
        {!keepSearch && <meta httpEquiv="refresh" content={`0; url=${to}`} />}
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={to} />
        <title>Moved</title>
      </Head>
      <p style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        This page moved to <a href={to}>{to}</a>.
      </p>
    </>
  );
}

// Hash-routed targets take the query inside the hash: /x/#/route?ref=y.
function withSearch(to: string, search: string): string {
  return search ? `${to}${to.includes('?') ? '&' : '?'}${search.slice(1)}` : to;
}
