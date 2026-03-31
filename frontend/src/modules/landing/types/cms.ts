export interface LandingSection {
    id?: number;
    sectionId: string; // Unique ID like "hero-main"
    title: string;
    content: any; // Can be string (from JSON) or parsed object
    imageUrl?: string;
    orderIndex: number;
    isActive: boolean;
}

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnailUrl: string;
    status: 'DRAFT' | 'PUBLISHED';
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface Announcement {
    id: number;
    title: string;
    slug: string;
    summary: string;
    content: string;
    thumbnailUrl?: string;
    type: 'INFO' | 'URGENT' | 'PROMO' | 'IMPORTANT';
    isPinned: boolean;
    isActive: boolean;
    publishedAt: string;
    expiredAt?: string;
    createdAt: string;
}


// Specific content shapes to match existing UI
export interface HeroContent {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    backgroundImage: string;
    stats?: { label: string; value: string }[];
}

export interface ServiceItem {
    title: string;
    icon: string;
    description: string;
}

export interface ServicesContent {
    title: string;
    description: string;
    items: ServiceItem[];
}
