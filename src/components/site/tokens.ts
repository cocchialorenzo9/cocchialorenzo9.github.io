// Palette of the redesigned home and projects pages (light only).
export const C = {
  ink: '#141414',
  paper: '#F6F5F1',
  white: '#FFFFFF',
  accent: '#2D46F5',
  orange: '#FF5B2E',
  burnt: '#E2461A',
  rust: '#C2410C',
  green: '#1E7A5A',
  mint: '#B9F0D8',
  lilac: '#D9CCFF',
  yellow: '#FFE07A',
  peach: '#FFC59E',
  sky: '#C9DBFF',
} as const;

export type Tone = keyof typeof C;
