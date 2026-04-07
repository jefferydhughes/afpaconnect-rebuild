'use client'

import { useRouter } from 'next/navigation'
import { Mail, Phone, Clock, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Lead = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  budget_range: string | null
  status: string
  source: string | null
  created_at: string
  attributed_advisor_id: string | null
  advisor_name?: string | null
}

const PIPELINE_STAGES = [
  { key: 'new', label: 'New', color: 'border-blue-400', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  { key: 'contacted', label: 'Contacted', color: 'border-yellow-400', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
  { key: 'qualified', label: 'Qualified', color: 'border-purple-400', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
  { key: 'nurturing', label: 'Nurturing', color: 'border-orange-400', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
  { key: 'converted', label: 'Converted', color: 'border-green-400', bg: 'bg-green-50', badge: 'bg-green-100 text-green-700' },
  { key: 'unqualified', label: 'Unqualified', color: 'border-gray-400', bg: 'bg-gray-50', badge: 'bg-gray-100 text-gray-700' },
]

const BUDGET_LABELS: Record<string, string> = {
  under_50k: 'Under $50K',
  '50k_100k': '$50K – $100K',
  '100k_250k': '$100K – $250K',
  '250k_500k': '$250K – $500K',
  over_500k: 'Over $500K',
}

export default function PipelineView({ leads }: { leads: Lead[] }) {
  const router = useRouter()

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 500 }}>
      {PIPELINE_STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => String(l.status) === stage.key)
        return (
          <div
            key={stage.key}
            className={`flex-shrink-0 w-72 rounded-xl border-t-4 ${stage.color} bg-white shadow-sm flex flex-col`}
          >
            {/* Column header */}
            <div className={`px-4 py-3 ${stage.bg} rounded-t-lg border-b`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {stage.label}
                </h3>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.badge}`}
                >
                  {stageLeads.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {stageLeads.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">
                  No leads
                </p>
              ) : (
                stageLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() =>
                      router.push(`/dashboard/admin/leads/${lead.id}`)
                    }
                    className="w-full text-left p-3 bg-white border rounded-lg hover:border-brand-navy/30 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {lead.first_name && lead.last_name
                            ? `${lead.first_name} ${lead.last_name}`
                            : lead.email}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {lead.email}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-brand-navy flex-shrink-0 mt-0.5" />
                    </div>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {lead.budget_range && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {BUDGET_LABELS[lead.budget_range] ||
                            lead.budget_range.replace(/_/g, ' ')}
                        </span>
                      )}
                      {lead.source && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded capitalize">
                          {lead.source.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {new Date(lead.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <div className="flex gap-1">
                        {lead.email && (
                          <Mail className="h-3 w-3 text-gray-300" />
                        )}
                        {lead.phone && (
                          <Phone className="h-3 w-3 text-gray-300" />
                        )}
                      </div>
                    </div>

                    {lead.advisor_name && (
                      <p className="text-xs text-brand-navy mt-1.5 truncate">
                        {lead.advisor_name}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
