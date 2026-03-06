import Link from 'next/link';
import { Metadata } from 'next';
import LocationsFooter from '@/components/LocationsFooter';

export const metadata: Metadata = {
    title: 'Beauty Industry Jobs in South Africa | Stylr SA',
    description: 'Find hairdresser, nail technician, makeup artist, barber, and beauty professional jobs across South Africa. Browse vacancies or post your CV.',
    openGraph: {
        title: 'Beauty Industry Jobs in South Africa | Stylr SA',
        description: 'Find your dream job in the beauty industry. Browse hairdresser, nail tech, makeup artist, and spa jobs across South Africa.',
    },
};

const JOB_CATEGORIES = [
    { name: 'Hairdresser Jobs', slug: 'hairdresser', icon: '💇' },
    { name: 'Nail Technician Jobs', slug: 'nail-tech', icon: '💅' },
    { name: 'Makeup Artist Jobs', slug: 'makeup-artist', icon: '💄' },
    { name: 'Barber Jobs', slug: 'barber', icon: '✂️' },
    { name: 'Massage Therapist Jobs', slug: 'massage-therapist', icon: '💆' },
    { name: 'Esthetician Jobs', slug: 'esthetician', icon: '🧖' },
    { name: 'Lash Technician Jobs', slug: 'lash-technician', icon: '👁️' },
    { name: 'Brow Artist Jobs', slug: 'brow-artist', icon: '✨' },
    { name: 'Salon Manager Jobs', slug: 'salon-manager', icon: '👔' },
    { name: 'Spa Therapist Jobs', slug: 'spa-therapist', icon: '🌿' },
];

const PROVINCES = [
    { name: 'Gauteng', slug: 'gauteng' },
    { name: 'Western Cape', slug: 'western-cape' },
];

const POPULAR_CITIES = [
    { name: 'Johannesburg', slug: 'johannesburg' },
    { name: 'Cape Town', slug: 'cape-town' },
    { name: 'Pretoria', slug: 'pretoria' },
    { name: 'Sandton', slug: 'sandton' },
    { name: 'Soweto', slug: 'soweto' },
    { name: 'Centurion', slug: 'centurion' },
    { name: 'Midrand', slug: 'midrand' },
];

export default function JobsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Beauty Industry Jobs in South Africa
                    </h1>
                    <p className="text-xl text-gray-300 mb-8">
                        Find your dream job or hire talented beauty professionals
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link
                            href="/create-candidate-profile"
                            className="px-8 py-4 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors"
                        >
                            Upload Your CV
                        </Link>
                        <Link
                            href="/employers"
                            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                        >
                            Post a Job
                        </Link>
                    </div>
                </div>
            </div>

            {/* Browse by Job Type */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold mb-6">Browse Jobs by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {JOB_CATEGORIES.map((category) => (
                        <Link
                            key={category.slug}
                            href={`/jobs/${category.slug}/gauteng`}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow"
                        >
                            <span className="text-2xl mb-2 block">{category.icon}</span>
                            <span className="font-medium text-gray-900 text-sm">{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Browse by Province */}
            <div className="bg-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-2xl font-bold mb-6">Browse Jobs by Province</h2>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                        {PROVINCES.map((province) => (
                            <Link
                                key={province.slug}
                                href={`/jobs/hairdresser/${province.slug}`}
                                className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-medium text-gray-900">{province.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popular Cities */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold mb-6">Popular Cities</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {POPULAR_CITIES.map((city) => (
                        <Link
                            key={city.slug}
                            href={`/jobs/hairdresser/${city.slug}`}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                        >
                            <span className="font-medium text-gray-900">{city.name}</span>
                            <span className="block text-sm text-gray-500 mt-1">View all jobs</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* SEO Content */}
            <div className="bg-gray-100 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                        <h2 className="text-2xl font-bold mb-4">Find Beauty Jobs Near You</h2>
                        <p className="text-gray-600 mb-4">
                            Stylr SA is South Africa's leading platform for beauty industry jobs. Whether you're 
                            a hairdresser, nail technician, makeup artist, barber, or spa therapist, we connect 
                            you with top salons and spas across the country.
                        </p>
                        <p className="text-gray-600 mb-4">
                            Browse thousands of job listings in Johannesburg, Cape Town, Pretoria, Sandton, and
                            cities across Gauteng and the Western Cape. Find full-time positions, part-time work,
                            rent-a-chair opportunities, and freelance gigs.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h2 className="text-2xl font-bold mb-4">Hiring Beauty Professionals?</h2>
                        <p className="text-gray-600 mb-4">
                            Post your job listing and reach thousands of qualified beauty professionals. 
                            Browse our database of candidates with verified qualifications and portfolios.
                        </p>
                        <div className="flex gap-4 flex-wrap">
                            <Link 
                                href="/employers" 
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                            >
                                Post a Job
                            </Link>
                            <Link 
                                href="/candidates"
                                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                            >
                                Browse Candidates
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <LocationsFooter />
        </div>
    );
}
