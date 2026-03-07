const BASE_URL = 'http://localhost:8081/api';

async function testLogin(username, password) {
    console.log(`\n[TEST] Đang kiểm tra đăng nhập cho User: ${username}...`);
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ Đăng nhập THÀNH CÔNG cho ${username}`);
            console.log(`🔑 Token: ${data.token.substring(0, 20)}...`);

            // Step 2: Check permissions via /auth/me
            await testMe(data.token, username);
        } else {
            console.log(`❌ Đăng nhập THẤT BẠI cho ${username}: ${data.error || response.statusText}`);
        }
    } catch (error) {
        console.error(`💥 Lỗi kết nối khi test ${username}:`, error.message);
    }
}

async function testMe(token, username) {
    try {
        const response = await fetch(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`📊 Vai trò (Roles): [${data.roles.join(', ')}]`);
            console.log(`🛡️ Quyền hạn (Permissions): ${data.permissions.length} items`);

            // Verify specific permissions based on username
            if (username === 'admin') {
                if (data.permissions.includes('MANAGE_USERS')) {
                    console.log('✨ XÁC MINH: Admin có đầy đủ quyền quản trị.');
                }
            } else if (username === 'kho1') {
                if (data.permissions.includes('MANAGE_INVENTORY')) {
                    console.log('✨ XÁC MINH: Nhân viên kho có quyền quản lý kho.');
                }
            } else if (username === 'sale1') {
                if (data.permissions.includes('CREATE_RECEPTION')) {
                    console.log('✨ XÁC MINH: Sale có quyền tiếp nhận xe.');
                }
            }
        } else {
            console.log(`❌ Lỗi khi lấy thông tin user ${username}:`, data.error);
        }
    } catch (error) {
        console.error(`💥 Lỗi kết nối khi gọi /me cho ${username}:`, error.message);
    }
}

async function runAllTests() {
    console.log('🚀 BẮT ĐẦU CHƯƠNG TRÌNH KIỂM THỨ TỰ ĐỘNG RBAC 10/10');
    console.log('====================================================');

    // Seed users first to ensure data exists
    console.log('[SETUP] Đang khởi tạo dữ liệu mẫu (Seeding)...');
    try {
        await fetch(`${BASE_URL}/auth/seed-users`);
        console.log('✅ Seeding thành công.');
    } catch (e) {
        console.log('⚠️ Seeding có thể đã tồn tại hoặc lỗi kết nối.');
    }

    // Test cases
    await testLogin('admin', '123456');
    await testLogin('sale1', '123456');
    await testLogin('kho1', '123456');
    await testLogin('tho1', '123456');

    console.log('\n====================================================');
    console.log('🏁 KẾT THÚC KIỂM THỬ.');
}

runAllTests();
