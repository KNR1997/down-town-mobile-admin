/** @type {import('next').NextConfig} */

const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  i18n,
  images: {
    remotePatterns: [
      { hostname: 'via.placeholder.com' },
      { hostname: 'res.cloudinary.com' },
      { hostname: 's3.amazonaws.com' },
      { hostname: '18.141.64.26' },
      { hostname: '127.0.0.1' },
      { hostname: 'localhost' },
      { hostname: 'picsum.photos' },
      { hostname: 'pickbazar-sail.test' },
      { hostname: 'pickbazarlaravel.s3.ap-southeast-1.amazonaws.com' },
      { hostname: 'lh3.googleusercontent.com' },
    ],
    // Next 16 blocks optimizing images from private IPs by default.
    // Allow it outside production so a local API (127.0.0.1 / localhost) keeps working.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
  },
  ...(process.env.APPLICATION_MODE === 'production' && {
    typescript: {
      ignoreBuildErrors: true,
    },
  }),
};

module.exports = nextConfig;
