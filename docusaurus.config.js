// @ts-check
require('dotenv').config();
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Lorenzo Cocchia',
  tagline: 'Senior Software Consultant · Munich, DE',
  url: 'https://cocchialorenzo9.github.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  trailingSlash: false,

  organizationName: 'cocchialorenzo9',
  projectName: 'cocchialorenzo9.github.io',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Firebase apiKey/appId come from env vars (local .env, or GitHub Actions
  // secrets in CI) so the literal values never sit in tracked source —
  // see src/lib/firebase.js, which reads these back via
  // @generated/docusaurus.config.
  customFields: {
    firebaseApiKey: process.env.FIREBASE_API_KEY || '',
    firebaseAppId: process.env.FIREBASE_APP_ID || '',
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {name: 'description', content: 'Lorenzo Cocchia — Senior Software Consultant specialising in full-stack engineering and product management.'},
      ],
      navbar: {
        title: 'Lorenzo Cocchia',
        hideOnScroll: true,
        items: [
          {
            to: '/projects',
            label: '🗂 Projects',
            position: 'left',
          },
          {
            href: 'mailto:cocchialorenzo@gmail.com',
            label: 'Email',
            position: 'right',
          },
          {
            href: 'https://www.linkedin.com/in/lorenzo-cocchia/',
            label: 'LinkedIn',
            position: 'right',
          },
          {
            href: 'https://github.com/cocchialorenzo9',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `© ${new Date().getFullYear()} Lorenzo Cocchia`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
