import { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';

type Props = {
  params: Promise<{
    slug: string[];
  }>;
};

function capitalize(str: string) {
  return str.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = slug[slug.length - 1] ? capitalize(slug[slug.length - 1]) : 'South Africa';

  return {
    title: `Beauty Services in ${location} | Stylr SA`,
    description: `Discover beauty services in ${location} on Stylr SA.`,
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function LegacyJobsLocationRedirectPage({ params }: Props) {
  await params;
  permanentRedirect('/salons');
}
