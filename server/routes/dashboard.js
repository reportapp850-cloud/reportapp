import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics for a specific course
router.get('/:dept/:year/:semester', authenticateToken, (req, res) => {
  const { dept, year, semester } = req.params;
  const userId = req.user.userId;
  const today = new Date().toISOString().split('T')[0];
  
  const stats = {};
  let completed = 0;
  const totalQueries = 4;
  
  // Total students
  db.get(
    'SELECT COUNT(*) as count FROM students WHERE user_id = ? AND department = ? AND year = ? AND semester = ?',
    [userId, dept, year, semester],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.totalStudents = result.count;
      checkComplete();
    }
  );
  
  // Present today
  db.get(
    `SELECT COUNT(*) as count FROM attendance a
     JOIN students s ON a.student_id = s.id
     WHERE a.user_id = ? AND s.department = ? AND s.year = ? AND s.semester = ? 
     AND a.attendance_date = ? AND a.status = 'present'`,
    [userId, dept, year, semester, today],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.presentToday = result.count;
      checkComplete();
    }
  );
  
  // Absent today
  db.get(
    `SELECT COUNT(*) as count FROM attendance a
     JOIN students s ON a.student_id = s.id
     WHERE a.user_id = ? AND s.department = ? AND s.year = ? AND s.semester = ? 
     AND a.attendance_date = ? AND a.status = 'absent'`,
    [userId, dept, year, semester, today],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.absentToday = result.count;
      checkComplete();
    }
  );
  
  // Recent attendance trends (last 7 days)
  db.all(
    `SELECT DATE(a.attendance_date) as date, 
            COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
            COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent
     FROM attendance a
     JOIN students s ON a.student_id = s.id
     WHERE a.user_id = ? AND s.department = ? AND s.year = ? AND s.semester = ?
     AND a.attendance_date >= date('now', '-7 days')
     GROUP BY DATE(a.attendance_date)
     ORDER BY a.attendance_date DESC`,
    [userId, dept, year, semester],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.recentTrends = results;
      checkComplete();
    }
  );
  
  function checkComplete() {
    completed++;
    if (completed === totalQueries) {
      const attendanceRate = stats.totalStudents > 0 
        ? ((stats.presentToday / stats.totalStudents) * 100).toFixed(1)
        : 0;
      
      res.json({
        ...stats,
        attendanceRate: parseFloat(attendanceRate),
        course: { dept, year, semester }
      });
    }
  }
});

export default router;