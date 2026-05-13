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
      activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          cancelled_reason: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          email: string
          id: string
          meeting_link: string | null
          meeting_provider: string | null
          meeting_status: string
          name: string
          notes: string | null
          phone: string | null
          preferred_date: string
          preferred_time: string
          recording_url: string | null
          rescheduled_from: string | null
          session_notes: string | null
          status: string
          topic: string | null
        }
        Insert: {
          cancelled_reason?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          email: string
          id?: string
          meeting_link?: string | null
          meeting_provider?: string | null
          meeting_status?: string
          name: string
          notes?: string | null
          phone?: string | null
          preferred_date: string
          preferred_time: string
          recording_url?: string | null
          rescheduled_from?: string | null
          session_notes?: string | null
          status?: string
          topic?: string | null
        }
        Update: {
          cancelled_reason?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          meeting_link?: string | null
          meeting_provider?: string | null
          meeting_status?: string
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_date?: string
          preferred_time?: string
          recording_url?: string | null
          rescheduled_from?: string | null
          session_notes?: string | null
          status?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string
          tags: string[] | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      cms_blog_posts: {
        Row: {
          content: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_portfolio: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          link: string | null
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          link?: string | null
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          link?: string | null
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_programs: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          features: string[] | null
          id: string
          price: string | null
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          features?: string[] | null
          id?: string
          price?: string | null
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          features?: string[] | null
          id?: string
          price?: string | null
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_services: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      cms_testimonials: {
        Row: {
          author: string
          avatar_url: string | null
          created_at: string
          display_order: number
          id: string
          published: boolean
          quote: string
          rating: number | null
          role: string | null
          updated_at: string
        }
        Insert: {
          author: string
          avatar_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          published?: boolean
          quote: string
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          author?: string
          avatar_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          published?: boolean
          quote?: string
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          body: string
          comment_count: number
          created_at: string
          id: string
          like_count: number
          pinned: boolean
          space_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          comment_count?: number
          created_at?: string
          id?: string
          like_count?: number
          pinned?: boolean
          space_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          comment_count?: number
          created_at?: string
          id?: string
          like_count?: number
          pinned?: boolean
          space_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "community_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      community_spaces: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          name: string
          slug: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name: string
          slug: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_spaces_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          id: string
          payment_id: string | null
          redeemed_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          id?: string
          payment_id?: string | null
          redeemed_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          id?: string
          payment_id?: string | null
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          course_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          kind: string
          max_uses: number | null
          used_count: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          course_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          kind?: string
          max_uses?: number | null
          used_count?: number
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          course_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          kind?: string
          max_uses?: number | null
          used_count?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_faqs: {
        Row: {
          answer: string
          course_id: string
          created_at: string
          display_order: number
          id: string
          question: string
        }
        Insert: {
          answer: string
          course_id: string
          created_at?: string
          display_order?: number
          id?: string
          question: string
        }
        Update: {
          answer?: string
          course_id?: string
          created_at?: string
          display_order?: number
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_faqs_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          duration_seconds: number
          id: string
          is_preview: boolean
          module_id: string
          title: string
          youtube_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          duration_seconds?: number
          id?: string
          is_preview?: boolean
          module_id: string
          title: string
          youtube_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          duration_seconds?: number
          id?: string
          is_preview?: boolean
          module_id?: string
          title?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          display_order: number
          id: string
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          display_order?: number
          id?: string
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          display_order?: number
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_testimonials: {
        Row: {
          author: string
          avatar_url: string | null
          course_id: string
          created_at: string
          display_order: number
          id: string
          quote: string
          rating: number
          role: string | null
        }
        Insert: {
          author: string
          avatar_url?: string | null
          course_id: string
          created_at?: string
          display_order?: number
          id?: string
          quote: string
          rating?: number
          role?: string | null
        }
        Update: {
          author?: string
          avatar_url?: string | null
          course_id?: string
          created_at?: string
          display_order?: number
          id?: string
          quote?: string
          rating?: number
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_testimonials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_views: {
        Row: {
          course_id: string
          id: string
          referrer: string | null
          session_id: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          course_id: string
          id?: string
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          course_id?: string
          id?: string
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_views_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          currency: string
          description: string | null
          discount_price: number | null
          display_order: number
          duration_minutes: number
          id: string
          instructor_avatar_url: string | null
          instructor_bio: string | null
          instructor_id: string | null
          instructor_name: string | null
          language: string
          learn_outcomes: string[]
          level: string
          long_description: string | null
          offer_ends_at: string | null
          payment_methods_enabled: Json
          price: number
          promo_video_url: string | null
          published: boolean
          requirements: string[]
          slug: string
          tagline: string | null
          title: string
          updated_at: string
          who_for: string[]
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          discount_price?: number | null
          display_order?: number
          duration_minutes?: number
          id?: string
          instructor_avatar_url?: string | null
          instructor_bio?: string | null
          instructor_id?: string | null
          instructor_name?: string | null
          language?: string
          learn_outcomes?: string[]
          level?: string
          long_description?: string | null
          offer_ends_at?: string | null
          payment_methods_enabled?: Json
          price?: number
          promo_video_url?: string | null
          published?: boolean
          requirements?: string[]
          slug: string
          tagline?: string | null
          title: string
          updated_at?: string
          who_for?: string[]
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          discount_price?: number | null
          display_order?: number
          duration_minutes?: number
          id?: string
          instructor_avatar_url?: string | null
          instructor_bio?: string | null
          instructor_id?: string | null
          instructor_name?: string | null
          language?: string
          learn_outcomes?: string[]
          level?: string
          long_description?: string | null
          offer_ends_at?: string | null
          payment_methods_enabled?: Json
          price?: number
          promo_video_url?: string | null
          published?: boolean
          requirements?: string[]
          slug?: string
          tagline?: string | null
          title?: string
          updated_at?: string
          who_for?: string[]
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          note: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id: string
          note: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          client_id: string | null
          created_at: string
          email: string | null
          id: string
          interest: string | null
          message: string | null
          name: string
          phone: string | null
          source: string
          status: string
          tags: string[] | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          interest?: string | null
          message?: string | null
          name: string
          phone?: string | null
          source?: string
          status?: string
          tags?: string[] | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          interest?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          source?: string
          status?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          enrollment_id: string
          id: string
          last_watched_at: string
          lesson_id: string
          watched_seconds: number
        }
        Insert: {
          completed_at?: string | null
          enrollment_id: string
          id?: string
          last_watched_at?: string
          lesson_id: string
          watched_seconds?: number
        }
        Update: {
          completed_at?: string | null
          enrollment_id?: string
          id?: string
          last_watched_at?: string
          lesson_id?: string
          watched_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          client_id: string | null
          coupon_id: string | null
          course_id: string | null
          created_at: string
          currency: string
          gateway: string
          gateway_payload: Json | null
          gateway_ref: string | null
          id: string
          method: string
          notes: string | null
          paid_at: string | null
          screenshot_path: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          booking_id?: string | null
          client_id?: string | null
          coupon_id?: string | null
          course_id?: string | null
          created_at?: string
          currency?: string
          gateway?: string
          gateway_payload?: Json | null
          gateway_ref?: string | null
          id?: string
          method?: string
          notes?: string | null
          paid_at?: string | null
          screenshot_path?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          client_id?: string | null
          coupon_id?: string | null
          course_id?: string | null
          created_at?: string
          currency?: string
          gateway?: string
          gateway_payload?: Json | null
          gateway_ref?: string | null
          id?: string
          method?: string
          notes?: string | null
          paid_at?: string | null
          screenshot_path?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          onboarded: boolean
          phone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          onboarded?: boolean
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarded?: boolean
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          tag: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          tag?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          tag?: string | null
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_enrolled: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
      notify_admins: {
        Args: { _body: string; _link: string; _title: string; _type: string }
        Returns: undefined
      }
      validate_coupon: {
        Args: { _code: string; _course_id: string }
        Returns: {
          id: string
          kind: string
          reason: string
          valid: boolean
          value: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "student" | "client"
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
      app_role: ["admin", "student", "client"],
    },
  },
} as const
