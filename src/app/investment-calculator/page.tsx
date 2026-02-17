'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Check, Building2, Calculator, FileText, Shield, TrendingUp, Users, DollarSign, Clock, Star } from 'lucide-react'

export default function InvestmentCalculatorPage() {
  const [investment, setInvestment] = useState(100000)
  const [experience, setExperience] = useState('5')
  const [timeframe, setTimeframe] = useState('10')

  const estimatedROI = Math.round((investment * 0.15 * parseInt(timeframe) / (investment * 0.3)) * 100)
  const monthlyPayment = Math.round((investment * 0.05) / 12)
  const breakEvenMonths = Math.round((investment * 0.3) / (investment * 0.15 / 12))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Franchise Investment Calculator</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Estimate your franchise investment, potential returns, and break-even timeline.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Calculator */}
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calculator className="h-6 w-6" />
                Calculate Your Investment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Investment Amount: ${investment.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="10000"
                  value={investment}
                  onChange={(e) => setInvestment(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>$10K</span>
                  <span>$1M</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Years of Business Experience: {experience} years
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0</span>
                  <span>20+</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Investment Timeframe: {timeframe} years
                </label>
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>3 years</span>
                  <span>30 years</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            <Card className="bg-brand-navy text-white border-0 shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-6">Estimated Results</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-white/10 rounded-lg">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-brand-gold" />
                    <div className="text-3xl font-bold">${monthlyPayment.toLocaleString()}</div>
                    <div className="text-sm text-gray-300">Est. Monthly Revenue</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/10 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-brand-gold" />
                    <div className="text-3xl font-bold">{breakEvenMonths}</div>
                    <div className="text-sm text-gray-300">Months to Break Even</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Estimated {timeframe}-Year ROI:</span>
                    <span className="text-3xl font-bold text-brand-gold">{estimatedROI}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <h4 className="font-bold text-lg mb-4">What's Included in Your Investment?</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Franchise initial fee</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Equipment and inventory</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Real estate and buildout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Working capital (3 months)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Training and support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/quiz" className="flex-1">
                <Button className="w-full bg-brand-navy text-brand-gold">
                  Get Personalized Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/directory" className="flex-1">
                <Button variant="outline" className="w-full">
                  Browse Franchises
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Disclaimer:</strong> These figures are estimates only and should be used as a general guide. 
            Actual results vary based on location, management, market conditions, and other factors. 
            Always consult with a financial advisor and review the Franchise Disclosure Document (FDD) before making any investment.
          </p>
        </div>
      </main>
    </div>
  )
}
