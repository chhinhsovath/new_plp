# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a PHP-based educational platform (PLP - Primary Learning Platform) used by the Ministry of Education, Youth and Sport (MoEYS) in Cambodia. The system provides interactive learning materials for primary education subjects.

## Architecture

### Core Structure
- **Entry Point**: `index.php` - Main application entry
- **Configuration**: `_config_inc.php` - Database and system configuration
- **MVC Pattern**: Custom implementation without a formal framework
  - Controllers: `/controller/` directory
  - Views: `/views/` directory  
  - Models: Mixed within controllers and library files

### Key Modules
1. **Main Application** (`/`)
   - Student-facing interface
   - Interactive exercises and lessons
   - Subject-specific AJAX handlers in `/ajax/`

2. **Admin Panel** (`/ct-admin/`)
   - Content management
   - User management
   - Separate authentication system

3. **LMS Module** (`/lms/`)
   - Learning Management System features
   - Testing and assessment functionality
   - Progress tracking

### Database
- MySQL database with connection details in `_config_inc.php`
- Custom database abstraction in `/_libs/classes/`
- No ORM - direct SQL queries

## Development Commands

Since this is a traditional PHP application without a build system:

### Running the Application
```bash
# Requires PHP and MySQL server
# Configure database connection in _config_inc.php
# Serve with any PHP-capable web server pointing to root directory
```

### Database Operations
- Database schema and migrations not found in codebase
- Manual database setup required
- Connection settings in `_config_inc.php`

## Key Technical Patterns

### AJAX Request Handling
- Subject-specific AJAX endpoints in `/ajax/` directory
- JSON responses for interactive exercises
- Session-based authentication checks

### File Structure for Subjects
Each subject (Khmer, Math, Science, English) follows this pattern:
- `/ajax/[subject]/` - AJAX handlers
- `/views/[subject]/` - View templates
- `/controller/[subject]/` - Subject controllers

### Authentication
- Session-based authentication
- Login handling in `/controller/login.php`
- Admin authentication separate in `/ct-admin/`

### Interactive Exercise Types
The platform supports various exercise formats:
- Drag and drop
- Fill in gaps
- Multiple choice
- Matching
- Audio/video based exercises

## Important Considerations

### Security
- Database credentials are hardcoded in `_config_inc.php`
- SQL queries should be checked for injection vulnerabilities
- Session management uses PHP sessions

### Language Support
- Primary language is Khmer
- UTF-8 encoding required
- Language files in various locations

### Third-party Libraries
Located in `/_libs/` and plugin directories:
- CKEditor for rich text editing
- TinyMCE editor
- PHPSpreadsheet for Excel operations
- jQuery and jQuery UI for frontend interactivity