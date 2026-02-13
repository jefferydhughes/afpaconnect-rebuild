/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      // Legacy route redirects from old Base44 site
      {
        source: '/FranchiseDirectory',
        destination: '/directory',
        permanent: true,
      },
      {
        source: '/Quiz',
        destination: '/quiz',
        permanent: true,
      },
      {
        source: '/quiz-results',
        destination: '/quiz/results',
        permanent: true,
      },
      {
        source: '/FranchiseListing',
        destination: '/directory',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
