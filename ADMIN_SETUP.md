# Admin Dashboard Quick Setup

## Prerequisites
- Node.js and npm installed
- PostgreSQL database running
- Application already set up and running

## Setup Steps

### 1. Run Database Migration

The ActivityLog table migration has been created at:
```
database/migrations/012_create_activity_logs.sql
```

Run the migration using your migration script:

#### Option A: Using PostgreSQL CLI
```bash
psql -U your_db_user -d your_db_name -f database/migrations/012_create_activity_logs.sql
```

#### Option B: Using Node Migration Runner (if you have one)
```bash
npm run migrate
# or
node scripts/run-migrations.js
```

#### Option C: Manual Query
Connect to your database and run:
```sql
-- Copy the contents of database/migrations/012_create_activity_logs.sql
-- and paste it into your database
```

### 2. Verify Models
The following models have been updated/created:
- ✅ ActivityLog model (`backend/src/models/ActivityLog.js`)
- ✅ Models associations updated (`backend/src/models/index.js`)

### 3. Start Logging Activities
Integrate activity logging into your controllers:

```javascript
// In any controller
const { logActivity, ActivityTypes, ResourceTypes } = require('../utils/activityLogger');

exports.registerItem = async (req, res, next) => {
  try {
    // ... your existing code ...
    const item = await RegisteredItem.create({...});
    
    // Log the activity
    await logActivity(req, {
      action: ActivityTypes.ITEM_REGISTERED,
      resource: ResourceTypes.REGISTERED_ITEM,
      resourceId: item.id,
      description: `User registered a new item: ${item.name}`,
      metadata: {
        device_type: item.device_type,
        category: item.category
      }
    });
    
    res.json({...});
  } catch (error) {
    next(error);
  }
};
```

### 4. Access Admin Dashboard
1. Create an admin user (set role to 'admin'):
   ```javascript
   // In your auth controller or via database
   const user = await User.create({
     email: 'admin@example.com',
     password_hash: hashedPassword,
     full_name: 'Admin User',
     role: 'admin'
   });
   ```

2. Login with admin credentials

3. Navigate to `http://localhost:3000/admin`

## Frontend Setup

The admin dashboard components are already in place:
- `frontend/app/admin/page.js` - Main dashboard
- `frontend/components/admin/` - Dashboard components
- `frontend/services/admin.api.js` - API service

### Add Admin Link to Navbar (Optional)
Update your Navbar component:

```javascript
// In Navbar.jsx
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { user } = useAuth();
  
  return (
    <nav>
      {/* ... existing navbar ... */}
      {user?.role === 'admin' && (
        <Link href="/admin" className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded">
          Admin Dashboard
        </Link>
      )}
    </nav>
  );
}
```

## Configuration

### Activity Logging
The activity logger is production-ready but optional. If logging fails, it won't affect your application.

### API Rate Limiting (Optional)
If you have rate limiting, consider exempting admin dashboard requests or allowing higher limits.

## Testing

### Test Dashboard Access
```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your_password"}'

# Get dashboard stats
curl -X GET http://localhost:3000/api/admin/dashboard/stats \
  -H "Authorization: Bearer your_token"
```

### Check Activity Logs
```sql
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;
```

## Troubleshooting

### Error: Table "activity_logs" does not exist
**Solution:** Run the migration again
```bash
psql -U your_db_user -d your_db_name -f database/migrations/012_create_activity_logs.sql
```

### Error: 403 Forbidden on admin routes
**Causes:**
- User is not logged in
- User role is not 'admin'
- Token is expired

**Solution:** Make sure you're logged in as an admin user

### Activities not showing up
**Causes:**
- Activity logging calls not added to controllers
- Logging function encounters error (check console)

**Solution:** Add logging calls to your controllers using the activity logger utility

## Next Steps

1. **Add Activity Logging to Controllers**
   - See `ADMIN_DASHBOARD_GUIDE.md` for integration instructions
   - Use the `activityLogger.js` utility for easy logging

2. **Customize Activity Types**
   - Edit `ActivityTypes` in `backend/src/utils/activityLogger.js`
   - Add new action types as needed

3. **Enhance Dashboard UI**
   - Add more charts and visualizations
   - Implement export functionality
   - Add real-time updates

4. **Monitor System Health**
   - Set up alerts for unusual activities
   - Add fraud detection
   - Monitor performance metrics

## Support

For questions or issues with the admin dashboard, refer to:
- `ADMIN_DASHBOARD_GUIDE.md` - Complete feature documentation
- `backend/src/controllers/admin.controller.js` - API implementation
- `frontend/app/admin/page.js` - Frontend implementation

---

**Admin Dashboard is now ready to use!** 🎉
