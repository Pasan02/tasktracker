import apiClient from '../utils/apiClient';
import { ENDPOINTS } from '../config/apiConfig';

const taskService = {
  /**
   * Get all tasks for the current user
   * @returns {Promise} - List of tasks
   */
  getAllTasks: async () => {
    try {
      // Get current user to extract user ID
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not found');
      }

      // Real API call
      const response = await apiClient.get(`/tasks/user/${user.id}`);
      return response || [];
    } catch (error) {
      console.error('Get tasks error:', error);
      
      // Fallback to localStorage for development
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        return JSON.parse(savedTasks);
      }
      
      return [];
    }
  },

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise} - Created task
   */
  createTask: async (taskData) => {
    try {
      // Get current user
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not found');
      }

      // Prepare task data to match backend DTO - simplified status
      const taskDto = {
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority.toUpperCase(),
        category: taskData.category.toUpperCase(),
        dueDate: taskData.dueDate,
        dueTime: taskData.dueTime || null,
        status: 'TODO' // Always start as TODO, only two states: TODO or COMPLETED
      };

      console.log('Creating task:', taskDto);

      // Real API call
      const response = await apiClient.post(`/tasks?userId=${user.id}`, taskDto);
      
      // Normalize response to frontend format
      return {
        ...response,
        status: response.status ? response.status.toLowerCase() : 'todo',
        priority: response.priority ? response.priority.toLowerCase() : 'medium',
        category: response.category ? response.category.toLowerCase() : 'work'
      };
    } catch (error) {
      console.error('Create task error:', error);
      
      // Fallback to localStorage for development
      const savedTasks = localStorage.getItem('tasks');
      const tasks = savedTasks ? JSON.parse(savedTasks) : [];
      
      const newTask = {
        ...taskData,
        id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status: 'todo', // Frontend always uses lowercase
        createdAt: new Date().toISOString()
      };
      
      tasks.push(newTask);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      
      return newTask;
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
      // Ensure taskId is a number
      const numericTaskId = parseInt(taskId);
      if (isNaN(numericTaskId)) {
        throw new Error(`Invalid task ID: ${taskId}`);
      }
      
      // Prepare updates to match backend DTO
      const taskDto = {};
      
      if (updates.title !== undefined && updates.title !== null) {
        taskDto.title = String(updates.title).trim();
      }
      if (updates.description !== undefined && updates.description !== null) {
        taskDto.description = String(updates.description);
      }
      if (updates.status !== undefined && updates.status !== null) {
        // Simplified status mapping - only two states
        const statusMap = {
          'todo': 'TODO',
          'completed': 'COMPLETED'
        };
        const normalizedStatus = String(updates.status).toLowerCase().trim();
        taskDto.status = statusMap[normalizedStatus] || normalizedStatus.toUpperCase();
      }
      if (updates.priority !== undefined && updates.priority !== null) {
        taskDto.priority = String(updates.priority).toUpperCase();
      }
      if (updates.category !== undefined && updates.category !== null) {
        taskDto.category = String(updates.category).toUpperCase();
      }
      if (updates.dueDate !== undefined && updates.dueDate !== null) {
        taskDto.dueDate = updates.dueDate;
      }
      if (updates.dueTime !== undefined && updates.dueTime !== null) {
        taskDto.dueTime = updates.dueTime;
      }

      console.log('=== TASK UPDATE DEBUG ===');
      console.log('Task ID:', numericTaskId, 'Type:', typeof numericTaskId);
      console.log('Original updates:', JSON.stringify(updates, null, 2));
      console.log('Prepared taskDto:', JSON.stringify(taskDto, null, 2));
      console.log('Request URL:', `/tasks/${numericTaskId}`);
      console.log('========================');

      // Real API call
      const response = await apiClient.put(`/tasks/${numericTaskId}`, taskDto);
      
      console.log('=== UPDATE SUCCESS ===');
      console.log('Response:', response);
      console.log('======================');
      
      // Normalize the response back to frontend format
      const normalizedTask = {
        ...response,
        status: response.status ? response.status.toLowerCase() : 'todo',
        priority: response.priority ? response.priority.toLowerCase() : 'medium',
        category: response.category ? response.category.toLowerCase() : 'work'
      };
      
      return normalizedTask;
    } catch (error) {
      console.error('=== UPDATE ERROR ===');
      console.error('Task ID:', taskId, 'Type:', typeof taskId);
      console.error('Updates sent:', JSON.stringify(updates, null, 2));
      console.error('Error object:', error);
      
      if (error.response) {
        console.error('Error response details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          config: {
            method: error.config?.method,
            url: error.config?.url,
            data: error.config?.data
          }
        });
      }
      console.error('==================');
      
      // Fallback to localStorage
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const taskIndex = tasks.findIndex(t => t.id == taskId); // Use == for loose comparison
        
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
      // Real API call
      await apiClient.delete(`/tasks/${taskId}`);
      return { success: true };
    } catch (error) {
      console.error('Delete task error:', error);
      
      // Fallback to localStorage
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        return { success: true };
      }
      
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
      // Real API call
      const response = await apiClient.get(`/tasks/${taskId}`);
      return response;
    } catch (error) {
      console.error('Get task error:', error);
      
      // Fallback to localStorage
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          return task;
        }
      }
      
      throw new Error('Task not found');
    }
  }
};

export default taskService;