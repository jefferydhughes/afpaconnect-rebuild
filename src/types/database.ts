export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'admin' | 'franchise_rep' | 'franchisor' | 'advisor' | 'user'
          advisor_slug: string | null
          advisor_title: string | null
          advisor_bio: string | null
          advisor_image_url: string | null
          advisor_calendar_url: string | null
          advisor_specialties: string[] | null
          advisor_is_active: boolean
          associated_franchise_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'franchise_rep' | 'franchisor' | 'advisor' | 'user'
          advisor_slug?: string | null
          advisor_title?: string | null
          advisor_bio?: string | null
          advisor_image_url?: string | null
          advisor_calendar_url?: string | null
          advisor_specialties?: string[] | null
          advisor_is_active?: boolean
          associated_franchise_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'franchise_rep' | 'franchisor' | 'advisor' | 'user'
          advisor_slug?: string | null
          advisor_title?: string | null
          advisor_bio?: string | null
          advisor_image_url?: string | null
          advisor_calendar_url?: string | null
          advisor_specialties?: string[] | null
          advisor_is_active?: boolean
          associated_franchise_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      franchises: {
        Row: {
          id: string
          name: string
          slug: string
          category: string
          description: string | null
          full_description: string | null
          logo_url: string | null
          website_url: string | null
          initial_investment_min: number | null
          initial_investment_max: number | null
          franchise_fee: number | null
          royalty_fee_percentage: number | null
          marketing_fee_percentage: number | null
          liquid_capital_required: number | null
          net_worth_required: number | null
          business_model: 'storefront' | 'mobile' | 'home_based' | 'kiosk' | 'online' | null
          time_commitment: 'full_time' | 'part_time' | 'passive' | null
          experience_required: boolean
          training_duration_weeks: number | null
          support_level: 'basic' | 'standard' | 'premium' | null
          territories_available: string[] | null
          total_locations: number | null
          usa_locations: number | null
          canadian_locations: number | null
          established_year: number | null
          personality_fit: string[] | null
          ideal_goals: string[] | null
          required_skills: string[] | null
          disc_traits: Json | null
          franchisee_satisfaction_score: number | null
          growth_potential: 'stable_mature' | 'high_growth' | 'emerging_brand' | 'market_leader' | null
          fdd_url: string | null
          fdd_summary: string | null
          is_featured: boolean
          is_active: boolean
          broker_email: string | null
          embedding: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category: string
          description?: string | null
          full_description?: string | null
          logo_url?: string | null
          website_url?: string | null
          initial_investment_min?: number | null
          initial_investment_max?: number | null
          franchise_fee?: number | null
          royalty_fee_percentage?: number | null
          marketing_fee_percentage?: number | null
          liquid_capital_required?: number | null
          net_worth_required?: number | null
          business_model?: 'storefront' | 'mobile' | 'home_based' | 'kiosk' | 'online' | null
          time_commitment?: 'full_time' | 'part_time' | 'passive' | null
          experience_required?: boolean
          training_duration_weeks?: number | null
          support_level?: 'basic' | 'standard' | 'premium' | null
          territories_available?: string[] | null
          total_locations?: number | null
          usa_locations?: number | null
          canadian_locations?: number | null
          established_year?: number | null
          personality_fit?: string[] | null
          ideal_goals?: string[] | null
          required_skills?: string[] | null
          disc_traits?: Json | null
          franchisee_satisfaction_score?: number | null
          growth_potential?: 'stable_mature' | 'high_growth' | 'emerging_brand' | 'market_leader' | null
          fdd_url?: string | null
          fdd_summary?: string | null
          is_featured?: boolean
          is_active?: boolean
          broker_email?: string | null
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category?: string
          description?: string | null
          full_description?: string | null
          logo_url?: string | null
          website_url?: string | null
          initial_investment_min?: number | null
          initial_investment_max?: number | null
          franchise_fee?: number | null
          royalty_fee_percentage?: number | null
          marketing_fee_percentage?: number | null
          liquid_capital_required?: number | null
          net_worth_required?: number | null
          business_model?: 'storefront' | 'mobile' | 'home_based' | 'kiosk' | 'online' | null
          time_commitment?: 'full_time' | 'part_time' | 'passive' | null
          experience_required?: boolean
          training_duration_weeks?: number | null
          support_level?: 'basic' | 'standard' | 'premium' | null
          territories_available?: string[] | null
          total_locations?: number | null
          usa_locations?: number | null
          canadian_locations?: number | null
          established_year?: number | null
          personality_fit?: string[] | null
          ideal_goals?: string[] | null
          required_skills?: string[] | null
          disc_traits?: Json | null
          franchisee_satisfaction_score?: number | null
          growth_potential?: 'stable_mature' | 'high_growth' | 'emerging_brand' | 'market_leader' | null
          fdd_url?: string | null
          fdd_summary?: string | null
          is_featured?: boolean
          is_active?: boolean
          broker_email?: string | null
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      quiz_results: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          budget_range: 'under_50k' | '50k_100k' | '100k_250k' | '250k_500k' | 'over_500k' | null
          preferred_categories: string[] | null
          business_model_preference: 'storefront' | 'mobile' | 'home_based' | 'kiosk' | 'online' | null
          time_commitment: 'full_time' | 'part_time' | 'passive' | null
          experience_level: 'none' | 'some' | 'extensive' | null
          preferred_territories: string[] | null
          goals: string[] | null
          ai_profile_summary: string | null
          matched_franchises: string[] | null
          match_scores: Json | null
          attributed_advisor_id: string | null
          source: string
          utm_params: Json | null
          quiz_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          budget_range?: 'under_50k' | '50k_100k' | '100k_250k' | '250k_500k' | 'over_500k' | null
          preferred_categories?: string[] | null
          business_model_preference?: 'storefront' | 'mobile' | 'home_based' | 'kiosk' | 'online' | null
          time_commitment?: 'full_time' | 'part_time' | 'passive' | null
          experience_level?: 'none' | 'some' | 'extensive' | null
          preferred_territories?: string[] | null
          goals?: string[] | null
          ai_profile_summary?: string | null
          matched_franchises?: string[] | null
          match_scores?: Json | null
          attributed_advisor_id?: string | null
          source?: string
          utm_params?: Json | null
          quiz_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          budget_range?: 'under_50k' | '50k_100k' | '100k_250k' | '250k_500k' | 'over_500k' | null
          preferred_categories?: string[] | null
          business_model_preference?: 'storefront' | 'mobile' | 'home_based' | 'kiosk' | 'online' | null
          time_commitment?: 'full_time' | 'part_time' | 'passive' | null
          experience_level?: 'none' | 'some' | 'extensive' | null
          preferred_territories?: string[] | null
          goals?: string[] | null
          ai_profile_summary?: string | null
          matched_franchises?: string[] | null
          match_scores?: Json | null
          attributed_advisor_id?: string | null
          source?: string
          utm_params?: Json | null
          quiz_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          state: string | null
          source: 'quiz' | 'website' | 'referral' | 'advertising' | 'social_media' | 'directory_inquiry'
          quiz_result_id: string | null
          status: 'new' | 'contacted' | 'qualified' | 'nurturing' | 'converted' | 'unqualified'
          interested_franchises: string[] | null
          budget_range: string | null
          notes: string | null
          last_contacted_at: string | null
          next_follow_up_at: string | null
          attributed_advisor_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          state?: string | null
          source: 'quiz' | 'website' | 'referral' | 'advertising' | 'social_media' | 'directory_inquiry'
          quiz_result_id?: string | null
          status?: 'new' | 'contacted' | 'qualified' | 'nurturing' | 'converted' | 'unqualified'
          interested_franchises?: string[] | null
          budget_range?: string | null
          notes?: string | null
          last_contacted_at?: string | null
          next_follow_up_at?: string | null
          attributed_advisor_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          state?: string | null
          source?: 'quiz' | 'website' | 'referral' | 'advertising' | 'social_media' | 'directory_inquiry'
          quiz_result_id?: string | null
          status?: 'new' | 'contacted' | 'qualified' | 'nurturing' | 'converted' | 'unqualified'
          interested_franchises?: string[] | null
          budget_range?: string | null
          notes?: string | null
          last_contacted_at?: string | null
          next_follow_up_at?: string | null
          attributed_advisor_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      info_requests: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          message: string | null
          franchise_ids: string[]
          attributed_advisor_id: string | null
          quiz_result_id: string | null
          status: 'pending' | 'sent' | 'processed'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          message?: string | null
          franchise_ids: string[]
          attributed_advisor_id?: string | null
          quiz_result_id?: string | null
          status?: 'pending' | 'sent' | 'processed'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          message?: string | null
          franchise_ids?: string[]
          attributed_advisor_id?: string | null
          quiz_result_id?: string | null
          status?: 'pending' | 'sent' | 'processed'
          created_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          category: 'getting_started' | 'financing' | 'legal' | 'success_stories' | 'industry_insights' | 'tips_advice' | null
          tags: string[] | null
          featured_image_url: string | null
          is_published: boolean
          is_featured: boolean
          published_at: string | null
          author_id: string | null
          seo_title: string | null
          seo_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          category?: 'getting_started' | 'financing' | 'legal' | 'success_stories' | 'industry_insights' | 'tips_advice' | null
          tags?: string[] | null
          featured_image_url?: string | null
          is_published?: boolean
          is_featured?: boolean
          published_at?: string | null
          author_id?: string | null
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          category?: 'getting_started' | 'financing' | 'legal' | 'success_stories' | 'industry_insights' | 'tips_advice' | null
          tags?: string[] | null
          featured_image_url?: string | null
          is_published?: boolean
          is_featured?: boolean
          published_at?: string | null
          author_id?: string | null
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      match_franchises: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          name: string
          slug: string
          category: string
          description: string
          logo_url: string
          initial_investment_min: number
          initial_investment_max: number
          similarity: number
        }[]
      }
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Franchise = Database['public']['Tables']['franchises']['Row']
export type QuizResult = Database['public']['Tables']['quiz_results']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type InfoRequest = Database['public']['Tables']['info_requests']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']

export type UserRole = Profile['role']
export type BudgetRange = NonNullable<QuizResult['budget_range']>
export type BusinessModel = NonNullable<Franchise['business_model']>
export type TimeCommitment = NonNullable<Franchise['time_commitment']>
export type ExperienceLevel = NonNullable<QuizResult['experience_level']>
export type LeadStatus = Lead['status']
