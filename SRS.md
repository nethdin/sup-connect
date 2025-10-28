# Software Requirements Specification (SRS)

**Project:** Final-Year Supervisor Booking & Project Management System
**Author:** Nethesh (project owner)
**Date:** 2025-10-27

> This SRS documents the functional and non-functional requirements, architecture overview, data model, interfaces, use-cases, acceptance criteria, test-plan outline, risk & ethics considerations, and a delivery checklist for the Final-Year Supervisor Booking & Project Management System.

---

# 1. Introduction

## 1.1 Purpose

This SRS describes the requirements for a web-based system that enables final-year students to discover and request academic supervisors by specialization, submit project ideas, receive supervisor recommendations, get formally assigned to a supervisor, and maintain weekly collaboration (meeting scheduling, progress updates, feedback) for the duration of the final-year project.

## 1.2 Intended audience

* Project supervisor / examiners
* Project developer (you)
* Testers / demonstrators
* Future maintainers / university admin

## 1.3 Scope

The system supports Student and Supervisor roles (and optional Admin). Key capabilities:

* Supervisor discovery (by category & tags)
* Project idea submission & recommended supervisor ranking (rule-based + optional LLM classifier)
* Booking request workflow with slot (capacity) control and transactional acceptance
* Assignment record (one supervisor per student)
* Meeting scheduling with availability slots and booking (prevents double-booking)
* Progress updates and meeting notes / feedback storage
* In-app notifications (and optional email reminders)
* Role-based access control (RBAC) and data protection

Excluded: LMS integration, native mobile app, real-time video conferencing, advanced NLP beyond classification.

---

# 2. Definitions, Acronyms, Abbreviations

* SRS: Software Requirements Specification
* LLM: Large Language Model (e.g., OpenAI)
* RBAC: Role-Based Access Control
* API: Application Programming Interface
* CRUD: Create, Read, Update, Delete

---

# 3. Overall description

## 3.1 Product perspective

Standalone web application (single codebase) built using Next.js + TypeScript. Backend via Next.js API routes with Prisma + PostgreSQL. Optional integration with OpenAI (chatbot classification). Authentication via NextAuth or JWT.

## 3.2 User roles & brief responsibilities

* **Student**: register/login, browse supervisors, submit project idea, get recommendations, send booking request, view request status, view assigned supervisor, schedule meetings, submit progress updates, view meeting history and feedback.
* **Supervisor**: register/login, create/update profile (specialization, tags, max slots), accept/decline requests, manage assigned students, define availability, schedule meetings, add meeting notes and feedback.
* **Admin (optional)**: manage users, reset slots, import student lists, override assignments, generate reports.

## 3.3 Operating environment

* Cloud / local: Vercel / Render / Heroku for Next.js; PostgreSQL (managed) for DB
* Browsers: modern Chrome/Edge/Firefox/Safari (desktop & mobile responsive)
* Dev stack: Next.js (App Router), TypeScript, Prisma, PostgreSQL, OpenAI API (optional), custom CSS

## 3.4 Design & implementation constraints

* One assignment per student (DB unique constraint).
* Supervisor currentSlots must never exceed maxSlots — required transactional enforcement.
* Data privacy: store only necessary PII, protect uploads, use HTTPS.

---

# 4. Functional requirements

