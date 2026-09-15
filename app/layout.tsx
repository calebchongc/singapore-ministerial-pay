import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'What is in the pay packet? | Singapore ministerial salaries',
  description: 'Explore Singapore ministerial salary frameworks, fixed pay and bonuses. An independent interactive explainer with sourced calculations.',
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en-SG"><body>{children}</body></html>;
}
