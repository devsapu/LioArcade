# LioArcade - Project Documentation Index

**Project:** Gamified Learning Platform  
**Last Updated:** 2026-01-07  
**Prepared by:** Sapu

## Overview

This document serves as an index to all project documentation, diagrams, and specifications for the LioArcade gamified learning platform.

## Documentation Structure

### 1. Requirements & Specifications

#### Software Requirements Specification (SRS)
- **Location:** `docs/SRS-Gamified-Learning-Platform.md`
- **Description:** Complete SRS document with functional requirements, non-functional requirements, and user stories
- **Contents:**
  - Project introduction and scope
  - Overall product description
  - Functional requirements (FR1-FR6)
  - Non-functional requirements
  - User stories for Learners, Admins, and Developers

### 2. Architecture Documentation

#### Architecture Decision Document
- **Location:** `_bmad-output/planning-artifacts/architecture.md`
- **Description:** Comprehensive architecture decisions and system design
- **Contents:**
  - System overview and architecture pattern
  - Technology stack (Frontend, Backend, Infrastructure)
  - High-level system architecture
  - Core services breakdown
  - Database schema design
  - API design and endpoints
  - Security architecture
  - Scalability considerations
  - Deployment architecture
  - Monitoring & logging
  - Content management architecture
  - Gamification system design
  - Mobile app architecture
  - Future enhancements
  - Implementation phases
  - Risk mitigation

### 3. Diagrams

#### Data Flow Diagram (DFD)
- **Location:** `_bmad-output/excalidraw-diagrams/dataflow-system.excalidraw`
- **Type:** Level 1 Data Flow Diagram
- **Description:** Shows data flows between external entities (Learner, Admin), processes (Authenticate, Manage Content, Track Gamification), and data stores (Users, Content, Progress)
- **How to View:** Open in [Excalidraw](https://excalidraw.com) or any Excalidraw-compatible viewer

#### User Flow Diagram
- **Location:** `_bmad-output/excalidraw-diagrams/user-flow-learner-journey.excalidraw`
- **Type:** User Journey Flowchart
- **Description:** Complete learner journey from platform visit through registration/login, content selection (Quiz/Flashcard), gamification, and progress tracking
- **How to View:** Open in [Excalidraw](https://excalidraw.com) or any Excalidraw-compatible viewer

### 4. BMAD Method Configuration

#### BMAD Configuration
- **Location:** `_bmad/bmm/config.yaml`
- **Description:** BMAD-METHOD framework configuration
- **Contents:**
  - Project name: LioArcade
  - User information
  - Output folder paths
  - Planning and implementation artifacts locations

## Key Decisions Summary

### Technology Stack
- **Web Frontend:** Next.js 14+ (React)
- **Mobile Frontend:** React Native
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **Hosting:** Vercel (Web) + AWS (Backend)

### Architecture Pattern
- Three-tier architecture (Presentation, Application, Data)
- RESTful API design
- JWT-based authentication
- Role-based access control (RBAC)

### Core Features (MVP)
1. User registration and authentication
2. Content browsing (Quizzes, Flashcards, Mini-games)
3. Gamification system (Points, Badges, Progress)
4. Admin content management
5. Notifications (In-app and email)

## Implementation Phases

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

## File Organization

```
LioArcade/
├── docs/                                    # Long-term project knowledge
│   ├── SRS-Gamified-Learning-Platform.md   # Software Requirements Specification
│   └── PROJECT-DOCUMENTATION-INDEX.md      # This file
├── _bmad-output/                            # BMAD workflow outputs
│   ├── planning-artifacts/                 # Planning phase documents
│   │   └── architecture.md                 # Architecture Decision Document
│   ├── implementation-artifacts/            # Implementation phase documents
│   └── excalidraw-diagrams/                # Visual diagrams
│       ├── dataflow-system.excalidraw      # Data Flow Diagram
│       └── user-flow-learner-journey.excalidraw  # User Flow Diagram
└── _bmad/                                   # BMAD framework files
    └── bmm/
        └── config.yaml                      # BMAD configuration
```

## How to Use This Documentation

1. **Starting Development:** Begin with the SRS to understand requirements
2. **Architecture Planning:** Refer to `architecture.md` for system design decisions
3. **Understanding Flows:** View Excalidraw diagrams to understand data and user flows
4. **Implementation:** Follow the implementation phases outlined in architecture.md

## Viewing Excalidraw Diagrams

1. **Online:** Upload `.excalidraw` files to [excalidraw.com](https://excalidraw.com)
2. **VS Code:** Install the "Excalidraw" extension
3. **Desktop:** Use Excalidraw desktop app

## Next Steps

1. ✅ SRS Document created
2. ✅ Architecture Document created
3. ✅ Data Flow Diagram created
4. ✅ User Flow Diagram created
5. ⏭️ Create detailed API specifications
6. ⏭️ Design database schema with migrations
7. ⏭️ Create wireframes for key screens
8. ⏭️ Set up development environment
9. ⏭️ Begin MVP implementation

## Contact & Support

For questions about this documentation or the project:
- **Project Lead:** Sapumal Thepulangoda
- **Date Created:** 2026-01-07

---

**Note:** This documentation follows BMAD-METHOD (Build More, Architect Dreams) framework for structured development planning.

