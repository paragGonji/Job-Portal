/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  // Allow images from these domains
  images: {
    domains: ['api.dicebear.com', 'xsgames.co'],
  },

  // Optional: ignore ESLint errors during build (helps Vercel deploy)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Standalone output for Vercel
  output: "standalone",

  // Custom Webpack configuration if needed
  webpack: (config, { isServer }) => {
    // Example: if you need pdf.worker as a resource
    config.module.rules.push({
      test: /pdf\.worker\.min\.js$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/chunks/[name][ext]',
      },
    });

    return config;
  },
};

module.exports = nextConfig;
