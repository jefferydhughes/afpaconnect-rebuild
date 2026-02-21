import { createAdminClient } from '@/lib/supabase/server'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// ---------------------------------------------------------------------------
// Demo data (profileId starting with "demo-")
// ---------------------------------------------------------------------------
const DEMO_PROFILES: Record<string, any> = {
  'demo-profile-1': {
    id: 'demo-profile-1', email: 'candidate1@demo.com', user_id: 'demo-user-1',
    trait_scores: { Thinker: 8, Achiever: 10, Director: 6, Connector: 4, Collaborate: 5, Compete: 9, Create: 7, Control: 3, Entrepreneur: 11, Partner: 5, 'Plug & Play': 8, Empire: 7, Internal: 9, External: 6, Structured: 4, 'Rule Breaker': 8, 'Leadership & Vision': 10, Operations: 7, 'R&D & Innovation': 6, 'Finance & Admin': 4 },
    total_questions: 60, completion_rate: 100,
    top_traits: ['Entrepreneur', 'Achiever', 'Leadership & Vision'],
    profile_strengths: ['Strategic thinking', 'Goal-oriented', 'Innovative'],
  },
  'demo-profile-2': {
    id: 'demo-profile-2', email: 'candidate2@demo.com', user_id: 'demo-user-2',
    trait_scores: { Thinker: 5, Achiever: 8, Director: 4, Connector: 11, Collaborate: 10, Compete: 3, Create: 7, Control: 9, Entrepreneur: 4, Partner: 10, 'Plug & Play': 7, Empire: 3, Internal: 5, External: 10, Structured: 9, 'Rule Breaker': 4, 'Leadership & Vision': 6, Operations: 8, 'R&D & Innovation': 5, 'Finance & Admin': 10 },
    total_questions: 60, completion_rate: 100,
    top_traits: ['Connector', 'Collaborate', 'Partner'],
    profile_strengths: ['Networking', 'Team support', 'Reliable'],
  },
}
const DEMO_USERS: Record<string, any> = {
  'demo-user-1': { full_name: 'John Demo' },
  'demo-user-2': { full_name: 'Jane Demo' },
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DIMENSIONS = ['Work Style', 'Culture', 'Stage Fit', 'Meta Programs', 'Competencies']

const TRAIT_DIMENSION: Record<string, string> = {
  Thinker: 'Work Style', Achiever: 'Work Style', Director: 'Work Style', Connector: 'Work Style',
  Collaborate: 'Culture', Compete: 'Culture', Create: 'Culture', Control: 'Culture',
  Entrepreneur: 'Stage Fit', Partner: 'Stage Fit', 'Plug & Play': 'Stage Fit', Empire: 'Stage Fit',
  Internal: 'Meta Programs', External: 'Meta Programs', Structured: 'Meta Programs', 'Rule Breaker': 'Meta Programs',
  'Leadership & Vision': 'Competencies', Operations: 'Competencies', 'R&D & Innovation': 'Competencies', 'Finance & Admin': 'Competencies',
}

const TRAIT_DESCRIPTIONS: Record<string, { description: string; motto: string; strengths: string[]; workplace: string }> = {
  Thinker: { description: "Analytical and logical, you excel at strategy and problem-solving.", motto: "Let's analyze this logically.", strengths: ["Strategic planning", "Objective analysis", "Problem-solving", "Attention to detail"], workplace: "A role that values expertise and allows for deep thinking and analysis." },
  Achiever: { description: "Goal-oriented and driven, you are motivated by tangible results and success.", motto: "What's the goal?", strengths: ["Execution", "Perseverance", "Goal setting", "Productivity"], workplace: "A performance-driven environment with clear metrics for success." },
  Director: { description: "A natural leader, you are decisive and comfortable taking charge.", motto: "I'll take the lead.", strengths: ["Leadership", "Decision-making", "Delegation", "Efficiency"], workplace: "A leadership position where you can direct teams and manage projects." },
  Connector: { description: "A master networker, skilled at building relationships and influential connections.", motto: "It's all about who you know.", strengths: ["Networking", "Communication", "Persuasion", "Relationship building"], workplace: "A role involving extensive networking, sales, or public relations." },
  Collaborate: { description: "You value teamwork and harmony, believing the best results come from collective effort.", motto: "Let's work together on this.", strengths: ["Teamwork", "Empathy", "Building consensus", "Supportiveness"], workplace: "A team-based culture that values open communication and mutual support." },
  Compete: { description: "Driven by a desire to win, you thrive in high-stakes competitive environments.", motto: "Winning isn't everything, it's the only thing.", strengths: ["Ambition", "Resilience", "Performance under pressure", "Drive"], workplace: "A competitive field like sales where performance is key." },
  Create: { description: "Imaginative and innovative, you excel at generating new ideas and creative solutions.", motto: "There's always a more creative way.", strengths: ["Innovation", "Originality", "Brainstorming", "Artistic expression"], workplace: "A role in design, marketing, or R&D requiring fresh ideas." },
  Control: { description: "You value order, stability, and predictability. Meticulous and detail-oriented.", motto: "Let's stick to the plan.", strengths: ["Organization", "Process adherence", "Quality control", "Risk management"], workplace: "A structured environment with clear rules, such as finance or operations." },
  Entrepreneur: { description: "A risk-taker and visionary, driven to build new ventures from the ground up.", motto: "Let's build something new.", strengths: ["Vision", "Risk-taking", "Resourcefulness", "Initiative"], workplace: "Starting your own business or leading a new, high-growth division." },
  Partner: { description: "You thrive in collaborative ventures and prefer to build with others.", motto: "Two heads are better than one.", strengths: ["Collaboration", "Loyalty", "Negotiation", "Alliance building"], workplace: "A partnership, co-founder role, or a B2B sales environment." },
  'Plug & Play': { description: "You excel at executing a proven system with clear guidelines.", motto: "Give me the system, and I'll make it work.", strengths: ["Process optimization", "Efficiency", "Following systems", "Consistency"], workplace: "A franchise system or a role focused on operational excellence." },
  Empire: { description: "A builder on a grand scale, motivated to create large, scalable, dominant organizations.", motto: "Let's scale this to the next level.", strengths: ["Strategic growth", "System building", "Scaling operations", "Long-term vision"], workplace: "Leading a large corporation or a multi-unit franchise operation." },
  Internal: { description: "Self-motivated and reflective, trusting your own judgment and standards.", motto: "I know what I need to do.", strengths: ["Self-motivation", "Conviction", "Independence", "Introspection"], workplace: "An autonomous role where you can work independently towards a goal." },
  External: { description: "Responsive to feedback and external validation, adaptable and collaborative.", motto: "What do you think?", strengths: ["Adaptability", "Responsiveness", "Customer focus", "Team orientation"], workplace: "A service-oriented or client-facing role requiring adaptability." },
  Structured: { description: "You prefer clear rules and a well-organized environment.", motto: "What's the process?", strengths: ["Organization", "Attention to detail", "Process adherence", "Reliability"], workplace: "Roles in administration, compliance, or project management." },
  'Rule Breaker': { description: "An innovator who challenges the status quo and isn't afraid to bend the rules.", motto: "Rules are made to be broken.", strengths: ["Innovation", "Change agency", "Problem-solving", "Courage"], workplace: "A startup environment or turnaround situation needing fresh thinking." },
  'Leadership & Vision': { description: "You excel at seeing the big picture and inspiring others to follow.", motto: "This is where we're going.", strengths: ["Strategic thinking", "Inspiration", "Communication", "Future-focused"], workplace: "An executive role, founder, or any position requiring strategic leadership." },
  Operations: { description: "A master of process, efficiency, and execution day in and day out.", motto: "Let's make it efficient.", strengths: ["Process management", "Efficiency", "Consistency", "Problem-solving"], workplace: "Operations management, logistics, or quality control." },
  'R&D & Innovation': { description: "Driven by curiosity and the pursuit of new ideas and experimentation.", motto: "What if we tried this?", strengths: ["Creativity", "Experimentation", "Analytical skills", "Future-thinking"], workplace: "A research lab, product design team, or tech startup." },
  'Finance & Admin': { description: "Meticulous and skilled with numbers, providing financial health and administrative order.", motto: "The numbers have to add up.", strengths: ["Attention to detail", "Financial acumen", "Organization", "Compliance"], workplace: "Roles in finance, accounting, HR, or administration." },
}

const ICON_URLS: Record<string, string> = {
  Thinker: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/9d6573104_thinker.png',
  Achiever: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/0f66e865b_achiever.png',
  Director: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/388bd40d8_director.png',
  Connector: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/c071e740b_Connector.png',
  Collaborate: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/ff02af915_collaborate.png',
  Compete: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/069b87307_compete.png',
  Create: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/02b38c688_Create.png',
  Control: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/0a9917aa4_Control.png',
  Entrepreneur: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/d31a12d29_Entrepreneur.png',
  Partner: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/f23e762b6_Partner.png',
  'Plug & Play': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/7adeb25ab_plug_and_play.png',
  Empire: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/c053bd50b_Empire.png',
  Internal: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/3d2c404d4_Internal.png',
  External: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/5412cdadd_External.png',
  Structured: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/4b2592dbc_Structured.png',
  'Rule Breaker': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/4088f6bfc_RuleBreaker.png',
  'Leadership & Vision': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/b7ec6b637_leadership_and_vision.png',
  Operations: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/3238e4a81_Operations.png',
  'R&D & Innovation': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/514431891_rnd_innovation.png',
  'Finance & Admin': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a83af74709dae2a7b78be1/caba397ca_finance_and_admin.png',
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const { profileId } = await req.json()
    if (!profileId) return new Response(JSON.stringify({ error: 'Profile ID is required' }), { status: 400 })

    let profile: any
    let user: any = null

    if (profileId.startsWith('demo-')) {
      profile = DEMO_PROFILES[profileId]
      if (profile) user = DEMO_USERS[profile.user_id] ?? null
    } else {
      const supabase = createAdminClient()
      const { data, error } = await supabase.from('fit360_profile').select('*').eq('id', profileId).single()
      if (error || !data) return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404 })
      profile = data

      if (profile.user_id) {
        const { data: profileRow } = await supabase.from('profiles').select('full_name').eq('id', profile.user_id).single()
        user = profileRow ?? null
      }
    }

    if (!profile) return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404 })

    // -------------------------------------------------------------------------
    // Build PDF
    // -------------------------------------------------------------------------
    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 40

    const primaryColor = '#1e3a8a'
    const secondaryColor = '#f59e0b'
    const textColor = '#1e293b'
    const mutedColor = '#64748b'
    const lightGray = '#f1f5f9'

    doc.setFont('helvetica', 'normal')

    const addFooter = (pageNumber: number) => {
      doc.setFontSize(8)
      doc.setTextColor(mutedColor)
      doc.text('FranchiseFit360™', margin, pageH - 20)
      doc.text(`Page ${pageNumber}`, pageW / 2, pageH - 20, { align: 'center' })
      doc.text('Confidential Candidate Report', pageW - margin, pageH - 20, { align: 'right' })
    }

    const addHeader = () => {
      doc.setFontSize(9)
      doc.setTextColor(mutedColor)
      doc.text('FranchiseFit360™ Personality Report', margin, 25)
      doc.setDrawColor(lightGray)
      doc.line(margin, 35, pageW - margin, 35)
    }

    // Page 1: Cover
    doc.setFillColor(primaryColor)
    doc.rect(0, 0, pageW, 120, 'F')

    doc.setFontSize(24)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('FranchiseFit360™', pageW / 2, 50, { align: 'center' })

    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.text('Personality Assessment Report', pageW / 2, 80, { align: 'center' })

    const candidateName = user?.full_name || profile.email || 'Candidate'
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(32)
    doc.setTextColor(primaryColor)
    doc.text(candidateName, pageW / 2, 300, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(textColor)
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, pageW / 2, 350, { align: 'center' })
    doc.text(`Profile ID: ${String(profile.id).slice(0, 8)}`, pageW / 2, 370, { align: 'center' })

    doc.setDrawColor(secondaryColor)
    doc.setLineWidth(2)
    doc.line(pageW / 2 - 100, 400, pageW / 2 + 100, 400)

    doc.setFontSize(10)
    doc.setTextColor(mutedColor)
    doc.text('Confidential Assessment Results', pageW / 2, 430, { align: 'center' })

    addFooter(1)

    // Page 2: Candidate Summary
    doc.addPage()

    doc.setFillColor(primaryColor)
    doc.rect(0, 0, pageW, 80, 'F')
    doc.setFontSize(20)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('Candidate Summary', pageW / 2, 35, { align: 'center' })
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('360° Personality Overview', pageW / 2, 55, { align: 'center' })

    addFooter(2)

    const traitScores: Record<string, number> = profile.trait_scores || {}
    const sortedTraits = Object.entries(traitScores).sort(([, a], [, b]) => (b as number) - (a as number))
    const topTraits = sortedTraits.slice(0, 5)

    // Dimension summary
    const dimensionSummary: Record<string, { trait: string; score: number }> = {}
    DIMENSIONS.forEach(dim => {
      let topTrait = ''; let maxScore = -1
      Object.entries(traitScores).forEach(([trait, score]) => {
        if (TRAIT_DIMENSION[trait] === dim && (score as number) > maxScore) {
          maxScore = score as number; topTrait = trait
        }
      })
      dimensionSummary[dim] = { trait: topTrait, score: maxScore }
    })

    // Radar chart (manual drawing)
    const radarCenterX = pageW / 2
    const radarCenterY = 200
    const radarRadius = 90
    const radarLevels = 4

    doc.setDrawColor(lightGray)
    doc.setLineWidth(0.5)

    // Concentric polygons
    for (let level = 1; level <= radarLevels; level++) {
      const r = (radarRadius * level) / radarLevels
      const pts = DIMENSIONS.map((_, i) => {
        const angle = (i / DIMENSIONS.length) * 2 * Math.PI - Math.PI / 2
        return { x: radarCenterX + r * Math.cos(angle), y: radarCenterY + r * Math.sin(angle) }
      })
      for (let j = 0; j < pts.length; j++) {
        const next = pts[(j + 1) % pts.length]
        doc.line(pts[j].x, pts[j].y, next.x, next.y)
      }
    }

    // Axes + labels
    doc.setFontSize(8)
    doc.setTextColor(mutedColor)
    DIMENSIONS.forEach((dim, i) => {
      const angle = (i / DIMENSIONS.length) * 2 * Math.PI - Math.PI / 2
      const x2 = radarCenterX + radarRadius * Math.cos(angle)
      const y2 = radarCenterY + radarRadius * Math.sin(angle)
      doc.line(radarCenterX, radarCenterY, x2, y2)

      const labelX = radarCenterX + (radarRadius + 20) * Math.cos(angle)
      const labelY = radarCenterY + (radarRadius + 20) * Math.sin(angle)
      const align = Math.abs(Math.cos(angle)) < 0.3 ? 'center' : Math.cos(angle) > 0 ? 'left' : 'right'
      doc.text(dim, labelX, labelY, { align })
    })

    // Data polygon
    const maxPossibleScore = 12
    const dataPts = DIMENSIONS.map((dim, i) => {
      const score = dimensionSummary[dim]?.score || 0
      const r = (score / maxPossibleScore) * radarRadius
      const angle = (i / DIMENSIONS.length) * 2 * Math.PI - Math.PI / 2
      return { x: radarCenterX + r * Math.cos(angle), y: radarCenterY + r * Math.sin(angle) }
    })
    doc.setFillColor(primaryColor)
    doc.setDrawColor(primaryColor)
    doc.setLineWidth(1.5)
    doc.setGState(new (doc as any).GState({ opacity: 0.3 }))
    for (let j = 0; j < dataPts.length; j++) {
      const next = dataPts[(j + 1) % dataPts.length]
      doc.line(dataPts[j].x, dataPts[j].y, next.x, next.y)
    }
    doc.setGState(new (doc as any).GState({ opacity: 1 }))

    // Tables
    const tableStartY = radarCenterY + radarRadius + 50

    const result1 = autoTable(doc, {
      head: [['Top 5 Traits', 'Score']],
      body: topTraits.map(([trait, score]) => [trait, score]),
      theme: 'striped',
      startY: tableStartY,
      margin: { left: margin, right: margin },
      headStyles: { fillColor: primaryColor as any },
    })
    const finalY1 = (result1 as any)?.finalY ?? (doc as any).lastAutoTable?.finalY ?? tableStartY + 100

    autoTable(doc, {
      head: [['Key Strengths']],
      body: (profile.profile_strengths || ['N/A']).map((s: string) => [s]),
      theme: 'grid',
      startY: finalY1 + 20,
      margin: { left: margin, right: margin },
      headStyles: { fillColor: secondaryColor as any, textColor: textColor as any },
    })

    // Page 3+: Trait Deep Dive
    // Fetch icons (best-effort)
    const iconBuffers = await Promise.all(
      topTraits.map(([trait]) => {
        const url = ICON_URLS[trait]
        if (!url) return Promise.resolve(null)
        return fetch(url)
          .then(r => r.ok ? r.arrayBuffer() : null)
          .catch(() => null)
      })
    )

    let currentY = 0
    let pageNumber = 3

    const startNewPage = () => {
      doc.addPage()
      addHeader()
      addFooter(pageNumber)
      pageNumber++
      currentY = 70
    }

    startNewPage()

    doc.setFontSize(16)
    doc.setTextColor(primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('Trait Deep Dive', margin, currentY)
    currentY += 30

    for (let i = 0; i < topTraits.length; i++) {
      const [trait, score] = topTraits[i]
      const iconBuffer = iconBuffers[i]
      const traitInfo = TRAIT_DESCRIPTIONS[trait]

      const descLines = traitInfo ? doc.splitTextToSize(traitInfo.description, pageW - margin * 2).length : 2
      const spaceNeeded = 50 + descLines * 14 + 30

      if (currentY + spaceNeeded > pageH - 80) startNewPage()

      const iconSize = 30
      const traitTitleY = currentY + iconSize / 2

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(textColor)

      if (iconBuffer) {
        try {
          doc.addImage(new Uint8Array(iconBuffer as ArrayBuffer), 'PNG', margin, currentY, iconSize, iconSize)
        } catch { /* skip if image fails */ }
      }

      const textX = iconBuffer ? margin + iconSize + 10 : margin
      doc.text(`${trait}  (Score: ${score})`, textX, traitTitleY)
      currentY = currentY + iconSize + 8

      if (traitInfo) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(mutedColor)
        const descLines2 = doc.splitTextToSize(traitInfo.description, pageW - margin * 2)
        doc.text(descLines2, margin, currentY)
        currentY += descLines2.length * 14 + 8

        doc.setFont('helvetica', 'italic')
        doc.text(`Motto: "${traitInfo.motto}"`, margin + 10, currentY)
        currentY += 30
      } else {
        currentY += 20
      }
    }

    const pdfBuffer = doc.output('arraybuffer')

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="FranchiseFit360-Report-${candidateName.replace(/[^a-z0-9]/gi, '-')}.pdf"`,
      },
    })
  } catch (err: any) {
    console.error('PDF generation error:', err)
    return new Response(JSON.stringify({ error: err?.message ?? 'Internal error' }), { status: 500 })
  }
}
