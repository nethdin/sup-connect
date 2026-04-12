-- =============================================================================
-- SUP-CONNECT Supervisor Seed Data
-- Run AFTER database-schema.sql AND seed.sql
-- =============================================================================
--
-- Creates 12 fully functional supervisor accounts across 8 departments.
-- Each supervisor has:
--   - A real user account with a bcrypt-hashed password
--   - A supervisor_profiles row with department, bio, experience, and tag IDs
--   - Tags referencing REAL tag IDs from the live database
--
-- Password for all accounts: 11111111
-- ⚠️  CHANGE THESE PASSWORDS AFTER DEPLOYMENT
-- =============================================================================

USE `railway`;

SET @NOW = NOW();

-- =============================================================================
-- SUPERVISOR 1 — Dr. Ashan Kumar
-- Department: Computer Science
-- Focus: Machine Learning, Deep Learning, Computer Vision
-- =============================================================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES
  ('s0000000-0000-0000-0000-000000000001', 'ashan.kumar@supconnect.com',
   '$2b$10$7KwAylU.8uMbeIUereM2F.Tchgzb4sFZ5HQ6RZ3FJB9/735FUiu9.',
   'Dr. Ashan Kumar', 'SUPERVISOR', @NOW, @NOW);

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`, `created_at`, `updated_at`) VALUES
  ('sp000000-0000-0000-0000-000000000001',
   's0000000-0000-0000-0000-000000000001',
   'Computer Science',
   '["t0000000-0000-0000-0001-000000000001","t0000000-0000-0000-0001-000000000002","t0000000-0000-0000-0001-000000000004"]',
   'Associate Professor specializing in deep neural architectures for visual recognition tasks. Published 40+ papers in IEEE TPAMI, CVPR, and NeurIPS. Currently leading research on self-supervised learning for medical image analysis and autonomous vehicle perception systems. Former visiting researcher at MIT CSAIL.',
   12, 6, 0, @NOW, @NOW);

-- =============================================================================
-- SUPERVISOR 2 — Dr. Nimali Perera
-- Department: Data Science
-- Focus: Data Engineering, Big Data, Data Analytics
-- =============================================================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES
  ('s0000000-0000-0000-0000-000000000002', 'nimali.perera@supconnect.com',
   '$2b$10$7KwAylU.8uMbeIUereM2F.Tchgzb4sFZ5HQ6RZ3FJB9/735FUiu9.',
   'Dr. Nimali Perera', 'SUPERVISOR', @NOW, @NOW);

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`, `created_at`, `updated_at`) VALUES
  ('sp000000-0000-0000-0000-000000000002',
   's0000000-0000-0000-0000-000000000002',
   'Data Science',
   '["t0000000-0000-0000-0003-000000000001","t0000000-0000-0000-0003-000000000003","t0000000-0000-0000-0003-000000000002"]',
   'Senior Lecturer in Data Science with expertise in building scalable data pipelines and real-time analytics platforms. Led the data architecture team at WSO2 before transitioning to academia. Research interests include stream processing with Apache Kafka and Flink, data lakehouse architectures, and applied analytics for healthcare.',
   9, 5, 0, @NOW, @NOW);

