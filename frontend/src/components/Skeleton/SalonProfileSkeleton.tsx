import { Skeleton, SkeletonGroup } from './Skeleton';

export default function SalonProfileSkeleton() {
  return (
    <div aria-hidden>
      <div
        style={{
          position: 'sticky',
          top: 'var(--app-shell-top-gap, 0px)',
          zIndex: 20,
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <Skeleton variant="button" style={{ width: 120, height: 40 }} />
          <Skeleton variant="button" style={{ width: 120, height: 40 }} />
          <Skeleton variant="text" style={{ flex: '1 1 240px', height: 36 }} />
          <Skeleton variant="circle" style={{ width: 44, height: 44 }} />
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        <Skeleton style={{ width: '100%', height: 420, borderRadius: '1rem', marginBottom: '2rem' }} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: '2rem',
          }}
        >
          <section>
            <Skeleton variant="text" style={{ width: '40%', height: 28, marginBottom: '1.5rem' }} />
            <SkeletonGroup count={6}>
              {(index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.9rem',
                    padding: '1.25rem',
                    marginBottom: '1rem',
                    display: 'grid',
                    gap: '0.75rem',
                  }}
                >
                  <Skeleton variant="text" style={{ width: '65%', height: 20 }} />
                  <Skeleton variant="text" style={{ width: '40%', height: 18 }} />
                  <Skeleton variant="button" style={{ width: '50%', height: 36 }} />
                </div>
              )}
            </SkeletonGroup>
          </section>

          <section>
            <Skeleton variant="text" style={{ width: '35%', height: 26, marginBottom: '1.25rem' }} />
            <SkeletonGroup count={3}>
              {(index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <Skeleton variant="text" style={{ width: '50%', height: 18 }} />
                  <Skeleton variant="text" style={{ width: '80%', height: 16, marginTop: '0.5rem' }} />
                  <Skeleton variant="text" style={{ width: '70%', height: 16, marginTop: '0.25rem' }} />
                </div>
              )}
            </SkeletonGroup>
          </section>
        </div>
      </div>
    </div>
  );
}
