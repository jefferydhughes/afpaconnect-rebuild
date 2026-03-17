'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Upload,
  Download,
  Sparkles,
  Trash2,
  ExternalLink,
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  MapPin,
  Globe,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type LocationPage = {
  id: string
  brand: string
  brand_slug: string
  city: string
  city_slug: string
  province: string | null
  country: string
  slug: string
  status: string
  meta_title: string | null
  meta_description: string | null
  population: number | null
  market_size: string | null
  ai_generated_content: string | null
  unique_selling_points: string[] | null
  local_info: any
  created_at: string
  updated_at: string
}

type FranchiseMini = {
  id: string
  name: string
  slug: string
  category: string | null
  description: string | null
}

type Props = {
  initialPages: LocationPage[]
  franchises: FranchiseMini[]
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const SITE_URL = 'https://americanfranchiseprofessionalsalliance.com'

function buildSitemap(pages: LocationPage[]): string {
  const entries = pages
    .filter((p) => p.status === 'available')
    .map(
      (p) =>
        `  <url>\n    <loc>${SITE_URL}/franchises/${p.brand_slug}/${p.city_slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`
}

function downloadText(content: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  // Auto-detect delimiter: prefer tab, fall back to comma
  const delimiter = lines[0].includes('\t') ? '\t' : ','

  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/[^a-z_]/g, '_'))

  return lines.slice(1).map((line) => {
    const values = line.split(delimiter)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = (values[i] || '').trim()
    })
    return row
  })
}

