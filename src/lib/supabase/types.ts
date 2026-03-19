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
      profiles: {
        Row: {
          accepted_terms: boolean
          avatar_url: string | null
          company_name: string | null
          creci: string | null
          email: string | null
          full_name: string | null
          id: string
          plan: string
          referral_code: string | null
          region: string | null
          reputation_score: number
          role: string
          status: string
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
          creci?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          plan?: string
          referral_code?: string | null
          region?: string | null
          reputation_score?: number
          role?: string
          status?: string
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
          creci?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          plan?: string
          referral_code?: string | null
          region?: string | null
          reputation_score?: number
          role?: string
          status?: string
          ticket_value?: string | null
          updated_at?: string | null
          validated_by?: string | null
          validation_date?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_validated_by_fkey'
            columns: ['validated_by']
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_id_by_email: { Args: { p_email: string }; Returns: string }
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
// Table: support_tickets
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   full_name: text (not null)
//   email: text (not null)
//   subject: text (not null)
//   message: text (not null)
//   status: text (not null, default: 'open'::text)
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
//   CHECK notification_logs_channel_check: CHECK ((channel = ANY (ARRAY['whatsapp'::text, 'email'::text])))
//   PRIMARY KEY notification_logs_pkey: PRIMARY KEY (id)
//   CHECK notification_logs_status_check: CHECK ((status = ANY (ARRAY['success'::text, 'failed'::text])))
//   FOREIGN KEY notification_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: notification_templates
//   CHECK notification_templates_channel_check: CHECK ((channel = ANY (ARRAY['whatsapp'::text, 'email'::text])))
//   PRIMARY KEY notification_templates_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notification_templates_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: objections_sofia
//   PRIMARY KEY objections_sofia_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
//   CHECK profiles_status_check: CHECK ((status = ANY (ARRAY['pending_validation'::text, 'active'::text, 'rejected'::text])))
//   FOREIGN KEY profiles_validated_by_fkey: FOREIGN KEY (validated_by) REFERENCES profiles(id) ON DELETE SET NULL
// Table: support_tickets
//   PRIMARY KEY support_tickets_pkey: PRIMARY KEY (id)
//   CHECK support_tickets_status_check: CHECK ((status = ANY (ARRAY['open'::text, 'pending'::text, 'resolved'::text])))
//   FOREIGN KEY support_tickets_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL

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
// Table: support_tickets
//   Policy "Admins can update tickets" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))
//   Policy "Admins can view all tickets" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))
//   Policy "Anyone can insert support tickets" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true

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
//   BEGIN
//     -- Fast count to assign Founder to first 20 users
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
//         email
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
//         NEW.email
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
//     BEGIN
//       INSERT INTO public.notification_templates (user_id, name, channel, content)
//       VALUES
//         (NEW.id, 'Notificação de Match - WhatsApp', 'whatsapp', 'Olá {{partner_name}}! 🚀 Acabamos de encontrar um novo match para o imóvel {{property_details}}. Confira agora mesmo no seu painel da Prime Circle!'),
//         (NEW.id, 'Notificação de Match - Email', 'email', 'Assunto: Novo Match Identificado! 🏠
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
//         (NEW.id, 'Solicitação de Parceria - WhatsApp', 'whatsapp', 'Olá {{partner_name}}! Você recebeu uma nova solicitação de parceria na Prime Circle. Acesse a plataforma para responder e iniciar essa nova colaboração. 🤝'),
//         (NEW.id, 'Solicitação de Parceria - Email', 'email', 'Assunto: Você tem uma nova solicitação de parceria 🤝
//
//   Olá {{partner_name}},
//
//   Um colega de profissão enviou uma solicitação de parceria para você através da Prime Circle.
//
//   Parcerias aumentam suas chances de fechamento! Acesse seu dashboard para revisar a solicitação.
//
//   Atenciosamente,
//   Equipe Prime Circle'),
//         (NEW.id, 'Boas-vindas - WhatsApp', 'whatsapp', 'Olá {{full_name}}! 🚀 Bem-vindo à Prime Circle. Seu cadastro foi recebido com sucesso. Estamos muito felizes em ter você em nossa rede exclusiva de parcerias imobiliárias.'),
//         (NEW.id, 'Boas-vindas - Email', 'email', 'Assunto: Bem-vindo à Prime Circle! 🏠
//
//   Olá {{full_name}},
//
//   Bem-vindo à Prime Circle! Agora que sua conta foi criada, acesse o nosso Dashboard para começar a gerar parcerias:
//   Dashboard: https://prime-circle-migration-fd549.goskip.app/dashboard
//
//   Caso precise entrar novamente, você pode solicitar um Magic Link na página de Acesso Exclusivo:
//   Acesso Exclusivo: https://prime-circle-migration-fd549.goskip.app/login
//
//   Boas vendas,
//   Equipe Prime Circle');
//     EXCEPTION WHEN OTHERS THEN
//       RAISE WARNING 'Error in handle_new_user_templates trigger: %', SQLERRM;
//     END;
//
//     RETURN NEW;
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
//       v_message := 'Olá ' || COALESCE(NEW.full_name, 'Parceiro(a)') || '! Sua conta no Prime Circle foi validada com sucesso por um de nossos membros sêniores. 🚀 Acesse agora para conferir as oportunidades exclusivas: https://prime-circle-migration-fd549.goskip.app/dashboard';
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
//   on_document_created_send_match: CREATE TRIGGER on_document_created_send_match AFTER INSERT ON public.documents FOR EACH ROW EXECUTE FUNCTION trigger_match_property_webhook()
// Table: profiles
//   on_profile_created_add_templates: CREATE TRIGGER on_profile_created_add_templates AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_new_user_templates()
//   on_profile_created_send_welcome: CREATE TRIGGER on_profile_created_send_welcome AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION trigger_welcome_webhook()
//   on_profile_validated_send_whatsapp: CREATE TRIGGER on_profile_validated_send_whatsapp AFTER UPDATE OF status ON public.profiles FOR EACH ROW EXECUTE FUNCTION trigger_validation_whatsapp()
// Table: support_tickets
//   on_support_ticket_created_send_notification: CREATE TRIGGER on_support_ticket_created_send_notification AFTER INSERT ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION trigger_support_ticket_webhook()
