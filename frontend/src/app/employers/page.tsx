import { permanentRedirect } from 'next/navigation';

export default function LegacyEmployersRedirectPage() {
  permanentRedirect('/create-salon');
}
