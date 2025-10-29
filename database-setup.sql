-- ================================================
-- sup-connect Database Schema
-- Database: railway (MySQL)
-- ================================================

USE railway;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS progress_updates;
DROP TABLE IF EXISTS meetings;
DROP TABLE IF EXISTS availability_slots;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS booking_requests;
DROP TABLE IF EXISTS project_ideas;
DROP TABLE IF EXISTS supervisor_profiles;
DROP TABLE IF EXISTS users;

-- ================================================
-- Users Table
-- ================================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'SUPERVISOR', 'ADMIN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Supervisor Profiles Table
-- ================================================
CREATE TABLE supervisor_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    specialization VARCHAR(255) NOT NULL,
    tags JSON NOT NULL,
    bio TEXT NOT NULL,
    max_slots INT NOT NULL DEFAULT 5,
    current_slots INT NOT NULL DEFAULT 0,
    profile_picture VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_specialization (specialization),
    INDEX idx_current_slots (current_slots),
    INDEX idx_max_slots (max_slots)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Project Ideas Table
-- ================================================
CREATE TABLE project_ideas (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    keywords JSON NOT NULL,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Booking Requests Table
-- ================================================
CREATE TABLE booking_requests (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    supervisor_id VARCHAR(36) NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'SLOT_FULL') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES supervisor_profiles(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_supervisor_id (supervisor_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    UNIQUE KEY unique_pending_request (student_id, supervisor_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Assignments Table
-- ================================================
CREATE TABLE assignments (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL UNIQUE,
    supervisor_id VARCHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES supervisor_profiles(id) ON DELETE CASCADE,
    INDEX idx_supervisor_id (supervisor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Availability Slots Table
-- ================================================
CREATE TABLE availability_slots (
    id VARCHAR(36) PRIMARY KEY,
    supervisor_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    booked_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supervisor_id) REFERENCES supervisor_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (booked_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_supervisor_id (supervisor_id),
    INDEX idx_date (date),
    INDEX idx_is_booked (is_booked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Meetings Table
-- ================================================
CREATE TABLE meetings (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    supervisor_id VARCHAR(36) NOT NULL,
    date_time TIMESTAMP NOT NULL,
    mode ENUM('IN_PERSON', 'ONLINE') NOT NULL,
    notes TEXT,
    feedback TEXT,
    slot_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES supervisor_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES availability_slots(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_supervisor_id (supervisor_id),
    INDEX idx_date_time (date_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Progress Updates Table
-- ================================================
CREATE TABLE progress_updates (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    supervisor_id VARCHAR(36) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES supervisor_profiles(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_supervisor_id (supervisor_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Notifications Table
-- ================================================
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM(
        'REQUEST_SUBMITTED',
        'REQUEST_ACCEPTED',
        'REQUEST_DECLINED',
        'SLOT_BOOKED',
        'MEETING_SCHEDULED',
        'FEEDBACK_POSTED',
        'PROGRESS_UPDATE'
    ) NOT NULL,
    body TEXT NOT NULL,
    related_id VARCHAR(36),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- Insert Sample Data (Optional - for testing)
-- ================================================

-- Sample Student
INSERT INTO users (id, email, password, name, role) VALUES
('student-001', 'student@test.com', '$2b$10$YourHashedPasswordHere', 'John Student', 'STUDENT');

-- Sample Supervisor
INSERT INTO users (id, email, password, name, role) VALUES
('supervisor-001', 'supervisor@test.com', '$2b$10$YourHashedPasswordHere', 'Dr. Jane Smith', 'SUPERVISOR');

-- Sample Supervisor Profile
INSERT INTO supervisor_profiles (id, user_id, specialization, tags, bio, max_slots, current_slots) VALUES
('profile-001', 'supervisor-001', 'Machine Learning', 
 '["AI", "Deep Learning", "NLP", "Computer Vision"]', 
 'Expert in Machine Learning with 10 years of research experience in AI and neural networks.',
 5, 0);

-- ================================================
-- Useful Queries
-- ================================================

-- View all users
-- SELECT * FROM users;

-- View all supervisors with their profiles
-- SELECT u.*, sp.* 
-- FROM users u 
-- JOIN supervisor_profiles sp ON u.id = sp.user_id 
-- WHERE u.role = 'SUPERVISOR';

-- View available supervisors
-- SELECT u.name, sp.specialization, sp.current_slots, sp.max_slots
-- FROM supervisor_profiles sp
-- JOIN users u ON sp.user_id = u.id
-- WHERE sp.current_slots < sp.max_slots;

-- View all pending booking requests
-- SELECT 
--     br.id,
--     s.name AS student_name,
--     u.name AS supervisor_name,
--     br.status,
--     br.created_at
-- FROM booking_requests br
-- JOIN users s ON br.student_id = s.id
-- JOIN supervisor_profiles sp ON br.supervisor_id = sp.id
-- JOIN users u ON sp.user_id = u.id
-- WHERE br.status = 'PENDING';

-- View upcoming meetings
-- SELECT 
--     m.id,
--     s.name AS student_name,
--     u.name AS supervisor_name,
--     m.date_time,
--     m.mode
-- FROM meetings m
-- JOIN users s ON m.student_id = s.id
-- JOIN supervisor_profiles sp ON m.supervisor_id = sp.id
-- JOIN users u ON sp.user_id = u.id
-- WHERE m.date_time > NOW()
-- ORDER BY m.date_time ASC;
