'use client';

export default function PrintButton() {
    return (
        <button
            className="print-btn"
            onClick={() => window.print()}
        >
            IN PHIẾU XUẤT
        </button>
    );
}
