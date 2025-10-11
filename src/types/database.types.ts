export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          tenant_name: string | null
          category: Database['public']['Enums']['tenant_category'] | null
          role: string
        }
        Insert: {
          id: string
          full_name?: string | null
          tenant_name?: string | null
          category?: Database['public']['Enums']['tenant_category'] | null
          role?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          tenant_name?: string | null
          category?: Database['public']['Enums']['tenant_category'] | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: number
          tenant_id: string
          type: Database['public']['Enums']['transaction_type']
          amount: number
          note: string | null
          receipt_url: string
          transaction_date: string
          created_at: string
        }
        Insert: {
          id?: number
          tenant_id: string
          type: Database['public']['Enums']['transaction_type']
          amount: number
          note?: string | null
          receipt_url: string
          transaction_date?: string
          created_at?: string
        }
        Update: {
          id?: number
          tenant_id?: string
          type?: Database['public']['Enums']['transaction_type']
          amount?: number
          note?: string | null
          receipt_url?: string
          transaction_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      visitors: {
        Row: {
          id: number
          visit_date: string
          created_at: string
        }
        Insert: {
          id?: number
          visit_date?: string
          created_at?: string
        }
        Update: {
          id?: number
          visit_date?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      transaction_type: 'PEMASUKAN' | 'PENGELUARAN'
      tenant_category: 
        | 'Makanan & Minuman'
        | 'Fashion & Aksesoris'
        | 'Jasa & Hobi'
        | 'Karya & Kerajinan'
        | 'Lainnya'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}