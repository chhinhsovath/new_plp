-- Legacy Tables Migration for PLP
-- This migration adds tables from the original system that aren't represented in the new Prisma schema
-- These tables may be needed for data migration or legacy compatibility

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Legacy User Management Tables
-- --------------------------------------------------------

-- Table: tbl_users_register (Legacy parent accounts - mapped to new User model)
DROP TABLE IF EXISTS `tbl_users_register`;
CREATE TABLE IF NOT EXISTS `tbl_users_register` (
  `usrID` int(11) NOT NULL AUTO_INCREMENT,
  `usrName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `usrPhone` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `usrUserName` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `usrEmail` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `usrPassword` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `usrGrade` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `usrImage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `usrRegDate` datetime NOT NULL,
  `usrActivate` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0=inactive, 1=active',
  `usrActivateKey` text COLLATE utf8_unicode_ci COMMENT 'JSON array of activation codes',
  `usaExpiredCode` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `usrStatus` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0=disabled, 1=active',
  `usrAllowSubject` text COLLATE utf8_unicode_ci COMMENT 'JSON array of allowed subjects',
  `usrValidUntil` datetime DEFAULT NULL,
  `usrSecretWord` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `usrFacebookId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `usrGoogleId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `usrLastLogin` datetime DEFAULT NULL,
  `usrLoginCount` int(11) DEFAULT '0',
  `usrIPAddress` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`usrID`),
  UNIQUE KEY `usrPhone` (`usrPhone`),
  UNIQUE KEY `usrUserName` (`usrUserName`),
  KEY `usrEmail` (`usrEmail`),
  KEY `usrActivate` (`usrActivate`),
  KEY `usrStatus` (`usrStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_child (Legacy child accounts - mapped to new User model with parentId)
DROP TABLE IF EXISTS `tbl_child`;
CREATE TABLE IF NOT EXISTS `tbl_child` (
  `chiID` int(11) NOT NULL AUTO_INCREMENT,
  `chiUID` int(11) NOT NULL COMMENT 'Parent user ID',
  `chiName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `chiProfile` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `chiGrade` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `chiPassword` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `chiGender` enum('M','F') COLLATE utf8_unicode_ci DEFAULT NULL,
  `chiBirthDate` date DEFAULT NULL,
  `chiCreatedDate` datetime NOT NULL,
  `chiStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`chiID`),
  KEY `chiUID` (`chiUID`),
  CONSTRAINT `fk_child_user` FOREIGN KEY (`chiUID`) REFERENCES `tbl_users_register` (`usrID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_child_information
DROP TABLE IF EXISTS `tbl_child_information`;
CREATE TABLE IF NOT EXISTS `tbl_child_information` (
  `chiID` int(11) NOT NULL,
  `chiSchool` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `chiProvince` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `chiDistrict` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `chiCommune` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `chiNotes` text COLLATE utf8_unicode_ci,
  PRIMARY KEY (`chiID`),
  CONSTRAINT `fk_child_info` FOREIGN KEY (`chiID`) REFERENCES `tbl_child` (`chiID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_user_admin
DROP TABLE IF EXISTS `tbl_user_admin`;
CREATE TABLE IF NOT EXISTS `tbl_user_admin` (
  `usaUserID` int(11) NOT NULL AUTO_INCREMENT,
  `usaFullName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `usaEmail` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `usaPassword` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `usaUserType` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `usaPhone` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `usaImage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `usaCreatedDate` datetime NOT NULL,
  `usaStatus` tinyint(1) NOT NULL DEFAULT '1',
  `usaLastLogin` datetime DEFAULT NULL,
  `usaIPAddress` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`usaUserID`),
  UNIQUE KEY `usaEmail` (`usaEmail`),
  KEY `usaUserType` (`usaUserType`),
  KEY `usaStatus` (`usaStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------
-- Legacy Educational Content Tables
-- --------------------------------------------------------

-- Table: tbl_categories (Legacy content categories)
DROP TABLE IF EXISTS `tbl_categories`;
CREATE TABLE IF NOT EXISTS `tbl_categories` (
  `catID` int(11) NOT NULL AUTO_INCREMENT,
  `catAlias` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `catTitle` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `catTitleKH` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `catParent` int(11) DEFAULT '0',
  `catLevel` int(11) DEFAULT '0',
  `catOrder` int(11) DEFAULT '0',
  `catImage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `catDescription` text COLLATE utf8_unicode_ci,
  `catScore` int(11) DEFAULT '0',
  `catStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`catID`),
  UNIQUE KEY `catAlias` (`catAlias`),
  KEY `catParent` (`catParent`),
  KEY `catStatus` (`catStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_level (Legacy difficulty levels)
DROP TABLE IF EXISTS `tbl_level`;
CREATE TABLE IF NOT EXISTS `tbl_level` (
  `levID` int(11) NOT NULL AUTO_INCREMENT,
  `levName` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `levNameKH` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `levOrder` int(11) DEFAULT '0',
  `levStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`levID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Legacy Exercise Tables (for each subject)
-- These are mapped to the new Exercise model but kept for data migration

-- Table: tbl_exercise (General exercises)
DROP TABLE IF EXISTS `tbl_exercise`;
CREATE TABLE IF NOT EXISTS `tbl_exercise` (
  `excID` int(11) NOT NULL AUTO_INCREMENT,
  `excCategory` int(11) NOT NULL,
  `excTitle` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  `excInstruction` text COLLATE utf8_unicode_ci,
  `excQuestion` text COLLATE utf8_unicode_ci,
  `excImage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `excSound` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `excVideo` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `excLevel` int(11) DEFAULT NULL,
  `excType` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `excStyle` text COLLATE utf8_unicode_ci COMMENT 'JSON style configuration',
  `excAnsRand` tinyint(1) DEFAULT '0' COMMENT '0=no random, 1=randomize',
  `excOrder` int(11) DEFAULT '0',
  `excInputBy` int(11) DEFAULT NULL,
  `excInputDate` datetime DEFAULT NULL,
  `excStatus` tinyint(1) NOT NULL DEFAULT '1',
  `excParentID` int(11) DEFAULT '0',
  PRIMARY KEY (`excID`),
  KEY `excCategory` (`excCategory`),
  KEY `excLevel` (`excLevel`),
  KEY `excStatus` (`excStatus`),
  KEY `excParentID` (`excParentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_answer (General answers)
DROP TABLE IF EXISTS `tbl_answer`;
CREATE TABLE IF NOT EXISTS `tbl_answer` (
  `ansID` int(11) NOT NULL AUTO_INCREMENT,
  `ansExcID` int(11) NOT NULL,
  `ansIndex` int(11) NOT NULL DEFAULT '0',
  `ansValue` text COLLATE utf8_unicode_ci NOT NULL,
  `ansImage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ansSound` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ansAnswer` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0=incorrect, 1=correct',
  `fackans` text COLLATE utf8_unicode_ci,
  `ansInputBy` int(11) DEFAULT NULL,
  `ansInputDate` datetime DEFAULT NULL,
  `ansStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ansID`),
  KEY `ansExcID` (`ansExcID`),
  KEY `ansAnswer` (`ansAnswer`),
  KEY `ansStatus` (`ansStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------
-- Testing and Examination Tables
-- --------------------------------------------------------

-- Table: tbl_test_categories
DROP TABLE IF EXISTS `tbl_test_categories`;
CREATE TABLE IF NOT EXISTS `tbl_test_categories` (
  `tcaID` int(11) NOT NULL AUTO_INCREMENT,
  `tcaName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `tcaNameKH` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tcaDescription` text COLLATE utf8_unicode_ci,
  `tcaOrder` int(11) DEFAULT '0',
  `tcaStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`tcaID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_test_user_answers
DROP TABLE IF EXISTS `tbl_test_user_answers`;
CREATE TABLE IF NOT EXISTS `tbl_test_user_answers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `child_id` int(11) DEFAULT NULL,
  `question_id` int(11) NOT NULL,
  `answer_id` int(11) DEFAULT NULL,
  `answer_value` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `exrgrade` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `exrCategory` int(11) DEFAULT NULL,
  `answer_status` enum('answered','unanswered','skipped') COLLATE utf8_unicode_ci DEFAULT 'unanswered',
  `is_correct` tinyint(1) DEFAULT NULL,
  `answer_time` datetime NOT NULL,
  `time_spent` int(11) DEFAULT NULL COMMENT 'Time spent in seconds',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `child_id` (`child_id`),
  KEY `question_id` (`question_id`),
  KEY `answer_id` (`answer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_test_examinations_result
DROP TABLE IF EXISTS `tbl_test_examinations_result`;
CREATE TABLE IF NOT EXISTS `tbl_test_examinations_result` (
  `exrID` int(11) NOT NULL AUTO_INCREMENT,
  `exrUsrPrentID` int(11) DEFAULT NULL COMMENT 'Parent user ID',
  `exrChildID` int(11) DEFAULT NULL COMMENT 'Child ID',
  `exrCategory` int(11) NOT NULL,
  `exrGrade` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `exrTotalQuestions` int(11) NOT NULL,
  `exrCorrectAnswers` int(11) NOT NULL,
  `exrScore` decimal(5,2) NOT NULL,
  `exrTimeTaken` int(11) DEFAULT NULL COMMENT 'Time in seconds',
  `exrStartTime` datetime NOT NULL,
  `exrEndTime` datetime DEFAULT NULL,
  `exrStatus` enum('started','completed','abandoned') COLLATE utf8_unicode_ci DEFAULT 'started',
  PRIMARY KEY (`exrID`),
  KEY `exrUsrPrentID` (`exrUsrPrentID`),
  KEY `exrChildID` (`exrChildID`),
  KEY `exrCategory` (`exrCategory`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------
-- Analytics and Tracking Tables
-- --------------------------------------------------------

-- Table: tbl_practise_history
DROP TABLE IF EXISTS `tbl_practise_history`;
CREATE TABLE IF NOT EXISTS `tbl_practise_history` (
  `phiID` int(11) NOT NULL AUTO_INCREMENT,
  `phiUserID` int(11) DEFAULT NULL,
  `phiChildID` int(11) DEFAULT NULL,
  `phiCategory` int(11) NOT NULL,
  `phiExerciseID` int(11) NOT NULL,
  `phiScore` int(11) DEFAULT '0',
  `phiAttempts` int(11) DEFAULT '1',
  `phiTimeTaken` int(11) DEFAULT NULL COMMENT 'Time in seconds',
  `phiCompletionStatus` enum('started','completed','abandoned') COLLATE utf8_unicode_ci DEFAULT 'started',
  `phiStartTime` datetime NOT NULL,
  `phiEndTime` datetime DEFAULT NULL,
  PRIMARY KEY (`phiID`),
  KEY `phiUserID` (`phiUserID`),
  KEY `phiChildID` (`phiChildID`),
  KEY `phiCategory` (`phiCategory`),
  KEY `phiExerciseID` (`phiExerciseID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_counter_ip
DROP TABLE IF EXISTS `tbl_counter_ip`;
CREATE TABLE IF NOT EXISTS `tbl_counter_ip` (
  `cipID` int(11) NOT NULL AUTO_INCREMENT,
  `cipIP` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `cipDateTime` datetime NOT NULL,
  `cipUserAgent` text COLLATE utf8_unicode_ci,
  `cipPage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`cipID`),
  KEY `cipIP` (`cipIP`),
  KEY `cipDateTime` (`cipDateTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_counter_values
DROP TABLE IF EXISTS `tbl_counter_values`;
CREATE TABLE IF NOT EXISTS `tbl_counter_values` (
  `cvID` int(11) NOT NULL AUTO_INCREMENT,
  `cvDate` date NOT NULL,
  `cvPageViews` int(11) DEFAULT '0',
  `cvUniqueVisitors` int(11) DEFAULT '0',
  `cvRegistrations` int(11) DEFAULT '0',
  `cvLogins` int(11) DEFAULT '0',
  PRIMARY KEY (`cvID`),
  UNIQUE KEY `cvDate` (`cvDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------
-- School Management Tables
-- --------------------------------------------------------

-- Table: tbl_school_list
DROP TABLE IF EXISTS `tbl_school_list`;
CREATE TABLE IF NOT EXISTS `tbl_school_list` (
  `schID` int(11) NOT NULL AUTO_INCREMENT,
  `schCode` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `schName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `schNameKH` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `schProvince` int(11) DEFAULT NULL,
  `schDistrict` int(11) DEFAULT NULL,
  `schCommune` int(11) DEFAULT NULL,
  `schAddress` text COLLATE utf8_unicode_ci,
  `schPhone` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `schEmail` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `schPrincipal` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `schStudentCount` int(11) DEFAULT '0',
  `schTeacherCount` int(11) DEFAULT '0',
  `schCreatedDate` datetime NOT NULL,
  `schStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`schID`),
  UNIQUE KEY `schCode` (`schCode`),
  KEY `schProvince` (`schProvince`),
  KEY `schDistrict` (`schDistrict`),
  KEY `schCommune` (`schCommune`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_province
DROP TABLE IF EXISTS `tbl_province`;
CREATE TABLE IF NOT EXISTS `tbl_province` (
  `proID` int(11) NOT NULL AUTO_INCREMENT,
  `proCode` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `proName` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `proNameKH` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `proOrder` int(11) DEFAULT '0',
  PRIMARY KEY (`proID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_destrict (Note: typo in original - should be 'district')
DROP TABLE IF EXISTS `tbl_destrict`;
CREATE TABLE IF NOT EXISTS `tbl_destrict` (
  `disID` int(11) NOT NULL AUTO_INCREMENT,
  `disProvinceID` int(11) NOT NULL,
  `disCode` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `disName` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `disNameKH` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `disOrder` int(11) DEFAULT '0',
  PRIMARY KEY (`disID`),
  KEY `disProvinceID` (`disProvinceID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_commune
DROP TABLE IF EXISTS `tbl_commune`;
CREATE TABLE IF NOT EXISTS `tbl_commune` (
  `comID` int(11) NOT NULL AUTO_INCREMENT,
  `comDistrictID` int(11) NOT NULL,
  `comCode` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `comName` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `comNameKH` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `comOrder` int(11) DEFAULT '0',
  PRIMARY KEY (`comID`),
  KEY `comDistrictID` (`comDistrictID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------
-- Payment/Subscription Tables
-- --------------------------------------------------------

-- Table: tbl_generate_card
DROP TABLE IF EXISTS `tbl_generate_card`;
CREATE TABLE IF NOT EXISTS `tbl_generate_card` (
  `gcnID` int(11) NOT NULL AUTO_INCREMENT,
  `gcnCardNumber` varchar(16) COLLATE utf8_unicode_ci NOT NULL,
  `gcnNoChilde` int(11) DEFAULT '1',
  `gcnAmount` decimal(10,2) NOT NULL,
  `gcnDuration` int(11) NOT NULL COMMENT 'Duration in days',
  `gcnSubjects` text COLLATE utf8_unicode_ci COMMENT 'JSON array of allowed subjects',
  `gcnGeneratedBy` int(11) DEFAULT NULL,
  `gcnGeneratedDate` datetime NOT NULL,
  `gcnUsedBy` int(11) DEFAULT NULL,
  `gcnUsedDate` datetime DEFAULT NULL,
  `gcnStatus` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0=used, 1=active',
  PRIMARY KEY (`gcnID`),
  UNIQUE KEY `gcnCardNumber` (`gcnCardNumber`),
  KEY `gcnStatus` (`gcnStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_request_add_card
DROP TABLE IF EXISTS `tbl_request_add_card`;
CREATE TABLE IF NOT EXISTS `tbl_request_add_card` (
  `racID` int(11) NOT NULL AUTO_INCREMENT,
  `racUserID` int(11) NOT NULL,
  `racSubject` text COLLATE utf8_unicode_ci COMMENT 'JSON array of subjects',
  `racDuration` int(11) NOT NULL,
  `racNumChild` int(11) DEFAULT '1',
  `racPrice` decimal(10,2) NOT NULL,
  `racDateTime` datetime NOT NULL,
  `racAgencyAccount` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `racImage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Payment proof',
  `racType` tinyint(1) DEFAULT '1' COMMENT '1=Wing, 2=ABA/Bakong/Cards',
  `racTransactionID` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `racApprovedBy` int(11) DEFAULT NULL,
  `racApprovedDate` datetime DEFAULT NULL,
  `racStatus` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0=pending, 1=approved, 2=rejected',
  PRIMARY KEY (`racID`),
  KEY `racUserID` (`racUserID`),
  KEY `racStatus` (`racStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_card_price
DROP TABLE IF EXISTS `tbl_card_price`;
CREATE TABLE IF NOT EXISTS `tbl_card_price` (
  `cprID` int(11) NOT NULL AUTO_INCREMENT,
  `cprDuration` int(11) NOT NULL COMMENT 'Duration in days',
  `cprPrice` decimal(10,2) NOT NULL,
  `cprCurrency` varchar(10) COLLATE utf8_unicode_ci DEFAULT 'USD',
  `cprDescription` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cprOrder` int(11) DEFAULT '0',
  `cprStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`cprID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------
-- Homework Management Tables
-- --------------------------------------------------------

-- Table: tbl_homework_task
DROP TABLE IF EXISTS `tbl_homework_task`;
CREATE TABLE IF NOT EXISTS `tbl_homework_task` (
  `hwtID` int(11) NOT NULL AUTO_INCREMENT,
  `hwtParentID` int(11) NOT NULL COMMENT 'Teacher/Parent who assigned',
  `hwtTitle` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `hwtDetail` text COLLATE utf8_unicode_ci,
  `hwtSubject` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `hwtGrade` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `hwtExpiredDate` datetime NOT NULL,
  `hwtVideoLinks` text COLLATE utf8_unicode_ci,
  `hwtOtherFiles` text COLLATE utf8_unicode_ci COMMENT 'JSON array of files',
  `hwtImages` text COLLATE utf8_unicode_ci COMMENT 'JSON array of images',
  `hwtCreatedDate` datetime NOT NULL,
  `hwtStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`hwtID`),
  KEY `hwtParentID` (`hwtParentID`),
  KEY `hwtExpiredDate` (`hwtExpiredDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_submit_homework
DROP TABLE IF EXISTS `tbl_submit_homework`;
CREATE TABLE IF NOT EXISTS `tbl_submit_homework` (
  `shwID` int(11) NOT NULL AUTO_INCREMENT,
  `shwTaskID` int(11) NOT NULL,
  `shwChildID` int(11) NOT NULL,
  `shwSubmission` text COLLATE utf8_unicode_ci,
  `shwFiles` text COLLATE utf8_unicode_ci COMMENT 'JSON array of submitted files',
  `shwSubmittedDate` datetime NOT NULL,
  `shwScore` int(11) DEFAULT NULL,
  `shwFeedback` text COLLATE utf8_unicode_ci,
  `shwGradedBy` int(11) DEFAULT NULL,
  `shwGradedDate` datetime DEFAULT NULL,
  `shwStatus` enum('submitted','graded','returned') COLLATE utf8_unicode_ci DEFAULT 'submitted',
  PRIMARY KEY (`shwID`),
  KEY `shwTaskID` (`shwTaskID`),
  KEY `shwChildID` (`shwChildID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------
-- Legacy Content Tables
-- --------------------------------------------------------

-- Table: tbl_page
DROP TABLE IF EXISTS `tbl_page`;
CREATE TABLE IF NOT EXISTS `tbl_page` (
  `pagID` int(11) NOT NULL AUTO_INCREMENT,
  `pagSlug` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `pagTitle` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `pagTitleKH` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `pagContent` longtext COLLATE utf8_unicode_ci,
  `pagContentKH` longtext COLLATE utf8_unicode_ci,
  `pagMetaTitle` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `pagMetaDescription` text COLLATE utf8_unicode_ci,
  `pagMetaKeywords` text COLLATE utf8_unicode_ci,
  `pagOrder` int(11) DEFAULT '0',
  `pagCreatedBy` int(11) DEFAULT NULL,
  `pagCreatedDate` datetime NOT NULL,
  `pagModifiedDate` datetime DEFAULT NULL,
  `pagStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`pagID`),
  UNIQUE KEY `pagSlug` (`pagSlug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------
-- Data Migration Mapping Tables
-- --------------------------------------------------------

-- Table to map old user IDs to new user IDs
DROP TABLE IF EXISTS `migration_user_mapping`;
CREATE TABLE IF NOT EXISTS `migration_user_mapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `old_user_id` int(11) NOT NULL,
  `old_user_type` enum('parent','child','admin') NOT NULL,
  `new_user_id` varchar(25) NOT NULL COMMENT 'cuid from new system',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `old_mapping` (`old_user_id`, `old_user_type`),
  KEY `new_user_id` (`new_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table to map old exercise IDs to new exercise IDs
DROP TABLE IF EXISTS `migration_exercise_mapping`;
CREATE TABLE IF NOT EXISTS `migration_exercise_mapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `old_exercise_id` int(11) NOT NULL,
  `old_exercise_table` varchar(50) NOT NULL,
  `new_exercise_id` varchar(25) NOT NULL COMMENT 'cuid from new system',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `old_mapping` (`old_exercise_id`, `old_exercise_table`),
  KEY `new_exercise_id` (`new_exercise_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table to map old category IDs to new subject/lesson IDs
DROP TABLE IF EXISTS `migration_category_mapping`;
CREATE TABLE IF NOT EXISTS `migration_category_mapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `old_category_id` int(11) NOT NULL,
  `new_subject_id` varchar(25) DEFAULT NULL,
  `new_lesson_id` varchar(25) DEFAULT NULL,
  `mapping_type` enum('subject','lesson') NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `old_category_id` (`old_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;