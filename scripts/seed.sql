-- ============================================
-- SEED DATA FOR SUP-CONNECT
-- ============================================
-- Run this after creating the schema with database-schema.sql
-- Uses uuid() function for generating UUIDs
-- Supervisors store tag IDs (not names) in their tags JSON array

USE `railway`;

-- ============================================
-- TAGS TABLE (Must be seeded first - referenced by supervisors)
-- ============================================

INSERT IGNORE INTO `tags` (`id`, `name`, `category`, `is_active`, `sort_order`) VALUES
-- AI/ML Category
(uuid(), 'Machine Learning', 'Artificial Intelligence', TRUE, 10),
(uuid(), 'Deep Learning', 'Artificial Intelligence', TRUE, 11),
(uuid(), 'TensorFlow', 'Artificial Intelligence', TRUE, 12),
(uuid(), 'PyTorch', 'Artificial Intelligence', TRUE, 13),
(uuid(), 'Neural Networks', 'Artificial Intelligence', TRUE, 14),
(uuid(), 'Computer Vision', 'Artificial Intelligence', TRUE, 15),
(uuid(), 'NLP', 'Artificial Intelligence', TRUE, 16),
(uuid(), 'Generative AI', 'Artificial Intelligence', TRUE, 17),
-- Web Development Category
(uuid(), 'React', 'Software Development', TRUE, 20),
(uuid(), 'Node.js', 'Software Development', TRUE, 21),
(uuid(), 'TypeScript', 'Software Development', TRUE, 22),
(uuid(), 'Vue.js', 'Software Development', TRUE, 23),
(uuid(), 'Django', 'Software Development', TRUE, 24),
(uuid(), 'REST API', 'Software Development', TRUE, 25),
(uuid(), 'GraphQL', 'Software Development', TRUE, 26),
(uuid(), 'Full-Stack Development', 'Software Development', TRUE, 27),
-- Mobile Development Category
(uuid(), 'Flutter', 'Mobile', TRUE, 30),
(uuid(), 'React Native', 'Mobile', TRUE, 31),
(uuid(), 'Swift', 'Mobile', TRUE, 32),
(uuid(), 'Kotlin', 'Mobile', TRUE, 33),
(uuid(), 'iOS Development', 'Mobile', TRUE, 34),
(uuid(), 'Android Development', 'Mobile', TRUE, 35),
-- Data Category
(uuid(), 'Python', 'Data', TRUE, 40),
(uuid(), 'R', 'Data', TRUE, 41),
(uuid(), 'SQL', 'Data', TRUE, 42),
(uuid(), 'Pandas', 'Data', TRUE, 43),
(uuid(), 'Data Visualization', 'Data', TRUE, 44),
(uuid(), 'Big Data', 'Data', TRUE, 45),
(uuid(), 'Data Science', 'Data', TRUE, 46),
(uuid(), 'Statistical Analysis', 'Data', TRUE, 47),
-- Cloud & DevOps Category
(uuid(), 'AWS', 'Cloud & DevOps', TRUE, 50),
(uuid(), 'Azure', 'Cloud & DevOps', TRUE, 51),
(uuid(), 'Google Cloud', 'Cloud & DevOps', TRUE, 52),
(uuid(), 'Kubernetes', 'Cloud & DevOps', TRUE, 53),
(uuid(), 'Docker', 'Cloud & DevOps', TRUE, 54),
(uuid(), 'CI/CD', 'Cloud & DevOps', TRUE, 55),
(uuid(), 'Terraform', 'Cloud & DevOps', TRUE, 56),
(uuid(), 'Serverless', 'Cloud & DevOps', TRUE, 57),
-- Security Category
(uuid(), 'Cybersecurity', 'Security', TRUE, 60),
(uuid(), 'Cryptography', 'Security', TRUE, 61),
(uuid(), 'Network Security', 'Security', TRUE, 62),
(uuid(), 'Penetration Testing', 'Security', TRUE, 63),
(uuid(), 'Ethical Hacking', 'Security', TRUE, 64),
-- Database Category
(uuid(), 'PostgreSQL', 'Data', TRUE, 70),
(uuid(), 'MongoDB', 'Data', TRUE, 71),
(uuid(), 'Redis', 'Data', TRUE, 72),
(uuid(), 'Database Design', 'Data', TRUE, 73),
-- Architecture Category
(uuid(), 'Microservices', 'Software Engineering', TRUE, 80),
(uuid(), 'System Design', 'Software Engineering', TRUE, 81),
(uuid(), 'Software Architecture', 'Software Engineering', TRUE, 82),
(uuid(), 'Design Patterns', 'Software Engineering', TRUE, 83),
-- Other Categories
(uuid(), 'Blockchain', 'Emerging Tech', TRUE, 90),
(uuid(), 'IoT', 'Hardware & IoT', TRUE, 91),
(uuid(), 'Embedded Systems', 'Hardware & IoT', TRUE, 92),
(uuid(), 'UI/UX Design', 'Design', TRUE, 93),
(uuid(), 'Figma', 'Design', TRUE, 94),
(uuid(), 'Agile Methodology', 'Software Engineering', TRUE, 95);

