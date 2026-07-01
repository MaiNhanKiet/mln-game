import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Cho phép truy cập dev qua ngrok / tunnel khác
  allowedDevOrigins: ['*.ngrok-free.app', '*.ngrok-free.dev', '*.ngrok.io', '*.ngrok.app'],
}

export default nextConfig
