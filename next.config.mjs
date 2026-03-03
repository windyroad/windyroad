import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  outputFileTracingRoot: __dirname,
  sassOptions: {},
typescript: {
    // Type checking will be enabled once migration is complete
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
