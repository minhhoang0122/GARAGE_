/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['lucide-react', '@/components/ui'],
    },
    // Performance optimizations
    reactStrictMode: false, // Disable double-render in dev
    poweredByHeader: false, // Remove X-Powered-By header
    compress: true, // Enable gzip compression
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    // Faster refresh
    onDemandEntries: {
        maxInactiveAge: 5 * 60 * 1000, // 5 minutes (was 60s)
        pagesBufferLength: 5,
    },
};

module.exports = nextConfig;
