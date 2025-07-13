export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          customer_location: string | null
          email: string | null
          id: string
          is_new: boolean | null
          name: string
          phone: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          customer_location?: string | null
          email?: string | null
          id?: string
          is_new?: boolean | null
          name: string
          phone: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          customer_location?: string | null
          email?: string | null
          id?: string
          is_new?: boolean | null
          name?: string
          phone?: string
        }
        Relationships: []
      }
      delivery_boys: {
        Row: {
          created_at: string
          current_location: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string
          updated_at: string
          vehicle_number: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string
          current_location?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone: string
          updated_at?: string
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string
          current_location?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string
          updated_at?: string
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          added_by: string | null
          amount: number
          category: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          title: string
        }
        Insert: {
          added_by?: string | null
          amount: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          title: string
        }
        Update: {
          added_by?: string | null
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      order_assignments: {
        Row: {
          assigned_at: string
          delivery_boy_id: string
          id: string
          notes: string | null
          order_id: string
          responded_at: string | null
          status: string | null
        }
        Insert: {
          assigned_at?: string
          delivery_boy_id: string
          id?: string
          notes?: string | null
          order_id: string
          responded_at?: string | null
          status?: string | null
        }
        Update: {
          assigned_at?: string
          delivery_boy_id?: string
          id?: string
          notes?: string | null
          order_id?: string
          responded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_assignments_delivery_boy_id_fkey"
            columns: ["delivery_boy_id"]
            isOneToOne: false
            referencedRelation: "delivery_boys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_at: string | null
          commission: number | null
          created_at: string
          created_by: string
          customer_address: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          delivery_boy_id: string | null
          delivery_charge: number | null
          delivery_time: string | null
          id: string
          order_number: string
          order_status: string | null
          payment_method: string | null
          payment_status: string | null
          picked_up_at: string | null
          prepared_at: string | null
          product_details: Json
          ready_at: string | null
          shop_address: string | null
          shop_name: string
          shop_phone: string | null
          special_instructions: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          commission?: number | null
          created_at?: string
          created_by: string
          customer_address: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          delivery_boy_id?: string | null
          delivery_charge?: number | null
          delivery_time?: string | null
          id?: string
          order_number: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          picked_up_at?: string | null
          prepared_at?: string | null
          product_details: Json
          ready_at?: string | null
          shop_address?: string | null
          shop_name: string
          shop_phone?: string | null
          special_instructions?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          commission?: number | null
          created_at?: string
          created_by?: string
          customer_address?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          delivery_boy_id?: string | null
          delivery_charge?: number | null
          delivery_time?: string | null
          id?: string
          order_number?: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          picked_up_at?: string | null
          prepared_at?: string | null
          product_details?: Json
          ready_at?: string | null
          shop_address?: string | null
          shop_name?: string
          shop_phone?: string | null
          special_instructions?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_boy_id_fkey"
            columns: ["delivery_boy_id"]
            isOneToOne: false
            referencedRelation: "delivery_boys"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price: number
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          order_id: string | null
          paid_at: string | null
          paid_by: string | null
          payment_date: string
          payment_status: string
          payment_type: string
          shop_name: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          paid_by?: string | null
          payment_date?: string
          payment_status?: string
          payment_type?: string
          shop_name: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          paid_by?: string | null
          payment_date?: string
          payment_status?: string
          payment_type?: string
          shop_name?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string | null
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_partner: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_partner?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_partner?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          commission: number | null
          commission_status: string | null
          created_at: string | null
          customer_id: string | null
          customer_location: string | null
          customer_name: string | null
          customer_phone: string | null
          date: string | null
          delivery_charge: number | null
          description: string | null
          handled_by: string | null
          id: string
          is_new_customer: string | null
          order_id: string | null
          payment_method: string | null
          payment_status: string | null
          shop_name: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          commission?: number | null
          commission_status?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_location?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          date?: string | null
          delivery_charge?: number | null
          description?: string | null
          handled_by?: string | null
          id?: string
          is_new_customer?: string | null
          order_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shop_name: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          commission?: number | null
          commission_status?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_location?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          date?: string | null
          delivery_charge?: number | null
          description?: string | null
          handled_by?: string | null
          id?: string
          is_new_customer?: string | null
          order_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shop_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      shop_payment_summary: {
        Row: {
          paid_amount: number | null
          payment_date: string | null
          pending_amount: number | null
          pending_transactions: number | null
          shop_name: string | null
          total_amount: number | null
          total_transactions: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
