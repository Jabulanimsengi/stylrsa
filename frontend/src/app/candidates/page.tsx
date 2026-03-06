'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import CandidateCard from '@/components/CandidateCard';
import { FaSearch, FaFilter } from 'react-icons/fa';

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [profession, setProfession] = useState('');
    const [province, setProvince] = useState('');
    const [city, setCity] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCandidates = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (profession) queryParams.append('profession', profession);
            if (province) queryParams.append('province', province);
            if (city) queryParams.append('city', city);
            if (searchTerm) queryParams.append('search', searchTerm);

            const res = await apiFetch(`/api/candidates?${queryParams.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setCandidates(data);
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [profession, province, city]); // Auto-refetch on filter change

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCandidates();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Hero */}
            <div className="bg-white border-b border-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Talented Professionals</h1>
                    <p className="text-xl text-gray-600 max-w-2xl">
                        Browse profiles of skilled hairdressers, nail technicians, and massage therapists looking for new opportunities.
                    </p>

                    {/* Search Bar */}
                    <div className="mt-8 max-w-2xl">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search by keyword, skill, or qualification..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                                <FaFilter className="text-primary" />
                                <span>Filters</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Profession</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary"
                                        value={profession}
                                        onChange={(e) => setProfession(e.target.value)}
                                    >
                                        <option value="">All Professions</option>
                                        <option value="HAIRDRESSER">Hairdresser / Hair Stylist</option>
                                        <option value="NAIL_TECH">Nail Technician</option>
                                        <option value="MASSAGE_THERAPIST">Massage Therapist</option>
                                        <option value="MAKEUP_ARTIST">Makeup Artist</option>
                                        <option value="BARBER">Barber</option>
                                        <option value="ESTHETICIAN">Esthetician</option>
                                        <option value="LASH_TECH">Lash Technician</option>
                                        <option value="BROW_ARTIST">Brow Artist</option>
                                        <option value="SPA_THERAPIST">Spa Therapist</option>
                                        <option value="SALON_MANAGER">Salon Manager</option>
                                        <option value="RECEPTIONIST">Receptionist</option>
                                        <option value="BEAUTY_THERAPIST">Beauty Therapist</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Province</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary"
                                        value={province}
                                        onChange={(e) => setProvince(e.target.value)}
                                    >
                                        <option value="">All Provinces</option>
                                        <option value="Gauteng">Gauteng</option>
                                        <option value="Western Cape">Western Cape</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Cape Town"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        setProfession('');
                                        setProvince('');
                                        setCity('');
                                        setSearchTerm('');
                                    }}
                                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 underline"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : candidates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {candidates.map((candidate) => (
                                    <CandidateCard key={candidate.id} candidate={candidate} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                                <div className="text-4xl mb-4">🔍</div>
                                <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
                                <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
