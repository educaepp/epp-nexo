import { createClient } from '@supabase/supabase-js';

// Substitua pelas chaves gratuitas do seu projeto no Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sua-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sua-chave-anon';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
