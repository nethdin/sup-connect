-- ============================================
-- DATABASE SEED DATA FOR SUP-CONNECT
-- ============================================
-- This file contains comprehensive dummy data for testing all application features
-- Run this after creating the schema with database-schema.sql

USE `railway`;

-- Clear existing data (in correct order to respect foreign keys)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `progress_updates`;
TRUNCATE TABLE `meetings`;
TRUNCATE TABLE `availability_slots`;
TRUNCATE TABLE `assignments`;
TRUNCATE TABLE `booking_requests`;
TRUNCATE TABLE `project_ideas`;
TRUNCATE TABLE `supervisor_profiles`;
TRUNCATE TABLE `student_profiles`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- USERS - 15 total (3 admin, 5 supervisors, 7 students)
-- ============================================
-- Password for all users: "password123"
-- Hash: $2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`) VALUES
-- Admins
('admin-001', 'admin@university.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'Dr. Admin Smith', 'ADMIN', '2024-01-01 08:00:00'),
('admin-002', 'registrar@university.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'Jane Registrar', 'ADMIN', '2024-01-01 08:00:00'),
('admin-003', 'coordinator@university.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'Prof. Coordinator', 'ADMIN', '2024-01-01 08:00:00'),

-- Supervisors
('sup-001', 'dr.anderson@university.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'Dr. Sarah Anderson', 'SUPERVISOR', '2024-01-15 09:00:00'),
('sup-002', 'prof.chen@university.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'Prof. Michael Chen', 'SUPERVISOR', '2024-01-15 09:15:00'),
('sup-003', 'dr.patel@university.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'Dr. Priya Patel', 'SUPERVISOR', '2024-01-15 09:30:00'),
('sup-004', 'prof.johnson@university.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'Prof. James Johnson', 'SUPERVISOR', '2024-01-15 09:45:00'),
('sup-005', 'dr.williams@university.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'Dr. Emily Williams', 'SUPERVISOR', '2024-01-15 10:00:00'),

-- Students
('stu-001', 'alice.student@uni.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'Alice Thompson', 'STUDENT', '2024-02-01 10:00:00'),
('stu-002', 'bob.learner@uni.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'Bob Martinez', 'STUDENT', '2024-02-01 10:15:00'),
('stu-003', 'carol.research@uni.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'Carol Davis', 'STUDENT', '2024-02-01 10:30:00'),
('stu-004', 'david.tech@uni.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'David Lee', 'STUDENT', '2024-02-01 10:45:00'),
('stu-005', 'emma.coder@uni.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'Emma Wilson', 'STUDENT', '2024-02-01 11:00:00'),
('stu-006', 'frank.dev@uni.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'Frank Brown', 'STUDENT', '2024-02-01 11:15:00'),
('stu-007', 'grace.ai@uni.edu', '$2b$10$rKZU3J3HhPYHPz3HhXxYJ.L8WvKQKhZ3qQHZhXxYJ.L8WvKQKhZ3q', 'Grace Kumar', 'STUDENT', '2024-02-01 11:30:00');

-- ============================================
-- SUPERVISOR PROFILES
-- ============================================
INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `max_slots`, `current_slots`, `profile_picture`) VALUES
-- Dr. Anderson - AI/ML specialist with 2/5 slots filled
('sup-profile-001', 'sup-001', 'Computer Science', 'AI/ML', 
 '["Machine Learning", "Deep Learning", "Neural Networks", "Computer Vision", "NLP", "TensorFlow", "PyTorch"]',
 'Passionate researcher in artificial intelligence with over 15 years of experience. My research focuses on deep learning applications in computer vision and natural language processing. I have published 50+ papers in top-tier conferences and supervised 20+ PhD students. I welcome students interested in cutting-edge AI research.',
 5, 2, NULL),

-- Prof. Chen - Web Development specialist with 3/4 slots filled (almost full)
('sup-profile-002', 'sup-002', 'Software Engineering', 'Web Development',
 '["React", "Next.js", "Node.js", "TypeScript", "Full-Stack", "Cloud Computing", "AWS", "Docker"]',
 'Full-stack developer and educator with industry experience at major tech companies. I specialize in modern web technologies and cloud architecture. My students work on real-world projects and gain practical skills for the industry. Open to projects involving scalable web applications.',
 4, 3, NULL),

-- Dr. Patel - Mobile Development with 0/6 slots (fully available)
('sup-profile-003', 'sup-003', 'Computer Science', 'Mobile Development',
 '["iOS", "Swift", "Android", "Kotlin", "React Native", "Flutter", "Mobile UI/UX", "App Architecture"]',
 'Mobile development expert with a focus on cross-platform solutions and user experience. I have shipped over 30 apps to production and have extensive experience in mobile architecture patterns. Looking for motivated students passionate about mobile technology.',
 6, 0, NULL),

-- Prof. Johnson - Cybersecurity specialist with 5/5 slots (completely full)
('sup-profile-004', 'sup-004', 'Information Security', 'Cybersecurity',
 '["Network Security", "Cryptography", "Ethical Hacking", "Penetration Testing", "Security Auditing", "Blockchain"]',
 'Cybersecurity researcher and consultant with expertise in network security and cryptography. I work on projects involving secure system design and vulnerability assessment. Currently at full capacity but maintaining a waitlist for next semester.',
 5, 5, NULL),

-- Dr. Williams - Data Science with 1/4 slots filled
('sup-profile-005', 'sup-005', 'Data Science', 'Data Science & Analytics',
 '["Data Analysis", "Statistical Modeling", "Python", "R", "Big Data", "Data Visualization", "SQL", "Tableau"]',
 'Data scientist with a background in statistics and business intelligence. I help students work on data-driven projects involving real datasets from industry partners. My research interests include predictive analytics and data visualization techniques.',
 4, 1, NULL);

-- ============================================
-- STUDENT PROFILES
-- ============================================
INSERT INTO `student_profiles` (`id`, `user_id`, `registration_no`, `department`, `research_interests`, `preferred_fields`) VALUES
('stu-profile-001', 'stu-001', 'CS2021001', 'Computer Science', 
 'Interested in deep learning applications, particularly in computer vision and image processing.',
 '["AI/ML", "Computer Vision", "Deep Learning"]'),

('stu-profile-002', 'stu-002', 'SE2021002', 'Software Engineering',
 'Full-stack web development with focus on scalable cloud architectures.',
 '["Web Development", "Cloud Computing", "DevOps"]'),

('stu-profile-003', 'stu-003', 'CS2021003', 'Computer Science',
 'Natural language processing and chatbot development using modern AI techniques.',
 '["AI/ML", "NLP", "Chatbots"]'),

('stu-profile-004', 'stu-004', 'CS2021004', 'Computer Science',
 'Mobile app development with focus on iOS and cross-platform solutions.',
 '["Mobile Development", "iOS", "React Native"]'),

('stu-profile-005', 'stu-005', 'DS2021005', 'Data Science',
 'Business intelligence and data visualization for decision making.',
 '["Data Science & Analytics", "Business Intelligence", "Visualization"]'),

('stu-profile-006', 'stu-006', 'SE2021006', 'Software Engineering',
 'Interested in modern web frameworks and real-time applications.',
 '["Web Development", "Real-time Systems", "WebSocket"]'),

('stu-profile-007', 'stu-007', 'CS2021007', 'Computer Science',
 'Machine learning for healthcare applications and medical image analysis.',
 '["AI/ML", "Healthcare", "Medical Imaging"]');

-- ============================================
-- PROJECT IDEAS
-- ============================================
INSERT INTO `project_ideas` (`id`, `student_id`, `title`, `description`, `category`, `keywords`, `attachments`, `created_at`) VALUES
-- Alice - Computer Vision Project (matched with Dr. Anderson)
('idea-001', 'stu-001', 'Real-time Object Detection for Autonomous Vehicles',
 'Developing a real-time object detection system using YOLO and deep learning techniques for autonomous vehicle navigation. The system will identify pedestrians, vehicles, and obstacles with high accuracy.',
 'AI/ML', '["Computer Vision", "Deep Learning", "YOLO", "Autonomous Systems", "Object Detection", "Neural Networks"]',
 '["proposal-v1.pdf", "dataset-samples.zip"]', '2024-09-15 10:00:00'),

-- Bob - Web Application (matched with Prof. Chen)
('idea-002', 'stu-002', 'Cloud-based E-Learning Platform',
 'Building a scalable e-learning platform using Next.js, Node.js, and AWS services. Features include live video streaming, interactive quizzes, and progress tracking.',
 'Web Development', '["Next.js", "Node.js", "AWS", "Cloud Computing", "Full-Stack", "Real-time"]',
 '["architecture-diagram.pdf"]', '2024-09-16 11:30:00'),

-- Carol - NLP Project (matched with Dr. Anderson)
('idea-003', 'stu-003', 'AI-Powered Customer Support Chatbot',
 'Creating an intelligent chatbot using transformers and NLP techniques to handle customer queries. The system will use sentiment analysis and context understanding.',
 'AI/ML', '["NLP", "Transformers", "Chatbot", "Sentiment Analysis", "BERT", "Deep Learning"]',
 '["mockups.pdf", "flow-diagram.png"]', '2024-09-17 14:00:00'),

-- David - Mobile App (no supervisor assigned yet)
('idea-004', 'stu-004', 'Cross-platform Fitness Tracking App',
 'Developing a comprehensive fitness app using React Native with features like workout tracking, nutrition planning, and social sharing. Integration with wearable devices.',
 'Mobile Development', '["React Native", "Mobile", "iOS", "Android", "Health", "Wearables"]',
 NULL, '2024-09-18 09:00:00'),

-- Emma - Data Analytics (matched with Dr. Williams)
('idea-005', 'stu-005', 'Predictive Analytics for Retail Sales',
 'Building a data analytics dashboard for predicting retail sales trends using machine learning. Includes data visualization and business intelligence features.',
 'Data Science & Analytics', '["Data Analysis", "Python", "Predictive Analytics", "Tableau", "Business Intelligence"]',
 '["dataset-description.pdf"]', '2024-09-19 13:00:00'),

-- Frank - Web App (pending request to Prof. Chen)
('idea-006', 'stu-006', 'Real-time Collaboration Tool',
 'Creating a real-time collaboration platform similar to Figma using WebSocket, React, and Node.js. Features include live cursors, shared editing, and version control.',
 'Web Development', '["React", "WebSocket", "Real-time", "Collaborative", "Node.js", "TypeScript"]',
 '["prototype-v1.pdf"]', '2024-09-20 10:30:00'),

-- Grace - Healthcare AI (pending)
('idea-007', 'stu-007', 'Medical Image Classification System',
 'Developing a deep learning system for classifying medical images (X-rays, MRIs) to assist in disease diagnosis. Using CNN architectures and transfer learning.',
 'AI/ML', '["Deep Learning", "Medical Imaging", "CNN", "Healthcare", "Classification", "Transfer Learning"]',
 '["literature-review.pdf", "sample-images.zip"]', '2024-09-21 15:00:00');

-- ============================================
-- BOOKING REQUESTS - Various statuses
-- ============================================
INSERT INTO `booking_requests` (`id`, `student_id`, `supervisor_id`, `status`, `created_at`, `responded_at`) VALUES
-- ACCEPTED requests (these students got their supervisors)
('req-001', 'stu-001', 'sup-profile-001', 'ACCEPTED', '2024-09-22 10:00:00', '2024-09-22 14:30:00'),
('req-002', 'stu-002', 'sup-profile-002', 'ACCEPTED', '2024-09-23 11:00:00', '2024-09-23 15:00:00'),
('req-003', 'stu-003', 'sup-profile-001', 'ACCEPTED', '2024-09-24 09:30:00', '2024-09-24 16:00:00'),
('req-004', 'stu-005', 'sup-profile-005', 'ACCEPTED', '2024-09-25 13:00:00', '2024-09-25 17:00:00'),

-- PENDING requests (waiting for supervisor response)
('req-005', 'stu-004', 'sup-profile-003', 'PENDING', '2024-10-28 10:00:00', NULL),
('req-006', 'stu-006', 'sup-profile-002', 'PENDING', '2024-10-29 11:00:00', NULL),
('req-007', 'stu-007', 'sup-profile-001', 'PENDING', '2024-10-30 14:00:00', NULL),

-- DECLINED requests (supervisor rejected)
('req-008', 'stu-004', 'sup-profile-001', 'DECLINED', '2024-09-20 10:00:00', '2024-09-21 09:00:00'),
('req-009', 'stu-006', 'sup-profile-001', 'DECLINED', '2024-09-21 11:00:00', '2024-09-22 10:00:00'),

-- SLOT_FULL requests (supervisor was full)
('req-010', 'stu-007', 'sup-profile-004', 'SLOT_FULL', '2024-09-26 12:00:00', '2024-09-26 12:05:00');

-- ============================================
-- ASSIGNMENTS - Students assigned to supervisors
-- ============================================
INSERT INTO `assignments` (`id`, `student_id`, `supervisor_id`, `assigned_at`) VALUES
('assign-001', 'stu-001', 'sup-profile-001', '2024-09-22 14:30:00'),  -- Alice -> Dr. Anderson
('assign-002', 'stu-002', 'sup-profile-002', '2024-09-23 15:00:00'),  -- Bob -> Prof. Chen
('assign-003', 'stu-003', 'sup-profile-001', '2024-09-24 16:00:00'),  -- Carol -> Dr. Anderson
('assign-004', 'stu-005', 'sup-profile-005', '2024-09-25 17:00:00');  -- Emma -> Dr. Williams

-- ============================================
-- AVAILABILITY SLOTS - Various scenarios
-- ============================================
INSERT INTO `availability_slots` (`id`, `supervisor_id`, `date`, `start_time`, `end_time`, `is_booked`, `booked_by`, `created_at`) VALUES
-- Dr. Anderson's slots (some booked, some available)
('slot-001', 'sup-profile-001', '2025-11-05', '09:00:00', '10:00:00', 1, 'stu-001', '2024-10-20 08:00:00'),
('slot-002', 'sup-profile-001', '2025-11-05', '10:00:00', '11:00:00', 1, 'stu-003', '2024-10-20 08:00:00'),
('slot-003', 'sup-profile-001', '2025-11-05', '14:00:00', '15:00:00', 0, NULL, '2024-10-20 08:00:00'),
('slot-004', 'sup-profile-001', '2025-11-06', '09:00:00', '10:00:00', 0, NULL, '2024-10-20 08:00:00'),
('slot-005', 'sup-profile-001', '2025-11-06', '13:00:00', '14:00:00', 0, NULL, '2024-10-20 08:00:00'),

-- Prof. Chen's slots (mostly booked)
('slot-006', 'sup-profile-002', '2025-11-05', '10:00:00', '11:00:00', 1, 'stu-002', '2024-10-20 09:00:00'),
('slot-007', 'sup-profile-002', '2025-11-05', '15:00:00', '16:00:00', 0, NULL, '2024-10-20 09:00:00'),
('slot-008', 'sup-profile-002', '2025-11-07', '11:00:00', '12:00:00', 0, NULL, '2024-10-20 09:00:00'),

-- Dr. Patel's slots (all available - new supervisor)
('slot-009', 'sup-profile-003', '2025-11-05', '09:00:00', '10:00:00', 0, NULL, '2024-10-25 10:00:00'),
('slot-010', 'sup-profile-003', '2025-11-05', '14:00:00', '15:00:00', 0, NULL, '2024-10-25 10:00:00'),
('slot-011', 'sup-profile-003', '2025-11-06', '10:00:00', '11:00:00', 0, NULL, '2024-10-25 10:00:00'),
('slot-012', 'sup-profile-003', '2025-11-06', '15:00:00', '16:00:00', 0, NULL, '2024-10-25 10:00:00'),

-- Dr. Williams's slots (some booked)
('slot-013', 'sup-profile-005', '2025-11-05', '13:00:00', '14:00:00', 1, 'stu-005', '2024-10-21 08:00:00'),
('slot-014', 'sup-profile-005', '2025-11-06', '09:00:00', '10:00:00', 0, NULL, '2024-10-21 08:00:00'),
('slot-015', 'sup-profile-005', '2025-11-07', '14:00:00', '15:00:00', 0, NULL, '2024-10-21 08:00:00');

-- ============================================
-- MEETINGS - Past and upcoming
-- ============================================
INSERT INTO `meetings` (`id`, `student_id`, `supervisor_id`, `date_time`, `mode`, `notes`, `feedback`, `slot_id`, `created_at`) VALUES
-- Past meetings with feedback
('meet-001', 'stu-001', 'sup-profile-001', '2024-10-15 09:00:00', 'IN_PERSON',
 'Discussed project scope and initial dataset requirements. Alice showed good understanding of YOLO architecture.',
 'Excellent preparation. Need to focus on data augmentation techniques. Grade: A',
 NULL, '2024-10-10 10:00:00'),

('meet-002', 'stu-002', 'sup-profile-002', '2024-10-16 10:00:00', 'ONLINE',
 'Reviewed system architecture and AWS deployment strategy. Discussed scalability concerns.',
 'Good progress on backend API. Frontend needs more attention. Keep up the work!',
 NULL, '2024-10-11 11:00:00'),

('meet-003', 'stu-003', 'sup-profile-001', '2024-10-18 14:00:00', 'ONLINE',
 'Presented initial chatbot prototype using BERT. Discussed fine-tuning strategies.',
 'Impressive prototype! Consider expanding the training dataset for better accuracy.',
 NULL, '2024-10-12 09:00:00'),

('meet-004', 'stu-005', 'sup-profile-005', '2024-10-20 13:00:00', 'IN_PERSON',
 'Data cleaning and preprocessing complete. Started exploratory data analysis.',
 'Data preparation is thorough. Ready to move to modeling phase.',
 NULL, '2024-10-15 10:00:00'),

-- Upcoming meetings (no feedback yet)
('meet-005', 'stu-001', 'sup-profile-001', '2025-11-05 09:00:00', 'IN_PERSON',
 'Will discuss model performance metrics and optimization strategies.',
 NULL, 'slot-001', '2024-10-28 09:00:00'),

('meet-006', 'stu-003', 'sup-profile-001', '2025-11-05 10:00:00', 'ONLINE',
 'Review of sentiment analysis implementation and deployment plan.',
 NULL, 'slot-002', '2024-10-28 10:00:00'),

('meet-007', 'stu-002', 'sup-profile-002', '2025-11-05 10:00:00', 'ONLINE',
 'Demo of completed features and discussion of remaining work.',
 NULL, 'slot-006', '2024-10-29 11:00:00'),

('meet-008', 'stu-005', 'sup-profile-005', '2025-11-05 13:00:00', 'IN_PERSON',
 'Present predictive models and discuss business insights.',
 NULL, 'slot-013', '2024-10-29 14:00:00');

-- ============================================
-- PROGRESS UPDATES
-- ============================================
INSERT INTO `progress_updates` (`id`, `student_id`, `supervisor_id`, `title`, `description`, `attachments`, `created_at`) VALUES
-- Alice's updates (Computer Vision project)
('progress-001', 'stu-001', 'sup-profile-001', 'Dataset Collection Complete',
 'Successfully collected and labeled 5000 images for training. Dataset includes various lighting conditions and weather scenarios. Started initial model training with YOLOv8.',
 '["dataset-stats.pdf", "sample-detections.png"]', '2024-10-01 14:00:00'),

('progress-002', 'stu-001', 'sup-profile-001', 'Model Training - First Iteration',
 'Completed first training iteration with baseline model. Achieved 75% accuracy on validation set. Identified areas for improvement in small object detection.',
 '["training-metrics.png", "confusion-matrix.png"]', '2024-10-10 16:00:00'),

('progress-003', 'stu-001', 'sup-profile-001', 'Data Augmentation Implementation',
 'Implemented data augmentation techniques including rotation, flipping, and color jittering. Re-training with augmented dataset shows 82% accuracy.',
 '["augmentation-examples.png", "improved-results.pdf"]', '2024-10-20 10:00:00'),

-- Bob's updates (Web Platform)
('progress-004', 'stu-002', 'sup-profile-002', 'Backend API Development',
 'Completed RESTful API using Node.js and Express. Implemented user authentication with JWT. Database schema finalized with PostgreSQL.',
 '["api-documentation.pdf", "database-schema.png"]', '2024-10-05 11:00:00'),

('progress-005', 'stu-002', 'sup-profile-002', 'Frontend Development Progress',
 'Built React components for main dashboard and course management. Integrated with backend API. Implementing real-time features using Socket.io.',
 '["ui-screenshots.zip", "component-structure.png"]', '2024-10-15 15:00:00'),

('progress-006', 'stu-002', 'sup-profile-002', 'AWS Deployment Setup',
 'Configured AWS infrastructure with EC2, RDS, and S3. Set up CI/CD pipeline using GitHub Actions. Successfully deployed staging environment.',
 '["architecture-diagram.pdf", "deployment-guide.md"]', '2024-10-25 09:00:00'),

-- Carol's updates (Chatbot project)
('progress-007', 'stu-003', 'sup-profile-001', 'Intent Classification Model',
 'Trained intent classification model using BERT. Achieved 88% accuracy on test set. Implemented fallback handling for unknown intents.',
 '["model-performance.pdf", "sample-conversations.txt"]', '2024-10-08 13:00:00'),

('progress-008', 'stu-003', 'sup-profile-001', 'Sentiment Analysis Integration',
 'Integrated sentiment analysis to detect customer emotions. System can now route urgent/negative queries to human agents automatically.',
 '["sentiment-examples.pdf", "routing-logic.png"]', '2024-10-18 14:30:00'),

-- Emma's updates (Data Analytics)
('progress-009', 'stu-005', 'sup-profile-005', 'Data Preprocessing Complete',
 'Cleaned and preprocessed 2 years of sales data. Handled missing values and outliers. Created feature engineering pipeline.',
 '["data-quality-report.pdf", "preprocessing-notebook.ipynb"]', '2024-10-12 10:00:00'),

('progress-010', 'stu-005', 'sup-profile-005', 'Predictive Model Development',
 'Built ensemble model combining Random Forest and XGBoost. Achieved RMSE of 0.15 on test set. Created feature importance analysis.',
 '["model-comparison.pdf", "feature-importance.png", "predictions-vs-actual.png"]', '2024-10-22 16:00:00');

-- ============================================
-- NOTIFICATIONS - Various types
-- ============================================
INSERT INTO `notifications` (`id`, `user_id`, `type`, `body`, `related_id`, `is_read`, `created_at`) VALUES
-- Student notifications
('notif-001', 'stu-001', 'REQUEST_ACCEPTED', 'Dr. Sarah Anderson has accepted your supervision request!', 'req-001', 1, '2024-09-22 14:30:00'),
('notif-002', 'stu-001', 'MEETING_SCHEDULED', 'New meeting scheduled with Dr. Sarah Anderson on Nov 5, 2025 at 9:00 AM', 'meet-005', 0, '2024-10-28 09:00:00'),
('notif-003', 'stu-001', 'FEEDBACK_POSTED', 'Dr. Sarah Anderson posted feedback on your meeting', 'meet-001', 1, '2024-10-15 11:00:00'),

('notif-004', 'stu-002', 'REQUEST_ACCEPTED', 'Prof. Michael Chen has accepted your supervision request!', 'req-002', 1, '2024-09-23 15:00:00'),
('notif-005', 'stu-002', 'MEETING_SCHEDULED', 'New meeting scheduled with Prof. Michael Chen on Nov 5, 2025 at 10:00 AM', 'meet-007', 0, '2024-10-29 11:00:00'),

('notif-006', 'stu-003', 'REQUEST_ACCEPTED', 'Dr. Sarah Anderson has accepted your supervision request!', 'req-003', 1, '2024-09-24 16:00:00'),
('notif-007', 'stu-003', 'MEETING_SCHEDULED', 'New meeting scheduled with Dr. Sarah Anderson on Nov 5, 2025 at 10:00 AM', 'meet-006', 0, '2024-10-28 10:00:00'),

('notif-008', 'stu-004', 'REQUEST_DECLINED', 'Dr. Sarah Anderson declined your supervision request. Reason: Currently at capacity.', 'req-008', 1, '2024-09-21 09:00:00'),
('notif-009', 'stu-004', 'REQUEST_SUBMITTED', 'Your supervision request has been sent to Dr. Priya Patel', 'req-005', 1, '2024-10-28 10:00:00'),

('notif-010', 'stu-005', 'REQUEST_ACCEPTED', 'Dr. Emily Williams has accepted your supervision request!', 'req-004', 1, '2024-09-25 17:00:00'),
('notif-011', 'stu-005', 'MEETING_SCHEDULED', 'New meeting scheduled with Dr. Emily Williams on Nov 5, 2025 at 1:00 PM', 'meet-008', 0, '2024-10-29 14:00:00'),

('notif-012', 'stu-006', 'REQUEST_DECLINED', 'Dr. Sarah Anderson declined your supervision request. Reason: Research interests don't align.', 'req-009', 1, '2024-09-22 10:00:00'),
('notif-013', 'stu-006', 'REQUEST_SUBMITTED', 'Your supervision request has been sent to Prof. Michael Chen', 'req-006', 1, '2024-10-29 11:00:00'),

('notif-014', 'stu-007', 'SLOT_FULL', 'Prof. James Johnson has no available slots at this time', 'req-010', 1, '2024-09-26 12:05:00'),
('notif-015', 'stu-007', 'REQUEST_SUBMITTED', 'Your supervision request has been sent to Dr. Sarah Anderson', 'req-007', 1, '2024-10-30 14:00:00'),

-- Supervisor notifications
('notif-016', 'sup-001', 'REQUEST_SUBMITTED', 'Alice Thompson has sent you a supervision request', 'req-001', 1, '2024-09-22 10:00:00'),
('notif-017', 'sup-001', 'REQUEST_SUBMITTED', 'Carol Davis has sent you a supervision request', 'req-003', 1, '2024-09-24 09:30:00'),
('notif-018', 'sup-001', 'REQUEST_SUBMITTED', 'Grace Kumar has sent you a supervision request', 'req-007', 0, '2024-10-30 14:00:00'),
('notif-019', 'sup-001', 'PROGRESS_UPDATE', 'Alice Thompson submitted a progress update: Dataset Collection Complete', 'progress-001', 1, '2024-10-01 14:00:00'),
('notif-020', 'sup-001', 'SLOT_BOOKED', 'Alice Thompson booked your availability slot on Nov 5, 2025 at 9:00 AM', 'slot-001', 1, '2024-10-28 09:00:00'),

('notif-021', 'sup-002', 'REQUEST_SUBMITTED', 'Bob Martinez has sent you a supervision request', 'req-002', 1, '2024-09-23 11:00:00'),
('notif-022', 'sup-002', 'REQUEST_SUBMITTED', 'Frank Brown has sent you a supervision request', 'req-006', 0, '2024-10-29 11:00:00'),
('notif-023', 'sup-002', 'PROGRESS_UPDATE', 'Bob Martinez submitted a progress update: Backend API Development', 'progress-004', 1, '2024-10-05 11:00:00'),
('notif-024', 'sup-002', 'SLOT_BOOKED', 'Bob Martinez booked your availability slot on Nov 5, 2025 at 10:00 AM', 'slot-006', 1, '2024-10-29 11:00:00'),

('notif-025', 'sup-003', 'REQUEST_SUBMITTED', 'David Lee has sent you a supervision request', 'req-005', 0, '2024-10-28 10:00:00'),

('notif-026', 'sup-005', 'REQUEST_SUBMITTED', 'Emma Wilson has sent you a supervision request', 'req-004', 1, '2024-09-25 13:00:00'),
('notif-027', 'sup-005', 'PROGRESS_UPDATE', 'Emma Wilson submitted a progress update: Data Preprocessing Complete', 'progress-009', 1, '2024-10-12 10:00:00'),
('notif-028', 'sup-005', 'SLOT_BOOKED', 'Emma Wilson booked your availability slot on Nov 5, 2025 at 1:00 PM', 'slot-013', 1, '2024-10-29 14:00:00');

-- ============================================
-- DATA VERIFICATION QUERIES
-- ============================================
-- Run these to verify the data was inserted correctly

-- SELECT 'Users Count' as Info, role, COUNT(*) as count FROM users GROUP BY role;
-- SELECT 'Supervisors with Profiles' as Info, COUNT(*) as count FROM supervisor_profiles;
-- SELECT 'Students with Profiles' as Info, COUNT(*) as count FROM student_profiles;
-- SELECT 'Project Ideas' as Info, COUNT(*) as count FROM project_ideas;
-- SELECT 'Booking Requests by Status' as Info, status, COUNT(*) as count FROM booking_requests GROUP BY status;
-- SELECT 'Active Assignments' as Info, COUNT(*) as count FROM assignments;
-- SELECT 'Availability Slots' as Info, is_booked, COUNT(*) as count FROM availability_slots GROUP BY is_booked;
-- SELECT 'Meetings' as Info, COUNT(*) as count FROM meetings;
-- SELECT 'Progress Updates' as Info, COUNT(*) as count FROM progress_updates;
-- SELECT 'Notifications' as Info, is_read, COUNT(*) as count FROM notifications GROUP BY is_read;

-- ============================================
-- SUMMARY OF TEST DATA
-- ============================================
/*
USERS:
- 3 Admins
- 5 Supervisors (1 full capacity, 1 almost full, 3 with availability)
- 7 Students (4 assigned, 3 searching)

SCENARIOS COVERED:
1. Supervisor at full capacity (Prof. Johnson - 5/5)
2. Supervisor almost full (Prof. Chen - 3/4)
3. New supervisor with no students (Dr. Patel - 0/6)
4. Active supervision relationships with progress updates
5. Pending requests waiting for approval
6. Declined requests
7. Slot full scenarios
8. Upcoming and past meetings
9. Meetings with and without feedback
10. Booked and available time slots
11. Read and unread notifications
12. Various notification types
13. Project ideas submitted
14. Students with different specialization interests

PASSWORD: password123
*/
