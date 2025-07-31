# Notes App

A beautiful, secure, and responsive notes application built with vanilla PHP backend and animated HTML/CSS/JS frontend using GSAP.

## Features

### Backend (PHP)
- 🔐 Secure user authentication (register, login, logout)
- 🛡️ Session-based authentication
- 🔒 Password hashing with PHP's `password_hash()`
- 🛡️ SQL injection protection with prepared statements
- 📝 Full CRUD operations for notes
- 🗄️ MySQL/SQLite database support with automatic fallback
- 📡 Clean JSON API responses
- ✨ Input validation and sanitization

### Frontend (HTML/CSS/JS + GSAP)
- 🎨 Beautiful, modern UI design
- 📱 Fully responsive (desktop & mobile)
- ✨ Smooth GSAP animations throughout
- 🚀 Single-page application experience
- 🔄 Real-time updates without page reloads
- 💫 Loading animations and transitions
- 🎯 Toast notifications for user feedback
- 🎭 Modal dialogs for note editing

## Installation & Setup

### Prerequisites
- PHP 7.4+ with PDO extension
- Web server (Apache/Nginx) or PHP built-in server
- MySQL (optional - SQLite fallback included)

### Quick Start

1. **Clone or download the files** to your web server directory

2. **Configure database** (optional):
   - Edit `db.php` to set your MySQL credentials
   - If MySQL fails, SQLite will be used automatically

3. **Set permissions** (for SQLite):
   ```bash
   chmod 666 notes_app.db  # If using SQLite
   chmod 666 .             # Directory permissions

