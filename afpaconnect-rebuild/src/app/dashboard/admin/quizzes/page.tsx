import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-role'
import { FileText, Search, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

async function getQuizResults() {
  const supabase = createAdminClient()

  const { data: results } = await supabase
    .from('quiz_results')
    .select('*')
    .order('created_at', { ascending: false })

  return results || []
}

export default async function AdminQuizzesPage() {
  await requireAdmin('/dashboard/admin/quizzes')

  const results = await getQuizResults()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-gold text-sm font-medium mb-1">Admin Dashboard</p>
              <h1 className="text-3xl font-bold">Quiz Results</h1>
              <p className="text-gray-300 mt-1">
                All quiz submissions — {results.length} total
              </p>
            </div>
            <div className="hidden md:flex gap-3">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-brand-navy">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Quiz Submissions</CardTitle>
                <CardDescription>Review and analyze user quiz responses</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:border-brand-gold transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {quiz.first_name && quiz.last_name
                            ? `${quiz.first_name} ${quiz.last_name}`
                            : quiz.email || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {quiz.email}
                          {quiz.budget_range && ` • ${quiz.budget_range.replace(/_/g, ' ')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {quiz.matched_franchises?.length || 0} matches
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {quiz.attributed_advisor_id && (
                        <Badge variant="outline" className="text-xs">
                          Via Advisor
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No quiz submissions yet</h3>
                <p className="text-gray-500">Quiz results will appear here once users complete the quiz.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
