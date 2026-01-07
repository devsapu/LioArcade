# Internal Content & Gamified Learning Platform
## Software Requirements Specification (SRS) & User Stories
**Prepared by:** Sapumal Thepulangoda  
**Date:** 2026-01-07

## 1. Introduction

### 1.1 Purpose
The purpose of this project is to build a gamified learning platform that leverages bench engineers' time to create engaging academic content. The platform will include quizzes, flashcards, mini-games, and gamification features to improve engagement and retention.

### 1.2 Scope
- **MVP Phase:** Web + Mobile platform with core content and basic gamification.
- **Target Market:** Initially internal employees; eventually global learners.
- **Future Enhancements:** B2B partnerships, marketplace model, subscription services, advanced gamification.

### 1.3 Definitions, Acronyms, Abbreviations
- **MVP:** Minimum Viable Product
- **B2B:** Business to Business
- **Gamification:** Incorporation of game elements (points, badges) into learning

### 1.4 References
- **Technologies:** React / Next.js (Web), React Native (Mobile), Node.js + PostgreSQL (Backend)
- **Hosting:** Cloud-based (AWS / Vercel / CDN)

## 2. Overall Description

### 2.1 Product Perspective
- Web + Mobile platform with a unified backend
- Single user account across both platforms
- Modular architecture for content scalability

### 2.2 Product Functions
- User registration & login
- Content browsing: quizzes, flashcards, mini-games
- Gamification: points, badges, progress tracking
- Admin dashboard: upload/manage content
- Notifications: in-app and optional email notifications

### 2.3 User Classes and Characteristics
- **Learners:** Access content, track progress, earn badges
- **Admins / Content Managers:** Upload/manage content, view reports
- **Developers / Testers:** Test platform, monitor performance, debug issues

### 2.4 Operating Environment
- **Browsers:** Chrome, Edge, Firefox, Safari
- **Mobile:** Android 10+, iOS 14+
- **Backend:** Node.js server with PostgreSQL
- **Hosting:** Cloud-based with HTTPS

### 2.5 Design & Implementation Constraints
- MVP limited to core content (10–20 quizzes / mini-games)
- Must be scalable for future global expansion
- Modular code design for easy addition of new content

### 2.6 Assumptions & Dependencies
- Users have internet access
- Mobile devices support React Native apps
- Cloud hosting and notification services are available

## 3. Functional Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| FR1 | User Registration/Login | Users can create accounts, login, and reset passwords |
| FR2 | Content Browsing | Users can browse quizzes, flashcards, mini-games |
| FR3 | Gamification | Users earn points and badges based on activity |
| FR4 | Progress Tracking | Users can view their learning progress and scores |
| FR5 | Admin Content Management | Admins can upload, update, and delete content |
| FR6 | Notifications | Users receive reminders for new content and progress |

## 4. Non-Functional Requirements
- **Performance:** Support at least 500 concurrent users initially
- **Security:** HTTPS, secure authentication, encrypted passwords
- **Usability:** Simple and intuitive interface
- **Scalability:** Modular codebase to support global expansion
- **Maintainability:** Clear folder structure, code comments, and documentation

## 5. User Stories

### 5.1 Learner / End User

#### Registration & Login
- **As a learner**, I want to register and login so that I can track my progress.

#### Content Interaction
- **As a learner**, I want to browse quizzes and flashcards so I can study efficiently.
- **As a learner**, I want to play mini-games to make learning fun and engaging.

#### Gamification
- **As a learner**, I want to earn points and badges so that I feel motivated.
- **As a learner**, I want to view my progress report so I know which areas I need to improve.

#### Notifications
- **As a learner**, I want to receive reminders for learning so that I stay consistent.

### 5.2 Admin / Content Manager

#### Content Management
- **As an admin**, I want to upload, update, and delete content so that learners have fresh materials.

#### Monitor Engagement
- **As an admin**, I want to view learner progress reports so that I can analyze engagement.

### 5.3 Developer / Tester

#### Platform Testing
- **As a developer**, I want to simulate multiple users so that I can test scalability.
- **As a developer**, I want to view error logs and user activity so that I can debug efficiently.

