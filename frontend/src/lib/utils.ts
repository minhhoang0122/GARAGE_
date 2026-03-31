import { type ClassValue } from "clsx";
import { clsx } from "clsx";

// Simplified cn without tailwind-merge to avoid dependency issues
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

export const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN');
};

export function formatFullName(name: string | undefined | null) {
    if (!name) return '';
    return name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Chuẩn hóa thông tin nhân sự (Họ tên, Avatar) từ bất kỳ object User/Staff nào.
 * Đảm bảo hiển thị đồng nhất với Sidebar và các module khác.
 */
export function normalizePersonnel(u: any) {
    if (!u) return { name: '', avatar: null, id: null };

    // Trường hợp đầu vào là chuỗi (API trả về thẳng tên thay vì object)
    if (typeof u === 'string') {
        return { name: formatFullName(u), avatar: null, id: null };
    }

    // 1. Trích xuất ID
    const id = u.id || u.ID || u.userId || u.staffId || u.id_user || null;

    // 2. Trích xuất Họ Tên
    let nameData = '';

    // Ưu tiên các trường ghép hoặc trường tên đầy đủ phổ biến
    const lastName = u.LastName || u.lastName || u.Ho || u.ho || '';
    const firstName = u.FirstName || u.firstName || u.Ten || u.ten || '';
    
    if (lastName || firstName) {
        nameData = `${lastName} ${firstName}`.trim();
    }

    // Nếu không có, thử các trường có sẵn (Việt & Anh)
    if (!nameData) {
        nameData = 
            u.fullName || u.FullName || u.hoTen || u.HoTen || 
            u.tenNhanVien || u.TenNhanVien || u.displayName || u.DisplayName || 
            u.name || u.Name || u.user_name || u.UserName || u.ho_ten;
    }
    
    // Cuối cùng dùng username hoặc email
    if (!nameData) {
        nameData = u.username || u.Username || u.email?.split('@')[0] || '';
    }

    // 3. Trích xuất Avatar
    const avatarData = u.avatar || u.Avatar || u.anhDaiDien || u.AnhDaiDien || u.hinhAnh || u.HinhAnh || u.image || u.Image || u.user_image || null;

    return {
        id,
        name: formatFullName(nameData),
        avatar: avatarData,
    };
}
