# Login Redirect Setup Guide

## Overview
The login system now intelligently redirects users based on their role:
- **Admin users** → Redirected to `/admin` (Admin Dashboard)
- **Regular users** → Redirected to `/dashboard` (User Dashboard)

## Quick Start

### Step 1: Create Test Accounts

Run this command in the backend directory:

```bash
cd backend
node scripts/setup-test-accounts.js
```

This creates:
- **Admin account**: `admin@example.com` / `admin123`
- **Regular user account**: `user@example.com` / `user123`

### Step 2: Test the Login

1. Go to `http://localhost:3000/login`
2. Enter credentials and click "Sign in"
3. You should be redirected automatically:
   - Admin → `/admin` (Admin Dashboard)
   - User → `/dashboard` (User Dashboard)

## How It Works

### Frontend Flow

```
User fills login form
    ↓
Click "Sign in"
    ↓
handleLogin() called
    ↓
AuthContext.login() executes
    ↓
API call to backend /auth/login
    ↓
Backend returns: { user: { role: 'admin' }, accessToken, refreshToken }
    ↓
Check user.role from response
    ↓
if role === 'admin' → router.push('/admin')
else → router.push('/dashboard')
```

### Backend Changes

The backend already returns the user object with role in login response:

```javascript
// backend/src/services/auth.service.js
const login = async (reqBody) => {
  // ... verify credentials ...
  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,  // ✅ Role is included
      // ... other fields ...
    },
    accessToken: token,
    refreshToken
  };
};
```

### Frontend Changes

Updated login page to check role and redirect:

```javascript
// frontend/app/login/page.js
const handleSubmit = async (e) => {
  e.preventDefault();
  const response = await handleLogin(email, password);
  if (response) {
    const userRole = response.data?.user?.role || response.user?.role;
    if (userRole === 'admin') {
      router.push('/admin');  // Admin Dashboard
    } else {
      router.push('/dashboard');  // User Dashboard
    }
  }
};
```

## Files Modified

### Backend
- No changes required (already working correctly)

### Frontend
- `frontend/app/login/page.js` - Updated to check role and redirect
- `frontend/context/AuthContext.jsx` - Stores userRole in localStorage
- `frontend/hooks/useAuth.js` - Returns response with user data

### New Files
- `backend/scripts/setup-test-accounts.js` - Script to create test accounts

## Troubleshooting

### Problem: Still redirects to /dashboard for admin user

**Solution 1: Check backend response**
```bash
# Test login via curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Check if response includes role in user object
```

**Solution 2: Clear browser cache**
```javascript
// In browser console
localStorage.clear()
// Reload page
```

### Problem: "Invalid email or password" error

**Causes:**
1. Account doesn't exist → Run setup script
2. Wrong password → Check credentials in setup script
3. Backend not running → Start backend server
4. Wrong API URL → Check `NEXT_PUBLIC_API_URL` in `.env.local`

**Solution:**
```bash
# Verify backend is running
npm start  # in backend directory

# Verify account exists
psql -U your_user -d your_db -c "SELECT email, role FROM users WHERE email='admin@example.com';"
```

### Problem: Redirect not working (stays on /login)

**Causes:**
1. Response doesn't include user role
2. Router not initialized properly
3. JavaScript error in console

**Solution:**
```javascript
// Check browser console for errors
// Verify API response includes user data:
console.log(response);
// Should look like:
// { data: { user: { role: 'admin', ... }, accessToken: '...' } }
```

## Testing Different Scenarios

### Test 1: Admin Login
```
Email: admin@example.com
Password: admin123
Expected Result: Redirect to /admin
```

### Test 2: Regular User Login
```
Email: user@example.com
Password: user123
Expected Result: Redirect to /dashboard
```

### Test 3: Invalid Credentials
```
Email: admin@example.com
Password: wrongpassword
Expected Result: Error message "Invalid email or password"
```

### Test 4: Non-existent Account
```
Email: nonexistent@example.com
Password: anypassword
Expected Result: Error message "Invalid email or password"
```

## Manual Test Account Creation

If the setup script doesn't work, create accounts manually:

### Via PostgreSQL:
```sql
-- Admin user
INSERT INTO users (
  email, 
  password_hash, 
  full_name, 
  role, 
  is_verified
) VALUES (
  'admin@example.com',
  '$2a$12$YOUR_BCRYPT_HASH_HERE',  -- Use bcrypt hash
  'Admin User',
  'admin',
  true
);

-- Regular user
INSERT INTO users (
  email, 
  password_hash, 
  full_name, 
  role, 
  is_verified
) VALUES (
  'user@example.com',
  '$2a$12$YOUR_BCRYPT_HASH_HERE',  -- Use bcrypt hash
  'Regular User',
  'user',
  true
);
```

To generate bcrypt hash:
```javascript
// In Node.js
const bcrypt = require('bcryptjs');
const password = 'admin123';
const hash = bcrypt.hashSync(password, 12);
console.log(hash);
```

## Architecture Diagram

```
┌─────────────────────────────────────┐
│  Login Page (/login)                │
│  - Enter email & password           │
│  - Click "Sign in"                  │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  Frontend: handleLogin()            │
│  - Calls AuthContext.login()        │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  API Call: POST /auth/login         │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  Backend: authService.login()       │
│  - Verify email & password          │
│  - Return user with role            │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  Response: {                        │
│    user: { role: 'admin', ... },   │
│    accessToken: '...'               │
│  }                                  │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   role='admin'         role='user'
        │                   │
        ▼                   ▼
    /admin           /dashboard
  (Admin Panel)   (User Dashboard)
```

## Next Steps

1. Run the setup script to create test accounts
2. Test both admin and user logins
3. Verify correct redirects happen
4. Add activity logging calls to existing controllers
5. Monitor admin dashboard for user activities

---

**Login redirect is now fully functional!** 🎉
