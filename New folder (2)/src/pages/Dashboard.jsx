import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTask } from '../context/TaskContext'
import { useHabit } from '../context/HabitContext'
import { Plus, Check, Clock, Calendar as CalendarIcon, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import AddTaskModal from '../components/tasks/AddTaskModal'
import AddHabitModal from '../components/habits/AddHabitModal'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const { tasks, getTodaysTasks, getUpcomingTasks, updateTask, addTask } = useTask()
  const { habits, getTodaysHabits, markHabitComplete, isHabitCompletedOnDate, addHabit } = useHabit()
  
  const [todaysTasks, setTodaysTasks] = useState([])
  const [todaysHabits, setTodaysHabits] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false)

  useEffect(() => {
    setTodaysTasks(getTodaysTasks())
    setTodaysHabits(getTodaysHabits())
    setUpcomingTasks(getUpcomingTasks())
  }, [tasks, habits])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const today = new Date().toISOString().split('T')[0]
  const completedTasksToday = todaysTasks.filter(task => task.status === 'completed').length
  const completedHabitsToday = todaysHabits.filter(habit => 
    isHabitCompletedOnDate(habit.id, today)
  ).length

  const handleTaskComplete = (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'todo' : 'completed'
    updateTask(taskId, { status: newStatus })
    setTodaysTasks(getTodaysTasks())
  }

  const handleHabitComplete = (habitId) => {
    markHabitComplete(habitId)
    setTodaysHabits(getTodaysHabits())
  }

  const handleAddTask = (taskData) => {
    addTask(taskData)
    setTodaysTasks(getTodaysTasks())
    setUpcomingTasks(getUpcomingTasks())
  }

  const handleAddHabit = (habitData) => {
    addHabit(habitData)
    setTodaysHabits(getTodaysHabits())
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
    switch (priority) {
      case 'high': return 'var(--red)'
      case 'medium': return 'var(--orange)'
      case 'low': return 'var(--yellow)'
      default: return 'var(--gray-400)'
    }
  }

  const mockCalendarEvents = [
    {
      time: '09:00',
      title: 'Marketing',
      subtitle: '5 posts on Instagram',
      category: 'marketing',
      color: 'var(--red)'
    },
    {
      time: '11:00',
      title: 'Animation',
      subtitle: 'Platform Concept',
      category: 'animation',
      color: 'var(--purple)'
    },
    {
      time: '15:00',
      title: 'Animation',
      subtitle: 'Create Post For App',
      category: 'animation',
      color: 'var(--primary-teal)'
    },
    {
      time: '08:00',
      title: 'Marketing',
      subtitle: '2 posts on Instagram',
      category: 'marketing',
      color: 'var(--red)'
    },
    {
      time: '10:00',
      title: 'Animation',
      subtitle: 'Platform App Concept',
      category: 'animation',
      color: 'var(--purple)'
    }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="greeting-section">
          <h1 className="greeting">{getGreeting()} John</h1>
          <p className="date-info">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
        </div>
        <div className="location-info">
          <span>📍 Islamabad, Pakistan</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-left">
          <div className="tasks-section">
            <div className="section-header">
              <h2>Today's Tasks</h2>
            </div>
            
            <div className="tasks-card">
              <div className="tasks-list">
                <div className="task-item">
                  <button className="task-checkbox completed">
                    <Check size={14} />
                  </button>
                  <div className="task-content">
                    <p className="task-title completed">Prepare presentation slides</p>
                  </div>
                  <div className="task-priority high">High</div>
                  <button className="task-delete">🗑️</button>
                </div>

                <div className="task-item">
                  <button className="task-checkbox completed">
                    <Check size={14} />
                  </button>
                  <div className="task-content">
                    <p className="task-title completed">Prepare presentation slides</p>
                  </div>
                  <div className="task-priority medium">Medium</div>
                  <button className="task-delete">🗑️</button>
                </div>

                <div className="task-item">
                  <button className="task-checkbox">
                  </button>
                  <div className="task-content">
                    <p className="task-title">Prepare presentation slides</p>
                  </div>
                  <div className="task-priority low">Low</div>
                  <button className="task-delete">🗑️</button>
                </div>

                <div className="task-item">
                  <button className="task-checkbox">
                  </button>
                  <div className="task-content">
                    <p className="task-title">Prepare presentation slides</p>
                  </div>
                  <div className="task-priority low">Low</div>
                  <button className="task-delete">🗑️</button>
                </div>
              </div>
              
              <button className="add-task-btn" onClick={openAddTaskModal}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="habits-section">
            <div className="section-header">
              <h2>Daily Habits</h2>
            </div>
            
            <div className="habits-card">
              <div className="habits-list">
                <div className="habit-item">
                  <button className="habit-checkbox completed">
                    <Check size={14} />
                  </button>
                  <div className="habit-content">
                    <p className="habit-title completed">Morning meditation</p>
                  </div>
                  <div className="habit-streak">
                    <span className="streak-icon">🔥</span>
                    <span className="streak-text">10 days</span>
                  </div>
                </div>

                <div className="habit-item">
                  <button className="habit-checkbox">
                  </button>
                  <div className="habit-content">
                    <p className="habit-title">Write my journal</p>
                  </div>
                  <div className="habit-streak">
                    <span className="streak-icon">🔥</span>
                    <span className="streak-text">5 days</span>
                  </div>
                </div>

                <div className="habit-item">
                  <button className="habit-checkbox">
                  </button>
                  <div className="habit-content">
                    <p className="habit-title">Write my journal</p>
                  </div>
                  <div className="habit-streak">
                    <span className="streak-icon">🔥</span>
                    <span className="streak-text">8 days</span>
                  </div>
                </div>

                <div className="habit-item">
                  <button className="habit-checkbox">
                  </button>
                  <div className="habit-content">
                    <p className="habit-title">Write my journal</p>
                  </div>
                  <div className="habit-streak">
                    <span className="streak-icon">🔥</span>
                    <span className="streak-text">5 days</span>
                  </div>
                </div>
              </div>
              
              <button className="add-habit-btn" onClick={openAddHabitModal}>
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-right">
          <div className="calendar-section">
            <div className="calendar-header">
              <h3>Calendar</h3>
              <div className="calendar-controls">
                <div className="calendar-date">
                  <CalendarIcon size={16} />
                  <span>15 October</span>
                </div>
                <button className="calendar-menu">⋯</button>
              </div>
            </div>

            <div className="calendar-events">
              <div className="calendar-event">
                <div className="event-time">09:00</div>
                <div className="event-content">
                  <div className="event-indicator marketing"></div>
                  <div className="event-details">
                    <p className="event-category">Marketing</p>
                    <p className="event-title">5 posts on Instagram</p>
                  </div>
                </div>
                <button className="event-menu">⋯</button>
              </div>

              <div className="calendar-event">
                <div className="event-time">11:00</div>
                <div className="event-content">
                  <div className="event-indicator animation"></div>
                  <div className="event-details">
                    <p className="event-category">Animation</p>
                    <p className="event-title">Platform Concept</p>
                  </div>
                </div>
                <button className="event-menu">⋯</button>
              </div>

              <div className="event-date-separator">16 October</div>

              <div className="calendar-event">
                <div className="event-time">09:00</div>
                <div className="event-content">
                  <div className="event-indicator design"></div>
                  <div className="event-details">
                    <p className="event-category">Design</p>
                    <p className="event-title">Sleep App</p>
                  </div>
                </div>
                <button className="event-menu">⋯</button>
              </div>

              <div className="calendar-event">
                <div className="event-time">15:00</div>
                <div className="event-content">
                  <div className="event-indicator animation"></div>
                  <div className="event-details">
                    <p className="event-category">Animation</p>
                    <p className="event-title">Create Post For App</p>
                  </div>
                </div>
                <button className="event-menu">⋯</button>
              </div>

              <div className="event-date-separator">17 October</div>

              <div className="calendar-event">
                <div className="event-time">09:00</div>
                <div className="event-content">
                  <div className="event-indicator marketing"></div>
                  <div className="event-details">
                    <p className="event-category">Marketing</p>
                    <p className="event-title">2 posts on Instagram</p>
                  </div>
                </div>
                <button className="event-menu">⋯</button>
              </div>

              <div className="calendar-event">
                <div className="event-time">10:00</div>
                <div className="event-content">
                  <div className="event-indicator animation"></div>
                  <div className="event-details">
                    <p className="event-category">Animation</p>
                    <p className="event-title">Platform App Concept</p>
                  </div>
                </div>
                <button className="event-menu">⋯</button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
