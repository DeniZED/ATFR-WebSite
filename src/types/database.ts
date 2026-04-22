export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'archived';
export type EventType =
  | 'training'
  | 'competition'
  | 'tournament'
  | 'meeting'
  | 'special';
export type TargetClan = 'ATFR' | 'A-T-O';

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
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
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          player_name: string;
          account_id?: number | null;
          discord_tag: string;
          target_clan: TargetClan;
          wn8?: number | null;
          win_rate?: number | null;
          battles?: number | null;
          tier10_count?: number | null;
          availability: string;
          motivation: string;
          previous_clans?: string | null;
          status?: ApplicationStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          player_name?: string;
          account_id?: number | null;
          discord_tag?: string;
          target_clan?: TargetClan;
          wn8?: number | null;
          win_rate?: number | null;
          battles?: number | null;
          tier10_count?: number | null;
          availability?: string;
          motivation?: string;
          previous_clans?: string | null;
          status?: ApplicationStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_notes?: string | null;
        };
        Relationships: [];
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
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          description?: string | null;
          starts_at: string;
          ends_at?: string | null;
          type: EventType;
          is_public?: boolean;
          location?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          description?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          type?: EventType;
          is_public?: boolean;
          location?: string | null;
          created_by?: string | null;
        };
        Relationships: [];
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
        Insert: {
          account_id: number;
          account_name: string;
          role: string;
          joined_at?: string;
          left_at?: string | null;
          wn8?: number | null;
          win_rate?: number | null;
          battles?: number | null;
          global_rating?: number | null;
          updated_at?: string;
        };
        Update: {
          account_id?: number;
          account_name?: string;
          role?: string;
          joined_at?: string;
          left_at?: string | null;
          wn8?: number | null;
          win_rate?: number | null;
          battles?: number | null;
          global_rating?: number | null;
          updated_at?: string;
        };
        Relationships: [];
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
        Insert: {
          id?: string;
          occurred_at?: string;
          account_id: number;
          account_name: string;
          action: 'joined' | 'left' | 'role_changed';
          previous_role?: string | null;
          new_role?: string | null;
        };
        Update: {
          id?: string;
          occurred_at?: string;
          account_id?: number;
          account_name?: string;
          action?: 'joined' | 'left' | 'role_changed';
          previous_role?: string | null;
          new_role?: string | null;
        };
        Relationships: [];
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
        Insert: {
          id?: string;
          occurred_at?: string;
          actor_id?: string | null;
          kind: string;
          target_id?: string | null;
          payload?: Record<string, unknown> | null;
        };
        Update: {
          id?: string;
          occurred_at?: string;
          actor_id?: string | null;
          kind?: string;
          target_id?: string | null;
          payload?: Record<string, unknown> | null;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
