-- =============================================================================
-- SUP-CONNECT Seed Data
-- Run AFTER database-schema.sql to bootstrap the system
-- =============================================================================
--
-- Default Accounts:
--   SUPER_ADMIN:  superadmin@supconnect.com / SuperAdmin@123
--   ADMIN:        admin@supconnect.com      / Admin@123
--
-- ⚠️  CHANGE THESE PASSWORDS IMMEDIATELY AFTER FIRST LOGIN
-- =============================================================================

USE `railway`;

SET @NOW = NOW();

-- =============================================================================
-- 1. SUPER_ADMIN USER (required — cannot be created via API)
-- =============================================================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'superadmin@supconnect.com',
  '$2b$10$VWoThmhneSIqP6bZB67N3eqQnNkSslsLHlgQZblSoapImoAz4coDa',
  'System Super Admin',
  'SUPER_ADMIN',
  @NOW,
  @NOW
);

-- =============================================================================
-- 2. ADMIN USER (starter admin for day-to-day management)
-- =============================================================================

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'admin@supconnect.com',
  '$2b$10$zI4jALAs7mGnywFGm2zJuOyw3t5lEUN8B1iH4.hcni0G0U9D.7Z.q',
  'System Admin',
  'ADMIN',
  @NOW,
  @NOW
);

-- =============================================================================
-- 3. DEPARTMENTS
-- =============================================================================

INSERT INTO `departments` (`id`, `name`, `code`, `is_active`, `sort_order`, `created_at`) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Computer Science',               'CS',    1,  10, @NOW),
  ('d0000000-0000-0000-0000-000000000002', 'Information Technology',          'IT',    1,  20, @NOW),
  ('d0000000-0000-0000-0000-000000000003', 'Software Engineering',            'SE',    1,  30, @NOW),
  ('d0000000-0000-0000-0000-000000000004', 'Data Science',                    'DS',    1,  40, @NOW),
  ('d0000000-0000-0000-0000-000000000005', 'Cybersecurity',                   'CYB',   1,  50, @NOW),
  ('d0000000-0000-0000-0000-000000000006', 'Electrical & Electronic Eng.',    'EEE',   1,  60, @NOW),
  ('d0000000-0000-0000-0000-000000000007', 'Mechanical Engineering',          'ME',    1,  70, @NOW),
  ('d0000000-0000-0000-0000-000000000008', 'Business Information Systems',    'BIS',   1,  80, @NOW);

-- =============================================================================
-- 4. TAGS (organized by category — matches AI prompt categories)
-- =============================================================================

-- ── Artificial Intelligence ──────────────────────────────────────────────────

INSERT INTO `tags` (`id`, `name`, `category`, `is_active`, `sort_order`, `created_at`) VALUES
  ('t0000000-0000-0000-0001-000000000001', 'Machine Learning',       'Artificial Intelligence', 1, 10, @NOW),
  ('t0000000-0000-0000-0001-000000000002', 'Deep Learning',          'Artificial Intelligence', 1, 20, @NOW),
  ('t0000000-0000-0000-0001-000000000003', 'Natural Language Processing', 'Artificial Intelligence', 1, 30, @NOW),
  ('t0000000-0000-0000-0001-000000000004', 'Computer Vision',        'Artificial Intelligence', 1, 40, @NOW),
  ('t0000000-0000-0000-0001-000000000005', 'Reinforcement Learning', 'Artificial Intelligence', 1, 50, @NOW),
  ('t0000000-0000-0000-0001-000000000006', 'Generative AI',          'Artificial Intelligence', 1, 60, @NOW),
  ('t0000000-0000-0000-0001-000000000007', 'Robotics',               'Artificial Intelligence', 1, 70, @NOW);

-- ── Software Development ─────────────────────────────────────────────────────

INSERT INTO `tags` (`id`, `name`, `category`, `is_active`, `sort_order`, `created_at`) VALUES
  ('t0000000-0000-0000-0002-000000000001', 'Web Development',        'Software Development',    1, 10, @NOW),
  ('t0000000-0000-0000-0002-000000000002', 'Mobile Development',     'Software Development',    1, 20, @NOW),
  ('t0000000-0000-0000-0002-000000000003', 'API Design',             'Software Development',    1, 30, @NOW),
  ('t0000000-0000-0000-0002-000000000004', 'Microservices',          'Software Development',    1, 40, @NOW),
  ('t0000000-0000-0000-0002-000000000005', 'Full Stack',             'Software Development',    1, 50, @NOW),
  ('t0000000-0000-0000-0002-000000000006', 'Game Development',       'Software Development',    1, 60, @NOW);

-- ── Data ─────────────────────────────────────────────────────────────────────

