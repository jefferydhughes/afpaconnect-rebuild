'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { 
  Send, 
  RefreshCw, 
  CheckCircle,
  Loader2 
} from 'lucide-react'

const US_STATES = [
  { value: 'AL', label: 'Alabama', icon: '📍' },
  { value: 'AK', label: 'Alaska', icon: '📍' },
  { value: 'AZ', label: 'Arizona', icon: '📍' },
  { value: 'AR', label: 'Arkansas', icon: '📍' },
  { value: 'CA', label: 'California', icon: '📍' },
  { value: 'CO', label: 'Colorado', icon: '📍' },
  { value: 'CT', label: 'Connecticut', icon: '📍' },
  { value: 'DE', label: 'Delaware', icon: '📍' },
  { value: 'FL', label: 'Florida', icon: '📍' },
  { value: 'GA', label: 'Georgia', icon: '📍' },
  { value: 'HI', label: 'Hawaii', icon: '📍' },
  { value: 'ID', label: 'Idaho', icon: '📍' },
  { value: 'IL', label: 'Illinois', icon: '📍' },
  { value: 'IN', label: 'Indiana', icon: '📍' },
  { value: 'IA', label: 'Iowa', icon: '📍' },
  { value: 'KS', label: 'Kansas', icon: '📍' },
  { value: 'KY', label: 'Kentucky', icon: '📍' },
  { value: 'LA', label: 'Louisiana', icon: '📍' },
  { value: 'ME', label: 'Maine', icon: '📍' },
  { value: 'MD', label: 'Maryland', icon: '📍' },
  { value: 'MA', label: 'Massachusetts', icon: '📍' },
  { value: 'MI', label: 'Michigan', icon: '📍' },
  { value: 'MN', label: 'Minnesota', icon: '📍' },
  { value: 'MS', label: 'Mississippi', icon: '📍' },
  { value: 'MO', label: 'Missouri', icon: '📍' },
  { value: 'MT', label: 'Montana', icon: '📍' },
  { value: 'NE', label: 'Nebraska', icon: '📍' },
  { value: 'NV', label: 'Nevada', icon: '📍' },
  { value: 'NH', label: 'New Hampshire', icon: '📍' },
  { value: 'NJ', label: 'New Jersey', icon: '📍' },
  { value: 'NM', label: 'New Mexico', icon: '📍' },
  { value: 'NY', label: 'New York', icon: '📍' },
  { value: 'NC', label: 'North Carolina', icon: '📍' },
  { value: 'ND', label: 'North Dakota', icon: '📍' },
  { value: 'OH', label: 'Ohio', icon: '📍' },
  { value: 'OK', label: 'Oklahoma', icon: '📍' },
  { value: 'OR', label: 'Oregon', icon: '📍' },
  { value: 'PA', label: 'Pennsylvania', icon: '📍' },
  { value: 'RI', label: 'Rhode Island', icon: '📍' },
  { value: 'SC', label: 'South Carolina', icon: '📍' },
  { value: 'SD', label: 'South Dakota', icon: '📍' },
  { value: 'TN', label: 'Tennessee', icon: '📍' },
  { value: 'TX', label: 'Texas', icon: '📍' },
  { value: 'UT', label: 'Utah', icon: '📍' },
  { value: 'VT', label: 'Vermont', icon: '📍' },
  { value: 'VA', label: 'Virginia', icon: '📍' },
  { value: 'WA', label: 'Washington', icon: '📍' },
  { value: 'WV', label: 'West Virginia', icon: '📍' },
  { value: 'WI', label: 'Wisconsin', icon: '📍' },
  { value: 'WY', label: 'Wyoming', icon: '📍' },
]

