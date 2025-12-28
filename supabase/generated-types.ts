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
      dimension_property_settings: {
        Row: {
          anchor_position: Database["public"]["Enums"]["anchor_position"] | null
          date_created: string
          date_modified: string
          dimension: string | null
          id: number
          preserve_aspect_ratio: boolean | null
          property_setting_id: number
        }
        Insert: {
          anchor_position?:
            | Database["public"]["Enums"]["anchor_position"]
            | null
          date_created?: string
          date_modified?: string
          dimension?: string | null
          id?: number
          preserve_aspect_ratio?: boolean | null
          property_setting_id: number
        }
        Update: {
          anchor_position?:
            | Database["public"]["Enums"]["anchor_position"]
            | null
          date_created?: string
          date_modified?: string
          dimension?: string | null
          id?: number
          preserve_aspect_ratio?: boolean | null
          property_setting_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "dimension_property_settings_property_setting_id_fkey"
            columns: ["property_setting_id"]
            isOneToOne: true
            referencedRelation: "property_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      numeric_property_settings: {
        Row: {
          date_created: string
          date_modified: string
          id: number
          max: number | null
          min: number | null
          operator: string | null
          property_setting_id: number
        }
        Insert: {
          date_created?: string
          date_modified?: string
          id?: number
          max?: number | null
          min?: number | null
          operator?: string | null
          property_setting_id: number
        }
        Update: {
          date_created?: string
          date_modified?: string
          id?: number
          max?: number | null
          min?: number | null
          operator?: string | null
          property_setting_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "numeric_property_settings_property_setting_id_fkey"
            columns: ["property_setting_id"]
            isOneToOne: true
            referencedRelation: "property_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      presets: {
        Row: {
          date_created: string
          date_modified: string
          figma_user_id: string
          id: number
          label: string
        }
        Insert: {
          date_created?: string
          date_modified?: string
          figma_user_id?: string
          id?: number
          label?: string
        }
        Update: {
          date_created?: string
          date_modified?: string
          figma_user_id?: string
          id?: number
          label?: string
        }
        Relationships: []
      }
      property_settings: {
        Row: {
          collection_id: number | null
          date_created: string
          date_modified: string
          id: number
          is_enabled: boolean
          label: string
          post_randomization_sort_order:
            | Database["public"]["Enums"]["post_randomization_sort_order"]
            | null
          randomization_mode: Database["public"]["Enums"]["randomization_mode"]
        }
        Insert: {
          collection_id?: number | null
          date_created?: string
          date_modified?: string
          id?: number
          is_enabled?: boolean
          label: string
          post_randomization_sort_order?:
            | Database["public"]["Enums"]["post_randomization_sort_order"]
            | null
          randomization_mode?: Database["public"]["Enums"]["randomization_mode"]
        }
        Update: {
          collection_id?: number | null
          date_created?: string
          date_modified?: string
          id?: number
          is_enabled?: boolean
          label?: string
          post_randomization_sort_order?:
            | Database["public"]["Enums"]["post_randomization_sort_order"]
            | null
          randomization_mode?: Database["public"]["Enums"]["randomization_mode"]
        }
        Relationships: [
          {
            foreignKeyName: "property_settings_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "presets"
            referencedColumns: ["id"]
          },
        ]
      }
      text_property_settings: {
        Row: {
          date_created: string
          date_modified: string
          decimal_places: number | null
          id: number
          prefix: string | null
          property_setting_id: number
          suffix: string | null
          thousands_separator: string | null
        }
        Insert: {
          date_created?: string
          date_modified?: string
          decimal_places?: number | null
          id?: number
          prefix?: string | null
          property_setting_id: number
          suffix?: string | null
          thousands_separator?: string | null
        }
        Update: {
          date_created?: string
          date_modified?: string
          decimal_places?: number | null
          id?: number
          prefix?: string | null
          property_setting_id?: number
          suffix?: string | null
          thousands_separator?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "text_property_settings_property_setting_id_fkey"
            columns: ["property_setting_id"]
            isOneToOne: true
            referencedRelation: "property_settings"
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
      anchor_position:
        | "top-left"
        | "top-center"
        | "top-right"
        | "center-left"
        | "center-center"
        | "center-right"
        | "bottom-left"
        | "bottom-center"
        | "bottom-right"
      corner: "top-left" | "top-right" | "bottom-left" | "bottom-right"
      post_randomization_sort_order: "ascending" | "descending" | "none"
      randomization_mode:
        | "addition"
        | "multiplication"
        | "list"
        | "range"
        | "chatgpt"
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
    Enums: {
      anchor_position: [
        "top-left",
        "top-center",
        "top-right",
        "center-left",
        "center-center",
        "center-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
      corner: ["top-left", "top-right", "bottom-left", "bottom-right"],
      post_randomization_sort_order: ["ascending", "descending", "none"],
      randomization_mode: [
        "addition",
        "multiplication",
        "list",
        "range",
        "chatgpt",
      ],
    },
  },
} as const
