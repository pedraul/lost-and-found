#!/usr/bin/env node

/**
 * Login Debugging Script
 * 
 * This script helps identify login issues by:
 * 1. Verifying database connection
 * 2. Listing all users in database
 * 3. Testing password hashing
 * 4. Testing if credentials are correct
 * 
 * Usage:
 * node scripts/debug-login.js [email] [password]
 * 
 * Examples:
 * node scripts/debug-login.js                    # Check setup
 * node scripts/debug-login.js admin@example.com  # Check user
 * node scripts/debug-login.js admin@example.com admin123  # Test credentials
 */

const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`)
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const debugLogin = async () => {
  const email = process.argv[2];
  const password = process.argv[3];

  try {
    log.section('LOST & FOUND - LOGIN DEBUGGER');

    // Step 1: Check Backend Connection
    log.section('Step 1: Checking Backend Connection');
    try {
      const response = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
      log.success('Backend is running at http://localhost:5000');
    } catch (err) {
      log.error('Cannot reach backend at http://localhost:5000');
      log.warn('Make sure backend is running: npm start (in backend directory)');
      console.log('\nAttempting to continue with database checks...\n');
    }

    // Step 2: Check Database Connection
    log.section('Step 2: Checking Database Connection');
    try {
      await sequelize.authenticate();
      log.success('Connected to PostgreSQL database');
      log.info('Database: ' + process.env.DB_NAME || 'lost_found');
      log.info('Host: ' + process.env.DB_HOST || 'localhost');
    } catch (err) {
      log.error('Cannot connect to database');
      log.error('Error: ' + err.message);
      process.exit(1);
    }

    // Step 3: List All Users
    log.section('Step 3: Listing All Users in Database');
    const allUsers = await User.findAll({
      attributes: ['id', 'email', 'full_name', 'role', 'is_verified', 'password_hash'],
      raw: true
    });

    if (allUsers.length === 0) {
      log.warn('No users found in database!');
      log.info('Create test accounts:');
      log.info('  node scripts/setup-test-accounts.js');
      log.info('');
      log.info('Or update existing users:');
      log.info('  node scripts/fix-existing-users.js');
    } else {
      log.success(`Found ${allUsers.length} user(s):`);
      console.log('');
      allUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${colors.yellow}${user.email}${colors.reset}`);
        console.log(`     Name: ${user.full_name}`);
        console.log(`     Role: ${user.role}`);
        console.log(`     Verified: ${user.is_verified ? 'Yes' : 'No'}`);
        const hasHash = user.password_hash && user.password_hash.startsWith('$2');
        console.log(`     Password Hash: ${hasHash ? colors.green + 'Valid bcrypt hash' : colors.red + 'Invalid/Missing hash'}${colors.reset}`);
        console.log('');
      });
    }

    // Step 4: Test Specific User Login
    if (email) {
      log.section('Step 4: Testing User Login');
      
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        log.error(`User ${email} not found in database`);
        log.info('Available users:');
        allUsers.forEach(u => log.info('  - ' + u.email));
        process.exit(1);
      }

      log.success(`Found user: ${user.full_name} (${user.email})`);
      log.info(`Role: ${user.role}`);
      log.info(`Verified: ${user.is_verified ? 'Yes' : 'No'}`);

      if (!user.password_hash || !user.password_hash.startsWith('$2')) {
        log.error('User has invalid/missing password hash!');
        log.info('Run: node scripts/fix-existing-users.js');
        process.exit(1);
      }

      if (password) {
        log.section('Step 5: Testing Password');
        
        // Test bcrypt comparison
        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        
        if (passwordMatches) {
          log.success(`Password is correct!`);
        } else {
          log.error(`Password is incorrect!`);
          log.warn('The password you provided does not match the one in database');
          process.exit(1);
        }

        // Test API login
        log.section('Step 6: Testing API Login');
        try {
          const loginResponse = await axios.post(
            'http://localhost:5000/api/auth/login',
            { email, password },
            { timeout: 5000 }
          );

          if (loginResponse.data.data?.accessToken) {
            log.success('API login successful!');
            log.info(`Access Token: ${loginResponse.data.data.accessToken.substring(0, 20)}...`);
            log.info(`User Role: ${loginResponse.data.data.user?.role}`);
            log.info('');
            log.section('LOGIN WORKING ✅');
            log.success('You should be able to login now!');
            log.success('Go to http://localhost:3000/login and try:');
            log.success(`  Email: ${email}`);
            log.success(`  Password: ${password}`);
          } else {
            log.error('API returned unexpected response');
            console.log(JSON.stringify(loginResponse.data, null, 2));
          }
        } catch (err) {
          if (err.response?.status === 401) {
            log.error('API returned 401 - Invalid credentials');
            log.info('Double-check email and password');
          } else if (err.code === 'ECONNREFUSED') {
            log.error('Cannot connect to backend API');
            log.warn('Make sure backend is running on port 5000');
          } else {
            log.error('API Error: ' + err.message);
          }
          console.log(err.response?.data || '');
        }
      }
    }

    log.section('TROUBLESHOOTING');
    console.log(`
If login is not working, check:

1. ${colors.yellow}Backend is Running${colors.reset}
   npm start (in backend directory)

2. ${colors.yellow}Database is Connected${colors.reset}
   psql -U postgres -d lost_found

3. ${colors.yellow}Users Exist${colors.reset}
   Run: node scripts/debug-login.js

4. ${colors.yellow}Passwords are Hashed${colors.reset}
   Run: node scripts/fix-existing-users.js

5. ${colors.yellow}Frontend API URL${colors.reset}
   Check: frontend/.env.local
   Should be: NEXT_PUBLIC_API_URL=http://localhost:5000/api

6. ${colors.yellow}Test Login${colors.reset}
   Run: node scripts/debug-login.js email@example.com password123
    `);

    process.exit(0);
  } catch (error) {
    log.error('Unexpected error: ' + error.message);
    console.error(error);
    process.exit(1);
  }
};

debugLogin();
