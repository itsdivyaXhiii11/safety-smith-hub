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
      checklist_completions: {
        Row: {
          checklist_date: string
          completed_at: string | null
          completed_items: Json
          created_at: string | null
          id: string
          is_complete: boolean
          user_id: string
        }
        Insert: {
          checklist_date?: string
          completed_at?: string | null
          completed_items?: Json
          created_at?: string | null
          id?: string
          is_complete?: boolean
          user_id: string
        }
        Update: {
          checklist_date?: string
          completed_at?: string | null
          completed_items?: Json
          created_at?: string | null
          id?: string
          is_complete?: boolean
          user_id?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          item_text: string
          role: Database["public"]["Enums"]["app_role"]
          task_category: string
        }
        Insert: {
          created_at?: string | null
          display_order: number
          id?: string
          item_text: string
          role: Database["public"]["Enums"]["app_role"]
          task_category: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          item_text?: string
          role?: Database["public"]["Enums"]["app_role"]
          task_category?: string
        }
        Relationships: []
      }
      emergency_sos: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          location_description: string | null
          longitude: number | null
          responded_at: string | null
          responded_by: string | null
          response_notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          responded_at?: string | null
          responded_by?: string | null
          response_notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          responded_at?: string | null
          responded_by?: string | null
          response_notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hazard_reports: {
        Row: {
          created_at: string | null
          description: string
          id: string
          latitude: number | null
          location_description: string | null
          longitude: number | null
          photo_urls: string[] | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["hazard_severity"]
          status: Database["public"]["Enums"]["hazard_status"]
          title: string
          updated_at: string | null
          user_id: string
          voice_note_url: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          photo_urls?: string[] | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: Database["public"]["Enums"]["hazard_severity"]
          status?: Database["public"]["Enums"]["hazard_status"]
          title: string
          updated_at?: string | null
          user_id: string
          voice_note_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          photo_urls?: string[] | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["hazard_severity"]
          status?: Database["public"]["Enums"]["hazard_status"]
          title?: string
          updated_at?: string | null
          user_id?: string
          voice_note_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          assigned_task: string | null
          created_at: string | null
          department: string
          emergency_contact: string | null
          employee_id: string
          full_name: string
          id: string
          phone_number: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          assigned_task?: string | null
          created_at?: string | null
          department: string
          emergency_contact?: string | null
          employee_id: string
          full_name: string
          id: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          assigned_task?: string | null
          created_at?: string | null
          department?: string
          emergency_contact?: string | null
          employee_id?: string
          full_name?: string
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      safety_videos: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          is_active: boolean | null
          likes_count: number | null
          thumbnail_url: string | null
          title: string
          video_url: string
          views_count: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          thumbnail_url?: string | null
          title: string
          video_url: string
          views_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string
          views_count?: number | null
        }
        Relationships: []
      }
      video_interactions: {
        Row: {
          created_at: string | null
          id: string
          liked: boolean | null
          user_id: string
          video_id: string
          viewed: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          liked?: boolean | null
          user_id: string
          video_id: string
          viewed?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          liked?: boolean | null
          user_id?: string
          video_id?: string
          viewed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "video_interactions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "safety_videos"
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
      app_role: "worker" | "manager"
      hazard_severity: "low" | "medium" | "high" | "critical"
      hazard_status: "pending" | "in_progress" | "resolved"
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
      app_role: ["worker", "manager"],
      hazard_severity: ["low", "medium", "high", "critical"],
      hazard_status: ["pending", "in_progress", "resolved"],
    },
  },
} as const
