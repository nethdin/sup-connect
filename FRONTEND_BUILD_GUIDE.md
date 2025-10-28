# Sup-Connect Frontend - Build Guide

This is the frontend implementation of the **Supervisor Booking & Project Management System** built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

## 🚀 Project Overview

Sup-Connect is a web-based system that enables final-year students to:
- Discover and request academic supervisors by specialization
- Submit project ideas and receive supervisor recommendations
- Schedule meetings and track progress with their supervisor
- Receive notifications about requests, meetings, and feedback

## 📁 Project Structure

```
app/
├── components/
│   ├── auth/
│   │   ├── RegisterForm.tsx      # User registration form
│   │   └── LoginForm.tsx         # User login form
│   ├── supervisor/
│   │   ├── ProfileForm.tsx       # Supervisor profile creation
│   │   └── SupervisorCard.tsx    # Supervisor card component
│   ├── student/
│   │   ├── ProjectIdeaForm.tsx   # Project submission form
│   │   ├── RecommendationList.tsx # Recommended supervisors display
│   │   └── RequestList.tsx       # Booking requests list
│   ├── common/
│   │   ├── MeetingList.tsx       # Meeting display component
│   │   └── NotificationBell.tsx  # Notification dropdown
│   └── Navbar.tsx                # Navigation component
├── lib/
│   ├── types.ts                  # TypeScript type definitions
│   └── utils.ts                  # Utility functions and constants
├── dashboard/
│   └── page.tsx                  # Student dashboard
├── supervisor/
│   ├── profile/
│   │   └── page.tsx              # Supervisor profile setup
│   └── dashboard/
│       └── page.tsx              # Supervisor dashboard
├── student/
│   └── idea/
│       └── page.tsx              # Project idea submission page
├── supervisors/
│   └── page.tsx                  # Supervisors directory & filtering
├── register/
│   └── page.tsx                  # Registration page
├── login/
│   └── page.tsx                  # Login page
├── page.tsx                      # Landing page
├── layout.tsx                    # Root layout
└── globals.css                   # Global styles
```

## 🎨 Key Features Implemented

### ✅ Frontend Components

1. **Authentication**
   - Register form with role selection (Student/Supervisor)
   - Login form with validation
   - Form validation and error handling

2. **Supervisor Management**
   - Profile creation form with specialization and tags
   - Supervisor card component with slot availability
   - Browse and filter supervisors by specialization

3. **Project Ideas**
   - Submission form with validation (150-300 character description)
   - Keyword tagging system
   - File attachment support
   - Recommendation display based on matching algorithm

4. **Dashboard Pages**
   - Student dashboard: View assigned supervisor, meetings, progress updates
   - Supervisor dashboard: Manage student requests, view assignments
   - Quick action buttons and statistics

5. **Common Features**
   - Responsive navbar with role-based menu
   - Meeting list with notes and feedback display
   - Notification bell with dropdown
   - Request list for both students and supervisors
   - Real-time search and filtering

### 🎯 UI/UX Highlights

- **Fully responsive**: Mobile-first design, works on all devices
- **Tailwind CSS**: Modern, clean styling with utility classes
- **Accessible**: WCAG compliant color contrast and keyboard navigation
- **Dark mode ready**: Can be extended with dark mode support
- **Interactive forms**: Real-time validation and user feedback
- **Loading states**: Proper handling of async operations

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **UI Components**: Built from scratch (no external UI library)
- **State Management**: React hooks (useState)

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd sup-connect
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 🔌 API Integration (TODO)

The frontend is currently using mock data. To connect to the backend, replace the mock data calls with actual API endpoints:

### Key API Endpoints to Implement

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/supervisors` - Get all supervisors
- `GET /api/supervisors/:id` - Get specific supervisor
- `POST /api/supervisor/profile` - Create supervisor profile
- `POST /api/student/idea` - Submit project idea
- `GET /api/student/matches` - Get recommendation matches
- `POST /api/student/request` - Send booking request
- `GET /api/supervisor/requests` - Get pending requests
- `POST /api/supervisor/requests/:id/accept` - Accept request
- `POST /api/supervisor/requests/:id/decline` - Decline request
- `GET /api/meetings` - Get meetings
- `POST /api/availability/book` - Book a meeting slot

## 📝 Implementation Checklist

### Phase 1: Core Pages ✅
- [x] Landing page with features showcase
- [x] Registration page
- [x] Login page
- [x] Supervisor profile creation page
- [x] Project idea submission page
- [x] Supervisors directory page
- [x] Student dashboard
- [x] Supervisor dashboard

### Phase 2: Components ✅
- [x] Navbar with responsive menu
- [x] Form components with validation
- [x] Supervisor card component
- [x] Recommendation list component
- [x] Request list component
- [x] Meeting list component
- [x] Notification bell

### Phase 3: To Implement
- [ ] API integration and data fetching
- [ ] Authentication state management
- [ ] Protected routes and middleware
- [ ] Image upload handling
- [ ] Availability calendar/slots display
- [ ] Meeting scheduling interface
- [ ] Progress update form
- [ ] Feedback/notes editor
- [ ] Search and advanced filtering
- [ ] Pagination for large lists

## 🎨 Styling Notes

- **Color Scheme**: Blue (#2563EB) primary, gray neutrals
- **Typography**: Inter/system fonts for better readability
- **Spacing**: Consistent 4px grid system
- **Breakpoints**: Mobile-first approach with md and lg breakpoints

## 🔐 Security Considerations

Current frontend implementation needs:
- [ ] HTTPS enforcement
- [ ] CSRF token handling
- [ ] Input sanitization for all forms
- [ ] XSS protection
- [ ] Secure token storage (HttpOnly cookies recommended)

## 🧪 Testing (To Be Added)

- Unit tests for utility functions
- Component integration tests
- E2E tests for critical user flows
- Accessibility testing

## 📚 Component Documentation

### RegisterForm
Handles user registration with email, password, name, and role selection.

```tsx
<RegisterForm />
```

### LoginForm
Simple login form with email and password fields.

```tsx
<LoginForm />
```

### SupervisorCard
Displays supervisor information with request button.

```tsx
<SupervisorCard 
  supervisor={supervisor}
  onViewClick={handleView}
  onRequestClick={handleRequest}
/>
```

### ProjectIdeaForm
Form for students to submit project ideas with validation.

```tsx
<ProjectIdeaForm onSubmit={handleSubmit} />
```

### RecommendationList
Displays ranked recommendations based on matching score.

```tsx
<RecommendationList 
  recommendations={recs}
  onRequest={handleRequest}
/>
```

## 🚀 Deployment

The application can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Self-hosted servers**

### Vercel Deployment
```bash
npm run build
vercel deploy
```

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [SRS Document](../SRS.md)

## 🤝 Contributing

When adding new features:
1. Follow the existing component structure
2. Add TypeScript types for all props
3. Maintain responsive design
4. Add proper error handling
5. Include form validation where applicable

## 📄 License

This project is part of a university assignment. All rights reserved.

## 👥 Team

- **Project Owner**: Nethesh
- **Frontend Developer**: [Your Name]

---

**Last Updated**: October 28, 2025
**Status**: Frontend Build Complete - Ready for Backend Integration
