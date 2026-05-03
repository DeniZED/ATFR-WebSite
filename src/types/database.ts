export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'archived';
export type EventType =
  | 'training'
  | 'competition'
  | 'tournament'
  | 'meeting'
  | 'special';
export type TargetClan = 'ATFR' | 'A-T-O';
export type MediaKind = 'image' | 'video';
export type ContentKind = 'text' | 'longtext' | 'url' | 'image' | 'video';
export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'editor';
export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type QuizMode = 'test' | 'training' | 'category';
export type PlayerHrStatus =
  | 'active'
  | 'low_activity'
  | 'inactive'
  | 'former'
  | 'prospect'
  | 'watch';
export type StaffNoteType =
  | 'info'
  | 'warning'
  | 'recruitment'
  | 'absence'
  | 'behavior'
  | 'other';
export type PlayerAlertSeverity = 'info' | 'warning' | 'danger';
export type PlayerAlertKind =
  | 'inactive'
  | 'no_discord'
  | 'no_wot'
  | 'game_no_voice'
  | 'voice_no_clan'
  | 'activity_drop'
  | 'watch'
  | 'custom';

export const DIFFICULTY_LABELS: Record<QuizDifficulty, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
  expert: 'Expert',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super admin',
  admin: 'Admin',
  moderator: 'Modérateur',
  editor: 'Éditeur',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Contrôle total + gestion des rôles',
  admin: 'Gestion complète sauf les rôles',
  moderator: 'Candidatures, événements, membres',
  editor: 'Contenu éditorial, galerie, palmarès',
};

const ROLE_RANK: Record<UserRole, number> = {
  super_admin: 4,
  admin: 3,
  moderator: 2,
  editor: 1,
};

export function hasRole(current: UserRole | null, min: UserRole): boolean {
  if (!current) return false;
  return ROLE_RANK[current] >= ROLE_RANK[min];
}

