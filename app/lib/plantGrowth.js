/**
 * Habit Garden - Plant Growth System
 * Determines plant stage based on habit streak consistency
 */

export const PLANT_STAGES = {
  SEED: {
    name: 'Seed',
    emoji: '🌰',
    minDays: 0,
    maxDays: 6,
    description: 'Just planted',
    color: '#8B4513',
  },
  SPROUT: {
    name: 'Sprout',
    emoji: '🌱',
    minDays: 7,
    maxDays: 20,
    description: 'Starting to grow',
    color: '#90EE90',
  },
  YOUNG_PLANT: {
    name: 'Young Plant',
    emoji: '🌿',
    minDays: 21,
    maxDays: 49,
    description: 'Growing strong',
    color: '#32CD32',
  },
  MATURE_PLANT: {
    name: 'Mature Plant',
    emoji: '🪴',
    minDays: 50,
    maxDays: 99,
    description: 'Well established',
    color: '#228B22',
  },
  TREE: {
    name: 'Strong Tree',
    emoji: '🌳',
    minDays: 100,
    maxDays: 199,
    description: 'Deeply rooted',
    color: '#006400',
  },
  BLOOMING: {
    name: 'Blooming Garden',
    emoji: '🌸',
    minDays: 200,
    maxDays: Infinity,
    description: 'Full bloom!',
    color: '#FF69B4',
  },
  WILTED: {
    name: 'Wilted',
    emoji: '🥀',
    minDays: -1,
    maxDays: -1,
    description: 'Needs attention',
    color: '#8B4513',
  },
};

/**
 * Get plant stage based on current streak
 * @param {number} currentStreak - Current habit streak count
 * @param {boolean} isCurrentStreak - Whether streak is active (checked today or yesterday)
 * @returns {Object} Plant stage object
 */
export function getPlantStage(currentStreak, isCurrentStreak = true) {
  // If streak broken (not current), show wilted plant
  if (!isCurrentStreak && currentStreak > 0) {
    return PLANT_STAGES.WILTED;
  }

  // Determine stage based on streak length
  if (currentStreak >= PLANT_STAGES.BLOOMING.minDays) {
    return PLANT_STAGES.BLOOMING;
  } else if (currentStreak >= PLANT_STAGES.TREE.minDays) {
    return PLANT_STAGES.TREE;
  } else if (currentStreak >= PLANT_STAGES.MATURE_PLANT.minDays) {
    return PLANT_STAGES.MATURE_PLANT;
  } else if (currentStreak >= PLANT_STAGES.YOUNG_PLANT.minDays) {
    return PLANT_STAGES.YOUNG_PLANT;
  } else if (currentStreak >= PLANT_STAGES.SPROUT.minDays) {
    return PLANT_STAGES.SPROUT;
  } else {
    return PLANT_STAGES.SEED;
  }
}

/**
 * Get plant health percentage (0-100)
 * @param {number} currentStreak - Current habit streak count
 * @param {boolean} isCurrentStreak - Whether streak is active
 * @returns {number} Health percentage
 */
export function getPlantHealth(currentStreak, isCurrentStreak = true) {
  if (!isCurrentStreak && currentStreak > 0) {
    return 25; // Wilted but not dead
  }

  if (currentStreak === 0) {
    return 10; // Just planted
  }

  // More visible health progression:
  // Days 1-6: 20-35% (Seed stage)
  // Days 7-20: 35-50% (Sprout)
  // Days 21-49: 50-70% (Young Plant)
  // Days 50-99: 70-85% (Mature Plant)
  // Days 100-199: 85-95% (Tree)
  // Days 200+: 95-100% (Blooming)
  
  let health;
  if (currentStreak >= 200) {
    health = Math.min(100, 95 + (currentStreak - 200) * 0.05);
  } else if (currentStreak >= 100) {
    health = 85 + ((currentStreak - 100) / 100) * 10; // 85-95%
  } else if (currentStreak >= 50) {
    health = 70 + ((currentStreak - 50) / 50) * 15; // 70-85%
  } else if (currentStreak >= 21) {
    health = 50 + ((currentStreak - 21) / 29) * 20; // 50-70%
  } else if (currentStreak >= 7) {
    health = 35 + ((currentStreak - 7) / 14) * 15; // 35-50%
  } else {
    health = 20 + (currentStreak / 6) * 15; // 20-35%
  }
  
  return Math.round(health);
}

/**
 * Get motivational message based on plant stage
 * @param {Object} plantStage - Plant stage object
 * @param {string} habitName - Name of the habit
 * @returns {string} Motivational message
 */
export function getPlantMessage(plantStage, habitName) {
  const messages = {
    SEED: [
      `Your ${habitName} seed is planted! 🌰`,
      `Keep watering your ${habitName} habit!`,
      `The journey of ${habitName} begins!`,
    ],
    SPROUT: [
      `Your ${habitName} is sprouting! 🌱`,
      `Great start with ${habitName}! Keep going!`,
      `${habitName} is taking root!`,
    ],
    YOUNG_PLANT: [
      `${habitName} is growing beautifully! 🌿`,
      `Your ${habitName} plant is thriving!`,
      `Strong foundation for ${habitName}!`,
    ],
    MATURE_PLANT: [
      `${habitName} is well established! 🪴`,
      `Your ${habitName} habit is flourishing!`,
      `Impressive consistency with ${habitName}!`,
    ],
    TREE: [
      `${habitName} has become a mighty tree! 🌳`,
      `Your ${habitName} is deeply rooted!`,
      `100+ days of ${habitName}! Amazing!`,
    ],
    BLOOMING: [
      `${habitName} is in full bloom! 🌸`,
      `Your ${habitName} garden is magnificent!`,
      `200+ days! You're a ${habitName} master!`,
    ],
    WILTED: [
      `Your ${habitName} needs attention 🥀`,
      `Time to revive your ${habitName} habit!`,
      `Don't give up on ${habitName}!`,
    ],
  };

  const stageMessages = messages[plantStage.name.toUpperCase().replace(/\s+/g, '_')];
  return stageMessages[Math.floor(Math.random() * stageMessages.length)];
}

/**
 * Calculate days until next plant stage
 * @param {number} currentStreak - Current habit streak count
 * @returns {Object} { daysLeft, nextStage }
 */
export function getDaysToNextStage(currentStreak) {
  const stages = [
    PLANT_STAGES.SEED,
    PLANT_STAGES.SPROUT,
    PLANT_STAGES.YOUNG_PLANT,
    PLANT_STAGES.MATURE_PLANT,
    PLANT_STAGES.TREE,
    PLANT_STAGES.BLOOMING,
  ];

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    if (currentStreak >= stage.minDays && currentStreak <= stage.maxDays) {
      const nextStage = stages[i + 1];
      if (nextStage) {
        const daysLeft = nextStage.minDays - currentStreak;
        return { daysLeft, nextStage };
      } else {
        return { daysLeft: 0, nextStage: null }; // Max stage reached
      }
    }
  }

  return { daysLeft: 0, nextStage: null };
}
