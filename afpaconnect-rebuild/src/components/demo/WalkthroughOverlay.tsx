'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Presentation,
  Lightbulb,
} from 'lucide-react'

type PageKey = 'landing' | 'applications' | 'analytics' | 'heatmap' | 'candidates' | 'cityBuilder'

const DEFAULT_WALKTHROUGH_STEPS: Record<PageKey, { id: string; title: string; description: string; highlight?: string | null; position: string }[]> = {
  landing: [
    {
      id: 'welcome',
      title: 'Welcome to the Demo',
      description: 'This is your personalized AFPA platform demo. Use this hub to explore all the features we offer to franchise brands.',
      highlight: null,
      position: 'center',
    },
    {
      id: 'modules',
      title: 'Platform Modules',
      description: 'Each card represents a key platform feature. Click any module to explore it in detail during your call.',
      highlight: '[data-module-grid]',
      position: 'bottom',
    },
  ],
  applications: [
    {
      id: 'app-overview',
      title: 'Applications Dashboard',
      description: 'This is where all franchise applications land. Your team can review, score, and manage candidates from one place.',
      position: 'center',
    },
    {
      id: 'app-filters',
      title: 'Smart Filtering',
      description: 'Filter applications by status, location, investment range, and fit score to prioritize your best leads.',
      position: 'top',
    },
    {
      id: 'app-scores',
      title: 'AI-Powered Fit Scores',
      description: 'Each applicant receives an automated fit score based on their profile match with your ideal franchisee criteria.',
      position: 'right',
    },
  ],
  analytics: [
    {
      id: 'analytics-overview',
      title: 'Performance Analytics',
      description: 'Track your franchise lead generation performance with real-time metrics and conversion insights.',
      position: 'center',
    },
    {
      id: 'analytics-funnel',
      title: 'Conversion Funnel',
      description: 'Visualize your lead journey from first touch to qualified application. Identify drop-off points to optimize.',
      position: 'bottom',
    },
    {
      id: 'analytics-sources',
      title: 'Lead Sources',
      description: 'Understand which channels drive your best leads. Allocate marketing budget based on actual performance.',
      position: 'right',
    },
  ],
  heatmap: [
    {
      id: 'heatmap-overview',
      title: 'Geographic Interest Map',
      description: 'See where demand for your franchise is hottest. Use this data to prioritize territory development.',
      position: 'center',
    },
    {
      id: 'heatmap-markets',
      title: 'Market Rankings',
      description: 'Markets are ranked by interest score and inquiry volume. Focus expansion efforts on high-demand areas.',
      position: 'bottom',
    },
  ],
  candidates: [
    {
      id: 'candidates-overview',
      title: 'Candidate Profiles',
      description: 'Deep-dive into qualified candidates. See their investment capacity, goals, and personality fit.',
      position: 'center',
    },
    {
      id: 'candidates-disc',
      title: 'DISC Personality Insights',
      description: "Understand each candidate's communication style and management approach before your first call.",
      position: 'top',
    },
  ],
  cityBuilder: [
    {
      id: 'city-overview',
      title: 'City Landing Pages',
      description: 'Create SEO-optimized landing pages for every target market. Capture local search traffic automatically.',
      position: 'center',
    },
    {
      id: 'city-seo',
      title: 'Dynamic SEO',
      description: 'Each page is auto-optimized with location-specific keywords, meta tags, and structured data.',
      position: 'bottom',
    },
  ],
}

const SCENARIO_PRESETS = {
  standard: {
    name: 'Standard Demo',
    description: 'Full platform overview',
    steps: DEFAULT_WALKTHROUGH_STEPS,
  },
  quick: {
    name: 'Quick Overview',
    description: '5-minute highlights',
    steps: {
      landing: [DEFAULT_WALKTHROUGH_STEPS.landing[0]],
      applications: [DEFAULT_WALKTHROUGH_STEPS.applications[0]],
      analytics: [DEFAULT_WALKTHROUGH_STEPS.analytics[0]],
      heatmap: [DEFAULT_WALKTHROUGH_STEPS.heatmap[0]],
      candidates: [DEFAULT_WALKTHROUGH_STEPS.candidates[0]],
      cityBuilder: [DEFAULT_WALKTHROUGH_STEPS.cityBuilder[0]],
    },
  },
  leadGen: {
    name: 'Lead Generation Focus',
    description: 'Emphasize lead capture & qualification',
    steps: {
      landing: DEFAULT_WALKTHROUGH_STEPS.landing,
      applications: DEFAULT_WALKTHROUGH_STEPS.applications,
      analytics: [DEFAULT_WALKTHROUGH_STEPS.analytics[0], DEFAULT_WALKTHROUGH_STEPS.analytics[2]],
      heatmap: DEFAULT_WALKTHROUGH_STEPS.heatmap,
      candidates: DEFAULT_WALKTHROUGH_STEPS.candidates,
      cityBuilder: [DEFAULT_WALKTHROUGH_STEPS.cityBuilder[0]],
    },
  },
  expansion: {
    name: 'Territory Expansion',
    description: 'Focus on geographic insights',
    steps: {
      landing: [DEFAULT_WALKTHROUGH_STEPS.landing[0]],
      applications: [DEFAULT_WALKTHROUGH_STEPS.applications[0]],
      analytics: [DEFAULT_WALKTHROUGH_STEPS.analytics[0]],
      heatmap: DEFAULT_WALKTHROUGH_STEPS.heatmap,
      candidates: [DEFAULT_WALKTHROUGH_STEPS.candidates[0]],
      cityBuilder: DEFAULT_WALKTHROUGH_STEPS.cityBuilder,
    },
  },
}

