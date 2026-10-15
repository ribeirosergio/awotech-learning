export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json | undefined };

export type UserAccess = {
  id: string;
  user_id: string;
  product_id: string;
  access_type: 'manual' | 'purchase' | 'subscription';
  starts_at: string;
  expires_at: string | null;
  created_at: string;
};

export type LessonProgress = {
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      user_access: {
        Row: UserAccess;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: Pick<
          LessonProgress,
          'user_id' | 'course_id' | 'lesson_id' | 'completed'
        >;
        Update: Pick<LessonProgress, 'completed'>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_access: { Args: Record<string, never>; Returns: Json };
      has_course_access: {
        Args: { requested_course_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
