# API Documentation

This document provides detailed information about all REST API endpoints implemented in the sup-connect application.

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using a Bearer token. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

---

## Auth Endpoints

### Register User
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "STUDENT" // or "SUPERVISOR" or "ADMIN"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  },
  "token": "eyJhbGc..."
}
```

---

### Login User
**POST** `/api/auth/login`

Authenticate and receive a token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  },
  "token": "eyJhbGc..."
}
```

---

## Supervisor Endpoints

### Get All Supervisors
**GET** `/api/supervisors`

Retrieve list of all supervisors with optional filters.

**Query Parameters:**
- `specialization` (optional): Filter by specialization
- `available` (optional): "true" to get only available supervisors

**Response (200):**
```json
{
  "supervisors": [
    {
      "id": "sup123",
      "userId": "user123",
      "specialization": "Machine Learning",
      "tags": ["AI", "Deep Learning", "NLP"],
      "bio": "Expert in ML and AI",
      "maxSlots": 5,
      "currentSlots": 2,
      "user": {
        "id": "user123",
        "email": "supervisor@example.com",
        "name": "Dr. Smith"
      }
    }
  ],
  "total": 1
}
```

---

### Get Supervisor by ID
**GET** `/api/supervisors/:id`

Get details of a specific supervisor.

**Response (200):**
```json
{
  "supervisor": {
    "id": "sup123",
    "userId": "user123",
    "specialization": "Machine Learning",
    "tags": ["AI", "Deep Learning"],
    "bio": "Expert in ML",
    "maxSlots": 5,
    "currentSlots": 2,
    "user": {
      "id": "user123",
      "name": "Dr. Smith"
    }
  }
}
```

---

### Create Supervisor Profile
**POST** `/api/supervisor/profile`

Create a supervisor profile (requires SUPERVISOR role).

**Headers:**
```
Authorization: Bearer <supervisor-token>
```

**Request Body:**
```json
{
  "specialization": "Machine Learning",
  "tags": ["AI", "Deep Learning", "NLP"],
  "bio": "Expert in ML with 10 years experience",
  "maxSlots": 5
}
```

**Response (201):**
```json
{
  "message": "Profile created successfully",
  "profile": {
    "id": "sup123",
    "userId": "user123",
    "specialization": "Machine Learning",
    "tags": ["AI", "Deep Learning", "NLP"],
    "bio": "Expert in ML with 10 years experience",
    "maxSlots": 5,
    "currentSlots": 0
  }
}
```

---

## Student Endpoints

### Submit Project Idea
**POST** `/api/student/idea`

Submit a project idea (requires STUDENT role).

**Headers:**
```
Authorization: Bearer <student-token>
```

**Request Body:**
```json
{
  "title": "AI Chatbot for Customer Service",
  "description": "Build an intelligent chatbot using NLP",
  "category": "Artificial Intelligence",
  "keywords": ["NLP", "chatbot", "machine learning"],
  "attachments": ["file1.pdf", "file2.pdf"]
}
```

**Response (201):**
```json
{
  "message": "Project idea submitted successfully",
  "idea": {
    "id": "idea123",
    "studentId": "student123",
    "title": "AI Chatbot for Customer Service",
    "description": "Build an intelligent chatbot using NLP",
    "category": "Artificial Intelligence",
    "keywords": ["NLP", "chatbot", "machine learning"],
    "attachments": ["file1.pdf"],
    "createdAt": "2025-10-30T10:00:00.000Z"
  }
}
```

---

### Get Recommendation Matches
**GET** `/api/student/matches`

Get recommended supervisors based on project idea (requires STUDENT role).

**Headers:**
```
Authorization: Bearer <student-token>
```

**Response (200):**
```json
{
  "recommendations": [
    {
      "supervisor": {
        "id": "sup123",
        "specialization": "Machine Learning",
        "tags": ["AI", "NLP"],
        "bio": "Expert in ML",
        "user": {
          "name": "Dr. Smith"
        }
      },
      "score": 30,
      "matchedTags": ["NLP", "machine learning"]
    }
  ],
  "projectIdea": {
    "id": "idea123",
    "title": "AI Chatbot for Customer Service"
  }
}
```

---

### Send Booking Request
**POST** `/api/student/request`

Send a booking request to a supervisor (requires STUDENT role).

**Headers:**
```
Authorization: Bearer <student-token>
```

**Request Body:**
```json
{
  "supervisorId": "sup123"
}
```