-- ============================================
-- ADMIN ACCOUNTS
-- ============================================
-- Passwords are bcrypt hashes (use password: Admin123! for both)

INSERT IGNORE INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
(uuid(), 'super@supconnect.com', '$2b$10$8K1p6dPzU6UhVi1hMxDAz.O7Z7e8n0bQm3uqEX.q8CqP3IZgCrPSe', 'Super Admin', 'SUPER_ADMIN'),
(uuid(), 'admin@supconnect.com', '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', 'Admin User', 'ADMIN');

-- ============================================
-- SUPERVISOR ACCOUNTS
-- All passwords: Supervisor123!
-- Tags are stored as JSON array of tag IDs (fetched via subquery)
-- ============================================

-- Helper: Create supervisors with tags by name using a stored procedure
DELIMITER //

DROP PROCEDURE IF EXISTS CreateSupervisor//

CREATE PROCEDURE CreateSupervisor(
    IN p_email VARCHAR(255),
    IN p_name VARCHAR(255),
    IN p_department VARCHAR(255),
    IN p_bio TEXT,
    IN p_years_exp INT,
    IN p_max_slots INT,
    IN p_tag_names TEXT  -- Comma-separated tag names
)
BEGIN
    DECLARE v_user_id VARCHAR(36);
    DECLARE v_profile_id VARCHAR(36);
    DECLARE v_tag_ids TEXT DEFAULT '';
    DECLARE v_tag_name VARCHAR(255);
    DECLARE v_tag_id VARCHAR(36);
    DECLARE v_pos INT;
    DECLARE v_remaining TEXT;
    
    SET v_user_id = uuid();
    SET v_profile_id = uuid();
    
    -- Create user
    INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
    (v_user_id, p_email, '$2b$10$Nk8YLQ0D5wHeGq7q7aM9o.3xPvBQGLxDB8LkP8jyDgcq9LYxmRJbO', p_name, 'SUPERVISOR');
    
    -- Build tag IDs JSON array from names
    SET v_remaining = p_tag_names;
    WHILE LENGTH(v_remaining) > 0 DO
        SET v_pos = LOCATE(',', v_remaining);
        IF v_pos > 0 THEN
            SET v_tag_name = TRIM(SUBSTRING(v_remaining, 1, v_pos - 1));
            SET v_remaining = SUBSTRING(v_remaining, v_pos + 1);
        ELSE
            SET v_tag_name = TRIM(v_remaining);
            SET v_remaining = '';
        END IF;
        
        SELECT id INTO v_tag_id FROM tags WHERE LOWER(name) = LOWER(v_tag_name) LIMIT 1;
        
        IF v_tag_id IS NOT NULL THEN
            IF LENGTH(v_tag_ids) > 0 THEN
                SET v_tag_ids = CONCAT(v_tag_ids, ',"', v_tag_id, '"');
            ELSE
                SET v_tag_ids = CONCAT('"', v_tag_id, '"');
            END IF;
        END IF;
        SET v_tag_id = NULL;
    END WHILE;
    
    -- Create supervisor profile with tag IDs
    INSERT INTO `supervisor_profiles` (`id`, `user_id`, `department`, `tags`, `bio`, `years_of_experience`, `max_slots`, `current_slots`) VALUES
    (v_profile_id, v_user_id, p_department, CONCAT('[', v_tag_ids, ']'), p_bio, p_years_exp, p_max_slots, 0);
END//

DELIMITER ;

-- Create supervisors using the procedure
CALL CreateSupervisor('dr.chen@university.edu', 'Dr. Wei Chen', 'Computer Science', 
    'Expert in deep learning and neural network architectures with 15+ publications.', 12, 5,
    'Deep Learning,TensorFlow,Neural Networks,Python,Computer Vision');

