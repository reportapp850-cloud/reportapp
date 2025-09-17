import { supabase } from './supabase.js';
import type { Student, AttendanceRecord, StudentWithAttendance } from './supabase.js';

export const api = {
  // Courses
  async getCourses() {
    return {
      departments: ['CIVIL', 'CSE', 'EEE', 'ECE', 'IT', 'MECH'],
      years: ['Year I', 'Year II', 'Year III', 'Year IV'],
      semesters: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8']
    };
  },

  // Students
  async getStudents(dept: string, year: string, semester: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', user.id)
      .eq('department', dept)
      .eq('year', year)
      .eq('semester', semester)
      .order('full_name');

    if (error) throw new Error(error.message);
    return data;
  },

  async addStudent(studentData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('students')
      .insert([{ ...studentData, user_id: user.id }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateStudent(id: number, studentData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('students')
      .update(studentData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteStudent(id: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);
    return { message: 'Student deleted successfully' };
  },

  // Attendance
  async getAttendance(dept: string, year: string, semester: string, date: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        attendance!left(status, attendance_date)
      `)
      .eq('user_id', user.id)
      .eq('department', dept)
      .eq('year', year)
      .eq('semester', semester)
      .order('full_name');

    if (error) throw new Error(error.message);

    // Process the data to match the expected format
    return data.map((student: any) => {
      const attendanceRecord = student.attendance.find((a: any) => a.attendance_date === date);
      return {
        ...student,
        status: attendanceRecord?.status || null,
        attendance_date: attendanceRecord?.attendance_date || null
      };
    });
  },

  async markAttendance(attendanceRecords: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const records = attendanceRecords.map(record => ({
      ...record,
      user_id: user.id
    }));

    const { error } = await supabase
      .from('attendance')
      .upsert(records, { 
        onConflict: 'user_id,student_id,attendance_date',
        ignoreDuplicates: false 
      });

    if (error) throw new Error(error.message);
    return { message: 'Attendance saved successfully' };
  },

  async getAttendanceStats(dept: string, year: string, semester: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const today = new Date().toISOString().split('T')[0];

    // Get total students
    const { count: totalStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('department', dept)
      .eq('year', year)
      .eq('semester', semester);

    // Get today's attendance
    const { data: todayAttendance } = await supabase
      .from('attendance')
      .select('status, students!inner(*)')
      .eq('user_id', user.id)
      .eq('attendance_date', today)
      .eq('students.department', dept)
      .eq('students.year', year)
      .eq('students.semester', semester);

    const presentToday = todayAttendance?.filter(a => a.status === 'present').length || 0;
    const absentToday = todayAttendance?.filter(a => a.status === 'absent').length || 0;
    const attendanceRate = totalStudents ? ((presentToday / totalStudents) * 100) : 0;

    return {
      totalStudents: totalStudents || 0,
      presentToday,
      absentToday,
      attendanceRate: parseFloat(attendanceRate.toFixed(1))
    };
  },

  // Dashboard
  async getDashboardStats(dept: string, year: string, semester: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get total students
    const { count: totalStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('department', dept)
      .eq('year', year)
      .eq('semester', semester);

    // Get today's attendance
    const { data: todayAttendance } = await supabase
      .from('attendance')
      .select('status, students!inner(*)')
      .eq('user_id', user.id)
      .eq('attendance_date', today)
      .eq('students.department', dept)
      .eq('students.year', year)
      .eq('students.semester', semester);

    // Get recent trends
    const { data: recentTrends } = await supabase
      .from('attendance')
      .select('attendance_date, status, students!inner(*)')
      .eq('user_id', user.id)
      .eq('students.department', dept)
      .eq('students.year', year)
      .eq('students.semester', semester)
      .gte('attendance_date', sevenDaysAgo)
      .order('attendance_date', { ascending: false });

    const presentToday = todayAttendance?.filter(a => a.status === 'present').length || 0;
    const absentToday = todayAttendance?.filter(a => a.status === 'absent').length || 0;
    const attendanceRate = totalStudents ? ((presentToday / totalStudents) * 100) : 0;

    // Process trends data
    const trendsMap = new Map();
    recentTrends?.forEach(record => {
      const date = record.attendance_date;
      if (!trendsMap.has(date)) {
        trendsMap.set(date, { date, present: 0, absent: 0 });
      }
      const trend = trendsMap.get(date);
      if (record.status === 'present') {
        trend.present++;
      } else {
        trend.absent++;
      }
    });

    return {
      totalStudents: totalStudents || 0,
      presentToday,
      absentToday,
      attendanceRate: parseFloat(attendanceRate.toFixed(1)),
      recentTrends: Array.from(trendsMap.values()),
      course: { dept, year, semester }
    };
  }
}