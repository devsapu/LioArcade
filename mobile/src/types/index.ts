// User types
export interface User {
  id: string;
  email: string;
  username: string;
  profileImage?: string;
  role: 'LEARNER' | 'ADMIN' | 'CONTENT_MANAGER';
  createdAt: string;
}

// Auth types
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Content types
export type ContentType = 'QUIZ' | 'FLASHCARD' | 'MINI_GAME';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Content {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  difficulty: DifficultyLevel;
  points: number;
  estimatedTime: number;
}

export interface Quiz extends Content {
  type: 'QUIZ';
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Flashcard extends Content {
  type: 'FLASHCARD';
  cards: FlashcardCard[];
}

export interface FlashcardCard {
  id: string;
  front: string;
  back: string;
}

// Gamification types
export interface LeaderboardEntry {
  userId: string;
  username: string;
  profileImage?: string;
  totalPoints: number;
  level: number;
  rank: number;
}

export interface ProgressResponse {
  totalPoints: number;
  level: number;
  badges: Badge[];
  statistics: {
    quizzesCompleted: number;
    flashcardsCompleted: number;
    gamesCompleted: number;
    totalTimeSpent: number;
  };
  recentActivity: Activity[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Activity {
  id: string;
  type: ContentType;
  title: string;
  pointsEarned: number;
  completedAt: string;
}

// Score submission
export interface ScoreSubmission {
  contentType: ContentType;
  contentId: string;
  score: number;
  totalQuestions?: number;
  correctAnswers?: number;
  timeSpent: number;
  accuracy: number;
}

export interface ScoreSubmissionResponse {
  pointsEarned: number;
  levelUp: boolean;
  newLevel?: number;
}
