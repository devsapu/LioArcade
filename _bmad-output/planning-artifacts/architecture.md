---
stepsCompleted: [1]
inputDocuments: ['docs/SRS-Gamified-Learning-Platform.md']
workflowType: 'architecture'
project_name: 'LioArcade'
user_name: 'Sapu'
date: '2026-01-07'
---

# Architecture Decision Document

**Project:** LioArcade - Gamified Learning Platform  
**Prepared by:** Sapu  
**Date:** 2026-01-07

_This document defines the architectural decisions for the gamified learning platform, ensuring consistent implementation across web and mobile platforms._

## 1. System Overview

### 1.1 Architecture Pattern
**Decision:** Three-tier architecture with separate presentation, application, and data layers.

**Rationale:**
- Clear separation of concerns
- Enables independent scaling of web and mobile clients
- Supports future B2B API integrations
- Modular design aligns with MVP constraints

**Components:**
- **Presentation Layer:** Next.js (Web) + React Native (Mobile)
- **Application Layer:** Node.js REST API
- **Data Layer:** PostgreSQL database

### 1.2 Technology Stack

#### Frontend (Web)
- **Framework:** Next.js 14+ (React)
- **State Management:** React Context API / Zustand
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js / JWT

#### Frontend (Mobile)
- **Framework:** React Native
- **State Management:** Redux Toolkit / Zustand
- **Navigation:** React Navigation
- **Authentication:** Secure token storage

#### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js / Fastify
- **Database:** PostgreSQL 14+
- **ORM:** Prisma / TypeORM
- **Authentication:** JWT + bcrypt
- **File Storage:** AWS S3 / Cloudinary (for content assets)

#### Infrastructure
- **Hosting:** Vercel (Web) / AWS (Backend)
- **CDN:** CloudFront / Vercel Edge
- **Notifications:** Firebase Cloud Messaging / AWS SNS
- **Monitoring:** Sentry / DataDog

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Web Client    │     │  Mobile Client  │
│   (Next.js)     │     │ (React Native)  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │ HTTPS/REST API
         ┌───────────▼───────────┐
         │   API Gateway         │
         │   (Node.js/Express)    │
         └───────────┬───────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼────┐    ┌──────▼──────┐   ┌─────▼─────┐
│ Auth   │    │ Content     │   │ Gamification│
│ Service│    │ Service     │   │ Service    │
└───┬────┘    └──────┬──────┘   └─────┬─────┘
    │                │                │
    └────────────────┼────────────────┘
                      │
            ┌─────────▼─────────┐
            │   PostgreSQL      │
            │   Database        │
            └───────────────────┘
```

### 2.2 Core Services

#### Authentication Service
- User registration/login
- JWT token generation/validation
- Password reset flow
- Session management

#### Content Service
- Content CRUD operations
- Content categorization
- Search and filtering
- Content versioning

#### Gamification Service
- Points calculation
- Badge assignment
- Progress tracking
- Leaderboards

#### Notification Service
- In-app notifications
- Email notifications (optional)
- Push notifications (mobile)

## 3. Database Schema Design

### 3.1 Core Tables

#### Users
```sql
- id (UUID, PK)
- email (String, Unique)
- password_hash (String)
- role (Enum: learner, admin, content_manager)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### Content
```sql
- id (UUID, PK)
- type (Enum: quiz, flashcard, mini_game)
- title (String)
- description (Text)
- content_data (JSONB)
- category (String)
- difficulty_level (Enum)
- created_by (UUID, FK -> Users)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### User_Progress
```sql
- id (UUID, PK)
- user_id (UUID, FK -> Users)
- content_id (UUID, FK -> Content)
- score (Integer)
- completed_at (Timestamp)
- attempts (Integer)
```

#### Gamification
```sql
- id (UUID, PK)
- user_id (UUID, FK -> Users)
- points (Integer)
- badges (JSONB Array)
- level (Integer)
- updated_at (Timestamp)
```

## 4. API Design

### 4.1 RESTful Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/reset-password` - Password reset

#### Content
- `GET /api/content` - List all content (paginated)
- `GET /api/content/:id` - Get specific content
- `GET /api/content/categories` - Get categories
- `POST /api/content` - Create content (Admin only)
- `PUT /api/content/:id` - Update content (Admin only)
- `DELETE /api/content/:id` - Delete content (Admin only)

#### Gamification
- `GET /api/gamification/progress` - Get user progress
- `GET /api/gamification/leaderboard` - Get leaderboard
- `POST /api/gamification/submit-score` - Submit quiz/game score

#### Admin
- `GET /api/admin/analytics` - Get engagement analytics
- `GET /api/admin/users` - List users
- `GET /api/admin/reports` - Generate reports

## 5. Security Architecture

### 5.1 Authentication & Authorization
- **JWT Tokens:** Short-lived access tokens (15min) + refresh tokens (7 days)
- **Password Hashing:** bcrypt with salt rounds (10+)
- **Role-Based Access Control (RBAC):** Learner, Admin, Content Manager roles
- **HTTPS Only:** All API communications encrypted

