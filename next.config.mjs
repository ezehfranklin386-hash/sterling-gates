import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable the new App Router for API routes
  },
  webpack: (config) => {
    // Support importing from frontend directory
    config.resolve.alias['@frontend'] = resolve(__dirname, 'frontend/src');
    return config;
  },
};

export default nextConfig;
