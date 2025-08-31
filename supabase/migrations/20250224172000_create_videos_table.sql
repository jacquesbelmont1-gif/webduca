-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  platform text NOT NULL,
  thumbnail_url text,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  question_id uuid REFERENCES questions(id),

  CONSTRAINT platform_check CHECK (platform IN ('youtube', 'vimeo', 'loom'))
);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Policies for videos table
CREATE POLICY "Anyone can read videos"
  ON videos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage videos"
  ON videos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- Create view for videos with related questions
CREATE OR REPLACE VIEW videos_with_questions AS
SELECT 
  v.*,
  q.title as question_title,
  q.description as question_description
FROM videos v
LEFT JOIN questions q ON v.question_id = q.id; 