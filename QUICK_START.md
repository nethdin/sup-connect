# Quick Start Guide - sup-connect API

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The API will be available at: `http://localhost:3000/api`

---

## 📁 Project Structure

```
app/
├── api/
│   ├── api-handlers.ts              # All business logic (MAIN FILE)
│   ├── auth/                        # Authentication endpoints
│   ├── supervisors/                 # Supervisor endpoints
│   ├── supervisor/                  # Supervisor-specific actions
│   ├── student/                     # Student endpoints
│   ├── meetings/                    # Meeting endpoints
│   └── availability/                # Availability booking
└── lib/
    ├── api-client.ts                # Frontend API utilities
    └── types.ts                     # TypeScript types
```

---

## 🔑 Key Files

### `app/api/api-handlers.ts`
**Main file containing ALL endpoint logic**. This file includes:
- Authentication functions
- Supervisor management
- Student operations
- Request handling
- Meeting booking
- Mock database (in-memory arrays)

### `app/lib/api-client.ts`
Frontend utilities for making API calls with:
- Automatic token management
- Type-safe requests
- Error handling
- Ready-to-use functions

---

## 📝 Quick API Reference

### Authentication
```typescript
// Register
POST /api/auth/register
Body: { email, password, name, role: "STUDENT" | "SUPERVISOR" }

// Login
POST /api/auth/login
Body: { email, password }
Response: { user, token }
```

### Students
```typescript
// Submit project idea
POST /api/student/idea
Headers: { Authorization: "Bearer <token>" }
Body: { title, description, category, keywords[] }

// Get recommendations
GET /api/student/matches
Headers: { Authorization: "Bearer <token>" }

// Send booking request
POST /api/student/request
Headers: { Authorization: "Bearer <token>" }
Body: { supervisorId }
```

### Supervisors
```typescript
// Get all supervisors
GET /api/supervisors?available=true&specialization=AI

// Create profile
POST /api/supervisor/profile
Headers: { Authorization: "Bearer <token>" }
Body: { specialization, tags[], bio, maxSlots }

// Get requests
GET /api/supervisor/requests?status=PENDING
Headers: { Authorization: "Bearer <token>" }

// Accept/Decline request
POST /api/supervisor/requests/:id/accept
POST /api/supervisor/requests/:id/decline
Headers: { Authorization: "Bearer <token>" }
```

### Meetings
```typescript
// Get meetings
GET /api/meetings?upcoming=true
Headers: { Authorization: "Bearer <token>" }

// Book meeting
POST /api/availability/book
Headers: { Authorization: "Bearer <token>" }
Body: { supervisorId, dateTime, mode: "ONLINE" | "IN_PERSON", notes }
```

---

## 🧪 Testing

### Option 1: Using the Bash Script
```bash
# Make executable
chmod +x test-api.sh

# Run all tests
./test-api.sh
```

### Option 2: Using Postman
1. Import `postman-collection.json` into Postman
2. Run requests in order (register → create profile → submit idea → etc.)
3. Tokens are automatically saved in collection variables

### Option 3: Using Frontend API Client
```typescript
import { authAPI, studentAPI, supervisorAPI } from '@/app/lib/api-client';

// Login
const { user, token } = await authAPI.login({
  email: 'student@test.com',
  password: 'student123'
});

// Get supervisors
const { supervisors } = await supervisorAPI.getAll({ available: true });

// Submit idea
const { idea } = await studentAPI.submitIdea({
  title: 'My Project',
  description: 'Description',
  category: 'AI',
  keywords: ['ml', 'ai']
});
```

---

## 🔧 Common Tasks

### Add a New Endpoint
1. Add handler function in `app/api/api-handlers.ts`
2. Create route file: `app/api/your-path/route.ts`
3. Export the handler in route file
4. Update API client: `app/lib/api-client.ts`
5. Update documentation: `API_DOCUMENTATION.md`

### Connect to Real Database
1. Install Prisma: `npm install prisma @prisma/client`
2. Initialize: `npx prisma init`
3. Define schema in `prisma/schema.prisma`
4. Replace in-memory arrays in `api-handlers.ts` with Prisma queries

### Add JWT Authentication
1. Install: `npm install jsonwebtoken bcrypt`
2. Replace `createToken()` with proper JWT signing
3. Replace `verifyToken()` with JWT verification
4. Replace `hashPassword()` with bcrypt

---

## 📚 Documentation Files

- **API_DOCUMENTATION.md** - Complete API reference with examples
- **API_IMPLEMENTATION_SUMMARY.md** - Implementation details and next steps
- **postman-collection.json** - Postman collection for testing
- **test-api.sh** - Automated test script

---

## ⚠️ Important Notes

### Current Implementation
- ✅ All 14 endpoints implemented
- ✅ Authentication & authorization
- ✅ Role-based access control
- ✅ Smart matching algorithm
- ✅ Request management workflow

### For Production
- ❌ Using in-memory storage (replace with database)
- ❌ Simple JWT implementation (use proper library)
- ❌ Basic password handling (use bcrypt)
- ❌ No rate limiting
- ❌ No input sanitization
- ❌ No file upload handling

### Next Steps
1. **Database**: Set up Prisma with PostgreSQL
2. **Security**: Implement proper JWT and password hashing
3. **Validation**: Add Zod or Joi for input validation
4. **Error Handling**: Centralized error handler
5. **Logging**: Add Winston or Pino
6. **Testing**: Unit and integration tests
7. **File Upload**: Add endpoint for file attachments

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### TypeScript errors
```bash
# Check for errors
npm run lint

# Rebuild
rm -rf .next
npm run build
```

### API returns 401 Unauthorized
- Make sure you're logged in
- Check token is included: `Authorization: Bearer <token>`
- Token may have expired (24 hours by default)

### No supervisors in recommendations
- Supervisor must create profile first
- Student must submit project idea first
- Keywords/tags must match for recommendations

---

## 💡 Tips

1. **Test in order**: Register → Create profile → Submit idea → Get matches → Send request → Accept/Decline → Book meeting

2. **Token management**: Tokens are automatically stored in localStorage when using the API client

3. **Role permissions**: Use correct role when registering (STUDENT vs SUPERVISOR)

4. **Matching algorithm**: More keyword matches = higher score

5. **Check availability**: Only supervisors with `currentSlots < maxSlots` appear as available

---

## 📞 Support

For issues or questions:
1. Check `API_DOCUMENTATION.md` for detailed endpoint info
2. Review `API_IMPLEMENTATION_SUMMARY.md` for architecture
3. Test with `test-api.sh` or Postman collection
4. Check console logs for error details

---

**Happy coding! 🎉**
