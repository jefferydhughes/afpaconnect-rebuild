'use client'

import React, { useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Brain } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Fit360ProfilePage from './Fit360ProfilePage'

// ---------------------------------------------------------------------------
// Supabase browser client (anon key — only used for auth.getUser + inserts)
// ---------------------------------------------------------------------------
function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ---------------------------------------------------------------------------
// 60-question assessment dataset
// ---------------------------------------------------------------------------
const ASSESSMENT_QUESTIONS = [
  // Work Style (12)
  { id: 1, botMessage: "Let's start! What best describes your natural approach to work?", followUp: "Interesting! {selection} tells me about your work style. Next question...", dimension: "Work Style", questionId: 1, options: [{ label: "Thinker style", sublabel: "I analyze before acting", icon: "🧠", trait: "Thinker", score: 1, optionId: 1 }, { label: "Achiever style", sublabel: "I focus on results", icon: "🎯", trait: "Achiever", score: 1, optionId: 2 }, { label: "Director style", sublabel: "I lead decisively", icon: "⚡", trait: "Director", score: 1, optionId: 3 }, { label: "Connector style", sublabel: "I build relationships", icon: "🤝", trait: "Connector", score: 1, optionId: 4 }] },
  { id: 2, botMessage: "When facing a problem, what's your first instinct?", followUp: "Perfect! {selection} shows your problem-solving approach.", dimension: "Work Style", questionId: 2, options: [{ label: "Analyze thoroughly", sublabel: "Gather all the facts first", icon: "📊", trait: "Thinker", score: 1, optionId: 1 }, { label: "Take immediate action", sublabel: "Act now, adjust later", icon: "⚡", trait: "Director", score: 1, optionId: 2 }, { label: "Consult with others", sublabel: "Get team input", icon: "👥", trait: "Connector", score: 1, optionId: 3 }, { label: "Focus on the outcome", sublabel: "What result do we need?", icon: "🎯", trait: "Achiever", score: 1, optionId: 4 }] },
  { id: 3, botMessage: "How do you prefer to make decisions?", followUp: "Great choice! {selection} reveals your decision-making style.", dimension: "Work Style", questionId: 3, options: [{ label: "Data-driven analysis", sublabel: "Numbers don't lie", icon: "📈", trait: "Thinker", score: 1, optionId: 1 }, { label: "Quick and decisive", sublabel: "Trust my instincts", icon: "⚡", trait: "Director", score: 1, optionId: 2 }, { label: "Team consensus", sublabel: "Everyone's voice matters", icon: "🗳️", trait: "Connector", score: 1, optionId: 3 }, { label: "Results-focused", sublabel: "What gets us to the goal?", icon: "🏆", trait: "Achiever", score: 1, optionId: 4 }] },
  { id: 4, botMessage: "What energizes you most at work?", followUp: "Excellent! {selection} shows what motivates you.", dimension: "Work Style", questionId: 4, options: [{ label: "Solving complex problems", sublabel: "The puzzle pieces fit", icon: "🧩", trait: "Thinker", score: 1, optionId: 1 }, { label: "Achieving ambitious goals", sublabel: "Breaking new records", icon: "📈", trait: "Achiever", score: 1, optionId: 2 }, { label: "Leading teams to success", sublabel: "Inspiring others", icon: "👑", trait: "Director", score: 1, optionId: 3 }, { label: "Building strong relationships", sublabel: "Connecting with people", icon: "💙", trait: "Connector", score: 1, optionId: 4 }] },
  { id: 5, botMessage: "Under pressure, you tend to:", followUp: "Good insight! {selection} shows how you handle stress.", dimension: "Work Style", questionId: 5, options: [{ label: "Become more analytical", sublabel: "Need more information", icon: "🔍", trait: "Thinker", score: 1, optionId: 1 }, { label: "Push harder for results", sublabel: "Intensity increases", icon: "💪", trait: "Achiever", score: 1, optionId: 2 }, { label: "Take charge quickly", sublabel: "Someone needs to lead", icon: "⚡", trait: "Director", score: 1, optionId: 3 }, { label: "Seek team support", sublabel: "We're in this together", icon: "🤝", trait: "Connector", score: 1, optionId: 4 }] },
  { id: 6, botMessage: "Your ideal work environment is:", followUp: "Perfect fit! {selection} describes your ideal workspace.", dimension: "Work Style", questionId: 6, options: [{ label: "Quiet and organized", sublabel: "Focus without distractions", icon: "📚", trait: "Thinker", score: 1, optionId: 1 }, { label: "Dynamic and goal-oriented", sublabel: "Results-driven energy", icon: "🚀", trait: "Achiever", score: 1, optionId: 2 }, { label: "Fast-paced and challenging", sublabel: "High energy environment", icon: "⚡", trait: "Director", score: 1, optionId: 3 }, { label: "Collaborative and supportive", sublabel: "Team-focused culture", icon: "👥", trait: "Connector", score: 1, optionId: 4 }] },
  { id: 7, botMessage: "When learning something new, you prefer to:", followUp: "Great approach! {selection} shows your learning style.", dimension: "Work Style", questionId: 7, options: [{ label: "Study thoroughly first", sublabel: "Understanding before doing", icon: "📖", trait: "Thinker", score: 1, optionId: 1 }, { label: "Focus on practical application", sublabel: "How does this help me win?", icon: "🎯", trait: "Achiever", score: 1, optionId: 2 }, { label: "Jump in and experiment", sublabel: "Learn by doing", icon: "🏃", trait: "Director", score: 1, optionId: 3 }, { label: "Learn with others", sublabel: "Group learning works best", icon: "👥", trait: "Connector", score: 1, optionId: 4 }] },
  { id: 8, botMessage: "Your communication style is typically:", followUp: "Nice! {selection} reflects how you connect with others.", dimension: "Work Style", questionId: 8, options: [{ label: "Detailed and precise", sublabel: "Accuracy is important", icon: "📝", trait: "Thinker", score: 1, optionId: 1 }, { label: "Results-focused", sublabel: "What's the bottom line?", icon: "📊", trait: "Achiever", score: 1, optionId: 2 }, { label: "Direct and decisive", sublabel: "Clear and to the point", icon: "💬", trait: "Director", score: 1, optionId: 3 }, { label: "Warm and engaging", sublabel: "Building rapport first", icon: "😊", trait: "Connector", score: 1, optionId: 4 }] },
  { id: 9, botMessage: "When working on a team project, you naturally:", followUp: "Excellent! {selection} shows your team contribution style.", dimension: "Work Style", questionId: 9, options: [{ label: "Research and analyze", sublabel: "Provide the data foundation", icon: "🔬", trait: "Thinker", score: 1, optionId: 1 }, { label: "Drive toward completion", sublabel: "Keep us focused on results", icon: "🏁", trait: "Achiever", score: 1, optionId: 2 }, { label: "Take the leadership role", sublabel: "Someone needs to coordinate", icon: "👨‍💼", trait: "Director", score: 1, optionId: 3 }, { label: "Ensure everyone's involved", sublabel: "Bring the team together", icon: "🫱🏻‍🫲🏿", trait: "Connector", score: 1, optionId: 4 }] },
  { id: 10, botMessage: "Your biggest strength in business is:", followUp: "Fantastic! {selection} highlights your core strength.", dimension: "Work Style", questionId: 10, options: [{ label: "Problem-solving ability", sublabel: "Finding the right solution", icon: "🧩", trait: "Thinker", score: 1, optionId: 1 }, { label: "Results orientation", sublabel: "Making things happen", icon: "📈", trait: "Achiever", score: 1, optionId: 2 }, { label: "Leadership capability", sublabel: "Inspiring action in others", icon: "👑", trait: "Director", score: 1, optionId: 3 }, { label: "Relationship building", sublabel: "Creating lasting connections", icon: "🤝", trait: "Connector", score: 1, optionId: 4 }] },
  { id: 11, botMessage: "When facing a setback, you typically:", followUp: "Great resilience! {selection} shows your recovery approach.", dimension: "Work Style", questionId: 11, options: [{ label: "Analyze what went wrong", sublabel: "Learn from the data", icon: "🔍", trait: "Thinker", score: 1, optionId: 1 }, { label: "Refocus on the goal", sublabel: "Find another path to success", icon: "🎯", trait: "Achiever", score: 1, optionId: 2 }, { label: "Take immediate action", sublabel: "Move forward decisively", icon: "⚡", trait: "Director", score: 1, optionId: 3 }, { label: "Rally the team", sublabel: "We'll overcome this together", icon: "💪", trait: "Connector", score: 1, optionId: 4 }] },
  { id: 12, botMessage: "Your planning style is best described as:", followUp: "Perfect! {selection} shows your approach to planning.", dimension: "Work Style", questionId: 12, options: [{ label: "Detailed and systematic", sublabel: "Every step mapped out", icon: "📋", trait: "Thinker", score: 1, optionId: 1 }, { label: "Goal-oriented milestones", sublabel: "Clear targets and deadlines", icon: "🏆", trait: "Achiever", score: 1, optionId: 2 }, { label: "Flexible and adaptive", sublabel: "Ready to pivot quickly", icon: "🔄", trait: "Director", score: 1, optionId: 3 }, { label: "Collaborative input", sublabel: "Team-developed plans", icon: "👥", trait: "Connector", score: 1, optionId: 4 }] },

  // Culture (12)
  { id: 13, botMessage: "What type of company culture appeals to you most?", followUp: "Excellent choice! {selection} shows your cultural preferences.", dimension: "Culture", questionId: 13, options: [{ label: "Collaborate culture", sublabel: "Team-oriented and supportive", icon: "🤝", trait: "Collaborate", score: 1, optionId: 1 }, { label: "Compete culture", sublabel: "Results-driven and competitive", icon: "🏆", trait: "Compete", score: 1, optionId: 2 }, { label: "Create culture", sublabel: "Innovative and flexible", icon: "💡", trait: "Create", score: 1, optionId: 3 }, { label: "Control culture", sublabel: "Structured and efficient", icon: "⚙️", trait: "Control", score: 1, optionId: 4 }] },
  { id: 14, botMessage: "In meetings, you prefer:", followUp: "Great insight! {selection} reflects your meeting style.", dimension: "Culture", questionId: 14, options: [{ label: "Open discussion", sublabel: "Everyone shares ideas", icon: "💬", trait: "Collaborate", score: 1, optionId: 1 }, { label: "Clear objectives", sublabel: "What are we trying to achieve?", icon: "🎯", trait: "Compete", score: 1, optionId: 2 }, { label: "Brainstorming sessions", sublabel: "Generate new possibilities", icon: "💭", trait: "Create", score: 1, optionId: 3 }, { label: "Structured agendas", sublabel: "Organized and efficient", icon: "📝", trait: "Control", score: 1, optionId: 4 }] },
  { id: 15, botMessage: "Your ideal work relationships are:", followUp: "Perfect! {selection} describes your relationship preferences.", dimension: "Culture", questionId: 15, options: [{ label: "Close and supportive", sublabel: "Like a family environment", icon: "❤️", trait: "Collaborate", score: 1, optionId: 1 }, { label: "Performance-focused", sublabel: "Mutual accountability", icon: "📊", trait: "Compete", score: 1, optionId: 2 }, { label: "Dynamic and inspiring", sublabel: "Energizing each other", icon: "⚡", trait: "Create", score: 1, optionId: 3 }, { label: "Professional and reliable", sublabel: "Consistent and dependable", icon: "🤝", trait: "Control", score: 1, optionId: 4 }] },
  { id: 16, botMessage: "How do you prefer to handle conflict?", followUp: "Good approach! {selection} shows your conflict resolution style.", dimension: "Culture", questionId: 16, options: [{ label: "Open dialogue", sublabel: "Talk it through together", icon: "💬", trait: "Collaborate", score: 1, optionId: 1 }, { label: "Focus on performance", sublabel: "What gets results?", icon: "🏆", trait: "Compete", score: 1, optionId: 2 }, { label: "Find creative solutions", sublabel: "Think outside the box", icon: "💡", trait: "Create", score: 1, optionId: 3 }, { label: "Follow established process", sublabel: "Clear procedures exist", icon: "📋", trait: "Control", score: 1, optionId: 4 }] },
  { id: 17, botMessage: "What motivates your team best?", followUp: "Excellent! {selection} reveals your motivation approach.", dimension: "Culture", questionId: 17, options: [{ label: "Recognition and appreciation", sublabel: "Celebrate contributions", icon: "👏", trait: "Collaborate", score: 1, optionId: 1 }, { label: "Achievement and rewards", sublabel: "Win together", icon: "🏆", trait: "Compete", score: 1, optionId: 2 }, { label: "Innovation opportunities", sublabel: "Try new approaches", icon: "🚀", trait: "Create", score: 1, optionId: 3 }, { label: "Clear expectations", sublabel: "Know what's required", icon: "📌", trait: "Control", score: 1, optionId: 4 }] },
  { id: 18, botMessage: "Your approach to company policies is:", followUp: "Great perspective! {selection} shows your policy approach.", dimension: "Culture", questionId: 18, options: [{ label: "Flexible implementation", sublabel: "Consider individual needs", icon: "🤝", trait: "Collaborate", score: 1, optionId: 1 }, { label: "Results-oriented", sublabel: "Do policies drive performance?", icon: "📈", trait: "Compete", score: 1, optionId: 2 }, { label: "Adaptive and evolving", sublabel: "Update as we learn", icon: "🔄", trait: "Create", score: 1, optionId: 3 }, { label: "Consistent application", sublabel: "Fair and systematic", icon: "⚖️", trait: "Control", score: 1, optionId: 4 }] },
  { id: 19, botMessage: "In your ideal workplace, change is:", followUp: "Nice! {selection} reflects your change orientation.", dimension: "Culture", questionId: 19, options: [{ label: "Discussed openly", sublabel: "Everyone's input matters", icon: "💬", trait: "Collaborate", score: 1, optionId: 1 }, { label: "Performance-driven", sublabel: "Change to improve results", icon: "📊", trait: "Compete", score: 1, optionId: 2 }, { label: "Embraced enthusiastically", sublabel: "Opportunity for innovation", icon: "🌟", trait: "Create", score: 1, optionId: 3 }, { label: "Managed systematically", sublabel: "Planned and controlled", icon: "📋", trait: "Control", score: 1, optionId: 4 }] },
  { id: 20, botMessage: "Your communication preference at work is:", followUp: "Perfect! {selection} shows your communication style.", dimension: "Culture", questionId: 20, options: [{ label: "Regular check-ins", sublabel: "Stay connected with everyone", icon: "📞", trait: "Collaborate", score: 1, optionId: 1 }, { label: "Performance updates", sublabel: "How are we tracking?", icon: "📈", trait: "Compete", score: 1, optionId: 2 }, { label: "Idea sharing sessions", sublabel: "What's new and exciting?", icon: "💡", trait: "Create", score: 1, optionId: 3 }, { label: "Structured reporting", sublabel: "Clear and consistent updates", icon: "📊", trait: "Control", score: 1, optionId: 4 }] },
  { id: 21, botMessage: "When celebrating success, you prefer:", followUp: "Wonderful! {selection} shows how you celebrate wins.", dimension: "Culture", questionId: 21, options: [{ label: "Team celebrations", sublabel: "Everyone contributed", icon: "🎉", trait: "Collaborate", score: 1, optionId: 1 }, { label: "Achievement recognition", sublabel: "Highlight the victory", icon: "🏆", trait: "Compete", score: 1, optionId: 2 }, { label: "Innovation showcases", sublabel: "Share creative breakthroughs", icon: "✨", trait: "Create", score: 1, optionId: 3 }, { label: "Milestone acknowledgment", sublabel: "Mark systematic progress", icon: "📊", trait: "Control", score: 1, optionId: 4 }] },
  { id: 22, botMessage: "Your leadership style emphasizes:", followUp: "Excellent! {selection} reflects your leadership approach.", dimension: "Culture", questionId: 22, options: [{ label: "Supportive guidance", sublabel: "Help everyone succeed", icon: "🤝", trait: "Collaborate", score: 1, optionId: 1 }, { label: "Performance coaching", sublabel: "Drive results together", icon: "🎯", trait: "Compete", score: 1, optionId: 2 }, { label: "Inspirational vision", sublabel: "Paint the future picture", icon: "🌟", trait: "Create", score: 1, optionId: 3 }, { label: "Clear direction", sublabel: "Provide structure and certainty", icon: "🧭", trait: "Control", score: 1, optionId: 4 }] },
  { id: 23, botMessage: "The company values you most appreciate are:", followUp: "Great values! {selection} aligns with your principles.", dimension: "Culture", questionId: 23, options: [{ label: "Teamwork and loyalty", sublabel: "We're stronger together", icon: "🤝", trait: "Collaborate", score: 1, optionId: 1 }, { label: "Excellence and achievement", sublabel: "Strive for the best", icon: "🏆", trait: "Compete", score: 1, optionId: 2 }, { label: "Innovation and creativity", sublabel: "Think differently", icon: "💡", trait: "Create", score: 1, optionId: 3 }, { label: "Reliability and efficiency", sublabel: "Consistent delivery", icon: "⚙️", trait: "Control", score: 1, optionId: 4 }] },
  { id: 24, botMessage: "Your decision-making process values:", followUp: "Perfect! {selection} shows your decision-making values.", dimension: "Culture", questionId: 24, options: [{ label: "Consensus building", sublabel: "Everyone's voice heard", icon: "🗳️", trait: "Collaborate", score: 1, optionId: 1 }, { label: "Competitive advantage", sublabel: "What gives us the edge?", icon: "⚡", trait: "Compete", score: 1, optionId: 2 }, { label: "Creative possibilities", sublabel: "Explore new options", icon: "🌈", trait: "Create", score: 1, optionId: 3 }, { label: "Systematic analysis", sublabel: "Data-driven choices", icon: "📊", trait: "Control", score: 1, optionId: 4 }] },

  // Stage Fit (12)
  { id: 25, botMessage: "When it comes to business growth, which resonates with you?", followUp: "Great choice! {selection} shows your entrepreneurial stage preference.", dimension: "Stage Fit", questionId: 25, options: [{ label: "Entrepreneur style", sublabel: "Build from scratch", icon: "🚀", trait: "Entrepreneur", score: 1, optionId: 1 }, { label: "Partner style", sublabel: "Grow together", icon: "🤝", trait: "Partner", score: 1, optionId: 2 }, { label: "Plug & Play style", sublabel: "Proven systems", icon: "🔧", trait: "Plug & Play", score: 1, optionId: 3 }, { label: "Empire style", sublabel: "Scale big", icon: "🏰", trait: "Empire", score: 1, optionId: 4 }] },
  { id: 26, botMessage: "How do you approach new business opportunities?", followUp: "Perfect! {selection} reveals your opportunity mindset.", dimension: "Stage Fit", questionId: 26, options: [{ label: "Take calculated risks", sublabel: "Pioneer new ground", icon: "⚡", trait: "Entrepreneur", score: 1, optionId: 1 }, { label: "Share the journey", sublabel: "Collaborative growth", icon: "🤝", trait: "Partner", score: 1, optionId: 2 }, { label: "Use proven models", sublabel: "Why reinvent the wheel?", icon: "🔧", trait: "Plug & Play", score: 1, optionId: 3 }, { label: "Think big picture", sublabel: "Market domination", icon: "🏰", trait: "Empire", score: 1, optionId: 4 }] },
  { id: 27, botMessage: "Your ideal business involvement level is:", followUp: "Excellent! {selection} shows your engagement preference.", dimension: "Stage Fit", questionId: 27, options: [{ label: "Hands-on builder", sublabel: "Create every detail", icon: "🔨", trait: "Entrepreneur", score: 1, optionId: 1 }, { label: "Active collaborator", sublabel: "Work closely with others", icon: "👥", trait: "Partner", score: 1, optionId: 2 }, { label: "System operator", sublabel: "Execute proven methods", icon: "⚙️", trait: "Plug & Play", score: 1, optionId: 3 }, { label: "Strategic overseer", sublabel: "Guide multiple operations", icon: "👑", trait: "Empire", score: 1, optionId: 4 }] },
  { id: 28, botMessage: "When facing business challenges, you prefer to:", followUp: "Great approach! {selection} shows your challenge response.", dimension: "Stage Fit", questionId: 28, options: [{ label: "Innovate solutions", sublabel: "Create something new", icon: "💡", trait: "Entrepreneur", score: 1, optionId: 1 }, { label: "Collaborate on fixes", sublabel: "Two heads are better", icon: "🤝", trait: "Partner", score: 1, optionId: 2 }, { label: "Follow best practices", sublabel: "Use proven approaches", icon: "📚", trait: "Plug & Play", score: 1, optionId: 3 }, { label: "Leverage resources", sublabel: "Use scale advantages", icon: "🏗️", trait: "Empire", score: 1, optionId: 4 }] },
  { id: 29, botMessage: "Your business growth strategy focuses on:", followUp: "Perfect! {selection} reflects your growth mindset.", dimension: "Stage Fit", questionId: 29, options: [{ label: "Product innovation", sublabel: "Always improving offerings", icon: "🔬", trait: "Entrepreneur", score: 1, optionId: 1 }, { label: "Partnership expansion", sublabel: "Growing through alliances", icon: "🤝", trait: "Partner", score: 1, optionId: 2 }, { label: "System replication", sublabel: "Copy what works", icon: "📋", trait: "Plug & Play", score: 1, optionId: 3 }, { label: "Market domination", sublabel: "Capture maximum share", icon: "🎯", trait: "Empire", score: 1, optionId: 4 }] },
  { id: 30, botMessage: "In terms of business structure, you prefer:", followUp: "Nice choice! {selection} shows your structure preference.", dimension: "Stage Fit", questionId: 30, options: [{ label: "Flexible and adaptive", sublabel: "Change as needed", icon: "🌊", trait: "Entrepreneur", score: 1, optionId: 1 }, { label: "Collaborative teams", sublabel: "Shared responsibility", icon: "👥", trait: "Partner", score: 1, optionId: 2 }, { label: "Clear hierarchies", sublabel: "Defined roles and rules", icon: "🏢", trait: "Plug & Play", score: 1, optionId: 3 }, { label: "Scalable systems", sublabel: "Built for expansion", icon: "📈", trait: "Empire", score: 1, optionId: 4 }] },
  { id: 31, botMessage: "Your approach to business planning is:", followUp: "Excellent! {selection} reveals your planning style.", dimension: "Stage Fit", questionId: 31, options: [{ label: "Experimental and iterative", sublabel: "Test and adjust", icon: "🧪", trait: "Entrepreneur", score: 1, optionId: 1 }, { label: "Collaborative development", sublabel: "Plan together", icon: "🤝", trait: "Partner", score: 1, optionId: 2 }, { label: "Template-based", sublabel: "Use proven frameworks", icon: "📝", trait: "Plug & Play", score: 1, optionId: 3 }, { label: "Strategic and comprehensive", sublabel: "Long-term vision", icon: "🗺️", trait: "Empire", score: 1, optionId: 4 }] },
  { id: 32, botMessage: "When it comes to business risk, you:", followUp: "Great perspective! {selection} shows your risk tolerance.", dimension: "Stage Fit", questionId: 32, options: [{ label: "Embrace calculated risks", sublabel: "Pioneer new ground", icon: "🎲", trait: "Entrepreneur", score: 1, optionId: 1 }, { label: "Share risk with partners", sublabel: "Distributed exposure", icon: "🤝", trait: "Partner", score: 1, optionId: 2 }, { label: "Minimize through systems", sublabel: "Proven reduces risk", icon: "🛡️", trait: "Plug & Play", score: 1, optionId: 3 }, { label: "Manage through scale", sublabel: "Diversification protects", icon: "⚖️", trait: "Empire", score: 1, optionId: 4 }] },
  { id: 33, botMessage: "Your business success is measured by:", followUp: "Perfect! {selection} shows your success metrics.", dimension: "Stage Fit", questionId: 33, options: [{ label: "Innovation impact", sublabel: "Creating something new", icon: "💡", trait: "Entrepreneur", score: 1, optionId: 1 }, { label: "Mutual achievement", sublabel: "Success for all partners", icon: "🏆", trait: "Partner", score: 1, optionId: 2 }, { label: "Operational efficiency", sublabel: "Smooth execution", icon: "⚙️", trait: "Plug & Play", score: 1, optionId: 3 }, { label: "Market position", sublabel: "Industry leadership", icon: "👑", trait: "Empire", score: 1, optionId: 4 }] },
  { id: 34, botMessage: "In business relationships, you value:", followUp: "Excellent! {selection} reflects your relationship values.", dimension: "Stage Fit", questionId: 34, options: [{ label: "Creative partnerships", sublabel: "Innovative collaborations", icon: "🎨", trait: "Entrepreneur", score: 1, optionId: 1 }, { label: "Mutual support", sublabel: "We help each other grow", icon: "🤝", trait: "Partner", score: 1, optionId: 2 }, { label: "Reliable consistency", sublabel: "Dependable relationships", icon: "🔒", trait: "Plug & Play", score: 1, optionId: 3 }, { label: "Strategic alliances", sublabel: "Powerful connections", icon: "⚡", trait: "Empire", score: 1, optionId: 4 }] },
  { id: 35, botMessage: "Your business learning approach is:", followUp: "Great! {selection} shows your learning preference.", dimension: "Stage Fit", questionId: 35, options: [{ label: "Trial and error", sublabel: "Learn by experimenting", icon: "🧪", trait: "Entrepreneur", score: 1, optionId: 1 }, { label: "Shared experiences", sublabel: "Learn from each other", icon: "👥", trait: "Partner", score: 1, optionId: 2 }, { label: "Best practice adoption", sublabel: "Learn from proven methods", icon: "📚", trait: "Plug & Play", score: 1, optionId: 3 }, { label: "Industry analysis", sublabel: "Learn from market leaders", icon: "📊", trait: "Empire", score: 1, optionId: 4 }] },
  { id: 36, botMessage: "Your vision for business growth is:", followUp: "Fantastic! {selection} captures your core business value. Let me analyze your complete profile...", dimension: "Stage Fit", questionId: 36, options: [{ label: "Disruptive innovation", sublabel: "Change the game", icon: "🚀", trait: "Entrepreneur", score: 1, optionId: 1 }, { label: "Collaborative expansion", sublabel: "Grow together strategically", icon: "🌱", trait: "Partner", score: 1, optionId: 2 }, { label: "Systematic scaling", sublabel: "Replicate success", icon: "📈", trait: "Plug & Play", score: 1, optionId: 3 }, { label: "Market leadership", sublabel: "Dominate the industry", icon: "👑", trait: "Empire", score: 1, optionId: 4 }] },

  // Meta Programs (12)
  { id: 37, botMessage: "When making decisions, what's your natural tendency?", followUp: "Got it! {selection} shows your decision-making style.", dimension: "Meta Programs", questionId: 37, options: [{ label: "Internal style", sublabel: "Trust my gut", icon: "🧠", trait: "Internal", score: 1, optionId: 1 }, { label: "External style", sublabel: "Seek input", icon: "👥", trait: "External", score: 1, optionId: 2 }, { label: "Structured style", sublabel: "Follow processes", icon: "📋", trait: "Structured", score: 1, optionId: 3 }, { label: "Rule Breaker style", sublabel: "Challenge norms", icon: "⚡", trait: "Rule Breaker", score: 1, optionId: 4 }] },
  { id: 38, botMessage: "How do you prefer to receive feedback?", followUp: "Perfect! {selection} shows your feedback preference.", dimension: "Meta Programs", questionId: 38, options: [{ label: "Self-assessment first", sublabel: "I know how I'm doing", icon: "🪞", trait: "Internal", score: 1, optionId: 1 }, { label: "Regular input from others", sublabel: "Outside perspective helps", icon: "💬", trait: "External", score: 1, optionId: 2 }, { label: "Formal review process", sublabel: "Structured evaluation", icon: "📊", trait: "Structured", score: 1, optionId: 3 }, { label: "Unconventional methods", sublabel: "Think outside the box", icon: "🔄", trait: "Rule Breaker", score: 1, optionId: 4 }] },
  { id: 39, botMessage: "Your approach to problem-solving is:", followUp: "Excellent! {selection} reveals your problem-solving approach.", dimension: "Meta Programs", questionId: 39, options: [{ label: "Independent analysis", sublabel: "Work through it myself", icon: "🤔", trait: "Internal", score: 1, optionId: 1 }, { label: "Collaborative thinking", sublabel: "Better with team input", icon: "🤝", trait: "External", score: 1, optionId: 2 }, { label: "Systematic methodology", sublabel: "Step-by-step approach", icon: "📋", trait: "Structured", score: 1, optionId: 3 }, { label: "Creative disruption", sublabel: "Break conventional thinking", icon: "💡", trait: "Rule Breaker", score: 1, optionId: 4 }] },
  { id: 40, botMessage: "When learning new skills, you prefer to:", followUp: "Great! {selection} shows your learning style.", dimension: "Meta Programs", questionId: 40, options: [{ label: "Figure it out yourself", sublabel: "Self-directed learning", icon: "📚", trait: "Internal", score: 1, optionId: 1 }, { label: "Learn from others", sublabel: "Mentors and teachers", icon: "👨‍🏫", trait: "External", score: 1, optionId: 2 }, { label: "Follow curriculum", sublabel: "Structured programs", icon: "🎓", trait: "Structured", score: 1, optionId: 3 }, { label: "Experiment freely", sublabel: "Learn by breaking rules", icon: "🧪", trait: "Rule Breaker", score: 1, optionId: 4 }] },
  { id: 41, botMessage: "Your motivation comes primarily from:", followUp: "Perfect! {selection} shows your motivation source.", dimension: "Meta Programs", questionId: 41, options: [{ label: "Personal standards", sublabel: "Internal drive for excellence", icon: "⭐", trait: "Internal", score: 1, optionId: 1 }, { label: "Others' recognition", sublabel: "External validation matters", icon: "👏", trait: "External", score: 1, optionId: 2 }, { label: "System achievements", sublabel: "Meeting defined goals", icon: "🎯", trait: "Structured", score: 1, optionId: 3 }, { label: "Breaking barriers", sublabel: "Challenging status quo", icon: "🚧", trait: "Rule Breaker", score: 1, optionId: 4 }] },
  { id: 42, botMessage: "In team settings, you typically:", followUp: "Excellent! {selection} reflects your team behavior.", dimension: "Meta Programs", questionId: 42, options: [{ label: "Work independently", sublabel: "Contribute your part quietly", icon: "🎯", trait: "Internal", score: 1, optionId: 1 }, { label: "Seek group consensus", sublabel: "Value everyone's input", icon: "🗳️", trait: "External", score: 1, optionId: 2 }, { label: "Follow team protocols", sublabel: "Respect established process", icon: "📋", trait: "Structured", score: 1, optionId: 3 }, { label: "Challenge group think", sublabel: "Question assumptions", icon: "❓", trait: "Rule Breaker", score: 1, optionId: 4 }] },
  { id: 43, botMessage: "Your approach to workplace rules is:", followUp: "Great perspective! {selection} shows your rule orientation.", dimension: "Meta Programs", questionId: 43, options: [{ label: "Personal interpretation", sublabel: "Apply based on judgment", icon: "⚖️", trait: "Internal", score: 1, optionId: 1 }, { label: "Seek clarification", sublabel: "Make sure I understand", icon: "❓", trait: "External", score: 1, optionId: 2 }, { label: "Follow precisely", sublabel: "Rules exist for reasons", icon: "📏", trait: "Structured", score: 1, optionId: 3 }, { label: "Find creative workarounds", sublabel: "Spirit over letter", icon: "🔄", trait: "Rule Breaker", score: 1, optionId: 4 }] },
  { id: 44, botMessage: "When facing uncertainty, you:", followUp: "Nice! {selection} shows your uncertainty response.", dimension: "Meta Programs", questionId: 44, options: [{ label: "Trust your instincts", sublabel: "Internal compass guides", icon: "🧭", trait: "Internal", score: 1, optionId: 1 }, { label: "Consult with others", sublabel: "Get different perspectives", icon: "👥", trait: "External", score: 1, optionId: 2 }, { label: "Research thoroughly", sublabel: "Gather systematic data", icon: "📊", trait: "Structured", score: 1, optionId: 3 }, { label: "Embrace the unknown", sublabel: "Uncertainty is opportunity", icon: "🌟", trait: "Rule Breaker", score: 1, optionId: 4 }] },
  { id: 45, botMessage: "Your communication style is:", followUp: "Perfect! {selection} describes your communication approach.", dimension: "Meta Programs", questionId: 45, options: [{ label: "Direct and confident", sublabel: "Say what you think", icon: "💬", trait: "Internal", score: 1, optionId: 1 }, { label: "Collaborative and inclusive", sublabel: "Include others' views", icon: "🤝", trait: "External", score: 1, optionId: 2 }, { label: "Clear and organized", sublabel: "Structured messaging", icon: "📝", trait: "Structured", score: 1, optionId: 3 }, { label: "Provocative and challenging", sublabel: "Shake up thinking", icon: "⚡", trait: "Rule Breaker", score: 1, optionId: 4 }] },
  { id: 46, botMessage: "Your work tempo preference is:", followUp: "Excellent! {selection} shows your work rhythm.", dimension: "Meta Programs", questionId: 46, options: [{ label: "Self-paced control", sublabel: "Set your own rhythm", icon: "⏰", trait: "Internal", score: 1, optionId: 1 }, { label: "Team synchronized", sublabel: "Match group pace", icon: "👥", trait: "External", score: 1, optionId: 2 }, { label: "Scheduled consistency", sublabel: "Predictable routine", icon: "📅", trait: "Structured", score: 1, optionId: 3 }, { label: "Variable intensity", sublabel: "Sprint and rest cycles", icon: "🔄", trait: "Rule Breaker", score: 1, optionId: 4 }] },
  { id: 47, botMessage: "When evaluating options, you prioritize:", followUp: "Great! {selection} reveals your evaluation criteria.", dimension: "Meta Programs", questionId: 47, options: [{ label: "Personal conviction", sublabel: "What feels right to you", icon: "❤️", trait: "Internal", score: 1, optionId: 1 }, { label: "External validation", sublabel: "What others recommend", icon: "👍", trait: "External", score: 1, optionId: 2 }, { label: "Systematic analysis", sublabel: "Data-driven comparison", icon: "📊", trait: "Structured", score: 1, optionId: 3 }, { label: "Disruptive potential", sublabel: "What breaks the mold", icon: "💥", trait: "Rule Breaker", score: 1, optionId: 4 }] },
  { id: 48, botMessage: "Your leadership approach emphasizes:", followUp: "Fantastic! {selection} shows your leadership style.", dimension: "Meta Programs", questionId: 48, options: [{ label: "Leading by example", sublabel: "Actions speak loudest", icon: "🏃", trait: "Internal", score: 1, optionId: 1 }, { label: "Building consensus", sublabel: "Everyone's voice matters", icon: "🤝", trait: "External", score: 1, optionId: 2 }, { label: "Clear expectations", sublabel: "Structure enables success", icon: "📋", trait: "Structured", score: 1, optionId: 3 }, { label: "Challenging norms", sublabel: "Question everything", icon: "❓", trait: "Rule Breaker", score: 1, optionId: 4 }] },

  // Competencies (12)
  { id: 49, botMessage: "Which business area energizes you most?", followUp: "Excellent! {selection} highlights your core competency.", dimension: "Competencies", questionId: 49, options: [{ label: "Leadership & Vision", sublabel: "Guide others", icon: "🎯", trait: "Leadership & Vision", score: 1, optionId: 1 }, { label: "Operations", sublabel: "Make it run smoothly", icon: "⚙️", trait: "Operations", score: 1, optionId: 2 }, { label: "R&D & Innovation", sublabel: "Create new solutions", icon: "🔬", trait: "R&D & Innovation", score: 1, optionId: 3 }, { label: "Finance & Admin", sublabel: "Manage resources", icon: "💰", trait: "Finance & Admin", score: 1, optionId: 4 }] },
  { id: 50, botMessage: "Your natural strength in business is:", followUp: "Perfect! {selection} shows your business strength.", dimension: "Competencies", questionId: 50, options: [{ label: "Strategic thinking", sublabel: "See the big picture", icon: "🧠", trait: "Leadership & Vision", score: 1, optionId: 1 }, { label: "Process optimization", sublabel: "Improve efficiency", icon: "⚙️", trait: "Operations", score: 1, optionId: 2 }, { label: "Creative problem-solving", sublabel: "Find innovative solutions", icon: "💡", trait: "R&D & Innovation", score: 1, optionId: 3 }, { label: "Resource management", sublabel: "Optimize allocation", icon: "📊", trait: "Finance & Admin", score: 1, optionId: 4 }] },
  { id: 51, botMessage: "In a business meeting, you typically:", followUp: "Great! {selection} reflects your meeting contribution.", dimension: "Competencies", questionId: 51, options: [{ label: "Set the vision", sublabel: "Where are we going?", icon: "🎯", trait: "Leadership & Vision", score: 1, optionId: 1 }, { label: "Focus on execution", sublabel: "How will we do this?", icon: "🔧", trait: "Operations", score: 1, optionId: 2 }, { label: "Generate new ideas", sublabel: "What if we tried...?", icon: "💡", trait: "R&D & Innovation", score: 1, optionId: 3 }, { label: "Analyze the numbers", sublabel: "What does the data say?", icon: "📈", trait: "Finance & Admin", score: 1, optionId: 4 }] },
  { id: 52, botMessage: "Your problem-solving approach emphasizes:", followUp: "Excellent! {selection} shows your problem-solving strength.", dimension: "Competencies", questionId: 52, options: [{ label: "Strategic solutions", sublabel: "Long-term thinking", icon: "♟️", trait: "Leadership & Vision", score: 1, optionId: 1 }, { label: "Operational fixes", sublabel: "Practical implementation", icon: "🔧", trait: "Operations", score: 1, optionId: 2 }, { label: "Innovative approaches", sublabel: "Creative breakthroughs", icon: "🚀", trait: "R&D & Innovation", score: 1, optionId: 3 }, { label: "Data-driven analysis", sublabel: "Numbers tell the story", icon: "📊", trait: "Finance & Admin", score: 1, optionId: 4 }] },
  { id: 53, botMessage: "When planning projects, you focus on:", followUp: "Perfect! {selection} reveals your planning focus.", dimension: "Competencies", questionId: 53, options: [{ label: "Vision alignment", sublabel: "Does this support our goals?", icon: "🎯", trait: "Leadership & Vision", score: 1, optionId: 1 }, { label: "Process efficiency", sublabel: "Streamline execution", icon: "⚙️", trait: "Operations", score: 1, optionId: 2 }, { label: "Innovation opportunities", sublabel: "Where can we improve?", icon: "💡", trait: "R&D & Innovation", score: 1, optionId: 3 }, { label: "Resource optimization", sublabel: "Best use of budget", icon: "💰", trait: "Finance & Admin", score: 1, optionId: 4 }] },
  { id: 54, botMessage: "Your decision-making process prioritizes:", followUp: "Great! {selection} shows your decision priorities.", dimension: "Competencies", questionId: 54, options: [{ label: "Strategic impact", sublabel: "Long-term consequences", icon: "🎯", trait: "Leadership & Vision", score: 1, optionId: 1 }, { label: "Operational feasibility", sublabel: "Can we execute this?", icon: "✅", trait: "Operations", score: 1, optionId: 2 }, { label: "Innovation potential", sublabel: "What's possible?", icon: "🌟", trait: "R&D & Innovation", score: 1, optionId: 3 }, { label: "Financial viability", sublabel: "Does the math work?", icon: "📊", trait: "Finance & Admin", score: 1, optionId: 4 }] },
  { id: 55, botMessage: "In team dynamics, you naturally:", followUp: "Excellent! {selection} shows your team role.", dimension: "Competencies", questionId: 55, options: [{ label: "Provide direction", sublabel: "Guide the team", icon: "🧭", trait: "Leadership & Vision", score: 1, optionId: 1 }, { label: "Ensure execution", sublabel: "Keep things moving", icon: "⚙️", trait: "Operations", score: 1, optionId: 2 }, { label: "Generate solutions", sublabel: "Creative problem-solving", icon: "💡", trait: "R&D & Innovation", score: 1, optionId: 3 }, { label: "Monitor resources", sublabel: "Track progress and costs", icon: "📋", trait: "Finance & Admin", score: 1, optionId: 4 }] },
  { id: 56, botMessage: "Your communication style emphasizes:", followUp: "Perfect! {selection} reflects your communication strength.", dimension: "Competencies", questionId: 56, options: [{ label: "Inspirational messaging", sublabel: "Motivate and inspire", icon: "🎤", trait: "Leadership & Vision", score: 1, optionId: 1 }, { label: "Clear instructions", sublabel: "Precise and actionable", icon: "📝", trait: "Operations", score: 1, optionId: 2 }, { label: "Creative presentations", sublabel: "Engaging and innovative", icon: "🎨", trait: "R&D & Innovation", score: 1, optionId: 3 }, { label: "Data-backed arguments", sublabel: "Facts and figures", icon: "📊", trait: "Finance & Admin", score: 1, optionId: 4 }] },
  { id: 57, botMessage: "When evaluating success, you look at:", followUp: "Great! {selection} shows your success metrics.", dimension: "Competencies", questionId: 57, options: [{ label: "Vision achievement", sublabel: "Did we reach our goals?", icon: "🏆", trait: "Leadership & Vision", score: 1, optionId: 1 }, { label: "Operational metrics", sublabel: "Efficiency and quality", icon: "📈", trait: "Operations", score: 1, optionId: 2 }, { label: "Innovation impact", sublabel: "What did we create?", icon: "🚀", trait: "R&D & Innovation", score: 1, optionId: 3 }, { label: "Financial performance", sublabel: "ROI and profitability", icon: "💰", trait: "Finance & Admin", score: 1, optionId: 4 }] },
  { id: 58, botMessage: "Your learning and development focus is:", followUp: "Excellent! {selection} shows your development priority.", dimension: "Competencies", questionId: 58, options: [{ label: "Leadership skills", sublabel: "Inspiring and guiding others", icon: "👑", trait: "Leadership & Vision", score: 1, optionId: 1 }, { label: "Operational excellence", sublabel: "Process improvement", icon: "⚙️", trait: "Operations", score: 1, optionId: 2 }, { label: "Innovation techniques", sublabel: "Creative thinking methods", icon: "💡", trait: "R&D & Innovation", score: 1, optionId: 3 }, { label: "Financial analysis", sublabel: "Numbers and analytics", icon: "📊", trait: "Finance & Admin", score: 1, optionId: 4 }] },
  { id: 59, botMessage: "In crisis situations, you:", followUp: "Perfect! {selection} reveals your crisis response.", dimension: "Competencies", questionId: 59, options: [{ label: "Rally the team", sublabel: "Provide leadership", icon: "📣", trait: "Leadership & Vision", score: 1, optionId: 1 }, { label: "Focus on solutions", sublabel: "Fix the immediate problem", icon: "🔧", trait: "Operations", score: 1, optionId: 2 }, { label: "Think creatively", sublabel: "Find unconventional solutions", icon: "💡", trait: "R&D & Innovation", score: 1, optionId: 3 }, { label: "Assess the impact", sublabel: "Analyze the situation", icon: "📊", trait: "Finance & Admin", score: 1, optionId: 4 }] },
  { id: 60, botMessage: "Your ultimate business contribution is:", followUp: "Fantastic! {selection} captures your core business value. Let me analyze your complete profile...", dimension: "Competencies", questionId: 60, options: [{ label: "Visionary leadership", sublabel: "Setting direction and inspiring", icon: "🌟", trait: "Leadership & Vision", score: 1, optionId: 1 }, { label: "Operational excellence", sublabel: "Making things work smoothly", icon: "⚙️", trait: "Operations", score: 1, optionId: 2 }, { label: "Innovation catalyst", sublabel: "Driving creative solutions", icon: "🚀", trait: "R&D & Innovation", score: 1, optionId: 3 }, { label: "Strategic analysis", sublabel: "Providing insight and control", icon: "📊", trait: "Finance & Admin", score: 1, optionId: 4 }] },
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Option { label: string; sublabel: string; icon: string; trait: string; score: number; optionId: number }
interface Question { id: number; botMessage: string; followUp: string; dimension: string; questionId: number; options: Option[] }
interface Response { question: string; selected_option: string; trait: string; dimension: string; score: number; question_id: number; question_index: number }

// ---------------------------------------------------------------------------
// Franchise compatibility helper
// ---------------------------------------------------------------------------
function calculateFranchiseCompatibility(topTraits: string[]) {
  const scores: Record<string, number> = {}
  if (topTraits.includes('Entrepreneur'))    { scores.startup_franchises = 85; scores.emerging_brands = 90 }
  if (topTraits.includes('Plug & Play'))     { scores.established_systems = 95; scores.proven_models = 90 }
  if (topTraits.includes('Collaborate'))     { scores.team_based_operations = 88; scores.community_focused = 85 }
  if (topTraits.includes('Achiever'))        { scores.high_growth_franchises = 92 }
  if (topTraits.includes('Director'))        { scores.leadership_roles = 90 }
  if (topTraits.includes('Thinker'))         { scores.analytical_roles = 88 }
  if (topTraits.includes('Control'))         { scores.structured_operations = 95 }
  if (topTraits.includes('Compete'))         { scores.performance_driven_models = 93 }
  if (topTraits.includes('Create'))          { scores.innovative_concepts = 87 }
  if (topTraits.includes('Internal'))        { scores.independent_operations = 80 }
  if (topTraits.includes('External'))        { scores.network_focused_franchises = 82 }
  if (topTraits.includes('Structured'))      { scores.process_oriented_businesses = 94 }
  if (topTraits.includes('Rule Breaker'))    { scores.disruptive_models = 75 }
  if (topTraits.includes('Leadership & Vision')) { scores.franchise_development_roles = 95 }
  if (topTraits.includes('Operations'))      { scores.operational_intensive_franchises = 92 }
  if (topTraits.includes('R&D & Innovation')) { scores.emerging_tech_franchises = 85 }
  if (topTraits.includes('Finance & Admin')) { scores.finance_centric_franchises = 90 }
  return scores
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface Props {
  serverUser?: { id: string; email?: string } | null
  accessCode?: string
  onComplete?: (profileData: any) => void
}

export default function FranchiseFit360Assessment({ serverUser, accessCode, onComplete }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Response[]>([])
  const [showResults, setShowResults] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [isProcessing, setIsProcessing] = useState(false)
  const [assessmentResults, setAssessmentResults] = useState<any>(null)

  const currentQuestion: Question = ASSESSMENT_QUESTIONS[currentQuestionIndex]

  const handleAssessmentComplete = useCallback(async (finalResponses: Response[]) => {
    setIsProcessing(true)

    try {
      const supabase = getSupabase()

      // Get user identity (may be null for anonymous visitors)
      const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))
      const resolvedUser = user ?? serverUser ?? null
      const userId = resolvedUser?.id ?? null
      const userEmail = resolvedUser?.email ?? 'anonymous'

      // Persist responses (best-effort, non-blocking)
      const responseDocs = finalResponses.map((r, i) => ({
        user_id: userId,
        email: userEmail,
        question: r.question,
        selected_option: r.selected_option,
        trait: r.trait,
        dimension: r.dimension,
        score: r.score,
        question_index: i + 1,
        session_id: sessionId,
      }))
      await supabase.from('fit360_response').insert(responseDocs)

      // Aggregate scores
      const traitScores: Record<string, number> = finalResponses.reduce((acc, r) => {
        acc[r.trait] = (acc[r.trait] || 0) + r.score
        return acc
      }, {} as Record<string, number>)

      const dimensionGroups: Record<string, Record<string, number>> = {}
      finalResponses.forEach(r => {
        if (!dimensionGroups[r.dimension]) dimensionGroups[r.dimension] = {}
        dimensionGroups[r.dimension][r.trait] = (dimensionGroups[r.dimension][r.trait] || 0) + r.score
      })

      const dimensionSummary: Record<string, string> = {}
      Object.keys(dimensionGroups).forEach(dim => {
        const traits = dimensionGroups[dim]
        dimensionSummary[dim] = Object.keys(traits).reduce((a, b) => traits[a] > traits[b] ? a : b)
      })

      const topTraits = Object.entries(traitScores).sort(([, a], [, b]) => b - a).slice(0, 6).map(([t]) => t)

      const strengthMap: Record<string, string> = {
        'Thinker': 'Analytical problem-solving and systematic thinking, ideal for strategic planning.',
        'Achiever': 'Results-driven execution and goal achievement, perfect for driving sales and operational targets.',
        'Connector': 'Strong relationship building and networking abilities, key for customer relations and team cohesion.',
        'Director': 'Decisive leadership and quick action-taking, suited for management and crisis resolution.',
        'Collaborate': 'Team building and harmonious relationship management, thrives in supportive group environments.',
        'Compete': 'Performance optimization and competitive strategy, excels in high-stakes, growth-oriented markets.',
        'Create': 'Innovation and creative solution development, valuable for adapting to market changes and unique challenges.',
        'Control': 'Process management and quality assurance, ensures consistent operations and compliance.',
        'Entrepreneur': 'Opportunity recognition and business development, adept at starting and scaling new ventures.',
        'Partner': 'Strategic collaboration and partnership building, skilled in co-creating success and leveraging alliances.',
        'Plug & Play': 'System implementation and operational efficiency, excels at replicating proven business models.',
        'Empire': 'Expertise in large-scale operations and market expansion, focused on significant growth and dominance.',
        'Internal': 'Self-directed decision making and independent judgment, thrives with autonomy and personal standards.',
        'External': 'Collaborative input and stakeholder engagement, values feedback and external validation.',
        'Structured': 'Systematic approach and process adherence, ensures order and predictability in operations.',
        'Rule Breaker': 'Creative disruption and innovative thinking, challenges norms to find new solutions.',
        'Leadership & Vision': 'Strategic leadership and setting a clear vision, inspires and guides teams towards common goals.',
        'Operations': 'Operational excellence and process optimization, ensures smooth and efficient daily functions.',
        'R&D & Innovation': 'Research, development and innovation leadership, drives product and service evolution.',
        'Finance & Admin': 'Financial analysis and resource management, provides sound fiscal oversight and planning.',
      }
      const profileStrengths = topTraits.map(t => strengthMap[t] || `${t} expertise.`)

      // Save profile
      const { data: profileData } = await supabase.from('fit360_profile').insert({
        user_id: userId,
        email: userEmail,
        session_id: sessionId,
        trait_scores: traitScores,
        dimension_summary: dimensionSummary,
        total_questions: finalResponses.length,
        completion_rate: 100,
        top_traits: topTraits,
        profile_strengths: profileStrengths,
        franchise_compatibility: calculateFranchiseCompatibility(topTraits),
      }).select().single()

      // Email notifications — stubbed (configure Resend in /api/fit360/email when ready)
      if (userEmail && userEmail !== 'anonymous') {
        console.log('[FranchiseFit360] TODO: send results email to', userEmail, '| top traits:', topTraits.join(', '))
      }
      if (accessCode) {
        console.log('[FranchiseFit360] TODO: send franchisor notification | accessCode:', accessCode, '| email:', userEmail)
      }

      setAssessmentResults({ profileData, responses: finalResponses.map((r, i) => ({ ...r, id: i + 1 })) })
      setShowResults(true)
      if (onComplete && profileData) onComplete(profileData)

    } catch (err) {
      console.error('Error completing assessment:', err)
      // Fallback: compute locally and show results without DB
      const traitScores: Record<string, number> = finalResponses.reduce((acc, r) => {
        acc[r.trait] = (acc[r.trait] || 0) + r.score; return acc
      }, {} as Record<string, number>)
      const topTraits = Object.entries(traitScores).sort(([, a], [, b]) => b - a).slice(0, 6).map(([t]) => t)
      setAssessmentResults({
        profileData: { trait_scores: traitScores, top_traits: topTraits, total_questions: finalResponses.length, completion_rate: 100, profile_strengths: [], franchise_compatibility: {} },
        responses: finalResponses.map((r, i) => ({ ...r, id: i + 1 })),
      })
      setShowResults(true)
    } finally {
      setIsProcessing(false)
    }
  }, [sessionId, serverUser, accessCode, onComplete])

  const handleOptionSelect = useCallback((option: Option) => {
    const newResponse: Response = {
      question: currentQuestion.botMessage,
      selected_option: option.label,
      trait: option.trait,
      dimension: currentQuestion.dimension,
      score: option.score,
      question_id: currentQuestion.id,
      question_index: currentQuestionIndex,
    }
    const updatedResponses = [...responses, newResponse]
    setResponses(updatedResponses)

    if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      handleAssessmentComplete(updatedResponses)
    }
  }, [currentQuestion, currentQuestionIndex, responses, handleAssessmentComplete])

  if (showResults && assessmentResults) {
    return <Fit360ProfilePage profileData={assessmentResults.profileData} />
  }

  if (currentQuestionIndex >= ASSESSMENT_QUESTIONS.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0 text-center p-8">
          <p className="text-xl font-semibold text-slate-800">Processing your results...</p>
          {isProcessing && <div className="mt-4 flex justify-center"><div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 h-12 w-12" /></div>}
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-white border-b border-slate-200">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full mb-4">
              <Brain className="w-5 h-5 mr-2" />
              <span className="font-bold">FranchiseFit360™ Assessment</span>
            </div>
            <p className="text-slate-600 text-sm">Question {currentQuestionIndex + 1} of {ASSESSMENT_QUESTIONS.length}</p>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2 max-w-md mx-auto">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100}%` }} />
            </div>
          </div>
        </div>

        <CardContent className="p-8 bg-slate-50 min-h-[400px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="w-full"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-blue-500 flex-shrink-0">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b29a580d7_ChatGPTImageJul26202510_49_40AM.png"
                    alt="FranchiseFit360 Assistant"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-w-[80%]">
                  <p className="text-slate-800 leading-relaxed">{currentQuestion.botMessage}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {currentQuestion.options.map((option, index) => (
                    <motion.div
                      key={option.optionId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Button
                        variant="outline"
                        onClick={() => handleOptionSelect(option)}
                        disabled={isProcessing}
                        className="h-auto p-4 text-left justify-start hover:bg-blue-50 border-2 hover:border-blue-300 transition-all group w-full"
                      >
                        <div className="flex items-start gap-3 w-full">
                          <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">{option.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 text-sm leading-tight">{option.label}</div>
                            <div className="text-sm text-slate-600 leading-tight mt-1">{option.sublabel}</div>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
