'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Search } from 'lucide-react'

interface HeroSectionProps {
  hasSavedMatches: boolean
  matchesHref: string
  displayName: string | null
}

export default function HeroSection({ hasSavedMatches, matchesHref, displayName }: HeroSectionProps) {
  const router = useRouter()
  const [heroSearchTerm, setHeroSearchTerm] = useState('')

  function handleHeroSearch() {
    if (heroSearchTerm.trim()) {
      router.push(`/directory?search=${encodeURIComponent(heroSearchTerm)}`)
    } else {
      router.push('/directory')
    }
  }

  if (hasSavedMatches) {
    const name = displayName || 'there'
    return (
      <section className="relative text-white bg-gradient-to-br from-[#062234] via-[#202C3D] to-[#062234] py-32 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-[#C19B3F] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-[#859FAD] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob [animation-delay:2s]" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#CEC8B1] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob [animation-delay:4s]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 container mx-auto px-6 text-center"
        >
          {/* Welcome Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center px-6 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-full mb-6 border border-white/20 shadow-lg"
          >
            <Sparkles className="w-4 h-4 mr-2 text-[#C19B3F]" />
            <span className="font-medium">Welcome back, {name}!</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-[#CEC8B1] to-white bg-clip-text text-transparent"
          >
            Your Personalized Franchise Matches Are Ready
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed"
          >
            Let&apos;s pick up where you left off. View your personalized franchise matches now.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href={matchesHref}>
              <Button className="group relative bg-gradient-to-r from-[#C19B3F] to-[#D4AB4F] text-[#062234] px-8 py-6 rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(193,155,63,0.4)] transition-all duration-300 hover:scale-105 text-lg shadow-xl">
                View Your Matches
                <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/directory">
              <Button variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-6 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm text-lg hover:scale-105">
                Browse All Franchises
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    )
  }

  // Default hero
  return (
    <section className="relative flex items-center justify-center bg-gradient-to-br from-[#062234] via-[#202C3D] to-[#0a1929] overflow-hidden min-h-[700px] lg:min-h-[750px]">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#C19B3F] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#859FAD] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob [animation-delay:2s]" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-[#CEC8B1] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.15] animate-blob [animation-delay:4s]" />
      </div>

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage:
            "url('https://plus.unsplash.com/premium_photo-1664298350269-dcc183a64603?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl px-6 text-center text-white py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 bg-[#C19B3F]/20 backdrop-blur-sm text-[#C19B3F] rounded-full mb-8 border border-[#C19B3F]/30"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="font-medium text-sm">AI-Powered Franchise Matching</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-[#CEC8B1] to-white bg-clip-text text-transparent">
              Find Your Perfect
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#C19B3F] via-[#D4AB4F] to-[#C19B3F] bg-clip-text text-transparent">
              Franchise Opportunity
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-white/80 max-w-3xl mx-auto leading-relaxed">
            Skip the Guesswork. Explore hundreds of franchise opportunities tailored to your goals.
          </p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch overflow-hidden border border-white/20 max-w-3xl mx-auto hover:shadow-[0_0_40px_rgba(193,155,63,0.3)] transition-shadow duration-300"
          >
            <div className="flex-1 flex items-center px-6 py-4">
              <Search className="w-5 h-5 text-white/50 mr-3" />
              <input
                type="text"
                placeholder="Search franchises by name, industry, or city..."
                className="flex-1 bg-transparent text-white placeholder-white/50 focus:outline-none text-lg"
                value={heroSearchTerm}
                onChange={(e) => setHeroSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleHeroSearch()
                }}
              />
            </div>

            <button
              onClick={handleHeroSearch}
              className="bg-gradient-to-r from-[#C19B3F] to-[#D4AB4F] text-[#062234] px-8 py-4 font-bold hover:shadow-[0_0_30px_rgba(193,155,63,0.5)] transition-all duration-300 hover:scale-105"
            >
              Search
            </button>
          </motion.div>

          {/* Supporting CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8"
          >
            <Link
              href="/quiz"
              className="group inline-flex items-center text-base md:text-lg text-white/90 hover:text-[#C19B3F] transition-colors font-medium"
            >
              Not sure where to start? Take the FranchiseFit360&trade; Quiz
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
