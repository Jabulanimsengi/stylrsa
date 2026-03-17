import { permanentRedirect } from 'next/navigation';

export default function LegacyCareersRedirectPage() {
  permanentRedirect('/salons');
}
