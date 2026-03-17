import { redirect } from 'next/navigation';

type ServicesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const nextSearchParams = new URLSearchParams();

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => nextSearchParams.append(key, entry));
      return;
    }

    if (typeof value === 'string' && value.length > 0) {
      nextSearchParams.set(key, value);
    }
  });

  const queryString = nextSearchParams.toString();
  redirect(queryString ? `/salons?${queryString}` : '/salons');
}
