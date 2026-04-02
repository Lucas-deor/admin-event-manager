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
      admin_users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          document_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone?: string | null
          document_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          document_id?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          customer_id: string
          admin_id: string | null
          commission_percentage: number | null
          event_date: string
          status: 'pending' | 'confirmed' | 'finished' | 'cancelled'
          guest_count: number
          total_value: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          admin_id?: string | null
          commission_percentage?: number | null
          event_date: string
          status?: 'pending' | 'confirmed' | 'finished' | 'cancelled'
          guest_count?: number
          total_value: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          admin_id?: string | null
          commission_percentage?: number | null
          event_date?: string
          status?: 'pending' | 'confirmed' | 'finished' | 'cancelled'
          guest_count?: number
          total_value?: number
          description?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          event_id: string
          installment_value: number
          due_date: string
          status: 'pending' | 'paid' | 'overdue'
          payment_method: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          installment_value: number
          due_date: string
          status?: 'pending' | 'paid' | 'overdue'
          payment_method?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          installment_value?: number
          due_date?: string
          status?: 'pending' | 'paid' | 'overdue'
          payment_method?: string | null
          created_at?: string
        }
      }
      calendar_locks: {
        Row: {
          id: string
          start_date: string
          end_date: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          start_date: string
          end_date: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          start_date?: string
          end_date?: string
          reason?: string | null
          created_at?: string
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
      event_status: 'pending' | 'confirmed' | 'finished' | 'cancelled'
      payment_status: 'pending' | 'paid' | 'overdue'
    }
  }
}
