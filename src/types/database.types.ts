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
      products: {
        Row: {
          id: number
          tenant_id: string
          name: string
          description: string | null
          price: number
          stock: number
          category: string | null
          sku: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: number
          tenant_id: string
          name: string
          description?: string | null
          price: number
          stock?: number
          category?: string | null
          sku?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: number
          tenant_id?: string
          name?: string
          description?: string | null
          price?: number
          stock?: number
          category?: string | null
          sku?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_revenue_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
          full_name: string
          email: string
          phone: string | null
          npm: string | null
          prodi: string | null
          tenant_name: string | null
          business_category:
            | Database["public"]["Enums"]["business_category"]
            | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          full_name: string
          email: string
          phone?: string | null
          npm?: string | null
          prodi?: string | null
          tenant_name?: string | null
          business_category?:
            | Database["public"]["Enums"]["business_category"]
            | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          full_name?: string
          email?: string
          phone?: string | null
          npm?: string | null
          prodi?: string | null
          tenant_name?: string | null
          business_category?:
            | Database["public"]["Enums"]["business_category"]
            | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_items: {
        Row: {
          id: number
          transaction_id: number
          product_id: number | null
          product_name: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: number
          transaction_id: number
          product_id?: number | null
          product_name: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: number
          transaction_id?: number
          product_id?: number | null
          product_name?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          id: number
          tenant_id: string
          type: Database["public"]["Enums"]["transaction_type"]
          total_amount: number
          note: string | null
          receipt_url: string | null
          transaction_date: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: number
          tenant_id: string
          type: Database["public"]["Enums"]["transaction_type"]
          total_amount: number
          note?: string | null
          receipt_url?: string | null
          transaction_date?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: number
          tenant_id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          total_amount?: number
          note?: string | null
          receipt_url?: string | null
          transaction_date?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_revenue_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      visitors: {
        Row: {
          id: number
          visit_date: string
          created_at: string
          tenant_id: string | null
          metadata: Json | null
        }
        Insert: {
          id?: number
          visit_date?: string
          created_at?: string
          tenant_id?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: number
          visit_date?: string
          created_at?: string
          tenant_id?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "visitors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_revenue_summary"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
    }
    Views: {
      daily_transaction_summary: {
        Row: {
          transaction_date: string | null
          active_tenants: number | null
          total_transactions: number | null
          daily_income: number | null
          daily_expense: number | null
          net_daily: number | null
        }
        Relationships: []
      }
      tenant_revenue_summary: {
        Row: {
          tenant_id: string | null
          tenant_name: string | null
          npm: string | null
          prodi: string | null
          business_category:
            | Database["public"]["Enums"]["business_category"]
            | null
          total_transactions: number | null
          total_income: number | null
          total_expense: number | null
          net_revenue: number | null
        }
        Insert: {
          tenant_id?: string | null
          tenant_name?: string | null
          npm?: string | null
          prodi?: string | null
          business_category?:
            | Database["public"]["Enums"]["business_category"]
            | null
          total_transactions?: number | null
          total_income?: number | null
          total_expense?: number | null
          net_revenue?: number | null
        }
        Update: {
          tenant_id?: string | null
          tenant_name?: string | null
          npm?: string | null
          prodi?: string | null
          business_category?:
            | Database["public"]["Enums"]["business_category"]
            | null
          total_transactions?: number | null
          total_income?: number | null
          total_expense?: number | null
          net_revenue?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      business_category:
        | "Kuliner"
        | "Fashion"
        | "Kerajinan"
        | "Jasa"
        | "Industri"
        | "Bisnis Digital"
        | "Other"
      transaction_type: "PEMASUKAN" | "PENGELUARAN"
      user_role: "admin" | "tenant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never