-- =============================================================================
-- SUPERVISOR 3 — Prof. Ruwantha Fernando
-- Department: Software Engineering
-- Focus: Web Development, Microservices, API Design, Full Stack
-- =============================================================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES
  ('s0000000-0000-0000-0000-000000000003', 'ruwantha.fernando@supconnect.com',
   '$2b$10$7KwAylU.8uMbeIUereM2F.Tchgzb4sFZ5HQ6RZ3FJB9/735FUiu9.',
   'Prof. Ruwantha Fernando', 'SUPERVISOR', @NOW, @NOW);

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`, `created_at`, `updated_at`) VALUES
  ('sp000000-0000-0000-0000-000000000003',
   's0000000-0000-0000-0000-000000000003',
   'Software Engineering',
   '["t0000000-0000-0000-0002-000000000001","t0000000-0000-0000-0002-000000000004","t0000000-0000-0000-0002-000000000003","t0000000-0000-0000-0002-000000000005"]',
   'Professor of Software Engineering with 18 years of industry and academic experience. Former Principal Engineer at Sysco LABS, where he led the migration of a monolithic ERP to a microservices architecture serving 500K+ daily users. Teaches distributed systems and software architecture. Advocates for domain-driven design and event-sourcing patterns.',
   18, 8, 0, @NOW, @NOW);

-- =============================================================================
-- SUPERVISOR 4 — Dr. Tharushi Silva
-- Department: Cybersecurity
-- Focus: Network Security, Cryptography, Penetration Testing
-- =============================================================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES
  ('s0000000-0000-0000-0000-000000000004', 'tharushi.silva@supconnect.com',
   '$2b$10$7KwAylU.8uMbeIUereM2F.Tchgzb4sFZ5HQ6RZ3FJB9/735FUiu9.',
   'Dr. Tharushi Silva', 'SUPERVISOR', @NOW, @NOW);

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`, `created_at`, `updated_at`) VALUES
  ('sp000000-0000-0000-0000-000000000004',
   's0000000-0000-0000-0000-000000000004',
   'Cybersecurity',
   '["t0000000-0000-0000-0004-000000000001","t0000000-0000-0000-0004-000000000002","t0000000-0000-0000-0004-000000000003"]',
   'Senior Lecturer in Cybersecurity and a CISSP-certified professional. Previously served as a security analyst at Sri Lanka CERT and consulted for banking-sector security audits. Research focuses on post-quantum cryptographic protocols, zero-trust network architectures, and automated vulnerability assessment. Co-authored the national cybersecurity framework guidelines.',
   10, 5, 0, @NOW, @NOW);

-- =============================================================================
-- SUPERVISOR 5 — Dr. Kasun Rajapaksha
-- Department: Information Technology
-- Focus: Cloud Computing, DevOps, Containerization, CI/CD
-- =============================================================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES
  ('s0000000-0000-0000-0000-000000000005', 'kasun.rajapaksha@supconnect.com',
   '$2b$10$7KwAylU.8uMbeIUereM2F.Tchgzb4sFZ5HQ6RZ3FJB9/735FUiu9.',
   'Dr. Kasun Rajapaksha', 'SUPERVISOR', @NOW, @NOW);

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`, `created_at`, `updated_at`) VALUES
  ('sp000000-0000-0000-0000-000000000005',
   's0000000-0000-0000-0000-000000000005',
   'Information Technology',
   '["t0000000-0000-0000-0005-000000000001","t0000000-0000-0000-0005-000000000002","t0000000-0000-0000-0005-000000000003","t0000000-0000-0000-0005-000000000004"]',
   'Lecturer specializing in cloud-native application design and DevOps culture transformation. AWS Solutions Architect Professional and Kubernetes Administrator (CKA) certified. Previously a DevOps lead at IFS R&D, managing CI/CD pipelines serving 200+ microservices. Research interests include infrastructure-as-code, GitOps workflows, and multi-cloud deployment strategies.',
   7, 6, 0, @NOW, @NOW);

-- =============================================================================
-- SUPERVISOR 6 — Dr. Sanduni Jayawardena
-- Department: Computer Science
-- Focus: NLP, Generative AI, Machine Learning
-- =============================================================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES
  ('s0000000-0000-0000-0000-000000000006', 'sanduni.jayawardena@supconnect.com',
   '$2b$10$7KwAylU.8uMbeIUereM2F.Tchgzb4sFZ5HQ6RZ3FJB9/735FUiu9.',
   'Dr. Sanduni Jayawardena', 'SUPERVISOR', @NOW, @NOW);

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`, `created_at`, `updated_at`) VALUES
  ('sp000000-0000-0000-0000-000000000006',
   's0000000-0000-0000-0000-000000000006',
   'Computer Science',
   '["t0000000-0000-0000-0001-000000000003","t0000000-0000-0000-0001-000000000006","t0000000-0000-0000-0001-000000000001"]',
   'Lecturer in Computer Science focusing on large language models and their applications in low-resource languages. PhD from University of Edinburgh with a thesis on cross-lingual transfer learning for Sinhala and Tamil NLP. Active contributor to open-source LLM fine-tuning toolkits. Research includes retrieval-augmented generation, prompt engineering methodologies, and responsible AI deployment.',
   5, 4, 0, @NOW, @NOW);

