'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Brain, Star, TrendingUp, Award, Download, Share2, Users,
  Target, Lightbulb, Building2, ArrowRight, CheckCircle, Info, Loader2,
} from 'lucide-react'
import RadarSummaryChart from './RadarSummaryChart'

// ---------------------------------------------------------------------------
// Icon selector
// ---------------------------------------------------------------------------
const TRAIT_ICON_MAP: Record<string, React.ElementType> = {
  Thinker: Brain, Achiever: TrendingUp, Collaborate: Users, Compete: Award,
  Create: Lightbulb, Control: Target, Entrepreneur: Lightbulb, Partner: Users,
  'Plug & Play': Target, Empire: Building2, Director: Building2, Connector: Share2,
}
function PrimaryIcon({ trait, ...props }: { trait: string; className?: string }) {
  const Icon = TRAIT_ICON_MAP[trait] ?? Star
  return <Icon {...props} />
}

// ---------------------------------------------------------------------------
// Trait → dimension map
// ---------------------------------------------------------------------------
const TRAIT_DIMENSION: Record<string, string> = {
  Thinker: 'Work Style', Achiever: 'Work Style', Director: 'Work Style', Connector: 'Work Style',
  Collaborate: 'Culture', Compete: 'Culture', Create: 'Culture', Control: 'Culture',
  Entrepreneur: 'Stage Fit', Partner: 'Stage Fit', 'Plug & Play': 'Stage Fit', Empire: 'Stage Fit',
  Internal: 'Meta Programs', External: 'Meta Programs', Structured: 'Meta Programs', 'Rule Breaker': 'Meta Programs',
  'Leadership & Vision': 'Competencies', Operations: 'Competencies', 'R&D & Innovation': 'Competencies', 'Finance & Admin': 'Competencies',
}

