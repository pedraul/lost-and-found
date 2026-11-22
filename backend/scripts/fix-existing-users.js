/**
 * Fix Existing Users Script
 * 
 * This script updates existing users with proper bcrypt hashed passwords
 * allowing them to login
 * 
 * Usage:
 * node scripts/fix-existing-users.js
 * 
 * Then it will prompt you for passwords for each user, or you can
 * run with a JSON file:
 * node scripts/fix-existing-users.js passwords.json
 */

const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => {
  rl.question(prompt, resolve);
});

const fixExistingUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get all existing users
    const users = await User.findAll({
      attributes: ['id', 'email', 'full_name', 'password_hash'],
      raw: true
    });

    if (users.length === 0) {
      console.log('ℹ️  No users found in database');
      process.exit(0);
    }

    console.log(`Found ${users.length} user(s):\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name} (${user.email})`);
    });
    console.log('\n');

    // Check if we should use a password file
    const args = process.argv.slice(2);
    let passwordMap = {};

    if (args[0] && fs.existsSync(args[0])) {
      const fileContent = fs.readFileSync(args[0], 'utf8');
      passwordMap = JSON.parse(fileContent);
      console.log('📄 Using passwords from file: ' + args[0] + '\n');
    }

    // Update each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      let password;

      if (passwordMap[user.email]) {
        password = passwordMap[user.email];
        console.log(`[${i + 1}/${users.length}] ${user.email}`);
        console.log(`    Using password from file`);
      } else {
        const answer = await question(
          `[${i + 1}/${users.length}] Enter password for ${user.email} (press Enter to skip): `
        );

        if (!answer.trim()) {
          console.log('    ⏭️  Skipped\n');
          continue;
        }
        password = answer;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update user in database
      await User.update(
        { password_hash: hashedPassword },
        { where: { id: user.id } }
      );

      console.log(`    ✅ Password updated\n`);
    }

    console.log('✅ All users updated successfully!\n');
    console.log('📋 You can now login with these credentials:');
    users.forEach((user) => {
      console.log(`   Email: ${user.email}`);
    });
    console.log('\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
};

fixExistingUsers();
