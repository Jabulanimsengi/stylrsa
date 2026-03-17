import { permanentRedirect } from 'next/navigation';

export default function LegacyTalentRedirectPage() {
  permanentRedirect('/salons');
}
