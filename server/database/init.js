import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'student_portal.db');
const db = new sqlite3.Database(dbPath);

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          full_name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Students table with user isolation
      db.run(`
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          registration_number TEXT NOT NULL,
          full_name TEXT NOT NULL,
          department TEXT NOT NULL,
          year TEXT NOT NULL,
          semester TEXT NOT NULL,
          blood_group TEXT,
          phone_number TEXT,
          email_address TEXT,
          address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          UNIQUE(user_id, registration_number)
        )
      `);

      // Attendance table
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          attendance_date DATE NOT NULL,
          status TEXT CHECK(status IN ('present', 'absent')) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (student_id) REFERENCES students (id),
          UNIQUE(user_id, student_id, attendance_date)
        )
      `);

      // Insert sample data
      insertSampleData();
      
      resolve();
    });
  });
};

const insertSampleData = () => {
  // Create a demo user
  const demoPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password: "password"
  
  db.get('SELECT id FROM users WHERE email = ?', ['demo@student.com'], (err, row) => {
    if (!row) {
      db.run(
        'INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)',
        ['demo@student.com', demoPassword, 'Demo User'],
        function(err) {
          if (!err) {
            insertDemoStudents(this.lastID);
          }
        }
      );
    }
  });
};

const insertDemoStudents = (userId) => {
  const departments = ['CSE', 'EEE', 'CIVIL', 'MECH', 'ECE', 'IT'];
  const years = ['Year I', 'Year II', 'Year III', 'Year IV'];
  const semesters = ['Semester 1', 'Semester 2'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const sampleNames = [
    'Aarav Kumar', 'Vivaan Singh', 'Aditya Sharma', 'Vihaan Gupta', 'Arjun Patel',
    'Sai Reddy', 'Reyansh Agarwal', 'Ayaan Khan', 'Krishna Yadav', 'Ishaan Verma',
    'Ananya Iyer', 'Diya Joshi', 'Priya Mehta', 'Riya Shah', 'Kavya Nair',
    'Aadhya Pillai', 'Myra Kapoor', 'Sara Ali', 'Zara Ahmed', 'Kiara Malhotra'
  ];

  let studentCount = 1;
  
  departments.forEach(dept => {
    years.forEach(year => {
      semesters.forEach(semester => {
        // Add 3-5 students per department/year/semester combination
        const studentsToAdd = Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < studentsToAdd; i++) {
          const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
          const regNumber = `${dept}${year.slice(-1)}${semester.slice(-1)}${String(studentCount).padStart(3, '0')}`;
          const bloodGroup = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
          const phone = `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`;
          const email = `${name.toLowerCase().replace(' ', '.')}@student.edu`;
          
          db.run(`
            INSERT OR IGNORE INTO students 
            (user_id, registration_number, full_name, department, year, semester, blood_group, phone_number, email_address, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            userId, regNumber, name, dept, year, semester, bloodGroup, phone, email, 
            `${Math.floor(Math.random() * 999) + 1}, Sample Street, City, State - ${Math.floor(Math.random() * 900000) + 100000}`
          ]);
          
          studentCount++;
        }
      });
    });
  });
};

export { db };