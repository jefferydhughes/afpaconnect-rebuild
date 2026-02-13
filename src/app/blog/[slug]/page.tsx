import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Calendar, User, ArrowLeft, Share2, Clock, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

async function getBlogPost(slug: string) {
  const supabase = createClient()
  
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      profiles:author_id (full_name, avatar_url)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !post) {
    return null
  }

  // Get related posts
  const { data: relatedPosts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, featured_image_url, published_at')
    .eq('is_published', true)
    .eq('category', post.category)
    .neq('id', post.id)
    .limit(3)

  return { post, relatedPosts: relatedPosts || [] }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getBlogPost(params.slug)
  
  if (!data) {
    return { title: 'Post Not Found' }
  }

  return {
    title: data.post.seo_title || data.post.title,
    description: data.post.seo_description || data.post.excerpt,
  }
}

const categoryLabels: Record<string, string> = {
  getting_started: 'Getting Started',
  financing: 'Financing',
  legal: 'Legal',
  success_stories: 'Success Stories',
  industry_insights: 'Industry Insights',
  tips_advice: 'Tips & Advice',
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const data = await getBlogPost(params.slug)

  if (!data) {
    notFound()
  }

  const { post, relatedPosts } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/blog" 
            className="text-gray-500 hover:text-brand-navy flex items-center text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Blog
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          {post.category && (
            <Badge variant="outline" className="mb-4">
              {categoryLabels[post.category] || post.category}
            </Badge>
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {post.profiles && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {post.profiles.avatar_url ? (
                    <Image
                      src={post.profiles.avatar_url}
                      alt={post.profiles.full_name || 'Author'}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <span>{post.profiles.full_name || 'AFPA Team'}</span>
              </div>
            )}
            
            {post.published_at && (
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            )}

            <Button variant="ghost" size="sm" className="ml-auto">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-8 relative">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8 pb-8 border-b">
            <Tag className="h-4 w-4 text-gray-400" />
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* CTA */}
        <Card className="bg-brand-cream border-brand-gold mb-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold text-brand-navy mb-2">
              Ready to Find Your Perfect Franchise?
            </h3>
            <p className="text-gray-600 mb-4">
              Take our free 3-minute quiz and get matched with franchises that fit your goals.
            </p>
            <Link href="/quiz">
              <Button className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
                Take the Free Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow group">
                    {related.featured_image_url && (
                      <div className="aspect-video bg-gray-200 relative overflow-hidden rounded-t-lg">
                        <Image
                          src={related.featured_image_url}
                          alt={related.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-brand-gold transition-colors line-clamp-2 mb-2">
                        {related.title}
                      </h3>
                      {related.published_at && (
                        <span className="text-xs text-gray-500">
                          {new Date(related.published_at).toLocaleDateString()}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  )
}
