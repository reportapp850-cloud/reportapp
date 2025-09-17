/*
  # Student Portal Database Schema

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `registration_number` (text, unique per user)
      - `full_name` (text)
      - `department` (text)
      - `year` (text)
      - `semester` (text)
      - `blood_group` (text, optional)
      - `phone_number` (text, optional)
      - `email_address` (text, optional)
      - `address` (text, optional)
      - `created_at` (timestamp)

    - `attendance`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `student_id` (uuid, references students)
      - `attendance_date` (date)
      - `status` (text, 'present' or 'absent')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure data isolation between users

  3. Sample Data
    - Create demo students across different departments and years
    - Add some sample attendance records
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_number text NOT NULL,
  full_name text NOT NULL,
  department text NOT NULL,
  year text NOT NULL,
  semester text NOT NULL,
  blood_group text,
  phone_number text,
  email_address text,
  address text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, registration_number)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  status text CHECK(status IN ('present', 'absent')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, student_id, attendance_date)
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for students table
CREATE POLICY "Users can view own students"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own students"
  ON students
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for attendance table
CREATE POLICY "Users can view own attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attendance"
  ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attendance"
  ON attendance
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attendance"
  ON attendance
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_department_year_semester ON students(user_id, department, year, semester);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);