INSERT INTO `tags` (`id`, `name`, `category`, `is_active`, `sort_order`, `created_at`) VALUES
  ('t0000000-0000-0000-0003-000000000001', 'Data Engineering',       'Data',                    1, 10, @NOW),
  ('t0000000-0000-0000-0003-000000000002', 'Data Analytics',         'Data',                    1, 20, @NOW),
  ('t0000000-0000-0000-0003-000000000003', 'Big Data',               'Data',                    1, 30, @NOW),
  ('t0000000-0000-0000-0003-000000000004', 'Data Visualization',     'Data',                    1, 40, @NOW),
  ('t0000000-0000-0000-0003-000000000005', 'Database Systems',       'Data',                    1, 50, @NOW);

-- ── Security ─────────────────────────────────────────────────────────────────

INSERT INTO `tags` (`id`, `name`, `category`, `is_active`, `sort_order`, `created_at`) VALUES
  ('t0000000-0000-0000-0004-000000000001', 'Network Security',       'Security',                1, 10, @NOW),
  ('t0000000-0000-0000-0004-000000000002', 'Cryptography',           'Security',                1, 20, @NOW),
  ('t0000000-0000-0000-0004-000000000003', 'Penetration Testing',    'Security',                1, 30, @NOW),
  ('t0000000-0000-0000-0004-000000000004', 'Digital Forensics',      'Security',                1, 40, @NOW),
  ('t0000000-0000-0000-0004-000000000005', 'Malware Analysis',       'Security',                1, 50, @NOW);

-- ── Cloud & DevOps ───────────────────────────────────────────────────────────

INSERT INTO `tags` (`id`, `name`, `category`, `is_active`, `sort_order`, `created_at`) VALUES
  ('t0000000-0000-0000-0005-000000000001', 'Cloud Computing',        'Cloud & DevOps',          1, 10, @NOW),
  ('t0000000-0000-0000-0005-000000000002', 'DevOps',                 'Cloud & DevOps',          1, 20, @NOW),
  ('t0000000-0000-0000-0005-000000000003', 'Containerization',       'Cloud & DevOps',          1, 30, @NOW),
  ('t0000000-0000-0000-0005-000000000004', 'CI/CD',                  'Cloud & DevOps',          1, 40, @NOW),
  ('t0000000-0000-0000-0005-000000000005', 'Serverless',             'Cloud & DevOps',          1, 50, @NOW);

-- ── Hardware & IoT ───────────────────────────────────────────────────────────

INSERT INTO `tags` (`id`, `name`, `category`, `is_active`, `sort_order`, `created_at`) VALUES
  ('t0000000-0000-0000-0006-000000000001', 'IoT',                    'Hardware & IoT',          1, 10, @NOW),
  ('t0000000-0000-0000-0006-000000000002', 'Embedded Systems',       'Hardware & IoT',          1, 20, @NOW),
  ('t0000000-0000-0000-0006-000000000003', 'FPGA',                   'Hardware & IoT',          1, 30, @NOW),
  ('t0000000-0000-0000-0006-000000000004', 'Arduino',                'Hardware & IoT',          1, 40, @NOW),
  ('t0000000-0000-0000-0006-000000000005', 'Raspberry Pi',           'Hardware & IoT',          1, 50, @NOW);

-- ── Domain ───────────────────────────────────────────────────────────────────

INSERT INTO `tags` (`id`, `name`, `category`, `is_active`, `sort_order`, `created_at`) VALUES
  ('t0000000-0000-0000-0007-000000000001', 'Healthcare',             'Domain',                  1, 10, @NOW),
  ('t0000000-0000-0000-0007-000000000002', 'FinTech',                'Domain',                  1, 20, @NOW),
  ('t0000000-0000-0000-0007-000000000003', 'EdTech',                 'Domain',                  1, 30, @NOW),
  ('t0000000-0000-0000-0007-000000000004', 'E-Commerce',             'Domain',                  1, 40, @NOW),
  ('t0000000-0000-0000-0007-000000000005', 'Agriculture',            'Domain',                  1, 50, @NOW);

-- ── Other ────────────────────────────────────────────────────────────────────

INSERT INTO `tags` (`id`, `name`, `category`, `is_active`, `sort_order`, `created_at`) VALUES
  ('t0000000-0000-0000-0008-000000000001', 'Blockchain',             'Other',                   1, 10, @NOW),
  ('t0000000-0000-0000-0008-000000000002', 'AR/VR',                  'Other',                   1, 20, @NOW),
  ('t0000000-0000-0000-0008-000000000003', 'Quantum Computing',      'Other',                   1, 30, @NOW),
  ('t0000000-0000-0000-0008-000000000004', 'Human-Computer Interaction', 'Other',               1, 40, @NOW),
  ('t0000000-0000-0000-0008-000000000005', 'Bioinformatics',         'Other',                   1, 50, @NOW);

-- =============================================================================
-- Done. System is ready for use.
--
-- Next steps:
--   1. Login as superadmin@supconnect.com / SuperAdmin@123
--   2. CHANGE THE PASSWORD immediately
--   3. Register supervisors and students via the admin panel or self-registration
-- =============================================================================
