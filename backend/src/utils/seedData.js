const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { sequelize, User, Complaint } = require('../models');

const seedData = async () => {
  try {
    // Sync database (force: true drops and recreates all tables)
    await sequelize.sync({ force: true });
    console.log('Database synced (tables recreated)');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });

    const hod = await User.create({
      name: 'Dr. Sharma',
      email: 'hod@college.edu',
      password: 'hod123',
      role: 'hod',
      department: 'CSE',
      isVerified: true
    });

    const faculty = await User.create({
      name: 'Prof. Kumar',
      email: 'faculty@college.edu',
      password: 'faculty123',
      role: 'faculty',
      department: 'CSE',
      isVerified: true
    });

    const student = await User.create({
      name: 'Rahul Student',
      email: 'student@college.edu',
      password: 'student123',
      role: 'student',
      department: 'CSE',
      isVerified: true
    });

    // Create sample complaints
    await Complaint.create({
      title: 'Projector not working in Room 301',
      description: 'The projector in lecture hall 301 has not been working for the past week. This is affecting our classes badly.',
      category: 'infrastructure',
      priority: 'high',
      status: 'submitted',
      studentId: student.id,
      assignedToId: faculty.id,
      timeline: [{ status: 'submitted', message: 'Complaint submitted', changedBy: student.id, timestamp: new Date() }]
    });

    await Complaint.create({
      title: 'Exam marks not updated on portal',
      description: 'The midterm examination marks for Data Structures have not been updated on the student portal even after 2 weeks.',
      category: 'examination',
      priority: 'medium',
      status: 'in_progress',
      studentId: student.id,
      assignedToId: faculty.id,
      timeline: [
        { status: 'submitted', message: 'Complaint submitted', changedBy: student.id, timestamp: new Date(Date.now() - 86400000) },
        { status: 'in_progress', message: 'Looking into it', changedBy: faculty.id, timestamp: new Date() }
      ]
    });

    await Complaint.create({
      title: 'Hostel water supply issue',
      description: 'There has been no water supply in Block C of the boys hostel for the last 3 days. Please resolve urgently.',
      category: 'hostel',
      priority: 'urgent',
      status: 'escalated',
      studentId: student.id,
      assignedToId: faculty.id,
      escalationLevel: 1,
      timeline: [
        { status: 'submitted', message: 'Complaint submitted', changedBy: student.id, timestamp: new Date(Date.now() - 172800000) },
        { status: 'escalated', message: 'Escalated to HOD', changedBy: faculty.id, timestamp: new Date() }
      ]
    });

    await Complaint.create({
      title: 'Library hours too short',
      description: 'The library closes at 6 PM which is too early. Students need it open until at least 10 PM during exam season.',
      category: 'library',
      priority: 'low',
      status: 'resolved',
      studentId: student.id,
      assignedToId: faculty.id,
      resolution: { text: 'Library hours extended to 9 PM', resolvedBy: faculty.id, resolvedAt: new Date() },
      timeline: [
        { status: 'submitted', message: 'Complaint submitted', changedBy: student.id, timestamp: new Date(Date.now() - 604800000) },
        { status: 'resolved', message: 'Library hours extended', changedBy: faculty.id, timestamp: new Date() }
      ]
    });

    const dbType = process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite';
    console.log(`\n✅ Seed data created successfully! (${dbType})`);
    console.log('\n📋 Test Credentials:');
    console.log('   Admin:   admin@college.edu / admin123');
    console.log('   HOD:     hod@college.edu / hod123');
    console.log('   Faculty: faculty@college.edu / faculty123');
    console.log('   Student: student@college.edu / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedData();
