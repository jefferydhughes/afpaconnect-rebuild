import type { Database as AppDatabase } from '@/types/database'

type WithRelationships<T> = T extends {
  Row: infer R
  Insert: infer I
  Update: infer U
}
  ? {
      Row: R
      Insert: I
      Update: U
      Relationships: []
    }
  : T

export type SupabaseDatabase = {
  public: {
    Tables: {
      [K in keyof AppDatabase['public']['Tables']]: WithRelationships<AppDatabase['public']['Tables'][K]>
    }
    Views: Record<string, never>
    Functions: AppDatabase['public']['Functions']
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
