'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';
import { toast } from 'react-toastify';
import CandidateQuestionnaire from '@/components/CandidateQuestionnaire';

export default function CreateCandidateProfile() {
    const router = useRouter();
    const { user, authStatus } = useAuth();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Profession type
    type Profession = 
        | 'HAIRDRESSER' 
        | 'NAIL_TECH' 
        | 'MASSAGE_THERAPIST'
        | 'MAKEUP_ARTIST'
        | 'BARBER'
        | 'ESTHETICIAN'
        | 'LASH_TECH'
        | 'BROW_ARTIST'
        | 'SPA_THERAPIST'
        | 'SALON_MANAGER'
        | 'RECEPTIONIST'
        | 'BEAUTY_THERAPIST';

    // Form State
    const [profession, setProfession] = useState<Profession>('HAIRDRESSER');
    const [province, setProvince] = useState('');
    const [city, setCity] = useState('');
    const [willingToTravel, setWillingToTravel] = useState(false);

    // All professions available
    const PROFESSIONS = [
        { value: 'HAIRDRESSER', label: 'Hairdresser / Hair Stylist' },
        { value: 'NAIL_TECH', label: 'Nail Technician' },
        { value: 'MASSAGE_THERAPIST', label: 'Massage Therapist' },
        { value: 'MAKEUP_ARTIST', label: 'Makeup Artist' },
        { value: 'BARBER', label: 'Barber' },
        { value: 'ESTHETICIAN', label: 'Esthetician / Skincare Specialist' },
        { value: 'LASH_TECH', label: 'Lash Technician' },
        { value: 'BROW_ARTIST', label: 'Brow Artist' },
        { value: 'SPA_THERAPIST', label: 'Spa Therapist' },
        { value: 'SALON_MANAGER', label: 'Salon Manager' },
        { value: 'RECEPTIONIST', label: 'Salon Receptionist' },
        { value: 'BEAUTY_THERAPIST', label: 'Beauty Therapist' },
    ];

    // All provinces (service areas)
    const PROVINCES = [
        'Gauteng',
        'Western Cape',
    ];

    // Privacy Settings
    const [showFirstName, setShowFirstName] = useState(true);
    const [showLastName, setShowLastName] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const [showPhone, setShowPhone] = useState(false);

    // CV Upload
    const [cvFile, setCvFile] = useState<File | null>(null);

    useEffect(() => {
        if (authStatus !== 'loading' && authStatus !== 'authenticated') {
            router.push('/');
        }
    }, [authStatus, router]);

    const handleQuestionnaireComplete = async (answers: any) => {
        setIsSubmitting(true);

        try {
            // Upload CV first if exists
            let uploadedCvUrl = null;
            if (cvFile) {
                const formData = new FormData();
                formData.append('file', cvFile);

                const uploadRes = await apiFetch('/api/candidates/upload-cv', {
                    method: 'POST',
                    body: formData,
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    // The backend updates the candidate record directly with the CV URL if the candidate exists.
                    // However, here we are CREATING a new candidate.
                    // So we might need to adjust the flow:
                    // 1. Create Candidate
                    // 2. Upload CV (which updates the candidate)
                    // OR
                    // 1. Upload CV to a generic endpoint (or get a signed URL)
                    // 2. Pass URL to create endpoint

                    // Given the current backend implementation:
                    // `uploadCv` expects a user to already have a candidate profile (it does `prisma.candidate.findUnique`).
                    // So we must Create Profile FIRST, then Upload CV.
                } else {
                    console.error('CV upload failed');
                    toast.warning('Failed to upload CV, but proceeding with profile creation.');
                }
            }

            // Extract special fields from answers to map to DTO top-level fields
            const {
                yearsExperience,
                qualifications,
                previousWorkplaces,
                specializations,
                availableDays,
                availableTimes,
                urgentBookings,
                weekendsHolidays,
                ...otherAnswers
            } = answers;

            const payload = {
                profession,
                province,
                city,
                willingToTravel,
                yearsExperience: parseInt(yearsExperience) || 0,
                qualifications: qualifications ? qualifications.split('\n') : [],
                previousWorkplaces: previousWorkplaces ? previousWorkplaces.split('\n') : [],
                specializations: specializations ? specializations.split('\n') : [],
                availableDays: availableDays || [],
                availableTimes,
                urgentBookings,
                weekendsHolidays,
                questionnaireAnswers: otherAnswers,
                showFirstName,
                showLastName,
                showEmail,
                showPhone,
                portfolio: []
            };

            // 1. Create Profile
            const res = await apiFetch('/api/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                // 2. Upload CV if exists
                if (cvFile) {
                    const formData = new FormData();
                    formData.append('file', cvFile);
                    try {
                        await apiFetch('/api/candidates/upload-cv', {
                            method: 'POST',
                            body: formData,
                        });
                    } catch (err) {
                        console.error('Error uploading CV after profile creation:', err);
                        toast.warning('Profile created, but CV upload failed.');
                    }
                }

                toast.success('Profile created successfully!');
                router.push('/candidates/me');
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to create profile');
            }
        } catch (error) {
            console.error('Error creating profile:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authStatus === 'loading') return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Your Job Seeker Profile</h1>
                    <p className="mt-2 text-gray-600">Complete your profile to get discovered by salons and clients.</p>
                </div>

                {step === 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">What is your profession?</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {PROFESSIONS.map((p) => (
                                        <div
                                            key={p.value}
                                            onClick={() => setProfession(p.value as Profession)}
                                            className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${profession === p.value
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="font-medium text-gray-900 text-sm">
                                                {p.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={province}
                                        onChange={(e) => setProvince(e.target.value)}
                                    >
                                        <option value="">Select Province</option>
                                        {PROVINCES.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City / Town</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="e.g. Sandton"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={willingToTravel}
                                        onChange={(e) => setWillingToTravel(e.target.checked)}
                                        className="rounded text-primary focus:ring-primary"
                                    />
                                    <span className="text-gray-700">I am willing to travel for work (Mobile Services)</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload CV / Resume (PDF)</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                                <p className="text-xs text-gray-500 mt-1">Optional. Uploading a CV helps admins verify your profile.</p>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
                                <p className="text-sm text-gray-500 mb-4">Control what information is visible on your public profile.</p>

                                <div className="space-y-3">
                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-700">Show First Name</span>
                                        <input type="checkbox" checked={showFirstName} onChange={(e) => setShowFirstName(e.target.checked)} className="rounded text-primary focus:ring-primary" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-700">Show Last Name</span>
                                        <input type="checkbox" checked={showLastName} onChange={(e) => setShowLastName(e.target.checked)} className="rounded text-primary focus:ring-primary" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-700">Show Email Address</span>
                                        <input type="checkbox" checked={showEmail} onChange={(e) => setShowEmail(e.target.checked)} className="rounded text-primary focus:ring-primary" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-700">Show Phone Number</span>
                                        <input type="checkbox" checked={showPhone} onChange={(e) => setShowPhone(e.target.checked)} className="rounded text-primary focus:ring-primary" />
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => {
                                        if (!province || !city) {
                                            toast.error('Please select your location');
                                            return;
                                        }
                                        setStep(2);
                                        window.scrollTo(0, 0);
                                    }}
                                    className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Continue to Questionnaire
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <CandidateQuestionnaire
                        profession={profession}
                        onComplete={handleQuestionnaireComplete}
                    />
                )}
            </div>
        </div>
    );
}
