import Link from 'next/link';

export default function Page() {
  return (
    <main>
      <section
        data-orfin-section="next-welcome"
        style={{ maxWidth: 700, padding: 32, background: 'white', borderRadius: 20 }}
      >
        <h1>Orfin, at home in Next.js.</h1>
        <p>
          A server rendered page, an interactive guide, and a backend that keeps your provider
          configuration on the server.
        </p>
        <Link href="/projects">Open projects</Link>
      </section>
    </main>
  );
}
