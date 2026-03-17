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
        source: '/quiz-results',
        destination: '/quiz/results',
        permanent: true,
      },
      {
        source: '/FranchiseListing',
        destination: '/directory',
        permanent: true,
      },
      // Old consultantpage → new SEO-friendly advisor profile
      // e.g. /consultantpage?name=jozette-wright → /advisors/jozette-wright
      {
        source: '/consultantpage',
        has: [{ type: 'query', key: 'name', value: '(?<name>.+)' }],
        destination: '/advisors/:name',
        permanent: true,
      },
      {
        source: '/consultantpage',
        destination: '/advisors',
        permanent: true,
      },
      // Legacy franchise advisors page → new find-an-advisor
      {
        source: '/franchiseadvisors',
        destination: '/find-an-advisor',
        permanent: true,
      },
      {
        source: '/FranchiseAdvisors',
        destination: '/find-an-advisor',
        permanent: true,
      },
      // Old advisorpage with name param → new slug URL
      {
        source: '/advisorpage',
        has: [{ type: 'query', key: 'name', value: '(?<name>.+)' }],
        destination: '/advisors/:name',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
