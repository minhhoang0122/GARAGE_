import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCmsService } from '../services/cms';
import { useToast } from '@/contexts/ToastContext';
import { BlogPost, LandingSection, Announcement } from '@/modules/landing/types/cms';

export const useBlogPosts = () => {
    return useQuery({
        queryKey: ['admin-blog-posts'],
        queryFn: adminCmsService.getBlogPosts
    });
};

export const useBlogPost = (id: string | number) => {
    return useQuery({
        queryKey: ['admin-blog-post', id],
        queryFn: () => adminCmsService.getBlogPost(id),
        enabled: !!id
    });
};

export const useCreateBlogPost = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: adminCmsService.createBlogPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
            showToast('success', 'Đã tạo bài viết mới');
        },
        onError: () => {
            showToast('error', 'Lỗi khi tạo bài viết');
        }
    });
};

export const useUpdateBlogPost = (id: string | number) => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: (data: Partial<BlogPost>) => adminCmsService.updateBlogPost(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
            queryClient.invalidateQueries({ queryKey: ['admin-blog-post', id] });
            showToast('success', 'Đã cập nhật bài viết');
        },
        onError: () => {
            showToast('error', 'Lỗi khi cập nhật bài viết');
        }
    });
};

export const useDeleteBlogPost = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: adminCmsService.deleteBlogPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
            showToast('success', 'Đã xóa bài viết');
        },
        onError: () => {
            showToast('error', 'Lỗi khi xóa bài viết');
        }
    });
};

export const useLandingSections = () => {
    return useQuery({
        queryKey: ['admin-landing-sections'],
        queryFn: adminCmsService.getLandingSections
    });
};

export const useUpdateLandingSection = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: adminCmsService.updateLandingSection,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-landing-sections'] });
            showToast('success', 'Đã cập nhật cấu trúc trang chủ');
        },
        onError: () => {
            showToast('error', 'Lỗi khi cập nhật cấu trúc trang chủ');
        }
    });
};

// Announcements
export const useAnnouncements = () => {
    return useQuery({
        queryKey: ['admin-announcements'],
        queryFn: adminCmsService.getAnnouncements
    });
};

export const useAnnouncement = (id: string | number) => {
    return useQuery({
        queryKey: ['admin-announcement', id],
        queryFn: () => adminCmsService.getAnnouncement(id),
        enabled: !!id
    });
};

export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: adminCmsService.createAnnouncement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            showToast('success', 'Đã tạo bản tin mới');
        },
        onError: () => {
            showToast('error', 'Lỗi khi tạo bản tin');
        }
    });
};

export const useUpdateAnnouncement = (id: string | number) => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: (data: Partial<Announcement>) => adminCmsService.updateAnnouncement(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            queryClient.invalidateQueries({ queryKey: ['admin-announcement', id] });
            showToast('success', 'Đã cập nhật bản tin');
        },
        onError: () => {
            showToast('error', 'Lỗi khi cập nhật bản tin');
        }
    });
};

export const useDeleteAnnouncement = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: adminCmsService.deleteAnnouncement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            showToast('success', 'Đã xóa bản tin');
        },
        onError: () => {
            showToast('error', 'Lỗi khi xóa bản tin');
        }
    });
};
