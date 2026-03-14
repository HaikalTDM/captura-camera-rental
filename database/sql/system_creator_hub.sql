CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT DEFAULT 'Story',
    image_url TEXT,
    related_camera_id VARCHAR(255),
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (prevents errors on re-run)
DROP POLICY IF EXISTS "Public articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Admins have full access to articles" ON articles;

-- Create Policies
CREATE POLICY "Public articles are viewable by everyone" 
ON articles FOR SELECT 
USING (published = true);

CREATE POLICY "Admins have full access to articles" 
ON articles FOR ALL 
USING (auth.uid() IN (SELECT id FROM auth.users));

-- Insert a placeholder article
INSERT INTO articles (title, slug, content, excerpt, category, image_url, published) 
VALUES (
    '5 Settings You Must Change on the Canon R50',
    'canon-r50-best-settings',
    '# The Canon R50 is a powerhouse

But only if you set it up correctly out of the box. Here are the 5 settings you absolutely must change before your first shoot.

1. **Turn on C-Log 3** for maximum dynamic range.
2. **Enable Eye Autofocus** tracking.
3. **Map the * button** to ISO.
4. **Set your custom white balance**.
5. **Turn off continuous AF** to save battery life.

Rent this exact camera setup from Captura below!',
    'Maximize the dynamic range and battery life of your Canon R50 with these 5 hidden settings.',
    'Technique',
    '/images/R50.png',
    true
)
ON CONFLICT (slug) DO NOTHING;
