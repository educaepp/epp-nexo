import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dlmhwpghveymcpzccjtm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_e6PONC1UfUk_fRYbfJ1Lvg_1qP6leEp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
