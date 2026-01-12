/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep console.error and console.warn
    } : false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), clipboard-write=*, display-capture=()',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://kit.fontawesome.com https://use.fontawesome.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://kit.fontawesome.com https://use.fontawesome.com https://ka-p.fontawesome.com https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://kit.fontawesome.com https://use.fontawesome.com https://ka-p.fontawesome.com https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://*.netlify.app https://kit.fontawesome.com https://use.fontawesome.com https://ka-p.fontawesome.com https://cdnjs.cloudflare.com https://cirrjwaknafiuaxaczrf.supabase.co https://*.supabase.co wss://cirrjwaknafiuaxaczrf.supabase.co wss://*.supabase.co; frame-src 'self'",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