// ---------------------------------------------------------------------------
// Data maps
// ---------------------------------------------------------------------------
const TRAIT_DESCRIPTIONS: Record<string, { description: string; motto: string; strengths: string[]; workplace: string }> = {
  Thinker: { description: "Analytical and logical, you excel at strategy and problem-solving. You prefer data-driven decisions and a structured approach to tasks.", motto: "Let's analyze this logically.", strengths: ["Strategic planning", "Objective analysis", "Problem-solving", "Attention to detail"], workplace: "A role that values expertise and allows for deep thinking and analysis." },
  Achiever: { description: "Goal-oriented and driven, you are motivated by tangible results and success. You are persistent and thrive on overcoming challenges.", motto: "What's the goal?", strengths: ["Execution", "Perseverance", "Goal setting", "Productivity"], workplace: "A performance-driven environment with clear metrics for success." },
  Director: { description: "A natural leader, you are decisive, assertive, and comfortable taking charge. You focus on efficiency and driving projects to completion.", motto: "I'll take the lead.", strengths: ["Leadership", "Decision-making", "Delegation", "Efficiency"], workplace: "A leadership position where you can direct teams and manage projects." },
  Connector: { description: "You are a master networker, skilled at building relationships and creating influential connections. You are persuasive and socially adept.", motto: "It's all about who you know.", strengths: ["Networking", "Communication", "Persuasion", "Relationship building"], workplace: "A role that involves extensive networking, sales, or public relations." },
  Collaborate: { description: "You value teamwork and harmony, believing the best results come from collective effort. You seek consensus and a supportive environment.", motto: "Let's work together on this.", strengths: ["Teamwork", "Empathy", "Building consensus", "Supportiveness"], workplace: "A team-based culture that values open communication and mutual support." },
  Compete: { description: "Driven by a desire to win, you are motivated by competition and outperforming others. You are ambitious and thrive in high-stakes environments.", motto: "Winning isn't everything, it's the only thing.", strengths: ["Ambition", "Resilience", "Performance under pressure", "Drive"], workplace: "A competitive field like sales or sports where performance is key." },
  Create: { description: "Imaginative and innovative, you excel at generating new ideas and finding creative solutions. You are an out-of-the-box thinker.", motto: "There's always a more creative way.", strengths: ["Innovation", "Originality", "Brainstorming", "Artistic expression"], workplace: "A role in design, marketing, or R&D that requires fresh ideas." },
  Control: { description: "You value order, stability, and predictability. You are meticulous, detail-oriented, and prefer to follow established systems and processes.", motto: "Let's stick to the plan.", strengths: ["Organization", "Process adherence", "Quality control", "Risk management"], workplace: "A structured environment with clear rules, such as finance or operations." },
  Entrepreneur: { description: "You are a risk-taker and visionary, driven to build new ventures from the ground up. You are resourceful, adaptable, and see opportunity everywhere.", motto: "Let's build something new.", strengths: ["Vision", "Risk-taking", "Resourcefulness", "Initiative"], workplace: "Starting your own business or leading a new, high-growth division." },
  Partner: { description: "You thrive in collaborative ventures and prefer to build with others rather than go it alone. You are a loyal and dependable business partner.", motto: "Two heads are better than one.", strengths: ["Collaboration", "Loyalty", "Negotiation", "Alliance building"], workplace: "A partnership, co-founder role, or a B2B sales environment." },
  'Plug & Play': { description: "You excel at executing a proven system. You value clear guidelines and are skilled at optimizing existing processes for success.", motto: "Give me the system, and I'll make it work.", strengths: ["Process optimization", "Efficiency", "Following systems", "Consistency"], workplace: "A franchise system or a role focused on operational excellence." },
  Empire: { description: "You are a builder on a grand scale, motivated to create large, scalable, and dominant organizations. You think about systems and long-term growth.", motto: "Let's scale this to the next level.", strengths: ["Strategic growth", "System building", "Scaling operations", "Long-term vision"], workplace: "Leading a large corporation or a multi-unit franchise operation." },
  Internal: { description: "You are self-motivated and reflective, trusting your own judgment and standards. You have a strong internal compass for what is right.", motto: "I know what I need to do.", strengths: ["Self-motivation", "Conviction", "Independence", "Introspection"], workplace: "An autonomous role where you can work independently towards a goal." },
  External: { description: "You are responsive to feedback and external validation. You are adaptable and skilled at understanding and meeting others' expectations.", motto: "What do you think?", strengths: ["Adaptability", "Responsiveness", "Customer focus", "Team orientation"], workplace: "A service-oriented or client-facing role requiring adaptability." },
  Structured: { description: "You prefer clear rules, processes, and a well-organized environment. You thrive when you know the steps and can execute them flawlessly.", motto: "What's the process?", strengths: ["Organization", "Attention to detail", "Process adherence", "Reliability"], workplace: "Roles in administration, compliance, or project management with clear frameworks." },
  'Rule Breaker': { description: "You are an innovator who challenges the status quo and isn't afraid to bend the rules to find a better way. You are a catalyst for change.", motto: "Rules are made to be broken.", strengths: ["Innovation", "Change agency", "Problem-solving", "Courage"], workplace: "A startup environment or a turnaround situation that needs fresh thinking." },
  'Leadership & Vision': { description: "You excel at seeing the big picture, setting a clear direction, and inspiring others to follow. You are a strategic and forward-thinking leader.", motto: "This is where we're going.", strengths: ["Strategic thinking", "Inspiration", "Communication", "Future-focused"], workplace: "An executive role, founder, or any position requiring strategic leadership." },
  Operations: { description: "You are a master of process, efficiency, and execution. You know how to make things run smoothly and reliably, day in and day out.", motto: "Let's make it efficient.", strengths: ["Process management", "Efficiency", "Consistency", "Problem-solving"], workplace: "Operations management, logistics, or quality control." },
  'R&D & Innovation': { description: "You are driven by curiosity and the pursuit of new ideas. You thrive on experimentation, research, and developing the next big thing.", motto: "What if we tried this?", strengths: ["Creativity", "Experimentation", "Analytical skills", "Future-thinking"], workplace: "A research and development lab, product design, or a tech startup." },
  'Finance & Admin': { description: "You are meticulous and skilled with numbers and organization. You provide the essential backbone of financial health and administrative order.", motto: "The numbers have to add up.", strengths: ["Attention to detail", "Financial acumen", "Organization", "Compliance"], workplace: "Roles in finance, accounting, HR, or administration." },
}

