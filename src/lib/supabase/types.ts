// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)'
  }
  public: {
    Tables: {
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
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
            foreignKeyName: 'match_feedback_document_id_fkey'
            columns: ['document_id']
            isOneToOne: false
            referencedRelation: 'documents'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'match_feedback_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'notification_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'notification_templates_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
          broker_demand_id: string | null
          broker_property_id: string | null
          created_at: string
          demand_id: number | null
          id: string
          last_interaction_at: string
          property_id: number | null
          status: string
          update_token: string
        }
        Insert: {
          broker_demand_id?: string | null
          broker_property_id?: string | null
          created_at?: string
          demand_id?: number | null
          id?: string
          last_interaction_at?: string
          property_id?: number | null
          status?: string
          update_token?: string
        }
        Update: {
          broker_demand_id?: string | null
          broker_property_id?: string | null
          created_at?: string
          demand_id?: number | null
          id?: string
          last_interaction_at?: string
          property_id?: number | null
          status?: string
          update_token?: string
        }
        Relationships: [
          {
            foreignKeyName: 'partnerships_broker_demand_id_fkey'
            columns: ['broker_demand_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'partnerships_broker_property_id_fkey'
            columns: ['broker_property_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'partnerships_demand_id_fkey'
            columns: ['demand_id']
            isOneToOne: false
            referencedRelation: 'documents'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'partnerships_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'documents'
            referencedColumns: ['id']
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
          company_name: string | null
          created_at: string
          creci: string | null
          email: string | null
          full_name: string | null
          id: string
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
          company_name?: string | null
          created_at?: string
          creci?: string | null
          email?: string | null
          full_name?: string | null
          id: string
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
          company_name?: string | null
          created_at?: string
          creci?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
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
            foreignKeyName: 'profiles_referred_by_id_fkey'
            columns: ['referred_by_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'profiles_validated_by_fkey'
            columns: ['validated_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'referral_clicks_referrer_id_fkey'
            columns: ['referrer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'suggestions_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'support_tickets_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'user_actions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'user_matches_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'user_plans_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_plans_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'user_push_subscriptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_id_by_email: { Args: { p_email: string }; Returns: string }
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: documents
//   id: bigint (not null, default: nextval('documents_id_seq'::regclass))
//   content: text (nullable)
//   metadata: jsonb (nullable)
//   embedding: vector (nullable)
// Table: match_feedback
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   document_id: bigint (not null)
//   feedback_type: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: notification_logs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   recipient: text (not null)
//   channel: text (not null)
//   status: text (not null)
//   message_body: text (not null)
//   error_details: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: notification_templates
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   name: text (not null)
//   content: text (not null)
//   channel: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: objections_sofia
//   id: text (not null)
//   titulo: text (not null)
//   contexto_original: text (not null)
//   tipo: text (not null)
//   pergunta_devolutiva: text (not null)
//   argumentos: jsonb (not null)
//   beneficio_perdido: text (not null)
// Table: partnerships
//   id: uuid (not null, default: gen_random_uuid())
//   demand_id: bigint (nullable)
//   property_id: bigint (nullable)
//   broker_demand_id: uuid (nullable)
//   broker_property_id: uuid (nullable)
//   status: text (not null, default: 'match'::text)
//   last_interaction_at: timestamp with time zone (not null, default: now())
//   created_at: timestamp with time zone (not null, default: now())
//   update_token: uuid (not null, default: gen_random_uuid())
// Table: plans
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   price_base: numeric (not null, default: 0)
//   description: text (nullable)
//   features_json: jsonb (nullable, default: '[]'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   full_name: text (nullable)
//   whatsapp_number: text (nullable)
//   updated_at: timestamp with time zone (nullable, default: now())
//   accepted_terms: boolean (not null, default: false)
//   role: text (not null, default: 'user'::text)
//   plan: text (not null, default: 'Free'::text)
//   region: text (nullable)
//   ticket_value: text (nullable)
//   creci: text (nullable)
//   referral_code: text (nullable)
//   avatar_url: text (nullable)
//   company_name: text (nullable)
//   reputation_score: integer (not null, default: 0)
//   status: text (not null, default: 'pending_validation'::text)
//   validated_by: uuid (nullable)
//   validation_date: timestamp with time zone (nullable)
//   email: text (nullable)
//   referred_by_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   suggestion_points: integer (not null, default: 0)
//   specialties: text (nullable)
// Table: referral_clicks
//   id: uuid (not null, default: gen_random_uuid())
//   referrer_id: uuid (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: suggestions
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   description: text (not null)
//   category: text (nullable)
//   status: text (not null, default: 'Em Análise'::text)
//   complexity: text (nullable)
//   points: integer (nullable, default: 0)
//   votes: integer (nullable, default: 1)
//   author_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: support_tickets
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   full_name: text (not null)
//   email: text (not null)
//   subject: text (not null)
//   message: text (not null)
//   status: text (not null, default: 'open'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: user_actions
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   action_type: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: user_matches
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   match_count: integer (not null, default: 0)
//   month: integer (not null)
//   year: integer (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: user_plans
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   plan_id: uuid (not null)
//   status: text (not null, default: 'active'::text)
//   started_at: timestamp with time zone (not null, default: now())
//   expires_at: timestamp with time zone (nullable)
//   is_founder: boolean (not null, default: false)
//   created_at: timestamp with time zone (not null, default: now())
// Table: user_push_subscriptions
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   subscription_data: jsonb (not null)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: documents
//   PRIMARY KEY documents_pkey: PRIMARY KEY (id)
// Table: match_feedback
//   FOREIGN KEY match_feedback_document_id_fkey: FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
//   CHECK match_feedback_feedback_type_check: CHECK ((feedback_type = ANY (ARRAY['perfect'::text, 'not_suitable'::text])))
//   PRIMARY KEY match_feedback_pkey: PRIMARY KEY (id)
//   FOREIGN KEY match_feedback_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: notification_logs
//   CHECK notification_logs_channel_check: CHECK ((channel = ANY (ARRAY['whatsapp'::text, 'email'::text, 'push'::text])))
//   PRIMARY KEY notification_logs_pkey: PRIMARY KEY (id)
//   CHECK notification_logs_status_check: CHECK ((status = ANY (ARRAY['success'::text, 'failed'::text])))
//   FOREIGN KEY notification_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: notification_templates
//   CHECK notification_templates_channel_check: CHECK ((channel = ANY (ARRAY['whatsapp'::text, 'email'::text])))
//   PRIMARY KEY notification_templates_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notification_templates_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: objections_sofia
//   PRIMARY KEY objections_sofia_pkey: PRIMARY KEY (id)
// Table: partnerships
//   FOREIGN KEY partnerships_broker_demand_id_fkey: FOREIGN KEY (broker_demand_id) REFERENCES profiles(id) ON DELETE CASCADE
//   FOREIGN KEY partnerships_broker_property_id_fkey: FOREIGN KEY (broker_property_id) REFERENCES profiles(id) ON DELETE CASCADE
//   FOREIGN KEY partnerships_demand_id_fkey: FOREIGN KEY (demand_id) REFERENCES documents(id) ON DELETE CASCADE
//   PRIMARY KEY partnerships_pkey: PRIMARY KEY (id)
//   FOREIGN KEY partnerships_property_id_fkey: FOREIGN KEY (property_id) REFERENCES documents(id) ON DELETE CASCADE
//   CHECK partnerships_status_check: CHECK ((status = ANY (ARRAY['match'::text, 'contact'::text, 'visit'::text, 'proposal'::text, 'closed'::text, 'cancelled'::text])))
// Table: plans
//   UNIQUE plans_name_key: UNIQUE (name)
//   PRIMARY KEY plans_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
//   FOREIGN KEY profiles_referred_by_id_fkey: FOREIGN KEY (referred_by_id) REFERENCES profiles(id) ON DELETE SET NULL
//   CHECK profiles_status_check: CHECK ((status = ANY (ARRAY['pending_validation'::text, 'active'::text, 'rejected'::text])))
//   FOREIGN KEY profiles_validated_by_fkey: FOREIGN KEY (validated_by) REFERENCES profiles(id) ON DELETE SET NULL
// Table: referral_clicks
//   PRIMARY KEY referral_clicks_pkey: PRIMARY KEY (id)
//   FOREIGN KEY referral_clicks_referrer_id_fkey: FOREIGN KEY (referrer_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: suggestions
//   FOREIGN KEY suggestions_author_id_fkey: FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE
//   PRIMARY KEY suggestions_pkey: PRIMARY KEY (id)
// Table: support_tickets
//   PRIMARY KEY support_tickets_pkey: PRIMARY KEY (id)
//   CHECK support_tickets_status_check: CHECK ((status = ANY (ARRAY['open'::text, 'pending'::text, 'resolved'::text])))
//   FOREIGN KEY support_tickets_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
// Table: user_actions
//   PRIMARY KEY user_actions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY user_actions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: user_matches
//   CHECK user_matches_month_check: CHECK (((month >= 1) AND (month <= 12)))
//   PRIMARY KEY user_matches_pkey: PRIMARY KEY (id)
//   FOREIGN KEY user_matches_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
//   UNIQUE user_matches_user_id_month_year_key: UNIQUE (user_id, month, year)
// Table: user_plans
//   PRIMARY KEY user_plans_pkey: PRIMARY KEY (id)
//   FOREIGN KEY user_plans_plan_id_fkey: FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
//   CHECK user_plans_status_check: CHECK ((status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text])))
//   FOREIGN KEY user_plans_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: user_push_subscriptions
//   PRIMARY KEY user_push_subscriptions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY user_push_subscriptions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: documents
//   Policy "authenticated_delete_documents" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (((auth.uid())::text = (metadata ->> 'user_id'::text)) OR is_admin())
//   Policy "authenticated_insert_documents" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_documents" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_documents" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (((auth.uid())::text = (metadata ->> 'user_id'::text)) OR is_admin())
//     WITH CHECK: (((auth.uid())::text = (metadata ->> 'user_id'::text)) OR is_admin())
// Table: match_feedback
//   Policy "Users can insert own feedback" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can select own feedback" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: notification_logs
//   Policy "Users can insert own logs" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can manage their own logs" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: notification_templates
//   Policy "Users can manage their own templates" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: partnerships
//   Policy "Users can insert their own partnerships" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((auth.uid() = broker_demand_id) OR (auth.uid() = broker_property_id))
//   Policy "Users can update their own partnerships" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = broker_demand_id) OR (auth.uid() = broker_property_id))
//     WITH CHECK: ((auth.uid() = broker_demand_id) OR (auth.uid() = broker_property_id))
//   Policy "Users can view their own partnerships" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = broker_demand_id) OR (auth.uid() = broker_property_id))
// Table: plans
//   Policy "Anyone can select plans" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: profiles
//   Policy "Admins and Elite can update other profiles" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND ((p.role = 'admin'::text) OR (p.reputation_score > 80)))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND ((p.role = 'admin'::text) OR (p.reputation_score > 80)))))
//   Policy "Admins can update all profiles" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//     WITH CHECK: is_admin()
//   Policy "Admins can view all profiles" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "Authenticated users can select active profiles" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (status = 'active'::text)
//   Policy "Enable read access for active profiles" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (status = 'active'::text)
//   Policy "Users can insert own profile" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = id)
//   Policy "Users can update own profile" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
//     WITH CHECK: (auth.uid() = id)
//   Policy "Users can view own profile" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
//   Policy "Users can view referred profiles" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (referred_by_id = auth.uid())
// Table: referral_clicks
//   Policy "Anyone can insert referral clicks" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "Users can view own referral clicks" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (referrer_id = auth.uid())
// Table: suggestions
//   Policy "Admins can update suggestions" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))
//   Policy "Anyone can read suggestions" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Users can insert suggestions" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = author_id)
// Table: support_tickets
//   Policy "Admins can update tickets" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))
//   Policy "Admins can view all tickets" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))
//   Policy "Anyone can insert support tickets" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
// Table: user_actions
//   Policy "System can manage user_actions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can view own actions" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: user_matches
//   Policy "System can manage user_matches" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can view own matches" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: user_plans
//   Policy "System can manage user_plans" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can view own plans" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: user_push_subscriptions
//   Policy "Admins can view all push subscriptions" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "Users can manage own push subscriptions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)

// --- DATABASE FUNCTIONS ---
// FUNCTION get_user_id_by_email(text)
//   CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email text)
//    RETURNS uuid
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_user_id UUID;
//   BEGIN
//     SELECT id INTO v_user_id FROM auth.users WHERE email = p_email LIMIT 1;
//     RETURN v_user_id;
//   END;
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     user_count INT;
//     assigned_role TEXT := 'user';
//     assigned_plan TEXT := 'Free';
//     assigned_status TEXT := 'pending_validation';
//     ref_by_id UUID := NULL;
//   BEGIN
//     SELECT COUNT(*) INTO user_count FROM public.profiles;
//
//     IF user_count = 0 THEN
//       assigned_role := 'admin';
//       assigned_plan := 'Founder';
//       assigned_status := 'active';
//     ELSIF user_count < 20 THEN
//       assigned_plan := 'Founder';
//       assigned_status := 'active';
//     END IF;
//
//     BEGIN
//       IF NEW.raw_user_meta_data->>'referred_by_id' IS NOT NULL AND NEW.raw_user_meta_data->>'referred_by_id' != '' THEN
//         ref_by_id := (NEW.raw_user_meta_data->>'referred_by_id')::uuid;
//       END IF;
//     EXCEPTION WHEN OTHERS THEN
//       ref_by_id := NULL;
//     END;
//
//     BEGIN
//       INSERT INTO public.profiles (
//         id,
//         full_name,
//         role,
//         plan,
//         status,
//         accepted_terms,
//         whatsapp_number,
//         creci,
//         region,
//         ticket_value,
//         referral_code,
//         company_name,
//         email,
//         referred_by_id,
//         specialties
//       )
//       VALUES (
//         NEW.id,
//         COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
//         assigned_role,
//         assigned_plan,
//         assigned_status,
//         COALESCE((NEW.raw_user_meta_data->>'accepted_terms')::boolean, false),
//         NEW.raw_user_meta_data->>'whatsapp_number',
//         NEW.raw_user_meta_data->>'creci',
//         NEW.raw_user_meta_data->>'region',
//         NEW.raw_user_meta_data->>'ticket_value',
//         NEW.raw_user_meta_data->>'referral_code',
//         NEW.raw_user_meta_data->>'company_name',
//         NEW.email,
//         ref_by_id,
//         NEW.raw_user_meta_data->>'specialties'
//       )
//       ON CONFLICT (id) DO UPDATE SET
//         role = EXCLUDED.role,
//         plan = EXCLUDED.plan,
//         status = EXCLUDED.status,
//         email = EXCLUDED.email;
//     EXCEPTION WHEN OTHERS THEN
//       RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
//     END;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION handle_new_user_templates()
//   CREATE OR REPLACE FUNCTION public.handle_new_user_templates()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.notification_templates (user_id, name, channel, content)
//     VALUES
//       (NEW.id, 'Notificação de Match - WhatsApp', 'whatsapp', 'Olá {{partner_name}}! 🚀 Acabamos de encontrar um novo match para o imóvel {{property_details}}. Confira agora mesmo no seu painel da Prime Circle!'),
//       (NEW.id, 'Notificação de Match - Email', 'email', 'Assunto: Novo Match Identificado! 🏠
//
//   Olá {{partner_name}},
//
//   Identificamos uma nova oportunidade de negócio! Um novo match foi gerado para o imóvel {{property_details}}.
//
//   Clique no link abaixo para ver os detalhes e entrar em contato:
//   [Link do Sistema]
//
//   Boas vendas,
//   Equipe Prime Circle'),
//       (NEW.id, 'Solicitação de Parceria - WhatsApp', 'whatsapp', 'Olá {{partner_name}}! Você recebeu uma nova solicitação de parceria na Prime Circle. Acesse a plataforma para responder e iniciar essa nova colaboração. 🤝'),
//       (NEW.id, 'Solicitação de Parceria - Email', 'email', 'Assunto: Você tem uma nova solicitação de parceria 🤝
//
//   Olá {{partner_name}},
//
//   Um colega de profissão enviou uma solicitação de parceria para você através da Prime Circle.
//
//   Parcerias aumentam suas chances de fechamento! Acesse seu dashboard para revisar a solicitação.
//
//   Atenciosamente,
//   Equipe Prime Circle'),
//       (NEW.id, 'Boas-vindas - WhatsApp', 'whatsapp', 'Olá {{full_name}}! 🚀 Bem-vindo à Prime Circle. Seu cadastro foi recebido com sucesso. Estamos muito felizes em ter você em nossa rede exclusiva de parcerias imobiliárias.'),
//       (NEW.id, 'Boas-vindas - Email', 'email', 'Assunto: Bem-vindo à Prime Circle! 🏠
//
//   Olá {{full_name}},
//
//   Bem-vindo à Prime Circle! Agora que sua conta foi criada, utilize o link abaixo para acessar seu painel exclusivo e começar a gerar parcerias.
//
//   Acesse: https://www.primecircle.app.br/dashboard
//
//   Dica Prime: Para facilitar seu acesso, abra este link no seu celular (Safari no iOS ou Chrome no Android) e use a opção "Adicionar à Tela de Início". Assim, você terá o Prime Circle como um aplicativo sempre à mão e receberá nossas notificações em tempo real!
//
//   Boas vendas,
//   Equipe Prime Circle'),
//       (NEW.id, 'Nova Demanda - WhatsApp', 'whatsapp', 'Olá {{partner_name}}! 🚀 Uma nova demanda foi cadastrada na Prime Circle: {{demand_details}}. Acesse a plataforma para conferir e oferecer seus imóveis: https://www.primecircle.app.br/dashboard');
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION increment_user_match_count(uuid, integer, integer)
//   CREATE OR REPLACE FUNCTION public.increment_user_match_count(p_user_id uuid, p_month integer, p_year integer)
//    RETURNS integer
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_match_count INT;
//   BEGIN
//     -- Upsert: Inserts a new record starting at 1 if new month/year, else increments the existing
//     INSERT INTO public.user_matches (user_id, month, year, match_count)
//     VALUES (p_user_id, p_month, p_year, 1)
//     ON CONFLICT (user_id, month, year)
//     DO UPDATE SET match_count = public.user_matches.match_count + 1
//     RETURNING match_count INTO v_match_count;
//
//     RETURN v_match_count;
//   END;
//   $function$
//
// FUNCTION increment_video_views(bigint)
//   CREATE OR REPLACE FUNCTION public.increment_video_views(doc_id bigint)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     UPDATE public.documents
//     SET metadata = jsonb_set(
//       metadata,
//       '{video_views}',
//       to_jsonb(COALESCE((metadata->>'video_views')::int, 0) + 1)
//     )
//     WHERE id = doc_id;
//   END;
//   $function$
//
// FUNCTION is_admin()
//   CREATE OR REPLACE FUNCTION public.is_admin()
//    RETURNS boolean
//    LANGUAGE sql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//     SELECT COALESCE((SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()), false);
//   $function$
//
// FUNCTION log_notification(uuid, text, text, text, text, text)
//   CREATE OR REPLACE FUNCTION public.log_notification(p_user_id uuid, p_recipient text, p_channel text, p_status text, p_message_body text, p_error_details text DEFAULT NULL::text)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.notification_logs (
//       user_id, recipient, channel, status, message_body, error_details
//     ) VALUES (
//       p_user_id, p_recipient, p_channel, p_status, p_message_body, p_error_details
//     );
//   END;
//   $function$
//
// FUNCTION match_documents(vector, integer, jsonb)
//   CREATE OR REPLACE FUNCTION public.match_documents(query_embedding vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
//    RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
//    LANGUAGE plpgsql
//   AS $function$
//   #variable_conflict use_column
//   begin
//     return query
//     select
//       id,
//       content,
//       metadata,
//       1 - (documents.embedding <=> query_embedding) as similarity
//     from documents
//     where metadata @> filter
//     order by documents.embedding <=> query_embedding
//     limit match_count;
//   end;
//   $function$
//
// FUNCTION quick_update_partnership(uuid, text, uuid)
//   CREATE OR REPLACE FUNCTION public.quick_update_partnership(p_token uuid, p_status text, p_broker_id uuid)
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_partnership public.partnerships%ROWTYPE;
//     v_other_broker_id UUID;
//     v_broker_name TEXT;
//     v_other_broker_phone TEXT;
//     v_property_title TEXT;
//     v_url TEXT;
//     v_body JSONB;
//   BEGIN
//     SELECT * INTO v_partnership FROM public.partnerships WHERE update_token = p_token;
//
//     IF NOT FOUND THEN
//       RETURN FALSE;
//     END IF;
//
//     IF p_status NOT IN ('match', 'contact', 'visit', 'proposal', 'closed', 'cancelled') THEN
//       RETURN FALSE;
//     END IF;
//
//     UPDATE public.partnerships
//     SET status = p_status, last_interaction_at = NOW()
//     WHERE id = v_partnership.id;
//
//     UPDATE public.profiles
//     SET reputation_score = reputation_score + 5
//     WHERE id = p_broker_id;
//
//     IF p_broker_id = v_partnership.broker_demand_id THEN
//       v_other_broker_id := v_partnership.broker_property_id;
//     ELSE
//       v_other_broker_id := v_partnership.broker_demand_id;
//     END IF;
//
//     SELECT full_name INTO v_broker_name FROM public.profiles WHERE id = p_broker_id;
//     SELECT whatsapp_number INTO v_other_broker_phone FROM public.profiles WHERE id = v_other_broker_id;
//     SELECT COALESCE(metadata->>'title', metadata->>'tipo_imovel', 'Imóvel') INTO v_property_title FROM public.documents WHERE id = v_partnership.property_id;
//
//     IF p_status IN ('visit', 'proposal', 'closed') AND v_other_broker_phone IS NOT NULL THEN
//       v_url := current_setting('app.settings.supabase_url', true);
//       IF v_url IS NULL OR v_url = '' THEN
//         v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
//       END IF;
//       v_url := v_url || '/functions/v1/send-whatsapp';
//
//       v_body := jsonb_build_object(
//         'number', v_other_broker_phone,
//         'text', 'Broker ' || COALESCE(v_broker_name, 'Parceiro') || ' informou que o status da negociação do imóvel ' || COALESCE(v_property_title, '') || ' mudou para: ' || p_status || '. Você confirma? Acesse o painel para validar: https://www.primecircle.app.br/dashboard',
//         'user_id', v_other_broker_id
//       );
//
//       BEGIN
//         PERFORM net.http_post(
//             url := v_url,
//             headers := '{"Content-Type": "application/json"}'::jsonb,
//             body := v_body,
//             timeout_milliseconds := 2000
//         );
//       EXCEPTION WHEN OTHERS THEN
//         RAISE WARNING 'Error scheduling double verification whatsapp: %', SQLERRM;
//       END;
//     END IF;
//
//     RETURN TRUE;
//   END;
//   $function$
//
// FUNCTION trigger_demand_push_webhook()
//   CREATE OR REPLACE FUNCTION public.trigger_demand_push_webhook()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_url text;
//     v_body jsonb;
//   BEGIN
//     v_url := current_setting('app.settings.supabase_url', true);
//     IF v_url IS NULL OR v_url = '' THEN
//       v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
//     END IF;
//
//     v_url := v_url || '/functions/v1/demand-push-webhook';
//
//     IF NEW.metadata->>'type' = 'demanda' THEN
//       v_body := jsonb_build_object(
//         'type', 'INSERT',
//         'table', 'documents',
//         'schema', 'public',
//         'record', row_to_json(NEW)
//       );
//
//       BEGIN
//         PERFORM net.http_post(
//             url := v_url,
//             headers := '{"Content-Type": "application/json"}'::jsonb,
//             body := v_body,
//             timeout_milliseconds := 2000
//         );
//       EXCEPTION WHEN OTHERS THEN
//         RAISE WARNING 'Error scheduling demand push webhook pg_net request: %', SQLERRM;
//       END;
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trigger_match_property_webhook()
//   CREATE OR REPLACE FUNCTION public.trigger_match_property_webhook()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_url text;
//     v_body jsonb;
//   BEGIN
//     v_url := current_setting('app.settings.supabase_url', true);
//     IF v_url IS NULL OR v_url = '' THEN
//       v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
//     END IF;
//
//     v_url := v_url || '/functions/v1/match-property-webhook';
//
//     -- Only trigger matching logic if a new 'oferta' (property) is inserted
//     IF NEW.metadata->>'type' = 'oferta' THEN
//       v_body := jsonb_build_object(
//         'type', 'INSERT',
//         'table', 'documents',
//         'schema', 'public',
//         'record', row_to_json(NEW)
//       );
//
//       BEGIN
//         PERFORM net.http_post(
//             url := v_url,
//             headers := '{"Content-Type": "application/json"}'::jsonb,
//             body := v_body,
//             timeout_milliseconds := 2000
//         );
//       EXCEPTION WHEN OTHERS THEN
//         RAISE WARNING 'Error scheduling match webhook pg_net request: %', SQLERRM;
//       END;
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trigger_support_ticket_webhook()
//   CREATE OR REPLACE FUNCTION public.trigger_support_ticket_webhook()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_url text;
//     v_body jsonb;
//   BEGIN
//     v_url := current_setting('app.settings.supabase_url', true);
//
//     IF v_url IS NULL OR v_url = '' THEN
//       v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
//     END IF;
//
//     v_url := v_url || '/functions/v1/support-ticket-webhook';
//     v_body := jsonb_build_object(
//       'type', 'INSERT',
//       'table', 'support_tickets',
//       'schema', 'public',
//       'record', row_to_json(NEW)
//     );
//
//     BEGIN
//       -- net.http_post puts the request in an async queue handled by the pg_net background worker
//       -- This guarantees the transaction commits quickly regardless of the edge function's response time
//       PERFORM net.http_post(
//           url := v_url,
//           headers := '{"Content-Type": "application/json"}'::jsonb,
//           body := v_body,
//           timeout_milliseconds := 2000
//       );
//     EXCEPTION WHEN OTHERS THEN
//       -- Completely swallow any pg_net scheduling errors to avoid aborting insert
//       RAISE WARNING 'Error scheduling support ticket webhook pg_net request: %', SQLERRM;
//     END;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trigger_validation_whatsapp()
//   CREATE OR REPLACE FUNCTION public.trigger_validation_whatsapp()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_url text;
//     v_body jsonb;
//     v_message text;
//   BEGIN
//     -- Only trigger when status changes from pending_validation to active and validated_by is populated
//     IF OLD.status = 'pending_validation' AND NEW.status = 'active' AND NEW.validated_by IS NOT NULL THEN
//
//       -- Make sure the user has a whatsapp number
//       IF NEW.whatsapp_number IS NULL OR NEW.whatsapp_number = '' THEN
//         RETURN NEW;
//       END IF;
//
//       v_url := current_setting('app.settings.supabase_url', true);
//       IF v_url IS NULL OR v_url = '' THEN
//         v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
//       END IF;
//
//       v_url := v_url || '/functions/v1/send-whatsapp';
//
//       -- Construct the exact message requested in Acceptance Criteria
//       v_message := 'Olá ' || COALESCE(NEW.full_name, 'Parceiro(a)') || '! Sua conta no Prime Circle foi validada com sucesso por um de nossos membros sêniores. 🚀 Acesse agora para conferir as oportunidades exclusivas: https://www.primecircle.app.br/dashboard';
//
//       -- Build the payload for the edge function. Including user_id ensures it gets logged in notification_logs.
//       v_body := jsonb_build_object(
//         'number', NEW.whatsapp_number,
//         'text', v_message,
//         'user_id', NEW.id
//       );
//
//       BEGIN
//         PERFORM net.http_post(
//             url := v_url,
//             headers := '{"Content-Type": "application/json"}'::jsonb,
//             body := v_body,
//             timeout_milliseconds := 2000
//         );
//       EXCEPTION WHEN OTHERS THEN
//         RAISE WARNING 'Error scheduling validation whatsapp pg_net request: %', SQLERRM;
//       END;
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trigger_welcome_webhook()
//   CREATE OR REPLACE FUNCTION public.trigger_welcome_webhook()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_url text;
//     v_body jsonb;
//   BEGIN
//     v_url := current_setting('app.settings.supabase_url', true);
//
//     IF v_url IS NULL OR v_url = '' THEN
//       v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
//     END IF;
//
//     v_url := v_url || '/functions/v1/welcome-webhook';
//     v_body := jsonb_build_object(
//       'type', 'INSERT',
//       'table', 'profiles',
//       'schema', 'public',
//       'record', row_to_json(NEW)
//     );
//
//     BEGIN
//       -- net.http_post puts the request in an async queue handled by the pg_net background worker
//       -- This guarantees the transaction commits quickly regardless of the edge function's response time
//       PERFORM net.http_post(
//           url := v_url,
//           headers := '{"Content-Type": "application/json"}'::jsonb,
//           body := v_body,
//           timeout_milliseconds := 2000
//       );
//     EXCEPTION WHEN OTHERS THEN
//       -- Completely swallow any pg_net scheduling errors to avoid aborting auth.users insert
//       RAISE WARNING 'Error scheduling welcome webhook pg_net request: %', SQLERRM;
//     END;
//
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: documents
//   on_document_created_send_demand_push: CREATE TRIGGER on_document_created_send_demand_push AFTER INSERT ON public.documents FOR EACH ROW EXECUTE FUNCTION trigger_demand_push_webhook()
//   on_document_created_send_match: CREATE TRIGGER on_document_created_send_match AFTER INSERT ON public.documents FOR EACH ROW EXECUTE FUNCTION trigger_match_property_webhook()
// Table: profiles
//   on_profile_created_add_templates: CREATE TRIGGER on_profile_created_add_templates AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_new_user_templates()
//   on_profile_created_send_welcome: CREATE TRIGGER on_profile_created_send_welcome AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION trigger_welcome_webhook()
//   on_profile_validated_send_whatsapp: CREATE TRIGGER on_profile_validated_send_whatsapp AFTER UPDATE OF status ON public.profiles FOR EACH ROW EXECUTE FUNCTION trigger_validation_whatsapp()
// Table: support_tickets
//   on_support_ticket_created_send_notification: CREATE TRIGGER on_support_ticket_created_send_notification AFTER INSERT ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION trigger_support_ticket_webhook()

// --- INDEXES ---
// Table: plans
//   CREATE UNIQUE INDEX plans_name_key ON public.plans USING btree (name)
// Table: user_matches
//   CREATE UNIQUE INDEX user_matches_user_id_month_year_key ON public.user_matches USING btree (user_id, month, year)
