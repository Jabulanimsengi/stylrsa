import { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Beauty Services in South Africa | Stylr SA',
  description: 'Discover salons, barbers, and beauty professionals across South Africa.',
  openGraph: {
    title: 'Beauty Services in South Africa | Stylr SA',
    description: 'Discover salons, barbers, and beauty professionals across South Africa.',
  },
};

export default function LegacyJobsRedirectPage() {
  permanentRedirect('/salons');
}
