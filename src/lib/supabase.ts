import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Student {
  id: string;
  user_id: string;
  registration_number: string;
  full_name: string;
  department: string;
  year: string;
  semester: string;
  blood_group?: string;
  phone_number?: string;
  email_address?: string;
  address?: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  student_id: string;
  attendance_date: string;
  status: 'present' | 'absent';
  created_at: string;
}

export interface StudentWithAttendance extends Student {
  status?: 'present' | 'absent';
  attendance_date?: string;
}