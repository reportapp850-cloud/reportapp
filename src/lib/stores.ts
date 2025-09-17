import { writable } from 'svelte/store';

interface CourseSelection {
  department: string;
  year: string;
  semester: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const selectedCourse = writable<CourseSelection | null>(null);
export const toasts = writable<Toast[]>([]);

// Toast management
let toastId = 0;

export const addToast = (message: string, type: Toast['type'] = 'info', duration = 5000) => {
  const id = `toast-${++toastId}`;
  const toast: Toast = { id, message, type, duration };
  
  toasts.update(existing => [...existing, toast]);
  
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
  
  return id;
};

export const removeToast = (id: string) => {
  toasts.update(existing => existing.filter(toast => toast.id !== id));
};

// Course selection management
export const setCourse = (course: CourseSelection) => {
  selectedCourse.set(course);
  localStorage.setItem('selectedCourse', JSON.stringify(course));
};

export const clearCourse = () => {
  selectedCourse.set(null);
  localStorage.removeItem('selectedCourse');
};

// Initialize course from localStorage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('selectedCourse');
  if (saved) {
    try {
      selectedCourse.set(JSON.parse(saved));
    } catch (e) {
      localStorage.removeItem('selectedCourse');
    }
  }
}