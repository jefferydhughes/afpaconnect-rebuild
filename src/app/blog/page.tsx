import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Franchise Blog & Resources',
  description: 'Expert insights, tips, and guides to help you on your franchise ownership journey.',
}

async function getBlogPosts() {
  const supabase = createClient()
  
  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      category,
      featured_image_url,
      is_featured,
      published_at,
      author_id,
      profiles:author_id (full_name)
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  return posts || []
}

const categoryColors: Record<string, string> = {
  getting_started: 'bg-blue-100 text-blue-700',
  financing: 'bg-green-100 text-green-700',
  legal: 'bg-purple-100 text-purple-700',
  success_stories: 'bg-amber-100 text-amber-700',
  industry_insights: 'bg-cyan-100 text-cyan-700',
  tips_advice: 'bg-pink-100 text-pink-700',
}

const categoryLabels: Record<string, string> = {
  getting_started: 'Getting Started',
  financing: 'Financing',
  legal: 'Legal',
  success_stories: 'Success Stories',
  industry_insights: 'Industry Insights',
  tips_advice: 'Tips & Advice',
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  const featuredPosts = posts.filter(p => p.is_featured)
  const regularPosts = posts.filter(p => !p.is_featured)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-brand-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">AFPA Franchise Blog</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Expert insights, success stories, and practical guides to help you 
            navigate your franchise ownership journey.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.slice(0, 2).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow group">
                    {post.featured_image_url && (
                      <div className="aspect-video bg-gray-200 relative overflow-hidden">
                        <Image
                          src={post.featured_image_url}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {post.category && (
                          <Badge className={`${categoryColors[post.category] || 'bg-gray-100 text-gray-700'} border-0`}>
                            {categoryLabels[post.category] || post.category}
                          </Badge>
                        )}
                        <Badge className="bg-brand-gold text-brand-navy border-0">
                          Featured
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-brand-gold transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 line-clamp-2 mb-4">{post.excerpt}</p>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        {post.published_at && (
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(post.published_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-brand-cream px-4 py-2"
          >
            All Posts
          </Badge>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <Badge
              key={value}
              variant="outline"
              className="cursor-pointer hover:bg-brand-cream px-4 py-2"
            >
              {label}
            </Badge>
          ))}
        </div>

        {/* All Posts */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(regularPosts.length > 0 ? regularPosts : posts).map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow group">
                  {post.featured_image_url && (
                    <div className="aspect-video bg-gray-200 relative overflow-hidden rounded-t-lg">
                      <Image
                        src={post.featured_image_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-5">
                    {post.category && (
                      <Badge 
                        className={`${categoryColors[post.category] || 'bg-gray-100 text-gray-700'} border-0 mb-3`}
                      >
                        {categoryLabels[post.category] || post.category}
                      </Badge>
                    )}
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-brand-gold transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {post.published_at && (
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(post.published_at).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-brand-gold font-medium group-hover:underline flex items-center">
                        Read more
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Blog Coming Soon
            </h3>
            <p className="text-gray-600 mb-4">
              We&apos;re working on creating valuable content for aspiring franchise owners.
            </p>
            <Link href="/quiz">
              <Button>Take the Free Quiz Instead</Button>
            </Link>
          </Card>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 bg-brand-cream rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-brand-navy mb-4">
            Stay Updated on Franchise Opportunities
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Get the latest franchise insights, tips, and exclusive opportunities 
            delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
            <Button className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
