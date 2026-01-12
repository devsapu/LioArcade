import prisma from '../config/database.js';

/**
 * Calculate points based on content type and score
 */
const calculatePoints = (contentType, score, maxScore) => {
  const percentage = score / maxScore;
  
  switch (contentType) {
    case 'QUIZ':
      return Math.round(10 + (percentage * 40)); // 10-50 points
    case 'FLASHCARD':
      return 5; // Fixed 5 points per card
    case 'MINI_GAME':
      return Math.round(20 + (percentage * 80)); // 20-100 points
    default:
      return 10;
  }
};

/**
 * Calculate level from total points
 */
const calculateLevel = (points) => {
  // Level 1: 0-100 points
  // Level 2: 101-300 points
  // Level 3: 301-600 points
  // Level 4: 601-1000 points
  // Level 5+: 1000+ points (every 500 points = 1 level)
  
  if (points < 100) return 1;
  if (points < 300) return 2;
  if (points < 600) return 3;
  if (points < 1000) return 4;
  
  return 5 + Math.floor((points - 1000) / 500);
};

/**
 * Check and award badges
 */
const checkBadges = async (userId, points, level) => {
  const badges = [];
  
  // First Quiz badge
  const quizCount = await prisma.userProgress.count({
    where: {
      userId,
      content: {
        type: 'QUIZ',
      },
    },
  });
  if (quizCount === 1) {
    badges.push({ name: 'First Quiz', icon: '🎯', earnedAt: new Date() });
  }
  
  // Perfect Score badge
  const perfectScores = await prisma.userProgress.count({
    where: {
      userId,
      score: {
        gte: 100,
      },
    },
  });
  if (perfectScores >= 5) {
    badges.push({ name: 'Perfect Score Master', icon: '⭐', earnedAt: new Date() });
  }
  
  // Level badges
  if (level >= 5) {
    badges.push({ name: 'Level 5', icon: '🏆', earnedAt: new Date() });
  }
  if (level >= 10) {
    badges.push({ name: 'Level 10', icon: '👑', earnedAt: new Date() });
  }
  
  // Streak badge (simplified - would need daily login tracking)
  if (points >= 500) {
    badges.push({ name: 'Dedicated Learner', icon: '🔥', earnedAt: new Date() });
  }
  
  return badges;
};

/**
 * Submit score and update gamification
 */
export const submitScore = async (userId, contentId, score, maxScore) => {
  // Get content to determine type
  const content = await prisma.content.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    throw new Error('Content not found');
  }

  // Calculate points
  const pointsEarned = calculatePoints(content.type, score, maxScore);

  // Update or create user progress
  const progress = await prisma.userProgress.upsert({
    where: {
      userId_contentId: {
        userId,
        contentId,
      },
    },
    update: {
      score: Math.max(score, undefined), // Keep highest score
      attempts: { increment: 1 },
      completedAt: new Date(),
    },
    create: {
      userId,
      contentId,
      score,
      attempts: 1,
      completedAt: new Date(),
    },
  });

  // Update gamification
  const gamification = await prisma.gamification.findUnique({
    where: { userId },
  });

  if (!gamification) {
    throw new Error('Gamification record not found');
  }

  const newPoints = gamification.points + pointsEarned;
  const newLevel = calculateLevel(newPoints);
  
  // Check for new badges
  const newBadges = await checkBadges(userId, newPoints, newLevel);
  const existingBadges = Array.isArray(gamification.badges) ? gamification.badges : [];
  const allBadges = [...existingBadges, ...newBadges];
  
  // Remove duplicates based on badge name
  const uniqueBadges = Array.from(
    new Map(allBadges.map(badge => [badge.name, badge])).values()
  );

  const updatedGamification = await prisma.gamification.update({
    where: { userId },
    data: {
      points: newPoints,
      level: newLevel,
      badges: uniqueBadges,
    },
  });

  return {
    progress,
    gamification: updatedGamification,
    pointsEarned,
    levelUp: newLevel > gamification.level,
  };
};

/**
 * Get user progress
 */
export const getUserProgress = async (userId) => {
  const [gamification, progress] = await Promise.all([
    prisma.gamification.findUnique({
      where: { userId },
    }),
    prisma.userProgress.findMany({
      where: { userId },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 20, // Recent 20 activities
    }),
  ]);

  if (!gamification) {
    throw new Error('Gamification record not found');
  }

  // Calculate statistics
  const totalCompleted = await prisma.userProgress.count({
    where: { userId },
  });

  const byType = await prisma.userProgress.groupBy({
    by: ['contentId'],
    where: { userId },
    _count: true,
  });

  const contentTypes = await prisma.userProgress.findMany({
    where: { userId },
    include: {
      content: {
        select: {
          type: true,
        },
      },
    },
  });

  const typeStats = contentTypes.reduce((acc, p) => {
    const type = p.content.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return {
    gamification,
    recentProgress: progress,
    statistics: {
      totalCompleted,
      byType: typeStats,
    },
  };
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (options = {}) => {
  const { limit = 10, by = 'points' } = options;

  const orderBy = by === 'level' ? { level: 'desc' } : { points: 'desc' };

  const leaderboard = await prisma.gamification.findMany({
    orderBy,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          profileImage: true,
        },
      },
    },
  });

  return leaderboard.map((entry, index) => ({
    rank: index + 1,
    user: entry.user,
    points: entry.points,
    level: entry.level,
    badges: entry.badges,
  }));
};



