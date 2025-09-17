import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get available departments, years, and semesters
router.get('/', authenticateToken, (req, res) => {
  const courses = {
    departments: ['CIVIL', 'CSE', 'EEE', 'ECE', 'IT', 'MECH'],
    years: ['Year I', 'Year II', 'Year III', 'Year IV'],
    semesters: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8']
  };
  
  res.json(courses);
});

export default router;