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
      patients: {
        Row: {
          id: string
          name: string
          age: string
          hospital_file_number: string
          mobile_number: string
          sex: string
          age_of_diagnosis: string
          diagnosis: string
          treatment: string
          response: string
          note: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          age: string
          hospital_file_number: string
          mobile_number: string
          sex: string
          age_of_diagnosis: string
          diagnosis: string
          treatment: string
          response: string
          note?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          age?: string
          hospital_file_number?: string
          mobile_number?: string
          sex?: string
          age_of_diagnosis?: string
          diagnosis?: string
          treatment?: string
          response?: string
          note?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 