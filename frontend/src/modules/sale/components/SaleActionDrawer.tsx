import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, User, Calendar, Car, Clock, CreditCard, Banknote, 
    CheckCircle2, ArrowRight, Plus, Minus, Trash2, 
    ChevronRight, X, History, Package, Zap, QrCode, Gauge, Fuel, 
    ClipboardCheck, Hammer, Settings2, ShieldAlert, Sparkles, PlusCircle,
    Phone, Tag, Percent, FileText, Wrench, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { receptionApi, saleApi, transactionApi, productApi, mechanicApi } from '@/api';
import { useOrderDetail, useSearchProducts, useAddOrderItem, useUpdateOrderItem, useRemoveOrderItem } from '../hooks/useSale';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';

// --- DESIGN SYSTEM CSS ---
const PosStyles = () => (
    <style dangerouslySetInnerHTML={{ __html: `
        .pos-layout {
            display: grid;
            grid-template-columns: 30% 30% 40%;
            height: 100%;
            overflow: hidden;
        }
        .pos-col {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border-right: 1px solid rgba(255,255,255,0.06);
        }
        .pos-col:last-child { border-right: none; }
        .pos-col-header {
            padding: 20px 24px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            flex-shrink: 0;
        }
        .pos-col-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px 24px;
        }
        .pos-col-footer {
            padding: 20px 24px;
            border-top: 1px solid rgba(255,255,255,0.06);
            flex-shrink: 0;
        }
        .pos-section-title {
            font-size: 14px;
            font-weight: 800;
            color: #A5F3FC; /* Cyan 300 - Sáng hơn Sky 400 để tăng tương phản */
            text-transform: uppercase;
            letter-spacing: 0.8px;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px dashed rgba(255, 255, 255, 0.15);
        }
        .pos-card {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 14px 16px;
            cursor: pointer;
            transition: all 0.25s ease;
        }
        .pos-card:hover {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.15);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px -6px rgba(0,0,0,0.5);
        }
        .pos-card:active { transform: scale(0.98); }
        .pos-card-service { border-left: 3px solid #3B82F6; }
        .pos-card-part { border-left: 3px solid #10B981; }
        .pos-input {
            width: 100%;
            height: 44px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 0 14px;
            color: white;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }
        .pos-input:focus { border-color: #3B82F6; }
        .pos-input::placeholder { color: rgba(255,255,255,0.3); }
        .pos-chip {
            padding: 6px 14px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.85);
            white-space: nowrap;
        }
        .pos-chip-active {
            background: #3B82F6;
            border-color: #3B82F6;
            color: white;
        }
        .pos-scrollbar::-webkit-scrollbar { width: 4px; }
        .pos-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .pos-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .pos-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .pos-badge-amber { background: rgba(245,158,11,0.15); color: #F59E0B; }
        .pos-badge-green { background: rgba(34,197,94,0.15); color: #22C55E; }
        .pos-badge-blue { background: rgba(59,130,246,0.15); color: #3B82F6; }
        .shimmer-bar {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
            background-size: 200% 100%;
            animation: shimmer 2s infinite linear;
        }
        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `}} />
);

// --- INTERFACES ---
interface VehicleInfo {
    licensePlate: string;
    brand?: string;
    model?: string;
    odo?: number;
}

interface CustomerInfo {
    id: string | number;
    fullName: string;
    phone: string;
}

interface OrderItem {
    id: string | number;
    productId?: number;
    name?: string;
    itemName?: string;
    quantity: number;
    price: number;
    unit?: string;
    isService?: boolean;
    discountPercent?: number;
    vatPercent?: number;
    technicianId?: number;
    technicianName?: string;
    oldPartAction?: 'RETURN_TO_CUSTOMER' | 'KEEP_IN_GARAGE' | 'DISCARD';
    note?: string;
    version?: number;
}

interface SaleActionDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'reception' | 'checkout' | 'history' | 'order_detail';
    data?: any;
    onSuccess?: () => void;
}

// --- FILTER CATEGORIES ---
const FILTER_CATS = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'SERVICE', label: 'Dịch vụ' },
    { key: 'INVENTORY', label: 'Phụ tùng' },
    { key: 'MAINTENANCE', label: 'Bảo dưỡng' },
    { key: 'REPAIR', label: 'Sửa chữa' },
    { key: 'ELECTRIC', label: 'Điện' },
    { key: 'ENGINE', label: 'Máy' },
];

