import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';

export default function TestSalonProfilePage() {
  return (
    <main
      data-testid="test-salon-profile-page"
      style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem 4rem' }}
    >
      <section style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: '24px', overflow: 'hidden' }}>
          <OptimizedImage
            src="/art_one.webp"
            alt="Smoke Test Studio hero"
            fill
            eager
            sizes="(max-width: 768px) 100vw, 960px"
            style={{ objectFit: 'cover' }}
          />
        </div>

        <div>
          <p style={{ margin: 0, color: '#8a4a2a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Salon detail smoke harness</p>
          <h1 style={{ margin: '0.5rem 0' }}>Smoke Test Studio</h1>
          <p style={{ margin: 0, color: '#5f564f' }}>42 Test Avenue, Rosebank, Johannesburg</p>
        </div>

        <section>
          <h2>Services</h2>
          <ul>
            <li>Silk Press</li>
            <li>Knotless Braids</li>
          </ul>
        </section>

        <section>
          <h2>Reviews</h2>
          <p>Fast, clean, and consistent service.</p>
        </section>
      </section>
    </main>
  );
}
