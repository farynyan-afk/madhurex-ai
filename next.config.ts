/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Production build ke waqt TS type errors ignore karega
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint errors ignore karega build ke dauraan
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;