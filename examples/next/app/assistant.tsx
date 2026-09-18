'use client';

import { OrfinSupport, useOrfin } from 'orfinsupport/react';
import { useRouter } from 'next/navigation';
import { supportedLocales } from 'orfinsupport';
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
    >
      <LanguagePicker />
    </OrfinSupport>
  );
}

function LanguagePicker() {
  const { locale, setLocale } = useOrfin();
  return (
    <label>
      Example language{' '}
      <select
        style={{ font: 'inherit', maxWidth: '100%' }}
        aria-label="Example language"
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
      >
        {supportedLocales.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
