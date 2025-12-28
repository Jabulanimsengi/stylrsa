'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface CandidateCardProps {
    candidate: {
        id: string;
        user: {
            firstName: string;
            lastName?: string;
        };
        profession: string;
        province: string;
        city: string;
        yearsExperience: number;
        specializations: string[];
        qualifications: string[];
        portfolio: string[];
    };
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
    const { user, profession, province, city, yearsExperience, specializations, portfolio } = candidate;

    // Format profession for display
    const displayProfession = profession.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

    return (
        <Link href={`/candidates/${candidate.id}`} className="block group">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
                {/* Portfolio Preview */}
                <div className="h-48 relative overflow-hidden bg-muted">
                    {portfolio && portfolio.length > 0 ? (
                        <Image
                            src={portfolio[0]}
                            alt={`${user.firstName}'s work`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <span className="text-sm">No portfolio images</span>
                        </div>
                    )}
                    <Badge className="absolute top-3 right-3 bg-white/90 text-foreground hover:bg-white">
                        {yearsExperience} {yearsExperience === 1 ? 'Year' : 'Years'} Exp.
                    </Badge>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                                {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-primary font-medium text-sm">{displayProfession}</p>
                        </div>
                    </div>

                    <div className="flex items-center text-muted-foreground text-sm mb-3">
                        <FaMapMarkerAlt className="mr-1.5" />
                        <span>{city}, {province}</span>
                    </div>

                    <div className="mt-auto">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {specializations.slice(0, 3).map((spec, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {spec}
                                </Badge>
                            ))}
                            {specializations.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{specializations.length - 3} more
                                </Badge>
                            )}
                        </div>

                        <div className="pt-3 border-t flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">View full profile</span>
                            <FaArrowRight className="text-primary text-sm group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
