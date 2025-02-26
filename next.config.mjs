/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/:path*",
                destination: "/:path*", // Replace with actual backend URL
            },
        ];
    },
};

export default nextConfig;