export default function WalkthroughOverlay({
  isEnabled,
  onToggle,
  currentPage = 'landing',
  scenario = 'standard',
  onScenarioChange,
}: {
  isEnabled: boolean
  onToggle: () => void
  currentPage?: PageKey
  scenario?: string
  onScenarioChange?: (key: string) => void
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showScenarioSelector, setShowScenarioSelector] = useState(false)

  const currentScenario = SCENARIO_PRESETS[scenario as keyof typeof SCENARIO_PRESETS] || SCENARIO_PRESETS.standard
  const steps = currentScenario.steps[currentPage] || []
  const currentStep = steps[currentStepIndex]
  const totalSteps = steps.length

  useEffect(() => {
    setCurrentStepIndex(0)
  }, [currentPage])

  const nextStep = () => {
    if (currentStepIndex < totalSteps - 1) setCurrentStepIndex((prev) => prev + 1)
  }
  const prevStep = () => {
    if (currentStepIndex > 0) setCurrentStepIndex((prev) => prev - 1)
  }
  const resetWalkthrough = () => {
    setCurrentStepIndex(0)
    setIsPaused(false)
  }

  if (!isEnabled || !currentStep) return null

  const getPositionClasses = () => {
    switch (currentStep.position) {
      case 'top': return 'top-24 left-1/2 -translate-x-1/2'
      case 'bottom': return 'bottom-24 left-1/2 -translate-x-1/2'
      case 'left': return 'left-8 top-1/2 -translate-y-1/2'
      case 'right': return 'right-8 top-1/2 -translate-y-1/2'
      default: return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[200] pointer-events-none" />

      <Card className={`fixed ${getPositionClasses()} z-[201] w-96 shadow-2xl border-2 border-blue-500 animate-in fade-in zoom-in duration-300`}>
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Presentation className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                {currentScenario.name}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onToggle} className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              {currentStep.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{currentStep.description}</p>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-colors ${idx <= currentStepIndex ? 'bg-blue-500' : 'bg-slate-200'}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={resetWalkthrough} className="h-8 px-2 text-slate-500">
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowScenarioSelector(!showScenarioSelector)}
                className="h-8 px-2 text-slate-500 text-xs"
              >
                Change Scenario
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{currentStepIndex + 1} / {totalSteps}</span>
              <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStepIndex === 0} className="h-8 w-8 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={nextStep} disabled={currentStepIndex === totalSteps - 1} className="h-8">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {showScenarioSelector && (
          <div className="border-t border-slate-200 p-3 bg-slate-50">
            <p className="text-xs font-medium text-slate-500 mb-2">Select Scenario</p>
            <div className="space-y-1">
              {Object.entries(SCENARIO_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => { onScenarioChange?.(key); setShowScenarioSelector(false); setCurrentStepIndex(0) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    scenario === key ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs text-slate-500">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      <button
        onClick={() => setIsPaused(!isPaused)}
        className="fixed bottom-6 right-6 z-[202] p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
      </button>
    </>
  )
}

export function WalkthroughToggleButton({ isEnabled, onToggle }: { isEnabled: boolean; onToggle: () => void }) {
  return (
    <Button
      onClick={onToggle}
      variant={isEnabled ? 'default' : 'outline'}
      size="sm"
      className={`fixed bottom-6 left-6 z-[199] shadow-lg ${isEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white hover:bg-slate-50'}`}
    >
      <Presentation className="w-4 h-4 mr-2" />
      {isEnabled ? 'Exit Walkthrough' : 'Start Walkthrough'}
    </Button>
  )
}
