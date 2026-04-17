'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, User, Calendar, Car, Clock, CreditCard, Banknote,
    CheckCircle2, ArrowRight, Plus, Minus, Trash2,
    ChevronRight, X, History, Package, Zap, QrCode, Gauge, Fuel,
    ClipboardCheck, Hammer, Settings2, ShieldAlert, Sparkles, PlusCircle,
    Phone, Tag, Percent, FileText, Wrench, ChevronDown, Filter, LogOut,
    Shield, Bell, PhoneCall, MessageSquare, CalendarCheck, AlertCircle,
    RefreshCw, CalendarDays, BookOpen, MapPin, CheckCheck, Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { receptionApi, saleApi, transactionApi, productApi, mechanicApi } from '@/api';
import { 
    useSaleStats,
    useOrderDetail,
    useAddOrderItem,
    useUpdateOrderItem,
    useRemoveOrderItem,
    useFinalizeOrder,
    useUpdateOrderTotals,
    useCancelOrder,
    useSearchProducts,
    useApproveQuote
} from '@/modules/sale/hooks/useSale';
import { signOut } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/modules/common/contexts/RealtimeContext';
import { useRealtimeUpdate } from '@/hooks/useRealtimeUpdate';
import { useLayoutContext } from '@/modules/common/contexts/LayoutContext';
import { cn } from '@/lib/utils';
import { queryKeys } from '@/lib/query-keys';
import { getStatusBadge, isWaitingPayment, isCompleted, isClosed, isCancelled, isWaitingForCustomer, isPostApproval, isItemPending, isReceived, isQuoting, isWaitingDiagnosis } from '@/lib/status';
import { axiosInstance, api } from '@/lib/api';
import OrderActions from '@/modules/sale/components/OrderActions';



// ═══════════════════════════════════════════════════════════
// DESIGN SYSTEM: Full-screen POS Styles
// ═══════════════════════════════════════════════════════════
const POSStyles = () => (
    <style dangerouslySetInnerHTML={{ __html: `
        .pos-fullscreen {
            display: grid;
            grid-template-columns: 280px 1fr 320px 380px;
            height: 100vh;
            overflow: hidden;
            background: #0B0F1A;
            color: white;
        }
        .pos-col {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border-right: 1px solid rgba(255,255,255,0.06);
        }
        .pos-col:last-child { border-right: none; }
        .pos-col-header {
            padding: 16px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            flex-shrink: 0;
        }
        .pos-col-body {
            flex: 1;
            overflow-y: auto;
            padding: 16px 20px;
        }
        .pos-col-footer {
            padding: 16px 20px;
            border-top: 1px solid rgba(255,255,255,0.06);
            flex-shrink: 0;
        }
        .pos-section-title {
            font-size: 11px;
            font-weight: 800;
            color: #A5F3FC;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
        }
        .pos-card {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 12px 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .pos-card:hover {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.15);
            transform: translateY(-1px);
        }
        .pos-card:active { transform: scale(0.98); }
        .pos-card-service { border-left: 3px solid #3B82F6; }
        .pos-card-part { border-left: 3px solid #10B981; }
        .pos-input {
            width: 100%;
            height: 40px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 0 12px;
            color: white;
            font-size: 13px;
            outline: none;
            transition: border-color 0.2s;
        }
        .pos-input:focus { border-color: #3B82F6; }
        .pos-input::placeholder { color: rgba(255,255,255,0.3); }
        .pos-chip {
            padding: 5px 12px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid rgba(255,255,255,0.15);
            background: rgba(255,255,255,0.06);
            color: rgba(255,255,255,0.7);
            white-space: nowrap;
        }
        .pos-chip-active {
            background: #3B82F6;
            border-color: #3B82F6;
            color: white;
        }
        .pos-scrollbar::-webkit-scrollbar { width: 3px; }
        .pos-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .pos-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .pos-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .pos-badge-amber { background: rgba(245,158,11,0.15); color: #F59E0B; }
        .pos-badge-green { background: rgba(34,197,94,0.15); color: #22C55E; }
        .pos-badge-blue { background: rgba(59,130,246,0.15); color: #3B82F6; }
        .pos-badge-red { background: rgba(239,68,68,0.15); color: #EF4444; }
        .pos-badge-purple { background: rgba(168,85,247,0.15); color: #A855F7; }
        .shimmer-bar {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
            background-size: 200% 100%;
            animation: shimmer 2s infinite linear;
        }
        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        /* Vehicle card selected state */
        .vehicle-card-selected {
            background: rgba(59,130,246,0.15) !important;
            border-color: rgba(59,130,246,0.4) !important;
            box-shadow: 0 0 20px rgba(59,130,246,0.1);
        }
    `}} />
);

// ═══════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════
interface VehicleInfo {
    licensePlate: string;
    brand?: string;
    model?: string;
    odo?: number;
    status?: string;
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
    technicianId?: number | null;
    technicianName?: string;
    note?: string;
    version?: number;
    oldPartAction?: 'RETURN_TO_CUSTOMER' | 'KEEP_IN_GARAGE' | 'DISCARD';
    itemStatus?: string;
}

// ═══════════════════════════════════════════════════════════
// FILTER CATEGORIES (Catalog)
// ═══════════════════════════════════════════════════════════
const FILTER_CATS = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'SERVICE', label: 'Dịch vụ' },
    { key: 'INVENTORY', label: 'Phụ tùng' },
    { key: 'MAINTENANCE', label: 'Bảo dưỡng' },
    { key: 'REPAIR', label: 'Sửa chữa' },
    { key: 'ELECTRIC', label: 'Điện' },
    { key: 'ENGINE', label: 'Máy' },
];

// ═══════════════════════════════════════════════════════════
// STATUS FILTER for Vehicle List
// ═══════════════════════════════════════════════════════════
const VEHICLE_FILTERS = [
    { key: 'ALL', label: 'Tất cả', icon: Filter },
    { key: 'WAITING', label: 'Trong xưởng', icon: Car },
    { key: 'QUOTES', label: 'Chờ chốt', icon: FileText },
    { key: 'PAYMENT', label: 'Chờ thu', icon: Banknote },
    { key: 'CANCELLED', label: 'Đã hủy', icon: X },
    { key: 'WARRANTY', label: 'Bảo hành', icon: Shield },
] as const;


// ═══════════════════════════════════════════════════════════
// UTILITY: Auto-format license plate (Vietnamese standard)
// CAR:  30A-123.45  or  30A-1234
// MOTO: 29-X1-123.45   (handled by LicensePlateInput component)
// ═══════════════════════════════════════════════════════════
function formatPlate(raw: string): string {
    // Strip all separators and uppercase
    const input = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let clean = '';

    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        const pos = clean.length;
        // Position rules: 0-1 = digits, 2 = letter, 3+ = digits
        if (pos < 2) {
            if (/[0-9]/.test(char)) clean += char;
        } else if (pos === 2) {
            if (/[A-Z]/.test(char)) clean += char;
        } else if (pos === 3) {
            // Optional 2nd letter (e.g. 29B1-...)
            if (/[A-Z]/.test(char)) clean += char;
            else if (/[0-9]/.test(char)) clean += char;
        } else {
            if (/[0-9]/.test(char)) clean += char;
        }
    }

    // Max length: 3 prefix + 5 suffix = 8 raw chars
    clean = clean.slice(0, 8);

    if (clean.length <= 3) return clean;

    const prefix = clean.slice(0, 3);
    const suffix = clean.slice(3);

    if (suffix.length === 4) return `${prefix}-${suffix}`;
    if (suffix.length >= 5)  return `${prefix}-${suffix.slice(0, 3)}.${suffix.slice(3, 5)}`;
    return `${prefix}-${suffix}`;
}

