'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calculator, DollarSign, TrendingUp, PieChart, ArrowRight, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

export default function CalculatorPage() {
  const [investment, setInvestment] = useState(150000)
  const [franchiseFee, setFranchiseFee] = useState(35000)
  const [monthlyRevenue, setMonthlyRevenue] = useState(50000)
  const [royaltyRate, setRoyaltyRate] = useState(6)
  const [marketingFee, setMarketingFee] = useState(2)
  const [operatingCosts, setOperatingCosts] = useState(65)
  const [liquidCapital, setLiquidCapital] = useState(75000)

  // Calculations
  const annualRevenue = monthlyRevenue * 12
  const annualRoyalty = annualRevenue * (royaltyRate / 100)
  const annualMarketing = annualRevenue * (marketingFee / 100)
  const annualOperating = annualRevenue * (operatingCosts / 100)
  const annualProfit = annualRevenue - annualRoyalty - annualMarketing - annualOperating
  const monthlyProfit = annualProfit / 12
  const roiYears = investment / annualProfit
  const profitMargin = (annualProfit / annualRevenue) * 100

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-brand-navy text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-gold rounded-lg">
              <Calculator className="h-8 w-8 text-brand-navy" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Franchise Investment Calculator</h1>
              <p className="text-gray-300">Estimate your potential ROI and monthly profits</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculator Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Details</CardTitle>
                <CardDescription>Enter your estimated franchise costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="investment">Total Initial Investment</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="investment"
                        type="number"
                        value={investment}
                        onChange={(e) => setInvestment(Number(e.target.value))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="franchiseFee">Franchise Fee</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="franchiseFee"
                        type="number"
                        value={franchiseFee}
                        onChange={(e) => setFranchiseFee(Number(e.target.value))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="liquidCapital">Your Liquid Capital</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="liquidCapital"
                        type="number"
                        value={liquidCapital}
                        onChange={(e) => setLiquidCapital(Number(e.target.value))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyRevenue">Est. Monthly Revenue</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="monthlyRevenue"
                        type="number"
                        value={monthlyRevenue}
                        onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ongoing Costs</CardTitle>
                <CardDescription>Adjust the typical franchise fee percentages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Royalty Fee</Label>
                    <span className="font-semibold">{royaltyRate}%</span>
                  </div>
                  <Slider
                    value={[royaltyRate]}
                    onValueChange={(value) => setRoyaltyRate(value[0])}
                    min={0}
                    max={15}
                    step={0.5}
                  />
                  <p className="text-sm text-gray-500">
                    Annual cost: {formatCurrency(annualRoyalty)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Marketing/Ad Fee</Label>
                    <span className="font-semibold">{marketingFee}%</span>
                  </div>
                  <Slider
                    value={[marketingFee]}
                    onValueChange={(value) => setMarketingFee(value[0])}
                    min={0}
                    max={10}
                    step={0.5}
                  />
                  <p className="text-sm text-gray-500">
                    Annual cost: {formatCurrency(annualMarketing)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Operating Costs (% of revenue)</Label>
                    <span className="font-semibold">{operatingCosts}%</span>
                  </div>
                  <Slider
                    value={[operatingCosts]}
                    onValueChange={(value) => setOperatingCosts(value[0])}
                    min={30}
                    max={90}
                    step={1}
                  />
                  <p className="text-sm text-gray-500">
                    Includes labor, rent, supplies, utilities, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader className="bg-brand-navy text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Projected Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center p-4 bg-brand-cream rounded-lg">
                  <p className="text-sm text-gray-600">Est. Monthly Profit</p>
                  <p className="text-3xl font-bold text-brand-navy">
                    {formatCurrency(monthlyProfit)}
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Est. Annual Profit</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(annualProfit)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">ROI Timeline</p>
                    <p className="text-xl font-bold text-gray-900">
                      {roiYears > 0 && roiYears < 20 ? `${roiYears.toFixed(1)} yrs` : 'N/A'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Profit Margin</p>
                    <p className="text-xl font-bold text-gray-900">
                      {profitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Revenue</span>
                    <span className="font-medium">{formatCurrency(annualRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">- Royalties</span>
                    <span className="font-medium text-red-600">-{formatCurrency(annualRoyalty)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">- Marketing</span>
                    <span className="font-medium text-red-600">-{formatCurrency(annualMarketing)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">- Operating</span>
                    <span className="font-medium text-red-600">-{formatCurrency(annualOperating)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Net Profit</span>
                    <span className={annualProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(annualProfit)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg flex gap-2">
                  <Info className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    These are estimates only. Actual results vary by franchise, location, and management. 
                    Always review the FDD for official financial data.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-brand-cream border-brand-gold">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-brand-navy mb-2">
                  Find Franchises in Your Budget
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Take our quiz to discover franchises that match your investment capacity.
                </p>
                <Link href="/quiz">
                  <Button className="w-full bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
                    Take the Free Quiz
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
