-- Insert initial admin user (you should change the email and password)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  role
) VALUES (
  gen_random_uuid(),
  'admin@wsp.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample videos
INSERT INTO videos (
  title,
  description,
  url,
  platform,
  category,
  thumbnail_url
) VALUES 
(
  'Introdução ao WSP',
  'Aprenda os fundamentos do WSP Platform',
  'https://www.youtube.com/watch?v=example1',
  'youtube',
  'Fundamentos',
  'https://storage.googleapis.com/wisersp/storage/wsp-banners/flavio-live.png'
),
(
  'Técnicas Avançadas de Vendas',
  'Aprenda técnicas avançadas para melhorar suas vendas',
  'https://www.youtube.com/watch?v=example2',
  'youtube',
  'Vendas',
  'https://storage.googleapis.com/wisersp/storage/wsp-banners/vendas.png'
);

-- Insert sample questions
INSERT INTO questions (
  user_id,
  title,
  description,
  category,
  status
) 
SELECT 
  u.id,
  'Como começar com WSP?',
  'Gostaria de saber por onde começar os estudos na plataforma.',
  'Fundamentos',
  'pending'
FROM auth.users u
WHERE u.email = 'admin@wsp.com'
LIMIT 1; 