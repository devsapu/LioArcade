// User Types
export type UserRole = 'LEARNER' | 'ADMIN' | 'CONTENT_MANAGER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Content Types
export type ContentType = 'QUIZ' | 'FLASHCARD' | 'MINI_GAME';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  contentData: any; // JSON structure varies by type
  category?: string;
  difficultyLevel?: DifficultyLevel;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    email: string;
  };
}

export interface ContentListResponse {
  content: Content[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Gamification Types
export interface Badge {
  name: string;
  icon: string;
  earnedAt: string;
}

export interface Gamification {
  id: string;
  userId: string;
  points: number;
  badges: Badge[];
  level: number;
  updatedAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  contentId: string;
  score?: number;
  completedAt?: string;
  attempts: number;
  content?: {
    id: string;
    title: string;
    type: ContentType;
    category?: string;
  };
}

export interface ProgressResponse {
  gamification: Gamification;
  recentProgress: UserProgress[];
  statistics: {
    totalCompleted: number;
    byType: Record<ContentType, number>;
  };
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  points: number;
  level: number;
  badges: Badge[];
}

// API Error Types
export interface ApiError {
  error: string;
  details?: any;
}

