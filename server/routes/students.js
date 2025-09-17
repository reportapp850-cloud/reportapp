import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get students for a specific course
router.get('/:dept/:year/:semester', authenticateToken, (req, res) => {
  const { dept, year, semester } = req.params;
  const userId = req.user.userId;
  
  db.all(
    'SELECT * FROM students WHERE user_id = ? AND department = ? AND year = ? AND semester = ? ORDER BY full_name',
    [userId, dept, year, semester],
    (err, students) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(students);
    }
  );
});

// Add new student
router.post('/', authenticateToken, (req, res) => {
  const {
    registrationNumber,
    fullName,
    department,
    year,
    semester,
    bloodGroup,
    phoneNumber,
    emailAddress,
    address
  } = req.body;
  
  const userId = req.user.userId;
  
  if (!registrationNumber || !fullName || !department || !year || !semester) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }
  
  db.run(
    `INSERT INTO students 
     (user_id, registration_number, full_name, department, year, semester, blood_group, phone_number, email_address, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, registrationNumber, fullName, department, year, semester, bloodGroup, phoneNumber, emailAddress, address],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Registration number already exists' });
        }
        return res.status(500).json({ error: 'Failed to add student' });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Student added successfully'
      });
    }
  );
});

// Update student
router.put('/:id', authenticateToken, (req, res) => {
  const studentId = req.params.id;
  const userId = req.user.userId;
  const {
    registrationNumber,
    fullName,
    department,
    year,
    semester,
    bloodGroup,
    phoneNumber,
    emailAddress,
    address
  } = req.body;
  
  db.run(
    `UPDATE students SET 
     registration_number = ?, full_name = ?, department = ?, year = ?, semester = ?,
     blood_group = ?, phone_number = ?, email_address = ?, address = ?
     WHERE id = ? AND user_id = ?`,
    [registrationNumber, fullName, department, year, semester, bloodGroup, phoneNumber, emailAddress, address, studentId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update student' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      res.json({ message: 'Student updated successfully' });
    }
  );
});

// Delete student
router.delete('/:id', authenticateToken, (req, res) => {
  const studentId = req.params.id;
  const userId = req.user.userId;
  
  db.run('DELETE FROM students WHERE id = ? AND user_id = ?', [studentId, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete student' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully' });
  });
});

export default router;