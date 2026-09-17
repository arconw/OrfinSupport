import Link from 'next/link';

export default function Projects() {
  return (
    <main>
      <section
        data-orfin-section="next-projects"
        style={{ maxWidth: 700, padding: 32, background: 'white', borderRadius: 20 }}
      >
        <h1>Next.js projects</h1>
        <p>Your assistant followed the router and found this section.</p>
        <Link href="/">Back to overview</Link>
      </section>
    </main>
  );
}
