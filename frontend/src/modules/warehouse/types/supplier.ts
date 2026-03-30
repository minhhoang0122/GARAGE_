export interface Supplier {
    id: number;
    maNcc: string;
    tenNcc: string;
    phone?: string;
    email?: string;
    diaChi?: string;
    maSoThue?: string;
    ghiChu?: string;
    active: boolean;
    ngayTao?: string;
}

export interface CreateSupplierDto {
    maNcc: string;
    tenNcc: string;
    phone?: string;
    email?: string;
    diaChi?: string;
    maSoThue?: string;
    ghiChu?: string;
}
