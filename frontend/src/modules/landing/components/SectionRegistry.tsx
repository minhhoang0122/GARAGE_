'use client';

import React from 'react';
import HeroSection from './sections/HeroSection';
import IntroSection from './sections/IntroSection';
import ProcessSection from './sections/ProcessSection';
import FacilitiesSection from './sections/FacilitiesSection';
import BlogSection from './sections/BlogSection';
import SocialProofSection from './sections/SocialProofSection';
import CTASection from './sections/CTASection';
import AnnouncementSection from './sections/AnnouncementSection';
import StatsSection from './sections/StatsSection';
import TeamSection from './sections/TeamSection';
import MapSection from './sections/MapSection';
import { BlogPost, Announcement } from '@/modules/landing/types/cms';

export const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
    'hero': HeroSection,
    'intro': IntroSection,
    'process': ProcessSection,
    'facilities': FacilitiesSection,
    'blog': BlogSection,
    'social_proof': SocialProofSection,
    'cta': CTASection,
    'announcement': AnnouncementSection,
    'stats': StatsSection,
    'team': TeamSection,
    'map': MapSection
};

interface SectionRegistryProps {
    sectionId: string;
    title?: string;
    content?: string;
    imageUrl?: string;
    // Shared Global Data
    status: string;
    isStaff: boolean;
    hotServices: any[];
    recentPosts: BlogPost[];
    announcements: Announcement[];
    // Hero specific

    trackingPlate: string;
    setTrackingPlate: (val: string) => void;
    handleTrack: (e: React.FormEvent) => void;
    isTracking: boolean;
    trackError: string;
    trackingResult: any;
}

export default function SectionRegistry({
    sectionId,
    title,
    content,
    imageUrl,
    ...props
}: SectionRegistryProps) {
    const Component = SECTION_COMPONENTS[sectionId];

    if (!Component) {
        console.warn(`Section component not found for ID: ${sectionId}`);
        return null;
    }

    // Map props based on section requirements
    const componentProps: any = {
        title,
        content,
        imageUrl,
        ...props
    };

    return <Component {...componentProps} />;
}
