import HomePageClient from '@/app/HomePageClient';
import CommandSearch from '@/components/CommandSearch';

export default function TestSalonNavigationPage() {
  return (
    <main>
      <div style={{ padding: '1rem' }}>
        <CommandSearch />
      </div>
      <HomePageClient
        initialFeaturedSalons={[]}
        initialAllSalons={[]}
        initialAvailableNowSalons={[]}
        initialMobileSalons={[]}
      />
    </main>
  );
}
