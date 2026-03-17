import { permanentRedirect } from 'next/navigation';

export default function LegacyDirectoryRedirectPage() {
  permanentRedirect('/salons');
}
