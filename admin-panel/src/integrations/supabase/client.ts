import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://szewwlytasszwcnnhfhb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZXd3bHl0YXNzendjbm5oZmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzI0MzksImV4cCI6MjA2NDAwODQzOX0.85fxj6k27k0zl8Mmpns6lIRwK76YwaVrmo3-Lh8LGhw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)