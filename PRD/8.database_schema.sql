-- Primary Learning Platform (PLP) Database Schema
-- Complete MySQL Database Structure
-- Character Set: utf8_unicode_ci
-- Engine: InnoDB

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- User Management Tables
-- --------------------------------------------------------

-- Table: tbl_users_register (Main user/parent accounts)
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

-- Table: tbl_child (Child accounts linked to parents)
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

-- Table: tbl_child_information (Extended child information)
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

-- Table: tbl_user_admin (Administrative users)
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
-- Educational Content Tables
-- --------------------------------------------------------

-- Table: tbl_categories (Content categories)
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

-- Table: tbl_level (Difficulty levels)
DROP TABLE IF EXISTS `tbl_level`;
CREATE TABLE IF NOT EXISTS `tbl_level` (
  `levID` int(11) NOT NULL AUTO_INCREMENT,
  `levName` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `levNameKH` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `levOrder` int(11) DEFAULT '0',
  `levStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`levID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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

-- Table: tbl_english_exercise (English specific exercises)
DROP TABLE IF EXISTS `tbl_english_exercise`;
CREATE TABLE IF NOT EXISTS `tbl_english_exercise` (
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
  `excStyle` text COLLATE utf8_unicode_ci,
  `excAnsRand` tinyint(1) DEFAULT '0',
  `excOrder` int(11) DEFAULT '0',
  `excInputBy` int(11) DEFAULT NULL,
  `excInputDate` datetime DEFAULT NULL,
  `excStatus` tinyint(1) NOT NULL DEFAULT '1',
  `excParentID` int(11) DEFAULT '0',
  PRIMARY KEY (`excID`),
  KEY `excCategory` (`excCategory`),
  KEY `excLevel` (`excLevel`),
  KEY `excStatus` (`excStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_khmer_exercise (Khmer language exercises)
DROP TABLE IF EXISTS `tbl_khmer_exercise`;
CREATE TABLE IF NOT EXISTS `tbl_khmer_exercise` (
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
  `excStyle` text COLLATE utf8_unicode_ci,
  `excAnsRand` tinyint(1) DEFAULT '0',
  `excOrder` int(11) DEFAULT '0',
  `excInputBy` int(11) DEFAULT NULL,
  `excInputDate` datetime DEFAULT NULL,
  `excStatus` tinyint(1) NOT NULL DEFAULT '1',
  `excParentID` int(11) DEFAULT '0',
  PRIMARY KEY (`excID`),
  KEY `excCategory` (`excCategory`),
  KEY `excLevel` (`excLevel`),
  KEY `excStatus` (`excStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_math_exercise (Mathematics exercises)
DROP TABLE IF EXISTS `tbl_math_exercise`;
CREATE TABLE IF NOT EXISTS `tbl_math_exercise` (
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
  `excStyle` text COLLATE utf8_unicode_ci,
  `excAnsRand` tinyint(1) DEFAULT '0',
  `excOrder` int(11) DEFAULT '0',
  `excInputBy` int(11) DEFAULT NULL,
  `excInputDate` datetime DEFAULT NULL,
  `excStatus` tinyint(1) NOT NULL DEFAULT '1',
  `excParentID` int(11) DEFAULT '0',
  PRIMARY KEY (`excID`),
  KEY `excCategory` (`excCategory`),
  KEY `excLevel` (`excLevel`),
  KEY `excStatus` (`excStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_science_exercise (Science exercises)
DROP TABLE IF EXISTS `tbl_science_exercise`;
CREATE TABLE IF NOT EXISTS `tbl_science_exercise` (
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
  `excStyle` text COLLATE utf8_unicode_ci,
  `excAnsRand` tinyint(1) DEFAULT '0',
  `excOrder` int(11) DEFAULT '0',
  `excInputBy` int(11) DEFAULT NULL,
  `excInputDate` datetime DEFAULT NULL,
  `excStatus` tinyint(1) NOT NULL DEFAULT '1',
  `excParentID` int(11) DEFAULT '0',
  PRIMARY KEY (`excID`),
  KEY `excCategory` (`excCategory`),
  KEY `excLevel` (`excLevel`),
  KEY `excStatus` (`excStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Additional subject exercise tables (subjx1 through subjx12)
-- Table: tbl_subjx1_exercise
DROP TABLE IF EXISTS `tbl_subjx1_exercise`;
CREATE TABLE IF NOT EXISTS `tbl_subjx1_exercise` (
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
  `excStyle` text COLLATE utf8_unicode_ci,
  `excAnsRand` tinyint(1) DEFAULT '0',
  `excOrder` int(11) DEFAULT '0',
  `excInputBy` int(11) DEFAULT NULL,
  `excInputDate` datetime DEFAULT NULL,
  `excStatus` tinyint(1) NOT NULL DEFAULT '1',
  `excParentID` int(11) DEFAULT '0',
  PRIMARY KEY (`excID`),
  KEY `excCategory` (`excCategory`),
  KEY `excLevel` (`excLevel`),
  KEY `excStatus` (`excStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Similar structure for tbl_subjx2_exercise through tbl_subjx12_exercise
-- (Omitted for brevity, but same structure as above)

-- --------------------------------------------------------
-- Answer Tables
-- --------------------------------------------------------

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

-- Table: tbl_answer_english
DROP TABLE IF EXISTS `tbl_answer_english`;
CREATE TABLE IF NOT EXISTS `tbl_answer_english` (
  `ansID` int(11) NOT NULL AUTO_INCREMENT,
  `ansExcID` int(11) NOT NULL,
  `ansIndex` int(11) NOT NULL DEFAULT '0',
  `ansValue` text COLLATE utf8_unicode_ci NOT NULL,
  `ansImage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ansSound` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ansAnswer` tinyint(1) NOT NULL DEFAULT '0',
  `fackans` text COLLATE utf8_unicode_ci,
  `ansInputBy` int(11) DEFAULT NULL,
  `ansInputDate` datetime DEFAULT NULL,
  `ansStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ansID`),
  KEY `ansExcID` (`ansExcID`),
  KEY `ansAnswer` (`ansAnswer`),
  KEY `ansStatus` (`ansStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_answer_khmer
DROP TABLE IF EXISTS `tbl_answer_khmer`;
CREATE TABLE IF NOT EXISTS `tbl_answer_khmer` (
  `ansID` int(11) NOT NULL AUTO_INCREMENT,
  `ansExcID` int(11) NOT NULL,
  `ansIndex` int(11) NOT NULL DEFAULT '0',
  `ansValue` text COLLATE utf8_unicode_ci NOT NULL,
  `ansImage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ansSound` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ansAnswer` tinyint(1) NOT NULL DEFAULT '0',
  `fackans` text COLLATE utf8_unicode_ci,
  `ansInputBy` int(11) DEFAULT NULL,
  `ansInputDate` datetime DEFAULT NULL,
  `ansStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ansID`),
  KEY `ansExcID` (`ansExcID`),
  KEY `ansAnswer` (`ansAnswer`),
  KEY `ansStatus` (`ansStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_answer_math
DROP TABLE IF EXISTS `tbl_answer_math`;
CREATE TABLE IF NOT EXISTS `tbl_answer_math` (
  `ansID` int(11) NOT NULL AUTO_INCREMENT,
  `ansExcID` int(11) NOT NULL,
  `ansIndex` int(11) NOT NULL DEFAULT '0',
  `ansValue` text COLLATE utf8_unicode_ci NOT NULL,
  `ansImage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ansSound` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ansAnswer` tinyint(1) NOT NULL DEFAULT '0',
  `fackans` text COLLATE utf8_unicode_ci,
  `ansInputBy` int(11) DEFAULT NULL,
  `ansInputDate` datetime DEFAULT NULL,
  `ansStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ansID`),
  KEY `ansExcID` (`ansExcID`),
  KEY `ansAnswer` (`ansAnswer`),
  KEY `ansStatus` (`ansStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_answer_science
DROP TABLE IF EXISTS `tbl_answer_science`;
CREATE TABLE IF NOT EXISTS `tbl_answer_science` (
  `ansID` int(11) NOT NULL AUTO_INCREMENT,
  `ansExcID` int(11) NOT NULL,
  `ansIndex` int(11) NOT NULL DEFAULT '0',
  `ansValue` text COLLATE utf8_unicode_ci NOT NULL,
  `ansImage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ansSound` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ansAnswer` tinyint(1) NOT NULL DEFAULT '0',
  `fackans` text COLLATE utf8_unicode_ci,
  `ansInputBy` int(11) DEFAULT NULL,
  `ansInputDate` datetime DEFAULT NULL,
  `ansStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ansID`),
  KEY `ansExcID` (`ansExcID`),
  KEY `ansAnswer` (`ansAnswer`),
  KEY `ansStatus` (`ansStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Additional answer tables for subjx1 through subjx12
-- (Similar structure, omitted for brevity)

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

-- Table: tbl_test_exercise
DROP TABLE IF EXISTS `tbl_test_exercise`;
CREATE TABLE IF NOT EXISTS `tbl_test_exercise` (
  `texID` int(11) NOT NULL AUTO_INCREMENT,
  `texCategory` int(11) NOT NULL,
  `texQuestion` text COLLATE utf8_unicode_ci NOT NULL,
  `texImage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `texSound` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `texType` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `texDifficulty` int(11) DEFAULT '1',
  `texPoints` int(11) DEFAULT '1',
  `texOrder` int(11) DEFAULT '0',
  `texStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`texID`),
  KEY `texCategory` (`texCategory`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_test_answer
DROP TABLE IF EXISTS `tbl_test_answer`;
CREATE TABLE IF NOT EXISTS `tbl_test_answer` (
  `tanID` int(11) NOT NULL AUTO_INCREMENT,
  `tanTexID` int(11) NOT NULL,
  `tanAnswer` text COLLATE utf8_unicode_ci NOT NULL,
  `tanImage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tanCorrect` tinyint(1) NOT NULL DEFAULT '0',
  `tanOrder` int(11) DEFAULT '0',
  PRIMARY KEY (`tanID`),
  KEY `tanTexID` (`tanTexID`)
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

-- Table: tbl_test_examinations
DROP TABLE IF EXISTS `tbl_test_examinations`;
CREATE TABLE IF NOT EXISTS `tbl_test_examinations` (
  `exaID` int(11) NOT NULL AUTO_INCREMENT,
  `exaTitle` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `exaTitleKH` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `exaCategory` int(11) NOT NULL,
  `exaDescription` text COLLATE utf8_unicode_ci,
  `exaDuration` int(11) DEFAULT '60' COMMENT 'Duration in minutes',
  `exaTotalQuestions` int(11) DEFAULT '20',
  `exaPassScore` int(11) DEFAULT '50' COMMENT 'Pass percentage',
  `exaStartDate` datetime DEFAULT NULL,
  `exaEndDate` datetime DEFAULT NULL,
  `exaStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`exaID`),
  KEY `exaCategory` (`exaCategory`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_test_examinations_category
DROP TABLE IF EXISTS `tbl_test_examinations_category`;
CREATE TABLE IF NOT EXISTS `tbl_test_examinations_category` (
  `tecID` int(11) NOT NULL AUTO_INCREMENT,
  `tecName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `tecNameKH` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tecDescription` text COLLATE utf8_unicode_ci,
  `tecOrder` int(11) DEFAULT '0',
  `tecStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`tecID`)
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

-- Table: tbl_test_examinations_result_guest
DROP TABLE IF EXISTS `tbl_test_examinations_result_guest`;
CREATE TABLE IF NOT EXISTS `tbl_test_examinations_result_guest` (
  `exrID` int(11) NOT NULL AUTO_INCREMENT,
  `exrSessionID` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `exrCategory` int(11) NOT NULL,
  `exrGrade` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `exrTotalQuestions` int(11) NOT NULL,
  `exrCorrectAnswers` int(11) NOT NULL,
  `exrScore` decimal(5,2) NOT NULL,
  `exrTimeTaken` int(11) DEFAULT NULL,
  `exrStartTime` datetime NOT NULL,
  `exrEndTime` datetime DEFAULT NULL,
  `exrIPAddress` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`exrID`),
  KEY `exrSessionID` (`exrSessionID`),
  KEY `exrCategory` (`exrCategory`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_user_test_randomization
DROP TABLE IF EXISTS `tbl_user_test_randomization`;
CREATE TABLE IF NOT EXISTS `tbl_user_test_randomization` (
  `utrID` int(11) NOT NULL AUTO_INCREMENT,
  `usrID` int(11) NOT NULL,
  `excParentID` int(11) NOT NULL,
  `randomize` text COLLATE utf8_unicode_ci COMMENT 'JSON randomization settings',
  `createdDate` datetime NOT NULL,
  PRIMARY KEY (`utrID`),
  KEY `usrID` (`usrID`),
  KEY `excParentID` (`excParentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_admin_test_randomization
DROP TABLE IF EXISTS `tbl_admin_test_randomization`;
CREATE TABLE IF NOT EXISTS `tbl_admin_test_randomization` (
  `atrID` int(11) NOT NULL AUTO_INCREMENT,
  `atrAdminID` int(11) NOT NULL,
  `atrSettings` text COLLATE utf8_unicode_ci COMMENT 'JSON randomization settings',
  `atrCreatedDate` datetime NOT NULL,
  PRIMARY KEY (`atrID`),
  KEY `atrAdminID` (`atrAdminID`)
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

-- Table: __user_track (User activity tracking - currently commented out in code)
DROP TABLE IF EXISTS `__user_track`;
CREATE TABLE IF NOT EXISTS `__user_track` (
  `utkID` int(11) NOT NULL AUTO_INCREMENT,
  `utkUserID` int(11) DEFAULT NULL,
  `utkChildID` int(11) DEFAULT NULL,
  `utkAction` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `utkDetails` text COLLATE utf8_unicode_ci,
  `utkIPAddress` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `utkUserAgent` text COLLATE utf8_unicode_ci,
  `utkDateTime` datetime NOT NULL,
  PRIMARY KEY (`utkID`),
  KEY `utkUserID` (`utkUserID`),
  KEY `utkChildID` (`utkChildID`),
  KEY `utkAction` (`utkAction`),
  KEY `utkDateTime` (`utkDateTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------
-- Forum Tables
-- --------------------------------------------------------

-- Table: tbl_forum_categorories (Note: typo in original - 'categorories')
DROP TABLE IF EXISTS `tbl_forum_categorories`;
CREATE TABLE IF NOT EXISTS `tbl_forum_categorories` (
  `frcAutoID` int(11) NOT NULL AUTO_INCREMENT,
  `frcTitle` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `frcTitleKH` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `frcDescription` text COLLATE utf8_unicode_ci,
  `frcIcon` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `frcOrder` int(11) DEFAULT '0',
  `frcStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`frcAutoID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_forum_post
DROP TABLE IF EXISTS `tbl_forum_post`;
CREATE TABLE IF NOT EXISTS `tbl_forum_post` (
  `frpAutoID` int(11) NOT NULL AUTO_INCREMENT,
  `frpCategories` int(11) NOT NULL,
  `frpQuestion` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  `frpDetail` text COLLATE utf8_unicode_ci,
  `frpImage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `frpPostBy` int(11) NOT NULL COMMENT 'User or Child ID',
  `frpParent` int(11) DEFAULT NULL COMMENT 'Parent ID if posted by child',
  `frpDateTime` datetime NOT NULL,
  `frpViews` int(11) DEFAULT '0',
  `frpStatus` tinyint(1) NOT NULL DEFAULT '2' COMMENT '1=private, 2=public',
  `frpPinned` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`frpAutoID`),
  KEY `frpCategories` (`frpCategories`),
  KEY `frpPostBy` (`frpPostBy`),
  KEY `frpParent` (`frpParent`),
  KEY `frpStatus` (`frpStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_forum_post_answer
DROP TABLE IF EXISTS `tbl_forum_post_answer`;
CREATE TABLE IF NOT EXISTS `tbl_forum_post_answer` (
  `fpaAutoID` int(11) NOT NULL AUTO_INCREMENT,
  `fpaPostId` int(11) NOT NULL,
  `fpaAnswer` text COLLATE utf8_unicode_ci NOT NULL,
  `fpaPostBy` int(11) NOT NULL COMMENT 'User or Child ID',
  `fpaParent` int(11) DEFAULT NULL COMMENT 'Parent ID if posted by child',
  `fpaDateTime` datetime NOT NULL,
  `fpaStatus` tinyint(1) NOT NULL DEFAULT '1',
  `fpaBestAnswer` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`fpaAutoID`),
  KEY `fpaPostId` (`fpaPostId`),
  KEY `fpaPostBy` (`fpaPostBy`),
  KEY `fpaParent` (`fpaParent`),
  KEY `fpaStatus` (`fpaStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_forum_post_answer_rating
DROP TABLE IF EXISTS `tbl_forum_post_answer_rating`;
CREATE TABLE IF NOT EXISTS `tbl_forum_post_answer_rating` (
  `fpaAutoID` int(11) NOT NULL AUTO_INCREMENT,
  `fpaAnswerId` int(11) NOT NULL,
  `fpaUserID` int(11) NOT NULL,
  `fpaRating` tinyint(1) NOT NULL COMMENT '0=downvote, 1=upvote',
  `fpaDateTime` datetime NOT NULL,
  PRIMARY KEY (`fpaAutoID`),
  UNIQUE KEY `unique_rating` (`fpaAnswerId`,`fpaUserID`),
  KEY `fpaAnswerId` (`fpaAnswerId`),
  KEY `fpaUserID` (`fpaUserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_forum_post_saved
DROP TABLE IF EXISTS `tbl_forum_post_saved`;
CREATE TABLE IF NOT EXISTS `tbl_forum_post_saved` (
  `fpsID` int(11) NOT NULL AUTO_INCREMENT,
  `fpsPostId` int(11) NOT NULL,
  `fpsUserID` int(11) NOT NULL,
  `fpsSavedDate` datetime NOT NULL,
  PRIMARY KEY (`fpsID`),
  UNIQUE KEY `unique_saved` (`fpsPostId`,`fpsUserID`),
  KEY `fpsPostId` (`fpsPostId`),
  KEY `fpsUserID` (`fpsUserID`)
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

-- Table: tbl_school_branches
DROP TABLE IF EXISTS `tbl_school_branches`;
CREATE TABLE IF NOT EXISTS `tbl_school_branches` (
  `scbID` int(11) NOT NULL AUTO_INCREMENT,
  `scbSchoolID` int(11) NOT NULL,
  `scbName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `scbCode` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `scbPhone` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `scbEmail` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `scbPassword` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `scbRole` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `scbCreatedDate` datetime NOT NULL,
  `scbStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`scbID`),
  KEY `scbSchoolID` (`scbSchoolID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_teacher_information
DROP TABLE IF EXISTS `tbl_teacher_information`;
CREATE TABLE IF NOT EXISTS `tbl_teacher_information` (
  `teaID` int(11) NOT NULL AUTO_INCREMENT,
  `teaUserID` int(11) DEFAULT NULL,
  `teaSchoolID` int(11) DEFAULT NULL,
  `teaBranchID` int(11) DEFAULT NULL,
  `teaFullName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `teaPhone` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `teaEmail` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `teaSubjects` text COLLATE utf8_unicode_ci COMMENT 'JSON array of subjects',
  `teaGrades` text COLLATE utf8_unicode_ci COMMENT 'JSON array of grades',
  `teaJoinDate` date DEFAULT NULL,
  `teaStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`teaID`),
  KEY `teaUserID` (`teaUserID`),
  KEY `teaSchoolID` (`teaSchoolID`),
  KEY `teaBranchID` (`teaBranchID`)
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
-- Content Tables
-- --------------------------------------------------------

-- Table: tbl_videos
DROP TABLE IF EXISTS `tbl_videos`;
CREATE TABLE IF NOT EXISTS `tbl_videos` (
  `vidID` int(11) NOT NULL AUTO_INCREMENT,
  `vidTitle` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `vidTitleKH` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `vidDescription` text COLLATE utf8_unicode_ci,
  `vidURL` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `vidYoutubeID` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `vidThumbnail` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `vidCategory` int(11) DEFAULT NULL,
  `vidDuration` int(11) DEFAULT NULL COMMENT 'Duration in seconds',
  `vidViews` int(11) DEFAULT '0',
  `vidOrder` int(11) DEFAULT '0',
  `vidUploadedBy` int(11) DEFAULT NULL,
  `vidUploadedDate` datetime NOT NULL,
  `vidStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`vidID`),
  KEY `vidCategory` (`vidCategory`),
  KEY `vidStatus` (`vidStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_video_lesson
DROP TABLE IF EXISTS `tbl_video_lesson`;
CREATE TABLE IF NOT EXISTS `tbl_video_lesson` (
  `vleID` int(11) NOT NULL AUTO_INCREMENT,
  `vleTitle` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `vleVideoID` int(11) NOT NULL,
  `vleCategory` int(11) NOT NULL,
  `vleGrade` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `vleSubject` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `vleOrder` int(11) DEFAULT '0',
  `vleStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`vleID`),
  KEY `vleVideoID` (`vleVideoID`),
  KEY `vleCategory` (`vleCategory`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_playlists
DROP TABLE IF EXISTS `tbl_playlists`;
CREATE TABLE IF NOT EXISTS `tbl_playlists` (
  `plID` int(11) NOT NULL AUTO_INCREMENT,
  `plTitle` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `plTitleKH` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `plDescription` text COLLATE utf8_unicode_ci,
  `plVideos` text COLLATE utf8_unicode_ci COMMENT 'JSON array of video IDs',
  `plCategory` int(11) DEFAULT NULL,
  `plCreatedBy` int(11) DEFAULT NULL,
  `plCreatedDate` datetime NOT NULL,
  `plStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`plID`),
  KEY `plCategory` (`plCategory`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_book
DROP TABLE IF EXISTS `tbl_book`;
CREATE TABLE IF NOT EXISTS `tbl_book` (
  `bokID` int(11) NOT NULL AUTO_INCREMENT,
  `bokTitle` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `bokTitleKH` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `bokAuthor` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `bokDescription` text COLLATE utf8_unicode_ci,
  `bokCoverImage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `bokPDFFile` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `bokCategory` int(11) DEFAULT NULL,
  `bokGrade` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `bokSubject` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `bokPages` int(11) DEFAULT NULL,
  `bokViews` int(11) DEFAULT '0',
  `bokUploadedBy` int(11) DEFAULT NULL,
  `bokUploadedDate` datetime NOT NULL,
  `bokStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`bokID`),
  KEY `bokCategory` (`bokCategory`),
  KEY `bokSubject` (`bokSubject`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Table: tbl_ebook
DROP TABLE IF EXISTS `tbl_ebook`;
CREATE TABLE IF NOT EXISTS `tbl_ebook` (
  `ebkID` int(11) NOT NULL AUTO_INCREMENT,
  `ebkBookID` int(11) NOT NULL,
  `ebkFormat` varchar(20) COLLATE utf8_unicode_ci DEFAULT 'PDF',
  `ebkFileSize` int(11) DEFAULT NULL,
  `ebkDownloadCount` int(11) DEFAULT '0',
  `ebkStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ebkID`),
  KEY `ebkBookID` (`ebkBookID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
-- Permission Management Tables
-- --------------------------------------------------------

-- Table: tbl_permission_admin
DROP TABLE IF EXISTS `tbl_permission_admin`;
CREATE TABLE IF NOT EXISTS `tbl_permission_admin` (
  `perID` int(11) NOT NULL AUTO_INCREMENT,
  `perUserID` int(11) NOT NULL,
  `perMenuID` int(11) NOT NULL,
  `perView` tinyint(1) DEFAULT '0',
  `perInsert` tinyint(1) DEFAULT '0',
  `perUpdate` tinyint(1) DEFAULT '0',
  `perDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`perID`),
  UNIQUE KEY `unique_permission` (`perUserID`,`perMenuID`),
  KEY `perUserID` (`perUserID`),
  KEY `perMenuID` (`perMenuID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------
-- File Management Tables (elFinder)
-- --------------------------------------------------------

-- Table: elfinder_file
DROP TABLE IF EXISTS `elfinder_file`;
CREATE TABLE IF NOT EXISTS `elfinder_file` (
  `id` int(7) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(7) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `content` longblob NOT NULL,
  `size` int(10) unsigned NOT NULL DEFAULT '0',
  `mtime` int(10) unsigned NOT NULL DEFAULT '0',
  `mime` varchar(256) NOT NULL DEFAULT 'unknown',
  `read` enum('1', '0') NOT NULL DEFAULT '1',
  `write` enum('1', '0') NOT NULL DEFAULT '1',
  `locked` enum('1', '0') NOT NULL DEFAULT '0',
  `hidden` enum('1', '0') NOT NULL DEFAULT '0',
  `width` int(5) NOT NULL DEFAULT '0',
  `height` int(5) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `parent_name` (`parent_id`, `name`),
  KEY `parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Table: elfinder_trash
DROP TABLE IF EXISTS `elfinder_trash`;
CREATE TABLE IF NOT EXISTS `elfinder_trash` (
  `id` int(7) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(7) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `content` longblob NOT NULL,
  `size` int(10) unsigned NOT NULL DEFAULT '0',
  `mtime` int(10) unsigned NOT NULL DEFAULT '0',
  `mime` varchar(256) NOT NULL DEFAULT 'unknown',
  `read` enum('1', '0') NOT NULL DEFAULT '1',
  `write` enum('1', '0') NOT NULL DEFAULT '1',
  `locked` enum('1', '0') NOT NULL DEFAULT '0',
  `hidden` enum('1', '0') NOT NULL DEFAULT '0',
  `width` int(5) NOT NULL DEFAULT '0',
  `height` int(5) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `parent_name` (`parent_id`, `name`),
  KEY `parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------
-- Initial Data
-- --------------------------------------------------------

-- Insert root directories for elFinder
INSERT INTO `elfinder_file` (`id`, `parent_id`, `name`, `content`, `size`, `mtime`, `mime`, `read`, `write`, `locked`, `hidden`, `width`, `height`) 
VALUES (1, 0, 'DATABASE', '', 0, 0, 'directory', '1', '1', '0', '0', 0, 0);

INSERT INTO `elfinder_trash` (`id`, `parent_id`, `name`, `content`, `size`, `mtime`, `mime`, `read`, `write`, `locked`, `hidden`, `width`, `height`) 
VALUES (1, 0, 'DB Trash', '', 0, 0, 'directory', '1', '1', '0', '0', 0, 0);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;