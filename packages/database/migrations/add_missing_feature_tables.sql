-- Additional Tables for Missing Features
-- These tables support features mentioned in the PRD but not yet in Prisma schema

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Subject-Specific Exercise Tables
-- --------------------------------------------------------

-- Table: tbl_english_exercise
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

-- Table: tbl_khmer_exercise
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

-- Table: tbl_math_exercise
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

-- Table: tbl_science_exercise
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

-- Additional subject exercise tables (for CALM and Social Studies)
-- Table: tbl_subjx1_exercise (Could be used for CALM)
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

-- Table: tbl_subjx2_exercise (Could be used for Social Studies)
DROP TABLE IF EXISTS `tbl_subjx2_exercise`;
CREATE TABLE IF NOT EXISTS `tbl_subjx2_exercise` (
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

-- --------------------------------------------------------
-- Subject-Specific Answer Tables
-- --------------------------------------------------------

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

-- Table: tbl_answer_subjx1 (For CALM)
DROP TABLE IF EXISTS `tbl_answer_subjx1`;
CREATE TABLE IF NOT EXISTS `tbl_answer_subjx1` (
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

-- Table: tbl_answer_subjx2 (For Social Studies)
DROP TABLE IF EXISTS `tbl_answer_subjx2`;
CREATE TABLE IF NOT EXISTS `tbl_answer_subjx2` (
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

-- --------------------------------------------------------
-- Extended Testing Tables
-- --------------------------------------------------------

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
-- School Management Extended Tables
-- --------------------------------------------------------

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

-- --------------------------------------------------------
-- Content Management Tables
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
-- User Tracking Table (if needed)
-- --------------------------------------------------------

-- Table: __user_track (User activity tracking)
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

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;