// Quiz questions configuration
const QUIZ_QUESTIONS = [
  {
    id: 'budget',
    prompt: "What's your investment budget?",
    type: 'single_choice',
    icon: '💰',
    options: [
      { value: 'under_50k', label: 'Under $50,000', icon: '💡' },
      { value: '50k_100k', label: '$50,000 – $100,000', icon: '💼' },
      { value: '100k_250k', label: '$100,000 – $250,000', icon: '🏢' },
      { value: '250k_500k', label: '$250,000 – $500,000', icon: '🏆' },
      { value: 'over_500k', label: 'Over $500,000', icon: '💎' },
    ],
  },
  {
    id: 'categories',
    prompt: 'Which industries interest you? (Select all that apply)',
    type: 'multi_choice',
    icon: '✨',
    options: [
      { value: 'food_beverage', label: 'Food & Beverage', icon: '🍕' },
      { value: 'retail', label: 'Retail', icon: '🛍️' },
      { value: 'services', label: 'Business Services', icon: '💼' },
      { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
      { value: 'fitness', label: 'Fitness & Wellness', icon: '💪' },
      { value: 'childrens_services', label: "Children's Services", icon: '🧒' },
      { value: 'automotive', label: 'Automotive', icon: '🚗' },
      { value: 'home_services', label: 'Home Services', icon: '🏠' },
      { value: 'technology', label: 'Technology', icon: '💻' },
    ],
  },
  {
    id: 'business_model',
    prompt: 'What kind of work environment do you prefer?',
    type: 'single_choice',
    icon: '🏡',
    options: [
      { value: 'storefront', label: 'Retail / Storefront', icon: '🏬' },
      { value: 'mobile', label: 'Mobile Service', icon: '🚐' },
      { value: 'home_based', label: 'Work From Home', icon: '🛋️' },
      { value: 'online', label: 'Online / E-Commerce', icon: '💻' },
    ],
  },
  {
    id: 'time_commitment',
    prompt: 'How much time can you dedicate each week?',
    type: 'single_choice',
    icon: '⏰',
    options: [
      { value: 'part_time', label: 'Part-time (10-30 hrs/week)', icon: '🕒' },
      { value: 'full_time', label: 'Full-time (40+ hrs/week)', icon: '💼' },
      { value: 'passive', label: 'Semi-passive investment', icon: '🎯' },
    ],
  },
  {
    id: 'experience',
    prompt: "What's your business experience level?",
    type: 'single_choice',
    icon: '📈',
    options: [
      { value: 'none', label: 'New to business', icon: '🌱' },
      { value: 'some', label: 'Some experience', icon: '📊' },
      { value: 'extensive', label: 'Extensive experience', icon: '🎯' },
    ],
  },
  {
    id: 'territory',
    prompt: 'Where would you like to open your franchise? (Select all that apply)',
    type: 'multi_choice',
    icon: '📍',
    options: US_STATES,
  },
  {
    id: 'goals',
    prompt: 'What are your primary goals? (Select all that apply)',
    type: 'multi_choice',
    icon: '🎯',
    options: [
      { value: 'financial_freedom', label: 'Financial Freedom', icon: '💰' },
      { value: 'be_own_boss', label: 'Be My Own Boss', icon: '👑' },
      { value: 'family_business', label: 'Build a Family Business', icon: '👨‍👩‍👧‍👦' },
      { value: 'community_impact', label: 'Community Impact', icon: '🌍' },
      { value: 'career_change', label: 'Career Change', icon: '🔄' },
      { value: 'retirement_income', label: 'Retirement Income', icon: '🏖️' },
    ],
  },
  {
    id: 'contact',
    prompt: 'Great! Where should I send your results?',
    type: 'contact_form',
    icon: '📩',
  },
]

const conversationScript = {
  persona: {
    name: 'Fran',
    typingLabel: 'Fran is typing…',
  },
  intro: [
    { text: "Hey there! 👋 I'm Fran, your FranchiseFit guide.", delay: 300 },
    { text: "Let's find a franchise that fits your goals.", delay: 500 },
  ],
  acknowledgements: {
    budget: {
      under_50k: 'Great place to start — flexible options ahead 💡',
      '50k_100k': 'Nice range. Solid opportunities here 💼',
      '100k_250k': 'Strong position — established brands fit well 🏢',
      '250k_500k': 'Premium concepts unlocked 🏆',
      over_500k: 'Multi-unit potential on the table 💎',
    },
    business_model: {
      home_based: 'Flexibility is a big win 🛋️',
      mobile: 'Hands-on and active — love it 🚐',
      storefront: 'Structured and customer-facing 👍',
    },
    time_commitment: {
      part_time: 'Smart approach — balance is key ⚖️',
      full_time: 'All in — that commitment pays off 💪',
      passive: 'Hands-off model — strategic choice 🎯',
    },
  },
  transitions: [
    "Let's keep going…",
    'On to the next one.',
    'This helps narrow things down.',
  ],
  outro: [
    { text: "Thanks — I've got a clear picture now.", delay: 400 },
    { text: 'Let me line up your best franchise matches.', delay: 600 },
  ],
}

type Message = {
  type: 'bot' | 'user'
  text: string
}

type QuizAnswers = {
  budget?: string
  categories?: string[]
  business_model?: string
  time_commitment?: string
  experience?: string
  territory?: string[]
  goals?: string[]
  contact?: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
}

export default function QuizPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizResultId, setQuizResultId] = useState<string | null>(null)
  const [territorySearch, setTerritorySearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex]
  const progress = ((currentQuestionIndex) / QUIZ_QUESTIONS.length) * 100

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showOptions, isTyping])

  const addBotMessage = (text: string, delay = 800) => {
    setIsTyping(true)
    setShowOptions(false)
    setTimeout(() => {
      setMessages((prev) => [...prev, { type: 'bot', text }])
      setIsTyping(false)
      setTimeout(() => setShowOptions(true), 300)
    }, delay)
  }

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { type: 'user', text }])
    setShowOptions(false)
  }

  const handleStart = () => {
    setHasStarted(true)
    
    // Play intro sequence
    let totalDelay = 0
    conversationScript.intro.forEach((msg, index) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, { type: 'bot', text: msg.text }])
      }, totalDelay)
      totalDelay += msg.delay + 400
    })

    // Show first question
    setTimeout(() => {
      addBotMessage(QUIZ_QUESTIONS[0].prompt, 300)
    }, totalDelay + 200)
  }

  const handleSingleChoice = (value: string, displayText: string) => {
    addUserMessage(displayText)
    
    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)

    // Get acknowledgement if available
    const ack = (conversationScript.acknowledgements as any)[currentQuestion.id]?.[value]
    
    setTimeout(() => {
      if (ack) {
        setMessages((prev) => [...prev, { type: 'bot', text: ack }])
      }
      
      // Move to next question
      setTimeout(() => {
        moveToNextQuestion()
      }, ack ? 800 : 400)
    }, 400)
  }

  const handleMultiSelect = (value: string) => {
    setMultiSelectAnswers((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const handleMultiSelectConfirm = () => {
    if (multiSelectAnswers.length === 0) return

    const displayText = multiSelectAnswers
      .map((v) => currentQuestion.options?.find((o) => o.value === v)?.label)
      .join(', ')
    
    addUserMessage(displayText)
    
    const newAnswers = { ...answers, [currentQuestion.id]: multiSelectAnswers }
    setAnswers(newAnswers)
    setMultiSelectAnswers([])

    setTimeout(() => moveToNextQuestion(), 400)
  }

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const contactInfo = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
    }

    addUserMessage(`${contactInfo.firstName} ${contactInfo.lastName} - ${contactInfo.email}`)
    
    const finalAnswers = { ...answers, contact: contactInfo }
    setAnswers(finalAnswers)

    // Show outro
    setIsTyping(true)
    setTimeout(() => {
      setMessages((prev) => [...prev, { type: 'bot', text: conversationScript.outro[0].text }])
      setTimeout(() => {
        setMessages((prev) => [...prev, { type: 'bot', text: conversationScript.outro[1].text }])
        setIsTyping(false)
        
        // Submit quiz
        submitQuiz(finalAnswers)
      }, 600)
    }, 400)
  }

  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1
    
    if (nextIndex < QUIZ_QUESTIONS.length) {
      setCurrentQuestionIndex(nextIndex)
      setTerritorySearch('')
      addBotMessage(QUIZ_QUESTIONS[nextIndex].prompt)
    }
  }

  const goToResults = (resultId: string) => {
    const target = `/quiz/results?id=${resultId}`
    router.push(target)

    // Fallback hard navigation if client routing does not transition.
    setTimeout(() => {
      if (window.location.pathname === '/quiz') {
        window.location.href = target
      }
    }, 900)
  }

  const submitQuiz = async (finalAnswers: QuizAnswers) => {
    setIsSubmitting(true)
    
    try {
      // Get advisor attribution from URL or cookie
      const urlParams = new URLSearchParams(window.location.search)
      const advisorId = urlParams.get('advisor') || urlParams.get('ref')
      
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...finalAnswers,
          attributed_advisor_id: advisorId,
          source: 'website',
        }),
      })

      let responseData: any = null
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        responseData = await response.json().catch(() => null)
      } else {
        responseData = await response.text().catch(() => null)
      }

      if (!response.ok) {
        const apiError =
          typeof responseData === 'string'
            ? responseData
            : responseData?.details || responseData?.error || `HTTP ${response.status}`
        throw new Error(apiError)
      }
      
      const createdQuizResultId = responseData?.quizResultId
      if (!createdQuizResultId) throw new Error('Quiz submitted but no result id returned')

      localStorage.setItem('afpa_last_quiz_result_id', createdQuizResultId)
      document.cookie = `afpa_last_quiz_result_id=${encodeURIComponent(createdQuizResultId)}; Path=/; Max-Age=31536000; SameSite=Lax`
      setQuizResultId(createdQuizResultId)
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: 'Your rankings are ready. Click "View My Matches" to open your results.' },
      ])
      setIsSubmitting(false)

      // Redirect automatically, while still exposing a manual button fallback.
      goToResults(createdQuizResultId)
    } catch (error) {
      console.error('Quiz submission error:', error)
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: 'Oops! Something went wrong. Please try again.' },
      ])
      setIsSubmitting(false)
    }
  }

  const handleRestart = () => {
    setMessages([])
    setAnswers({})
    setMultiSelectAnswers([])
    setCurrentQuestionIndex(0)
    setShowOptions(false)
    setHasStarted(false)
    setIsSubmitting(false)
    setQuizResultId(null)
    setTerritorySearch('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-navy to-brand-navy-light text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">FranchiseFit360™ Quiz</h1>
                <p className="text-blue-100">Find your perfect franchise match</p>
              </div>
              {hasStarted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRestart}
                  className="text-white hover:bg-white/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restart
                </Button>
              )}
            </div>
            {hasStarted && (
              <div className="mt-4">
                <Progress value={progress} className="h-2 bg-white/20" />
                <p className="text-xs text-blue-100 mt-1">
                  Question {Math.min(currentQuestionIndex + 1, QUIZ_QUESTIONS.length)} of {QUIZ_QUESTIONS.length}
                </p>
              </div>
            )}
          </div>

          <CardContent className="p-6">
            {!hasStarted ? (
              // Start Screen
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎯</span>
                </div>
                <h2 className="text-2xl font-bold text-brand-navy mb-4">
                  Find Your Perfect Franchise Match
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Answer a few quick questions and our AI will match you with franchises 
                  that fit your goals, budget, and lifestyle.
                </p>
                <Button 
                  size="lg" 
                  onClick={handleStart}
                  className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light"
                >
                  Start Quiz (3 min)
                </Button>
              </div>
            ) : (
              // Chat Interface
              <div className="space-y-4">
                {/* Messages */}
                <div className="h-[400px] overflow-y-auto space-y-4 pr-2">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex',
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl px-4 py-3',
                            message.type === 'user'
                              ? 'bg-brand-navy text-white'
                              : 'bg-gray-100 text-gray-800'
                          )}
                        >
                          {message.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Options */}
                {showOptions && !isSubmitting && currentQuestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-t pt-4"
                  >
                    {currentQuestion.type === 'single_choice' && (
                      <div className="grid gap-2">
                        {currentQuestion.options?.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleSingleChoice(option.value, option.label)}
                            className="quiz-option text-left"
                          >
                            <span className="text-xl">{option.icon}</span>
                            <span className="font-medium">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {currentQuestion.type === 'multi_choice' && (
                      <div className="space-y-4">
                        {currentQuestion.id === 'territory' && (
                          <Input
                            value={territorySearch}
                            onChange={(e) => setTerritorySearch(e.target.value)}
                            placeholder="Search states..."
                          />
                        )}
                        <div className="grid gap-2">
                          {currentQuestion.options
                            ?.filter((option) =>
                              currentQuestion.id !== 'territory'
                                ? true
                                : option.label.toLowerCase().includes(territorySearch.toLowerCase()) ||
                                  option.value.toLowerCase().includes(territorySearch.toLowerCase())
                            )
                            .map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleMultiSelect(option.value)}
                              className={cn(
                                'quiz-option text-left',
                                multiSelectAnswers.includes(option.value) && 'selected'
                              )}
                            >
                              <span className="text-xl">{option.icon || '📍'}</span>
                              <span className="font-medium flex-1">{option.label}</span>
                              {multiSelectAnswers.includes(option.value) && (
                                <CheckCircle className="w-5 h-5 text-brand-gold" />
                              )}
                            </button>
                          ))}
                        </div>
                        <Button
                          onClick={handleMultiSelectConfirm}
                          disabled={multiSelectAnswers.length === 0}
                          className="w-full bg-brand-navy text-brand-gold hover:bg-brand-navy-light"
                        >
                          Continue
                        </Button>
                      </div>
                    )}

                    {currentQuestion.type === 'contact_form' && (
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              required
                              placeholder="John"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              required
                              placeholder="Smith"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone (optional)</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-brand-gold text-brand-navy hover:bg-brand-gold-light"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Get My Results
                        </Button>
                      </form>
                    )}
                  </motion.div>
                )}

                {/* Submitting State */}
                {isSubmitting && (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-navy" />
                    <p className="text-gray-600 mt-4">Finding your perfect matches...</p>
                  </div>
                )}

                {quizResultId && !isSubmitting && (
                  <div className="text-center py-8">
                    <p className="text-gray-700 mb-4">Your results are ready.</p>
                    <Button
                      onClick={() => goToResults(quizResultId)}
                      className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light"
                    >
                      View My Matches
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

