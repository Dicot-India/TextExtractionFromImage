/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://15.207.232.194:5000/:path*", // Replace with actual backend URL
            },
        ];
    },
};

export default nextConfig;
