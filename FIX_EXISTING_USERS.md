# Existing Users Login Fix Guide

## Problem
Existing users in the database cannot login because their passwords are not properly hashed.

## Solution
Use the password fix script to hash passwords for existing users.

## Quick Start

### Option 1: Interactive Password Update (Recommended)

```bash
cd backend
node scripts/fix-existing-users.js
```

This will:
1. Show all existing users
2. Prompt you to enter a password for each user
3. Hash the passwords with bcrypt
4. Save to database

**Example:**
```
Found 3 user(s):

1. John Doe (john@example.com)
2. Jane Smith (jane@example.com)
3. Bob Wilson (bob@example.com)

[1/3] Enter password for john@example.com: mypassword123
    ✅ Password updated

[2/3] Enter password for jane@example.com: janepass456
    ✅ Password updated

[3/3] Enter password for bob@example.com: (press Enter to skip)
    ⏭️  Skipped

✅ All users updated successfully!
```

### Option 2: Batch Update with Password File

Create a `passwords.json` file:

```json
{
  "john@example.com": "mypassword123",
  "jane@example.com": "janepass456",
  "bob@example.com": "bobpass789"
}
```

Then run:
```bash
cd backend
node scripts/fix-existing-users.js passwords.json
```

### Option 3: Manual Database Update

If you know the email and password, run this script directly:

```javascript
// In Node.js REPL or a file
const bcrypt = require('bcryptjs');

async function updatePassword(email, plainPassword) {
  const hashedPassword = await bcrypt.hash(plainPassword, 12);
  console.log(`Email: ${email}`);
  console.log(`Hashed Password: ${hashedPassword}`);
  
  // Then run this SQL:
  console.log(`UPDATE users SET password_hash = '${hashedPassword}' WHERE email = '${email}';`);
}

updatePassword('john@example.com', 'mypassword123');
```

## Testing Login

After updating passwords, test login:

1. Go to `http://localhost:3000/login`
2. Enter email and password
3. You should login successfully ✅

## Troubleshooting

### Problem: "Invalid email or password" still appears

**Cause 1:** Password not updated
```bash
# Check if password_hash is updated in database
psql -U your_user -d your_db -c "SELECT email, password_hash FROM users LIMIT 1;"
# Should show a long bcrypt hash starting with $2a$
```

**Cause 2:** User doesn't exist
```bash
# Check all users
psql -U your_user -d your_db -c "SELECT email, full_name FROM users;"
```

**Solution:** Run the fix script again

### Problem: Script says "No users found"

This means the database is empty. You need to:
1. Register users first via `/register` endpoint, OR
2. Insert users manually into database

```sql
-- Insert test user
INSERT INTO users (email, password_hash, full_name, role, is_verified)
VALUES (
  'test@example.com',
  '$2a$12$...',  -- bcrypt hash
  'Test User',
  'user',
  true
);
```

## Files

- `backend/scripts/fix-existing-users.js` - Main fix script
- `backend/scripts/setup-test-accounts.js` - Creates new test accounts

## Workflow

```
Existing Users in DB
(with plain text or old passwords)
         │
         ▼
Run: node scripts/fix-existing-users.js
         │
         ├─ Show existing users
         │
         ├─ Prompt for new passwords
         │
         ├─ Hash passwords with bcrypt
         │
         └─ Update database
         
         ▼
Users can now login! ✅
```

## Important Notes

⚠️ **Never share password hashes** - They're one-way encrypted

✅ **Passwords are now secure** - Bcrypt is industry-standard

✅ **Old passwords are replaced** - Users must use the new password you set

💡 **Batch update is faster** - Use passwords.json for many users

## Next Steps

1. Update passwords for existing users
2. Test login with each user
3. Verify redirects work (admin → `/admin`, user → `/dashboard`)
4. Users can now use the full app!

---

**Existing users can now login!** 🎉
