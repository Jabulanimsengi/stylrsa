import { permanentRedirect } from 'next/navigation';

export default function AdminLegacyProfileRedirectPage() {
  permanentRedirect('/admin');
}
