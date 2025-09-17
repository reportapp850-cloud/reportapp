import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get attendance for specific course and date
router.get('/:dept/:year/:semester/:date', authenticateToken, (req, res) => {
  const { dept, year, semester, date } = req.params;
  const userId = req.user.userId;
  
  const query = `
    SELECT s.*, a.status, a.attendance_date
    FROM students s
    LEFT JOIN attendance a ON s.id = a.student_id AND a.attendance_date = ? AND a.user_id = ?
    WHERE s.user_id = ? AND s.department = ? AND s.year = ? AND s.semester = ?
    ORDER BY s.full_name
  `;
  
  db.all(query, [date, userId, userId, dept, year, semester], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

// Mark attendance for students
router.post('/', authenticateToken, (req, res) => {
  const { attendanceRecords } = req.body;
  const userId = req.user.userId;
  
  if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
    return res.status(400).json({ error: 'Invalid attendance data' });
  }
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    let completed = 0;
    let hasError = false;
    
    attendanceRecords.forEach(record => {
      const { studentId, date, status } = record;
      
      db.run(
        'INSERT OR REPLACE INTO attendance (user_id, student_id, attendance_date, status) VALUES (?, ?, ?, ?)',
        [userId, studentId, date, status],
        function(err) {
          completed++;
          
          if (err && !hasError) {
            hasError = true;
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Failed to save attendance' });
          }
          
          if (completed === attendanceRecords.length && !hasError) {
            db.run('COMMIT');
            res.json({ message: 'Attendance saved successfully' });
          }
        }
      );
    });
  });
});

// Get attendance statistics
router.get('/stats/:dept/:year/:semester', authenticateToken, (req, res) => {
  const { dept, year, semester } = req.params;
  const userId = req.user.userId;
  const today = new Date().toISOString().split('T')[0];
  
  const queries = {
    totalStudents: `
      SELECT COUNT(*) as count 
      FROM students 
      WHERE user_id = ? AND department = ? AND year = ? AND semester = ?
    `,
    presentToday: `
      SELECT COUNT(*) as count 
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.user_id = ? AND s.department = ? AND s.year = ? AND s.semester = ? 
      AND a.attendance_date = ? AND a.status = 'present'
    `,
    absentToday: `
      SELECT COUNT(*) as count 
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.user_id = ? AND s.department = ? AND s.year = ? AND s.semester = ? 
      AND a.attendance_date = ? AND a.status = 'absent'
    `
  };
  
  const stats = {};
  let completed = 0;
  
  // Get total students
  db.get(queries.totalStudents, [userId, dept, year, semester], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.totalStudents = result.count;
    if (++completed === 3) sendResponse();
  });
  
  // Get present today
  db.get(queries.presentToday, [userId, dept, year, semester, today], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.presentToday = result.count;
    if (++completed === 3) sendResponse();
  });
  
  // Get absent today
  db.get(queries.absentToday, [userId, dept, year, semester, today], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.absentToday = result.count;
    if (++completed === 3) sendResponse();
  });
  
  function sendResponse() {
    const attendanceRate = stats.totalStudents > 0 
      ? ((stats.presentToday / stats.totalStudents) * 100).toFixed(1)
      : 0;
    
    res.json({
      ...stats,
      attendanceRate: parseFloat(attendanceRate)
    });
  }
});

export default router;