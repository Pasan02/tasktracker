import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTask } from '../context/TaskContext'
import { useHabit } from '../context/HabitContext'
import { Plus, Check, Clock, Calendar as CalendarIcon, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { format, parseISO, isSameDay } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import AddTaskModal from '../components/tasks/AddTaskModal'
import AddHabitModal from '../components/habits/AddHabitModal'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { tasks, updateTask, addTask } = useTask()
  const { 
    habits, 
    getTodaysHabits, 
    markHabitComplete, 
    isHabitCompletedOnDate, 
    addHabit,
    getHabitStreak 
  } = useHabit()
  
  const [todaysTasks, setTodaysTasks] = useState([])
  const [todaysHabits, setTodaysHabits] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false)

  // Helper function to get today's tasks
  const getTodaysTasks = () => {
    const today = new Date()
    return tasks.filter(task => {
      if (!task.dueDate) return false
      try {
        const taskDate = parseISO(task.dueDate)
        return isSameDay(taskDate, today)
      } catch (error) {
        return false
      }
    }).slice(0, 4) // Limit to 4 tasks for dashboard display
  }

  // Helper function to get upcoming tasks (next 7 days, excluding today)
  const getUpcomingTasks = () => {
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)
    
    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false
      try {
        const taskDate = parseISO(task.dueDate)
        return taskDate > today && taskDate <= nextWeek
      } catch (error) {
        return false
      }
    }).slice(0, 6) // Limit to 6 upcoming tasks for calendar display
  }

  // Update data when tasks or habits change
  useEffect(() => {
    setTodaysTasks(getTodaysTasks())
    setUpcomingTasks(getUpcomingTasks())
    
    // Get today's habits (limit to 4 for dashboard)
    const habitsToday = getTodaysHabits()
    setTodaysHabits(habitsToday.slice(0, 4))
  }, [tasks, habits])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  // Calculate real stats
  const today = new Date().toISOString().split('T')[0]
  const completedTasksToday = todaysTasks.filter(task => task.status === 'completed').length
  const completedHabitsToday = todaysHabits.filter(habit => 
    isHabitCompletedOnDate(habit.id, today)
  ).length

  // Event handlers
  const handleTaskComplete = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'todo' : 'completed'
      await updateTask(taskId, { status: newStatus })
      setTodaysTasks(getTodaysTasks())
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleHabitComplete = async (habitId) => {
    try {
      await markHabitComplete(habitId)
      // Refresh the habits display
      const habitsToday = getTodaysHabits()
      setTodaysHabits(habitsToday.slice(0, 4))
    } catch (error) {
      console.error('Error toggling habit:', error)
    }
  }

  const handleAddTask = (taskData) => {
    addTask(taskData)
    setTodaysTasks(getTodaysTasks())
    setUpcomingTasks(getUpcomingTasks())
  }

  const handleAddHabit = (habitData) => {
    addHabit(habitData)
    const habitsToday = getTodaysHabits()
    setTodaysHabits(habitsToday.slice(0, 4))
  }

  const openAddTaskModal = () => {
    setIsAddTaskModalOpen(true)
  }

  const closeAddTaskModal = () => {
    setIsAddTaskModalOpen(false)
  }

  const openAddHabitModal = () => {
    setIsAddHabitModalOpen(true)
  }

  const closeAddHabitModal = () => {
    setIsAddHabitModalOpen(false)
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#EF4444'
      case 'medium': return '#F59E0B'
      case 'low': return '#10B981'
      default: return '#94A3B8'
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    try {
      const [hours, minutes] = timeString.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    } catch (error) {
      return timeString
    }
  }

  const getCategoryColor = (category) => {
    const categoryColors = {
      work: '#3B82F6',
      personal: '#8B5CF6',
      health: '#10B981',
      learning: '#F59E0B',
      shopping: '#06B6D4',
      finance: '#EF4444',
      other: '#6B7280'
    }
    return categoryColors[category?.toLowerCase()] || categoryColors.other
  }

  // Get user's display name
  const getUserDisplayName = () => {
    if (user?.firstName) {
      return user.firstName
    }
    return 'User'
  }

  // Get user's location
  const getUserLocation = () => {
    if (user?.location) {
      return user.location
    }
    return 'Your Location'
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="greeting-section">
          <h1 className="greeting">{getGreeting()}, {getUserDisplayName()}!</h1>
          <p className="date-info">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
        </div>
        <div className="location-info">
          <span>📍 {getUserLocation()}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-left">
          {/* Today's Tasks Section - Real Data */}
          <div className="tasks-section">
            <div className="section-header">
              <h2>Today's Tasks ({completedTasksToday}/{todaysTasks.length})</h2>
            </div>
            
            <div className="tasks-card">
              <div className="tasks-list">
                {todaysTasks.length === 0 ? (
                  <div className="empty-state">
                    <p>No tasks for today</p>
                    <button onClick={openAddTaskModal} className="add-task-link">
                      Add your first task
                    </button>
                  </div>
                ) : (
                  todaysTasks.map(task => (
                    <div key={task.id} className="task-item">
                      <button 
                        className={`task-checkbox ${task.status === 'completed' ? 'completed' : ''}`}
                        onClick={() => handleTaskComplete(task.id, task.status)}
                      >
                        {task.status === 'completed' ? (
                          <Check size={14} />
                        ) : (
                          <div></div>
                        )}
                      </button>
                      <div className="task-content">
                        <p className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}>
                          {task.title}
                        </p>
                        {task.dueTime && (
                          <span className="task-time">{formatTime(task.dueTime)}</span>
                        )}
                      </div>
                      <div 
                        className={`task-priority ${task.priority}`}
                        style={{ 
                          backgroundColor: getPriorityColor(task.priority) + '20',
                          color: getPriorityColor(task.priority)
                        }}
                      >
                        {task.priority}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button className="add-task-btn floating-add-btn" onClick={openAddTaskModal}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Today's Habits Section - Real Data */}
          <div className="habits-section">
            <div className="section-header">
              <h2>Today's Habits ({completedHabitsToday}/{todaysHabits.length})</h2>
            </div>
            
            <div className="habits-card">
              <div className="habits-list">
                {todaysHabits.length === 0 ? (
                  <div className="empty-state">
                    <p>No habits for today</p>
                    <button onClick={openAddHabitModal} className="add-habit-link">
                      Add your first habit
                    </button>
                  </div>
                ) : (
                  todaysHabits.map(habit => {
                    const today = new Date().toISOString().split('T')[0]
                    const isCompleted = isHabitCompletedOnDate(habit.id, today)
                    const streak = getHabitStreak(habit.id)
                    
                    return (
                      <div key={habit.id} className="habit-item">
                        <button 
                          className={`habit-checkbox ${isCompleted ? 'completed' : ''}`}
                          onClick={() => handleHabitComplete(habit.id)}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={14} className="completed-icon" />
                          ) : (
                            <Circle size={14} className="pending-icon" />
                          )}
                        </button>
                        <div className="habit-content">
                          <p className={`habit-title ${isCompleted ? 'completed' : ''}`}>
                            {habit.title}
                          </p>
                        </div>
                        <div className="habit-streak">
                          <span className="streak-icon">🔥</span>
                          <span className="streak-text">{streak} days</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <button className="add-habit-btn floating-add-btn" onClick={openAddHabitModal}>
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Section - Real Upcoming Tasks */}
        <div className="dashboard-right">
          {/* Add a section header to align with Today's Tasks */}
          <div className="section-header">
            <h2>Upcoming Schedule</h2>
          </div>

          <div className="calendar-section">
            {/* Keep only controls inside the card */}
            <div className="calendar-controls">
              <div className="calendar-date">
                <CalendarIcon size={16} />
                <span>{format(new Date(), 'dd MMM')}</span>
              </div>
              <button className="calendar-menu" onClick={() => navigate('/calendar')}>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="calendar-events">
              {upcomingTasks.length === 0 ? (
                <div className="empty-events">
                  <p>No upcoming tasks</p>
                  <button onClick={() => navigate('/calendar')}>View Calendar</button>
                </div>
              ) : (
                upcomingTasks.map(task => (
                  <div key={task.id} className="calendar-event">
                    <div className="event-time">
                      {task.dueTime ? formatTime(task.dueTime) : 'All Day'}
                    </div>
                    <div className="event-content">
                      <div 
                        className="event-indicator"
                        style={{ backgroundColor: getCategoryColor(task.category) }}
                      ></div>
                      <div className="event-details">
                        <p className="event-category">{task.category}</p>
                        <p className="event-title">{task.title}</p>
                      </div>
                    </div>
                    <button 
                      className="event-menu"
                      onClick={() => navigate('/tasks')}
                    >
                      →
                    </button>
                  </div>
                ))
              )}
              
              {upcomingTasks.length > 0 && (
                <div className="view-all-calendar">
                  <button onClick={() => navigate('/calendar')}>
                    View All in Calendar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        onAddTask={handleAddTask}
      />
      <AddHabitModal
        isOpen={isAddHabitModalOpen}
        onClose={closeAddHabitModal}
        onAddHabit={handleAddHabit}
      />
    </div>
  )
}

export default Dashboard
