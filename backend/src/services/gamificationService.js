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
      return score * 5; // 5 points per card studied
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
  console.log(`[submitScore] User: ${userId}, Content: ${contentId}, Score: ${score}/${maxScore}`);
  
  // Get content to determine type
  const content = await prisma.content.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    console.error(`[submitScore] Content not found: ${contentId}`);
    throw new Error('Content not found');
  }

  console.log(`[submitScore] Content type: ${content.type}, Title: ${content.title}`);

  // Calculate points
  const pointsEarned = calculatePoints(content.type, score, maxScore);
  console.log(`[submitScore] Points earned: ${pointsEarned}`);

  // Get existing progress to keep highest score
  const existingProgress = await prisma.userProgress.findUnique({
    where: {
      userId_contentId: {
        userId,
        contentId,
      },
    },
  });

  // Update or create user progress
  const progress = await prisma.userProgress.upsert({
    where: {
      userId_contentId: {
        userId,
        contentId,
      },
    },
    update: {
      score: existingProgress && existingProgress.score ? Math.max(score, existingProgress.score) : score,
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

  const oldPoints = gamification.points;
  const newPoints = gamification.points + pointsEarned;
  const newLevel = calculateLevel(newPoints);
  
  console.log(`[submitScore] Points: ${oldPoints} -> ${newPoints}, Level: ${gamification.level} -> ${newLevel}`);
  
  // Check for new badges
  const newBadges = await checkBadges(userId, newPoints, newLevel);
  
  // Ensure badges is an array (Prisma JSON field)
  let existingBadges = [];
  if (gamification.badges) {
    if (Array.isArray(gamification.badges)) {
      existingBadges = gamification.badges;
    } else if (typeof gamification.badges === 'object') {
      // Handle case where badges might be stored as object
      existingBadges = Object.values(gamification.badges);
    }
  }
  
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
  
  console.log(`[submitScore] Gamification updated successfully. New points: ${updatedGamification.points}`);

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
      orderBy: [
        { completedAt: 'desc' }, // Prioritize completed items
        { updatedAt: 'desc' }, // Fallback to updatedAt
      ],
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

  // Get all progress records with content type for statistics
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

  // Calculate statistics by content type
  const typeStats = contentTypes.reduce((acc, p) => {
    if (p.content && p.content.type) {
      const type = p.content.type;
      acc[type] = (acc[type] || 0) + 1;
    }
    return acc;
  }, {});
  
  // Ensure all content types are represented
  const defaultStats = { QUIZ: 0, FLASHCARD: 0, MINI_GAME: 0 };
  const finalTypeStats = { ...defaultStats, ...typeStats };

  // Ensure badges is an array
  let badges = [];
  if (gamification.badges) {
    if (Array.isArray(gamification.badges)) {
      badges = gamification.badges;
    } else if (typeof gamification.badges === 'object') {
      badges = Object.values(gamification.badges);
    }
  }

  return {
    gamification: {
      ...gamification,
      badges,
    },
    recentProgress: progress,
    statistics: {
      totalCompleted,
      byType: finalTypeStats,
    },
  };
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (options = {}) => {
  const { limit = 10, by = 'points', contentType } = options;
  
  console.log(`[getLeaderboard] Options:`, { limit, by, contentType });

  const orderBy = by === 'level' ? { level: 'desc' } : { points: 'desc' };

  // If filtering by content type, we need to calculate points from that type only
  if (contentType) {
    // Get all users with their progress for the specific content type
    const userProgressByType = await prisma.userProgress.findMany({
      where: {
        content: {
          type: contentType,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            profileImage: true,
          },
        },
        content: {
          select: {
            type: true,
          },
        },
      },
    });

    // Calculate points per user for this content type using the same logic as submitScore
    const userPointsMap = new Map();
    
    for (const progress of userProgressByType) {
      const userId = progress.userId;
      if (!userPointsMap.has(userId)) {
        userPointsMap.set(userId, {
          user: progress.user,
          points: 0,
          level: 1,
          badges: [],
        });
      }
      
      const userData = userPointsMap.get(userId);
      
      // Calculate points using the same logic as calculatePoints function
      const score = progress.score || 0;
      
      // For category leaderboard, we need to recalculate points
      // Since we don't store maxScore, we'll use reasonable estimates
      let pointsEarned = 0;
      switch (contentType) {
        case 'QUIZ':
          // For quizzes, score is typically out of total questions
          // Estimate: if score is reasonable (1-50), assume it's a percentage
          // Otherwise, treat score as number of correct answers
          if (score <= 50 && score > 0) {
            // Likely a percentage or small number - estimate maxScore
            const estimatedMaxScore = Math.max(score, 10); // At least 10 questions
            const percentage = score / estimatedMaxScore;
            pointsEarned = Math.round(10 + (percentage * 40)); // 10-50 points
          } else {
            // Treat as number of correct answers, estimate maxScore
            const estimatedMaxScore = Math.max(score, 10);
            const percentage = score / estimatedMaxScore;
            pointsEarned = Math.round(10 + (percentage * 40));
          }
          break;
        case 'FLASHCARD':
          // For flashcards, score represents number of cards studied
          // Each card is worth 5 points
          pointsEarned = score * 5;
          break;
        case 'MINI_GAME':
          // For games, score could be points earned or percentage
          // Estimate: if score is high (>100), it might be points already
          // Otherwise, treat as percentage
          if (score > 100) {
            // Likely already points, use directly (but cap at reasonable amount)
            pointsEarned = Math.min(score, 100);
          } else {
            // Treat as percentage or score out of maxScore
            const estimatedMaxScore = Math.max(score, 10);
            const percentage = score / estimatedMaxScore;
            pointsEarned = Math.round(20 + (percentage * 80)); // 20-100 points
          }
          break;
      }
      
      userData.points += pointsEarned;
    }

    // Get gamification data for level and badges
    const userIds = Array.from(userPointsMap.keys());
    const gamificationData = await prisma.gamification.findMany({
      where: {
        userId: { in: userIds },
      },
    });

    // Merge gamification data
    const leaderboardData = Array.from(userPointsMap.entries()).map(([userId, data]) => {
      const gamification = gamificationData.find(g => g.userId === userId);
      return {
        userId,
        user: data.user,
        points: data.points, // Points from this content type only
        level: gamification?.level || 1,
        badges: gamification?.badges || [],
      };
    });

    // Sort and limit
    leaderboardData.sort((a, b) => {
      if (by === 'level') {
        return b.level - a.level || b.points - a.points;
      }
      return b.points - a.points || b.level - a.level;
    });

    return leaderboardData.slice(0, limit).map((entry, index) => {
      // Ensure badges is an array
      let badges = [];
      if (entry.badges) {
        if (Array.isArray(entry.badges)) {
          badges = entry.badges;
        } else if (typeof entry.badges === 'object') {
          badges = Object.values(entry.badges);
        }
      }

      return {
        rank: index + 1,
        user: entry.user,
        points: entry.points,
        level: entry.level,
        badges,
      };
    });
  }

  // Overall leaderboard (no content type filter)
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

  return leaderboard.map((entry, index) => {
    // Ensure badges is an array
    let badges = [];
    if (entry.badges) {
      if (Array.isArray(entry.badges)) {
        badges = entry.badges;
      } else if (typeof entry.badges === 'object') {
        badges = Object.values(entry.badges);
      }
    }

    return {
      rank: index + 1,
      user: entry.user,
      points: entry.points,
      level: entry.level,
      badges,
    };
  });
};



