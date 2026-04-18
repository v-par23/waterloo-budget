export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      saved_spots: {
        Row: {
          id: string;
          user_id: string;
          spot_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          spot_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          spot_id?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          invite_code: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          invite_code?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: "owner" | "member";
          joined_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role?: "owner" | "member";
          joined_at?: string;
        };
        Update: {
          role?: "owner" | "member";
        };
      };
      team_spots: {
        Row: {
          id: string;
          team_id: string;
          spot_id: string;
          added_by: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          spot_id: string;
          added_by: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          note?: string | null;
        };
      };
    };
  };
};
