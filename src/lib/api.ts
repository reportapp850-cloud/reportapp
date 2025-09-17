import { authService } from './auth.js';

const API_BASE = 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers = await authService.getAuthHeaders();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Request failed');
  }

  return data;
}

export const api = {
  // Courses
  async getCourses() {
    return apiRequest('/courses');
  },

  // Students
  async getStudents(dept: string, year: string, semester: string) {
    return apiRequest(`/students/${dept}/${year}/${semester}`);
  },

  async addStudent(studentData: any) {
    return apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  },

  async updateStudent(id: number, studentData: any) {
    return apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  },

  async deleteStudent(id: number) {
    return apiRequest(`/students/${id}`, {
      method: 'DELETE'
    });
  },

  // Attendance
  async getAttendance(dept: string, year: string, semester: string, date: string) {
    return apiRequest(`/attendance/${dept}/${year}/${semester}/${date}`);
  },

  async markAttendance(attendanceRecords: any[]) {
    return apiRequest('/attendance', {
      method: 'POST',
      body: JSON.stringify({ attendanceRecords })
    });
  },

  async getAttendanceStats(dept: string, year: string, semester: string) {
    return apiRequest(`/attendance/stats/${dept}/${year}/${semester}`);
  },

  // Dashboard
  async getDashboardStats(dept: string, year: string, semester: string) {
    return apiRequest(`/dashboard/${dept}/${year}/${semester}`);
  }
};

export { ApiError };