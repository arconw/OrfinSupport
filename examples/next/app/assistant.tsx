'use client';

import { OrfinSupport } from 'orfinsupport/react';
import { useRouter } from 'next/navigation';
import { sections } from './sections';

export function Assistant() {
  const router = useRouter();
  return (
    <OrfinSupport
      options={{
        endpoint: '/api/orfin',
        sections,
        initiallyOpen: true,
        navigate: (path) => router.push(path),
        allowedPaths: ['/', '/projects'],
        features: { hoverHelp: false },
      }}
    />
  );
}