export function canManageAdmin(role: UserRole | null, area: 'applications' | 'events' | 'members' | 'content' | 'media' | 'users'): boolean {
  if (!role) return false;
  switch (area) {
    case 'applications':
      return hasRole(role, 'moderator');
    case 'events':
    case 'members':
      return hasRole(role, 'admin');
    case 'content':
    case 'media':
      return hasRole(role, 'editor') || hasRole(role, 'admin');
    case 'users':
      return role === 'super_admin';
    default:
      return false;
  }
}

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
      players: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          nickname: string;
          account_id: number | null;
          current_clan_id: number | null;
          current_clan_tag: string | null;
          internal_role: string | null;
          joined_at: string | null;
          status: PlayerHrStatus;
          tags: string[];
          staff_comment: string | null;
          tomato_url: string | null;
          wot_profile_url: string | null;
          last_wot_activity_at: string | null;
          last_discord_voice_at: string | null;
          source: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          nickname: string;
          account_id?: number | null;
          current_clan_id?: number | null;
          current_clan_tag?: string | null;
          internal_role?: string | null;
          joined_at?: string | null;
          status?: PlayerHrStatus;
          tags?: string[];
          staff_comment?: string | null;
          tomato_url?: string | null;
          wot_profile_url?: string | null;
          last_wot_activity_at?: string | null;
          last_discord_voice_at?: string | null;
          source?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          nickname?: string;
          account_id?: number | null;
          current_clan_id?: number | null;
          current_clan_tag?: string | null;
          internal_role?: string | null;
          joined_at?: string | null;
          status?: PlayerHrStatus;
          tags?: string[];
          staff_comment?: string | null;
          tomato_url?: string | null;
          wot_profile_url?: string | null;
          last_wot_activity_at?: string | null;
          last_discord_voice_at?: string | null;
          source?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      player_discord_links: {
        Row: {
          id: string;
          player_id: string;
          discord_user_id: string;
          discord_tag: string | null;
          discord_role: string | null;
          guild_id: string | null;
          is_primary: boolean;
          linked_at: string;
          linked_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          discord_user_id: string;
          discord_tag?: string | null;
          discord_role?: string | null;
          guild_id?: string | null;
          is_primary?: boolean;
          linked_at?: string;
          linked_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          discord_user_id?: string;
          discord_tag?: string | null;
          discord_role?: string | null;
          guild_id?: string | null;
          is_primary?: boolean;
          linked_at?: string;
          linked_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'player_discord_links_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'players';
            referencedColumns: ['id'];
          },
        ];
      };
      player_activity_snapshots: {
        Row: {
          id: string;
          player_id: string;
          account_id: number | null;
          snapshot_date: string;
          captured_at: string;
          clan_id: number | null;
          clan_tag: string | null;
          last_battle_at: string | null;
          battles: number | null;
          battles_delta: number | null;
          active_day: boolean;
          source: string;
          meta: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          player_id: string;
          account_id?: number | null;
          snapshot_date?: string;
          captured_at?: string;
          clan_id?: number | null;
          clan_tag?: string | null;
          last_battle_at?: string | null;
          battles?: number | null;
          battles_delta?: number | null;
          active_day?: boolean;
          source?: string;
          meta?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          player_id?: string;
          account_id?: number | null;
          snapshot_date?: string;
          captured_at?: string;
          clan_id?: number | null;
          clan_tag?: string | null;
          last_battle_at?: string | null;
          battles?: number | null;
          battles_delta?: number | null;
          active_day?: boolean;
          source?: string;
          meta?: Record<string, unknown>;
        };
        Relationships: [
          {
            foreignKeyName: 'player_activity_snapshots_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'players';
            referencedColumns: ['id'];
          },
        ];
      };
      discord_voice_sessions: {
        Row: {
          id: string;
          player_id: string | null;
          discord_user_id: string;
          guild_id: string | null;
          channel_id: string;
          channel_name: string | null;
          joined_at: string;
          left_at: string | null;
          duration_seconds: number;
          source: string;
          meta: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          player_id?: string | null;
          discord_user_id: string;
          guild_id?: string | null;
          channel_id: string;
          channel_name?: string | null;
          joined_at: string;
          left_at?: string | null;
          duration_seconds?: number;
          source?: string;
          meta?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          player_id?: string | null;
          discord_user_id?: string;
          guild_id?: string | null;
          channel_id?: string;
          channel_name?: string | null;
          joined_at?: string;
          left_at?: string | null;
          duration_seconds?: number;
          source?: string;
          meta?: Record<string, unknown>;
        };
        Relationships: [
          {
            foreignKeyName: 'discord_voice_sessions_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'players';
            referencedColumns: ['id'];
          },
        ];
      };
      player_staff_notes: {
        Row: {
          id: string;
          player_id: string;
          created_at: string;
          author_id: string | null;
          note_type: StaffNoteType;
          content: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          created_at?: string;
          author_id?: string | null;
          note_type?: StaffNoteType;
          content: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          created_at?: string;
          author_id?: string | null;
          note_type?: StaffNoteType;
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'player_staff_notes_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'players';
            referencedColumns: ['id'];
          },
        ];
      };
      player_status_history: {
        Row: {
          id: string;
          player_id: string;
          changed_at: string;
          author_id: string | null;
          old_status: PlayerHrStatus | null;
          new_status: PlayerHrStatus | null;
          old_role: string | null;
          new_role: string | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          player_id: string;
          changed_at?: string;
          author_id?: string | null;
          old_status?: PlayerHrStatus | null;
          new_status?: PlayerHrStatus | null;
          old_role?: string | null;
          new_role?: string | null;
          note?: string | null;
        };
        Update: {
          id?: string;
          player_id?: string;
          changed_at?: string;
          author_id?: string | null;
          old_status?: PlayerHrStatus | null;
          new_status?: PlayerHrStatus | null;
          old_role?: string | null;
          new_role?: string | null;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'player_status_history_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'players';
            referencedColumns: ['id'];
          },
        ];
      };
      player_alerts: {
        Row: {
          id: string;
          player_id: string;
          kind: PlayerAlertKind;
          severity: PlayerAlertSeverity;
          title: string;
          description: string | null;
          detected_at: string;
          resolved_at: string | null;
          meta: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          player_id: string;
          kind: PlayerAlertKind;
          severity?: PlayerAlertSeverity;
          title: string;
          description?: string | null;
          detected_at?: string;
          resolved_at?: string | null;
          meta?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          player_id?: string;
          kind?: PlayerAlertKind;
          severity?: PlayerAlertSeverity;
          title?: string;
          description?: string | null;
          detected_at?: string;
          resolved_at?: string | null;
          meta?: Record<string, unknown>;
        };
        Relationships: [
          {
            foreignKeyName: 'player_alerts_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'players';
            referencedColumns: ['id'];
          },
        ];
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
      site_content: {
        Row: {
          key: string;
          value: string;
          kind: ContentKind;
          label: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          key: string;
          value?: string;
          kind?: ContentKind;
          label?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          key?: string;
          value?: string;
          kind?: ContentKind;
          label?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          created_at: string;
          created_by: string | null;
          path: string;
          public_url: string;
          kind: MediaKind;
          mime: string | null;
          size_bytes: number | null;
          width: number | null;
          height: number | null;
          caption: string | null;
          tags: string[];
          is_gallery_visible: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          created_by?: string | null;
          path: string;
          public_url: string;
          kind: MediaKind;
          mime?: string | null;
          size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          caption?: string | null;
          tags?: string[];
          is_gallery_visible?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          created_by?: string | null;
          path?: string;
          public_url?: string;
          kind?: MediaKind;
          mime?: string | null;
          size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          caption?: string | null;
          tags?: string[];
          is_gallery_visible?: boolean;
        };
        Relationships: [];
      };
      highlights: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string | null;
          image_url: string | null;
          occurred_on: string | null;
          sort_order: number;
          is_visible: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          occurred_on?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          occurred_on?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          rank: string | null;
          competition: string | null;
          earned_on: string | null;
          image_url: string | null;
          sort_order: number;
          is_visible: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          subtitle?: string | null;
          description?: string | null;
          rank?: string | null;
          competition?: string | null;
          earned_on?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          subtitle?: string | null;
          description?: string | null;
          rank?: string | null;
          competition?: string | null;
          earned_on?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          author_name: string;
          author_role: string | null;
          avatar_url: string | null;
          quote: string;
          sort_order: number;
          is_visible: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          author_name: string;
          author_role?: string | null;
          avatar_url?: string | null;
          quote: string;
          sort_order?: number;
          is_visible?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          author_name?: string;
          author_role?: string | null;
          avatar_url?: string | null;
          quote?: string;
          sort_order?: number;
          is_visible?: boolean;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: UserRole;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          user_id: string;
          role: UserRole;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          user_id?: string;
          role?: UserRole;
          created_at?: string;
          created_by?: string | null;
        };
        Relationships: [];
      };
      learning_modules: {
        Row: {
          slug: string;
          is_published: boolean;
          sort_order: number;
          badge_label: string | null;
          custom_title: string | null;
          custom_description: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          slug: string;
          is_published?: boolean;
          sort_order?: number;
          badge_label?: string | null;
          custom_title?: string | null;
          custom_description?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          slug?: string;
          is_published?: boolean;
          sort_order?: number;
          badge_label?: string | null;
          custom_title?: string | null;
          custom_description?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      quiz_categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          color: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      quiz_questions: {
        Row: {
          id: string;
          category_id: string | null;
          difficulty: QuizDifficulty;
          title: string;
          context: string | null;
          image_url: string | null;
          question: string;
          explanation: string | null;
          is_published: boolean;
          is_featured: boolean;
          sort_order: number;
          success_count: number;
          attempt_count: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          difficulty?: QuizDifficulty;
          title: string;
          context?: string | null;
          image_url?: string | null;
          question: string;
          explanation?: string | null;
          is_published?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          success_count?: number;
          attempt_count?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          difficulty?: QuizDifficulty;
          title?: string;
          context?: string | null;
          image_url?: string | null;
          question?: string;
          explanation?: string | null;
          is_published?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          success_count?: number;
          attempt_count?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'quiz_questions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'quiz_categories';
            referencedColumns: ['id'];
          },
        ];
      };
      quiz_answers: {
        Row: {
          id: string;
          question_id: string;
          label: string;
          is_correct: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          question_id: string;
          label: string;
          is_correct?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          question_id?: string;
          label?: string;
          is_correct?: boolean;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'quiz_answers_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'quiz_questions';
            referencedColumns: ['id'];
          },
        ];
      };
      quiz_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          mode: QuizMode;
          category_id: string | null;
          started_at: string;
          finished_at: string | null;
          score: number | null;
          total: number | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          mode: QuizMode;
          category_id?: string | null;
          started_at?: string;
          finished_at?: string | null;
          score?: number | null;
          total?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          mode?: QuizMode;
          category_id?: string | null;
          started_at?: string;
          finished_at?: string | null;
          score?: number | null;
          total?: number | null;
        };
        Relationships: [];
      };
      quiz_session_answers: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          answer_id: string | null;
          is_correct: boolean;
          answered_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question_id: string;
          answer_id?: string | null;
          is_correct: boolean;
          answered_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          question_id?: string;
          answer_id?: string | null;
          is_correct?: boolean;
          answered_at?: string;
        };
        Relationships: [];
      };
      wot_maps: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string;
          width: number | null;
          height: number | null;
          size_m: number;
          width_m: number;
          height_m: number;
          kind: string;
          source: 'wg' | 'manual';
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          image_url: string;
          width?: number | null;
          height?: number | null;
          size_m?: number;
          width_m?: number;
          height_m?: number;
          kind?: string;
          source?: 'wg' | 'manual';
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          image_url?: string;
          width?: number | null;
          height?: number | null;
          size_m?: number;
          width_m?: number;
          height_m?: number;
          kind?: string;
          source?: 'wg' | 'manual';
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      geoguesser_shots: {
        Row: {
          id: string;
          map_id: string;
          image_url: string;
          x_pct: number;
          y_pct: number;
          difficulty: QuizDifficulty;
          caption: string | null;
          tags: string[];
          is_published: boolean;
          sort_order: number;
          attempt_count: number;
          correct_map_count: number;
          success_score_sum: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          map_id: string;
          image_url: string;
          x_pct: number;
          y_pct: number;
          difficulty?: QuizDifficulty;
          caption?: string | null;
          tags?: string[];
          is_published?: boolean;
          sort_order?: number;
          attempt_count?: number;
          correct_map_count?: number;
          success_score_sum?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          map_id?: string;
          image_url?: string;
          x_pct?: number;
          y_pct?: number;
          difficulty?: QuizDifficulty;
          caption?: string | null;
          tags?: string[];
          is_published?: boolean;
          sort_order?: number;
          attempt_count?: number;
          correct_map_count?: number;
          success_score_sum?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'geoguesser_shots_map_id_fkey';
            columns: ['map_id'];
            isOneToOne: false;
            referencedRelation: 'wot_maps';
            referencedColumns: ['id'];
          },
        ];
      };
      geoguesser_settings: {
        Row: {
          id: number;
          round_time_s: number;
          wrong_map_malus_m: number;
          timeout_malus_m: number;
          daily_challenge_rounds: number;
          random_rounds: number;
          sprint_rounds: number;
          sprint_round_time_s: number;
          sprint_time_penalty_m: number;
          blind_rounds: number;
          blind_preview_seconds: number;
          min_maps_daily: number;
          min_maps_random: number;
          min_maps_sprint: number;
          min_maps_blind: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          round_time_s?: number;
          wrong_map_malus_m?: number;
          timeout_malus_m?: number;
          daily_challenge_rounds?: number;
          random_rounds?: number;
          sprint_rounds?: number;
          sprint_round_time_s?: number;
          sprint_time_penalty_m?: number;
          blind_rounds?: number;
          blind_preview_seconds?: number;
          min_maps_daily?: number;
          min_maps_random?: number;
          min_maps_sprint?: number;
          min_maps_blind?: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          round_time_s?: number;
          wrong_map_malus_m?: number;
          timeout_malus_m?: number;
          daily_challenge_rounds?: number;
          random_rounds?: number;
          sprint_rounds?: number;
          sprint_round_time_s?: number;
          sprint_time_penalty_m?: number;
          blind_rounds?: number;
          blind_preview_seconds?: number;
          min_maps_daily?: number;
          min_maps_random?: number;
          min_maps_sprint?: number;
          min_maps_blind?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      module_scores: {
        Row: {
          id: string;
          module_slug: string;
          submode: string;
          player_anon_id: string;
          player_nickname: string;
          player_account_id: number | null;
          is_verified: boolean;
          score: number;
          max_score: number;
          meta: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_slug: string;
          submode?: string;
          player_anon_id: string;
          player_nickname: string;
          player_account_id?: number | null;
          is_verified?: boolean;
          score: number;
          max_score: number;
          meta?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_slug?: string;
          submode?: string;
          player_anon_id?: string;
          player_nickname?: string;
          player_account_id?: number | null;
          is_verified?: boolean;
          score?: number;
          max_score?: number;
          meta?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      list_users_with_roles: {
        Args: Record<string, never>;
        Returns: Array<{
          user_id: string;
          email: string;
          created_at: string;
          role: UserRole | null;
        }>;
      };
      current_user_role: {
        Args: Record<string, never>;
        Returns: UserRole | null;
      };
      import_members_to_players: {
        Args: {
          p_clan_tag?: string | null;
          p_clan_id?: number | null;
        };
        Returns: number;
      };
      count_pending_applications: {
        Args: Record<string, never>;
        Returns: number;
      };
      record_shot_attempt: {
        Args: {
          p_shot_id: string;
          p_correct_map: boolean;
          p_round_score: number;
          p_max_round_score: number;
        };
        Returns: void;
      };
      reset_geoguesser_shot_stats: {
        Args: {
          p_shot_id: string;
        };
        Returns: number;
      };
      reset_geoguesser_map_stats: {
        Args: {
          p_map_id: string;
        };
        Returns: number;
      };
      reset_geoguesser_all_stats: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

export type PlayerRow = Database['public']['Tables']['players']['Row'];
export type PlayerDiscordLinkRow =
  Database['public']['Tables']['player_discord_links']['Row'];
export type PlayerActivitySnapshotRow =
  Database['public']['Tables']['player_activity_snapshots']['Row'];
export type DiscordVoiceSessionRow =
  Database['public']['Tables']['discord_voice_sessions']['Row'];
export type PlayerStaffNoteRow =
  Database['public']['Tables']['player_staff_notes']['Row'];
export type PlayerStatusHistoryRow =
  Database['public']['Tables']['player_status_history']['Row'];
