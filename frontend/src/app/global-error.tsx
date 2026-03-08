'use client'; // Error components must be Client Components

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="vi">
            <body>
                <div className="min-h-screen flex items-center justify-center p-4" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    <div style={{ textAlign: 'center', maxWidth: '500px' }}>
                        <h1 style={{ color: '#dc2626', fontSize: '2rem', marginBottom: '1rem' }}>Lỗi Hệ Thống Nghiêm Trọng</h1>
                        <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
                            Không thể tải giao diện gốc của ứng dụng. Vui lòng thử tải lại trang hoặc liên hệ quản trị viên.
                        </p>
                        <button
                            onClick={() => reset()}
                            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}
                        >
                            Tải Lại Ứng Dụng
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
