export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          completed: boolean
          created_at: string
          due_date: string | null
          priority: string
          category: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          completed?: boolean
          created_at?: string
          due_date?: string | null
          priority: string
          category: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          completed?: boolean
          created_at?: string
          due_date?: string | null
          priority?: string
          category?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          id: string
          title: string
          description: string | null
          datetime: string
          completed: boolean
          priority: string
          category: string
          user_id: string
          recurrence: Json | null
          original_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          datetime: string
          completed?: boolean
          priority: string
          category: string
          user_id: string
          recurrence?: Json | null
          original_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          datetime?: string
          completed?: boolean
          priority?: string
          category?: string
          user_id?: string
          recurrence?: Json | null
          original_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
