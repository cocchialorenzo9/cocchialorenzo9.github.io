import React from 'react';
import Link from '@docusaurus/Link';

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

// Internal routes go through Docusaurus <Link> (client-side nav + broken-link
// checks). In-page anchors, static files and mailto: stay <a>; external URLs
// open in a new tab, as Docusaurus <Link> does for them.
export default function SmartLink({ href, children, ...rest }: Props) {
  const isRoute = href.startsWith('/') && !/\.[a-z0-9]+$/i.test(href.split('#')[0]);
  if (isRoute) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }
  const isExternal = /^https?:\/\//.test(href);
  return (
    <a href={href} {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })} {...rest}>
      {children}
    </a>
  );
}