Each requirement has a code (FR-###).

## 4.1 Authentication & Authorization

* **FR-001**: The system shall allow user registration with role selection (Student or Supervisor).
* **FR-002**: The system shall provide secure login for registered users.
* **FR-003**: The system shall enforce RBAC: Student endpoints accessible only to students, supervisor endpoints only to supervisors, admin endpoints to admins.

## 4.2 Supervisor profile management

* **FR-010**: The system shall allow supervisors to create and edit a profile including: name, contact email, specialization (single), tags (array), bio, maxSlots (integer), profile picture (optional).
* **FR-011**: The system shall suggest specializations from the text input using a keyword matching algorithm (optional LLM suggestion).

## 4.3 Supervisor discovery & listing

* **FR-020**: The system shall display all supervisors grouped or filterable by specialization.
* **FR-021**: Supervisor cards will show name, specialization, tags, currentSlots / maxSlots, brief bio and action (View / Request).

## 4.4 Project idea submission & matching

* **FR-030**: The system shall provide a project idea form with Title, Description (150–300 words recommended), Category (drop-down), Keywords (comma-separated), attachments (optional).
* **FR-031**: On submit, the system shall persist the idea and run the recommendation engine to return ranked supervisors.
* **FR-032**: The recommendation engine shall apply a rule-based scoring: +5 for category == specialization, +2 for each keyword–tag match. (LLM classification may be used to map free-text ideas to a category—optional.)
* **FR-033**: The system shall present the top-N recommended supervisors to the student.

## 4.5 Booking request workflow

* **FR-040**: The student may send a booking request to a supervisor (Request created with status= PENDING).
* **FR-041**: The system shall prevent creating a booking request if supervisor.currentSlots >= supervisor.maxSlots and return SLOT_FULL.
* **FR-042**: Supervisors shall view incoming requests and accept or decline each.
* **FR-043**: When supervisor accepts, the system must perform a transactional check/lock to ensure currentSlots < maxSlots, then:

  * create Assignment (studentId unique),
  * increment supervisor.currentSlots,
  * set request status = ACCEPTED.
* **FR-044**: If the accept operation fails because slots are full or student already assigned, the request status shall be set to SLOT_FULL or DECLINED accordingly.

## 4.6 Assignment & post-assignment actions

* **FR-050**: The system shall show assigned supervisor details to the student on their dashboard.
* **FR-051**: The system shall prevent a student from being assigned to more than one supervisor.

## 4.7 Availability & meeting scheduling

* **FR-060**: Supervisors shall be able to create availability slots (day-of-week or specific date/time ranges), each slot with startTime, endTime.
* **FR-061**: Students assigned to a supervisor shall be able to view available slots and book a free slot.
* **FR-062**: The system shall enforce atomic booking (row lock / transaction) so two students cannot book the same slot concurrently.
* **FR-063**: When a slot is booked, a Meeting record shall be created and the slot marked as booked with studentId.

## 4.8 Progress updates & meeting notes

* **FR-070**: Students shall be able to submit periodic progress updates (title, text, file links) visible to the supervisor.
* **FR-071**: Supervisors shall be able to add notes/feedback to meetings and to progress updates.

## 4.9 Notifications

* **FR-080**: The system shall deliver in-app notifications for key events: request submitted, accepted/declined, slot booked, meeting scheduled, feedback posted.
* **FR-081**: Optionally, the system shall send email notifications for the same events if email config is provided.

## 4.10 Admin functions (optional)

* **FR-090**: Admins can create/update supervisor records, override slot counts, force-assign or unassign students.

---

# 5. Non-functional requirements

## 5.1 Performance

* **NFR-001**: The system shall support at least 500 concurrent students and 50 supervisors with acceptable response times (P95 < 400ms under baseline simulated load).
* **NFR-002**: Booking accept flow transactions must complete within 2 seconds recommended on typical infra.

## 5.2 Security

* **NFR-010**: All communication will use HTTPS.
* **NFR-011**: Passwords must be stored using a modern hashing algorithm (bcrypt/argon2).
* **NFR-012**: Role checks must be enforced server-side.
* **NFR-013**: Access to attachments must be authenticated and signed URLs used for downloads.

## 5.3 Reliability & data integrity

* **NFR-020**: No over-assignment should be possible (slot count integrity enforced by DB transactions).
* **NFR-021**: Regular DB backups should be configured.

## 5.4 Usability & accessibility

* **NFR-030**: UI must be responsive and usable from 1024×768 down to typical mobile sizes.
* **NFR-031**: Basic WCAG contrast and keyboard navigation support.

## 5.5 Maintainability & Extensibility

* **NFR-040**: Codebase structured in modular components and clear API routes; Prisma schema for DB.

## 5.6 Privacy

* **NFR-050**: Collect only necessary PII; comply with university data handling policies; include consent screens where required.

---

# 6. System models & data design

## 6.1 High-level entity list

* User (id, name, email, passwordHash, role)
* SupervisorProfile (userId, specialization, tags[], bio, maxSlots, currentSlots)
* StudentProjectIdea (id, studentId, title, description, category, keywords[], attachments[], createdAt)
* BookingRequest (id, studentId, supervisorId, status, createdAt, respondedAt)
* Assignment (id, studentId unique, supervisorId, assignedAt)
* AvailabilitySlot (id, supervisorId, date OR dayOfWeek, startTime, endTime, isBooked, studentId)
* Meeting (id, studentId, supervisorId, dateTime, mode, notes, createdAt)
* ProgressUpdate (id, studentId, supervisorId, title, description, attachments, createdAt)
* Notification (id, userId, type, body, read, createdAt)

## 6.2 Sample Prisma schema excerpt (conceptual)

(Already provided earlier in conversation—use that as implementation.)

## 6.3 ER Diagram (textual)

* User 1 — 1 SupervisorProfile
* User 1 — * StudentProjectIdea
* User (student) 1 — 1 Assignment — 1 — User (supervisor)
* SupervisorProfile 1 — * AvailabilitySlot
* AvailabilitySlot 1 — 0/1 Meeting (when booked)
* Meeting links supervisor & student
* BookingRequest links student & supervisor (status flows)

---

# 7. Use cases (primary)

Use cases are listed with ID, actor, preconditions, main flow, alternative flows.

## UC-01: Register as User (Student / Supervisor)

* **Actor:** Student / Supervisor
* **Precondition:** None
* **Main flow:** User signs up -> email & password -> picks role -> receives confirmation -> profile created (student minimal, supervisor prompted for profile details).
* **Alt:** If user already exists -> show error.

## UC-02: Supervisor creates profile

* **Actor:** Supervisor
* **Precondition:** Logged in as supervisor
* **Main flow:** Fill specialization, tags, bio, maxSlots -> save -> optionally run suggestion algorithm -> profile saved.

## UC-03: Student submits project idea & gets recommendations

* **Actor:** Student
* **Precond:** Logged in
* **Main flow:** Student fills idea form -> submit -> backend persists idea -> backend runs matching algorithm (or calls chatbot classify endpoint) -> returns ranked list -> student sees recommendations -> optionally request booking for chosen supervisor.

## UC-04: Student sends booking request

* **Actor:** Student
* **Precond:** Logged in and has chosen supervisor
* **Main flow:** Click request -> server checks supervisor slot availability -> if slots remaining create BookingRequest(PENDING), send notification to supervisor -> show "Pending" in student requests.

## UC-05: Supervisor accepts/declines

* **Actor:** Supervisor
* **Precond:** Logged in supervisor with pending requests
* **Main flow accept:** Click Accept -> backend transaction checks currentSlots < maxSlots -> create Assignment and increment slot count -> update request status ACCEPTED -> notify student.
* **Alt:** If slots full -> status SLOT_FULL -> notify student.
* **Decline flow:** Click Decline -> set request status DECLINED -> notify student.

## UC-06: Student books meeting slot

* **Actor:** Student (assigned)
* **Precond:** Student has Assignment
* **Main flow:** View supervisor availability -> click an available slot -> backend locks slot row and marks booked -> create Meeting -> notify supervisor & student.

## UC-07: Supervisor adds meeting notes & feedback

* **Actor:** Supervisor
* **Main flow:** Open meeting -> add notes/feedback -> save -> student notified.

## UC-08: Student uploads progress update

* **Actor:** Student
* **Main flow:** Upload title, description, files -> saved -> notify supervisor.

---

# 8. External interfaces

## 8.1 User Interfaces (high-level)

* Landing page: intro + login/register CTA
* Login/Register pages
* Student dashboard: assigned supervisor card, upcoming meetings, progress updates, recommended supervisors area (if unassigned), notifications.
* Supervisor dashboard: incoming requests list, assigned students list, availability manager, meetings list.
* Admin dashboard (optional).

UI components should be modular, accessible, and responsive. Provide server-side rendering for SEO where public pages are needed (e.g., landing).

## 8.2 API Endpoints (representative)

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/supervisors?category=`
* `GET /api/supervisors/:id`
* `POST /api/supervisor/profile`
* `POST /api/student/idea`
* `GET /api/student/matches?ideaId=`
* `POST /api/student/request`
* `GET /api/supervisor/requests`
* `POST /api/supervisor/requests/:id/accept`
* `POST /api/supervisor/requests/:id/decline`
* `POST /api/availability` (supervisor adds slots)
* `GET /api/availability?supervisorId=`
* `POST /api/availability/book`
* `GET /api/meetings?userId=&role=`
* `POST /api/notifications/mark-read`

Note: All endpoints require authentication tokens (cookies/JWT).

---

# 9. Sequence & state diagrams (textual)

## 9.1 Booking accept sequence (critical transaction)

1. Supervisor clicks Accept on request.
2. Server begins DB transaction.
3. Lock supervisorProfile row `FOR UPDATE` (or use Prisma transaction + SELECT ... FOR UPDATE pattern).
4. Read currentSlots & maxSlots.

   * If currentSlots >= maxSlots: update BookingRequest.status = SLOT_FULL; commit; return SLOT_FULL.
   * Else:

     * Create Assignment(studentId, supervisorId) (studentId unique constraint ensure student not already assigned)
     * Update supervisorProfile.currentSlots += 1
     * Update BookingRequest.status = ACCEPTED; respondedAt = now
     * Commit transaction
5. Notify student.

## 9.2 Meeting booking sequence

1. Student chooses slot -> sends booking request.
2. Server starts transaction -> SELECT slot FOR UPDATE -> if isBooked return error -> else mark isBooked true and set studentId -> create Meeting record -> commit -> notify users.

---

# 10. Functional requirements matrix (summary)

(Short table of FR IDs mapping to features, already listed in Section 4. Use in handout.)

---

# 11. Acceptance criteria & test cases (summary)

### 11.1 Acceptance criteria (high level)

* Students can submit project ideas; top-5 recommended supervisors returned.
* Student can create a booking request; supervisor receives notification.
* Supervisor can accept and assign, and DB does not allow over-assigning beyond maxSlots.
* Assigned student sees supervisor on dashboard.
* Students can book available meeting slots; double-booking prevented.
* Role access enforced; unauthorized access denied.

### 11.2 Example test cases

* **TC-01**: Submit idea with keywords → returned supervisors include correct category (unit test for matcher).
* **TC-02**: 100 parallel students request last available slot → only one assignment is created and others receive slot-full (concurrency test).
* **TC-03**: Student books same meeting slot concurrently from two browsers -> only one booking succeeds (race condition test).
* **TC-04**: Supervisor reaches maxSlots and new requests are rejected/marked slot_full.
* **TC-05**: Student dashboard shows assigned supervisor after acceptance.

Testing must include unit tests, integration tests, and at least one concurrent load test for booking concurrency.

---

# 12. Non-functional test checklist

* Load test for 500 concurrent students, 50 supervisors.
* Security scan (OWASP ZAP) on dev site.
* Accessibility checks (contrast, tab navigation).
* Backup/restore test for DB.

---

# 13. Deployment & environment

## 13.1 Environments

* Development: local (Next.js, local Postgres)
* Staging: deployed to platform (Vercel/Render), connected to staging DB
* Production: hosted on Vercel/Render; managed Postgres (Heroku Postgres, Aiven, or Neon)

## 13.2 Config & secrets

* `.env` variables: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET (or JWT secret), OPENAI_API_KEY (optional), SMTP config (optional).
* Secrets must not be committed to repo.

## 13.3 Backup & monitoring

* Daily DB backup recommended.
* Error tracking via Sentry or similar.
* Logging for booking/assignment events.

---

# 14. Security & privacy considerations

* Use HTTPS everywhere.
* Hash passwords (bcrypt/argon2).
* Least privilege: only expose data relevant to the requesting user.
* Secure file uploads (virus-scanning optional); use signed URLs or cloud storage ACLs.
* Keep logs of sensitive events but avoid storing raw PII in logs.
* Provide an ethics form & consent for using project data in testing (required by assignment).

---

# 15. Ethics & user data handling

* Student and supervisor data are personal; obtain student consent for testing and storage.
* The Ethics Application must be completed and signed by student and supervisor prior to any real-user testing (assignment requirement).
* Anonymize dataset when demonstrating or sharing outputs externally.

---

# 16. Risks & mitigation

* **Race conditions in slot/assignment** → mitigation: DB transactions and row locks, uniqueness constraints.
* **Misclassification of ideas** → mitigation: show recommended supervisors as suggestions and allow manual choice.
* **Supervisor overload / abuse** → mitigation: maxSlots enforced; admin override.
* **Data leaks** → mitigation: secure uploads, role checks, encrypted transport.
* **Costs from LLM usage** → mitigation: make AI optional and use rule-based fallback for core flows.

---

# 17. Project timeline & milestones (high level — pick dates to match your submission schedule)

Provide this as a Gantt in your handout. Example milestones:

* Week 1: Finalize SRS, DB schema, environment setup
* Week 2: Auth + basic UI (+ supervisor profile)
* Week 3: Supervisor directory & idea form + rule-based matcher
* Week 4: Booking request flow + supervisor requests UI
* Week 5: Transactional accept logic + assignment + tests for concurrency
* Week 6: Availability & meeting booking + progress updates
* Week 7: Notifications, finalize UI, accessibility fixes
* Week 8: Testing (unit, integration, load), prepare final report, presentation

(Adjust weeks/dates to match your university deadlines.)

---

# 18. Appendices

## Appendix A — Example API payloads

**Submit Idea**

```json
POST /api/student/idea
{
  "title": "Plant disease detection",
  "description": "Use CNN to detect leaf diseases...",
  "category": "AI/ML",
  "keywords": ["deep learning","cnn","image classification"]
}
```

**Request Booking**

```json
POST /api/student/request
{
  "studentId": "stu_cuid",
  "supervisorId": "sup_cuid"
}
```

**Accept Request**

```json
POST /api/supervisor/requests/:requestId/accept
{
  "requestId": "req_cuid"
}
```

**Book Slot**

```json
POST /api/availability/book
{
  "slotId": "slot_cuid",
  "studentId": "stu_cuid"
}
```

## Appendix B — Priority of requirements

* **Must**: Authentication, Supervisor profiles, Idea submission & persistence, Booking request flow, transactional accept, assignment enforcement, meetings booking with atomicity.
* **Should**: Notifications, AI chatbot classification, progress updates, admin panel.
* **Could**: Calendar integrations, email reminders, analytics dashboard.
* **Won’t (this version)**: Native mobile app, real-time video, full LMS integration.

---

# 19. Deliverables

* Full source code (Next.js project) with README.
* Database schema & migrations (Prisma).
* Test plan & test reports (unit, integration, concurrency).
* Presentation slides + one-page handout.
* Signed Ethics Application.
* Deployed demo link (optional).

---

# 20. Final notes / next actions (for you)

1. Use this SRS as the baseline for the PPRS submission. Extract sections for the slide deck and the handout.
2. Implement DB schema from Section 6 (Prisma).
3. Implement booking accept flow with DB transaction & unique constraints first (critical).
4. Add tests for concurrent booking/accept to prove reliability.
5. Prepare Ethics Application and get supervisor signature prior to any live testing.
