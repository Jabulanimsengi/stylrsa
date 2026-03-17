import { permanentRedirect } from 'next/navigation';

export default function AdminLegacyRedirectPage() {
  permanentRedirect('/admin');
}
