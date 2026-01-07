# LioArcade Backend API

Backend API server for the LioArcade gamified learning platform.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials and JWT secrets.

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/reset-password` - Password reset

### Content
- `GET /api/content` - List all content (paginated)
- `GET /api/content/:id` - Get specific content
- `GET /api/content/categories` - Get categories
- `POST /api/content` - Create content (Admin only)
- `PUT /api/content/:id` - Update content (Admin only)
- `DELETE /api/content/:id` - Delete content (Admin only)

### Gamification
- `GET /api/gamification/progress` - Get user progress
- `GET /api/gamification/leaderboard` - Get leaderboard
- `POST /api/gamification/submit-score` - Submit quiz/game score

### Admin
- `GET /api/admin/analytics` - Get engagement analytics
- `GET /api/admin/users` - List users
- `GET /api/admin/reports` - Generate reports

## Project Structure

```
backend/
├── src/
│   ├── server.js          # Express app entry point
│   ├── config/            # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Prisma models (schema.prisma)
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
├── prisma/
│   └── schema.prisma       # Database schema
└── package.json
```

