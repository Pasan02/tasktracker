import { createContext, useContext, useState, useEffect } from 'react'
import taskService from '../services/taskService'

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
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true)
        const data = await taskService.getAllTasks()
        setTasks(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching tasks:', err)
        setError('Failed to load tasks')
        // Fallback to local storage if API fails
        const savedTasks = localStorage.getItem('tasks')
        if (savedTasks) {
          try {
            setTasks(JSON.parse(savedTasks))
          } catch (error) {
            console.error('Error parsing saved tasks:', error)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [])

  // Save to localStorage as backup
  const saveTasks = (updatedTasks) => {
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
  }

  const addTask = async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData)
      const updatedTasks = [...tasks, newTask]
      setTasks(updatedTasks)
      saveTasks(updatedTasks)
      return newTask
    } catch (error) {
      console.error('Error adding task:', error)
      setError('Failed to add task')
      throw error
    }
  }

  const updateTask = async (taskId, updates) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, updates)
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? updatedTask : task
      )
      setTasks(updatedTasks)
      saveTasks(updatedTasks)
      return updatedTask
    } catch (error) {
      console.error('Error updating task:', error)
      setError('Failed to update task')
      throw error
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId)
      const updatedTasks = tasks.filter(task => task.id !== taskId)
      setTasks(updatedTasks)
      saveTasks(updatedTasks)
    } catch (error) {
      console.error('Error deleting task:', error)
      setError('Failed to delete task')
      throw error
    }
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

  const value = {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    getTasksByStatus,
    getTasksByDate,
    getTodaysTasks,
    getUpcomingTasks,
    getCompletedTasksCount
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}
