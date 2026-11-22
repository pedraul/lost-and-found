/**
 * Test Credentials Setup Script
 * 
 * This script creates test admin and user accounts for testing the login flow
 * 
 * Usage:
 * node scripts/setup-test-accounts.js
 */

const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');

const setupTestAccounts = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if admin already exists
    let admin = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      admin = await User.create({
        email: 'admin@example.com',
        password_hash: hashedPassword,
        full_name: 'Admin User',
        phone: '+1234567890',
        role: 'admin',
        is_verified: true,
        trust_score: 100
      });
      console.log('✅ Admin account created');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    } else {
      const passwordMatches = await bcrypt.compare('admin123', admin.password_hash);
      if (!passwordMatches || admin.role !== 'admin') {
        admin.password_hash = await bcrypt.hash('admin123', 12);
        admin.role = 'admin';
        admin.is_verified = true;
        await admin.save();
        console.log('✅ Admin account credentials repaired');
      } else {
        console.log('ℹ️  Admin account already exists');
      }
    }

    // Check if regular user already exists
    let regularUser = await User.findOne({ where: { email: 'user@example.com' } });
    if (!regularUser) {
      const hashedPassword = await bcrypt.hash('user123', 12);
      regularUser = await User.create({
        email: 'user@example.com',
        password_hash: hashedPassword,
        full_name: 'Regular User',
        phone: '+9876543210',
        role: 'user',
        is_verified: true,
        trust_score: 100
      });
      console.log('✅ Regular user account created');
      console.log('   Email: user@example.com');
      console.log('   Password: user123');
    } else {
      console.log('ℹ️  Regular user account already exists');
    }

    console.log('\n📋 TEST CREDENTIALS:');
    console.log('');
    console.log('ADMIN:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    console.log('  Redirects to: /admin (Admin Dashboard)');
    console.log('');
    console.log('REGULAR USER:');
    console.log('  Email: user@example.com');
    console.log('  Password: user123');
    console.log('  Redirects to: /dashboard (User Dashboard)');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up test accounts:', error.message);
    process.exit(1);
  }
};

setupTestAccounts();