export default function LocationPageManager({ initialPages, franchises }: Props) {
  const [pages, setPages] = useState<LocationPage[]>(initialPages)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [generateProgress, setGenerateProgress] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Derived stats ──────────────────────────────────────────────────────────
  const uniqueBrands = new Set(pages.map((p) => p.brand_slug)).size
  const withAI = pages.filter((p) => p.ai_generated_content).length
  const filtered = pages.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.brand.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      (p.province || '').toLowerCase().includes(q)
    )
  })

  // ── CSV Upload ─────────────────────────────────────────────────────────────
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setUploading(true)
      setUploadStatus(null)

      try {
        const text = await file.text()
        const rows = parseCSV(text)
        if (rows.length === 0) {
          setUploadStatus('No rows found. Check file format.')
          return
        }

        const payload = rows.map((row) => ({
          brand: row.brand || row.brand_name || '',
          city: row.city || row.city_name || '',
          province: row.province || row.state || null,
          country: row.country || 'USA',
          status: row.status || 'available',
          population: row.population ? Number(row.population) : null,
          market_size: row.market_size || row.marketsize || null,
          meta_title: row.meta_title || null,
          meta_description: row.meta_description || null,
        }))

        const res = await fetch('/api/admin/location-pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok) {
          setUploadStatus(`Error: ${result.error}`)
          return
        }

        setUploadStatus(`Imported ${result.count} page${result.count !== 1 ? 's' : ''}`)
        await refreshPages()
      } catch (err: any) {
        setUploadStatus(`Error: ${err.message}`)
      } finally {
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    []
  )

  // ── Refresh list from server ───────────────────────────────────────────────
  async function refreshPages() {
    const res = await fetch('/api/admin/location-pages')
    if (res.ok) {
      const { data } = await res.json()
      setPages(data || [])
    }
  }

  // ── Generate AI for one page ───────────────────────────────────────────────
  async function generateForPage(page: LocationPage) {
    setGeneratingId(page.id)
    try {
      const franchise = franchises.find((f) => f.slug === page.brand_slug)

      const genRes = await fetch('/api/admin/location-pages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: page.brand,
          city: page.city,
          province: page.province,
          country: page.country,
          population: page.population,
          market_size: page.market_size,
          franchise_description: franchise?.description || null,
          franchise_category: franchise?.category || null,
        }),
      })

      if (!genRes.ok) {
        const err = await genRes.json()
        alert(`AI generation failed: ${err.error}`)
        return
      }

      const aiFields = await genRes.json()

      const patchRes = await fetch(`/api/admin/location-pages?id=${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiFields),
      })

      if (patchRes.ok) {
        const { data: updated } = await patchRes.json()
        setPages((prev) => prev.map((p) => (p.id === page.id ? updated : p)))
      }
    } finally {
      setGeneratingId(null)
    }
  }

  // ── Generate AI for all pages without content ──────────────────────────────
  async function generateAll() {
    const pending = pages.filter((p) => !p.ai_generated_content)
    if (pending.length === 0) {
      alert('All pages already have AI content.')
      return
    }

    setGeneratingAll(true)
    for (let i = 0; i < pending.length; i++) {
      const page = pending[i]
      setGenerateProgress(`Generating ${i + 1} of ${pending.length}: ${page.brand} – ${page.city}`)
      await generateForPage(page)
      if (i < pending.length - 1) {
        await new Promise((r) => setTimeout(r, 2000)) // 2s rate-limit buffer
      }
    }
    setGeneratingAll(false)
    setGenerateProgress('')
    await refreshPages()
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function deletePage(id: string) {
    if (!confirm('Delete this location page? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/location-pages?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPages((prev) => prev.filter((p) => p.id !== id))
      } else {
        const err = await res.json()
        alert(`Delete failed: ${err.error}`)
      }
    } finally {
      setDeletingId(null)
    }
  }

  // ── Sitemap export ─────────────────────────────────────────────────────────
  function exportSitemap() {
    const xml = buildSitemap(pages)
    downloadText(xml, 'location-sitemap.xml', 'application/xml')
  }

  // ── CSV template download ──────────────────────────────────────────────────
  function downloadTemplate() {
    const template = 'brand\tcity\tprovince\tcountry\tpopulation\tmarket_size\nSkill Samurai\tJacksonville\tFL\tUSA\t971319\tLarge\n'
    downloadText(template, 'location-pages-template.tsv')
  }

  return (
    <div className="space-y-6">
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pages', value: pages.length },
          { label: 'Brands', value: uniqueBrands },
          { label: 'With AI Content', value: withAI },
          { label: 'Pending AI', value: pages.length - withAI },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-brand-navy">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search brand or city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Upload CSV */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload CSV/TSV
              </Button>
            </div>

            {/* Template */}
            <Button variant="ghost" size="sm" onClick={downloadTemplate}>
              <FileText className="h-4 w-4 mr-1.5" />
              Template
            </Button>

            {/* Generate All */}
            <Button
              onClick={generateAll}
              disabled={generatingAll || generatingId !== null}
              className="bg-brand-navy text-brand-gold hover:bg-brand-navy/90"
            >
              {generatingAll ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate All AI
            </Button>

            {/* Sitemap export */}
            <Button variant="outline" onClick={exportSitemap} disabled={pages.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export Sitemap
            </Button>

            {/* Refresh */}
            <Button variant="ghost" size="icon" onClick={refreshPages} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Status messages */}
          {uploadStatus && (
            <div
              className={`mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                uploadStatus.startsWith('Error')
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}
            >
              {uploadStatus.startsWith('Error') ? (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              )}
              {uploadStatus}
            </div>
          )}
          {generatingAll && generateProgress && (
            <div className="mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-blue-50 text-blue-700">
              <Sparkles className="h-4 w-4 flex-shrink-0 animate-pulse" />
              {generateProgress}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-gold" />
            {filtered.length} location page{filtered.length !== 1 ? 's' : ''}
            {search && <span className="text-gray-400 text-sm font-normal">matching &ldquo;{search}&rdquo;</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <MapPin className="h-8 w-8 mx-auto mb-3 text-gray-300" />
              {search ? 'No pages match your search.' : 'No location pages yet. Upload a CSV to get started.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Brand</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">City</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Market</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">AI Content</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((page) => (
                    <>
                      <tr
                        key={page.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">{page.brand}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {page.city}
                          {page.province && (
                            <span className="text-gray-400 ml-1">{page.province}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {page.market_size ? (
                            <Badge variant="outline" className="text-xs">
                              {page.market_size}
                            </Badge>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {page.ai_generated_content ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Generated
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Pending</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={page.status === 'available' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {page.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            {/* Expand row */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                setExpandedId(expandedId === page.id ? null : page.id)
                              }
                              title="View details"
                            >
                              {expandedId === page.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>

                            {/* Preview */}
                            <a
                              href={`/franchises/${page.brand_slug}/${page.city_slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Preview page">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>

                            {/* Generate AI */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-brand-navy"
                              onClick={() => generateForPage(page)}
                              disabled={generatingId === page.id || generatingAll}
                              title={page.ai_generated_content ? 'Regenerate AI content' : 'Generate AI content'}
                            >
                              {generatingId === page.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4" />
                              )}
                            </Button>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700"
                              onClick={() => deletePage(page.id)}
                              disabled={deletingId === page.id}
                              title="Delete"
                            >
                              {deletingId === page.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {expandedId === page.id && (
                        <tr key={`${page.id}-detail`} className="bg-gray-50 border-b">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-500">URL: </span>
                                <a
                                  href={`/franchises/${page.brand_slug}/${page.city_slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-navy hover:underline inline-flex items-center gap-1"
                                >
                                  /franchises/{page.brand_slug}/{page.city_slug}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>

                              {page.meta_title && (
                                <div>
                                  <span className="font-medium text-gray-500">Meta title: </span>
                                  {page.meta_title}
                                </div>
                              )}
                              {page.meta_description && (
                                <div>
                                  <span className="font-medium text-gray-500">Meta description: </span>
                                  {page.meta_description}
                                </div>
                              )}
                              {page.ai_generated_content && (
                                <div>
                                  <span className="font-medium text-gray-500">AI content preview: </span>
                                  <span className="text-gray-700 line-clamp-3">
                                    {page.ai_generated_content}
                                  </span>
                                </div>
                              )}
                              {page.unique_selling_points && page.unique_selling_points.length > 0 && (
                                <div>
                                  <span className="font-medium text-gray-500">Selling points: </span>
                                  <ul className="mt-1 list-disc list-inside space-y-0.5 text-gray-700">
                                    {page.unique_selling_points.map((pt, i) => (
                                      <li key={i}>{pt}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Help ── */}
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">CSV/TSV Format</p>
          <p className="text-sm text-gray-600">
            Required columns: <code className="bg-white px-1 rounded border text-xs">brand</code>,{' '}
            <code className="bg-white px-1 rounded border text-xs">city</code>. Optional:{' '}
            <code className="bg-white px-1 rounded border text-xs">province</code>,{' '}
            <code className="bg-white px-1 rounded border text-xs">country</code>,{' '}
            <code className="bg-white px-1 rounded border text-xs">population</code>,{' '}
            <code className="bg-white px-1 rounded border text-xs">market_size</code>,{' '}
            <code className="bg-white px-1 rounded border text-xs">status</code>.
            Delimiter is auto-detected (tab or comma). Download the template for a starter file.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
