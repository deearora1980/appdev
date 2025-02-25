const { withContentlayer } = require('next-contentlayer2')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// Content Security Policy (CSP)
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app analytics.umami.is;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src *.s3.amazonaws.com;
  connect-src *;
  font-src 'self';
  frame-src giscus.app https://stories.google/;
`

// Security Headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

const isStaticExport = process.env.EXPORT === 'true'
const output = isStaticExport ? 'export' : undefined
const basePath = process.env.BASE_PATH || undefined
const nextConfig = {
  basePath: '/appdev', // Replace with your repository name
  output: 'export', // Required for static export
  images: {
    unoptimized: true, // Disable image optimization for static export
  },
};

module.exports = nextConfig;
const unoptimized = isStaticExport ? true : undefined
/*
const { withImageExportOptimizer } = require('next-image-export-optimizer');

module.exports = withImageExportOptimizer({
  images: {
    loader: 'custom',
    loaderFile: './custom-image-loader.js',
  },
  // other Next.js configurations
});

const imageLoader = ({ src, width, quality }) => {
  return `/path/to/optimized/images/${src}?w=${width}&q=${quality || 75}`;
};

module.exports = imageLoader;
*/
/**
 * @type {import('next').NextConfig}
 **/
module.exports = () => {
  const plugins = [withContentlayer, withBundleAnalyzer]

  return plugins.reduce((acc, next) => next(acc), {
    output,
    basePath,
    reactStrictMode: true,
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    eslint: {
      dirs: ['app', 'components', 'layouts', 'scripts'],
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
        },
      ],
      unoptimized,
    },
    async headers() {
      if (isStaticExport) {
        return [] // Prevents build failure due to static export limitations
      }
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
      ]
    },
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      })
      return config
    },
  })
}