export default function SaleActionDrawer({ isOpen, onClose, type, data, onSuccess }: SaleActionDrawerProps) {
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'ALL' | 'SERVICE' | 'PART'>('ALL');
    const [selectedFilter, setSelectedFilter] = useState('ALL');
    const [discountPercent, setDiscountPercent] = useState(0);
    
    const [activeVehicle, setActiveVehicle] = useState<VehicleInfo | null>(null);
    const [activeCustomer, setActiveCustomer] = useState<CustomerInfo | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [orderId, setOrderId] = useState<string | number | undefined>(type === 'reception' ? data?.orderId : data?.id);
    
    const [viewMode, setViewMode] = useState<'SEARCH' | 'DISCOVERY' | 'POS'>(() => {
        if (type === 'checkout' || type === 'order_detail') return 'POS';
        if (type === 'reception') {
            if (data?.orderId) return 'POS';
            if (data?.plate) return 'DISCOVERY';
        }
        return 'SEARCH';
    });

    // Tự động clear searchQuery khi thoát khỏi chế độ SEARCH xe (tránh kẹt biển số trong ô tìm hàng)
    useEffect(() => {
        if (viewMode !== 'SEARCH') {
            setSearchQuery('');
        }
    }, [viewMode]);
    
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [expandedNoteIdx, setExpandedNoteIdx] = useState<number | null>(null);

    const debouncedSearch = useDebounce(searchQuery, 300);
    const { data: searchResults = [], isFetching: isFetchingProducts } = useSearchProducts(debouncedSearch);
    const addOrderItemMutation = useAddOrderItem();
    const updateOrderItemMutation = useUpdateOrderItem();
    const removeOrderItemMutation = useRemoveOrderItem();

    const financial = useMemo(() => {
        const serviceTotal = orderItems.filter(i => i.isService).reduce((a, i) => a + i.price * i.quantity, 0);
        const partTotal = orderItems.filter(i => !i.isService).reduce((a, i) => a + i.price * i.quantity, 0);
        const subtotal = serviceTotal + partTotal;
        const discount = subtotal * discountPercent / 100;
        const afterDiscount = subtotal - discount;
        const vat = orderItems.reduce((a, i) => a + (i.price * i.quantity * (i.vatPercent || 0) / 100), 0);
        const total = afterDiscount + vat;
        return { serviceTotal, partTotal, subtotal, discount, vat, total };
    }, [orderItems, discountPercent]);

    const [discoveryData, setDiscoveryData] = useState<{
        odo: number | string; fuel: number; notes: string;
        hasFuel: boolean; hasDents: boolean; isTiresOk: boolean;
        isLightsOk: boolean; hasPersonalItems: boolean; isClean: boolean;
    }>({
        odo: 0, fuel: 50, notes: '',
        hasFuel: true, hasDents: false, isTiresOk: true, 
        isLightsOk: true, hasPersonalItems: false, isClean: true
    });

    const [qrUrl, setQrUrl] = useState<string>('');

    // Fetch QR when paymentMethod is TRANSFER
    useEffect(() => {
        if (paymentMethod === 'TRANSFER' && orderId) {
            import('@/lib/api').then(({ axiosInstance }) => {
                axiosInstance.get(`/api/transactions/qr-payment/${orderId}?amount=${Math.round(financial.total)}`)
                    .then((res: any) => {
                        if (res && res.qrUrl) {
                            setQrUrl(res.qrUrl);
                        } else if (res && res.data && res.data.qrUrl) {
                            setQrUrl(res.data.qrUrl);
                        }
                    })
                    .catch(err => {
                        console.error("Failed to fetch QR:", err);
                        toast.error("Không thể lấy mã QR lúc này.");
                    });
            });
        }
    }, [paymentMethod, orderId, financial.total]);

    // --- SYNC & RESET ON OPEN ---
    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            const currentOrderId = type === 'reception' ? (data?.orderId || data?.id) : data?.id;
            const hasPlate = data?.plate || data?.plateNumber;
            setOrderId(currentOrderId);
            
            if (type === 'checkout' || type === 'order_detail' || currentOrderId) {
                setViewMode('POS');
            } else if (hasPlate) {
                setViewMode('DISCOVERY');
            } else {
                setViewMode('SEARCH');
            }

            if (data) {
                setActiveVehicle({
                    licensePlate: data.plate || data.plateNumber || '',
                    brand: data.vehicleBrand,
                    model: data.vehicleModel,
                    odo: data.odometer || data.odo || 0,
                });
                setActiveCustomer({
                    id: data.customerId || data.customerPhone || 'unknown',
                    fullName: data.customerName || 'Khách hàng',
                    phone: data.customerPhone || '',
                });
                if (!currentOrderId) {
                    setDiscoveryData(p => ({ ...p, odo: data.odometer || data.odo || 0 }));
                    if (!hasPlate) setOrderItems([]);
                }
            }
        }
    }, [isOpen, type, data]);

    const { data: serverOrder, refetch } = useOrderDetail(orderId || '');
    const queryClient = useQueryClient();

    // Fetch technicians on mount
    useEffect(() => { setMounted(true); fetchTechnicians(); }, []);

    const fetchTechnicians = async () => {
        try {
            const res = await (mechanicApi as any).getAvailableMechanics();
            setTechnicians(res.data || []);
        } catch { /* KTV list not critical */ }
    };

    // Sync from Server Order
    useEffect(() => {
        if (serverOrder && orderId) {
            const order = serverOrder as any;
            setActiveVehicle({
                licensePlate: order.plate || order.plateNumber || '',
                brand: order.vehicleBrand || '',
                model: order.vehicleModel || '',
                odo: order.odometer || order.odo || 0,
            });
            setActiveCustomer({
                id: order.customerId || order.customerPhone || 'unknown',
                fullName: order.customerName || 'Khách hàng',
                phone: order.customerPhone || '',
            });

            if (order.items && Array.isArray(order.items)) {
                const mapped = order.items.map((item: any) => {
                    const mainAssignment = item.assignments?.[0];
                    return {
                        id: item.id,
                        productId: item.productId,
                        name: item.itemName,
                        price: item.price || 0,
                        quantity: item.quantity || 1,
                        isService: item.isService,
                        vatPercent: item.vatPercentage,
                        technicianId: mainAssignment?.mechanicId,
                        technicianName: mainAssignment?.mechanicName,
                        oldPartAction: item.oldPartAction,
                        version: item.version
                    };
                });
                setOrderItems(mapped);
            }
            
            setOrderId(order.id);
            if (viewMode === 'SEARCH') setViewMode('POS');
        }
    }, [serverOrder, orderId, viewMode]);


    // --- FILTERED CATALOG ---
    const filteredCatalog = useMemo(() => {
        // Áp dụng trừ tồn "ảo" ngay trên Frontend dựa trên giỏ hàng hiện tại
        let items = searchResults.map(i => {
            const inCart = orderItems.filter(oi => oi.productId === i.id).reduce((sum, oi) => sum + oi.quantity, 0);
            return {
                ...i,
                stock: Math.max(0, (i.stock || 0) - inCart)
            };
        });
        
        // Tab filter (Client-side for better UX)
        if (activeTab === 'SERVICE') {
            items = items.filter(i => !!(i.isService || i.is_service));
        } else if (activeTab === 'PART') {
            items = items.filter(i => !(i.isService || i.is_service));
        }

        // Category filter
        if (selectedFilter !== 'ALL') {
            items = items.filter(i => {
                const n = (i.name || '').toLowerCase();
                if (selectedFilter === 'MAINTENANCE') return n.includes('bảo dưỡng') || n.includes('thay dầu') || n.includes('rửa') || n.includes('định kỳ');
                if (selectedFilter === 'REPAIR') return n.includes('sửa') || n.includes('thay') || n.includes('phanh') || n.includes('khắc phục');
                if (selectedFilter === 'ELECTRIC') return n.includes('điện') || n.includes('đèn') || n.includes('ắc quy') || n.includes('ecu');
                if (selectedFilter === 'ENGINE') return n.includes('máy') || n.includes('động cơ') || n.includes('buồng đốt') || n.includes('piston');
                return true;
            });
        }

        return items;
    }, [searchResults, activeTab, selectedFilter, orderItems]);

    const handleSelectItem = (item: any) => {
        // Kiểm tra tồn kho trước khi thêm (cho phụ tùng)
        const inCartCount = orderItems.filter(oi => oi.productId === item.id).reduce((sum, oi) => sum + oi.quantity, 0);
        const isService = !!(item.isService || item.is_service);
        
        if (!isService && (item.stock || 0) <= inCartCount) {
            return toast.error(`Mặt hàng "${item.name}" đã hết tồn kho khả dụng!`);
        }

        if (orderId) {
            // Nếu có đơn hàng rồi, call API để giữ hàng real-time
            addOrderItemMutation.mutate({
                orderId: Number(orderId),
                productId: item.id,
                quantity: 1
            }, {
                onSuccess: () => {
                    toast.success(`Đã thêm vào đơn: ${item.name}`);
                },
                onError: (err: any) => {
                    toast.error(`Lỗi thêm mặt hàng: ${err.message || 'Hết hàng hoặc lỗi kết nối'}`);
                }
            });
        } else {
            // Chế độ Tiếp nhận chưa tạo đơn: lưu local
            const existing = orderItems.find(i => i.productId === item.id);
            if (existing) {
                setOrderItems(prev => prev.map(i => i.productId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
            } else {
                setOrderItems(prev => [...prev, {
                    id: `new-${Date.now()}`, productId: item.id,
                    name: item.name, itemName: item.name,
                    quantity: 1, price: item.retailPrice || 0,
                    unit: item.unit, isService: isService,
                    vatPercent: item.vatRate || 0
                }]);
            }
            toast.success(`Đã thêm: ${item.name}`);
        }
    };

    const handleCompleteDiscovery = async () => {
        if (!activeVehicle?.licensePlate) return toast.error("Vui lòng nhập biển số xe");
        
        // Kiểm tra số điện thoại (Bắt buộc)
        const phone = activeCustomer?.phone?.trim();
        if (!phone) {
            document.getElementById('customer-phone')?.focus();
            return toast.error("Vui lòng nhập số điện thoại khách hàng!");
        }
        
        // Regex kiểm tra số điện thoại Việt Nam
        const phoneRegex = /^(0|84)(3|5|7|8|9|1[2689])([0-9]{8,9})$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            document.getElementById('customer-phone')?.focus();
            return toast.error("Số điện thoại không hợp lệ!");
        }

        setIsLoading(true);
        try {
            const checklistNote = `Ghi chú: ${discoveryData.notes}`;
            const res = await receptionApi.createReception({
                receptionFormData: {
                    bienSo: activeVehicle.licensePlate,
                    odo: Number(discoveryData.odo) || 0,
                    nhanHieu: activeVehicle.brand,
                    model: activeVehicle.model,
                    tenKhach: activeCustomer?.fullName || 'Khách lẻ',
                    sdtKhach: phone,
                    mucXang: Number(discoveryData.fuel) || 0,
                    tinhTrangVo: `Lốp: ${discoveryData.isTiresOk?'OK':'Lỗi'}, Đèn: ${discoveryData.isLightsOk?'OK':'Lỗi'}, Trầy xước: ${discoveryData.hasDents?'Có':'Không'}`,
                    yeuCauKhach: checklistNote
                }
            });
            setOrderId((res as any).id);
            setViewMode('POS');
            toast.success("Tiếp nhận thành công!");
        } catch (e: any) { 
            console.error("Reception Error Detailed:", e);
            // Ưu tiên lấy message từ object lỗi mà lib/api.ts trả về
            const msg = e.message || (typeof e === 'string' ? e : "Lỗi không xác định");
            toast.error(`Lỗi tạo lệnh sửa chữa: ${msg}`); 
        }
        setIsLoading(false);
    };

    const handlePayment = async () => {
        if (!orderId) return toast.error("Không tìm thấy mã đơn hàng");
        setIsLoading(true);
        try {
            const saleOrderId = Number(orderId);
            await (saleApi as any).finalizeOrder({ id: saleOrderId });
            await (transactionApi as any).createTransaction({
                requestBody: {
                    saleOrderId, amount: financial.total,
                    paymentMethod: paymentMethod === 'TRANSFER' ? 'BANK_TRANSFER' : 'CASH',
                    status: 'COMPLETED', type: 'INCOME',
                    description: `Tất toán #${saleOrderId} - ${activeVehicle?.licensePlate}`
                }
            } as any);
            try { await (saleApi as any).closeOrder({ id: saleOrderId }); } catch {}
            toast.success("Thanh toán thành công!");
            onSuccess?.();
            onClose();
        } catch (e: any) { 
            const msg = e.message || "Lỗi không xác định";
            toast.error(`Thanh toán thất bại: ${msg}`);
        }
        setIsLoading(false);
    };



    if (!isOpen || !mounted) return null;

    // --- RENDER ---
    return createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
            <PosStyles />
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}
            />
            
            <motion.div 
                initial={{ x: '100%' }} 
                animate={{ x: 0 }} 
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="relative w-[95vw] max-w-[1400px] h-full bg-[#0B0F1A] text-white shadow-2xl overflow-hidden flex flex-col border-l border-white/10"
            >
                {/* === TOP BAR === */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <Zap className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xl font-black tracking-tight text-white mb-0.5 mt-1">Quầy Dịch Vụ</div>
                            <p className="text-[11px] font-bold text-white/80 tracking-widest uppercase">
                                {orderId ? `Đơn hàng #${orderId}` : 'Phiên làm việc mới'}
                            </p>
                        </div>
                    </div>

                    {orderId && (
                        <div className="pos-badge pos-badge-amber">
                            <Clock size={12} /> Đang sửa chữa
                        </div>
                    )}

                    <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-white/50" />
                    </button>
                </div>

                {/* === 3-COLUMN LAYOUT === */}
                <AnimatePresence mode="wait">
                {viewMode === 'SEARCH' ? (
                    <motion.div key="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center p-12">
                        <div className="max-w-lg w-full space-y-8 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                                <Car className="w-10 h-10 text-blue-400" />
                            </div>
                            <div className="text-3xl font-extrabold tracking-tight text-white">Tiếp nhận phương tiện</div>
                            <p className="text-white/60 text-sm font-medium">Nhập biển số xe để bắt đầu quy trình chẩn đoán và sửa chữa chuyên sâu.</p>
                            <input 
                                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value.toUpperCase())}
                                placeholder="VD: 51A-123.45" 
                                className="w-full h-16 bg-white/5 border-2 border-white/10 rounded-2xl text-center text-2xl font-extrabold tracking-[0.15em] focus:border-blue-500 outline-none transition-all placeholder:text-white/20"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => { if(searchQuery) { setActiveVehicle({licensePlate: searchQuery}); setViewMode('DISCOVERY'); }}} className="h-14 bg-blue-600 rounded-xl font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30">Tiếp nhận ngay</button>
                                <button className="h-14 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-all">Tra cứu lịch sử</button>
                            </div>
                        </div>
                    </motion.div>
                ) : viewMode === 'DISCOVERY' ? (
                    <motion.div key="discovery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-8 pos-scrollbar">
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setViewMode('SEARCH')} className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><ChevronRight className="rotate-180 w-4 h-4" /></button>
                                <div className="text-xl font-extrabold tracking-tight text-white">Khảo sát tình trạng xe — {activeVehicle?.licensePlate}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.06] space-y-4">
                                        <div className="pos-section-title !mb-0 !border-none">
                                            <User size={16} /> Thông tin khách hàng
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#60A5FA]" />
                                                <input type="text" placeholder="Tên khách hàng" value={activeCustomer?.fullName || ''} 
                                                    onChange={e => setActiveCustomer(p => p ? {...p, fullName: e.target.value} : {id: 'new', fullName: e.target.value, phone: ''})}
                                                    className="pos-input !pl-10 !h-11 bg-black/20 text-white font-semibold text-sm border-white/10 block w-full focus:border-blue-500/50" />
                                            </div>
                                            <div className="relative">
                                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#60A5FA]" />
                                                <input type="text" id="customer-phone" placeholder="Số điện thoại" value={activeCustomer?.phone || ''}
                                                    onChange={e => setActiveCustomer(p => p ? {...p, phone: e.target.value} : {id: 'new', fullName: '', phone: e.target.value})}
                                                    className="pos-input !pl-10 !h-11 bg-black/20 text-white font-semibold text-sm border-white/10 block w-full focus:border-blue-500/50" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.06] space-y-5">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#60A5FA] mb-2 block">Chỉ số ODO (Km)</label>
                                            <input type="number" value={discoveryData.odo} onChange={e => setDiscoveryData(p => ({...p, odo: e.target.value === '' ? '' : parseInt(e.target.value) || 0}))} className="pos-input text-lg font-extrabold" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#60A5FA]">Mức nhiên liệu</label>
                                                <span className="text-sm font-extrabold">{discoveryData.fuel}%</span>
                                            </div>
                                            <input type="range" value={discoveryData.fuel} onChange={e => setDiscoveryData(p => ({...p, fuel: parseInt(e.target.value)}))} className="w-full h-2 bg-white/10 rounded-lg appearance-none accent-blue-500" />
                                        </div>
                                    </div>
                                    <textarea placeholder="Yêu cầu cụ thể từ khách hàng..." value={discoveryData.notes} onChange={e => setDiscoveryData(p => ({...p, notes: e.target.value}))} className="w-full h-32 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-sm outline-none focus:border-blue-500 resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'hasFuel', label: 'Xăng đầy', icon: <Fuel size={18} /> },
                                        { id: 'hasDents', label: 'Trầy/Móp', icon: <ShieldAlert size={18} /> },
                                        { id: 'isTiresOk', label: 'Lốp OK', icon: <Gauge size={18} /> },
                                        { id: 'isLightsOk', label: 'Đèn OK', icon: <Zap size={18} /> },
                                        { id: 'hasPersonalItems', label: 'Tư trang', icon: <Package size={18} /> },
                                        { id: 'isClean', label: 'Xe sạch', icon: <Sparkles size={18} /> }
                                    ].map(chk => (
                                        <button key={chk.id} onClick={() => setDiscoveryData(p => ({...p, [chk.id]: !p[chk.id as keyof typeof discoveryData]}))} 
                                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-sm font-bold ${discoveryData[chk.id as keyof typeof discoveryData] ? 'bg-blue-600/20 border-blue-500/40 text-blue-300' : 'bg-white/[0.03] border-white/[0.06] text-white/40'}`}>
                                            {chk.icon}<span className="text-white/80">{chk.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleCompleteDiscovery} disabled={isLoading} className="w-full h-14 bg-blue-600 rounded-xl font-bold text-base hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30 disabled:opacity-40 flex items-center justify-center gap-3">
                                {isLoading ? 'Đang xử lý...' : 'Hoàn tất tiếp nhận'} <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* === POS MODE: 3 COLUMNS === */
                    <motion.div key="pos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 pos-layout">
                        
                        {/* ======= COL 1: CATALOG ======= */}
                        <div className="pos-col">
                            <div className="pos-col-header space-y-3">
                                {/* Tabs */}
                                <div className="flex gap-2">
                                    <button onClick={() => setActiveTab('ALL')} className={`pos-chip flex items-center gap-1.5 ${activeTab === 'ALL' ? 'pos-chip-active' : ''}`}>
                                        Tất cả
                                    </button>
                                    <button onClick={() => setActiveTab('SERVICE')} className={`pos-chip flex items-center gap-1.5 ${activeTab === 'SERVICE' ? 'pos-chip-active' : ''}`}>
                                        <Wrench size={13} /> Dịch vụ
                                    </button>
                                    <button onClick={() => setActiveTab('PART')} className={`pos-chip flex items-center gap-1.5 ${activeTab === 'PART' ? 'pos-chip-active bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}`}>
                                        <Package size={13} /> Phụ tùng
                                    </button>
                                </div>
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                                    <input type="text" placeholder="Tìm theo tên, mã..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        className="pos-input h-10 text-sm" style={{ paddingLeft: '36px', color: 'white' }} />
                                </div>
                                {/* Filters */}
                                <div className="flex gap-1.5 overflow-x-auto pb-1 pos-scrollbar">
                                    {FILTER_CATS.map(f => (
                                        <button key={f.key} onClick={() => setSelectedFilter(f.key)} className={`pos-chip text-[10px] ${selectedFilter === f.key ? 'pos-chip-active' : ''}`}>{f.label}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="pos-col-body pos-scrollbar space-y-2.5">
                                {isFetchingProducts ? (
                                    Array.from({length: 6}).map((_, i) => <div key={i} className="h-16 rounded-xl shimmer-bar" />)
                                ) : filteredCatalog.length === 0 ? (
                                    <div className="text-center py-12 text-white/70 font-semibold text-sm">Chưa có sản phẩm / dịch vụ nào</div>
                                ) : (
                                    filteredCatalog.map(item => (
                                        <div key={item.id} onClick={() => handleSelectItem(item)} 
                                            className={`pos-card flex items-center justify-between group ${item.isService ? 'pos-card-service' : 'pos-card-part'}`}>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.isService ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                                    {item.isService ? <Wrench size={16} /> : <Package size={16} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold truncate text-white uppercase tracking-tight">{item.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[11px] text-cyan-400 font-extrabold tracking-wider tabular-nums">{(item.retailPrice || 0).toLocaleString()}₫</p>
                                                        {!item.isService && (
                                                            <span className="text-[10px] text-white/40 font-medium px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                                                                Tồn: <span className={item.stock > 10 ? 'text-emerald-400' : item.stock > 0 ? 'text-amber-400' : 'text-rose-400'}>{item.stock}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Plus className="w-4 h-4 text-white/20 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                                {/* ======= COL 2: VEHICLE & CUSTOMER ======= */}
                        <div className="pos-col">
                            <div className="pos-col-header">
                                <div className="flex items-center gap-2 text-[#60A5FA]">
                                    <Car size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Hồ sơ Dịch vụ</span>
                                </div>
                            </div>
                            <div className="pos-col-body pos-scrollbar space-y-6">
                                {/* License Plate Hero */}
                                {activeVehicle && (
                                    <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="bg-white/20 backdrop-blur px-4 py-1.5 rounded-lg border border-white/20">
                                                <span className="text-xl font-black tracking-[0.15em] text-white">{activeVehicle.licensePlate || '—'}</span>
                                            </div>
                                            <Car className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <p className="text-sm font-bold text-white">{activeVehicle.brand} {activeVehicle.model}</p>
                                        {activeVehicle.odo ? <p className="text-xs text-white/90 mt-1 uppercase tracking-wider font-extrabold">ODO: {activeVehicle.odo?.toLocaleString()} km</p> : null}
                                    </div>
                                )}

                                {/* Customer Form */}
                                <div>
                                    <div className="pos-section-title">
                                        <User size={16} /> Thông tin Khách hàng
                                    </div>
                                    <div className="space-y-3 bg-[#1e293b]/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-inner">
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#60A5FA]" />
                                            <input type="text" placeholder="Tên khách hàng" value={activeCustomer?.fullName || ''} 
                                                onChange={e => setActiveCustomer(p => p ? {...p, fullName: e.target.value} : {id: 'new', fullName: e.target.value, phone: ''})}
                                                className="pos-input !pl-10 bg-black/20 text-white font-semibold text-sm border-white/10 block w-full focus:border-blue-500/50" />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#60A5FA]" />
                                            <input type="text" id="customer-phone" placeholder="Số điện thoại" value={activeCustomer?.phone || ''}
                                                onChange={e => setActiveCustomer(p => p ? {...p, phone: e.target.value} : {id: 'new', fullName: '', phone: e.target.value})}
                                                className="pos-input !pl-10 bg-black/20 text-white font-semibold text-sm border-white/10 block w-full focus:border-blue-500/50" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" placeholder="Hãng xe" value={activeVehicle?.brand || ''} 
                                                onChange={e => setActiveVehicle(p => p ? {...p, brand: e.target.value} : {licensePlate: '', brand: e.target.value})}
                                                className="pos-input text-sm bg-black/20 border-white/10 block w-full focus:border-blue-500/50" />
                                            <input type="text" placeholder="Dòng xe" value={activeVehicle?.model || ''}
                                                onChange={e => setActiveVehicle(p => p ? {...p, model: e.target.value} : {licensePlate: '', model: e.target.value})}
                                                className="pos-input text-sm bg-black/20 border-white/10 block w-full focus:border-blue-500/50" />
                                        </div>
                                    </div>
                                </div>

                                {/* Service History */}
                                <div>
                                    <div className="pos-section-title text-[#10B981] border-[#10B981]/30">
                                        <History size={16} /> Lịch sử Dịch vụ / Upsale
                                    </div>
                                    <div className="space-y-3">
                                        {serverOrder?.receptionId ? (
                                            <div className="bg-[#0f172a]/60 backdrop-blur-md rounded-xl p-4 border border-[#10B981]/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:border-[#10B981]/40 transition-colors cursor-pointer">
                                                <div className="flex items-center gap-2 text-xs text-[#10B981]/80 font-bold mb-2 uppercase tracking-wide">
                                                    <Calendar size={12} />
                                                    <span>Phiên hiện tại</span>
                                                </div>
                                                <p className="text-sm font-bold text-white">Lần tiếp nhận này</p>
                                                <p className="text-xs text-white/50 mt-1">{serverOrder.items?.length || 0} hạng mục đang xử lý</p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-black/10 rounded-xl border border-white/5 border-dashed">
                                                <History className="w-8 h-8 text-white/10 mx-auto mb-2" />
                                                <div className="text-white/30 text-xs font-semibold uppercase tracking-wider">Chưa có lịch sử dịch vụ</div>
                                            </div>
                                        )}
                                        
                                        {/* Mock Upsale suggestion based on typical Garage data */}
                                        <div className="bg-[#ffb020]/10 backdrop-blur-md border border-[#ffb020]/30 rounded-xl p-4 transition-all hover:bg-[#ffb020]/15 cursor-pointer">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-xs text-[#ffb020]/70 font-black uppercase tracking-wider">Gợi ý Upsale</p>
                                                    <div className="text-[#ffb020] font-bold text-sm mt-1">Gói Vệ Sinh Buồng Đốt</div>
                                                </div>
                                                <span className="text-[9px] bg-[#ffb020]/20 text-[#ffb020] py-1 px-2 rounded font-black uppercase tracking-widest">Hot</span>
                                            </div>
                                            <p className="text-xs text-white/60 leading-relaxed">Khách đi trên 30,000km, rất dễ chốt gói gầm hoặc buồng đốt.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* ======= COL 3: INVOICE / CART ======= */}
                        <div className="pos-col bg-white/[0.01]">
                            <div className="pos-col-header flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white/80">
                                    <FileText size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Hóa đơn</span>
                                </div>
                                <span className="pos-badge pos-badge-blue">{orderItems.length} hạng mục</span>
                            </div>
                            
                            <div className="pos-col-body pos-scrollbar space-y-2.5">
                                {orderItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-white/20 gap-3">
                                        <Package size={32} />
                                        <p className="text-sm">Chưa có hạng mục nào</p>
                                        <p className="text-xs">Chọn dịch vụ hoặc phụ tùng từ danh mục bên trái</p>
                                    </div>
                                ) : orderItems.map((item, idx) => (
                                    <motion.div key={`${item.id}-${idx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3 group hover:border-white/[0.12] transition-all">
                                        {/* Row 1: Name + Delete */}
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-black text-white truncate">{item.name || item.itemName}</p>
                                                <p className="text-[10px] text-white/60 font-mono font-bold">#{(item.productId || 0).toString().padStart(4, '0')} · {item.isService ? 'Dịch vụ' : 'Phụ tùng'}</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    if (orderId) {
                                                        removeOrderItemMutation.mutate({ orderId: Number(orderId), itemId: Number(item.id), version: item.version || 0 });
                                                    } else {
                                                        setOrderItems(prev => prev.filter((_, i) => i !== idx));
                                                    }
                                                }} 
                                                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-red-400/50 group-hover:text-red-400" />
                                            </button>
                                        </div>
                                        {/* Row 2: Qty + Price */}
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center bg-white/5 rounded-lg border border-white/[0.06] p-0.5">
                                                <button 
                                                    onClick={() => {
                                                        const newQty = Math.max(1, item.quantity - 1);
                                                        if (orderId) {
                                                            updateOrderItemMutation.mutate({ orderId: Number(orderId), itemId: Number(item.id), data: { quantity: newQty, version: item.version || 0 } });
                                                        } else {
                                                            setOrderItems(p => p.map((it, i) => i === idx ? {...it, quantity: newQty} : it));
                                                        }
                                                    }} 
                                                    className="p-1.5 hover:bg-white/10 rounded-md"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-9 text-center text-sm font-extrabold tabular-nums">{item.quantity}</span>
                                                <button 
                                                    onClick={() => {
                                                        const newQty = item.quantity + 1;
                                                        if (orderId) {
                                                            updateOrderItemMutation.mutate({ orderId: Number(orderId), itemId: Number(item.id), data: { quantity: newQty, version: item.version || 0 } });
                                                        } else {
                                                            setOrderItems(p => p.map((it, i) => i === idx ? {...it, quantity: newQty} : it));
                                                        }
                                                    }} 
                                                    className="p-1.5 hover:bg-white/10 rounded-md"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-white tabular-nums">{(item.price * item.quantity).toLocaleString()}₫</p>
                                                <p className="text-[10px] text-white/60 font-bold">{item.price.toLocaleString()} × {item.quantity}</p>
                                            </div>
                                        </div>
                                        {item.isService && (
                                            <div className="flex items-center gap-2 px-1 py-1">
                                                <div>
                                                    <p className="text-[11px] font-bold text-white/90 leading-tight">
                                                        {item.technicianName || ''}
                                                    </p>
                                                    {item.technicianName && <p className="text-[9px] text-white/40 font-medium">Kỹ thuật viên thực hiện</p>}
                                                </div>
                                            </div>
                                        )}
                                        {!item.isService && (
                                            <div className="relative group/sel">
                                                <select
                                                    value={item.oldPartAction || 'RETURN_TO_CUSTOMER'}
                                                    onChange={(e) => {
                                                        const val = e.target.value as any;
                                                        if (orderId) {
                                                            updateOrderItemMutation.mutate({ orderId: Number(orderId), itemId: Number(item.id), data: { oldPartAction: val, version: item.version || 0 } });
                                                        } else {
                                                            setOrderItems(p => p.map((it, i) => i === idx ? { ...it, oldPartAction: val } : it));
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-full h-8 bg-[#0f172a] border border-white/[0.06] rounded-lg px-2.5 text-[10px] outline-none appearance-none cursor-pointer transition-all hover:border-white/20 [&>option]:bg-[#0f172a] [&>option]:text-white",
                                                        (item.oldPartAction === 'RETURN_TO_CUSTOMER' || !item.oldPartAction) ? "text-blue-400" : item.oldPartAction === 'KEEP_IN_GARAGE' ? "text-amber-400" : "text-slate-400"
                                                    )}
                                                >
                                                    <option value="RETURN_TO_CUSTOMER" className="bg-[#0f172a] text-blue-400">Trả phụ tùng cũ cho khách</option>
                                                    <option value="KEEP_IN_GARAGE" className="bg-[#0f172a] text-amber-400">Lưu kho phụ tùng cũ</option>
                                                    <option value="DISCARD" className="bg-[#0f172a] text-slate-400">Bỏ phụ tùng cũ đi</option>
                                                </select>
                                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 pointer-events-none group-hover/sel:text-white/50 transition-colors" />
                                            </div>
                                        )}
                                        {/* Row 4: Note toggle */}
                                        <button onClick={() => setExpandedNoteIdx(expandedNoteIdx === idx ? null : idx)} className="text-[10px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
                                            <ChevronDown size={10} className={`transition-transform ${expandedNoteIdx === idx ? 'rotate-180' : ''}`} /> Ghi chú
                                        </button>
                                        {expandedNoteIdx === idx && (
                                            <input type="text" placeholder="Nhập ghi chú..." value={item.note || ''} 
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (orderId) {
                                                        updateOrderItemMutation.mutate({ 
                                                            orderId: Number(orderId), 
                                                            itemId: Number(item.id), 
                                                            data: { note: val, version: item.version || 0 } as any 
                                                        });
                                                    } else {
                                                        setOrderItems(p => p.map((it, i) => i === idx ? {...it, note: val} : it));
                                                    }
                                                }}
                                                className="pos-input h-8 text-xs" />
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Footer: Summary + Payment */}
                            <div className="pos-col-footer space-y-4">
                                {/* Summary */}
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between text-white/80 font-medium"><span>Dịch vụ</span><span className="tabular-nums font-bold">{financial.serviceTotal.toLocaleString()}₫</span></div>
                                    <div className="flex justify-between text-white/80 font-medium"><span>Phụ tùng</span><span className="tabular-nums font-bold">{financial.partTotal.toLocaleString()}₫</span></div>
                                    {/* Discount input */}
                                    <div className="flex justify-between items-center text-white/40">
                                        <div className="flex items-center gap-1.5">
                                            <Percent size={12} />
                                            <span>Giảm giá</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <input type="number" min={0} max={100} value={discountPercent || ''} 
                                                onChange={e => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                                                placeholder="0" className="w-12 h-6 bg-white/5 border border-white/[0.06] rounded text-center text-xs outline-none focus:border-blue-500 tabular-nums" />
                                            <span className="text-[10px]">%</span>
                                            {financial.discount > 0 && <span className="text-red-400 ml-1">-{financial.discount.toLocaleString()}₫</span>}
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-white/80 font-medium"><span>VAT</span><span className="tabular-nums font-bold">{financial.vat.toLocaleString()}₫</span></div>
                                    <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
                                        <span className="text-sm font-bold">Tổng thanh toán</span>
                                        <span className="text-xl font-extrabold tabular-nums text-white">{financial.total.toLocaleString()}<span className="text-xs text-white/40 ml-1">₫</span></span>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="flex gap-2">
                                    <button onClick={() => setPaymentMethod('CASH')} className={`flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${paymentMethod === 'CASH' ? 'bg-white text-slate-900' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/[0.06]'}`}>
                                        <Banknote size={14} /> Tiền mặt
                                    </button>
                                    <button onClick={() => setPaymentMethod('TRANSFER')} className={`flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${paymentMethod === 'TRANSFER' ? 'bg-white text-slate-900' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/[0.06]'}`}>
                                        <QrCode size={14} /> Chuyển khoản
                                    </button>
                                </div>

                                {/* QR Code for Transfer */}
                                {paymentMethod === 'TRANSFER' && orderId && (
                                    <div className="bg-white rounded-xl p-4 flex flex-col items-center gap-2">
                                        {qrUrl ? (
                                            <img 
                                                src={qrUrl}
                                                alt="QR Chuyển khoản" 
                                                className="w-full max-w-[200px] h-auto rounded-lg"
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/ffffff/000000?text=L%E1%BB%97i+M%C3%A3+QR'; }}
                                            />
                                        ) : (
                                            <div className="w-[200px] h-[200px] bg-slate-100 animate-pulse rounded-lg flex items-center justify-center">
                                                <div className="text-slate-400 text-sm">Đang tải QR...</div>
                                            </div>
                                        )}
                                        <p className="text-[10px] text-slate-500 text-center">Quét mã QR để thanh toán<br/>Số tiền: <b className="text-slate-800">{financial.total.toLocaleString()}₫</b></p>
                                    </div>
                                )}
                                {paymentMethod === 'TRANSFER' && !orderId && (
                                    <div className="bg-white/10 rounded-xl p-4 text-center">
                                        <p className="text-xs text-white/80 font-medium">Vui lòng tiếp nhận hoặc lưu đơn hàng trước khi gen mã chuyển khoản.</p>
                                    </div>
                                )}

                                {/* Pay Button */}
                                <button onClick={handlePayment} disabled={orderItems.length === 0 || isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 active:scale-[0.98] relative overflow-hidden group">
                                    <div className="absolute inset-0 shimmer-bar opacity-20 group-hover:opacity-40" />
                                    <span className="relative z-10">{isLoading ? 'Đang xử lý...' : 'Xác nhận & Thanh toán'}</span>
                                    <CheckCircle2 className="w-4 h-4 relative z-10" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </motion.div>
        </div>,
        document.body
    );
}
