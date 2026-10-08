import React from 'react';
import Link from '@docusaurus/Link';

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

// Internal routes go through Docusaurus <Link> (client-side nav + broken-link
// checks). In-page anchors, static files, mailto: and external URLs stay <a>.
export default function SmartLink({ href, children, ...rest }: Props) {
  const isRoute = href.startsWith('/') && !/\.[a-z0-9]+$/i.test(href.split('#')[0]);
  if (isRoute) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
