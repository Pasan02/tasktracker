import { createContext, useContext, useState, useEffect } from 'react'

const TaskContext = createContext()

export const useTask = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider')
  }
  return context
}

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (error) {
        console.error('Error parsing saved tasks:', error)
      }
    } else {
      // Initialize with mock data
      const mockTasks = [
        {
          id: 1,
          title: 'Prepare presentation slides',
          description: 'Finalize the quarterly report presentation for tomorrow\'s client meeting',
          status: 'todo',
          priority: 'high',
          category: 'work',
          dueDate: '2025-06-27',
          dueTime: '14:00',
          createdAt: new Date().toISOString(),
          completedAt: null
        },
        {
          id: 2,
          title: 'Review marketing materials',
          description: 'Check the new campaign materials for approval',
          status: 'in-progress',
          priority: 'medium',
          category: 'work',
          dueDate: '2025-06-28',
          dueTime: '11:00',
          createdAt: new Date().toISOString(),
          completedAt: null
        },
        {
          id: 3,
          title: 'Team meeting prep',
          description: 'Prepare agenda and materials for weekly team sync',
          status: 'todo',
          priority: 'low',
          category: 'work',
          dueDate: '2025-06-29',
          dueTime: '15:00',
          createdAt: new Date().toISOString(),
          completedAt: null
        }
      ]
      setTasks(mockTasks)
      localStorage.setItem('tasks', JSON.stringify(mockTasks))
    }
    setIsLoading(false)
  }, [])

  const saveTasks = (updatedTasks) => {
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
  }

  const addTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      status: 'todo',
      createdAt: new Date().toISOString(),
      completedAt: null
    }
    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
    return newTask
  }

  const updateTask = (taskId, updates) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, ...updates }
        if (updates.status === 'completed' && task.status !== 'completed') {
          updatedTask.completedAt = new Date().toISOString()
        } else if (updates.status !== 'completed' && task.status === 'completed') {
          updatedTask.completedAt = null
        }
        return updatedTask
      }
      return task
    })
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
  }

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId)
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
  }

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  const getTasksByDate = (date) => {
    return tasks.filter(task => task.dueDate === date)
  }

  const getTodaysTasks = () => {
    const today = new Date().toISOString().split('T')[0]
    return getTasksByDate(today)
  }

  const getUpcomingTasks = () => {
    const today = new Date()
    const upcoming = new Date()
    upcoming.setDate(today.getDate() + 7)
    
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate)
      return taskDate >= today && taskDate <= upcoming && task.status !== 'completed'
    })
  }

  const getCompletedTasksCount = () => {
    return tasks.filter(task => task.status === 'completed').length
  }

  const getTotalTasksCount = () => {
    return tasks.length
  }

  const value = {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    getTasksByStatus,
    getTasksByDate,
    getTodaysTasks,
    getUpcomingTasks,
    getCompletedTasksCount,
    getTotalTasksCount
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}