CALL CreateSupervisor('dr.patel@university.edu', 'Dr. Priya Patel', 'Computer Science',
    'Specializing in ML applications for healthcare and natural language processing.', 8, 4,
    'Machine Learning,PyTorch,NLP,Python,Data Science');

CALL CreateSupervisor('dr.johnson@university.edu', 'Dr. Michael Johnson', 'Information Technology',
    'Full-stack web development expert with industry experience at major tech companies.', 10, 6,
    'React,Node.js,TypeScript,REST API,GraphQL,Full-Stack Development');

CALL CreateSupervisor('dr.smith@university.edu', 'Dr. Sarah Smith', 'Computer Science',
    'Focused on scalable web architectures and cloud-native applications.', 7, 5,
    'Vue.js,Python,Django,PostgreSQL,Docker');

CALL CreateSupervisor('dr.kim@university.edu', 'Dr. Jin Kim', 'Computer Science',
    'Cross-platform mobile development specialist with apps in App Store and Play Store.', 9, 4,
    'Flutter,React Native,Swift,Kotlin,iOS Development,Android Development');

CALL CreateSupervisor('dr.garcia@university.edu', 'Dr. Maria Garcia', 'Statistics',
    'Statistical modeling expert with focus on predictive analytics.', 11, 5,
    'Python,R,Statistical Analysis,Pandas,Data Visualization,Data Science');

CALL CreateSupervisor('dr.brown@university.edu', 'Dr. James Brown', 'Computer Science',
    'Big data infrastructure and analytics pipelines specialist.', 6, 4,
    'Big Data,SQL,Python,Data Science,PostgreSQL');

CALL CreateSupervisor('dr.wilson@university.edu', 'Dr. Robert Wilson', 'Information Technology',
    'AWS certified solutions architect with expertise in cloud migrations.', 8, 5,
    'AWS,Azure,Kubernetes,Terraform,Serverless,Microservices');

CALL CreateSupervisor('dr.lee@university.edu', 'Dr. David Lee', 'Computer Science',
    'Former security consultant with CISSP certification.', 14, 3,
    'Penetration Testing,Cryptography,Network Security,Ethical Hacking,Cybersecurity');

CALL CreateSupervisor('dr.taylor@university.edu', 'Dr. Emily Taylor', 'Information Technology',
    'DevOps evangelist focused on automation and continuous delivery.', 7, 5,
    'Docker,CI/CD,Kubernetes,AWS');

CALL CreateSupervisor('dr.martinez@university.edu', 'Dr. Carlos Martinez', 'Computer Science',
    'Database architect with experience in high-throughput systems.', 13, 4,
    'PostgreSQL,MongoDB,Redis,Database Design,SQL');

CALL CreateSupervisor('dr.anderson@university.edu', 'Dr. Thomas Anderson', 'Computer Science',
    'Enterprise architect specializing in distributed systems design.', 15, 4,
    'Microservices,Design Patterns,System Design,Software Architecture');

CALL CreateSupervisor('dr.white@university.edu', 'Dr. Jessica White', 'Design',
    'Human-computer interaction researcher focused on inclusive design.', 9, 5,
    'Figma,UI/UX Design');

CALL CreateSupervisor('dr.nakamoto@university.edu', 'Dr. Satoshi Nakamoto Jr.', 'Computer Science',
    'Blockchain researcher with focus on decentralized applications.', 5, 3,
    'Blockchain,Cryptography');

CALL CreateSupervisor('dr.moore@university.edu', 'Dr. Patricia Moore', 'Electrical Engineering',
    'IoT solutions architect with smart city project experience.', 10, 4,
    'IoT,Embedded Systems');

CALL CreateSupervisor('dr.zhang@university.edu', 'Dr. Li Zhang', 'Computer Science',
    'Computer vision expert with autonomous vehicle research background.', 11, 4,
    'Computer Vision,Python,Deep Learning');

CALL CreateSupervisor('dr.thompson@university.edu', 'Dr. Rachel Thompson', 'Computer Science',
    'NLP researcher specializing in large language models and text analytics.', 6, 5,
    'NLP,Python,Generative AI,Machine Learning');

-- Clean up procedure (optional - remove after seeding)
-- DROP PROCEDURE IF EXISTS CreateSupervisor;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the seed was successful:
-- SELECT COUNT(*) as tag_count FROM tags;
-- SELECT COUNT(*) as sup_count FROM supervisor_profiles;
-- SELECT u.name, sp.department, sp.tags FROM supervisor_profiles sp JOIN users u ON sp.user_id = u.id;
