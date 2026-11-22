# Admin Dashboard Implementation Guide

## Overview
A comprehensive admin dashboard has been implemented for the Lost and Found application. The admin dashboard allows administrators to:

- View overall system statistics (users, items, matches, verifications)
- Monitor all user activities in real-time
- Analyze user behavior and engagement
- View detailed metrics and trends
- Access comprehensive user management

## Features

### 1. Dashboard Statistics
- **Total Users**: Number of registered users
- **Registered Items**: Number of items reported as lost/stolen
- **Found Items**: Number of items reported as found
- **Successful Matches**: Number of successful matches between lost and found items
- **Weekly Metrics**: Active users, verified users, and new registrations this week

### 2. Activities Monitoring
- View all user activities across the platform
- Filter activities by action type (item_registered, item_found, match_created, etc.)
- See who performed what action, when, and on which resource
- Includes metadata about each activity

### 3. User Management
- View all users with their statistics
- See user details including name, email, role, and verification status
- Check how many items each user has registered or found
- View trust scores
- Click on any user to see their detailed activity history

### 4. System Metrics & Analytics
- Items registered over time (7, 30, or 90 days)
- Matches created over time
- Verification activities over time
- Top devices by registration count
- User role distribution

## Database Schema

### ActivityLog Table
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type VARCHAR(50),
  resource_type VARCHAR(50),
  resource_id UUID,
  description TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP
);
```

## API Endpoints

### Admin Only Routes (All require admin role)

#### Dashboard Statistics
```
GET /api/admin/dashboard/stats
Response: {
  totalUsers, totalItems, totalFoundItems, totalMatches,
  totalVerifications, activeUsersThisWeek, verifiedUsers,
  itemsRegisteredThisWeek, matchesCreatedThisWeek,
  itemsByStatus, matchSuccessRate
}
```

#### Recent Activities
```
GET /api/admin/dashboard/activities?limit=50&offset=0
Response: {
  activities: [...],
  pagination: { total, limit, offset, pages }
}
```

#### System Metrics
```
GET /api/admin/dashboard/metrics?timeRange=30
Response: {
  itemsOverTime, matchesOverTime, verificationsOverTime,
  topDevices, roleDistribution
}
```

#### All Users
```
GET /api/admin/users?limit=20&offset=0&role=user
Response: {
  users: [...],
  pagination: { total, limit, offset, pages }
}
```

#### User Activity
```
GET /api/admin/users/:userId/activity?limit=30&offset=0
Response: {
  user: {...},
  stats: { registeredItems, foundItems, verifications, statusChanges },
  activities: [...]
}
```

## Integration Guide

### Step 1: Add ActivityLog Model to Database
Run the migration:
```bash
# The migration file is already created at:
# database/migrations/012_create_activity_logs.sql
```

### Step 2: Update Controllers to Log Activities
Add logging calls to existing controllers. Example:

```javascript
// In your controller
const adminController = require('../controllers/admin.controller');

// After a successful user action
await adminController.logActivity(
  userId,
  'item_registered',  // action_type
  'registered_item',  // resource_type
  itemId,            // resource_id
  'User registered a new item',  // description
  {                  // metadata (optional)
    device_type: 'iPhone',
    serial_number: '12345'
  },
  req              // request object (optional, for IP and user-agent)
);
```

### Common Activity Types to Log
- `item_registered` - User registered a new item
- `item_found` - User reported a found item
- `match_created` - A match was created between lost and found items
- `verification_done` - Item verification completed
- `status_changed` - Item status was changed
- `item_claimed` - Found item was claimed
- `user_login` - User logged in
- `user_logout` - User logged out
- `profile_updated` - User updated their profile

### Step 3: Update Existing Controllers
Example of updating item.controller.js:

```javascript
const { logActivity } = require('./admin.controller');

exports.registerItem = async (req, res, next) => {
  try {
    // ... existing code ...
    const item = await RegisteredItem.create({...});
    
    // Log the activity
    await logActivity(
      req.user.id,
      'item_registered',
      'registered_item',
      item.id,
      `User registered a new ${item.device_type.name}`,
      {
        device_model: item.device_model_id,
        category: item.category_id
      },
      req
    );
    
    res.json({...});
  } catch (error) {
    next(error);
  }
};
```

## Frontend Integration

### Admin Navigation
Add a link to the admin dashboard in your Navbar component:

```javascript
{user?.role === 'admin' && (
  <Link href="/admin" className="...">
    Admin Dashboard
  </Link>
)}
```

### API Service
The admin API service is already created at:
- `frontend/services/admin.api.js`

Use it in your components:
```javascript
import adminAPI from '@/services/admin.api';

// Fetch dashboard stats
const stats = await adminAPI.getDashboardStats();

// Fetch activities
const { activities, pagination } = await adminAPI.getRecentActivities(50, 0);
```

## Access Control

The admin dashboard is protected by:
1. JWT authentication (user must be logged in)
2. Role-based authorization (user must have 'admin' role)

Only users with `role = 'admin'` can access:
- `/admin` - Admin dashboard
- `/api/admin/*` - All admin API endpoints

## File Structure

### Backend
- `backend/src/models/ActivityLog.js` - ActivityLog model
- `backend/src/controllers/admin.controller.js` - Admin controller with all business logic
- `backend/src/routes/admin.routes.js` - Admin routes
- `database/migrations/012_create_activity_logs.sql` - Database migration

### Frontend
- `frontend/app/admin/page.js` - Admin dashboard main page
- `frontend/app/admin/layout.js` - Admin layout
- `frontend/services/admin.api.js` - Admin API service
- `frontend/components/admin/StatsCard.jsx` - Statistics card component
- `frontend/components/admin/ActivityTable.jsx` - Activities table component
- `frontend/components/admin/UsersList.jsx` - Users list component
- `frontend/components/admin/MetricsChart.jsx` - Metrics chart component

## Usage

1. **Access the Dashboard**
   - Navigate to `http://localhost:3000/admin` (if logged in as admin)
   - Or click "Admin Dashboard" link in the navbar

2. **View Statistics**
   - "Overview" tab shows all key metrics at a glance
   - Cards display total and weekly statistics

3. **Monitor Activities**
   - "Activities" tab shows all user activities
   - See who did what, when, and on what resource

4. **Manage Users**
   - "Users" tab displays all users with their statistics
   - Click on a user to view their detailed activity
   - See user trust scores and verification status

5. **Analyze Metrics**
   - "Metrics" tab shows trends over time
   - Choose different time ranges (7, 30, 90 days)
   - View device popularity and role distribution

## Security Notes

- All admin endpoints require admin role verification
- Activity logs include IP addresses and user agents for security auditing
- Sensitive user data (passwords) is excluded from responses
- All activity data is logged with timestamps for audit trails

## Future Enhancements

- Real-time notifications for important events
- Custom date range selection for metrics
- Export dashboard data to CSV/PDF
- User activity heatmaps
- Fraud detection and alerts
- Activity filters and search
- System performance monitoring
- Audit trail for admin actions
- Bulk user management (ban, suspend, etc.)
