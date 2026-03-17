import { permanentRedirect } from 'next/navigation';

export default function LegacyProfileRedirectPage() {
  permanentRedirect('/salons');
}
