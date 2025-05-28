/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['qnpwynomeazsbhlenltx.supabase.co'], // Removed https://
    },
    webpack: (config) => {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        bufferutil: 'commonjs bufferutil',
      });
      return config;
    },
  };
  
  export default nextConfig;
  