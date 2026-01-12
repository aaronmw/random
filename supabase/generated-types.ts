export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      dimension_property_settings: {
        Row: {
          anchor_position: Database["public"]["Enums"]["anchor_position"] | null
          dimension: string | null
          id: string
          preserve_aspect_ratio: boolean | null
          property_setting_id: string
        }
        Insert: {
          anchor_position?:
            | Database["public"]["Enums"]["anchor_position"]
            | null
          dimension?: string | null
          id?: string
          preserve_aspect_ratio?: boolean | null
          property_setting_id: string
        }
        Update: {
          anchor_position?:
            | Database["public"]["Enums"]["anchor_position"]
            | null
          dimension?: string | null
          id?: string
          preserve_aspect_ratio?: boolean | null
          property_setting_id?: string
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
      list_property_settings: {
        Row: {
          id: string
          options: string
          property_setting_id: string
        }
        Insert: {
          id?: string
          options?: string
          property_setting_id: string
        }
        Update: {
          id?: string
          options?: string
          property_setting_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_property_settings_property_setting_id_fkey"
            columns: ["property_setting_id"]
            isOneToOne: true
            referencedRelation: "property_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      numeric_property_settings: {
        Row: {
          id: string
          max: number | null
          min: number | null
          operator: string | null
          property_setting_id: string
        }
        Insert: {
          id?: string
          max?: number | null
          min?: number | null
          operator?: string | null
          property_setting_id: string
        }
        Update: {
          id?: string
          max?: number | null
          min?: number | null
          operator?: string | null
          property_setting_id?: string
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
          id: string
          label: string
          visibility: Database["public"]["Enums"]["preset_visibility"]
        }
        Insert: {
          date_created?: string
          date_modified?: string
          figma_user_id: string
          id?: string
          label: string
          visibility?: Database["public"]["Enums"]["preset_visibility"]
        }
        Update: {
          date_created?: string
          date_modified?: string
          figma_user_id?: string
          id?: string
          label?: string
          visibility?: Database["public"]["Enums"]["preset_visibility"]
        }
        Relationships: []
      }
      property_settings: {
        Row: {
          date_created: string
          date_modified: string
          id: string
          is_enabled: boolean
          label: string
          post_randomization_sort_order:
            | Database["public"]["Enums"]["post_randomization_sort_order"]
            | null
          preset_id: string | null
          randomization_mode: Database["public"]["Enums"]["randomization_mode"]
        }
        Insert: {
          date_created?: string
          date_modified?: string
          id?: string
          is_enabled?: boolean
          label: string
          post_randomization_sort_order?:
            | Database["public"]["Enums"]["post_randomization_sort_order"]
            | null
          preset_id?: string | null
          randomization_mode?: Database["public"]["Enums"]["randomization_mode"]
        }
        Update: {
          date_created?: string
          date_modified?: string
          id?: string
          is_enabled?: boolean
          label?: string
          post_randomization_sort_order?:
            | Database["public"]["Enums"]["post_randomization_sort_order"]
            | null
          preset_id?: string | null
          randomization_mode?: Database["public"]["Enums"]["randomization_mode"]
        }
        Relationships: [
          {
            foreignKeyName: "property_settings_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "presets"
            referencedColumns: ["id"]
          },
        ]
      }
      text_property_settings: {
        Row: {
          decimal_places: number | null
          id: string
          prefix: string | null
          property_setting_id: string
          suffix: string | null
          thousands_separator: string | null
        }
        Insert: {
          decimal_places?: number | null
          id?: string
          prefix?: string | null
          property_setting_id: string
          suffix?: string | null
          thousands_separator?: string | null
        }
        Update: {
          decimal_places?: number | null
          id?: string
          prefix?: string | null
          property_setting_id?: string
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
      post_randomization_sort_order: "ascending" | "descending" | "none"
      preset_visibility: "private" | "public" | "hidden"
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
      post_randomization_sort_order: ["ascending", "descending", "none"],
      preset_visibility: ["private", "public", "hidden"],
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
