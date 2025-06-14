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
          id: string
          order_number: string
          order_status: string | null
          payment_method: string | null
          payment_status: string | null
          picked_up_at: string | null
          product_details: Json
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
          id?: string
          order_number: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          picked_up_at?: string | null
          product_details: Json
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
          id?: string
          order_number?: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          picked_up_at?: string | null
          product_details?: Json
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
      shops: {
        Row: {
          address: string | null
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
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
      [_ in never]: never
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