### 5.2 Data Protection
- **Input Validation:** All inputs validated and sanitized
- **SQL Injection Prevention:** Parameterized queries via ORM
- **XSS Prevention:** Content sanitization on frontend
- **CORS Configuration:** Restricted to allowed origins

## 6. Scalability Considerations

### 6.1 MVP Phase (500 concurrent users)
- Single server deployment
- Database connection pooling
- Basic caching (Redis for sessions)

### 6.2 Future Scaling
- **Horizontal Scaling:** Load balancer + multiple API instances
- **Database Scaling:** Read replicas + connection pooling
- **CDN Integration:** Static assets and API responses
- **Microservices Migration:** Split services as needed

## 7. Deployment Architecture

### 7.1 MVP Deployment
```
Web (Next.js) → Vercel
Mobile App → App Store / Play Store
Backend API → AWS EC2 / Railway
Database → AWS RDS PostgreSQL / Railway PostgreSQL
```

### 7.2 CI/CD Pipeline
- **Source Control:** GitHub
- **CI:** GitHub Actions
- **Testing:** Jest + React Testing Library
- **Deployment:** Automated on merge to main

## 8. Monitoring & Logging

### 8.1 Application Monitoring
- Error tracking (Sentry)
- Performance monitoring
- User analytics (Google Analytics / Mixpanel)

### 8.2 Logging
- Structured logging (Winston / Pino)
- Log aggregation (CloudWatch / Datadog)
- Error alerting

## 9. Content Management Architecture

### 9.1 Content Types

#### Quizzes
- Multiple choice questions
- True/False questions
- Scoring mechanism
- Time limits (optional)

#### Flashcards
- Front/Back card structure
- Spaced repetition algorithm
- Progress tracking

#### Mini-Games
- Interactive game mechanics
- Score-based progression
- Achievement unlocks

### 9.2 Content Storage
- **Metadata:** PostgreSQL (structured data)
- **Assets:** Cloud storage (S3/Cloudinary) for images, videos
- **Content Structure:** JSONB for flexible content schemas

## 10. Gamification System

### 10.1 Points System
- Quiz completion: 10-50 points (based on score)
- Flashcard mastery: 5 points per card
- Mini-game completion: 20-100 points
- Daily login bonus: 5 points

### 10.2 Badge System
- **Achievement Badges:** First quiz, perfect score, streak master
- **Level Badges:** Bronze, Silver, Gold tiers
- **Category Badges:** Subject matter expertise

### 10.3 Progress Tracking
- Completion percentage per category
- Learning streaks
- Time spent learning
- Performance trends

## 11. Mobile App Architecture

### 11.1 Offline Capabilities
- Content caching for offline access
- Progress sync when online
- Queue-based API calls

### 11.2 Push Notifications
- Daily learning reminders
- New content notifications
- Achievement notifications

## 12. Future Enhancements

### 12.1 B2B Features
- White-label solutions
- API access for partners
- Custom branding options

### 12.2 Advanced Gamification
- Social features (friends, challenges)
- Virtual rewards marketplace
- AI-powered personalized learning paths

### 12.3 Marketplace Model
- Content creator marketplace
- Revenue sharing model
- Content rating/review system

## 13. Implementation Phases

### Phase 1: MVP Core (Weeks 1-4)
- User authentication
- Basic content browsing
- Simple quiz functionality
- Basic gamification (points only)

### Phase 2: Enhanced Features (Weeks 5-8)
- Flashcards
- Mini-games
- Badge system
- Progress tracking
- Admin dashboard

### Phase 3: Mobile App (Weeks 9-12)
- React Native app
- Mobile-optimized UI
- Push notifications
- Offline capabilities

### Phase 4: Polish & Scale (Weeks 13-16)
- Performance optimization
- Advanced analytics
- Enhanced gamification
- Beta testing

## 14. Risk Mitigation

### 14.1 Technical Risks
- **Database Performance:** Implement indexing and query optimization
- **Scalability:** Design for horizontal scaling from start
- **Security:** Regular security audits and penetration testing

### 14.2 Business Risks
- **Content Quality:** Admin review process for all content
- **User Engagement:** A/B testing for gamification mechanics
- **Performance:** Load testing before launch

## 15. Decision Log

| Date | Decision | Rationale | Impact |
|------|----------|-----------|--------|
| 2026-01-07 | Three-tier architecture | Separation of concerns, scalability | Foundation for all development |
| 2026-01-07 | PostgreSQL over MongoDB | Structured data, ACID compliance | Reliable data consistency |
| 2026-01-07 | JWT authentication | Stateless, scalable | Simplified session management |
| 2026-01-07 | JSONB for content | Flexible schema, queryable | Easy content type expansion |

---

**Next Steps:**
1. Create detailed API specifications
2. Design database schema with migrations
3. Set up development environment
4. Create wireframes for key user flows
5. Begin MVP implementation

