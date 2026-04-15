CREATE DATABASE  IF NOT EXISTS `railway` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `railway`;
-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: metro.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `availability_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `supervisor_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_time` timestamp NOT NULL,
  `duration` int NOT NULL DEFAULT '30',
  `status` enum('PENDING','CONFIRMED','CANCELLED','COMPLETED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_supervisor` (`supervisor_id`),
  KEY `idx_availability` (`availability_id`),
  KEY `idx_datetime` (`date_time`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_appointment_availability` FOREIGN KEY (`availability_id`) REFERENCES `supervisor_availability` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appointment_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appointment_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisor_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `supervisor_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `can_edit_idea` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student` (`student_id`),
  KEY `idx_supervisor` (`supervisor_id`),
  CONSTRAINT `fk_assign_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assign_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisor_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_requests`
--

DROP TABLE IF EXISTS `booking_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_requests` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `supervisor_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','ACCEPTED','DECLINED','SLOT_FULL','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_supervisor` (`supervisor_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_booking_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisor_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_requests`
--

LOCK TABLES `booking_requests` WRITE;
/*!40000 ALTER TABLE `booking_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '100',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`),
  KEY `idx_active` (`is_active`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES ('d0000000-0000-0000-0000-000000000001','Computer Science','CS',1,10,'2026-04-14 09:16:52'),('d0000000-0000-0000-0000-000000000002','Information Technology','IT',1,20,'2026-04-14 09:16:52'),('d0000000-0000-0000-0000-000000000003','Software Engineering','SE',1,30,'2026-04-14 09:16:52'),('d0000000-0000-0000-0000-000000000004','Data Science','DS',1,40,'2026-04-14 09:16:52'),('d0000000-0000-0000-0000-000000000005','Cybersecurity','CYB',1,50,'2026-04-14 09:16:52'),('d0000000-0000-0000-0000-000000000006','Electrical & Electronic Eng.','EEE',1,60,'2026-04-14 09:16:52'),('d0000000-0000-0000-0000-000000000007','Mechanical Engineering','ME',1,70,'2026-04-14 09:16:52'),('d0000000-0000-0000-0000-000000000008','Business Information Systems','BIS',1,80,'2026-04-14 09:16:52');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meetings`
--

DROP TABLE IF EXISTS `meetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meetings` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `supervisor_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_time` timestamp NOT NULL,
  `mode` enum('IN_PERSON','ONLINE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_supervisor` (`supervisor_id`),
  KEY `idx_datetime` (`date_time`),
  CONSTRAINT `fk_meeting_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_meeting_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisor_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meetings`
--

LOCK TABLES `meetings` WRITE;
/*!40000 ALTER TABLE `meetings` DISABLE KEYS */;
/*!40000 ALTER TABLE `meetings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_receiver` (`receiver_id`),
  KEY `idx_sender_receiver` (`sender_id`,`receiver_id`),
  KEY `idx_receiver_read` (`receiver_id`,`is_read`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `fk_message_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_message_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_user_read` (`user_id`,`is_read`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_chk_data` CHECK (((`data` is null) or json_valid(`data`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_ideas`
--

DROP TABLE IF EXISTS `project_ideas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_ideas` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keywords` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_category` (`category`),
  CONSTRAINT `fk_idea_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_ideas_chk_1` CHECK (json_valid(`keywords`)),
  CONSTRAINT `project_ideas_chk_2` CHECK (json_valid(`tags`)),
  CONSTRAINT `project_ideas_chk_3` CHECK (json_valid(`attachments`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_ideas`
--

LOCK TABLES `project_ideas` WRITE;
/*!40000 ALTER TABLE `project_ideas` DISABLE KEYS */;
INSERT INTO `project_ideas` VALUES ('16fd7dbb-393e-4365-ab23-8fd8fcc31330','d107574b-5514-460c-afd9-4129b3118fcf','SaaS Project Management Tool','Description: Build a project management SaaS platform that features task tracking, project timelines, and collaboration tools, ideal for freelancers and teams. This project introduces full-scale SaaS architecture, security, and subscription management.\nTech Stack: React, Next.js, Node.js, Prisma, PostgreSQL, Stripe for subscription management, WebSockets for real-time updates.\nFeatures:\nMulti-tenant setup with project workspaces\nReal-time updates and notifications\nRole-based access control (RBAC) for team management\nPayment integration and subscription management with Stripe\nLearning Path: Multi-tenant applications, payment systems, and advanced backend management.\nOpen-source Focus: High-value SaaS project for open-source, useful as a blueprint for subscription-based services.',NULL,NULL,'[\"t0000000-0000-0000-0002-000000000001\",\"t0000000-0000-0000-0002-000000000005\",\"t0000000-0000-0000-0005-000000000001\",\"t0000000-0000-0000-0003-000000000005\",\"t0000000-0000-0000-0007-000000000002\",\"t0000000-0000-0000-0002-000000000003\",\"t0000000-0000-0000-0005-000000000002\"]','[]','2026-04-14 10:24:46','2026-04-14 10:24:46');
/*!40000 ALTER TABLE `project_ideas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_profiles`
--

DROP TABLE IF EXISTS `student_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_profiles` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `registration_no` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `research_interests` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `preferred_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `profile_picture` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`),
  UNIQUE KEY `uk_reg_no` (`registration_no`),
  KEY `idx_department` (`department`),
  CONSTRAINT `fk_student_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_profiles_chk_1` CHECK (json_valid(`preferred_fields`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_profiles`
--

LOCK TABLES `student_profiles` WRITE;
/*!40000 ALTER TABLE `student_profiles` DISABLE KEYS */;
INSERT INTO `student_profiles` VALUES ('97a2d145-163e-4a59-b19c-aa5f04e30443','d107574b-5514-460c-afd9-4129b3118fcf','20222211','Computer Science',NULL,NULL,NULL,'2026-04-14 09:24:41','2026-04-14 09:24:41');
/*!40000 ALTER TABLE `student_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supervisor_availability`
--

DROP TABLE IF EXISTS `supervisor_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supervisor_availability` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `supervisor_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `slot_duration` int NOT NULL DEFAULT '30',
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_supervisor` (`supervisor_id`),
  KEY `idx_date` (`date`),
  KEY `idx_supervisor_date` (`supervisor_id`,`date`),
  CONSTRAINT `fk_availability_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisor_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supervisor_availability`
--

LOCK TABLES `supervisor_availability` WRITE;
/*!40000 ALTER TABLE `supervisor_availability` DISABLE KEYS */;
/*!40000 ALTER TABLE `supervisor_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supervisor_profiles`
--

DROP TABLE IF EXISTS `supervisor_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supervisor_profiles` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `years_of_experience` int NOT NULL DEFAULT '0',
  `max_slots` int NOT NULL DEFAULT '5',
  `current_slots` int NOT NULL DEFAULT '0',
  `profile_picture` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`),
  KEY `idx_department` (`department`),
  KEY `idx_slots` (`current_slots`,`max_slots`),
  CONSTRAINT `fk_supervisor_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supervisor_profiles_chk_1` CHECK (json_valid(`tags`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supervisor_profiles`
--

LOCK TABLES `supervisor_profiles` WRITE;
/*!40000 ALTER TABLE `supervisor_profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `supervisor_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Other',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '100',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`),
  KEY `idx_category` (`category`),
  KEY `idx_active` (`is_active`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES ('t0000000-0000-0000-0001-000000000001','Machine Learning','Artificial Intelligence',1,10,'2026-04-14 09:16:52'),('t0000000-0000-0000-0001-000000000002','Deep Learning','Artificial Intelligence',1,20,'2026-04-14 09:16:52'),('t0000000-0000-0000-0001-000000000003','Natural Language Processing','Artificial Intelligence',1,30,'2026-04-14 09:16:52'),('t0000000-0000-0000-0001-000000000004','Computer Vision','Artificial Intelligence',1,40,'2026-04-14 09:16:52'),('t0000000-0000-0000-0001-000000000005','Reinforcement Learning','Artificial Intelligence',1,50,'2026-04-14 09:16:52'),('t0000000-0000-0000-0001-000000000006','Generative AI','Artificial Intelligence',1,60,'2026-04-14 09:16:52'),('t0000000-0000-0000-0001-000000000007','Robotics','Artificial Intelligence',1,70,'2026-04-14 09:16:52'),('t0000000-0000-0000-0002-000000000001','Web Development','Software Development',1,10,'2026-04-14 09:16:52'),('t0000000-0000-0000-0002-000000000002','Mobile Development','Software Development',1,20,'2026-04-14 09:16:52'),('t0000000-0000-0000-0002-000000000003','API Design','Software Development',1,30,'2026-04-14 09:16:52'),('t0000000-0000-0000-0002-000000000004','Microservices','Software Development',1,40,'2026-04-14 09:16:52'),('t0000000-0000-0000-0002-000000000005','Full Stack','Software Development',1,50,'2026-04-14 09:16:52'),('t0000000-0000-0000-0002-000000000006','Game Development','Software Development',1,60,'2026-04-14 09:16:52'),('t0000000-0000-0000-0003-000000000001','Data Engineering','Data',1,10,'2026-04-14 09:16:52'),('t0000000-0000-0000-0003-000000000002','Data Analytics','Data',1,20,'2026-04-14 09:16:52'),('t0000000-0000-0000-0003-000000000003','Big Data','Data',1,30,'2026-04-14 09:16:52'),('t0000000-0000-0000-0003-000000000004','Data Visualization','Data',1,40,'2026-04-14 09:16:52'),('t0000000-0000-0000-0003-000000000005','Database Systems','Data',1,50,'2026-04-14 09:16:52'),('t0000000-0000-0000-0004-000000000001','Network Security','Security',1,10,'2026-04-14 09:16:52'),('t0000000-0000-0000-0004-000000000002','Cryptography','Security',1,20,'2026-04-14 09:16:52'),('t0000000-0000-0000-0004-000000000003','Penetration Testing','Security',1,30,'2026-04-14 09:16:52'),('t0000000-0000-0000-0004-000000000004','Digital Forensics','Security',1,40,'2026-04-14 09:16:52'),('t0000000-0000-0000-0004-000000000005','Malware Analysis','Security',1,50,'2026-04-14 09:16:52'),('t0000000-0000-0000-0005-000000000001','Cloud Computing','Cloud & DevOps',1,10,'2026-04-14 09:16:52'),('t0000000-0000-0000-0005-000000000002','DevOps','Cloud & DevOps',1,20,'2026-04-14 09:16:52'),('t0000000-0000-0000-0005-000000000003','Containerization','Cloud & DevOps',1,30,'2026-04-14 09:16:52'),('t0000000-0000-0000-0005-000000000004','CI/CD','Cloud & DevOps',1,40,'2026-04-14 09:16:52'),('t0000000-0000-0000-0005-000000000005','Serverless','Cloud & DevOps',1,50,'2026-04-14 09:16:52'),('t0000000-0000-0000-0006-000000000001','IoT','Hardware & IoT',1,10,'2026-04-14 09:16:52'),('t0000000-0000-0000-0006-000000000002','Embedded Systems','Hardware & IoT',1,20,'2026-04-14 09:16:52'),('t0000000-0000-0000-0006-000000000003','FPGA','Hardware & IoT',1,30,'2026-04-14 09:16:52'),('t0000000-0000-0000-0006-000000000004','Arduino','Hardware & IoT',1,40,'2026-04-14 09:16:52'),('t0000000-0000-0000-0006-000000000005','Raspberry Pi','Hardware & IoT',1,50,'2026-04-14 09:16:52'),('t0000000-0000-0000-0007-000000000001','Healthcare','Domain',1,10,'2026-04-14 09:16:52'),('t0000000-0000-0000-0007-000000000002','FinTech','Domain',1,20,'2026-04-14 09:16:52'),('t0000000-0000-0000-0007-000000000003','EdTech','Domain',1,30,'2026-04-14 09:16:52'),('t0000000-0000-0000-0007-000000000004','E-Commerce','Domain',1,40,'2026-04-14 09:16:52'),('t0000000-0000-0000-0007-000000000005','Agriculture','Domain',1,50,'2026-04-14 09:16:52'),('t0000000-0000-0000-0008-000000000001','Blockchain','Other',1,10,'2026-04-14 09:16:52'),('t0000000-0000-0000-0008-000000000002','AR/VR','Other',1,20,'2026-04-14 09:16:52'),('t0000000-0000-0000-0008-000000000003','Quantum Computing','Other',1,30,'2026-04-14 09:16:52'),('t0000000-0000-0000-0008-000000000004','Human-Computer Interaction','Other',1,40,'2026-04-14 09:16:52'),('t0000000-0000-0000-0008-000000000005','Bioinformatics','Other',1,50,'2026-04-14 09:16:52');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('STUDENT','SUPERVISOR','ADMIN','SUPER_ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('a0000000-0000-0000-0000-000000000001','superadmin@supconnect.com','$2b$10$7KwAylU.8uMbeIUereM2F.Tchgzb4sFZ5HQ6RZ3FJB9/735FUiu9.','System Super Admin','SUPER_ADMIN','2026-04-14 09:16:53','2026-04-14 09:16:53',NULL),('a0000000-0000-0000-0000-000000000002','admin@supconnect.com','$2b$10$7KwAylU.8uMbeIUereM2F.Tchgzb4sFZ5HQ6RZ3FJB9/735FUiu9.','System Admin','ADMIN','2026-04-14 09:16:53','2026-04-14 09:16:53',NULL),('d107574b-5514-460c-afd9-4129b3118fcf','netheshdineshara123@gmail.com','$2b$10$jx3RAIvmZKB1ThHzjgn/tOPpKtmyQn7JVQ9JU9HYdOvwzNELhNJmS','Nethesh Dineshara Aluthgamage','STUDENT','2026-04-14 09:24:40','2026-04-14 09:24:40',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'railway'
--

--
-- Dumping routines for database 'railway'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-14 16:06:28
