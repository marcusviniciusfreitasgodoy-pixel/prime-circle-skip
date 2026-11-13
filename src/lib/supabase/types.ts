// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: "12.2.3"
  }
  public: {
    Tables: {
      admin_allowlist: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      broker_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broker_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      condominiums: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
          neighborhood: string
          state: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
          neighborhood: string
          state?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          neighborhood?: string
          state?: string | null
        }
        Relationships: []
      }
      demanda_condominio: {
        Row: {
          condominium_id: string
          created_at: string
          demand_id: number
          id: string
          score_compatibilidade: number
          vinculo_tipo: string
        }
        Insert: {
          condominium_id: string
          created_at?: string
          demand_id: number
          id?: string
          score_compatibilidade?: number
          vinculo_tipo?: string
        }
        Update: {
          condominium_id?: string
          created_at?: string
          demand_id?: number
          id?: string
          score_compatibilidade?: number
          vinculo_tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "demanda_condominio_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demanda_condominio_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          condominium_id: string | null
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          condominium_id?: string | null
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          condominium_id?: string | null
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          id: string
          invitee_email: string | null
          invitee_name: string
          invitee_phone: string | null
          last_reminder_at: string | null
          referrer_id: string
          reminder_count: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitee_email?: string | null
          invitee_name: string
          invitee_phone?: string | null
          last_reminder_at?: string | null
          referrer_id: string
          reminder_count?: number
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          invitee_email?: string | null
          invitee_name?: string
          invitee_phone?: string | null
          last_reminder_at?: string | null
          referrer_id?: string
          reminder_count?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_feedback: {
        Row: {
          created_at: string
          document_id: number
          feedback_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id: number
          feedback_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: number
          feedback_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_feedback_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_feedback: {
        Row: {
          created_at: string
          id: string
          newsletter_id: string
          user_id: string
          vote: string
        }
        Insert: {
          created_at?: string
          id?: string
          newsletter_id: string
          user_id: string
          vote: string
        }
        Update: {
          created_at?: string
          id?: string
          newsletter_id?: string
          user_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_feedback_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "newsletters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletters: {
        Row: {
          attachment_url: string | null
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          scheduled_at: string | null
          status: string
          title: string
        }
        Insert: {
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          scheduled_at?: string | null
          status?: string
          title: string
        }
        Update: {
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          scheduled_at?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletters_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          channel: string
          created_at: string
          error_details: string | null
          id: string
          message_body: string
          recipient: string
          status: string
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          error_details?: string | null
          id?: string
          message_body: string
          recipient: string
          status: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          error_details?: string | null
          id?: string
          message_body?: string
          recipient?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          channel: string
          content: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          channel: string
          content: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      objections_sofia: {
        Row: {
          argumentos: Json
          beneficio_perdido: string
          contexto_original: string
          id: string
          pergunta_devolutiva: string
          tipo: string
          titulo: string
        }
        Insert: {
          argumentos: Json
          beneficio_perdido: string
          contexto_original: string
          id: string
          pergunta_devolutiva: string
          tipo: string
          titulo: string
        }
        Update: {
          argumentos?: Json
          beneficio_perdido?: string
          contexto_original?: string
          id?: string
          pergunta_devolutiva?: string
          tipo?: string
          titulo?: string
        }
        Relationships: []
      }
      partnerships: {
        Row: {
          admin_flagged: boolean | null
          broker_demand_id: string | null
          broker_property_id: string | null
          cancelado_by: string | null
          cancelamento_motivo: string | null
          confirmed_by_partner: boolean | null
          created_at: string
          demand_id: number | null
          id: string
          last_interaction_at: string
          last_status_check_at: string | null
          last_updated_by: string | null
          property_id: number | null
          reminder_sent: boolean | null
          status: string
          status_check_count: number | null
          status_check_failed: boolean | null
          update_token: string
          updated_at: string | null
          vgv_confirmado_a: number | null
        }
        Insert: {
          admin_flagged?: boolean | null
          broker_demand_id?: string | null
          broker_property_id?: string | null
          cancelado_by?: string | null
          cancelamento_motivo?: string | null
          confirmed_by_partner?: boolean | null
          created_at?: string
          demand_id?: number | null
          id?: string
          last_interaction_at?: string
          last_status_check_at?: string | null
          last_updated_by?: string | null
          property_id?: number | null
          reminder_sent?: boolean | null
          status?: string
          status_check_count?: number | null
          status_check_failed?: boolean | null
          update_token?: string
          updated_at?: string | null
          vgv_confirmado_a?: number | null
        }
        Update: {
          admin_flagged?: boolean | null
          broker_demand_id?: string | null
          broker_property_id?: string | null
          cancelado_by?: string | null
          cancelamento_motivo?: string | null
          confirmed_by_partner?: boolean | null
          created_at?: string
          demand_id?: number | null
          id?: string
          last_interaction_at?: string
          last_status_check_at?: string | null
          last_updated_by?: string | null
          property_id?: number | null
          reminder_sent?: boolean | null
          status?: string
          status_check_count?: number | null
          status_check_failed?: boolean | null
          update_token?: string
          updated_at?: string | null
          vgv_confirmado_a?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partnerships_broker_demand_id_fkey"
            columns: ["broker_demand_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnerships_broker_property_id_fkey"
            columns: ["broker_property_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnerships_cancelado_by_fkey"
            columns: ["cancelado_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnerships_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnerships_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnerships_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          features_json: Json | null
          id: string
          name: string
          price_base: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          features_json?: Json | null
          id?: string
          name: string
          price_base?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          features_json?: Json | null
          id?: string
          name?: string
          price_base?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepted_terms: boolean
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string
          creci: string | null
          custom_referral_message: string | null
          discount_tier: string | null
          email: string | null
          full_name: string | null
          golden_duo_reminder_sent_at: string | null
          id: string
          last_activation_reminder_at: string | null
          plan: string
          referral_code: string | null
          referred_by_id: string | null
          region: string | null
          reputation_score: number
          role: string
          specialties: string | null
          status: string
          suggestion_points: number
          ticket_value: string | null
          updated_at: string | null
          validated_by: string | null
          validation_date: string | null
          whatsapp_number: string | null
        }
        Insert: {
          accepted_terms?: boolean
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string
          creci?: string | null
          custom_referral_message?: string | null
          discount_tier?: string | null
          email?: string | null
          full_name?: string | null
          golden_duo_reminder_sent_at?: string | null
          id: string
          last_activation_reminder_at?: string | null
          plan?: string
          referral_code?: string | null
          referred_by_id?: string | null
          region?: string | null
          reputation_score?: number
          role?: string
          specialties?: string | null
          status?: string
          suggestion_points?: number
          ticket_value?: string | null
          updated_at?: string | null
          validated_by?: string | null
          validation_date?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          accepted_terms?: boolean
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string
          creci?: string | null
          custom_referral_message?: string | null
          discount_tier?: string | null
          email?: string | null
          full_name?: string | null
          golden_duo_reminder_sent_at?: string | null
          id?: string
          last_activation_reminder_at?: string | null
          plan?: string
          referral_code?: string | null
          referred_by_id?: string | null
          region?: string | null
          reputation_score?: number
          role?: string
          specialties?: string | null
          status?: string
          suggestion_points?: number
          ticket_value?: string | null
          updated_at?: string | null
          validated_by?: string | null
          validation_date?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_id_fkey"
            columns: ["referred_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_action_tokens: {
        Row: {
          action: number
          corretor_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          partnership_id: string | null
          status_alvo: string
          token: string
          updated_at: string | null
          used: boolean | null
        }
        Insert: {
          action: number
          corretor_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          partnership_id?: string | null
          status_alvo: string
          token?: string
          updated_at?: string | null
          used?: boolean | null
        }
        Update: {
          action?: number
          corretor_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          partnership_id?: string | null
          status_alvo?: string
          token?: string
          updated_at?: string | null
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "quick_action_tokens_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_action_tokens_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_clicks: {
        Row: {
          created_at: string
          id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_clicks_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          author_id: string | null
          category: string | null
          complexity: string | null
          created_at: string
          description: string
          id: string
          points: number | null
          status: string
          title: string
          updated_at: string
          votes: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          complexity?: string | null
          created_at?: string
          description: string
          id?: string
          points?: number | null
          status?: string
          title: string
          updated_at?: string
          votes?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          complexity?: string | null
          created_at?: string
          description?: string
          id?: string
          points?: number | null
          status?: string
          title?: string
          updated_at?: string
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_actions: {
        Row: {
          action_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_matches: {
        Row: {
          created_at: string
          id: string
          match_count: number
          month: number
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          match_count?: number
          month: number
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          match_count?: number
          month?: number
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_plans: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_founder: boolean
          plan_id: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_founder?: boolean
          plan_id: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_founder?: boolean
          plan_id?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_push_subscriptions: {
        Row: {
          created_at: string
          id: string
          subscription_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription_data: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription_data?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_validate_peers: { Args: never; Returns: boolean }
      clean_old_logs: { Args: { days_to_keep?: number }; Returns: number }
      get_admin_users_stats: { Args: never; Returns: Json }
      get_growth_metrics: { Args: never; Returns: Json }
      get_inactive_profiles_for_activation: {
        Args: never
        Returns: {
          email: string
          full_name: string
          id: string
          whatsapp_number: string
        }[]
      }
      get_market_intelligence_metrics: { Args: never; Returns: Json }
      get_user_id_by_email: { Args: { p_email: string }; Returns: string }
      get_whatsapp_collection_metrics: { Args: never; Returns: Json }
      increment_user_match_count: {
        Args: { p_month: number; p_user_id: string; p_year: number }
        Returns: number
      }
      increment_video_views: { Args: { doc_id: number }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      log_notification: {
        Args: {
          p_channel: string
          p_error_details?: string
          p_message_body: string
          p_recipient: string
          p_status: string
          p_user_id: string
        }
        Returns: undefined
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      quick_update_partnership: {
        Args: { p_broker_id: string; p_status: string; p_token: string }
        Returns: boolean
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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

