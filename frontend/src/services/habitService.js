import apiClient from '../utils/apiClient';
import { ENDPOINTS } from '../config/apiConfig';

const habitService = {
  /**
   * Get all habits for the current user
   * @returns {Promise} - List of habits
   */
  getAllHabits: async () => {
    try {
      // Get current user
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not found');
      }

      console.log('Fetching habits for user:', user.id);

      // Real API call
      const response = await apiClient.get(`/habits/user/${user.id}`);
      
      console.log('Habits fetched successfully:', response);
      
      // Normalize response to frontend format
      return response.map(habit => ({
        ...habit,
        frequency: habit.frequency ? habit.frequency.toLowerCase() : 'daily',
        category: habit.category ? habit.category.toLowerCase() : 'personal',
        isActive: habit.isActive !== undefined ? habit.isActive : true
      }));
    } catch (error) {
      console.error('Get habits error:', error);
      
      // Fallback to localStorage for development
      const savedHabits = localStorage.getItem('habits');
      if (savedHabits) {
        try {
          return JSON.parse(savedHabits);
        } catch (parseError) {
          console.error('Error parsing saved habits:', parseError);
        }
      }
      
      // Return empty array if no saved data
      return [];
    }
  },

  /**
   * Get all habit completions for the current user
   * @returns {Promise} - List of habit completions
   */
  getHabitCompletions: async () => {
    try {
      // Get current user
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not found');
      }

      console.log('Fetching habit completions for user:', user.id);

      // Real API call
      const response = await apiClient.get(`/habits/user/${user.id}/completions`);
      
      console.log('Habit completions fetched successfully:', response);
      
      return response;
    } catch (error) {
      console.error('Get habit completions error:', error);
      
      // Fallback to localStorage for development
      const savedCompletions = localStorage.getItem('habitCompletions');
      if (savedCompletions) {
        try {
          return JSON.parse(savedCompletions);
        } catch (parseError) {
          console.error('Error parsing saved completions:', parseError);
        }
      }
      
      return [];
    }
  },

  /**
   * Create a new habit
   * @param {Object} habitData - Habit data
   * @returns {Promise} - Created habit
   */
  createHabit: async (habitData) => {
    try {
      // Get current user
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not found');
      }

      // Prepare habit data to match backend DTO
      const habitDto = {
        title: habitData.title,
        description: habitData.description || '',
        frequency: habitData.frequency.toUpperCase(), // DAILY, WEEKLY, CUSTOM
        targetDays: habitData.targetDays || [],
        category: habitData.category.toUpperCase(), // PERSONAL, HEALTH, etc.
        reminderTime: habitData.reminderTime || null,
        targetCount: habitData.targetCount || 1,
        isActive: true
      };

      console.log('Creating habit:', habitDto);

      // Real API call
      const response = await apiClient.post(`/habits?userId=${user.id}`, habitDto);
      
      console.log('Habit created successfully:', response);
      
      // Normalize response to frontend format
      return {
        ...response,
        frequency: response.frequency ? response.frequency.toLowerCase() : 'daily',
        category: response.category ? response.category.toLowerCase() : 'personal',
        isActive: response.isActive !== undefined ? response.isActive : true
      };
    } catch (error) {
      console.error('Create habit error:', error);
      
      // Fallback to localStorage for development
      const savedHabits = localStorage.getItem('habits');
      const habits = savedHabits ? JSON.parse(savedHabits) : [];
      
      const newHabit = {
        ...habitData,
        id: `habit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      habits.push(newHabit);
      localStorage.setItem('habits', JSON.stringify(habits));
      
      return newHabit;
    }
  },

  /**
   * Update a habit
   * @param {string} habitId - Habit ID
   * @param {Object} updates - Habit data to update
   * @returns {Promise} - Updated habit
   */
  updateHabit: async (habitId, updates) => {
    try {
      // Prepare updates to match backend DTO
      const habitDto = {};
      
      if (updates.title !== undefined) habitDto.title = updates.title;
      if (updates.description !== undefined) habitDto.description = updates.description;
      if (updates.frequency !== undefined) habitDto.frequency = updates.frequency.toUpperCase();
      if (updates.targetDays !== undefined) habitDto.targetDays = updates.targetDays;
      if (updates.category !== undefined) habitDto.category = updates.category.toUpperCase();
      if (updates.reminderTime !== undefined) habitDto.reminderTime = updates.reminderTime;
      if (updates.targetCount !== undefined) habitDto.targetCount = updates.targetCount;
      if (updates.isActive !== undefined) habitDto.isActive = updates.isActive;

      console.log('Updating habit:', habitId, 'with data:', habitDto);

      // Real API call
      const response = await apiClient.put(`/habits/${habitId}`, habitDto);
      
      // Normalize response back to frontend format
      return {
        ...response,
        frequency: response.frequency ? response.frequency.toLowerCase() : 'daily',
        category: response.category ? response.category.toLowerCase() : 'personal',
        isActive: response.isActive !== undefined ? response.isActive : true
      };
    } catch (error) {
      console.error('Update habit error:', error);
      
      // Fallback to localStorage
      const savedHabits = localStorage.getItem('habits');
      if (savedHabits) {
        const habits = JSON.parse(savedHabits);
        const habitIndex = habits.findIndex(h => h.id == habitId);
        
        if (habitIndex !== -1) {
          habits[habitIndex] = {
            ...habits[habitIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          
          localStorage.setItem('habits', JSON.stringify(habits));
          return habits[habitIndex];
        }
      }
      
      throw error;
    }
  },

  /**
   * Delete a habit
   * @param {string} habitId - Habit ID
   * @returns {Promise} - Success status
   */
  deleteHabit: async (habitId) => {
    try {
      console.log('Deleting habit:', habitId);

      // Real API call
      await apiClient.delete(`/habits/${habitId}`);
      
      console.log('Habit deleted successfully');
      
      return { success: true };
    } catch (error) {
      console.error('Delete habit error:', error);
      
      // Fallback to localStorage
      const savedHabits = localStorage.getItem('habits');
      if (savedHabits) {
        const habits = JSON.parse(savedHabits);
        const updatedHabits = habits.filter(h => h.id != habitId);
        
        localStorage.setItem('habits', JSON.stringify(updatedHabits));
        
        // Also remove completions for this habit
        const savedCompletions = localStorage.getItem('habitCompletions');
        if (savedCompletions) {
          const completions = JSON.parse(savedCompletions);
          const updatedCompletions = completions.filter(c => c.habitId != habitId);
          localStorage.setItem('habitCompletions', JSON.stringify(updatedCompletions));
        }
        
        return { success: true };
      }
      
      throw error;
    }
  },

  /**
   * Mark a habit as completed for a specific date (toggle behavior)
   * @param {string} habitId - Habit ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise} - Completion data
   */
  markHabitComplete: async (habitId, date = null) => {
    try {
      const completionDate = date || new Date().toISOString().split('T')[0];
      
      console.log('Toggling habit completion:', habitId, 'for date:', completionDate);

      // Real API call with toggle behavior
      const response = await apiClient.post(`/habits/${habitId}/toggle-complete?date=${completionDate}`);
      
      console.log('Habit completion toggled:', response);
      
      // Return normalized completion data
      if (response.action === 'added') {
        return {
          id: response.completion.id,
          habitId: habitId,
          date: completionDate,
          completed: true
        };
      } else {
        return {
          removed: true,
          date: completionDate
        };
      }
    } catch (error) {
      console.error('Mark habit complete error:', error);
      
      // Fix: Ensure completionDate is defined in fallback code
      const completionDate = date || new Date().toISOString().split('T')[0];
      
      // Fallback to localStorage
      const savedCompletions = localStorage.getItem('habitCompletions');
      const completions = savedCompletions ? JSON.parse(savedCompletions) : [];
      
      // Check if already completed for this date
      const existingCompletion = completions.find(
        c => c.habitId == habitId && c.date === completionDate
      );
      
      if (existingCompletion) {
        // If already completed, remove the completion (toggle behavior)
        const updatedCompletions = completions.filter(
          c => !(c.habitId == habitId && c.date === completionDate)
        );
        localStorage.setItem('habitCompletions', JSON.stringify(updatedCompletions));
        return { removed: true, date: completionDate };
      } else {
        // Add new completion
        const newCompletion = {
          id: `completion-${Date.now()}`,
          habitId: habitId,
          date: completionDate,
          completed: true
        };
        
        completions.push(newCompletion);
        localStorage.setItem('habitCompletions', JSON.stringify(completions));
        return newCompletion;
      }
    }
  },

  /**
   * Delete a habit completion
   * @param {string} completionId - Completion ID
   * @returns {Promise} - Success status
   */
  deleteHabitCompletion: async (completionId) => {
    try {
      // For now, use localStorage
      const savedCompletions = localStorage.getItem('habitCompletions');
      if (savedCompletions) {
        const completions = JSON.parse(savedCompletions);
        const updatedCompletions = completions.filter(c => c.id !== completionId);
        localStorage.setItem('habitCompletions', JSON.stringify(updatedCompletions));
        return { success: true };
      }
      
      // Real API call (implement when completion endpoints are ready)
      // await apiClient.delete(`/habits/completions/${completionId}`);
      // return { success: true };
    } catch (error) {
      console.error('Delete habit completion error:', error);
      throw error;
    }
  },

  /**
   * Get habit statistics
   * @param {string} habitId - Habit ID
   * @returns {Promise} - Habit stats (current streak, longest streak, completion rate)
   */
  getHabitStats: async (habitId) => {
    try {
      const response = await apiClient.get(`/habits/${habitId}/stats`);
      console.log('Habit stats fetched:', response);
      return response;
    } catch (error) {
      console.error('Get habit stats error:', error);
      
      // Fallback calculation using local data
      const savedCompletions = localStorage.getItem('habitCompletions');
      if (savedCompletions) {
        const completions = JSON.parse(savedCompletions)
          .filter(c => c.habitId == habitId)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Calculate basic stats
        const currentStreak = calculateStreakFromCompletions(completions);
        const longestStreak = calculateLongestStreak(completions);
        const last30Days = completions.filter(c => {
          const completionDate = new Date(c.date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return completionDate >= thirtyDaysAgo;
        });
        
        return {
          currentStreak,
          longestStreak,
          totalCompletions: completions.length,
          completionRate: Math.round((last30Days.length / 30) * 100)
        };
      }
      
      return { currentStreak: 0, longestStreak: 0, totalCompletions: 0, completionRate: 0 };
    }
  },

  /**
   * Get analytics data for chart
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} - Analytics data
   */
  getHabitAnalytics: async (startDate, endDate) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not found');
      }

      const response = await apiClient.get(
        `/habits/user/${user.id}/analytics?startDate=${startDate}&endDate=${endDate}`
      );
      return response;
    } catch (error) {
      console.error('Get habit analytics error:', error);
      
      // Fallback: Calculate from local data
      return calculateLocalAnalytics(startDate, endDate);
    }
  },

  /**
   * Get weekly habit summary
   * @returns {Promise} - Weekly summary data
   */
  getWeeklySummary: async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not found');
      }

      const response = await apiClient.get(`/habits/user/${user.id}/weekly-summary`);
      return response;
    } catch (error) {
      console.error('Get weekly summary error:', error);
      
      // Fallback calculation
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      return calculateLocalAnalytics(
        weekStart.toISOString().split('T')[0],
        weekEnd.toISOString().split('T')[0]
      );
    }
  }
}

// Helper functions for fallback calculations
function calculateStreakFromCompletions(completions) {
  if (completions.length === 0) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  let currentDate = new Date(today);
  
  while (true) {
    const dateString = currentDate.toISOString().split('T')[0];
    const hasCompletion = completions.some(c => c.date === dateString);
    
    if (hasCompletion) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
    
    // Don't go back more than 365 days
    if (streak > 365) break;
  }
  
  return streak;
}

function calculateLongestStreak(completions) {
  if (completions.length === 0) return 0;
  
  let longestStreak = 0;
  let currentStreak = 0;
  let lastDate = null;
  
  completions.forEach(completion => {
    const currentDate = new Date(completion.date);
    
    if (lastDate) {
      const dayDiff = (currentDate - lastDate) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    
    lastDate = currentDate;
  });
  
  return Math.max(longestStreak, currentStreak);
}

function calculateLocalAnalytics(startDate, endDate) {
  const savedHabits = localStorage.getItem('habits');
  const savedCompletions = localStorage.getItem('habitCompletions');
  
  if (!savedHabits || !savedCompletions) {
    return { totalHabits: 0, completionRate: 0, streakData: [] };
  }
  
  const habits = JSON.parse(savedHabits);
  const completions = JSON.parse(savedCompletions);
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  const completionsInRange = completions.filter(c => {
    const completionDate = new Date(c.date);
    return completionDate >= start && completionDate <= end;
  });
  
  const totalPossibleCompletions = habits.length * totalDays;
  const completionRate = totalPossibleCompletions > 0 ? 
    Math.round((completionsInRange.length / totalPossibleCompletions) * 100) : 0;
  
  return {
    totalHabits: habits.length,
    completionRate,
    totalCompletions: completionsInRange.length,
    streakData: generateStreakData(completions, habits)
  };
}

function generateStreakData(completions, habits) {
  return habits.map(habit => {
    const habitCompletions = completions.filter(c => c.habitId == habit.id);
    return {
      habitId: habit.id,
      habitTitle: habit.title,
      currentStreak: calculateStreakFromCompletions(habitCompletions),
      longestStreak: calculateLongestStreak(habitCompletions)
    };
  });
}

export default habitService;