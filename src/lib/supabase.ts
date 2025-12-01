import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Company = {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  company_id: string | null;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  company?: Company;
};

export type Deal = {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expected_close_date: string | null;
  company_id: string | null;
  contact_id: string | null;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  company?: Company;
  contact?: Contact;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  contact_id: string | null;
  company_id: string | null;
  deal_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description: string | null;
  activity_date: string;
  contact_id: string | null;
  company_id: string | null;
  deal_id: string | null;
  user_id: string;
  created_at: string;
};
