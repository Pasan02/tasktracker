import apiClient from '../utils/apiClient';
import { ENDPOINTS } from '../config/apiConfig';

// Generate a unique ID for tasks (for development)
const generateId = () => `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Sample tasks for development
const SAMPLE_TASKS = [
  {
    id: 'task-1',
    title: 'Complete project proposal',
    description: 'Finish the project proposal document with timeline and budget',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '14:00',
    priority: 'high',
    category: 'work'
  },
  {
    id: 'task-2',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, vegetables',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '18:00',
    priority: 'medium',
    category: 'personal'
  }
];

const taskService = {
  /**
   * Get all tasks
   * @returns {Promise} - List of tasks
   */
  getAllTasks: async () => {
    try {
      // For demo/development, use localStorage or sample data
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        return JSON.parse(savedTasks);
      }
      
      // Initialize with sample data if nothing in localStorage
      localStorage.setItem('tasks', JSON.stringify(SAMPLE_TASKS));
      return SAMPLE_TASKS;
      
      // Real API call (uncomment when backend is ready)
      // return await apiClient.get(ENDPOINTS.TASKS.BASE);
    } catch (error) {
      console.error('Get tasks error:', error);
      throw error;
    }
  },

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise} - Created task
   */
  createTask: async (taskData) => {
    try {
      // For demo/development
      const savedTasks = localStorage.getItem('tasks');
      const tasks = savedTasks ? JSON.parse(savedTasks) : [];
      
      const newTask = {
        ...taskData,
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      
      tasks.push(newTask);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      
      return newTask;
      
      // Real API call (uncomment when backend is ready)
      // return await apiClient.post(ENDPOINTS.TASKS.BASE, taskData);
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  },

  /**
   * Get a specific task by ID
   * @param {string} taskId - Task ID
   * @returns {Promise} - Task data
   */
  getTaskById: async (taskId) => {
    try {
      // For demo/development
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          return task;
        }
      }
      
      throw new Error('Task not found');
      
      // Real API call (uncomment when backend is ready)
      // return await apiClient.get(ENDPOINTS.TASKS.BY_ID(taskId));
    } catch (error) {
      console.error('Get task error:', error);
      throw error;
    }
  },

  /**
   * Update a task
   * @param {string} taskId - Task ID
   * @param {Object} updates - Task data to update
   * @returns {Promise} - Updated task
   */
  updateTask: async (taskId, updates) => {
    try {
      // For demo/development
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
          tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          
          localStorage.setItem('tasks', JSON.stringify(tasks));
          return tasks[taskIndex];
        }
      }
      
      throw new Error('Task not found');
      
      // Real API call (uncomment when backend is ready)
      // return await apiClient.put(ENDPOINTS.TASKS.BY_ID(taskId), updates);
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  },

  /**
   * Delete a task
   * @param {string} taskId - Task ID
   * @returns {Promise} - Success status
   */
  deleteTask: async (taskId) => {
    try {
      // For demo/development
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        return { success: true };
      }
      
      // Real API call (uncomment when backend is ready)
      // return await apiClient.delete(ENDPOINTS.TASKS.BY_ID(taskId));
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  }
};

export default taskService;