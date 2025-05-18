-- Create tables for the task management app

-- Users table (will be managed by Supabase Auth, but we'll create a shadow table for additional data)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS) for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own data" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT NOT NULL,
  category TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL
);

-- Set up Row Level Security (RLS) for tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id);

-- Reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  priority TEXT NOT NULL,
  category TEXT NOT NULL,
  recurrence JSONB,
  original_id TEXT,
  user_id UUID REFERENCES public.users(id) NOT NULL
);

-- Set up Row Level Security (RLS) for reminders table
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own reminders" ON public.reminders
  FOR ALL USING (auth.uid() = user_id);

-- Function to create a user record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
