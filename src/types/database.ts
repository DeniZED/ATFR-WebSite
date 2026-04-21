// Types pour les tables Supabase. À regénérer avec `supabase gen types
// typescript --project-id <id> > src/types/database.ts` si le schéma évolue.

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'archived';
export type EventType =
  | 'training'
  | 'competition'
  | 'tournament'
  | 'meeting'
  | 'special';
export type TargetClan = 'ATFR' | 'A-T-O';

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          player_name: string;
          account_id: number | null;
          discord_tag: string;
          target_clan: TargetClan;
          wn8: number | null;
          win_rate: number | null;
          battles: number | null;
          tier10_count: number | null;
          availability: string;
          motivation: string;
          previous_clans: string | null;
          status: ApplicationStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_notes: string | null;
        };
        Insert: Omit<
          Database['public']['Tables']['applications']['Row'],
          'id' | 'created_at' | 'updated_at' | 'status' | 'reviewed_by' | 'reviewed_at' | 'review_notes'
        > & {
          status?: ApplicationStatus;
        };
        Update: Partial<Database['public']['Tables']['applications']['Row']>;
      };
      events: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string | null;
          starts_at: string;
          ends_at: string | null;
          type: EventType;
          is_public: boolean;
          location: string | null;
          created_by: string | null;
        };
        Insert: Omit<
          Database['public']['Tables']['events']['Row'],
          'id' | 'created_at' | 'updated_at' | 'created_by'
        > & {
          created_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['events']['Row']>;
      };
      members: {
        Row: {
          account_id: number;
          account_name: string;
          role: string;
          joined_at: string;
          left_at: string | null;
          wn8: number | null;
          win_rate: number | null;
          battles: number | null;
          global_rating: number | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['members']['Row'], 'updated_at' | 'joined_at'> & {
          joined_at?: string;
        };
        Update: Partial<Database['public']['Tables']['members']['Row']>;
      };
      members_history: {
        Row: {
          id: string;
          occurred_at: string;
          account_id: number;
          account_name: string;
          action: 'joined' | 'left' | 'role_changed';
          previous_role: string | null;
          new_role: string | null;
        };
        Insert: Omit<Database['public']['Tables']['members_history']['Row'], 'id' | 'occurred_at'>;
        Update: Partial<Database['public']['Tables']['members_history']['Row']>;
      };
      activity_logs: {
        Row: {
          id: string;
          occurred_at: string;
          actor_id: string | null;
          kind: string;
          target_id: string | null;
          payload: Record<string, unknown> | null;
        };
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'occurred_at'>;
        Update: Partial<Database['public']['Tables']['activity_logs']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
