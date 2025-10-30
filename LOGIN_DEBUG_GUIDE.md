# Login Issue Debugging Guide

## Issue
Login doesn't work even though users are created in the database during registration.

## Quick Fixes to Try

### 1. **Restart the Development Server**
The most common issue is that the old code (without database) is still running.

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. **Check Server Logs**
When you try to log in, check the terminal where `npm run dev` is running. You should see detailed logs like:

```
Login attempt for email: user@example.com
User found: { id: '...', email: '...', name: '...' }
Password hash from DB: $2b$10$...
Password verification result: true/false
Login successful for: user@example.com
```

### 3. **Test with a New Registration**
If you registered users BEFORE the database was connected, try registering a new user:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "STUDENT"
  }'
```

Then try logging in with that new user:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. **Use the Test Scripts**

I've created test scripts to help debug:

#### Test Login (Node.js)
Edit `test-login.js` and update these lines:
```javascript
const testEmail = 'your-email@example.com';
const testPassword = 'your-actual-password';
```

Then run:
```bash
node test-login.js
```

This will tell you if the password verification is working.

#### Test Login (Bash)
Edit `test-login.sh` and update:
```bash
EMAIL="your-email@example.com"
PASSWORD="your-actual-password"
```

Then run:
```bash
chmod +x test-login.sh
./test-login.sh
```

## Common Issues and Solutions

### Issue 1: Wrong Password
**Symptom:** Console shows "Password verification result: false"

**Solution:** Make sure you're using the exact password you used during registration. Passwords are case-sensitive.

### Issue 2: User Not Found
**Symptom:** Console shows "User not found for email: ..."

**Solution:** 
- Check the email is spelled correctly
- Verify the user exists in the database:
```bash
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: 'turntable.proxy.rlwy.net',
  port: 52451,
  user: 'root',
  password: 'oOBEhYalVgQVDYnMsNHHIaJYmVhTNiFC',
  database: 'railway'
}).then(async (conn) => {
  const [rows] = await conn.query('SELECT email FROM users');
  console.log('Emails in database:', rows.map(r => r.email));
  await conn.end();
});
"
```

### Issue 3: Server Not Running New Code
**Symptom:** No console logs appear when trying to log in

**Solution:**
1. Stop the server (Ctrl+C)
2. Clear the Next.js cache: `rm -rf .next`
3. Restart: `npm run dev`

### Issue 4: bcrypt Not Installed
**Symptom:** Error: "Cannot find module 'bcrypt'"

**Solution:**
```bash
npm install bcrypt @types/bcrypt
```

### Issue 5: Database Connection Error
**Symptom:** "Login error: connect ECONNREFUSED"

**Solution:** Check if the database is accessible:
```bash
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: 'turntable.proxy.rlwy.net',
  port: 52451,
  user: 'root',
  password: 'oOBEhYalVgQVDYnMsNHHIaJYmVhTNiFC',
  database: 'railway'
}).then(conn => {
  console.log('✅ Database connected!');
  conn.end();
}).catch(err => {
  console.error('❌ Database error:', err.message);
});
"
```

## Step-by-Step Debugging Process

### Step 1: Verify Database Has Users
```bash
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: 'turntable.proxy.rlwy.net',
  port: 52451,
  user: 'root',
  password: 'oOBEhYalVgQVDYnMsNHHIaJYmVhTNiFC',
  database: 'railway'
}).then(async (conn) => {
  const [rows] = await conn.query('SELECT id, email, name, role FROM users');
  console.log('Users:', JSON.stringify(rows, null, 2));
  await conn.end();
});
"
```

### Step 2: Check Password Hash Format
```bash
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: 'turntable.proxy.rlwy.net',
  port: 52451,
  user: 'root',
  password: 'oOBEhYalVgQVDYnMsNHHIaJYmVhTNiFC',
  database: 'railway'
}).then(async (conn) => {
  const [rows] = await conn.query('SELECT email, password FROM users LIMIT 1');
  if (rows[0]) {
    console.log('Email:', rows[0].email);
    console.log('Password hash:', rows[0].password);
    console.log('Is bcrypt hash?', rows[0].password.startsWith('\$2b\$'));
  }
  await conn.end();
});
"
```

### Step 3: Test bcrypt Verification
Update `test-login.js` with your credentials and run:
```bash
node test-login.js
```

### Step 4: Make a Login Request
Start the dev server and watch the logs:
```bash
npm run dev
```

In another terminal:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Watch the first terminal for detailed logs.

## Expected Logs for Successful Login

```
Login attempt for email: user@example.com
User found: { id: '12345...', email: 'user@example.com', name: 'User Name' }
Password hash from DB: $2b$10$...
Password verification result: true
Login successful for: user@example.com
```

## Expected Logs for Failed Login (Wrong Password)

```
Login attempt for email: user@example.com
User found: { id: '12345...', email: 'user@example.com', name: 'User Name' }
Password hash from DB: $2b$10$...
Password verification result: false
Login failed: Invalid password for email: user@example.com
```

## If Nothing Works

1. **Delete all users and start fresh:**
```sql
-- Connect to Railway database and run:
DELETE FROM users;
```

2. **Register a new user via API:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fresh@test.com",
    "password": "test123",
    "name": "Fresh User",
    "role": "STUDENT"
  }'
```

3. **Immediately try to login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fresh@test.com",
    "password": "test123"
  }'
```

## Still Having Issues?

Check the console logs and share:
1. The exact error message from the API response
2. The console logs from the server terminal
3. The result of running `node test-login.js`

This will help identify the exact issue.