-- =============================================================================
-- SUPERVISOR 7 — Dr. Chaminda Dissanayake
-- Department: Electrical & Electronic Eng.
-- Focus: IoT, Embedded Systems, Robotics
-- =============================================================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES
  ('s0000000-0000-0000-0000-000000000007', 'chaminda.dissanayake@supconnect.com',
   '$2b$10$7KwAylU.8uMbeIUereM2F.Tchgzb4sFZ5HQ6RZ3FJB9/735FUiu9.',
   'Dr. Chaminda Dissanayake', 'SUPERVISOR', @NOW, @NOW);

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`, `created_at`, `updated_at`) VALUES
  ('sp000000-0000-0000-0000-000000000007',
   's0000000-0000-0000-0000-000000000007',
   'Electrical & Electronic Eng.',
   '["t0000000-0000-0000-0006-000000000001","t0000000-0000-0000-0006-000000000002","t0000000-0000-0000-0001-000000000007"]',
   'Senior Lecturer in EEE with 14 years of experience in cyber-physical systems. Holds multiple patents in sensor fusion for industrial IoT platforms. Led a UNDP-funded smart agriculture monitoring project across 3 provinces. Expertise in RTOS design, edge computing for constrained devices, and ROS-based robotic systems. Maintains an active hardware lab for student capstone projects.',
   14, 5, 0, @NOW, @NOW);

-- =============================================================================
-- SUPERVISOR 8 — Dr. Lakshitha Bandara
-- Department: Software Engineering
-- Focus: Mobile Development, Full Stack, Game Development
-- =============================================================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES
  ('s0000000-0000-0000-0000-000000000008', 'lakshitha.bandara@supconnect.com',
   '$2b$10$7KwAylU.8uMbeIUereM2F.Tchgzb4sFZ5HQ6RZ3FJB9/735FUiu9.',
   'Dr. Lakshitha Bandara', 'SUPERVISOR', @NOW, @NOW);

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`, `created_at`, `updated_at`) VALUES
  ('sp000000-0000-0000-0000-000000000008',
   's0000000-0000-0000-0000-000000000008',
   'Software Engineering',
   '["t0000000-0000-0000-0002-000000000002","t0000000-0000-0000-0002-000000000005","t0000000-0000-0000-0002-000000000006"]',
   'Lecturer with a passion for interactive media and cross-platform development. Former lead mobile developer at PickMe, where he shipped Flutter and React Native apps to 2M+ users. Teaches mobile application development and human-computer interaction. Current research explores procedural content generation, AR-based educational games, and accessibility in mobile UX design.',
   8, 6, 0, @NOW, @NOW);

-- =============================================================================
-- SUPERVISOR 9 — Prof. Dilini Wijesinghe
-- Department: Data Science
-- Focus: Data Visualization, Data Analytics, Healthcare (domain)
-- =============================================================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES
  ('s0000000-0000-0000-0000-000000000009', 'dilini.wijesinghe@supconnect.com',
   '$2b$10$7KwAylU.8uMbeIUereM2F.Tchgzb4sFZ5HQ6RZ3FJB9/735FUiu9.',
   'Prof. Dilini Wijesinghe', 'SUPERVISOR', @NOW, @NOW);

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`, `created_at`, `updated_at`) VALUES
  ('sp000000-0000-0000-0000-000000000009',
   's0000000-0000-0000-0000-000000000009',
   'Data Science',
   '["t0000000-0000-0000-0003-000000000004","t0000000-0000-0000-0003-000000000002","t0000000-0000-0000-0007-000000000001"]',
   'Professor of Data Science with 15 years at the intersection of data visualization and public health informatics. Developed the national dengue surveillance dashboard used by the Ministry of Health. Expert in D3.js, Tableau, and geospatial analytics. Research focuses on designing interpretable visual analytics systems for clinical decision support and epidemiological modeling.',
   15, 4, 0, @NOW, @NOW);

-- =============================================================================
-- SUPERVISOR 10 — Dr. Nuwan Karunaratne
-- Department: Business Information Systems
-- Focus: Blockchain, FinTech, E-Commerce
-- =============================================================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES
  ('s0000000-0000-0000-0000-000000000010', 'nuwan.karunaratne@supconnect.com',
   '$2b$10$7KwAylU.8uMbeIUereM2F.Tchgzb4sFZ5HQ6RZ3FJB9/735FUiu9.',
   'Dr. Nuwan Karunaratne', 'SUPERVISOR', @NOW, @NOW);

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`, `created_at`, `updated_at`) VALUES
  ('sp000000-0000-0000-0000-000000000010',
   's0000000-0000-0000-0000-000000000010',
   'Business Information Systems',
   '["t0000000-0000-0000-0008-000000000001","t0000000-0000-0000-0007-000000000002","t0000000-0000-0000-0007-000000000004"]',
   'Lecturer in BIS bridging technology and business strategy. Former blockchain architect at Axiata Digital Labs, designing DeFi protocols and smart contract audit frameworks. Research interests include decentralized identity systems, tokenized supply chain finance, and AI-driven fraud detection for digital payment platforms. Serves as consultant for central bank digital currency feasibility studies in the region.',
   6, 5, 0, @NOW, @NOW);

