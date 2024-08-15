/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      KV_REST_API_URL: process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    },
  };
  
  export default nextConfig;