// ═══════════════════════════════════════════════════════════
// UTILITY: Auto-format phone number  0901 234 567
// ═══════════════════════════════════════════════════════════
function formatPhone(raw: string): string {
    const digits = raw.replace(/[^0-9+]/g, '').slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT: POS FULLSCREEN
// ═══════════════════════════════════════════════════════════
export default function SalePOSFullscreen() {
    // --- STATE: Vehicle List (from old dashboard) ---
    const [activeVehicleFilter, setActiveVehicleFilter] = useState<'ALL' | 'WAITING' | 'QUOTES' | 'PAYMENT' | 'WARRANTY' | 'CANCELLED'>('ALL');
    const [vehicleSearch, setVehicleSearch] = useState('');

    // --- STATE: Selected vehicle / order context ---
    const [selectedOrderId, setSelectedOrderId] = useState<string | number | undefined>(undefined);
    const [activeVehicle, setActiveVehicle] = useState<VehicleInfo | null>(null);
    const [activeCustomer, setActiveCustomer] = useState<CustomerInfo | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    // --- STATE: POS Mode ---
    const [viewMode, setViewMode] = useState<'IDLE' | 'DISCOVERY' | 'POS'>('IDLE');

    // --- STATE: Catalog ---
    const [catalogItems, setCatalogItems] = useState<any[]>([]);
    const [catalogSearch, setCatalogSearch] = useState('');
    const [selectedCatFilter, setSelectedCatFilter] = useState('ALL');
    const [activeTab, setActiveTab] = useState<'ALL' | 'SERVICE' | 'PART'>('ALL');
    const [isFetchingCatalog, setIsFetchingCatalog] = useState(false);

    // --- STATE: Payment ---
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
    const [showZoomedQR, setShowZoomedQR] = useState(false);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [qrUrl, setQrUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // --- STATE: Technicians ---
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [expandedNoteIdx, setExpandedNoteIdx] = useState<number | null>(null);

    // --- LEGACY BANK CONFIG ---
    const BANK_ID = 'MB';
    const ACCOUNT_NO = '0945197256';
    const ACCOUNT_NAME = 'NGUYEN MINH HOANG';

    // --- STATE: Discovery (Reception form) ---
    const [discoveryData, setDiscoveryData] = useState({
        odo: 0, fuel: 50, notes: '',
        hasFuel: true, hasDents: false, isTiresOk: true,
        isLightsOk: true, hasPersonalItems: false, isClean: true,
        photos: [] as string[]
    });

    // --- STATE: Customer Care ---
    const [showCarePanel, setShowCarePanel] = useState(false);

    // --- STATE: Booking Management Panel ---
    const [showBookingPanel, setShowBookingPanel] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [bookingFilter, setBookingFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('ALL');
    const [showCreateBooking, setShowCreateBooking] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [createForm, setCreateForm] = useState({
        customerName: '', phone: '', plate: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '08:00',
        note: ''
    });


    const fetchBookings = async () => {
        setIsLoadingBookings(true);
        try {
            const { axiosInstance } = await import('@/lib/api');
            const res: any = await axiosInstance.get('/api/sale/bookings', { params: { size: 50, page: 0 } });
            const data = res?.data || res;
            const list = Array.isArray(data) ? data
                : Array.isArray(data?.content) ? data.content
                : Array.isArray(data?.data) ? data.data : [];
            setBookings(list);
        } catch (e) {
            console.error('Fetch bookings:', e);
            setBookings([]);
        }
        setIsLoadingBookings(false);
    };



    const handleCreateBooking = async () => {
        if (!createForm.customerName || !createForm.phone || !createForm.plate) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc'); return;
        }
        
        // Validation: Tên, Số điện thoại, Biển số xe
        if (createForm.customerName.trim().length < 2) {
            toast.error('Tên khách hàng không hợp lệ (tối thiểu 2 ký tự)'); return;
        }
        const phoneRegex = /^(0|\+84)[0-9]{9}$/;
        if (!phoneRegex.test(createForm.phone.replace(/[\s\-\.]/g, ''))) {
            toast.error('Số điện thoại không hợp lệ (phải bắt đầu bằng 0 hoặc +84 và có 10 chữ số)'); return;
        }
        const plateStr = createForm.plate.toUpperCase().replace(/[\s\-\.]/g, '');
        const plateRegex = /^[0-9]{2}[A-Z]{1,2}[0-9]?[0-9]{4,5}$/;
        if (!plateRegex.test(plateStr)) {
            toast.error('Biển số xe không hợp lệ (VD: 51A-123.45, 29B1-12345)'); return;
        }

        setActionLoading(-1);
        try {
            const { axiosInstance } = await import('@/lib/api');
            await axiosInstance.post('/api/sale/bookings', {
                customerName: createForm.customerName,
                customerPhone: createForm.phone.replace(/[\s\-\.]/g, ''),
                plateNumber: createForm.plate,
                appointmentTime: `${createForm.appointmentDate}T${createForm.appointmentTime}:00`,
                note: createForm.note,
                status: 'CONFIRMED'
            });
            toast.success('Đã tạo lịch hẹn thành công');
            setShowCreateBooking(false);
            setCreateForm({ customerName: '', phone: '', plate: '', appointmentDate: new Date().toISOString().split('T')[0], appointmentTime: '08:00', note: '' });
            fetchBookings();
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Không thể tạo lịch');
        }
        setActionLoading(null);
    };

    const handleConfirmBooking = async (id: number) => {
        setActionLoading(id);
        try {
            const { axiosInstance } = await import('@/lib/api');
            await axiosInstance.patch(`/api/sale/bookings/${id}/confirm`);
            toast.success('Đã xác nhận lịch hẹn');
            setBookings(p => p.map(b => b.id === id ? { ...b, status: 'CONFIRMED' } : b));
        } catch (e: any) { toast.error('Không thể xác nhận lịch'); }
        setActionLoading(null);
    };

    const handleCancelBooking = async (id: number) => {
        setActionLoading(id);
        try {
            const { axiosInstance } = await import('@/lib/api');
            await axiosInstance.patch(`/api/sale/bookings/${id}/cancel`);
            toast.success('Đã hủy lịch hẹn');
            setBookings(p => p.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
        } catch (e: any) { toast.error('Không thể hủy lịch'); }
        setActionLoading(null);
    };

    const handleReceiveFromBooking = (booking: any) => {
        const plate = booking.plateNumber || booking.licensePlate || booking.plate || '';
        const phone = booking.customerPhone || booking.phone || '';
        const name  = booking.customerName  || booking.name  || 'Khách đặt lịch';

        // Mark as ARRIVED on backend (fire-and-forget, non-blocking)
        axiosInstance.patch(`/api/sale/bookings/${booking.id}/arrive`).catch(() => {});

        // Remove from local list immediately
        setBookings(prev => prev.filter(b => b.id !== booking.id));

        setShowBookingPanel(false);
        setSelectedOrderId(undefined);
        setActiveVehicle({ 
            licensePlate: plate, 
            brand: booking.vehicleBrand || booking.brand || '', 
            model: booking.vehicleModel || booking.model || '',
            status: booking.status || 'RECEIVED'
        });
        setActiveCustomer({ 
            id: booking.customerId || phone || `booking-${booking.id}`, 
            fullName: name, 
            phone 
        });
        // Build rich note with appointment time
        const apptRaw = booking.receptionDate || booking.appointmentTime || booking.ngayGio;
        const apptDate = apptRaw ? new Date(apptRaw) : null;
        const apptStr = apptDate
            ? apptDate.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '';
        const bookingNote = [
            `📋 Lịch hẹn #${booking.id}`,
            apptStr ? `⏰ Hẹn lúc: ${apptStr}` : '',
            booking.note || booking.serviceNote ? `📝 Yêu cầu: ${booking.note || booking.serviceNote}` : '',
        ].filter(Boolean).join('\n');

        setDiscoveryData(p => ({ 
            ...p, 
            notes: bookingNote
        }));
        setViewMode('DISCOVERY');
        toast.success(`Đã tiếp nhận lịch hẹn: ${name}`);
    };

    const filteredBookings = bookings.filter(b => bookingFilter === 'ALL' || b.status === bookingFilter);

    const handleOpenBookingPanel = () => {
        setIsLoadingBookings(true);
        setShowBookingPanel(true);
        fetchBookings();
    };


    // ═══════════════════════════════════════════════════════
    // DATA HOOKS & LAYOUT
    // ═══════════════════════════════════════════════════════
    const { setIsImmersive } = useLayoutContext();

    useEffect(() => {
        setIsImmersive(true);
        return () => setIsImmersive(false);
    }, [setIsImmersive]);

    const { data: stats = {
        countWaiting: 0, countPendingQuotes: 0, countPendingPayment: 0, countWarranty: 0,
        waitingVehicles: [], recentOrders: []
    } } = useSaleStats();

    useRealtimeUpdate(queryKeys.sale.all);
    useRealtimeUpdate(queryKeys.reception.all);
    useRealtimeUpdate(queryKeys.order.all);

    const { countWaiting, countPendingQuotes, countPendingPayment, countWarranty, waitingVehicles, recentOrders } = stats;

    const { data: serverOrder, refetch } = useOrderDetail(selectedOrderId || '');
    const queryClient = useQueryClient();

    // Mutations
    const addOrderItem = useAddOrderItem();
    const updateOrderItem = useUpdateOrderItem();
    const removeOrderItem = useRemoveOrderItem();
    const finalizeOrder = useFinalizeOrder();
    const updateOrderTotals = useUpdateOrderTotals();
    const approveQuote = useApproveQuote();
    const cancelOrderMut = useCancelOrder({
        onSuccess: () => {
            setActiveVehicle(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
            toast.success('Đã hủy đơn hàng. Bạn có thể xem lại trong bộ lọc Đã hủy.');
            setSelectedOrderId(undefined);
            setOrderItems([]);
        }
    });
    const { addListener, removeListener, subscribeToTopic, unsubscribeFromTopic } = useRealtime();

    // ═══════════════════════════════════════════════════════
    // FINANCIAL CALCULATIONS (from Drawer)
    // ═══════════════════════════════════════════════════════
    const financial = useMemo(() => {
        const serviceTotal = orderItems.filter(i => i.isService).reduce((a, i) => a + i.price * i.quantity, 0);
        const partTotal = orderItems.filter(i => !i.isService).reduce((a, i) => a + i.price * i.quantity, 0);
        const subtotal = serviceTotal + partTotal;
        const discount = subtotal * (discountPercent || 0) / 100;
        const afterDiscount = subtotal - discount;

        // Group VAT by percentage (Legacy parity)
        const vatGroups = orderItems.reduce((acc: any, item) => {
            const rate = item.vatPercent || 0;
            if (rate > 0) acc[rate] = (acc[rate] || 0) + (item.price * item.quantity * rate / 100);
            return acc;
        }, {});
        const vat = Object.values(vatGroups).reduce((a: number, b: any) => a + b, 0) as number;
        const total = afterDiscount + vat;

        return { serviceTotal, partTotal, subtotal, discount, vat, vatGroups, total };
    }, [orderItems, discountPercent]);

    // ═══════════════════════════════════════════════════════
    // FILTERED VEHICLE LIST (from old dashboard)
    // ═══════════════════════════════════════════════════════
    const filteredVehicles = useMemo(() => {
        // Thu thập các tiêu chí định danh để lọc trùng
        const receptionIdsInOrders = new Set();
        const platesInOrders = new Set();
        
        recentOrders.forEach((o: any) => {
            if (o.receptionId) receptionIdsInOrders.add(Number(o.receptionId));
            if (o.plate) platesInOrders.add(String(o.plate).toLowerCase().replace(/[^a-zA-Z0-9]/g, ''));
        });
        
        // Lọc bỏ các xe trong xưởng nếu nó đã xuất hiện dưới dạng Đơn hàng (dựa trên ID tiếp nhận hoặc Biển số)
        const uniqueWaitingVehicles = waitingVehicles.filter((v: any) => {
            const hasIdMatch = receptionIdsInOrders.has(Number(v.id));
            const plateKey = String(v.plate || '').toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
            const hasPlateMatch = plateKey && platesInOrders.has(plateKey);
            return !hasIdMatch && !hasPlateMatch;
        });

        let items: any[] = [];
        if (activeVehicleFilter === 'PAYMENT') {
            items = recentOrders.filter((o: any) => o.status === 'WAITING_FOR_PAYMENT');
        } else if (activeVehicleFilter === 'QUOTES') {
            items = recentOrders.filter((o: any) => o.status === 'WAITING_FOR_CUSTOMER_APPROVAL' || o.status === 'QUOTING' || o.status === 'RE_QUOTATION');
        } else if (activeVehicleFilter === 'CANCELLED') {
            items = recentOrders.filter((o: any) => o.status === 'CANCELLED' || o.status === 'HUY');
        } else if (activeVehicleFilter === 'WAITING') {
            // "Trong xưởng" = Xe vừa tiếp nhận CHƯA có lệnh + Các đơn hàng ĐANG thực hiện (không phải chờ TT/báo giá/đã đóng/đã hủy)
            const activeOrders = recentOrders.filter((o: any) => 
                o.status !== 'WAITING_FOR_PAYMENT' && 
                o.status !== 'WAITING_FOR_CUSTOMER_APPROVAL' && 
                o.status !== 'CLOSED' && 
                o.status !== 'CANCELLED' &&
                o.status !== 'HUY' &&
                o.status !== 'COMPLETED'
            );
            items = [...uniqueWaitingVehicles, ...activeOrders];
        } else if (activeVehicleFilter === 'WARRANTY') {
            items = recentOrders.filter((o: any) => o.isWarranty === true);
        } else {
            // Mặc định "Tất cả": Hiện cả Receptions (đã lọc) và Recent Orders
            items = [...uniqueWaitingVehicles, ...recentOrders];
        }

        // Sắp xếp theo thời gian tạo (Mới nhất lên đầu)
        items.sort((a: any, b: any) => new Date(b.createdAt || b.receptionDate || 0).getTime() - new Date(a.createdAt || a.receptionDate || 0).getTime());

        if (vehicleSearch) {
            const q = vehicleSearch.toLowerCase();
            items = items.filter((i: any) => 
                (i.plate || i.plateNumber || '').toLowerCase().includes(q) || 
                (i.customerName || '').toLowerCase().includes(q) || 
                String(i.id).includes(q) ||
                (i.orderCode || i.MaDonHang || '').toLowerCase().includes(q)
            );
        }
        return items;
    }, [activeVehicleFilter, waitingVehicles, recentOrders, vehicleSearch]);

    const isReadOnly = useMemo(() => {
        if (!serverOrder?.status) return false;
        return isPostApproval(serverOrder.status);
    }, [serverOrder?.status]);

    const orderDetail = serverOrder; // Alias for convenience in existing code

    // ═══════════════════════════════════════════════════════
    // FILTERED CATALOG (from Drawer)
    // ═══════════════════════════════════════════════════════
    const filteredCatalog = useMemo(() => {
        let items = [...catalogItems];
        const isServiceCheck = (i: any) => {
            const isSvc = i.isService === true || i.is_service === true;
            const category = (i.category || i.categoryName || '').toLowerCase();
            const type = (i.type || i.productType || i.product_type || '').toLowerCase();
            return isSvc || category.includes('service') || category.includes('dịch vụ') || type.includes('service');
        };

        // Real-time stock calculation: Subtract items in cart from stock
        items = items.map(p => {
            if (isServiceCheck(p)) return p;
            const inCart = orderItems
                .filter(oi => oi.productId === p.id && !oi.isService)
                .reduce((acc, curr) => acc + curr.quantity, 0);
            
            // Try to find the correct stock field (stockQuantity, stock, or quantity)
            const baseStock = p.stockQuantity ?? p.stock ?? p.quantity ?? 0;
            return {
                ...p,
                stockQuantity: Math.max(0, baseStock - inCart)
            };
        });

        if (activeTab === 'SERVICE') items = items.filter(i => isServiceCheck(i));
        else if (activeTab === 'PART') items = items.filter(i => !isServiceCheck(i));

        if (selectedCatFilter !== 'ALL' && selectedCatFilter !== 'SERVICE' && selectedCatFilter !== 'INVENTORY') {
            items = items.filter(i => {
                const n = (i.name || '').toLowerCase();
                if (selectedCatFilter === 'MAINTENANCE') return n.includes('bảo dưỡng') || n.includes('thay dầu') || n.includes('rửa') || n.includes('định kỳ');
                if (selectedCatFilter === 'REPAIR') return n.includes('sửa') || n.includes('thay') || n.includes('phanh') || n.includes('khắc phục');
                if (selectedCatFilter === 'ELECTRIC') return n.includes('điện') || n.includes('đèn') || n.includes('ắc quy') || n.includes('ecu');
                if (selectedCatFilter === 'ENGINE') return n.includes('máy') || n.includes('động cơ') || n.includes('buồng đốt') || n.includes('piston');
                return true;
            });
        }
        if (catalogSearch) {
            const q = catalogSearch.toLowerCase();
            items = items.filter(i =>
                (i.name || '').toLowerCase().includes(q) ||
                (i.sku || i.code || '').toLowerCase().includes(q) ||
                String(i.id).includes(q)
            );
        }
        return items;
    }, [catalogItems, activeTab, selectedCatFilter, catalogSearch, orderItems]);

    // ═══════════════════════════════════════════════════════
    // FETCH CATALOG & TECHNICIANS (from Drawer)
    // ═══════════════════════════════════════════════════════
    const fetchCatalog = async () => {
        setIsFetchingCatalog(true);
        try {
            const res = await (productApi as any).getAllProducts({ params: { page: 0, size: 200 } });
            
            // Log to debug exact response structure in browser console
            console.log("[POS-Catalog] Raw Response:", res);

            let extracted: any[] = [];
            
            // Handle raw array or wrapped objects
            if (Array.isArray(res)) {
                extracted = res;
            } else if (res && typeof res === 'object') {
                const body = res as any;
                if (Array.isArray(body.data)) extracted = body.data;
                else if (Array.isArray(body.content)) extracted = body.content;
                else if (body.data && Array.isArray(body.data.content)) extracted = body.data.content;
                else if (Array.isArray(body.items)) extracted = body.items;
                else if (body.success && Array.isArray(body.data)) extracted = body.data;
            }
            
            setCatalogItems(extracted);
        } catch (error: any) {
            console.warn("[POS-Catalog] Failed to load:", error);
            // Don't toast 403 on mount to avoid annoying users on refresh
            if (error?.response?.status !== 403) {
                toast.error("Không tải được danh mục sản phẩm.");
            }
        }
        setIsFetchingCatalog(false);
    };

    const fetchTechnicians = async () => {
        try {
            const res = await (mechanicApi as any).getAvailableMechanics();
            const list = Array.isArray(res) ? res : (res?.data || []);
            setTechnicians(list);
        } catch (error) { 
            console.warn("[POS-Technicians] Failed to load list", error);
        }
    };

    useEffect(() => { fetchCatalog(); fetchTechnicians(); }, []);

    // ═══════════════════════════════════════════════════════
    // QR Payment URL (from Drawer)
    // ═══════════════════════════════════════════════════════
    useEffect(() => {
        if (paymentMethod === 'TRANSFER' && selectedOrderId) {
            import('@/lib/api').then(({ axiosInstance }) => {
                axiosInstance.get(`/api/transactions/qr-payment/${selectedOrderId}?amount=${Math.round(financial.total)}`)
                    .then((res: any) => {
                        if (res && res.qrUrl) setQrUrl(res.qrUrl);
                        else if (res && res.data && res.data.qrUrl) setQrUrl(res.data.qrUrl);
                    })
                    .catch(() => toast.error("Không thể lấy mã QR lúc này."));
            });
        }
    }, [paymentMethod, selectedOrderId, financial.total]);

    // ═══════════════════════════════════════════════════════
    // SYNC FROM SERVER ORDER (from Drawer)
    // ═══════════════════════════════════════════════════════
    useEffect(() => {
        if (serverOrder) {
            setActiveVehicle({
                licensePlate: serverOrder.plate || serverOrder.plateNumber || '',
                brand: serverOrder.vehicleBrand, model: serverOrder.vehicleModel,
                odo: serverOrder.odo,
            });
            setActiveCustomer({
                id: serverOrder.customerPhone || 'unknown',
                fullName: serverOrder.customerName || 'Khách vãng lai',
                phone: serverOrder.customerPhone || '',
            });
            const mapped: OrderItem[] = (serverOrder.items || []).map((item: any) => {
                // Lấy thông tin thợ chính từ assignments
                const mainAssignment = item.assignments?.find((a: any) => a.isMain) || item.assignments?.[0];
                return {
                    id: item.id || 0,
                    productId: item.productId,
                    name: item.productName,
                    itemName: item.productName || '',
                    quantity: item.quantity || 0,
                    price: item.unitPrice || 0,
                    discountPercent: item.discountPercent,
                    isService: item.isService,
                    vatPercent: item.vatPercentage,
                    technicianId: mainAssignment?.mechanicId,
                    technicianName: mainAssignment?.mechanicName,
                    oldPartAction: item.oldPartAction,
                    itemStatus: item.itemStatus  // e.g. "PROPOSAL", "APPROVED", etc.
                };
            });
            setOrderItems(mapped);
            setViewMode('POS');
        }
    }, [serverOrder]);

    // ═══════════════════════════════════════════════════════
    // HANDLERS (from Drawer - 100% preserved)
    // ═══════════════════════════════════════════════════════

    // Select vehicle from list
    const handleSelectVehicle = (item: any) => {
        const isOrder = item._type === 'ORDER';
        const orderId = isOrder ? item.id : item.orderId || item.id;
        setSelectedOrderId(orderId);
        setActiveVehicle({
            licensePlate: item.plate || item.plateNumber || '',
            brand: item.vehicleBrand,
            model: item.vehicleModel,
            odo: item.odometer || item.odo || 0,
            status: item.status || 'RECEIVED'
        });
        setActiveCustomer({
            id: item.customerId || item.customerPhone || 'unknown',
            fullName: item.customerName || 'Khách hàng',
            phone: item.customerPhone || '',
        });

        if (orderId) {
            setViewMode('POS');
        } else {
            setDiscoveryData(p => ({ ...p, odo: item.odometer || item.odo || 0 }));
            setViewMode('DISCOVERY');
        }
    };

    // New reception (no vehicle selected)
    const handleNewReception = () => {
        setSelectedOrderId(undefined);
        setActiveVehicle(null);
        setActiveCustomer(null);
        setOrderItems([]);
        setDiscountPercent(0);
        setViewMode('DISCOVERY');
        setDiscoveryData({ 
            odo: 0, 
            fuel: 50, 
            notes: '', 
            hasFuel: true, 
            hasDents: false, 
            isTiresOk: true, 
            isLightsOk: true, 
            hasPersonalItems: false, 
            isClean: true,
            photos: []
        });
    };

    // Add catalog item to cart
    const handleSelectItem = (item: any) => {
        if (isReadOnly) return;
        const isSvc = item.isService === true || (item.categoryName || '').toLowerCase().includes('dịch vụ');
        
        // Stock validation for parts
        if (!isSvc) {
            const inCart = orderItems
                .filter(oi => oi.productId === item.id)
                .reduce((acc, curr) => acc + curr.quantity, 0);
            const baseStock = item.stockQuantity ?? item.stock ?? item.quantity ?? 0;
            if (inCart >= baseStock) {
                return toast.error(`Sản phẩm ${item.name} đã hết tồn kho!`);
            }
        }

        const existing = orderItems.find(i => i.productId === item.id);

        if (selectedOrderId) {
            if (existing && typeof existing.id === 'number' && existing.id > 0) {
                handleUpdateQuantity(existing.id, 1);
            } else {
                addOrderItem.mutate({
                    orderId: Number(selectedOrderId),
                    productId: item.id,
                    quantity: 1
                });
            }
        } else {
            // Local mode for new reception
            if (existing) {
                setOrderItems(prev => prev.map(i => i.productId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
            } else {
                setOrderItems(prev => [...prev, {
                    id: `new-${Date.now()}`,
                    productId: item.id,
                    name: item.name,
                    itemName: item.name,
                    quantity: 1,
                    price: item.retailPrice || item.sellingPrice || 0,
                    unit: item.unit,
                    isService: isSvc,
                    vatPercent: item.vatRate || 0,
                    discountPercent: 0
                }]);
            }
        }
        toast.success(`Đã thêm: ${item.name}`);
    };

    // Complete discovery → create reception
    const handleCompleteDiscovery = async () => {
        if (!activeVehicle?.licensePlate) return toast.error("Vui lòng nhập biển số xe");
        
        const plateClean = activeVehicle.licensePlate.toUpperCase().replace(/[\s\-\.]/g, '');
        if (plateClean.length < 5) return toast.error("Biển số xe quá ngắn, vui lòng kiểm tra lại");
        const plateRegex = /^[0-9]{2}[A-Z]{1,2}[0-9]?[0-9]{4,5}$/;
        if (!plateRegex.test(plateClean)) {
            document.getElementById('pos-license-plate')?.focus();
            return toast.error('Biển số xe không hợp lệ (VD: 51A-123.45, 29B1-12345)');
        }

        const phone = activeCustomer?.phone?.trim();
        if (!phone) {
            document.getElementById('pos-customer-phone')?.focus();
            return toast.error("Vui lòng nhập số điện thoại khách hàng!");
        }

        const phoneRegex = /^(0|\+84)[0-9]{9}$/;
        if (!phoneRegex.test(phone.replace(/[\s\-\.]/g, ''))) {
            document.getElementById('pos-customer-phone')?.focus();
            return toast.error("Số điện thoại không hợp lệ (phải bắt đầu bằng 0 hoặc +84 và có 10 chữ số)!");
        }

        
        setIsLoading(true);
        try {
            const checklistNote = `Ghi chú: ${discoveryData.notes}`;
            const res: any = await receptionApi.createReception({
                receptionFormData: {
                    bienSo: activeVehicle.licensePlate,
                    odo: Number(discoveryData.odo) || 0,
                    nhanHieu: activeVehicle.brand,
                    model: activeVehicle.model,
                    tenKhach: activeCustomer?.fullName || 'Khách lẻ',
                    sdtKhach: phone.replace(/[\s\-\.]/g, ''),
                    mucXang: Number(discoveryData.fuel) || 0,
                    tinhTrangVo: `Lốp: ${discoveryData.isTiresOk ? 'OK' : 'Lỗi'}, Đèn: ${discoveryData.isLightsOk ? 'OK' : 'Lỗi'}, Trầy xước: ${discoveryData.hasDents ? 'Có' : 'Không'}`,
                    yeuCauKhach: checklistNote
                }
            });

            // After reception, we need to find the orderId. 
            // The API returns receptionId. We fetch reception details to get the automatically created orderId.
            if (!res.receptionId) {
                throw new Error("Không nhận được mã tiếp nhận từ hệ thống.");
            }
            
            const recepDetail: any = await receptionApi.getReceptionById({ id: res.receptionId });
            // Axios interceptor handles data extraction, but we check both cases for robustness
            const orderId = recepDetail?.orderId || recepDetail?.data?.orderId;

            if (orderId) {
                // If we have items in discovery cart, sync them now
                if (orderItems.length > 0) {
                    for (const item of orderItems) {
                        try {
                            await (saleApi as any).addItem({ orderId, productId: item.productId, quantity: item.quantity });
                        } catch (err) { console.error("Sync item fail", item.name); }
                    }
                }
                setSelectedOrderId(orderId);
                setViewMode('POS');
                toast.success("Tiếp nhận & Mở lệnh dịch vụ thành công!");
            } else {
                toast.warning("Tiếp nhận thành công nhưng chưa tạo được lệnh. Vui lòng kiểm tra lại.");
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.sale.all });
        } catch (e: any) {
            const msg = e.response?.data?.error || e.message || "Lỗi tiếp nhận";
            toast.error(`Lỗi: ${msg}`);
        }
        setIsLoading(false);
    };

    // Update item quantity
    const handleUpdateQuantity = async (itemId: any, delta: number) => {
        if (isReadOnly) return;
        const item = orderItems.find(i => i.id === itemId);
        if (!item) return;

        const newQty = Math.max(1, item.quantity + delta);

        if (selectedOrderId && typeof itemId === 'number' && itemId > 0) {
            updateOrderItem.mutate({
                orderId: Number(selectedOrderId),
                itemId,
                data: { 
                    quantity: newQty,
                    version: item.version // Enforce concurrency control
                }
            });
        } else {
            setOrderItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));
        }
    };

    // Remove item
    const handleRemoveItem = async (itemId: any) => {
        if (isReadOnly) return;
        const item = orderItems.find(i => i.id === itemId);
        if (selectedOrderId && typeof itemId === 'number' && itemId > 0) {
            removeOrderItem.mutate({
                orderId: Number(selectedOrderId),
                itemId,
                version: item?.version // Enforce concurrency control
            });
        } else {
            setOrderItems(prev => prev.filter(i => i.id !== itemId));
        }
        toast.info("Đã xóa hạng mục");
    };

    // Update technician
    const handleUpdateTechnician = async (itemId: any, techId: string | number) => {
        const id = techId === '' ? null : Number(techId);
        if (isReadOnly) return;
        const item = orderItems.find(i => i.id === itemId);
        if (selectedOrderId && typeof itemId === 'number' && itemId > 0 && item) {
            updateOrderItem.mutate({
                orderId: Number(selectedOrderId),
                itemId,
                data: { 
                    technicianId: id,
                    version: item.version // Enforce concurrency control
                }
            });
            // Toast removed to avoid clutter during automated syncs
        } else {
            const tech = technicians.find(t => t.id === id);
            setOrderItems(prev => prev.map(i => i.id === itemId ? { ...i, technicianId: id, technicianName: tech?.fullName } : i));
        }
    };

    const handleSyncDiscount = async (val: number) => {
        if (isReadOnly) return;
        setDiscountPercent(val);
        if (selectedOrderId) {
            updateOrderTotals.mutate({
                orderId: Number(selectedOrderId),
                discount: val,
                version: serverOrder?.version // Enforce concurrency control
            });
        }
    };

    // Update old part action
    const handleUpdateOldPartAction = async (itemId: number, action: string) => {
        if (isReadOnly) return;
        const item = orderItems.find(i => i.id === itemId);
        if (!item || !selectedOrderId) return;

        updateOrderItem.mutate({
            orderId: Number(selectedOrderId),
            itemId,
            data: { 
                oldPartAction: action,
                version: item.version // Crucial for optimistic locking
            }
        });
        toast.info(`Đã cập nhật xử lý đồ cũ: ${action === 'RETURN_TO_CUSTOMER' ? 'Trả khách' : action === 'KEEP_IN_GARAGE' ? 'Lưu kho' : 'Bỏ đi'}`);
    };

    // Real-time Payment Confirmation
    useEffect(() => {
        if (!selectedOrderId) return;
        subscribeToTopic('pos/payment');

        const handlePaymentSync = (data: any) => {
            if (data.orderId === Number(selectedOrderId)) {
                toast.success("Hệ thống đã nhận được tiền thanh toán!");
                refetch(); // Reload order data
            }
        };

        addListener('PAYMENT_SYNC', handlePaymentSync);
        return () => {
            removeListener('PAYMENT_SYNC', handlePaymentSync);
            unsubscribeFromTopic('pos/payment');
        };
    }, [selectedOrderId, addListener, removeListener, subscribeToTopic, unsubscribeFromTopic]);

    // Payment & Finalize
    const handlePayment = async () => {
        if (!selectedOrderId) return toast.error("Không tìm thấy mã đơn hàng");
        setIsLoading(true);
        try {
            const saleOrderId = Number(selectedOrderId);
            
            // 1. Finalize the order (status -> PENDING_PAYMENT or COMPLETED)
            await finalizeOrder.mutateAsync(saleOrderId);

            // 2. Create financial transaction
            await (transactionApi as any).createTransaction({
                orderId: saleOrderId,
                amount: financial.total,
                type: 'INCOME',
                method: paymentMethod === 'TRANSFER' ? 'BANK_TRANSFER' : 'CASH',
                note: `Thanh toán POS #${saleOrderId} - ${activeVehicle?.licensePlate}`
            });

            // 3. Final closure
            try { 
                await (saleApi as any).updateOrder({ id: saleOrderId, updateOrderDto: { status: 'COMPLETED' } });
            } catch (err) {
                console.warn("Could not set status to COMPLETED automatically");
            }

            toast.success("Thanh toán & Tất toán hoàn tất!");
            
            // Reset POS state
            setSelectedOrderId(undefined);
            setActiveVehicle(null);
            setActiveCustomer(null);
            setOrderItems([]);
            setDiscountPercent(0);
            setViewMode('IDLE');
            
            queryClient.invalidateQueries({ queryKey: queryKeys.sale.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
        } catch (e: any) {
            const msg = e.response?.data?.message || e.message || "Lỗi thanh toán";
            toast.error(`Thất bại: ${msg}`);
        }
        setIsLoading(false);
    };

    const totalVehicles = waitingVehicles.length + recentOrders.length;

    const upsaleSuggestion = useMemo(() => {
        const odo = activeVehicle?.odo || 0;
        if (!odo || odo === 0) return { title: 'Kiểm tra tổng quát', desc: 'Khảo sát 15 điểm an toàn và hệ thống.', tag: 'Khuyên dùng', colorCode: '16,185,129' };
        if (odo >= 40000) return { title: 'Bảo dưỡng cấp lớn (4 vạn)', desc: `Xe đang ở mốc ${odo.toLocaleString()}km, tới kỳ thay dầu hộp số, bảo dưỡng kim phun.`, tag: 'Quan trọng', colorCode: '239,68,68' };
        if (odo >= 30000) return { title: 'Gói vệ sinh buồng đốt', desc: `Xe đạt mốc ${odo.toLocaleString()}km, phù hợp làm sạch buồng đốt và bảo dưỡng gầm.`, tag: 'Hot', colorCode: '255,176,32' };
        if (odo >= 20000) return { title: 'Bảo dưỡng cấp trung', desc: `Xe đạt mốc ${odo.toLocaleString()}km, nên đảo lốp, cân bằng động và thay các loại lọc.`, tag: 'Đề xuất', colorCode: '59,130,246' };
        if (odo >= 10000) return { title: 'Bảo dưỡng cấp nhỏ', desc: `Xe đạt mốc ${odo.toLocaleString()}km, cần bảo dưỡng phanh, thay dầu động cơ.`, tag: 'Định kỳ', colorCode: '168,85,247' };
        return { title: 'Chăm sóc làm đẹp', desc: 'Gói tẩy ố kính, dọn nội thất chuyên sâu giúp xe bóng mới.', tag: 'Chăm sóc', colorCode: '14,165,233' };
    }, [activeVehicle?.odo]);

    // ═══════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════
    return (
        <>
            <POSStyles />
            <div className="pos-fullscreen">

                {/* ╔═══════════════════════════════════════════╗ */}
                {/* ║  COLUMN 1: VEHICLE LIST + CUSTOMER CARE   ║ */}
                {/* ╚═══════════════════════════════════════════╝ */}
                <div className="pos-col bg-[#080c16]">
                    {/* Header: Logo + New */}
                    <div className="pos-col-header">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                    <Zap className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-black tracking-tight text-white">Quầy Dịch Vụ</div>
                                    <p className="text-[9px] font-bold text-white/40 tracking-widest uppercase">POS Terminal</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button onClick={handleNewReception} title="Tiếp nhận xe mới"
                                    className="w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                                {/* Booking Panel Button */}
                                <button
                                    onClick={handleOpenBookingPanel}
                                    title="Lịch hẹn hôm nay"
                                    className="relative w-8 h-8 bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 rounded-lg flex items-center justify-center transition-colors border border-violet-500/30"
                                >
                                    <CalendarDays className="w-4 h-4" />
                                </button>
                                <button onClick={() => signOut({ callbackUrl: '/login' })} title="Đăng xuất"
                                    className="w-8 h-8 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg flex items-center justify-center transition-colors border border-rose-500/30">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>

                            {/* ══ BOOKING MANAGEMENT PANEL ══ */}
                            <AnimatePresence>
                            {showBookingPanel && (
                                <motion.div
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                                    className="fixed top-0 left-[280px] w-[380px] h-screen bg-[#0b0f1c] border-r border-white/[0.08] z-[9999] flex flex-col shadow-2xl"
                                >
                                    {/* ─ Header ─ */}
                                    <div className="flex-shrink-0 bg-[#0d1222]">
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] gap-2">
                                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-gradient-to-br from-violet-500/30 to-violet-600/10 border border-violet-500/30 flex items-center justify-center">
                                                    <CalendarDays className="w-4 h-4 text-violet-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-white leading-tight truncate">Quản lý Lịch hẹn</p>
                                                    <p className="text-[10px] text-white/50 line-clamp-1 truncate">
                                                        {bookings.filter(b => b.status === 'PENDING').length} CHỜ XÁC NHẬN - {bookings.filter(b => b.status === 'CONFIRMED').length} ĐÃ XÁC NHẬN
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <button onClick={() => setShowCreateBooking(v => !v)} title="Tạo lịch mới"
                                                    className={`h-7 px-3 rounded-lg text-[11px] font-black transition-all flex-shrink-0 flex items-center gap-1.5 ${
                                                        showCreateBooking ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' : 'bg-violet-600 hover:bg-violet-500 text-white'
                                                    }`}>
                                                    <Plus size={12} strokeWidth={3} /> <span className="whitespace-nowrap">Tạo mới</span>
                                                </button>
                                                <button onClick={fetchBookings} className="w-7 h-7 flex-shrink-0 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center">
                                                    <RefreshCw className={`w-3.5 h-3.5 text-white/40 ${isLoadingBookings ? 'animate-spin' : ''}`} />
                                                </button>
                                                <button onClick={() => setShowBookingPanel(false)} className="w-7 h-7 flex-shrink-0 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center">
                                                    <X className="w-4 h-4 text-white/50" />
                                                </button>
                                            </div>
                                        </div>
                                        {/* Stats bar */}
                                        <div className="grid grid-cols-3 divide-x divide-white/[0.05] border-b border-white/[0.06]">
                                            {[
                                                { label: 'Chờ duyệt', value: bookings.filter(b => b.status === 'PENDING').length,   color: 'text-amber-400' },
                                                { label: 'Đã duyệt',  value: bookings.filter(b => b.status === 'CONFIRMED').length, color: 'text-blue-400' },
                                                { label: 'Tổng',      value: bookings.length,                                       color: 'text-white' },
                                            ].map(s => (
                                                <div key={s.label} className="py-2 text-center">
                                                    <p className={`text-base font-black tabular-nums ${s.color}`}>{s.value}</p>
                                                    <p className="text-[8px] text-white/30 font-medium">{s.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ─ Create Form (inline) ─ */}
                                    <AnimatePresence>
                                    {showCreateBooking && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden flex-shrink-0 border-b border-white/[0.06]"
                                        >
                                            <div className="p-4 space-y-2.5 bg-violet-950/20">
                                                <p className="text-[10px] font-black text-violet-300 uppercase tracking-widest">Tạo lịch hẹn mới</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input placeholder="Tên khách hàng *" value={createForm.customerName}
                                                        onChange={e => setCreateForm(p => ({...p, customerName: e.target.value}))}
                                                        className="col-span-2 h-8 bg-white/[0.05] border border-white/10 rounded-lg px-3 text-[11px] text-white placeholder-white/30 outline-none focus:border-violet-500/60" />
                                                    <input placeholder="Số điện thoại *" value={createForm.phone}
                                                        onChange={e => setCreateForm(p => ({...p, phone: formatPhone(e.target.value)}))}
                                                        className="h-8 bg-white/[0.05] border border-white/10 rounded-lg px-3 text-[11px] text-white placeholder-white/30 outline-none focus:border-violet-500/60" />
                                                    <input placeholder="Biển số xe *" value={createForm.plate}
                                                        onChange={e => setCreateForm(p => ({...p, plate: formatPlate(e.target.value)}))}
                                                        className="h-8 bg-white/[0.05] border border-white/10 rounded-lg px-3 text-[11px] text-white font-mono placeholder-white/30 outline-none focus:border-violet-500/60" />
                                                    <input type="date" value={createForm.appointmentDate}
                                                        onChange={e => setCreateForm(p => ({...p, appointmentDate: e.target.value}))}
                                                        className="h-8 bg-white/[0.05] border border-white/10 rounded-lg px-3 text-[11px] text-white outline-none focus:border-violet-500/60" />
                                                    <input type="time" value={createForm.appointmentTime}
                                                        onChange={e => setCreateForm(p => ({...p, appointmentTime: e.target.value}))}
                                                        className="h-8 bg-white/[0.05] border border-white/10 rounded-lg px-3 text-[11px] text-white outline-none focus:border-violet-500/60" />
                                                </div>
                                                <input placeholder="Ghi chú dịch vụ (tuỳ chọn)" value={createForm.note}
                                                    onChange={e => setCreateForm(p => ({...p, note: e.target.value}))}
                                                    className="w-full h-8 bg-white/[0.05] border border-white/10 rounded-lg px-3 text-[11px] text-white placeholder-white/30 outline-none focus:border-violet-500/60" />
                                                <div className="flex gap-2">
                                                    <button onClick={handleCreateBooking} disabled={actionLoading === -1}
                                                        className="flex-1 h-8 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-[11px] font-black transition-colors flex items-center justify-center gap-1">
                                                        {actionLoading === -1 ? <RefreshCw size={11} className="animate-spin" /> : <CheckCheck size={11} />} Xác nhận tạo
                                                    </button>
                                                    <button onClick={() => setShowCreateBooking(false)}
                                                        className="h-8 px-3 bg-white/[0.05] hover:bg-white/10 rounded-lg text-[11px] text-white/60 transition-colors">
                                                        Huỷ
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    </AnimatePresence>

                                    {/* ─ Filter tabs ─ */}
                                    <div className="flex gap-1.5 px-4 py-2.5 border-b border-white/[0.06] flex-shrink-0 bg-[#080c18]">
                                        {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const).map(f => {
                                            const CFG: Record<string, { label: string; on: string }> = {
                                                ALL:       { label: 'Tất cả',    on: 'bg-white/10 text-white border border-white/20' },
                                                PENDING:   { label: 'Chờ duyệt', on: 'bg-amber-500/20 text-amber-300 border border-amber-500/40' },
                                                CONFIRMED: { label: 'Đã duyệt',  on: 'bg-blue-500/20 text-blue-300 border border-blue-500/40' },
                                                CANCELLED: { label: 'Đã hủy',    on: 'bg-red-500/20 text-red-300 border border-red-500/40' },
                                            };
                                            const count = f === 'ALL' ? bookings.length : bookings.filter(b => b.status === f).length;
                                            return (
                                                <button key={f} onClick={() => setBookingFilter(f)}
                                                    className={`flex-1 h-6 rounded-lg text-[9px] font-black transition-all border ${
                                                        bookingFilter === f ? CFG[f].on : 'bg-transparent text-white/30 border-white/[0.06] hover:bg-white/[0.05] hover:text-white/50'
                                                    }`}>
                                                    <span className="flex items-center justify-center gap-1">
                                                        {CFG[f].label}
                                                        {count > 0 && (
                                                            <span className="inline-flex items-center justify-center min-w-[14px] h-[14px] px-1 rounded-full bg-black/30 text-[8px] font-black tabular-nums">
                                                                {count}
                                                            </span>
                                                        )}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* ─ List ─ */}
                                    <div className="flex-1 overflow-y-auto pos-scrollbar p-3 space-y-2">
                                        {isLoadingBookings ? (
                                            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[88px] rounded-xl shimmer-bar" />)
                                        ) : filteredBookings.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full min-h-[280px] gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                                    <CalendarDays size={28} className="text-violet-500/50" />
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <p className="text-sm font-bold text-white/30">Chưa có lịch hẹn</p>
                                                    <p className="text-[11px] text-white/20">
                                                        {bookingFilter !== 'ALL' ? 'Không có lịch hẹn ở trạng thái này' : 'Nhấn "Tạo mới" để thêm lịch hẹn'}
                                                    </p>
                                                </div>
                                                {bookingFilter === 'ALL' && (
                                                    <button onClick={() => setShowCreateBooking(true)}
                                                        className="h-8 px-4 bg-violet-600/80 hover:bg-violet-600 rounded-xl text-[11px] font-black text-white transition-colors flex items-center gap-1.5">
                                                        <Plus size={12} /> Tạo lịch hẹn
                                                    </button>
                                                )}
                                            </div>
                                        ) : filteredBookings.map((booking: any) => {
                                            const rawTime = booking.appointmentTime || booking.ngayGio || '';
                                            const dt = rawTime ? new Date(rawTime) : null;
                                            const dateStr = dt ? dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '';
                                            const timeStr = dt ? dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—:—';
                                            const STATUS_CFG: Record<string, { label: string; badge: string; glow: string }> = {
                                                PENDING:   { label: 'Chờ duyệt', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',  glow: 'shadow-amber-900/20' },
                                                CONFIRMED: { label: 'Đã duyệt',  badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',     glow: 'shadow-blue-900/20' },
                                                ARRIVED:   { label: 'Đã đến',    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', glow: 'shadow-emerald-900/20' },
                                                COMPLETED: { label: 'Hoàn thành',badge: 'bg-white/5 text-white/30 border-white/10',            glow: '' },
                                                CANCELLED: { label: 'Đã hủy',    badge: 'bg-red-500/15 text-red-300 border-red-500/30',         glow: '' },
                                            };
                                            const cfg = STATUS_CFG[booking.status] || STATUS_CFG['PENDING'];
                                            const isActive = booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED';
                                            const isBusy = actionLoading === booking.id;

                                            return (
                                                <div key={booking.id} className={`rounded-xl border transition-all ${
                                                    isActive
                                                        ? `bg-white/[0.025] border-white/[0.08] hover:border-violet-500/30 hover:bg-white/[0.04] shadow-lg ${cfg.glow}`
                                                        : 'bg-white/[0.015] border-white/[0.04] opacity-45'
                                                }`}>
                                                    <div className="p-3 space-y-2.5">
                                                        {/* Top row: time badge + name + status */}
                                                        <div className="flex items-center gap-2.5">
                                                            {/* Time badge */}
                                                            <div className="flex-shrink-0 w-11 bg-violet-500/10 border border-violet-500/20 rounded-lg py-1.5 flex flex-col items-center gap-0">
                                                                <span className="text-[11px] font-black text-violet-300 tabular-nums leading-tight">{timeStr}</span>
                                                                {dateStr && <span className="text-[8px] text-violet-400/60 font-medium">{dateStr}</span>}
                                                            </div>
                                                            {/* Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                                    <p className="text-[11px] font-black text-white truncate">{booking.customerName || 'Khách hàng'}</p>
                                                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border flex-shrink-0 ${cfg.badge}`}>{cfg.label}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[9px] text-white/40">
                                                                    <span className="font-mono font-bold">{booking.plateNumber || booking.plate || '—'}</span>
                                                                    {(booking.customerPhone || booking.phone) && (
                                                                        <><span className="text-white/20">·</span><span>{booking.customerPhone || booking.phone}</span></>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Note */}
                                                        {(booking.note || booking.serviceNote) && (
                                                            <p className="text-[9px] text-white/40 bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/[0.05] leading-relaxed line-clamp-2">
                                                                {booking.note || booking.serviceNote}
                                                            </p>
                                                        )}

                                                        {/* Actions */}
                                                        {isActive && (
                                                            <div className="flex gap-1.5">
                                                                <button onClick={() => handleReceiveFromBooking(booking)}
                                                                    className="flex-1 h-7 bg-violet-600 hover:bg-violet-500 rounded-lg text-[10px] font-black transition-colors flex items-center justify-center gap-1">
                                                                    <ArrowRight size={10} /> Tiếp nhận
                                                                </button>
                                                                {booking.status === 'PENDING' && (
                                                                    <button onClick={() => handleConfirmBooking(booking.id)} disabled={isBusy}
                                                                        className="flex-1 h-7 bg-emerald-600/80 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-[10px] font-black transition-colors flex items-center justify-center gap-1">
                                                                        {isBusy ? <RefreshCw size={9} className="animate-spin" /> : <CheckCheck size={10} />} Duyệt
                                                                    </button>
                                                                )}
                                                                <button onClick={() => handleCancelBooking(booking.id)} disabled={isBusy} title="Hủy lịch"
                                                                    className="w-7 h-7 flex-shrink-0 bg-red-500/10 hover:bg-red-500/25 disabled:opacity-50 rounded-lg text-red-400 transition-colors flex items-center justify-center border border-red-500/20">
                                                                    {isBusy ? <RefreshCw size={9} className="animate-spin" /> : <X size={11} />}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* ─ Footer ─ */}
                                    <div className="px-4 py-2 border-t border-white/[0.06] flex-shrink-0 bg-[#080c18] flex items-center justify-between">
                                        <p className="text-[9px] text-amber-400/60 font-medium">
                                            {bookings.filter(b => b.status === 'PENDING').length > 0
                                                ? `⚠ ${bookings.filter(b => b.status === 'PENDING').length} lịch chờ xác nhận`
                                                : <span className="text-white/20">Không có lịch hẹn chờ</span>}
                                        </p>
                                        <p className="text-[9px] text-white/20">{filteredBookings.length}/{bookings.length}</p>
                                    </div>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>

                        {/* Search */}
                        <div className="relative mb-2">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                            <input type="text" placeholder="Biển số, tên KH..." value={vehicleSearch} onChange={e => setVehicleSearch(e.target.value)}
                                className="pos-input h-8 text-xs" style={{ paddingLeft: '30px' }} />
                        </div>

                        {/* Filter pills */}
                        <div className="flex gap-1 flex-wrap pb-1">
                            {VEHICLE_FILTERS.map(f => (
                                <button key={f.key} onClick={() => setActiveVehicleFilter(f.key as any)}
                                    className={`pos-chip text-[9px] flex items-center gap-1 ${activeVehicleFilter === f.key ? 'pos-chip-active' : ''}`}>
                                    <f.icon size={10} /> {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats mini bar */}
                    <div className="grid grid-cols-4 gap-1 px-3 py-2 border-b border-white/[0.04]">
                        {[
                            { label: 'Đang làm', value: countWaiting, color: 'text-blue-400' },
                            { label: 'Chờ chốt', value: countPendingQuotes, color: 'text-amber-400' },
                            { label: 'Chờ thu', value: countPendingPayment, color: 'text-emerald-400' },
                            { label: 'Bảo hành', value: countWarranty, color: 'text-purple-400' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <div className={`text-lg font-black tabular-nums ${s.color}`}>{s.value}</div>
                                <div className="text-[8px] font-bold text-white/30 uppercase">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Vehicle List */}
                    <div className="pos-col-body pos-scrollbar space-y-1.5">
                        {filteredVehicles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-white/20 gap-2">
                                <Car size={28} />
                                <p className="text-[11px] font-medium">Chưa có xe nào</p>
                            </div>
                        ) : (
                            filteredVehicles.map((item: any) => {
                                const isOrder = item._type === 'ORDER';
                                const itemId = item.id;
                                const isSelected = selectedOrderId === itemId || (isOrder && selectedOrderId === item.orderId);
                                const time = item.createdAt ? new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

                                return (
                                    <div key={`${item._type}-${itemId}`}
                                        onClick={() => handleSelectVehicle(item)}
                                        className={`pos-card ${isSelected ? 'vehicle-card-selected' : ''} group`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`px-2 py-1 rounded-md border font-extrabold text-[10px] tracking-wider tabular-nums flex-shrink-0
                                                ${isOrder 
                                                    ? (item.status === 'CANCELLED' || item.status === 'HUY')
                                                        ? 'bg-red-900/30 border-red-800 text-red-300'
                                                        : 'bg-emerald-900/30 border-emerald-800 text-emerald-300' 
                                                    : 'bg-blue-900/30 border-blue-800 text-blue-300'}`}>
                                                {item.plate || '—'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="text-xs font-bold text-white truncate">{item.customerName || 'Khách vãng lai'}</p>
                                                    {getStatusBadge(item.status || 'RECEIVED')}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] text-white/40 tabular-nums">{time}</span>
                                                    {isOrder && item.grandTotal > 0 && (
                                                        <span className="text-[9px] font-bold text-blue-400 tabular-nums">{item.grandTotal?.toLocaleString()}₫</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Customer Care Section */}
                    <div className="pos-col-footer border-t border-white/[0.04]">
                        <button onClick={() => setShowCarePanel(!showCarePanel)}
                            className="w-full flex items-center justify-between text-[10px] font-bold text-white/50 uppercase tracking-widest hover:text-white/80 transition-colors">
                            <span className="flex items-center gap-1.5"><Bell size={12} /> Chăm sóc KH</span>
                            <ChevronDown size={12} className={`transition-transform ${showCarePanel ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {showCarePanel && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-3 space-y-2">
                                    <div className="pos-card flex items-center gap-3 !p-3 border-l-2 border-l-amber-500">
                                        <PhoneCall size={14} className="text-amber-400 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-bold text-white truncate">Gọi khách lấy xe</p>
                                            <p className="text-[9px] text-white/40">2 xe sửa xong chờ trả</p>
                                        </div>
                                        <span className="pos-badge pos-badge-amber">2</span>
                                    </div>
                                    <div className="pos-card flex items-center gap-3 !p-3 border-l-2 border-l-emerald-500">
                                        <MessageSquare size={14} className="text-emerald-400 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-bold text-white truncate">Follow-up sau sửa</p>
                                            <p className="text-[9px] text-white/40">1 khách cần hỏi thăm</p>
                                        </div>
                                        <span className="pos-badge pos-badge-green">1</span>
                                    </div>
                                    <div className="pos-card flex items-center gap-3 !p-3 border-l-2 border-l-blue-500">
                                        <CalendarCheck size={14} className="text-blue-400 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-bold text-white truncate">Nhắc bảo dưỡng</p>
                                            <p className="text-[9px] text-white/40">3 khách đến lịch</p>
                                        </div>
                                        <span className="pos-badge pos-badge-blue">3</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ╔═══════════════════════════════════════════╗ */}
                {/* ║  COLUMN 2: CATALOG / DISCOVERY FORM       ║ */}
                {/* ╚═══════════════════════════════════════════╝ */}
                <div className="pos-col">
                    {viewMode === 'DISCOVERY' ? (
                        /* --- DISCOVERY MODE: Reception Form --- */
                        <>
                            <div className="pos-col-header">
                                <div className="flex items-center gap-2">
                                    <ClipboardCheck size={16} className="text-blue-400" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-white/80">Khảo sát tiếp nhận</span>
                                </div>
                            </div>
                            <div className="pos-col-body pos-scrollbar space-y-5">
                                {/* Plate input */}
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#60A5FA] mb-2 block">Biển số xe</label>
                                    <input type="text" value={activeVehicle?.licensePlate || ''}
                                        onChange={e => {
                                            const val = formatPlate(e.target.value);
                                            setActiveVehicle(p => p ? { ...p, licensePlate: val } : { licensePlate: val });
                                        }}
                                        placeholder="VD: 51A-123.45"
                                        className="pos-input text-lg font-extrabold tracking-[0.1em] text-center" />
                                </div>

                                {/* Customer info */}
                                <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06] space-y-3">
                                    <div className="pos-section-title !mb-0 !border-none !pb-0">
                                        <User size={14} /> Thông tin khách hàng
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#60A5FA]" />
                                            <input type="text" placeholder="Tên khách hàng" value={activeCustomer?.fullName || ''}
                                                onChange={e => setActiveCustomer(p => p ? { ...p, fullName: e.target.value } : { id: 'new', fullName: e.target.value, phone: '' })}
                                                className="pos-input !pl-9 !h-9 text-xs bg-black/20" />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#60A5FA]" />
                                            <input type="tel" id="pos-customer-phone" placeholder="Số điện thoại" value={activeCustomer?.phone || ''}
                                                onChange={e => {
                                                    const val = formatPhone(e.target.value);
                                                    setActiveCustomer(p => p ? { ...p, phone: val } : { id: 'new', fullName: '', phone: val });
                                                }}
                                                className="pos-input !pl-9 !h-9 text-xs bg-black/20" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder="Hãng xe" value={activeVehicle?.brand || ''}
                                            onChange={e => setActiveVehicle(p => p ? { ...p, brand: e.target.value } : { licensePlate: '', brand: e.target.value })}
                                            className="pos-input !h-9 text-xs bg-black/20" />
                                        <input type="text" placeholder="Dòng xe" value={activeVehicle?.model || ''}
                                            onChange={e => setActiveVehicle(p => p ? { ...p, model: e.target.value } : { licensePlate: '', model: e.target.value })}
                                            className="pos-input !h-9 text-xs bg-black/20" />
                                    </div>
                                </div>

                                {/* ODO & Fuel */}
                                <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06] space-y-4">
                                    <div>
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#60A5FA] mb-1.5 block">Chỉ số ODO (Km)</label>
                                        <input type="number" value={discoveryData.odo} onChange={e => setDiscoveryData(p => ({ ...p, odo: parseInt(e.target.value) || 0 }))}
                                            className="pos-input text-base font-extrabold" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1.5">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#60A5FA]">Mức nhiên liệu</label>
                                            <span className="text-xs font-extrabold">{discoveryData.fuel}%</span>
                                        </div>
                                        <input type="range" value={discoveryData.fuel} onChange={e => setDiscoveryData(p => ({ ...p, fuel: parseInt(e.target.value) }))}
                                            className="w-full h-2 bg-white/10 rounded-lg appearance-none accent-blue-500" />
                                    </div>
                                </div>

                                {/* Checklist */}
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'hasFuel', label: 'Xăng đầy', icon: <Fuel size={16} /> },
                                        { id: 'hasDents', label: 'Trầy/Móp', icon: <ShieldAlert size={16} /> },
                                        { id: 'isTiresOk', label: 'Lốp OK', icon: <Gauge size={16} /> },
                                        { id: 'isLightsOk', label: 'Đèn OK', icon: <Zap size={16} /> },
                                        { id: 'hasPersonalItems', label: 'Tư trang', icon: <Package size={16} /> },
                                        { id: 'isClean', label: 'Xe sạch', icon: <Sparkles size={16} /> }
                                    ].map(chk => (
                                        <button key={chk.id} onClick={() => setDiscoveryData(p => ({ ...p, [chk.id]: !p[chk.id as keyof typeof discoveryData] }))}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-[10px] font-bold ${discoveryData[chk.id as keyof typeof discoveryData]
                                                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                                                : 'bg-white/[0.03] border-white/[0.06] text-white/30'}`}>
                                            {chk.icon}
                                            <span>{chk.label}</span>
                                        </button>
                                    ))}
                                </div>


                                {/* ─ Photo Upload ─ */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#60A5FA]">Ảnh tình trạng xe</label>
                                        <span className="text-[9px] text-white/30">{discoveryData.photos.length}/6 ảnh</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {discoveryData.photos.map((url, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                                                <img src={url} alt={`Ảnh ${idx+1}`} className="w-full h-full object-cover" />
                                                <button onClick={() => setDiscoveryData(p => ({ ...p, photos: p.photos.filter((_, i) => i !== idx) }))}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X size={10} className="text-red-400" />
                                                </button>
                                            </div>
                                        ))}
                                        {discoveryData.photos.length < 6 && (
                                            <label className={`aspect-square rounded-xl border border-dashed ${
                                                isUploadingPhoto
                                                    ? 'border-blue-500/40 bg-blue-500/5 cursor-wait'
                                                    : 'border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer'
                                            } flex flex-col items-center justify-center gap-1 transition-all`}>
                                                <input type="file" accept="image/*" multiple className="hidden" disabled={isUploadingPhoto}
                                                    onChange={async e => {
                                                        const files = Array.from(e.target.files || []).slice(0, 6 - discoveryData.photos.length);
                                                        if (!files.length) return;
                                                        setIsUploadingPhoto(true);
                                                        try {
                                                            const uploaded: string[] = [];
                                                            for (const file of files) {
                                                                const fd = new FormData();
                                                                fd.append('file', file);
                                                                fd.append('folder', 'receptions');
                                                                const res = await api.upload('/api/images/upload', fd);
                                                                if (res?.url) uploaded.push(res.url);
                                                            }
                                                            setDiscoveryData(p => ({ ...p, photos: [...p.photos, ...uploaded].slice(0, 6) }));
                                                        } catch {
                                                            toast.error('Đã lỗi khi tải ảnh lên');
                                                        } finally {
                                                            setIsUploadingPhoto(false);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                                {isUploadingPhoto
                                                    ? <RefreshCw size={16} className="text-blue-400 animate-spin" />
                                                    : <Camera size={16} className="text-white/30" />}
                                                <span className="text-[9px] text-white/30 font-medium">
                                                    {isUploadingPhoto ? 'Đang tải...' : 'Thêm ảnh'}
                                                </span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Customer request */}
                                <textarea placeholder="Yêu cầu cụ thể từ khách hàng..." value={discoveryData.notes}
                                    onChange={e => setDiscoveryData(p => ({ ...p, notes: e.target.value }))}
                                    className="w-full h-24 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-xs outline-none focus:border-blue-500 resize-none" />
                            </div>
                            <div className="pos-col-footer">
                                <button onClick={handleCompleteDiscovery} disabled={isLoading}
                                    className="w-full h-11 bg-blue-600 rounded-xl font-bold text-sm hover:bg-blue-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                                    {isLoading ? 'Đang xử lý...' : 'Hoàn tất tiếp nhận'} <ArrowRight size={16} />
                                </button>
                            </div>
                        </>
                    ) : viewMode === 'POS' ? (
                        /* --- POS MODE: Catalog --- */
                        <>
                            <div className="pos-col-header space-y-2">
                                <div className="flex gap-1.5">
                                    <button onClick={() => setActiveTab('ALL')} className={`pos-chip flex items-center gap-1 ${activeTab === 'ALL' ? 'pos-chip-active' : ''}`}>Tất cả</button>
                                    <button onClick={() => setActiveTab('SERVICE')} className={`pos-chip flex items-center gap-1 ${activeTab === 'SERVICE' ? 'pos-chip-active' : ''}`}>
                                        <Wrench size={11} /> Dịch vụ
                                    </button>
                                    <button onClick={() => setActiveTab('PART')} className={`pos-chip flex items-center gap-1 ${activeTab === 'PART' ? 'pos-chip-active bg-emerald-500 border-emerald-400 text-white' : ''}`}>
                                        <Package size={11} /> Phụ tùng
                                    </button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                                    <input type="text" placeholder="Tìm dịch vụ, phụ tùng..." value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)}
                                        className="pos-input h-9 text-xs" style={{ paddingLeft: '30px' }} />
                                </div>
                                <div className="flex gap-1 flex-wrap pb-1">
                                    {FILTER_CATS.map(f => (
                                        <button key={f.key} onClick={() => setSelectedCatFilter(f.key)}
                                            className={`pos-chip text-[9px] ${selectedCatFilter === f.key ? 'pos-chip-active' : ''}`}>{f.label}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="pos-col-body pos-scrollbar space-y-2">
                                {isFetchingCatalog ? (
                                    Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-xl shimmer-bar" />)
                                ) : filteredCatalog.length === 0 ? (
                                    <div className="text-center py-12 text-white/30 font-semibold text-xs">Chưa có sản phẩm / dịch vụ nào</div>
                                ) : (
                                    filteredCatalog.map(item => (
                                        <div key={item.id} onClick={() => !isReadOnly && handleSelectItem(item)}
                                            className={`pos-card flex items-center justify-between group ${item.isService ? 'pos-card-service' : 'pos-card-part'} ${isReadOnly ? 'opacity-40 cursor-not-allowed filter grayscale-[0.5]' : ''}`}>
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.isService ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                                    {item.isService ? <Wrench size={14} /> : <Package size={14} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold truncate text-white">{item.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[10px] text-cyan-400 font-extrabold tabular-nums">{(item.retailPrice || 0).toLocaleString()}₫</p>
                                                        {!item.isService && (
                                                            <span className={`text-[9px] px-1 rounded ${(item.stockQuantity || item.stock || 0) > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-100'}`}>
                                                                Tồn: {item.stockQuantity || item.stock || 0}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {!isReadOnly && <Plus className="w-3.5 h-3.5 text-white/15 group-hover:text-blue-400 flex-shrink-0 transition-colors" />}
                                            {isReadOnly && <Shield className="w-3.5 h-3.5 text-white/10 flex-shrink-0" />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        /* --- IDLE MODE: Welcome screen --- */
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center space-y-4 max-w-xs">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                                    <Car className="w-8 h-8 text-blue-400" />
                                </div>
                                <div className="text-lg font-extrabold tracking-tight text-white">Chọn xe hoặc Tiếp nhận mới</div>
                                <p className="text-white/40 text-xs">Chọn 1 xe từ danh sách bên trái, hoặc bấm <strong className="text-blue-400">+</strong> để tiếp nhận xe mới.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ╔═══════════════════════════════════════════╗ */}
                {/* ║  COLUMN 3: VEHICLE & CUSTOMER INFO        ║ */}
                {/* ╚═══════════════════════════════════════════╝ */}
                <div className="pos-col">
                    <div className="pos-col-header">
                        <div className="flex items-center gap-2 text-[#60A5FA]">
                            <Car size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Hồ sơ Dịch vụ</span>
                        </div>
                    </div>
                    <div className="pos-col-body pos-scrollbar space-y-5">
                        {activeVehicle ? (
                            <>
                                {/* License Plate Hero */}
                                <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg border border-white/20">
                                            <span className="text-lg font-black tracking-[0.12em] text-white">{activeVehicle.licensePlate || '—'}</span>
                                        </div>
                                        {getStatusBadge(serverOrder?.status || activeVehicle.status || 'RECEIVED')}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-white">{activeVehicle.brand} {activeVehicle.model}</p>
                                            {activeVehicle.odo ? <p className="text-[10px] text-white/90 mt-0.5 uppercase tracking-wider font-extrabold">ODO: {activeVehicle.odo?.toLocaleString()} km</p> : null}
                                        </div>
                                        <Car className="w-5 h-5 text-blue-400 opacity-50" />
                                    </div>
                                </div>

                                {/* Customer Info (Read-only after reception) */}
                                <div>
                                    <div className="pos-section-title"><User size={14} /> Thông tin Khách hàng</div>
                                    <div className="space-y-2.5 bg-[#1e293b]/60 p-3 rounded-xl border border-white/10">
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#60A5FA]" />
                                            <input type="text" placeholder="Tên khách hàng" value={activeCustomer?.fullName || ''}
                                                readOnly
                                                className="pos-input !pl-9 !h-9 text-xs bg-black/20 opacity-70 cursor-not-allowed" />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#60A5FA]" />
                                            <input type="text" placeholder="Số điện thoại" value={activeCustomer?.phone || ''}
                                                readOnly
                                                className="pos-input !pl-9 !h-9 text-xs bg-black/20 opacity-70 cursor-not-allowed" />
                                        </div>
                                        {/* Quick call button */}
                                        {activeCustomer?.phone && (
                                            <a href={`tel:${activeCustomer.phone}`}
                                                className="flex items-center justify-center gap-2 w-full h-9 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-bold hover:bg-emerald-600/30 transition-colors">
                                                <PhoneCall size={14} /> Gọi ngay
                                            </a>
                                        )}
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="text" placeholder="Hãng xe" value={activeVehicle?.brand || ''}
                                                readOnly
                                                className="pos-input !h-9 text-xs bg-black/20 opacity-70 cursor-not-allowed" />
                                            <input type="text" placeholder="Dòng xe" value={activeVehicle?.model || ''}
                                                readOnly
                                                className="pos-input !h-9 text-xs bg-black/20 opacity-70 cursor-not-allowed" />
                                        </div>
                                    </div>
                                </div>

                                {/* Service History / Upsale */}
                                <div>
                                    <div className="pos-section-title text-[#10B981] border-[#10B981]/30">
                                        <History size={14} /> Lịch sử / Gợi ý
                                    </div>
                                    <div className="space-y-2">
                                        {serverOrder?.receptionId ? (
                                            <div className="bg-[#0f172a]/60 rounded-xl p-3 border border-[#10B981]/20">
                                                <div className="flex items-center gap-1.5 text-[9px] text-[#10B981]/80 font-bold mb-1 uppercase tracking-wide">
                                                    <Calendar size={10} /> Phiên hiện tại
                                                </div>
                                                <p className="text-xs font-bold text-white">Lần tiếp nhận này</p>
                                                <p className="text-[9px] text-white/50 mt-0.5">{serverOrder.items?.length || 0} hạng mục</p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-black/10 rounded-xl border border-white/5 border-dashed">
                                                <History className="w-6 h-6 text-white/10 mx-auto mb-1" />
                                                <div className="text-white/20 text-[10px] font-semibold uppercase tracking-wider">Chưa có lịch sử</div>
                                            </div>
                                        )}
                                        {/* Upsale suggestion */}
                                        <div className="rounded-xl p-3 hover:brightness-110 cursor-pointer transition-all"
                                            style={{ backgroundColor: `rgba(${upsaleSuggestion.colorCode}, 0.1)`, borderColor: `rgba(${upsaleSuggestion.colorCode}, 0.3)`, borderWidth: '1px' }}>
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: `rgba(${upsaleSuggestion.colorCode}, 0.7)` }}>Gợi ý Upsale</p>
                                                    <div className="font-bold text-xs mt-0.5" style={{ color: `rgb(${upsaleSuggestion.colorCode})` }}>{upsaleSuggestion.title}</div>
                                                </div>
                                                <span className="text-[8px] py-0.5 px-1.5 rounded font-black uppercase tracking-widest"
                                                    style={{ backgroundColor: `rgba(${upsaleSuggestion.colorCode}, 0.2)`, color: `rgb(${upsaleSuggestion.colorCode})` }}>
                                                    {upsaleSuggestion.tag}
                                                </span>
                                            </div>
                                            <p className="text-[9px] text-white/50 leading-relaxed">{upsaleSuggestion.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white/15 gap-2">
                                <User size={28} />
                                <p className="text-[11px]">Chọn xe để xem hồ sơ</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ╔═══════════════════════════════════════════╗ */}
                {/* ║  COLUMN 4: INVOICE & PAYMENT              ║ */}
                {/* ╚═══════════════════════════════════════════╝ */}
                <div className="pos-col bg-white/[0.01]">
                    <div className="pos-col-header">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-white/80">
                                <FileText size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Hóa đơn</span>
                                {selectedOrderId && <span className="text-[9px] text-white/40 ml-1">#{selectedOrderId}</span>}
                            </div>
                            <span className="pos-badge pos-badge-blue">{orderItems.length} hạng mục</span>
                        </div>
                        
                        {selectedOrderId && serverOrder && (
                            <div className="pt-3 border-t border-white/5">
                                <OrderActions 
                                    orderId={Number(selectedOrderId)}
                                    status={serverOrder.status}
                                    depositAmount={serverOrder.depositAmount}
                                    amountPaid={serverOrder.amountPaid}
                                    thoChanDoanId={serverOrder.thoChanDoanId}
                                />
                            </div>
                        )}
                    </div>

                    <div className="pos-col-body pos-scrollbar space-y-2">
                        {orderItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-white/15 gap-2">
                                <Package size={28} />
                                <p className="text-[11px]">Chưa có hạng mục nào</p>
                                <p className="text-[9px] text-white/10">Chọn dịch vụ / phụ tùng từ danh mục</p>
                            </div>
                        ) : orderItems.map((item, idx) => (
                            <motion.div key={`${item.id}-${idx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 space-y-2 group hover:border-white/[0.12] transition-all">
                                {/* Row 1: Name + Delete */}
                                <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-black text-white truncate">{item.name || item.itemName}</p>
                                        <p className="text-[9px] text-white/40 font-mono font-bold">#{(item.productId || 0).toString().padStart(4, '0')} · {item.isService ? 'DV' : 'PT'}</p>
                                    </div>
                                    {/* Delete / Lock button */}
                                    {(() => {
                                        // Cho phép xóa nếu:
                                        // 1. Đơn hàng chưa lưu (!selectedOrderId)
                                        // 2. Đơn hàng đang ở các bước đầu (Tiếp nhận/Báo giá)
                                        // 3. Hoặc hạng mục đó đang ở trạng thái chờ duyệt (PENDING/PROPOSAL)
                                        const isPostApprove = isPostApproval(serverOrder?.status);
                                        const isItemLocked = selectedOrderId && (!isItemPending(item.itemStatus) && isPostApprove) || isWaitingDiagnosis(serverOrder?.status);
                                        const isLocked = isItemLocked || isCompleted(serverOrder?.status) || isClosed(serverOrder?.status);

                                        if (isLocked) {
                                            return (
                                                <div className="relative group/lock">
                                                    <div className="p-1 rounded-md cursor-not-allowed opacity-40">
                                                        <Shield className="w-3 h-3 text-yellow-400" />
                                                    </div>
                                                    {/* Tooltip */}
                                                    <div className="absolute right-0 top-6 z-50 bg-[#1a1a2e] border border-yellow-500/30 rounded-lg px-2.5 py-1.5 text-[10px] text-yellow-300 whitespace-nowrap shadow-xl
                                                        opacity-0 group-hover/lock:opacity-100 pointer-events-none transition-opacity">
                                                        🔒 Hạng mục đã duyệt
                                                        <div className="text-[9px] text-white/40 mt-0.5">Chỉ xóa được hạng mục phát sinh</div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <button onClick={() => {
                                                if (selectedOrderId) {
                                                    handleRemoveItem(item.id);
                                                } else {
                                                    setOrderItems(prev => prev.filter(i => i.id !== item.id));
                                                }
                                            }}
                                                className="p-1 hover:bg-red-500/20 rounded-md transition-all">
                                                <Trash2 className="w-3 h-3 text-red-400/40 group-hover:text-red-400" />
                                            </button>
                                        );
                                    })()}
                                </div>

                                    {(() => {
                                        const isPostApprove = isPostApproval(serverOrder?.status);
                                        const isLocked = (selectedOrderId && !isItemPending(item.itemStatus) && isPostApprove) || isCompleted(serverOrder?.status) || isClosed(serverOrder?.status);
                                        return (
                                            <div className="flex justify-between items-center">
                                                <div className={`flex items-center bg-white/5 rounded-lg border border-white/[0.06] p-0.5 ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                                    <button onClick={() => {
                                                        if (isLocked) return;
                                                        if (selectedOrderId) handleUpdateQuantity(item.id, -1);
                                                        else setOrderItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i));
                                                    }}
                                                        disabled={!!isLocked}
                                                        className="p-1 hover:bg-white/10 rounded-md disabled:pointer-events-none"><Minus className="w-3 h-3" /></button>
                                                    <span className="w-8 text-center text-xs font-extrabold tabular-nums">{item.quantity}</span>
                                                    <button onClick={() => {
                                                        if (isLocked) return;
                                                        if (selectedOrderId) handleUpdateQuantity(item.id, 1);
                                                        else setOrderItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
                                                    }}
                                                        disabled={!!isLocked}
                                                        className="p-1 hover:bg-white/10 rounded-md disabled:pointer-events-none"><Plus className="w-3 h-3" /></button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-white tabular-nums">{(item.price * item.quantity).toLocaleString()}₫</p>
                                                    <p className="text-[9px] text-white/40 font-bold">{item.price.toLocaleString()} × {item.quantity}</p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                {/* Row 3: Technician (Read-only for Sale) */}
                                {item.isService ? (
                                        <div className="flex items-center gap-1.5 mb-2 px-1">
                                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                                <User className="w-3 h-3 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-white/90 leading-none">
                                                    <span className="text-white/70">
                                                        {item.technicianName || 'Chờ quản đốc phân công'}
                                                    </span>
                                                </p>
                                                <p className="text-[8px] text-white/40 font-medium">Kỹ thuật viên</p>
                                            </div>
                                        </div>
                                ) : (
                                    <div className="relative group/sel mb-2">
                                        <select
                                            value={item.oldPartAction || 'RETURN_TO_CUSTOMER'}
                                            disabled={!!isReadOnly}
                                            onChange={(e) => handleUpdateOldPartAction(Number(item.id), e.target.value)}
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
                                <button onClick={() => setExpandedNoteIdx(expandedNoteIdx === idx ? null : idx)}
                                    className="text-[9px] text-white/25 hover:text-white/50 transition-colors flex items-center gap-1">
                                    <ChevronDown size={9} className={`transition-transform ${expandedNoteIdx === idx ? 'rotate-180' : ''}`} /> Ghi chú
                                </button>
                                {expandedNoteIdx === idx && (
                                    <input type="text" placeholder="Nhập ghi chú..." value={item.note || ''}
                                        onChange={e => setOrderItems(p => p.map((it, i) => i === idx ? { ...it, note: e.target.value } : it))}
                                        className="pos-input h-7 text-[10px]" />
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer: Summary + Payment */}
                    <div className="pos-col-footer space-y-3">
                        {/* Summary */}
                        <div className="space-y-1.5 text-[11px]">
                            <div className="flex justify-between text-white/70"><span>Dịch vụ</span><span className="tabular-nums font-bold">{financial.serviceTotal.toLocaleString()}₫</span></div>
                            <div className="flex justify-between text-white/70"><span>Phụ tùng</span><span className="tabular-nums font-bold">{financial.partTotal.toLocaleString()}₫</span></div>
                            {/* Discount */}
                            <div className="flex justify-between items-center text-white/40">
                                <div className="flex items-center gap-1"><Percent size={10} /><span>Giảm giá</span></div>
                                <div className="flex items-center gap-1">
                                    <input type="number" min={0} max={100} value={discountPercent || ''} placeholder="0"
                                        disabled={!!isReadOnly}
                                        onChange={e => handleSyncDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                                        className="w-10 h-5 bg-white/5 border border-white/[0.06] rounded text-center text-[10px] outline-none focus:border-blue-500 tabular-nums disabled:opacity-40" />
                                    <span className="text-[9px]">%</span>
                                    {financial.discount > 0 && <span className="text-red-400 ml-1">-{financial.discount.toLocaleString()}₫</span>}
                                </div>
                            </div>
                            {/* VAT Grouped by Rate */}
                            {(() => {
                                const rates = Object.keys(financial.vatGroups || {}).sort((a,b) => Number(a) - Number(b));
                                if (rates.length === 0) return (
                                    <div className="flex justify-between text-white/40"><span>VAT (0%)</span><span className="tabular-nums font-bold">0₫</span></div>
                                );
                                return rates.map(rate => (
                                    <div key={rate} className="flex justify-between text-white/70">
                                        <span>VAT ({rate}%)</span>
                                        <span className="tabular-nums font-bold">{financial.vatGroups[rate].toLocaleString()}₫</span>
                                    </div>
                                ));
                            })()}
                            <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
                                <span className="text-xs font-bold">Tổng thanh toán</span>
                                <span className="text-lg font-extrabold tabular-nums text-white">{financial.total.toLocaleString()}<span className="text-[10px] text-white/40 ml-0.5">₫</span></span>
                            </div>
                        </div>

                        {/* Approve Quote Button (Chốt đơn) - Chỉ hoạt động nếu WAITING_FOR_CUSTOMER_APPROVAL */}
                        {selectedOrderId && !isPostApproval(serverOrder?.status) && (
                            <div className="mb-4 pt-2 border-t border-dashed border-white/10">
                                <button 
                                    onClick={() => {
                                        if (confirm("Xác nhận khách hàng đã chốt báo giá này? Đơn hàng sẽ chuyển sang giai đoạn thực hiện và không thể sửa đổi hạng mục.")) {
                                            approveQuote.mutate(Number(selectedOrderId));
                                        }
                                    }}
                                    disabled={!isWaitingForCustomer(serverOrder?.status) || approveQuote.isPending}
                                    className={`
                                        w-full h-11 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]
                                        ${isWaitingForCustomer(serverOrder?.status) 
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' 
                                            : 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'}
                                    `}
                                >
                                    {approveQuote.isPending ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4" />
                                    )}
                                    {isWaitingForCustomer(serverOrder?.status) ? 'XÁC NHẬN CHỐT BÁO GIÁ' : 'CHỜ QUẢN ĐỐC ĐỀ XUẤT'}
                                </button>
                                {!isWaitingForCustomer(serverOrder?.status) && (
                                    <div className="mt-2 p-2 bg-blue-500/5 border border-blue-500/10 rounded-lg text-center">
                                        <p className="text-[9px] text-blue-400 font-medium">Báo giá chỉ có thể chốt khi Quản đốc đã hoàn tất đề xuất.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment Method */}
                        <div className="flex gap-2">
                            <button onClick={() => setPaymentMethod('CASH')}
                                className={`flex-1 h-9 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${paymentMethod === 'CASH' ? 'bg-white text-slate-900' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/[0.06]'}`}>
                                <Banknote size={12} /> Tiền mặt
                            </button>
                            <button onClick={() => setPaymentMethod('TRANSFER')}
                                className={`flex-1 h-9 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${paymentMethod === 'TRANSFER' ? 'bg-white text-slate-900' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/[0.06]'}`}>
                                <QrCode size={12} /> Chuyển khoản
                            </button>
                        </div>

                        {/* QR Code for Transfer */}
                        {paymentMethod === 'TRANSFER' && selectedOrderId && (
                            <div className="bg-white rounded-xl p-3 flex flex-col items-center gap-1.5">
                                {qrUrl ? (
                                    <img src={`https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${financial.total}&addInfo=${encodeURIComponent(`DH${selectedOrderId}`)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`} 
                                        alt="QR Chuyển khoản" className="w-full max-w-[160px] h-auto rounded-lg cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => setShowZoomedQR(true)}
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/160x160/ffffff/000000?text=L%E1%BB%97i+QR'; }} />
                                ) : (
                                    <div className="w-[160px] h-[160px] bg-slate-100 animate-pulse rounded-lg flex items-center justify-center">
                                        <div className="text-slate-400 text-xs">Đang tải QR...</div>
                                    </div>
                                )}
                                <p className="text-[9px] text-slate-500 text-center">Quét mã QR · <b className="text-slate-800">{financial.total.toLocaleString()}₫</b></p>
                            </div>
                        )}
                        {paymentMethod === 'TRANSFER' && !selectedOrderId && (
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <p className="text-[10px] text-white/80">Vui lòng tiếp nhận đơn hàng trước.</p>
                            </div>
                        )}


                        {/* Cancel button if order exists but not locked */}
                        {selectedOrderId && !isReadOnly && (
                            <button 
                                onClick={() => {
                                    if (confirm("Bạn có chắc chắn muốn HỦY đơn hàng này không?")) {
                                        cancelOrderMut.mutate({ orderId: Number(selectedOrderId), reason: 'Hủy từ POS terminal' });
                                    }
                                }}
                                className="w-full h-9 mb-3 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-all flex items-center justify-center gap-2 text-[11px] font-bold"
                            >
                                <Trash2 size={14} /> Hủy đơn hàng
                            </button>
                        )}

                            {/* Pay Button */}
                            {paymentMethod === 'TRANSFER' && selectedOrderId ? (
                                <div className="space-y-2">
                                    <div className="w-full h-11 bg-indigo-500/10 border border-indigo-500/20 rounded-xl font-bold text-[11px] text-indigo-400 flex items-center justify-center gap-2 relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin relative z-10" />
                                        <span className="relative z-10 uppercase tracking-widest">Đang chờ hệ thống gạch nợ tự động...</span>
                                    </div>
                                    <button 
                                        onClick={handlePayment} 
                                        disabled={isLoading || isCompleted(serverOrder?.status) || isClosed(serverOrder?.status)}
                                        className="w-full text-[10px] text-slate-500 hover:text-slate-300 underline font-medium transition-colors disabled:opacity-30"
                                    >
                                        {isLoading ? 'Đang xử lý thủ công...' : 'Tiền chậm nổi? Xác nhận thủ công ngay'}
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={handlePayment} 
                                    disabled={
                                        orderItems.length === 0 || 
                                        isLoading || 
                                        isCompleted(serverOrder?.status) || 
                                        isClosed(serverOrder?.status) ||
                                        isReceived(serverOrder?.status) ||
                                        isWaitingDiagnosis(serverOrder?.status) ||
                                        isQuoting(serverOrder?.status) ||
                                        isWaitingForCustomer(serverOrder?.status)
                                    }
                                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 active:scale-[0.98] relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                    <span className="relative z-10">
                                        {isLoading ? 'Đang xử lý...' : 
                                         (isCompleted(serverOrder?.status) || isClosed(serverOrder?.status) ? 'Đơn hàng đã hoàn tất' : 
                                         (isReceived(serverOrder?.status) || isWaitingDiagnosis(serverOrder?.status) || isQuoting(serverOrder?.status) || isWaitingForCustomer(serverOrder?.status) ? 'Chưa thể thanh toán' :
                                         (paymentMethod === 'CASH' ? 'Thu tiền mặt & Hoàn tất' : 'Hoàn tất đơn hàng')))}
                                    </span>
                                    <CheckCircle2 className="w-4 h-4 relative z-10" />
                                </button>
                            )}
                        </div>
                    </div>

                {/* QR Zoom Modal */}
                <AnimatePresence>
                    {showZoomedQR && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowZoomedQR(false)}
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }} 
                                animate={{ scale: 1, y: 0 }} 
                                exit={{ scale: 0.9, y: 20 }} 
                                className="bg-white rounded-2xl p-6 relative max-w-sm w-full shadow-2xl"
                                onClick={e => e.stopPropagation()}
                            >
                                <button 
                                    onClick={() => setShowZoomedQR(false)}
                                    className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="text-center mb-6 mt-2">
                                    <h3 className="text-xl font-black text-slate-800">Quét mã thanh toán</h3>
                                    <p className="text-sm text-slate-500 font-medium">Đơn hàng #{selectedOrderId}</p>
                                </div>
                                <img 
                                    src={`https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${financial.total}&addInfo=${encodeURIComponent(`DH${selectedOrderId}`)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`} 
                                    alt="QR Chuyển khoản lớn" 
                                    className="w-full h-auto rounded-xl border-2 border-slate-100"
                                />
                                <div className="mt-6 text-center">
                                    <div className="text-3xl font-black text-indigo-600 tabular-nums tracking-tight">
                                        {financial.total.toLocaleString()}₫
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
