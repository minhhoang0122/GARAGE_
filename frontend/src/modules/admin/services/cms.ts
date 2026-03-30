import { api } from '@/lib/api';
import { BlogPost, LandingSection, Announcement } from '@/modules/landing/types/cms';

export const adminCmsService = {
    // Blog API
    getBlogPosts: async (): Promise<BlogPost[]> => {
        return await api.get('/admin/cms/blog');
    },

    getBlogPost: async (id: string | number): Promise<BlogPost> => {
        return await api.get(`/admin/cms/blog/${id}`);
    },

    createBlogPost: async (data: Partial<BlogPost>): Promise<BlogPost> => {
        return await api.post('/admin/cms/blog', data);
    },

    updateBlogPost: async (id: string | number, data: Partial<BlogPost>): Promise<BlogPost> => {
        return await api.put(`/admin/cms/blog/${id}`, data);
    },

    deleteBlogPost: async (id: string | number): Promise<void> => {
        return await api.delete(`/admin/cms/blog/${id}`);
    },

    // Landing API
    getLandingSections: async (): Promise<LandingSection[]> => {
        return await api.get('/admin/cms/landing');
    },

    updateLandingSection: async (section: LandingSection): Promise<LandingSection> => {
        return await api.post('/admin/cms/landing', section);
    },

    // Announcements API
    getAnnouncements: async (): Promise<Announcement[]> => {
        return await api.get('/admin/cms/announcements');
    },

    getAnnouncement: async (id: string | number): Promise<Announcement> => {
        return await api.get(`/admin/cms/announcements/${id}`);
    },

    createAnnouncement: async (data: Partial<Announcement>): Promise<Announcement> => {
        return await api.post('/admin/cms/announcements', data);
    },

    updateAnnouncement: async (id: string | number, data: Partial<Announcement>): Promise<Announcement> => {
        return await api.put(`/admin/cms/announcements/${id}`, data);
    },

    deleteAnnouncement: async (id: string | number): Promise<void> => {
        return await api.delete(`/admin/cms/announcements/${id}`);
    }
};