const DIMENSION_EXPLANATIONS: Record<string, { description: string; importance: string }> = {
  'Work Style': { description: 'Your natural approach to tasks, problem-solving, and workplace productivity.', importance: 'Understanding your work style helps you choose franchises that match your natural productivity patterns.' },
  Culture: { description: 'Your preferred work environment values, team dynamics, and organizational culture.', importance: 'Cultural fit is crucial for long-term satisfaction and success in any business venture.' },
  'Stage Fit': { description: 'Your entrepreneurial stage preference — starting from scratch, growing systems, or scaling operations.', importance: 'Matching your stage preference with franchise maturity levels ensures alignment with your growth goals.' },
  'Meta Programs': { description: 'Your underlying thinking patterns, decision-making processes, and mental frameworks.', importance: 'These deep-level patterns affect how you approach business challenges and opportunities.' },
  Competencies: { description: 'Your core business strengths and areas where you naturally excel.', importance: 'Leveraging your natural competencies in franchise selection increases your chances of success.' },
}

const FRANCHISE_RECOMMENDATIONS: Record<string, Array<{ type: string; description: string; compatibility: string; icon: React.ElementType }>> = {
  Thinker: [{ type: 'Process-driven Franchises', description: 'Ideal for those who thrive on systematic operations and meticulous quality control.', compatibility: 'High', icon: Target }, { type: 'Detail-oriented Services', description: 'Businesses where precision and adherence to standards are paramount.', compatibility: 'Very High', icon: CheckCircle }],
  Achiever: [{ type: 'Growth-oriented Franchises', description: 'Best for individuals driven to expand and dominate their market segment.', compatibility: 'Very High', icon: TrendingUp }, { type: 'Performance-based Systems', description: 'Franchises where results and efficiency directly impact success.', compatibility: 'High', icon: TrendingUp }],
  Director: [{ type: 'Results-Driven Franchises', description: 'Best for those who thrive in environments focused on clear outcomes and decisive action.', compatibility: 'Very High', icon: TrendingUp }, { type: 'Leadership-Oriented Businesses', description: 'Franchises where strong leadership and goal achievement are paramount.', compatibility: 'High', icon: Award }],
  Connector: [{ type: 'Network-Based Franchises', description: 'Ideal for individuals skilled at building and leveraging professional relationships.', compatibility: 'Very High', icon: Users }, { type: 'Community Engagement Businesses', description: 'Businesses that benefit from strong local ties and collaboration.', compatibility: 'High', icon: Users }],
  Collaborate: [{ type: 'Team-based Operations', description: 'Perfect for building strong teams and fostering a supportive work environment.', compatibility: 'Very High', icon: Users }, { type: 'Community-focused Franchises', description: 'Businesses that benefit from strong local ties and relationship building.', compatibility: 'High', icon: Users }],
  Compete: [{ type: 'Performance-based Franchises', description: 'For those who excel under pressure and are driven by winning.', compatibility: 'Very High', icon: Award }, { type: 'Market Competition Opportunities', description: 'Franchises in dynamic sectors requiring strategic competitive advantage.', compatibility: 'High', icon: Award }],
  Create: [{ type: 'Innovative Franchises', description: 'Suited for developing new solutions and adapting to market changes with fresh ideas.', compatibility: 'Very High', icon: Lightbulb }, { type: 'Creative Service Businesses', description: 'Where unique solutions and imaginative approaches are key.', compatibility: 'High', icon: Lightbulb }],
  Control: [{ type: 'Structured Franchises', description: 'For individuals who prefer clear guidelines, order, and predictable outcomes.', compatibility: 'Very High', icon: Target }, { type: 'Quality Control Systems', description: 'Businesses where meticulous oversight ensures consistent quality.', compatibility: 'High', icon: Target }],
  Entrepreneur: [{ type: 'Business Development Focused', description: 'For those eager to build and expand, identifying new opportunities.', compatibility: 'Very High', icon: Lightbulb }, { type: 'Risk-Averse Innovation', description: 'Franchises that allow for calculated risks and strategic growth.', compatibility: 'High', icon: TrendingUp }],
  Partner: [{ type: 'Collaborative Growth Models', description: 'Ideal for leveraging partnerships and expanding through joint ventures.', compatibility: 'Very High', icon: Users }, { type: 'Relationship-Driven Scaling', description: 'Businesses where networking and strong alliances lead to expansion.', compatibility: 'High', icon: Users }],
  'Plug & Play': [{ type: 'System Implementation Models', description: 'For those who excel at adopting and optimizing established business systems.', compatibility: 'Very High', icon: Target }, { type: 'Operational Efficiency Focused', description: 'Franchises where streamlining processes and replicating success are key.', compatibility: 'High', icon: CheckCircle }],
  Empire: [{ type: 'Large-Scale Operations', description: 'For leaders aiming to build extensive and influential business empires.', compatibility: 'Very High', icon: Building2 }, { type: 'Strategic Market Expansion', description: 'Franchises that offer opportunities for significant regional or national growth.', compatibility: 'High', icon: Award }],
  Internal: [{ type: 'Value-Driven Franchises', description: 'For those who operate best when aligned with their core values and internal standards.', compatibility: 'Very High', icon: Brain }, { type: 'Autonomous Operations', description: 'Franchises offering significant independence and self-direction.', compatibility: 'High', icon: CheckCircle }],
  External: [{ type: 'Client-Centric Franchises', description: 'Suited for individuals who thrive on feedback and external validation.', compatibility: 'Very High', icon: Users }, { type: 'Market-Responsive Businesses', description: 'Businesses that require constant adaptation to customer needs.', compatibility: 'High', icon: TrendingUp }],
  Structured: [{ type: 'Systematic Franchises', description: 'Perfect for those who prefer clear guidelines and predictable outcomes.', compatibility: 'Very High', icon: Target }, { type: 'Compliance-Heavy Operations', description: 'Businesses where strict adherence to rules is essential.', compatibility: 'High', icon: CheckCircle }],
  'Rule Breaker': [{ type: 'Disruptive Innovation Franchises', description: 'Ideal for those who enjoy challenging the status quo.', compatibility: 'Very High', icon: Lightbulb }, { type: 'Adaptive Business Models', description: 'Franchises that encourage experimentation and rapid evolution.', compatibility: 'High', icon: Lightbulb }],
  'Leadership & Vision': [{ type: 'Strategic Growth Franchises', description: 'For individuals who excel at setting long-term goals and inspiring teams.', compatibility: 'Very High', icon: Building2 }, { type: 'Team-Building Businesses', description: 'Franchises where guiding and developing people is a key success factor.', compatibility: 'High', icon: Users }],
  Operations: [{ type: 'Efficiency-Focused Franchises', description: 'Suited for those who excel at streamlining processes.', compatibility: 'Very High', icon: Target }, { type: 'Logistics and Management', description: 'Businesses where meticulous planning and execution are crucial.', compatibility: 'High', icon: CheckCircle }],
  'R&D & Innovation': [{ type: 'New Concept Franchises', description: 'Ideal for individuals passionate about novel ideas and solutions.', compatibility: 'Very High', icon: Lightbulb }, { type: 'Technology-Driven Businesses', description: 'Franchises that rely on continuous innovation.', compatibility: 'High', icon: Brain }],
  'Finance & Admin': [{ type: 'Financial Service Franchises', description: 'Perfect for detail-oriented individuals with a strong aptitude for numbers.', compatibility: 'Very High', icon: Download }, { type: 'Systematic Management Businesses', description: 'Franchises where precise record-keeping and administrative efficiency are vital.', compatibility: 'High', icon: CheckCircle }],
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Fit360ProfilePage({ profileData }: { profileData: any }) {
  const [isDownloading, setIsDownloading] = useState(false)

  // Derived data
  const processedTraits = useMemo(() => {
    if (!profileData?.trait_scores) return []
    return Object.entries(profileData.trait_scores as Record<string, number>).map(([trait, score]) => ({
      trait, score, dimension: TRAIT_DIMENSION[trait] ?? 'General',
    }))
  }, [profileData])

  const traitScores = useMemo(() => {
    const s: Record<string, number> = {}
    processedTraits.forEach(t => { s[t.trait] = t.score })
    return s
  }, [processedTraits])

  const topTraitsArray = useMemo(() => [...processedTraits].sort((a, b) => b.score - a.score).map(t => t.trait), [processedTraits])
  const primaryTraitName = topTraitsArray[0]
  const primaryTrait = primaryTraitName ? { trait: primaryTraitName, score: traitScores[primaryTraitName] ?? 0 } : null
  const primaryTraitData = primaryTrait ? TRAIT_DESCRIPTIONS[primaryTrait.trait] : null
  const maxScore = Math.max(...processedTraits.map(t => t.score), 1)

  const dimensionSummaryMap = useMemo(() => {
    const summary: Record<string, string> = {}
    processedTraits.forEach(item => {
      const cur = summary[item.dimension]
      if (!cur || item.score > (traitScores[cur] ?? 0)) summary[item.dimension] = item.trait
    })
    return summary
  }, [processedTraits, traitScores])

  const topTraitsByDimension = useMemo(() =>
    Object.entries(dimensionSummaryMap).map(([dimension, trait]) => ({
      dimension, trait, score: traitScores[trait] ?? 0,
    })), [dimensionSummaryMap, traitScores])

  const handleDownloadResults = async () => {
    if (!profileData?.id) { alert('Cannot download report: Profile ID is missing.'); return }
    setIsDownloading(true)
    try {
      const res = await fetch('/api/fit360/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profileData.id }),
      })
      if (!res.ok) throw new Error(await res.text())
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `FranchiseFit360-Report-${profileData.email?.split('@')[0] ?? 'candidate'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download error:', err)
      alert('Failed to generate PDF report. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-4">Processing Your Results...</h2>
          <p className="text-slate-600">Please wait while we generate your comprehensive profile.</p>
        </div>
      </div>
    )
  }

  if (processedTraits.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center p-8">
            <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Profile Data Available</h2>
            <p className="text-slate-600">Complete the FranchiseFit360™ assessment to see your results here.</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-white rounded-full text-blue-900 font-bold text-sm mb-8 shadow-sm">
            <Brain className="w-6 h-6 mr-2 text-blue-600" />
            FranchiseFit360™ Results
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-slate-900">Your Franchise Personality Profile</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">A comprehensive look at your personality, work style, and ideal franchise fit.</p>
          <div className="mt-6">
            <Button onClick={handleDownloadResults} disabled={isDownloading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              {isDownloading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Report...</> : <><Download className="w-4 h-4 mr-2" />Download Full Report</>}
            </Button>
          </div>
        </header>

        {/* Radar chart */}
        <Card className="mb-8 bg-white shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900 mb-2">Your Personality Dimensions at a Glance</CardTitle>
            <p className="text-slate-600">This chart shows your strongest traits across all five personality dimensions.</p>
          </CardHeader>
          <CardContent className="p-6">
            <RadarSummaryChart traits={topTraitsByDimension} />
          </CardContent>
        </Card>

        {/* Primary trait hero */}
        {primaryTrait && primaryTraitData && (
          <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <PrimaryIcon trait={primaryTrait.trait} className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-blue-900">{primaryTrait.trait}</h2>
                    <Badge className="bg-blue-600 text-white text-sm px-3 py-1">Primary Trait · Score: {primaryTrait.score}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600 mb-1">Strength Level</div>
                  <div className="w-32"><Progress value={(primaryTrait.score / maxScore) * 100} className="h-3" /></div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">What This Means</h3>
                  <p className="text-slate-700 leading-relaxed mb-4">{primaryTraitData.description}</p>
                  <div className="bg-blue-100 rounded-lg p-4">
                    <div className="flex items-center mb-2"><Star className="w-4 h-4 text-blue-600 mr-2" /><span className="font-semibold text-blue-900">Your Motto</span></div>
                    <p className="text-blue-800 italic">"{primaryTraitData.motto}"</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Your Key Strengths</h3>
                  <ul className="space-y-2 mb-4">
                    {primaryTraitData.strengths.map((s, i) => (
                      <li key={i} className="flex items-center text-slate-700"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />{s}</li>
                    ))}
                  </ul>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-2"><Building2 className="w-4 h-4 text-green-600 mr-2" /><span className="font-semibold text-green-900">Ideal Workplace</span></div>
                    <p className="text-green-800">{primaryTraitData.workplace}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dimension analysis */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {Object.entries(DIMENSION_EXPLANATIONS).map(([dimension, info]) => {
            const top = topTraitsByDimension.find(t => t.dimension === dimension)
            return (
              <Card key={dimension} className="bg-white border-0 shadow-lg">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-xl text-slate-900 flex items-center"><Target className="w-5 h-5 mr-2 text-blue-600" />{dimension}</CardTitle>
                  <p className="text-sm text-slate-600 mt-2">{info.description}</p>
                </CardHeader>
                <CardContent className="p-6">
                  {top && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">Your {dimension} Type: {top.trait}</span>
                        <Badge className="bg-blue-100 text-blue-800">Score: {top.score}</Badge>
                      </div>
                      <Progress value={(top.score / maxScore) * 100} className="mb-3" />
                      <p className="text-sm text-slate-600">{TRAIT_DESCRIPTIONS[top.trait]?.description ?? 'Strong alignment with this trait.'}</p>
                    </div>
                  )}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Why This Matters:</h4>
                    <p className="text-sm text-blue-800">{info.importance}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Franchise recommendations */}
        {primaryTrait && FRANCHISE_RECOMMENDATIONS[primaryTrait.trait] && (
          <Card className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900"><Award className="w-6 h-6" />Recommended Franchise Types for You</CardTitle>
              <p className="text-amber-700">Based on your personality profile, these franchise types align well with your traits:</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {FRANCHISE_RECOMMENDATIONS[primaryTrait.trait].map((rec, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 border border-amber-100">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                        <rec.icon className="w-5 h-5 text-amber-600" />
                      </div>
                      <h4 className="font-semibold text-slate-900">{rec.type}</h4>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">{rec.description}</p>
                    <div className="flex items-center text-xs text-amber-600">
                      <Target className="w-3 h-3 mr-1" /><span className="font-medium">Compatibility: {rec.compatibility}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link href="/directory">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl">
                    <ArrowRight className="w-5 h-5 mr-2" />View Matching Franchises
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed trait breakdown */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-xl text-slate-900 flex items-center"><Award className="w-5 h-5 mr-2 text-slate-600" />Complete Trait Analysis</CardTitle>
            <p className="text-sm text-slate-600 mt-2">Your comprehensive personality breakdown across all assessed traits.</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {[...processedTraits].sort((a, b) => b.score - a.score).slice(0, 6).map((item, i) => {
                const td = TRAIT_DESCRIPTIONS[item.trait]
                return (
                  <div key={item.trait} className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">{item.trait}</h4>
                      <Badge variant="secondary">#{i + 1}</Badge>
                    </div>
                    <Progress value={(item.score / maxScore) * 100} className="mb-3" />
                    <p className="text-xs text-slate-600 mb-2">Score: {item.score}</p>
                    {td && <p className="text-xs text-slate-600">{td.description}</p>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Next steps */}
        <div className="mt-8 text-center">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Ready to Find Your Perfect Franchise?</h3>
          <p className="text-slate-600 mb-6">Use your personality insights to discover franchises that match your natural strengths and preferences.</p>
          <Link href="/directory">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Building2 className="w-5 h-5 mr-2" />Browse Matching Franchises
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
