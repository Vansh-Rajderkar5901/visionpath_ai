/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // All images are served from the app itself or as local blob previews, so no
  // remote image hosts need allow-listing.
};

module.exports = nextConfig;
