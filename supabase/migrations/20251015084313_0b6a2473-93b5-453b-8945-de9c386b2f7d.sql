-- Create enum for user roles
CREATE TYPE app_role AS ENUM ('worker', 'manager');

-- Create enum for hazard report status
CREATE TYPE hazard_status AS ENUM ('pending', 'in_progress', 'resolved');

-- Create enum for hazard severity
CREATE TYPE hazard_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  employee_id TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'worker',
  assigned_task TEXT,
  phone_number TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create safety checklist items table
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  task_category TEXT NOT NULL,
  item_text TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily checklist completions table
CREATE TABLE public.checklist_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checklist_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, checklist_date)
);

-- Create safety videos table
CREATE TABLE public.safety_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  duration INTEGER,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video interactions table (likes, views)
CREATE TABLE public.video_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.safety_videos(id) ON DELETE CASCADE,
  liked BOOLEAN DEFAULT FALSE,
  viewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Create hazard reports table
CREATE TABLE public.hazard_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity hazard_severity NOT NULL,
  status hazard_status NOT NULL DEFAULT 'pending',
  location_description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  photo_urls TEXT[],
  voice_note_url TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency SOS table
CREATE TABLE public.emergency_sos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES auth.users(id),
  response_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazard_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_sos ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Checklist items policies (read-only for workers, managers can manage)
CREATE POLICY "Anyone can view checklist items"
  ON public.checklist_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can insert checklist items"
  ON public.checklist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

-- Checklist completions policies
CREATE POLICY "Users can view own completions"
  ON public.checklist_completions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ));

CREATE POLICY "Users can insert own completions"
  ON public.checklist_completions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own completions"
  ON public.checklist_completions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Safety videos policies
CREATE POLICY "Anyone can view active videos"
  ON public.safety_videos FOR SELECT
  TO authenticated
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ));

CREATE POLICY "Managers can insert videos"
  ON public.safety_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Managers can update videos"
  ON public.safety_videos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

-- Video interactions policies
CREATE POLICY "Users can view own interactions"
  ON public.video_interactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own interactions"
  ON public.video_interactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own interactions"
  ON public.video_interactions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Hazard reports policies
CREATE POLICY "Workers can view own reports, managers can view all"
  ON public.hazard_reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ));

CREATE POLICY "Workers can insert own reports"
  ON public.hazard_reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers can update reports"
  ON public.hazard_reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

-- Emergency SOS policies
CREATE POLICY "Workers can view own SOS, managers can view all"
  ON public.emergency_sos FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ));

CREATE POLICY "Workers can insert own SOS"
  ON public.emergency_sos FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers can update SOS"
  ON public.emergency_sos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hazard_reports_updated_at
  BEFORE UPDATE ON public.hazard_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default checklist items for workers
INSERT INTO public.checklist_items (role, task_category, item_text, display_order) VALUES
('worker', 'Personal Protection', 'Wear hard hat and safety boots', 1),
('worker', 'Personal Protection', 'Check and wear safety goggles', 2),
('worker', 'Personal Protection', 'Verify breathing apparatus is functional', 3),
('worker', 'Equipment Check', 'Inspect drilling/mining equipment before use', 4),
('worker', 'Equipment Check', 'Verify emergency stop buttons are operational', 5),
('worker', 'Area Safety', 'Check ventilation systems in working area', 6),
('worker', 'Area Safety', 'Inspect area for loose rocks or unstable ground', 7),
('worker', 'Area Safety', 'Verify adequate lighting in work zone', 8),
('worker', 'Communication', 'Test communication device/radio', 9),
('worker', 'Communication', 'Confirm emergency exit routes', 10);

-- Insert sample safety videos
INSERT INTO public.safety_videos (title, description, video_url, category, duration, thumbnail_url) VALUES
('DGMS Safety Guidelines 2024', 'Latest safety protocols from DGMS for underground mining operations', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'DGMS Advisory', 300, '/placeholder.svg'),
('Proper PPE Usage in Coal Mines', 'Comprehensive guide on personal protective equipment usage', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Best Practices', 420, '/placeholder.svg'),
('Emergency Evacuation Procedures', 'Step-by-step emergency evacuation protocols', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Emergency Response', 360, '/placeholder.svg'),
('Hazard Identification Workshop', 'Learn to identify and report workplace hazards', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Training', 540, '/placeholder.svg');