**Response (201):**
```json
{
  "message": "Booking request sent successfully",
  "request": {
    "id": "req123",
    "studentId": "student123",
    "supervisorId": "sup123",
    "status": "PENDING",
    "createdAt": "2025-10-30T10:00:00.000Z"
  }
}
```

---

## Supervisor Request Management

### Get Supervisor Requests
**GET** `/api/supervisor/requests`

Get booking requests for the supervisor (requires SUPERVISOR role).

**Headers:**
```
Authorization: Bearer <supervisor-token>
```

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, ACCEPTED, DECLINED, SLOT_FULL)

**Response (200):**
```json
{
  "requests": [
    {
      "id": "req123",
      "studentId": "student123",
      "supervisorId": "sup123",
      "status": "PENDING",
      "createdAt": "2025-10-30T10:00:00.000Z",
      "student": {
        "id": "student123",
        "name": "John Doe",
        "email": "student@example.com"
      },
      "supervisor": {
        "id": "sup123",
        "specialization": "Machine Learning"
      }
    }
  ],
  "total": 1
}
```

---

### Accept Booking Request
**POST** `/api/supervisor/requests/:id/accept`

Accept a booking request (requires SUPERVISOR role).

**Headers:**
```
Authorization: Bearer <supervisor-token>
```

**Response (200):**
```json
{
  "message": "Request accepted successfully",
  "request": {
    "id": "req123",
    "studentId": "student123",
    "supervisorId": "sup123",
    "status": "ACCEPTED",
    "createdAt": "2025-10-30T10:00:00.000Z",
    "respondedAt": "2025-10-30T11:00:00.000Z"
  }
}
```

---

### Decline Booking Request
**POST** `/api/supervisor/requests/:id/decline`

Decline a booking request (requires SUPERVISOR role).

**Headers:**
```
Authorization: Bearer <supervisor-token>
```

**Response (200):**
```json
{
  "message": "Request declined successfully",
  "request": {
    "id": "req123",
    "studentId": "student123",
    "supervisorId": "sup123",
    "status": "DECLINED",
    "createdAt": "2025-10-30T10:00:00.000Z",
    "respondedAt": "2025-10-30T11:00:00.000Z"
  }
}
```

---

## Meeting Endpoints

### Get Meetings
**GET** `/api/meetings`

Get meetings for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `upcoming` (optional): "true" to get only upcoming meetings

**Response (200):**
```json
{
  "meetings": [
    {
      "id": "meeting123",
      "studentId": "student123",
      "supervisorId": "sup123",
      "dateTime": "2025-11-01T14:00:00.000Z",
      "mode": "ONLINE",
      "notes": "Discuss project proposal",
      "createdAt": "2025-10-30T10:00:00.000Z",
      "student": {
        "name": "John Doe"
      },
      "supervisor": {
        "specialization": "Machine Learning"
      }
    }
  ],
  "total": 1
}
```

---

### Book Meeting Slot
**POST** `/api/availability/book`

Book a meeting slot.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "supervisorId": "sup123",
  "dateTime": "2025-11-01T14:00:00.000Z",
  "mode": "ONLINE",
  "notes": "Discuss project proposal"
}
```

**Response (201):**
```json
{
  "message": "Meeting booked successfully",
  "meeting": {
    "id": "meeting123",
    "studentId": "student123",
    "supervisorId": "sup123",
    "dateTime": "2025-11-01T14:00:00.000Z",
    "mode": "ONLINE",
    "notes": "Discuss project proposal",
    "createdAt": "2025-10-30T10:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "error": "Missing required fields"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**409 Conflict:**
```json
{
  "error": "Resource already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Notes

- **Authentication**: The current implementation uses a simple base64-encoded JWT. In production, use a proper JWT library like `jsonwebtoken`.
- **Database**: Currently using in-memory storage. Replace with a real database (PostgreSQL, MongoDB, etc.) for production.
- **Password Hashing**: Use bcrypt or argon2 for secure password hashing in production.
- **Validation**: Consider using libraries like Zod or Joi for request validation.
- **Rate Limiting**: Implement rate limiting to prevent abuse.
- **CORS**: Configure CORS settings based on your frontend deployment.

---

## Testing the API

You can test the API using curl, Postman, or any HTTP client:

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"pass123","name":"Test Student","role":"STUDENT"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"pass123"}'

# Get supervisors (with token from login)
curl http://localhost:3000/api/supervisors \
  -H "Authorization: Bearer <your-token>"
```
