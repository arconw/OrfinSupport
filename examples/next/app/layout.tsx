import type { ReactNode } from 'react';
import { Assistant } from './assistant';
import '@fontsource-variable/inter/wght.css';
import './assistant-typography.css';

export const metadata = { title: 'OrfinSupport · Next.js example' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "'Inter Variable', system-ui, sans-serif",
          fontSize: 17,
          fontWeight: 450,
          lineHeight: 1.65,
          margin: 0,
          padding: 'clamp(20px, 4vw, 40px)',
          background: '#f4f7fc',
          color: '#162235',
        }}
      >
        {children}
        <Assistant />
      </body>
    </html>
  );
}
