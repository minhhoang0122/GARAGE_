export interface Supplier {
    id: number;
    supplierCode: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    taxCode?: string;
    notes?: string;
    active: boolean;
    createdAt?: string;
}

export interface CreateSupplierDto {
    supplierCode: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    taxCode?: string;
    notes?: string;
}
