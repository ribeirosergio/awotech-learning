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
      profiles: {
        Row: import('./student-profile').StudentProfile;
        Insert: Partial<import('./student-profile').ProfileData> & {
          user_id: string;
        };
        Update: Partial<import('./student-profile').ProfileData>;
        Relationships: [];
      };
      lesson_evidence: {
        Row: import('@awotech/course-engine').LessonEvidence;
        Insert: never;
        Update: never;
        Relationships: [];
      };
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
      save_lesson_evidence: {
        Args: {
          p_user_id: string;
          p_course_id: string;
          p_lesson_id: string;
          p_video_id: string;
          p_duration: number;
          p_ranges: Json;
          p_activities: string[];
        };
        Returns: import('@awotech/course-engine').LessonEvidence;
      };
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
