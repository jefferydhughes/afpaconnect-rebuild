'use client'

/**
 * TourManager
 * -----------
 * Drives the Intro.js onboarding tour for each dashboard role.
 *
 * Configuration lives entirely in /public/tours.json — no data-* attributes
 * are added to the HTML; steps reference existing DOM elements via standard
 * CSS selectors defined in the JSON file.
 *
 * Completion is persisted in localStorage under the key
 * `tour_completed_<role>` so the tour only runs once per user per device.
 * Call TourManager.reset(role) — or click the TourResetButton — to replay it.
 */

import { useEffect, useRef } from 'react'

interface TourStep {
  element?: string | null  // CSS selector for an existing DOM element
  title: string
  intro: string            // HTML allowed
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
}

interface TourConfig {
  steps: TourStep[]
}

interface ToursJson {
  [role: string]: TourConfig
}

interface Props {
  role: string
}

/** Key used in localStorage to flag tour completion for a given role. */
export function tourStorageKey(role: string) {
  return `tour_completed_${role}`
}

export default function TourManager({ role }: Props) {
  const introRef = useRef<unknown>(null)

  useEffect(() => {
    // Only run once per role per device
    if (typeof window === 'undefined') return
    if (localStorage.getItem(tourStorageKey(role))) return

    let cancelled = false

    async function startTour() {
      // Fetch tour config from public/tours.json
      let toursJson: ToursJson
      try {
        const res = await fetch('/tours.json')
        toursJson = await res.json()
      } catch {
        return
      }

      const config: TourConfig | undefined = toursJson[role]
      if (!config?.steps?.length || cancelled) return

      // Dynamically import intro.js (avoids SSR issues and keeps it out of
      // the initial JS bundle for users who have already completed the tour)
      const { default: introJs } = await import('intro.js')
      if (cancelled) return

      // Resolve CSS selectors → DOM elements.
      // Steps whose selector matches nothing become floating tooltips.
      const steps = config.steps.map((step) => {
        const resolved: Record<string, unknown> = {
          title: step.title,
          intro: step.intro,
        }

        if (step.element) {
          const el = document.querySelector(step.element)
          if (el) {
            resolved.element = el
          }
          // If el is null we intentionally omit it — Intro.js will centre
          // the tooltip on the viewport, which is fine for welcome/outro steps.
        }

        if (step.position) resolved.position = step.position
        return resolved
      })

      const intro = introJs()
      introRef.current = intro

      intro.setOptions({
        steps,
        showProgress: true,
        showBullets: false,
        showStepNumbers: false,
        exitOnOverlayClick: false,
        exitOnEsc: true,
        scrollToElement: true,
        scrollPadding: 80,
        nextLabel: 'Next &rarr;',
        prevLabel: '&larr; Back',
        doneLabel: 'Get Started!',
        skipLabel: '&times; Skip',
        tooltipClass: 'afpa-tour-tooltip',
        highlightClass: 'afpa-tour-highlight',
        buttonClass: 'introjs-button afpa-tour-btn',
      })

      const markDone = () => {
        localStorage.setItem(tourStorageKey(role), 'true')
      }

      intro.oncomplete(markDone)
      intro.onexit(markDone)

      // Small delay so page elements finish rendering before Intro.js
      // tries to position tooltips
      setTimeout(() => {
        if (!cancelled) intro.start()
      }, 600)
    }

    startTour()

    return () => {
      cancelled = true
      // Exit gracefully if the component unmounts mid-tour (e.g. navigation)
      const i = introRef.current as { exit?: (force: boolean) => void } | null
      if (i?.exit) i.exit(true)
    }
  }, [role])

  // Renders nothing — purely behavioural
  return null
}