-- =============================================================================
-- SUPERVISOR 11 — Dr. Harsha Herath
-- Department: Cybersecurity
-- Focus: Digital Forensics, Malware Analysis, Network Security
-- =============================================================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES
  ('s0000000-0000-0000-0000-000000000011', 'harsha.herath@supconnect.com',
   '$2b$10$7KwAylU.8uMbeIUereM2F.Tchgzb4sFZ5HQ6RZ3FJB9/735FUiu9.',
   'Dr. Harsha Herath', 'SUPERVISOR', @NOW, @NOW);

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`, `created_at`, `updated_at`) VALUES
  ('sp000000-0000-0000-0000-000000000011',
   's0000000-0000-0000-0000-000000000011',
   'Cybersecurity',
   '["t0000000-0000-0000-0004-000000000004","t0000000-0000-0000-0004-000000000005","t0000000-0000-0000-0004-000000000001"]',
   'Senior Lecturer specializing in incident response and threat intelligence. Former senior forensic analyst at the CID Cyber Crimes Division with experience in over 200 criminal investigations. Holds GCFE, GREM, and OSCP certifications. Teaches digital forensics, malware reverse engineering, and threat hunting. Maintains a research lab with sandboxed environments for live malware analysis and student training.',
   11, 4, 0, @NOW, @NOW);

-- =============================================================================
-- SUPERVISOR 12 — Dr. Anura Gunasekara
-- Department: Information Technology
-- Focus: Cloud Computing, Serverless, Database Systems, EdTech
-- =============================================================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES
  ('s0000000-0000-0000-0000-000000000012', 'anura.gunasekara@supconnect.com',
   '$2b$10$7KwAylU.8uMbeIUereM2F.Tchgzb4sFZ5HQ6RZ3FJB9/735FUiu9.',
   'Dr. Anura Gunasekara', 'SUPERVISOR', @NOW, @NOW);

INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`, `created_at`, `updated_at`) VALUES
  ('sp000000-0000-0000-0000-000000000012',
   's0000000-0000-0000-0000-000000000012',
   'Information Technology',
   '["t0000000-0000-0000-0005-000000000001","t0000000-0000-0000-0005-000000000005","t0000000-0000-0000-0003-000000000005","t0000000-0000-0000-0007-000000000003"]',
   'Lecturer in IT with deep expertise in cloud database architectures and serverless computing patterns. Previously a database reliability engineer at Virtusa, managing petabyte-scale Aurora and DynamoDB clusters. Research focuses on adaptive auto-scaling for serverless functions, cost optimization modeling for cloud workloads, and building open-source learning management systems. Actively develops educational technology tools used across 5 Sri Lankan universities.',
   8, 7, 0, @NOW, @NOW);

-- =============================================================================
-- Done. 12 supervisors seeded across 8 departments.
-- Password for all: 11111111
--
-- ⚠️  CHANGE THESE PASSWORDS AFTER DEPLOYMENT
-- =============================================================================
