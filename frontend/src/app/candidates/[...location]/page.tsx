import { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';

type Props = {
  params: Promise<{
    location: string[];
  }>;
};

function capitalize(str: string) {
  return str.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const locationName = location[location.length - 1] ? capitalize(location[location.length - 1]) : 'South Africa';
  const province = location[0] ? capitalize(location[0]) : '';
  const title = province && location.length > 1
    ? `Beauty Services in ${locationName}, ${province} | Stylr SA`
    : `Beauty Services in ${locationName} | Stylr SA`;

  return {
    title,
    description: `Discover trusted salons and beauty services in ${locationName} on Stylr SA.`,
    openGraph: {
      title,
      description: `Browse trusted salons and beauty services in ${locationName}.`,
    },
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function LegacyLocationRedirectPage({ params }: Props) {
  await params;
  permanentRedirect('/salons');
}
