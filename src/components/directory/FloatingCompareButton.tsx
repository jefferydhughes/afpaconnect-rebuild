'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, X } from 'lucide-react'

interface FloatingCompareButtonProps {
  compareList: any[]
  onRemoveFromCompare: (franchise: any) => void
}

export default function FloatingCompareButton({ compareList, onRemoveFromCompare }: FloatingCompareButtonProps) {
  if (compareList.length === 0) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:top-1/2 md:bottom-auto md:transform md:-translate-y-1/2 z-50">
      <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600 shadow-2xl w-full md:min-w-[280px] md:w-auto">
        <CardContent className="p-4">
          <div className="text-white mb-3">
            <h3 className="font-semibold text-lg mb-1">Compare Franchises</h3>
            <p className="text-sm text-slate-200">{compareList.length}/3 selected</p>
          </div>
          
          <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
            {compareList.map((franchise) => (
              <div key={franchise.name} className="flex items-center justify-between bg-slate-700/50 rounded p-2">
                <span className="text-white text-sm font-medium truncate flex-1 mr-2">
                  {franchise.name}
                </span>
                <button
                  onClick={() => onRemoveFromCompare(franchise)}
                  className="text-slate-300 hover:text-white flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <Button 
            asChild 
            className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy"
            disabled={compareList.length < 2}
          >
            <Link href={`/compare?ids=${compareList.map(f => encodeURIComponent(f.name)).join(',')}`}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Compare Now
            </Link>
          </Button>
          
          {compareList.length < 2 && (
            <p className="text-xs text-slate-300 text-center mt-2">
              Select at least 2 franchises to compare
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
