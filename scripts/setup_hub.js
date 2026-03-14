const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mqpzbzkdtfebzcfoqgta.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHpiemtkdGZlYnpjZm9xZ3RhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMxMjg0NCwiZXhwIjoyMDczODg4ODQ0fQ.9roplYWs3emoy3VsSHDtiTEN6ZrhRAWC4TfjAfkLp4E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupHub() {
  console.log('🔄 Creating Creator Hub tables...');
  
  const createArticlesSQL = `
    CREATE TABLE IF NOT EXISTS articles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      category TEXT DEFAULT 'Story',
      image_url TEXT,
      related_camera_id UUID REFERENCES cameras(id),
      published BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const setupRLS = `
    ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Public articles are viewable by everyone" ON articles;
    CREATE POLICY "Public articles are viewable by everyone" 
      ON articles FOR SELECT 
      USING (published = true);

    DROP POLICY IF EXISTS "Admins have full access to articles" ON articles;
    CREATE POLICY "Admins have full access to articles" 
      ON articles FOR ALL 
      USING (auth.role() = 'authenticated');
  `;
  
  try {
    console.log('🏗️ Creating articles table...');
    const { error: err1 } = await supabase.rpc('exec_sql', { sql_query: createArticlesSQL });
    if (err1) {
       console.error('❌ Error executing sql using RPC:', err1);
       return;
    } 

    console.log('🔒 Setting up RLS...');
    const { error: err2 } = await supabase.rpc('exec_sql', { sql_query: setupRLS });
    if (err2) {
       console.error('❌ Error setting up RLS:', err2);
       return;
    }

    console.log('📝 Seeding first placeholder article...');
    const { error: err3 } = await supabase.from('articles').upsert([
      {
        title: '5 Settings You Must Change on the Canon R50',
        slug: 'canon-r50-best-settings',
        content: '# The Canon R50 is a powerhouse\\n\\nBut only if you set it up correctly out of the box. Here are the 5 settings you absolutely must change before your first shoot.\\n\\n1. **Turn on C-Log 3** for maximum dynamic range.\\n2. **Enable Eye Autofocus** tracking.\\n3. **Map the * button** to ISO.\\n4. **Set your custom white balance**.\\n5. **Turn off continuous AF** to save battery life.\\n\\nRent this exact camera setup from Captura below!',
        excerpt: 'Maximize the dynamic range and battery life of your Canon R50 with these 5 hidden settings.',
        category: 'Technique',
        image_url: '/images/R50.png',
        published: true
      }
    ]);
    
    if (err3) {
      console.error('❌ Error seeding article:', err3);
    } else {
      console.log('✅ Creator Hub tables created and seeded successfully!');
    }

  } catch (err) {
    console.error('Execution error:', err);
  }
}

setupHub();
