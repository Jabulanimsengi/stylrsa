import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocationsFooter from '@/components/LocationsFooter';

type Props = {
    params: Promise<{
        slug: string[];
    }>;
};

function capitalize(str: string) {
    return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const role = slug[0] ? capitalize(slug[0]) : 'Beauty Professional';
    const location = slug[slug.length - 1] ? capitalize(slug[slug.length - 1]) : 'South Africa';

    return {
        title: `${role} Jobs in ${location} | Stylr SA`,
        description: `Find the best ${role} vacancies in ${location}. Apply for top salon jobs or find freelance opportunities near you.`,
    };
}

export async function generateStaticParams() {
    // All job pages generated on-demand for faster builds
    return [];
}

export default async function DynamicJobPage({ params }: Props) {
    const { slug } = await params;

    // Basic parsing logic
    // /jobs/nail-tech/sandton -> role: nail-tech, location: sandton
    // /jobs/hairdresser/braiding/pretoria -> role: hairdresser, skill: braiding, location: pretoria

    const role = slug[0] ? capitalize(slug[0]) : 'Beauty Professional';
    const location = slug.length > 1 ? capitalize(slug[slug.length - 1]) : 'South Africa';
    const skill = slug.length > 2 ? capitalize(slug[1]) : null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Dynamic Hero */}
            <div className="bg-gray-900 text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                        {skill ? `${skill} ` : ''}{role} Jobs in {location}
                    </h1>
                    <p className="text-xl text-gray-300 mb-8">
                        Find the best opportunities for {role}s in {location}.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/create-candidate-profile"
                            className="px-6 py-3 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors"
                        >
                            Upload CV
                        </Link>
                        <Link
                            href="/employers"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                        >
                            Post a Job
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                    <h2 className="text-2xl font-bold mb-4">Are you a {role} looking for work in {location}?</h2>
                    <p className="text-gray-600 mb-4">
                        Stylr SA connects you with top salons and spas in {location}. Whether you are looking for full-time employment, rent-a-chair opportunities, or freelance gigs, we have the right role for you.
                    </p>
                    <p className="text-gray-600">
                        <strong>Popular searches in {location}:</strong> {role} vacancies, {role} salary, freelance {role} jobs.
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-2xl font-bold mb-4">Hiring a {role} in {location}?</h2>
                    <p className="text-gray-600 mb-4">
                        Browse our database of verified {role}s in {location}. View portfolios, check availability, and hire the best talent for your business.
                    </p>
                    <Link href="/admin/candidates" className="text-blue-600 font-semibold hover:underline">
                        Search {role} CVs in {location} &rarr;
                    </Link>
                </div>
            </div>

            <LocationsFooter />
        </div>
    );
}
