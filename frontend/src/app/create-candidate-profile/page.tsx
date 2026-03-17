import { permanentRedirect } from 'next/navigation';

export default function LegacyOnboardingRedirectPage() {
  permanentRedirect('/salons');
}
