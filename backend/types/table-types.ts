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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      blog_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_activities_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          parent_id: string | null
          post_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blog_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          content: string
          created_at: string
          description: string
          hero_image_filename: string | null
          id: string
          is_admin_approved: boolean
          is_featured: boolean
          is_sponsored: boolean
          is_user_published: boolean
          like_count: number
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          title: string
          topic_id: string | null
          updated_at: string | null
          user_id: string | null
          view_count: number
        }
        Insert: {
          content: string
          created_at?: string
          description: string
          hero_image_filename?: string | null
          id?: string
          is_admin_approved?: boolean
          is_featured?: boolean
          is_sponsored?: boolean
          is_user_published?: boolean
          like_count?: number
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          title: string
          topic_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          view_count?: number
        }
        Update: {
          content?: string
          created_at?: string
          description?: string
          hero_image_filename?: string | null
          id?: string
          is_admin_approved?: boolean
          is_featured?: boolean
          is_sponsored?: boolean
          is_user_published?: boolean
          like_count?: number
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          title?: string
          topic_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "blog_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_topics: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_topics_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blog_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          description: string | null
          email: string | null
          feedback_type: string | null
          id: string
          is_handled: boolean | null
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          email?: string | null
          feedback_type?: string | null
          id?: string
          is_handled?: boolean | null
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string | null
          feedback_type?: string | null
          id?: string
          is_handled?: boolean | null
          url?: string | null
        }
        Relationships: []
      }
      integration_customers: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          additional_settings: string
          created_at: string
          custom_instance_details: string | null
          customer_id: string | null
          deleted_at: string | null
          disabled: boolean
          id: string
          in_between_steps: boolean
          internal_id: string
          name: string
          organization_id: string
          picture: string | null
          posting_times: string
          profile: string | null
          provider_identifier: string
          refresh_needed: boolean
          refresh_token: string | null
          root_internal_id: string | null
          token: string
          token_expiration: string | null
          type: string
          updated_at: string
        }
        Insert: {
          additional_settings?: string
          created_at?: string
          custom_instance_details?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          disabled?: boolean
          id?: string
          in_between_steps?: boolean
          internal_id: string
          name: string
          organization_id: string
          picture?: string | null
          posting_times?: string
          profile?: string | null
          provider_identifier: string
          refresh_needed?: boolean
          refresh_token?: string | null
          root_internal_id?: string | null
          token: string
          token_expiration?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          additional_settings?: string
          created_at?: string
          custom_instance_details?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          disabled?: boolean
          id?: string
          in_between_steps?: boolean
          internal_id?: string
          name?: string
          organization_id?: string
          picture?: string | null
          posting_times?: string
          profile?: string | null
          provider_identifier?: string
          refresh_needed?: boolean
          refresh_token?: string | null
          root_internal_id?: string | null
          token?: string
          token_expiration?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "integration_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          alt: string | null
          created_at: string
          deleted_at: string | null
          file_size: number
          id: string
          name: string
          organization_id: string
          original_name: string | null
          path: string
          thumbnail: string | null
          thumbnail_timestamp: number | null
          type: string
          updated_at: string
          virtual_path: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          deleted_at?: string | null
          file_size?: number
          id?: string
          name: string
          organization_id: string
          original_name?: string | null
          path: string
          thumbnail?: string | null
          thumbnail_timestamp?: number | null
          type?: string
          updated_at?: string
          virtual_path?: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          deleted_at?: string | null
          file_size?: number
          id?: string
          name?: string
          organization_id?: string
          original_name?: string | null
          path?: string
          thumbnail?: string | null
          thumbnail_timestamp?: number | null
          type?: string
          updated_at?: string
          virtual_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_virtual_folders: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          path: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          path: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          path?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_virtual_folders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      module_configs: {
        Row: {
          config: Json
          module_name: string
          updated_at: string
        }
        Insert: {
          config: Json
          module_name: string
          updated_at?: string
        }
        Update: {
          config?: Json
          module_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          link: string | null
          organization_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          link?: string | null
          organization_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          link?: string | null
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_apps: {
        Row: {
          client_id: string
          client_secret_hash: string
          created_at: string
          created_by_user_id: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          picture_id: string | null
          redirect_url: string
          updated_at: string
        }
        Insert: {
          client_id: string
          client_secret_hash: string
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          picture_id?: string | null
          redirect_url: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_secret_hash?: string
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          picture_id?: string | null
          redirect_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_apps_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_apps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_apps_picture_id_fkey"
            columns: ["picture_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_authorizations: {
        Row: {
          access_token_hash: string | null
          authorization_code_hash: string | null
          code_expires_at: string | null
          created_at: string
          id: string
          oauth_app_id: string
          organization_id: string
          revoked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_hash?: string | null
          authorization_code_hash?: string | null
          code_expires_at?: string | null
          created_at?: string
          id?: string
          oauth_app_id: string
          organization_id: string
          revoked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_hash?: string | null
          authorization_code_hash?: string | null
          code_expires_at?: string | null
          created_at?: string
          id?: string
          oauth_app_id?: string
          organization_id?: string
          revoked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_authorizations_oauth_app_id_fkey"
            columns: ["oauth_app_id"]
            isOneToOne: false
            referencedRelation: "oauth_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_authorizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_authorizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_user_id: string
          organization_id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by_user_id: string
          organization_id: string
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by_user_id?: string
          organization_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          cancel_at: string | null
          channels_per_workspace: number
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          deleted_at: string | null
          id: string
          identifier: string | null
          is_lifetime: boolean
          organization_id: string
          period: Database["public"]["Enums"]["subscription_period"]
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          cancel_at?: string | null
          channels_per_workspace?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          deleted_at?: string | null
          id?: string
          identifier?: string | null
          is_lifetime?: boolean
          organization_id: string
          period?: Database["public"]["Enums"]["subscription_period"]
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          cancel_at?: string | null
          channels_per_workspace?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          deleted_at?: string | null
          id?: string
          identifier?: string | null
          is_lifetime?: boolean
          organization_id?: string
          period?: Database["public"]["Enums"]["subscription_period"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          allow_trial: boolean
          created_at: string
          description: string | null
          id: string
          is_trialing: boolean
          name: string
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          allow_trial?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_trialing?: boolean
          name: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          allow_trial?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_trialing?: boolean
          name?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      plugs: {
        Row: {
          activated: boolean
          created_at: string
          data: string
          id: string
          integration_id: string
          organization_id: string
          plug_function: string
          updated_at: string
        }
        Insert: {
          activated?: boolean
          created_at?: string
          data?: string
          id?: string
          integration_id: string
          organization_id: string
          plug_function: string
          updated_at?: string
        }
        Update: {
          activated?: boolean
          created_at?: string
          data?: string
          id?: string
          integration_id?: string
          organization_id?: string
          plug_function?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plugs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      post_internal_comments: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          organization_id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          organization_id: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          organization_id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_internal_comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_internal_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_internal_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tag_assignments: {
        Row: {
          created_at: string
          post_id: string
          tag_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          post_id: string
          tag_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          post_id?: string
          tag_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tag_assignments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "post_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          color: string
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      post_thread_replies: {
        Row: {
          content: string
          created_at: string
          created_by_user_id: string | null
          delay_seconds: number
          deleted_at: string | null
          error: string | null
          id: string
          integration_id: string | null
          organization_id: string
          post_id: string
          release_id: string | null
          release_url: string | null
          state: Database["public"]["Enums"]["post_state"]
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by_user_id?: string | null
          delay_seconds?: number
          deleted_at?: string | null
          error?: string | null
          id?: string
          integration_id?: string | null
          organization_id: string
          post_id: string
          release_id?: string | null
          release_url?: string | null
          state?: Database["public"]["Enums"]["post_state"]
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by_user_id?: string | null
          delay_seconds?: number
          deleted_at?: string | null
          error?: string | null
          id?: string
          integration_id?: string | null
          organization_id?: string
          post_id?: string
          release_id?: string | null
          release_url?: string | null
          state?: Database["public"]["Enums"]["post_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_thread_replies_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_thread_replies_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_thread_replies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_thread_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          created_by_user_id: string | null
          delay: number
          deleted_at: string | null
          description: string | null
          error: string | null
          id: string
          image: string | null
          integration_id: string | null
          interval_in_days: number | null
          is_agent_edited: boolean
          is_reviewed: boolean
          note: string | null
          organization_id: string
          parent_post_id: string | null
          post_group: string
          publish_date: string
          release_id: string | null
          release_url: string | null
          settings: string | null
          state: Database["public"]["Enums"]["post_state"]
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          created_by_user_id?: string | null
          delay?: number
          deleted_at?: string | null
          description?: string | null
          error?: string | null
          id?: string
          image?: string | null
          integration_id?: string | null
          interval_in_days?: number | null
          is_agent_edited?: boolean
          is_reviewed?: boolean
          note?: string | null
          organization_id: string
          parent_post_id?: string | null
          post_group: string
          publish_date: string
          release_id?: string | null
          release_url?: string | null
          settings?: string | null
          state?: Database["public"]["Enums"]["post_state"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by_user_id?: string | null
          delay?: number
          deleted_at?: string | null
          description?: string | null
          error?: string | null
          id?: string
          image?: string | null
          integration_id?: string | null
          interval_in_days?: number | null
          is_agent_edited?: boolean
          is_reviewed?: boolean
          note?: string | null
          organization_id?: string
          parent_post_id?: string | null
          post_group?: string
          publish_date?: string
          release_id?: string | null
          release_url?: string | null
          settings?: string | null
          state?: Database["public"]["Enums"]["post_state"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          replaced_by: string | null
          revoked: boolean
          revoked_at: string | null
          token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          replaced_by?: string | null
          revoked?: boolean
          revoked_at?: string | null
          token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          replaced_by?: string | null
          revoked?: boolean
          revoked_at?: string | null
          token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      sets: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      signatures: {
        Row: {
          content: string
          created_at: string
          id: string
          is_default: boolean
          organization_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_default?: boolean
          organization_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_default?: boolean
          organization_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signatures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organizations: {
        Row: {
          created_at: string
          disabled: boolean
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["workspace_membership_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disabled?: boolean
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["workspace_membership_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          disabled?: boolean
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["workspace_membership_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          description: string | null
          facebook_url: string | null
          id: string
          location: string | null
          owner_id: string | null
          tag_line: string | null
          twitter_url: string | null
          updated_at: string
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          facebook_url?: string | null
          id?: string
          location?: string | null
          owner_id?: string | null
          tag_line?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          facebook_url?: string | null
          id?: string
          location?: string | null
          owner_id?: string | null
          tag_line?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          created_at: string
          email: string | null
          email_verification_token: string | null
          email_verification_token_expires: string | null
          full_name: string | null
          id: string
          is_email_verified: boolean | null
          is_super_admin: boolean | null
          last_read_notifications: string
          provider: string | null
          provider_id: string | null
          send_failure_emails: boolean
          send_success_emails: boolean
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          email?: string | null
          email_verification_token?: string | null
          email_verification_token_expires?: string | null
          full_name?: string | null
          id?: string
          is_email_verified?: boolean | null
          is_super_admin?: boolean | null
          last_read_notifications?: string
          provider?: string | null
          provider_id?: string | null
          send_failure_emails?: boolean
          send_success_emails?: boolean
          updated_at?: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          email?: string | null
          email_verification_token?: string | null
          email_verification_token_expires?: string | null
          full_name?: string | null
          id?: string
          is_email_verified?: boolean | null
          is_super_admin?: boolean | null
          last_read_notifications?: string
          provider?: string | null
          provider_id?: string | null
          send_failure_emails?: boolean
          send_success_emails?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_role: {
        Args: {
          assigned_by_user_id: string
          role_to_assign: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: string
      }
      generate_unique_slug: {
        Args: { table_name: string; title: string }
        Returns: string
      }
      get_active_blog_topics: {
        Args: never
        Returns: {
          description: string
          id: string
          name: string
          parent_id: string
          post_count: number
          slug: string
        }[]
      }
      get_published_blog_authors: {
        Args: never
        Returns: {
          avatar_url: string
          full_name: string
          id: string
          post_count: number
          tag_line: string
          username: string
          website: string
        }[]
      }
      get_user_permissions: {
        Args: { user_uuid: string }
        Returns: {
          permission: Database["public"]["Enums"]["app_permission"]
        }[]
      }
      has_role: {
        Args: {
          check_role: Database["public"]["Enums"]["app_role"]
          user_uuid: string
        }
        Returns: boolean
      }
      internal_create_organization_with_owner: {
        Args: {
          p_allow_trial?: boolean
          p_description: string
          p_is_trialing?: boolean
          p_name: string
          p_user_id: string
        }
        Returns: {
          created_at: string
          description: string
          id: string
          name: string
          updated_at: string
        }[]
      }
      internal_create_refresh_token: {
        Args: {
          p_expires_at: string
          p_id: string
          p_ip_address?: string
          p_token: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      internal_find_full_user_by_email: {
        Args: { p_email: string }
        Returns: {
          auth_id: string
          created_at: string
          email: string
          email_verification_token: string
          email_verification_token_expires: string
          full_name: string
          id: string
          is_email_verified: boolean
          provider: string
          provider_id: string
          updated_at: string
        }[]
      }
      internal_find_user_by_token_hash: {
        Args: { p_hashed_token: string }
        Returns: {
          auth_id: string
          created_at: string
          email: string
          email_verification_token: string
          email_verification_token_expires: string
          full_name: string
          id: string
          is_email_verified: boolean
          updated_at: string
        }[]
      }
      internal_find_user_id_by_auth_id: {
        Args: { p_auth_id: string }
        Returns: string
      }
      internal_get_integration_by_org_and_id: {
        Args: { p_integration_id: string; p_organization_id: string }
        Returns: {
          additional_settings: string
          created_at: string
          custom_instance_details: string | null
          customer_id: string | null
          deleted_at: string | null
          disabled: boolean
          id: string
          in_between_steps: boolean
          internal_id: string
          name: string
          organization_id: string
          picture: string | null
          posting_times: string
          profile: string | null
          provider_identifier: string
          refresh_needed: boolean
          refresh_token: string | null
          root_internal_id: string | null
          token: string
          token_expiration: string | null
          type: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "integrations"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      internal_get_org_member_counts: {
        Args: { p_org_ids: string[] }
        Returns: {
          member_count: number
          organization_id: string
        }[]
      }
      internal_get_org_team_members: {
        Args: { p_organization_id: string }
        Returns: {
          created_at: string
          disabled: boolean
          email: string
          full_name: string
          id: string
          organization_id: string
          role: string
          updated_at: string
          user_id: string
        }[]
      }
      internal_list_integrations_by_org: {
        Args: { p_organization_id: string }
        Returns: {
          additional_settings: string
          created_at: string
          customer_id: string
          customer_name: string
          disabled: boolean
          id: string
          in_between_steps: boolean
          internal_id: string
          name: string
          organization_id: string
          picture: string
          posting_times: string
          profile: string
          provider_identifier: string
          refresh_needed: boolean
          type: string
          updated_at: string
        }[]
      }
      internal_set_verification_token: {
        Args: { p_expires?: string; p_token?: string; p_user_id: string }
        Returns: number
      }
      internal_soft_delete_integration: {
        Args: {
          p_integration_id: string
          p_new_internal_id: string
          p_organization_id: string
        }
        Returns: boolean
      }
      internal_update_email_verification: {
        Args: { p_is_verified: boolean; p_user_id: string }
        Returns: undefined
      }
      internal_upsert_organization_subscription: {
        Args: {
          p_cancel_at: string
          p_channels_per_workspace: number
          p_current_period_end?: string
          p_current_period_start?: string
          p_identifier: string
          p_is_lifetime?: boolean
          p_is_trialing?: boolean
          p_organization_id: string
          p_period: Database["public"]["Enums"]["subscription_period"]
          p_subscription_tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Returns: {
          cancel_at: string
          channels_per_workspace: number
          created_at: string
          current_period_end: string
          current_period_start: string
          deleted_at: string
          id: string
          identifier: string
          is_lifetime: boolean
          organization_id: string
          period: Database["public"]["Enums"]["subscription_period"]
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }[]
      }
      internal_upsert_user_from_auth: {
        Args: {
          p_auth_id: string
          p_email: string
          p_full_name: string
          p_id: string
        }
        Returns: undefined
      }
      is_active_admin_or_owner_of_org: {
        Args: { p_auth_id: string; p_organization_id: string }
        Returns: boolean
      }
      is_active_member_of_org: {
        Args: { p_auth_id: string; p_organization_id: string }
        Returns: boolean
      }
      is_active_owner_of_org: {
        Args: { p_auth_id: string; p_organization_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { user_auth_id: string }; Returns: boolean }
      remove_user_role: {
        Args: {
          removed_by_user_id: string
          role_to_remove: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_permission: "users.manage_roles"
      app_role: "editor" | "support" | "admin"
      post_state: "QUEUE" | "PUBLISHED" | "ERROR" | "DRAFT"
      subscription_period: "MONTHLY" | "YEARLY"
      subscription_tier: "SOLO" | "TEAM" | "ULTIMATE" | "MAX"
      workspace_membership_role: "user" | "admin" | "owner"
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
      app_permission: ["users.manage_roles"],
      app_role: ["editor", "support", "admin"],
      post_state: ["QUEUE", "PUBLISHED", "ERROR", "DRAFT"],
      subscription_period: ["MONTHLY", "YEARLY"],
      subscription_tier: ["SOLO", "CREATOR", "TEAM", "ULTIMATE", "MAX"],
      workspace_membership_role: ["user", "admin", "owner"],
    },
  },
} as const
