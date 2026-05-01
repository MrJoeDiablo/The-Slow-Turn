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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_jobs: {
        Row: {
          agent_id: string
          created_at: string
          error: string | null
          id: string
          leased_at: string | null
          leased_by: string | null
          message_id: string
          payload: Json
          result: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          error?: string | null
          id?: string
          leased_at?: string | null
          leased_by?: string | null
          message_id: string
          payload?: Json
          result?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          error?: string | null
          id?: string
          leased_at?: string | null
          leased_by?: string | null
          message_id?: string
          payload?: Json
          result?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_logs: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          level: Database["public"]["Enums"]["log_level"]
          message: string
          metadata: Json
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["log_level"]
          message: string
          metadata?: Json
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["log_level"]
          message?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "agent_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_messages: {
        Row: {
          agent_id: string
          content: string
          cost_usd: number | null
          created_at: string
          error: string | null
          id: string
          job_id: string | null
          model: string | null
          room_id: string | null
          sender_id: string | null
          sender_type: Database["public"]["Enums"]["message_sender"]
          status: string
          tokens_in: number | null
          tokens_out: number | null
          tool_calls: Json
        }
        Insert: {
          agent_id: string
          content: string
          cost_usd?: number | null
          created_at?: string
          error?: string | null
          id?: string
          job_id?: string | null
          model?: string | null
          room_id?: string | null
          sender_id?: string | null
          sender_type: Database["public"]["Enums"]["message_sender"]
          status?: string
          tokens_in?: number | null
          tokens_out?: number | null
          tool_calls?: Json
        }
        Update: {
          agent_id?: string
          content?: string
          cost_usd?: number | null
          created_at?: string
          error?: string | null
          id?: string
          job_id?: string | null
          model?: string | null
          room_id?: string | null
          sender_id?: string | null
          sender_type?: Database["public"]["Enums"]["message_sender"]
          status?: string
          tokens_in?: number | null
          tokens_out?: number | null
          tool_calls?: Json
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_models: {
        Row: {
          capabilities: Json
          created_at: string
          id: string
          is_active: boolean
          model_name: string
          provider: string
        }
        Insert: {
          capabilities?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          model_name: string
          provider: string
        }
        Update: {
          capabilities?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          model_name?: string
          provider?: string
        }
        Relationships: []
      }
      agent_permissions: {
        Row: {
          agent_id: string
          created_at: string
          granted: boolean
          id: string
          scope: Json
          tool_key: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          granted?: boolean
          id?: string
          scope?: Json
          tool_key: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          granted?: boolean
          id?: string
          scope?: Json
          tool_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_permissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_rooms: {
        Row: {
          agent_id: string
          archived_at: string | null
          created_at: string
          created_by: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_sessions: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          room_id: string
          session_key: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          room_id: string
          session_key: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          room_id?: string
          session_key?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_tasks: {
        Row: {
          agent_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_todos: {
        Row: {
          agent_id: string
          created_at: string
          done: boolean
          id: string
          label: string
          position: number
        }
        Insert: {
          agent_id: string
          created_at?: string
          done?: boolean
          id?: string
          label: string
          position?: number
        }
        Update: {
          agent_id?: string
          created_at?: string
          done?: boolean
          id?: string
          label?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_todos_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          current_task: string | null
          daily_cost_cap_usd: number
          description: string | null
          id: string
          is_paused: boolean
          is_seed: boolean
          memory: Json
          model: string | null
          monthly_cost_cap_usd: number
          name: string
          provider: string | null
          role_title: string
          slug: string
          status: Database["public"]["Enums"]["agent_status"]
          system_instructions: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          current_task?: string | null
          daily_cost_cap_usd?: number
          description?: string | null
          id?: string
          is_paused?: boolean
          is_seed?: boolean
          memory?: Json
          model?: string | null
          monthly_cost_cap_usd?: number
          name: string
          provider?: string | null
          role_title: string
          slug: string
          status?: Database["public"]["Enums"]["agent_status"]
          system_instructions?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          current_task?: string | null
          daily_cost_cap_usd?: number
          description?: string | null
          id?: string
          is_paused?: boolean
          is_seed?: boolean
          memory?: Json
          model?: string | null
          monthly_cost_cap_usd?: number
          name?: string
          provider?: string | null
          role_title?: string
          slug?: string
          status?: Database["public"]["Enums"]["agent_status"]
          system_instructions?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      deployments: {
        Row: {
          commit_sha: string | null
          environment: string
          finished_at: string | null
          id: string
          log_url: string | null
          repo_id: string
          started_at: string
          status: string
        }
        Insert: {
          commit_sha?: string | null
          environment?: string
          finished_at?: string | null
          id?: string
          log_url?: string | null
          repo_id: string
          started_at?: string
          status?: string
        }
        Update: {
          commit_sha?: string | null
          environment?: string
          finished_at?: string | null
          id?: string
          log_url?: string | null
          repo_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployments_repo_id_fkey"
            columns: ["repo_id"]
            isOneToOne: false
            referencedRelation: "github_repos"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_accounts: {
        Row: {
          created_at: string
          created_by: string | null
          exchange: Database["public"]["Enums"]["exchange_kind"]
          id: string
          is_active: boolean
          label: string
          mode: Database["public"]["Enums"]["trading_mode"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          exchange: Database["public"]["Enums"]["exchange_kind"]
          id?: string
          is_active?: boolean
          label: string
          mode?: Database["public"]["Enums"]["trading_mode"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          exchange?: Database["public"]["Enums"]["exchange_kind"]
          id?: string
          is_active?: boolean
          label?: string
          mode?: Database["public"]["Enums"]["trading_mode"]
          updated_at?: string
        }
        Relationships: []
      }
      github_repos: {
        Row: {
          agent_id: string | null
          created_at: string
          default_branch: string
          id: string
          last_commit_at: string | null
          last_commit_sha: string | null
          name: string
          owner: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          default_branch?: string
          id?: string
          last_commit_at?: string | null
          last_commit_sha?: string | null
          name: string
          owner: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          default_branch?: string
          id?: string
          last_commit_at?: string | null
          last_commit_sha?: string | null
          name?: string
          owner?: string
        }
        Relationships: [
          {
            foreignKeyName: "github_repos_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      model_pricing: {
        Row: {
          id: string
          input_per_mtok_usd: number
          model: string
          output_per_mtok_usd: number
          provider: string
          updated_at: string
        }
        Insert: {
          id?: string
          input_per_mtok_usd: number
          model: string
          output_per_mtok_usd: number
          provider: string
          updated_at?: string
        }
        Update: {
          id?: string
          input_per_mtok_usd?: number
          model?: string
          output_per_mtok_usd?: number
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      openclaw_gateway_settings: {
        Row: {
          default_model: string | null
          funnel_url: string | null
          gateway_url: string | null
          id: string
          last_health_check: string | null
          last_status: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          default_model?: string | null
          funnel_url?: string | null
          gateway_url?: string | null
          id?: string
          last_health_check?: string | null
          last_status?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          default_model?: string | null
          funnel_url?: string | null
          gateway_url?: string | null
          id?: string
          last_health_check?: string | null
          last_status?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      portfolio_snapshots: {
        Row: {
          breakdown: Json
          exchange_account_id: string
          id: string
          snapshot_at: string
          total_value: number
        }
        Insert: {
          breakdown?: Json
          exchange_account_id: string
          id?: string
          snapshot_at?: string
          total_value: number
        }
        Update: {
          breakdown?: Json
          exchange_account_id?: string
          id?: string
          snapshot_at?: string
          total_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_snapshots_exchange_account_id_fkey"
            columns: ["exchange_account_id"]
            isOneToOne: false
            referencedRelation: "exchange_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          avg_price: number
          exchange_account_id: string
          id: string
          qty: number
          symbol: string
          unrealized_pnl: number
          updated_at: string
        }
        Insert: {
          avg_price: number
          exchange_account_id: string
          id?: string
          qty: number
          symbol: string
          unrealized_pnl?: number
          updated_at?: string
        }
        Update: {
          avg_price?: number
          exchange_account_id?: string
          id?: string
          qty?: number
          symbol?: string
          unrealized_pnl?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_exchange_account_id_fkey"
            columns: ["exchange_account_id"]
            isOneToOne: false
            referencedRelation: "exchange_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      spend_daily: {
        Row: {
          agent_id: string
          cost_usd: number
          date: string
          id: string
          tokens_in: number
          tokens_out: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          cost_usd?: number
          date?: string
          id?: string
          tokens_in?: number
          tokens_out?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          cost_usd?: number
          date?: string
          id?: string
          tokens_in?: number
          tokens_out?: number
          updated_at?: string
        }
        Relationships: []
      }
      strategy_signals: {
        Row: {
          agent_id: string | null
          confidence: number | null
          created_at: string
          id: string
          metadata: Json
          signal: string
          symbol: string
        }
        Insert: {
          agent_id?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          metadata?: Json
          signal: string
          symbol: string
        }
        Update: {
          agent_id?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          metadata?: Json
          signal?: string
          symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_signals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          exchange_account_id: string
          executed_at: string
          id: string
          metadata: Json
          price: number
          qty: number
          side: string
          status: string
          symbol: string
        }
        Insert: {
          exchange_account_id: string
          executed_at?: string
          id?: string
          metadata?: Json
          price: number
          qty: number
          side: string
          status?: string
          symbol: string
        }
        Update: {
          exchange_account_id?: string
          executed_at?: string
          id?: string
          metadata?: Json
          price?: number
          qty?: number
          side?: string
          status?: string
          symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_exchange_account_id_fkey"
            columns: ["exchange_account_id"]
            isOneToOne: false
            referencedRelation: "exchange_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_min_role: {
        Args: {
          _min: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lease_next_agent_job: {
        Args: { _worker: string }
        Returns: {
          agent_id: string
          created_at: string
          id: string
          message_id: string
          payload: Json
        }[]
      }
    }
    Enums: {
      agent_status: "online" | "idle" | "working" | "error" | "offline"
      app_role: "owner" | "admin" | "operator" | "viewer"
      exchange_kind: "bitmart" | "binance" | "coinbase" | "kraken" | "other"
      log_level: "info" | "warn" | "error"
      message_sender: "user" | "agent" | "system"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "blocked" | "done" | "cancelled"
      trading_mode: "paper" | "live"
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
      agent_status: ["online", "idle", "working", "error", "offline"],
      app_role: ["owner", "admin", "operator", "viewer"],
      exchange_kind: ["bitmart", "binance", "coinbase", "kraken", "other"],
      log_level: ["info", "warn", "error"],
      message_sender: ["user", "agent", "system"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "blocked", "done", "cancelled"],
      trading_mode: ["paper", "live"],
    },
  },
} as const
