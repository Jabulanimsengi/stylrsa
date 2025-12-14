'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { FaMapMarkerAlt, FaBriefcase, FaClock, FaCheckCircle, FaEnvelope, FaPhone } from 'react-icons/fa';

export default function CandidateDetailPage() {
    const params = useParams();
    const { user: currentUser } = useAuth();
    const [candidate, setCandidate] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showContact, setShowContact] = useState(false);

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                const res = await apiFetch(`/api/candidates/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setCandidate(data);
                }
            } catch (error) {
                console.error('Error fetching candidate:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchCandidate();
        }
    }, [params.id]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!candidate) return <div className="min-h-screen flex items-center justify-center">Candidate not found</div>;

    const { user, profession, province, city, yearsExperience, qualifications, specializations, questionnaireAnswers, portfolio } = candidate;
    const displayProfession = profession.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5"></div>
                    <div className="px-8 pb-8 relative">
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
                            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
                                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                                    {user.firstName.charAt(0)}
                                </div>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <div className="flex flex-wrap gap-4 mt-2 text-gray-600">
                                    <span className="flex items-center gap-1.5">
                                        <FaBriefcase className="text-primary" />
                                        {displayProfession}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <FaMapMarkerAlt className="text-primary" />
                                        {city}, {province}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <FaClock className="text-primary" />
                                        {yearsExperience} Years Experience
                                    </span>
                                </div>
                            </div>
                            <div>
                                {!showContact ? (
                                    <button
                                        onClick={() => setShowContact(true)}
                                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
                                    >
                                        View Contact Details
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        {user.email && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <FaEnvelope className="text-gray-400" />
                                                <a href={`mailto:${user.email}`} className="hover:text-primary">{user.email}</a>
                                            </div>
                                        )}
                                        {user.phoneNumber && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <FaPhone className="text-gray-400" />
                                                <a href={`tel:${user.phoneNumber}`} className="hover:text-primary">{user.phoneNumber}</a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-100 pt-8">
                            <div className="md:col-span-2 space-y-8">
                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">About & Qualifications</h2>
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="mb-4">
                                            <h3 className="font-medium text-gray-900 mb-2">Qualifications</h3>
                                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                                {qualifications.map((q: string, i: number) => (
                                                    <li key={i}>{q}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-2">Specializations</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {specializations.map((s: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Info</h2>
                                    <div className="space-y-6">
                                        {Object.entries(questionnaireAnswers).map(([key, value]: [string, any]) => {
                                            // Skip internal fields or empty values
                                            if (!value || key === 'yearsExperience') return null;

                                            // Format key to readable label
                                            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                                            return (
                                                <div key={key} className="border-b border-gray-100 pb-4 last:border-0">
                                                    <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
                                                    <p className="text-gray-800 whitespace-pre-wrap">
                                                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Availability</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                            <div>
                                                <span className="block text-sm font-medium text-gray-900">Available Days</span>
                                                <span className="text-sm text-gray-600">{candidate.availableDays?.join(', ') || 'Flexible'}</span>
                                            </div>
                                        </div>
                                        {candidate.urgentBookings && (
                                            <div className="flex items-start gap-3">
                                                <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                                <span className="text-sm text-gray-700">Available for urgent bookings</span>
                                            </div>
                                        )}
                                        {candidate.weekendsHolidays && (
                                            <div className="flex items-start gap-3">
                                                <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                                <span className="text-sm text-gray-700">Available weekends & holidays</span>
                                            </div>
                                        )}
                                        {candidate.willingToTravel && (
                                            <div className="flex items-start gap-3">
                                                <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                                <span className="text-sm text-gray-700">Willing to travel (Mobile)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Portfolio Preview */}
                                {portfolio && portfolio.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-4">Portfolio</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {portfolio.slice(0, 4).map((img: string, i: number) => (
                                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                                    <Image src={img} alt="Portfolio work" fill className="object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
