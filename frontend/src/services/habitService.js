import apiClient from '../utils/apiClient';
import { ENDPOINTS } from '../config/apiConfig';

// Generate a unique ID for habits (for development)
const generateId = () => `habit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Sample habits for development
const SAMPLE_HABITS = [
  {
    id: 'habit-1',
    title: 'Morning meditation',
    description: '10 minutes of mindfulness',
    frequency: 'daily',
    reminderTime: '08:00',
    category: 'wellness'
  },
  {
    id: 'habit-2',
    title: 'Read a book',
    description: 'At least 30 minutes of reading',
    frequency: 'daily',
    reminderTime: '21:00',
    category: 'personal'
  }
];

// Sample habit completions for development
const SAMPLE_COMPLETIONS = [
  {
    id: 'completion-1',
    habitId: 'habit-1',
    date: new Date().toISOString().split('T')[0]
  }
];

const habitService = {
  /**
   * Get all habits
   * @returns {Promise} - List of habits
   */
  getAllHabits: async () => {
    try {
      // For demo/development, use localStorage or sample data
      const savedHabits = localStorage.getItem('habits');
      if (savedHabits) {
        return JSON.parse(savedHabits);
      }
      
      // Initialize with sample data if nothing in localStorage
      localStorage.setItem('habits', JSON.stringify(SAMPLE_HABITS));
      return SAMPLE_HABITS;
      
      // Real API call (uncomment when backend is ready)
      // return await apiClient.get(ENDPOINTS.HABITS.BASE);
    } catch (error) {
      console.error('Get habits error:', error);
      throw error;
    }
  },

  /**
   * Get all habit completions
   * @returns {Promise} - List of habit completions
   */
  getHabitCompletions: async () => {
    try {
      // For demo/development, use localStorage or sample data
      const savedCompletions = localStorage.getItem('habitCompletions');
      if (savedCompletions) {
        return JSON.parse(savedCompletions);
      }
      
      // Initialize with sample data if nothing in localStorage
      localStorage.setItem('habitCompletions', JSON.stringify(SAMPLE_COMPLETIONS));
      return SAMPLE_COMPLETIONS;
      
      // Real API call (uncomment when backend is ready)
      // return await apiClient.get(ENDPOINTS.HABITS.COMPLETIONS);
    } catch (error) {
      console.error('Get habit completions error:', error);
      throw error;
    }
  },

  /**
   * Create a new habit
   * @param {Object} habitData - Habit data
   * @returns {Promise} - Created habit
   */
  createHabit: async (habitData) => {
    try {
      // For demo/development
      const savedHabits = localStorage.getItem('habits');
      const habits = savedHabits ? JSON.parse(savedHabits) : [];
      
      const newHabit = {
        ...habitData,
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      
      habits.push(newHabit);
      localStorage.setItem('habits', JSON.stringify(habits));
      
      return newHabit;
      
      // Real API call (uncomment when backend is ready)
      // return await apiClient.post(ENDPOINTS.HABITS.BASE, habitData);
    } catch (error) {
      console.error('Create habit error:', error);
      throw error;
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
      // For demo/development
      const savedHabits = localStorage.getItem('habits');
      if (savedHabits) {
        const habits = JSON.parse(savedHabits);
        const habitIndex = habits.findIndex(h => h.id === habitId);
        
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
      
      throw new Error('Habit not found');
      
      // Real API call (uncomment when backend is ready)
      // return await apiClient.put(ENDPOINTS.HABITS.BY_ID(habitId), updates);
    } catch (error) {
      console.error('Update habit error:', error);
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
      // For demo/development
      const savedHabits = localStorage.getItem('habits');
      if (savedHabits) {
        const habits = JSON.parse(savedHabits);
        const updatedHabits = habits.filter(h => h.id !== habitId);
        
        localStorage.setItem('habits', JSON.stringify(updatedHabits));
        
        // Also remove completions for this habit
        const savedCompletions = localStorage.getItem('habitCompletions');
        if (savedCompletions) {
          const completions = JSON.parse(savedCompletions);
          const updatedCompletions = completions.filter(c => c.habitId !== habitId);
          localStorage.setItem('habitCompletions', JSON.stringify(updatedCompletions));
        }
        
        return { success: true };
      }
      
      // Real API call (uncomment when backend is ready)
      // return await apiClient.delete(ENDPOINTS.HABITS.BY_ID(habitId));
    } catch (error) {
      console.error('Delete habit error:', error);
      throw error;
    }
  },

  /**
   * Mark a habit as completed for today
   * @param {string} habitId - Habit ID
   * @returns {Promise} - Completion data
   */
  markHabitComplete: async (habitId) => {
    try {
      // For demo/development
      const date = new Date().toISOString().split('T')[0];
      const savedCompletions = localStorage.getItem('habitCompletions');
      const completions = savedCompletions ? JSON.parse(savedCompletions) : [];
      
      // Check if already completed today
      const existingCompletion = completions.find(
        c => c.habitId === habitId && c.date === date
      );
      
      if (existingCompletion) {
        // If already completed, remove the completion (toggle behavior)
        const updatedCompletions = completions.filter(
          c => !(c.habitId === habitId && c.date === date)
        );
        localStorage.setItem('habitCompletions', JSON.stringify(updatedCompletions));
        return { removed: true };
      } else {
        // Add new completion
        const newCompletion = {
          id: `completion-${Date.now()}`,
          habitId,
          date
        };
        
        completions.push(newCompletion);
        localStorage.setItem('habitCompletions', JSON.stringify(completions));
        return newCompletion;
      }
      
      // Real API call (uncomment when backend is ready)
      // return await apiClient.post(ENDPOINTS.HABITS.MARK_COMPLETE(habitId));
    } catch (error) {
      console.error('Mark habit complete error:', error);
      throw error;
    }
  }
};

export default habitService;