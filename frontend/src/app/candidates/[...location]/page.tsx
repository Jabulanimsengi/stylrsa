import Link from 'next/link';
import { Metadata } from 'next';
import LocationsFooter from '@/components/LocationsFooter';

type Props = {
    params: Promise<{
        location: string[];
    }>;
};

function capitalize(str: string) {
    return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { location } = await params;
    const locationName = location[location.length - 1] ? capitalize(location[location.length - 1]) : 'South Africa';
    const province = location[0] ? capitalize(location[0]) : '';

    const title = province && location.length > 1
        ? `Beauty Professionals in ${locationName}, ${province} | Stylr SA`
        : `Beauty Professionals in ${locationName} | Stylr SA`;

    return {
        title,
        description: `Find skilled hairdressers, nail technicians, makeup artists, and beauty professionals in ${locationName}. Browse CVs and portfolios of talented candidates looking for work.`,
        openGraph: {
            title,
            description: `Discover talented beauty professionals in ${locationName}. View portfolios and hire the best candidates for your salon or spa.`,
        },
    };
}

export async function generateStaticParams() {
    // All candidate location pages generated on-demand for faster builds
    return [];
}

export default async function CandidatesLocationPage({ params }: Props) {
    const { location } = await params;
    const locationName = location[location.length - 1] ? capitalize(location[location.length - 1]) : 'South Africa';
    const province = location[0] ? capitalize(location[0]) : '';
    const isProvincePage = location.length === 1;

    const professions = [
        { name: 'Hairdressers', slug: 'hairdresser' },
        { name: 'Nail Technicians', slug: 'nail-tech' },
        { name: 'Makeup Artists', slug: 'makeup-artist' },
        { name: 'Barbers', slug: 'barber' },
        { name: 'Massage Therapists', slug: 'massage-therapist' },
        { name: 'Estheticians', slug: 'esthetician' },
        { name: 'Lash Technicians', slug: 'lash-technician' },
        { name: 'Brow Artists', slug: 'brow-artist' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                        Beauty Professionals in {locationName}
                    </h1>
                    <p className="text-xl text-pink-100 mb-8">
                        Find skilled and experienced beauty professionals ready to join your team
                        {isProvincePage ? ` across ${locationName}` : ` in ${locationName}, ${province}`}.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link
                            href="/employers"
                            className="px-6 py-3 bg-white text-pink-600 rounded-lg font-bold hover:bg-pink-50 transition-colors"
                        >
                            Post a Job
                        </Link>
                        <Link
                            href="/create-candidate-profile"
                            className="px-6 py-3 bg-pink-700 text-white rounded-lg font-bold hover:bg-pink-800 transition-colors"
                        >
                            Create Your Profile
                        </Link>
                    </div>
                </div>
            </div>

            {/* Browse by Profession */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold mb-6">Browse Candidates by Profession</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {professions.map((profession) => (
                        <Link
                            key={profession.slug}
                            href={`/candidates?profession=${profession.slug}&location=${location.join('/')}`}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow"
                        >
                            <span className="font-medium text-gray-900">{profession.name}</span>
                            <span className="block text-sm text-gray-500 mt-1">in {locationName}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* SEO Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                    <h2 className="text-2xl font-bold mb-4">Hire Beauty Professionals in {locationName}</h2>
                    <p className="text-gray-600 mb-4">
                        Looking to expand your salon or spa team in {locationName}? Stylr SA connects you with
                        qualified beauty professionals actively seeking new opportunities. Our database includes
                        experienced hairdressers, nail technicians, makeup artists, massage therapists, and more.
                    </p>
                    <p className="text-gray-600 mb-4">
                        Each candidate profile includes their qualifications, experience, portfolio, and availability.
                        Whether you need full-time staff, part-time help, or freelance professionals, find the
                        perfect match for your business.
                    </p>
                    <Link href="/candidates" className="text-pink-600 font-semibold hover:underline">
                        Browse All Candidates &rarr;
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-2xl font-bold mb-4">Looking for Work in {locationName}?</h2>
                    <p className="text-gray-600 mb-4">
                        Create your free candidate profile and get discovered by top salons and spas in {locationName}.
                        Upload your CV, showcase your portfolio, and let employers find you.
                    </p>
                    <div className="flex gap-4 flex-wrap">
                        <Link
                            href="/create-candidate-profile"
                            className="px-6 py-3 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors"
                        >
                            Create Your Profile
                        </Link>
                        <Link
                            href={`/jobs/${location.join('/')}`}
                            className="px-6 py-3 border border-pink-600 text-pink-600 rounded-lg font-bold hover:bg-pink-50 transition-colors"
                        >
                            Browse Jobs in {locationName}
                        </Link>
                    </div>
                </div>
            </div>

            <LocationsFooter />
        </div>
    );
}
