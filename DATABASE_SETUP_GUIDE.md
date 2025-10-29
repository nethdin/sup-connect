# Database Setup and Installation Guide

## Prerequisites
- Node.js 18+ installed
- MySQL database (Railway)
- npm or yarn

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- `mysql2` - MySQL client for Node.js
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `uuid` - Unique ID generation

## Step 2: Set Up Environment Variables

The `.env.local` file has already been created with your Railway database connection. The file contains:

```env
DATABASE_URL="mysql://root:oOBEhYalVgQVDYnMsNHHIaJYmVhTNiFC@turntable.proxy.rlwy.net:52451/railway"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRY="24h"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

**Important:** Change the `JWT_SECRET` in production!

## Step 3: Initialize the Database

Connect to your Railway MySQL database and run the setup script:

### Option 1: Using MySQL CLI
```bash
mysql -h turntable.proxy.rlwy.net -P 52451 -u root -poOBEhYalVgQVDYnMsNHHIaJYmVhTNiFC railway < database-setup.sql
```

### Option 2: Using Railway Dashboard
1. Go to your Railway project
2. Click on the MySQL database
3. Go to "Query" tab
4. Copy and paste the contents of `database-setup.sql`
5. Execute the query

### Option 3: Using MySQL Workbench or any MySQL client
1. Connect to:
   - Host: `turntable.proxy.rlwy.net`
   - Port: `52451`
   - User: `root`
   - Password: `oOBEhYalVgQVDYnMsNHHIaJYmVhTNiFC`
   - Database: `railway`
2. Run the `database-setup.sql` file

## Step 4: Verify Database Connection

The application will automatically test the database connection when it starts. You can also manually test it:

```typescript
import { testConnection } from '@/app/lib/db';

await testConnection(); // Should log: ✅ Database connection successful
```

## Step 5: Start the Development Server

```bash
npm run dev
```

The API will be available at: `http://localhost:3000/api`

## Step 6: Test the API

### Option 1: Using the Test Script
```bash
chmod +x test-api.sh
./test-api.sh
```

### Option 2: Using Postman
1. Import `postman-collection.json`
2. Run the requests in order

### Option 3: Manual Testing
```bash
# Register a student
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "student123",
    "name": "John Student",
    "role": "STUDENT"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "student123"
  }'
```

## Database Schema

The setup creates the following tables:
- `users` - User accounts (students, supervisors, admins)
- `supervisor_profiles` - Supervisor profile information
- `project_ideas` - Student project ideas
- `booking_requests` - Booking requests from students to supervisors
- `assignments` - Student-supervisor assignments
- `availability_slots` - Supervisor availability slots
- `meetings` - Scheduled meetings
- `progress_updates` - Student progress updates
- `notifications` - User notifications

## Architecture Changes

### What Changed?
1. **Replaced in-memory storage** with MySQL database
2. **Added proper password hashing** using bcrypt (10 salt rounds)
3. **Implemented real JWT** using jsonwebtoken library
4. **Added UUID** for unique IDs instead of random strings
5. **Created connection pool** for efficient database connections

### Key Files Modified/Created:
- ✅ `app/lib/db.ts` - Database connection and query helpers
- ✅ `app/api/api-handlers.ts` - Updated to use MySQL
- ✅ `database-setup.sql` - SQL schema and setup script
- ✅ `.env.local` - Environment variables (don't commit!)
- ✅ `.env.example` - Template for environment variables
- ✅ `package.json` - Added dependencies

## Connection Details

**Railway MySQL Database:**
- Host: `turntable.proxy.rlwy.net`
- Port: `52451`
- User: `root`
- Password: `oOBEhYalVgQVDYnMsNHHIaJYmVhTNiFC`
- Database: `railway`

**Connection String:**
```
mysql://root:oOBEhYalVgQVDYnMsNHHIaJYmVhTNiFC@turntable.proxy.rlwy.net:52451/railway
```

## Troubleshooting

### Error: "connect ECONNREFUSED"
- Check if the database is running on Railway
- Verify the connection details are correct
- Ensure your IP is whitelisted (Railway usually allows all IPs)

### Error: "ER_NOT_SUPPORTED_AUTH_MODE"
- This shouldn't happen with Railway, but if it does:
- Run: `ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'your-password';`

### Error: "ER_BAD_DB_ERROR"
- Make sure you selected the `railway` database
- Check if the database exists: `SHOW DATABASES;`

### Error: "Client does not support authentication protocol"
- Update mysql2 package: `npm install mysql2@latest`

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env.local`** - It contains sensitive credentials
2. **Change JWT_SECRET** in production to a strong random string
3. **Enable SSL/TLS** for database connections in production
4. **Use environment variables** for all sensitive data
5. **Rotate passwords** regularly
6. **Enable Railway's backup feature** for data safety

## Useful Database Queries

```sql
-- View all users
SELECT * FROM users;

-- View supervisors with profiles
SELECT u.name, sp.specialization, sp.current_slots, sp.max_slots
FROM supervisor_profiles sp
JOIN users u ON sp.user_id = u.id;

-- View pending requests
SELECT 
    br.id,
    s.name AS student_name,
    u.name AS supervisor_name,
    br.status
FROM booking_requests br
JOIN users s ON br.student_id = s.id
JOIN supervisor_profiles sp ON br.supervisor_id = sp.id
JOIN users u ON sp.user_id = u.id
WHERE br.status = 'PENDING';

-- View upcoming meetings
SELECT 
    m.id,
    s.name AS student_name,
    u.name AS supervisor_name,
    m.date_time,
    m.mode
FROM meetings m
JOIN users s ON m.student_id = s.id
JOIN supervisor_profiles sp ON m.supervisor_id = sp.id
JOIN users u ON sp.user_id = u.id
WHERE m.date_time > NOW()
ORDER BY m.date_time ASC;
```

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set up database: Run `database-setup.sql`
3. ✅ Start server: `npm run dev`
4. ✅ Test API: Run `./test-api.sh` or use Postman
5. ⏳ Build frontend components
6. ⏳ Add error monitoring (Sentry)
7. ⏳ Set up CI/CD pipeline
8. ⏳ Deploy to production

## Support

For issues or questions:
- Check `API_DOCUMENTATION.md` for API details
- Review `QUICK_START.md` for quick reference
- Check database logs on Railway dashboard
- Review application logs: `console.log()` outputs

---

**🎉 Your sup-connect application is now connected to MySQL!**
