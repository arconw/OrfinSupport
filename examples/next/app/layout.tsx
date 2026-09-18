import type { ReactNode } from 'react';
import { Assistant } from './assistant';

export const metadata = { title: 'OrfinSupport · Next.js example' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui',
          fontSize: 17,
          lineHeight: 1.65,
          margin: 0,
          padding: 'clamp(20px, 4vw, 40px)',
          background: '#f4f7fc',
          color: '#25334a',
        }}
      >
        {children}
        <Assistant />
      </body>
    </html>
  );
}
