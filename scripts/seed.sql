-- ============================================
-- SEED DATA FOR SUP-CONNECT
-- ============================================
-- Run this after creating the schema with database-schema.sql

USE `railway`;

-- ============================================
-- ADMIN ACCOUNTS
-- ============================================
-- Passwords are bcrypt hashes of the plaintext passwords shown in comments

-- SUPER_ADMIN: super@supconnect.com / SuperAdmin123!
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-super-admin', 'super@supconnect.com', '$2b$10$8K1p6dPzU6UhVi1hMxDAz.O7Z7e8n0bQm3uqEX.q8CqP3IZgCrPSe', 'Super Admin', 'SUPER_ADMIN');

-- ADMIN: admin@supconnect.com / Admin123!
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-admin', 'admin@supconnect.com', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Admin User', 'ADMIN');

-- ============================================
-- SUPERVISOR ACCOUNTS (17 supervisors)
-- All passwords: Supervisor123!
-- ============================================

-- AI/ML Supervisors (2)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-sup-01', 'dr.chen@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Wei Chen', 'SUPERVISOR'),
('user-sup-02', 'dr.patel@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Priya Patel', 'SUPERVISOR');

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
('sup-01', 'user-sup-01', 'Computer Science', 'AI/ML', '["Deep Learning", "TensorFlow", "Neural Networks", "Python", "Computer Vision"]', 'Expert in deep learning and neural network architectures with 15+ publications.', 12, 5, 0),
('sup-02', 'user-sup-02', 'Computer Science', 'AI/ML', '["Machine Learning", "PyTorch", "NLP", "Data Mining", "Python"]', 'Specializing in ML applications for healthcare and natural language processing.', 8, 4, 0);

-- Web Development Supervisors (2)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-sup-03', 'dr.johnson@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Michael Johnson', 'SUPERVISOR'),
('user-sup-04', 'dr.smith@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Sarah Smith', 'SUPERVISOR');

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
('sup-03', 'user-sup-03', 'Information Technology', 'Web Development', '["React", "Node.js", "TypeScript", "REST API", "GraphQL"]', 'Full-stack web development expert with industry experience at major tech companies.', 10, 6, 0),
('sup-04', 'user-sup-04', 'Computer Science', 'Web Development', '["Vue.js", "Python", "Django", "PostgreSQL", "Docker"]', 'Focused on scalable web architectures and cloud-native applications.', 7, 5, 0);

-- Mobile Development (1)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-sup-05', 'dr.kim@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Jin Kim', 'SUPERVISOR');

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
('sup-05', 'user-sup-05', 'Computer Science', 'Mobile Development', '["Flutter", "React Native", "Swift", "Kotlin", "iOS", "Android"]', 'Cross-platform mobile development specialist with apps in App Store and Play Store.', 9, 4, 0);

-- Data Science (2)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-sup-06', 'dr.garcia@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Maria Garcia', 'SUPERVISOR'),
('user-sup-07', 'dr.brown@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. James Brown', 'SUPERVISOR');

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
('sup-06', 'user-sup-06', 'Statistics', 'Data Science', '["Python", "R", "Statistics", "Pandas", "Data Visualization", "Jupyter"]', 'Statistical modeling expert with focus on predictive analytics.', 11, 5, 0),
('sup-07', 'user-sup-07', 'Computer Science', 'Data Science', '["Big Data", "Spark", "Hadoop", "SQL", "ETL", "Data Warehousing"]', 'Big data infrastructure and analytics pipelines specialist.', 6, 4, 0);

-- Cloud Computing (1)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-sup-08', 'dr.wilson@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Robert Wilson', 'SUPERVISOR');

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
('sup-08', 'user-sup-08', 'Information Technology', 'Cloud Computing', '["AWS", "Azure", "Kubernetes", "Terraform", "Serverless", "Microservices"]', 'AWS certified solutions architect with expertise in cloud migrations.', 8, 5, 0);

-- Cybersecurity (1)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-sup-09', 'dr.lee@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. David Lee', 'SUPERVISOR');

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
('sup-09', 'user-sup-09', 'Computer Science', 'Cybersecurity', '["Penetration Testing", "Cryptography", "Network Security", "Ethical Hacking", "Security Audit"]', 'Former security consultant with CISSP certification.', 14, 3, 0);

-- DevOps (1)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-sup-10', 'dr.taylor@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Emily Taylor', 'SUPERVISOR');

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
('sup-10', 'user-sup-10', 'Information Technology', 'DevOps', '["Docker", "CI/CD", "Jenkins", "GitHub Actions", "Linux", "Ansible"]', 'DevOps evangelist focused on automation and continuous delivery.', 7, 5, 0);

-- Database Design (1)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-sup-11', 'dr.martinez@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Carlos Martinez', 'SUPERVISOR');

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
('sup-11', 'user-sup-11', 'Computer Science', 'Database Design', '["PostgreSQL", "MongoDB", "Redis", "Database Optimization", "SQL", "NoSQL"]', 'Database architect with experience in high-throughput systems.', 13, 4, 0);

-- Software Architecture (1)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-sup-12', 'dr.anderson@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Thomas Anderson', 'SUPERVISOR');

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
('sup-12', 'user-sup-12', 'Computer Science', 'Software Architecture', '["Microservices", "DDD", "Clean Architecture", "Design Patterns", "System Design"]', 'Enterprise architect specializing in distributed systems design.', 15, 4, 0);

-- UI/UX Design (1)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-sup-13', 'dr.white@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Jessica White', 'SUPERVISOR');

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
('sup-13', 'user-sup-13', 'Design', 'UI/UX Design', '["Figma", "User Research", "Prototyping", "Accessibility", "Design Systems"]', 'Human-computer interaction researcher focused on inclusive design.', 9, 5, 0);

-- Blockchain (1)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-sup-14', 'dr.nakamoto@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Satoshi Nakamoto Jr.', 'SUPERVISOR');

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
('sup-14', 'user-sup-14', 'Computer Science', 'Blockchain', '["Ethereum", "Solidity", "Smart Contracts", "DeFi", "Web3"]', 'Blockchain researcher with focus on decentralized applications.', 5, 3, 0);

-- IoT (1)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-sup-15', 'dr.moore@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Patricia Moore', 'SUPERVISOR');

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
('sup-15', 'user-sup-15', 'Electrical Engineering', 'IoT', '["Arduino", "Raspberry Pi", "MQTT", "Embedded Systems", "Sensors"]', 'IoT solutions architect with smart city project experience.', 10, 4, 0);

-- Computer Vision (1)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-sup-16', 'dr.zhang@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Li Zhang', 'SUPERVISOR');

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
('sup-16', 'user-sup-16', 'Computer Science', 'Computer Vision', '["OpenCV", "Image Processing", "YOLO", "Object Detection", "Python"]', 'Computer vision expert with autonomous vehicle research background.', 11, 4, 0);

-- NLP (1)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('user-sup-17', 'dr.thompson@university.edu', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Dr. Rachel Thompson', 'SUPERVISOR');

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `specialization`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
('sup-17', 'user-sup-17', 'Computer Science', 'Natural Language Processing', '["Transformers", "BERT", "GPT", "Text Mining", "Sentiment Analysis", "Python"]', 'NLP researcher specializing in large language models and text analytics.', 6, 5, 0);
