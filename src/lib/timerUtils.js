/**
 * Timer utility functions for interview questions
 */

/**
 * Calculate remaining time for a question based on start time and time limit
 * @param {number} questionStartTime - Timestamp when question started
 * @param {number} timeLimit - Time limit in seconds
 * @returns {number} Remaining time in seconds (0 if time expired)
 */
export const getRemainingTime = (questionStartTime, timeLimit) => {
  if (!questionStartTime || !timeLimit) return 0;

  const currentTime = Date.now();
  const elapsedTime = Math.floor((currentTime - questionStartTime) / 1000);
  const remainingTime = Math.max(0, timeLimit - elapsedTime);

  return remainingTime;
};

/**
 * Get the time limit for a question based on difficulty
 * @param {string} difficulty - Question difficulty ('easy', 'medium', 'hard')
 * @returns {number} Time limit in seconds
 */
export const getTimeLimitByDifficulty = (difficulty) => {
  let timeLimit;
  switch (difficulty) {
    case "easy":
      timeLimit = 20;
      break;
    case "medium":
      timeLimit = 60;
      break;
    case "hard":
      timeLimit = 120;
      break;
    default:
      timeLimit = 60;
      break;
  }

  return timeLimit;
};

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
