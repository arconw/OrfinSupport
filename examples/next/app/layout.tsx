import type { ReactNode } from 'react';
import { Assistant } from './assistant';

export const metadata = { title: 'OrfinSupport · Next.js example' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{ fontFamily: 'system-ui', padding: 40, background: '#f4f7fc', color: '#25334a' }}
      >
        {children}
        <Assistant />
      </body>
    </html>
  );
}
