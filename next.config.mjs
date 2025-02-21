/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/:path*",
                destination: "http://15.207.232.194:9999/:path*", // Replace with actual backend URL
            },
        ];
    },
};

export default nextConfig;
