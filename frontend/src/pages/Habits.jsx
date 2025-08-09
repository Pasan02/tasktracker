import { useState, useEffect } from 'react'
import { Plus, Minus, Play, Bell, MoreHorizontal, Target, TrendingUp, Calendar, CheckCircle2, Circle } from 'lucide-react'
import AddHabitModal from '../components/habits/AddHabitModal'
import EditHabitModal from '../components/habits/EditHabitModal'
import HabitOptionsModal from '../components/habits/HabitOptionsModal'
import { useHabit } from '../context/HabitContext'
import { useNotification } from '../context/NotificationContext'
import './Habits.css'

const Habits = () => {
  const { 
    habits, 
    habitCompletions, 
    addHabit, 
    markHabitComplete, 
    isHabitCompletedOnDate, 
    getHabitStreak,
    getTodaysHabits,
    isLoading,
    error,
    updateHabit,
    deleteHabit
  } = useHabit()
  
  const { addNotification } = useNotification()
  
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerMode, setTimerMode] = useState('focus')
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState('Cardio dance')
  const [timerInterval, setTimerInterval] = useState(null)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false)
  const [isEditHabitModalOpen, setIsEditHabitModalOpen] = useState(false)
  const [selectedHabitForEdit, setSelectedHabitForEdit] = useState(null)
  const [habitOptionsModal, setHabitOptionsModal] = useState({
    isOpen: false,
    habit: null,
    position: { top: 0, left: 0 }
  })

  // Format time for timer display
  const formatTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Get habit completion rate
  const getHabitCompletionRate = (habitId) => {
    const habit = habits.find(h => h.id == habitId)
    if (!habit) return 0
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    let scheduledDays = 0
    let completedDays = 0
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date()
      checkDate.setDate(checkDate.getDate() - i)
      const dayOfWeek = checkDate.getDay()
      const dateString = checkDate.toISOString().split('T')[0]
      
      if (!habit.targetDays || habit.targetDays.length === 0 || habit.targetDays.includes(dayOfWeek)) {
        scheduledDays++
        
        if (isHabitCompletedOnDate(habitId, dateString)) {
          completedDays++
        }
      }
    }
    
    return scheduledDays > 0 ? Math.round((completedDays / scheduledDays) * 100) : 0
  }

  // Helper function to check if habit is scheduled for today
  function isHabitScheduledForToday(habit) {
    const todayDayOfWeek = new Date().getDay()
    
    if (!habit.targetDays || habit.targetDays.length === 0) {
      return true
    }
    
    return habit.targetDays.includes(todayDayOfWeek)
  }

  // Get category icon and color
  const getCategoryInfo = (category) => {
    const categoryMap = {
      health: { icon: '💚', color: '#10B981', label: 'Health' },
      learning: { icon: '📚', color: '#3B82F6', label: 'Learning' },
      work: { icon: '💼', color: '#8B5CF6', label: 'Work' },
      personal: { icon: '⭐', color: '#F59E0B', label: 'Personal' },
      social: { icon: '👥', color: '#EF4444', label: 'Social' },
      other: { icon: '🎯', color: '#6B7280', label: 'Other' }
    }
    
    return categoryMap[category] || categoryMap.other
  }

  // Calculate goal progress
  const getGoalProgress = () => {
    const activeHabits = habits.filter(h => h.isActive)
    const today = new Date().toISOString().split('T')[0]
    
    // Weekly goal (current week)
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    
    let weeklyCompletions = 0
    let weeklyTarget = 0
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const dateString = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()
      
      activeHabits.forEach(habit => {
        if (!habit.targetDays || habit.targetDays.length === 0 || habit.targetDays.includes(dayOfWeek)) {
          weeklyTarget++
          if (isHabitCompletedOnDate(habit.id, dateString)) {
            weeklyCompletions++
          }
        }
      })
    }
    
    // Monthly goal (current month)
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    
    let monthlyCompletions = 0
    let monthlyTarget = 0
    
    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0]
      const dayOfWeek = d.getDay()
      
      activeHabits.forEach(habit => {
        if (!habit.targetDays || habit.targetDays.length === 0 || habit.targetDays.includes(dayOfWeek)) {
          monthlyTarget++
          if (isHabitCompletedOnDate(habit.id, dateString)) {
            monthlyCompletions++
          }
        }
      })
    }
    
    // Today's goal
    const todaysScheduled = activeHabits.filter(isHabitScheduledForToday)
    const todaysCompleted = todaysScheduled.filter(habit => 
      isHabitCompletedOnDate(habit.id, today)
    )
    
    return {
      today: {
        completed: todaysCompleted.length,
        total: todaysScheduled.length,
        percentage: todaysScheduled.length > 0 ? Math.round((todaysCompleted.length / todaysScheduled.length) * 100) : 0
      },
      week: {
        completed: weeklyCompletions,
        total: weeklyTarget,
        percentage: weeklyTarget > 0 ? Math.round((weeklyCompletions / weeklyTarget) * 100) : 0
      },
      month: {
        completed: monthlyCompletions,
        total: monthlyTarget,
        percentage: monthlyTarget > 0 ? Math.round((monthlyCompletions / monthlyTarget) * 100) : 0
      }
    }
  }

  const todaysHabits = getTodaysHabits()
  const activeHabits = habits.filter(habit => habit.isActive)
  const goalProgress = getGoalProgress()

  // Timer modes configuration
  const timerModes = {
    focus: { minutes: 25, label: 'Focus Time' },
    'short-break': { minutes: 5, label: 'Short Break' },
    'long-break': { minutes: 15, label: 'Long Break' }
  }

  // Timer effect for countdown
  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1)
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1)
          setTimerSeconds(59)
        } else {
          setIsTimerRunning(false)
          handleTimerComplete()
        }
      }, 1000)
      
      setTimerInterval(interval)
      return () => clearInterval(interval)
    } else {
      if (timerInterval) {
        clearInterval(timerInterval)
        setTimerInterval(null)
      }
    }
  }, [isTimerRunning, timerMinutes, timerSeconds])

  // Handle timer completion
  const handleTimerComplete = () => {
    if ('Notification' in window) {
      new Notification('Timer Complete!', {
        body: `${timerModes[timerMode].label} session finished`,
        icon: '/favicon.ico'
      })
    }

    // In-app notification
    addNotification({
      title: 'Timer complete',
      description: `${timerModes[timerMode].label} session finished`,
      type: 'success'
    })

    if (timerMode === 'focus') {
      setCompletedPomodoros(prev => prev + 1)
      const nextMode = completedPomodoros % 4 === 3 ? 'long-break' : 'short-break'
      setTimerMode(nextMode)
      setTimerMinutes(timerModes[nextMode].minutes)
      setTimerSeconds(0)
    } else {
      setTimerMode('focus')
      setTimerMinutes(timerModes.focus.minutes)
      setTimerSeconds(0)
    }
  }

  // Timer control functions
  const handleStartTimer = () => {
    if (timerMinutes === 0 && timerSeconds === 0) {
      setTimerMinutes(timerModes[timerMode].minutes)
      setTimerSeconds(0)
    }
    setIsTimerRunning(true)
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const handlePauseTimer = () => {
    setIsTimerRunning(false)
  }

  const handleResetTimer = () => {
    setIsTimerRunning(false)
    setTimerMinutes(timerModes[timerMode].minutes)
    setTimerSeconds(0)
  }

  const handleTimerModeChange = (mode) => {
    setTimerMode(mode)
    setTimerMinutes(timerModes[mode].minutes)
    setTimerSeconds(0)
    setIsTimerRunning(false)
  }

  const handleTimerIncrease = () => {
    if (!isTimerRunning) {
      if (timerSeconds < 59) {
        setTimerSeconds(timerSeconds + 1)
      } else {
        setTimerMinutes(timerMinutes + 1)
        setTimerSeconds(0)
      }
    }
  }

  const handleTimerDecrease = () => {
    if (!isTimerRunning) {
      if (timerSeconds > 0) {
        setTimerSeconds(timerSeconds - 1)
      } else if (timerMinutes > 0) {
        setTimerMinutes(timerMinutes - 1)
        setTimerSeconds(59)
      }
    }
  }

  const handleAddHabit = (habitData) => {
    addHabit(habitData)
    setIsAddHabitModalOpen(false)
  }

  const handleOpenAddHabitModal = () => {
    setIsAddHabitModalOpen(true)
  }

  const handleHabitToggle = async (habitId) => {
    try {
      await markHabitComplete(habitId)
    } catch (error) {
      console.error('Error toggling habit completion:', error)
    }
  }

  const handleEditHabit = (habit) => {
    setSelectedHabitForEdit(habit)
    setIsEditHabitModalOpen(true)
  }

  const handleUpdateHabit = async (habitId, updates) => {
    try {
      await updateHabit(habitId, updates)
      setIsEditHabitModalOpen(false)
      setSelectedHabitForEdit(null)
    } catch (error) {
      console.error('Error updating habit:', error)
    }
  }

  const handleDeleteHabit = async (habitId) => {
    try {
      await deleteHabit(habitId)
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }

  const handleArchiveHabit = async (habitId) => {
    try {
      const habit = habits.find(h => h.id === habitId)
      await updateHabit(habitId, { isActive: !habit.isActive })
    } catch (error) {
      console.error('Error archiving habit:', error)
    }
  }

  const handleHabitMenuClick = (e, habit) => {
    e.stopPropagation()
    const rect = e.target.getBoundingClientRect()
    setHabitOptionsModal({
      isOpen: true,
      habit,
      position: {
        top: rect.bottom + 8,
        left: rect.left - 120
      }
    })
  }

  const closeHabitOptionsModal = () => {
    setHabitOptionsModal({
      isOpen: false,
      habit: null,
      position: { top: 0, left: 0 }
    })
  }

  if (isLoading) {
    return (
      <div className="habits-page">
        <div className="loading-state">
          <p>Loading habits...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="habits-page">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="habits-page">
      <div className="habits-header">
        <div className="header-left">
          <h1 className="page-title">Goals & Habits</h1>
        </div>
        <button 
          className="add-habit-button"
          onClick={handleOpenAddHabitModal}
        >
          <Plus size={20} />
          Add New Habit
        </button>
      </div>

      <div className="habits-content">
        <div className="habits-left">
          {/* Goal Tracking Cards */}
          <div className="goal-tracking-section">
            <div className="goal-card today-goal">
              <div className="goal-header">
                <div className="goal-info">
                  <Target size={20} className="goal-icon" />
                  <h3>Today's Goal</h3>
                </div>
                <span className="goal-percentage">{goalProgress.today.percentage}%</span>
              </div>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${goalProgress.today.percentage}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {goalProgress.today.completed} of {goalProgress.today.total} habits completed
                </span>
              </div>
            </div>

            <div className="goal-card week-goal">
              <div className="goal-header">
                <div className="goal-info">
                  <Calendar size={20} className="goal-icon" />
                  <h3>This Week</h3>
                </div>
                <span className="goal-percentage">{goalProgress.week.percentage}%</span>
              </div>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill week" 
                    style={{ width: `${goalProgress.week.percentage}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {goalProgress.week.completed} of {goalProgress.week.total} completions
                </span>
              </div>
            </div>

            <div className="goal-card month-goal">
              <div className="goal-header">
                <div className="goal-info">
                  <TrendingUp size={20} className="goal-icon" />
                  <h3>This Month</h3>
                </div>
                <span className="goal-percentage">{goalProgress.month.percentage}%</span>
              </div>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill month" 
                    style={{ width: `${goalProgress.month.percentage}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {goalProgress.month.completed} of {goalProgress.month.total} completions
                </span>
              </div>
            </div>
          </div>

          {/* Today's Habits */}
          <div className="daily-habits-card">
            <div className="card-header">
              <h2>Today's Habits</h2>
              <div className="header-actions">
                <span className="habit-count">
                  {goalProgress.today.completed} / {goalProgress.today.total} completed
                </span>
              </div>
            </div>

            <div className="habits-list">
              {todaysHabits.length === 0 ? (
                <div className="empty-habits">
                  <p>No habits scheduled for today</p>
                  <button className="add-habit-btn-empty" onClick={handleOpenAddHabitModal}>
                    <Plus size={16} />
                    Add Your First Habit
                  </button>
                </div>
              ) : (
                todaysHabits.map(habit => {
                  const today = new Date().toISOString().split('T')[0]
                  const isCompleted = isHabitCompletedOnDate(habit.id, today)
                  const streak = getHabitStreak(habit.id)
                  const categoryInfo = getCategoryInfo(habit.category)
                  
                  return (
                    <div key={habit.id} className="habit-item">
                      <button 
                        className="habit-checkbox"
                        onClick={() => handleHabitToggle(habit.id)}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={20} className="completed-icon" />
                        ) : (
                          <Circle size={20} className="pending-icon" />
                        )}
                      </button>
                      
                      <div className="habit-content">
                        <div className="habit-title-row">
                          <span className={`habit-title ${isCompleted ? 'completed' : ''}`}>
                            {habit.title}
                          </span>
                          <div className="category-indicator" style={{ background: categoryInfo.color }}>
                            <span className="category-icon">{categoryInfo.icon}</span>
                            <span className="category-label">{categoryInfo.label}</span>
                          </div>
                        </div>
                        {habit.description && (
                          <p className="habit-description">{habit.description}</p>
                        )}
                        <div className="habit-meta">
                          <span className="frequency-badge">{habit.frequency}</span>
                        </div>
                      </div>
                      
                      <div className="habit-streak">
                        <span className="streak-icon">🔥</span>
                        <span className="streak-text">{streak} days</span>
                      </div>
                      
                      <button 
                        className="habit-menu"
                        onClick={(e) => handleHabitMenuClick(e, habit)}
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* All Active Habits */}
          <div className="all-habits-card">
            <div className="card-header">
              <h2>All Active Habits</h2>
              <div className="header-actions">
                <span className="habit-count-text">{activeHabits.length} active habits</span>
                <button className="add-habit-btn-header" onClick={handleOpenAddHabitModal}>
                  <Plus size={16} />
                  Add Habit
                </button>
              </div>
            </div>

            <div className="habits-list">
              {activeHabits.length === 0 ? (
                <div className="empty-habits">
                  <p>No active habits yet. Create your first habit to get started!</p>
                  <button className="add-habit-btn-empty" onClick={handleOpenAddHabitModal}>
                    <Plus size={16} />
                    Create Your First Habit
                  </button>
                </div>
              ) : (
                activeHabits.map(habit => {
                  const today = new Date().toISOString().split('T')[0]
                  const isCompleted = isHabitCompletedOnDate(habit.id, today)
                  const streak = getHabitStreak(habit.id)
                  const isScheduledToday = isHabitScheduledForToday(habit)
                  const completionRate = getHabitCompletionRate(habit.id)
                  const categoryInfo = getCategoryInfo(habit.category)
                  
                  return (
                    <div key={habit.id} className={`habit-item ${!isScheduledToday ? 'not-scheduled' : ''}`}>
                      <button 
                        className="habit-checkbox"
                        onClick={() => handleHabitToggle(habit.id)}
                        disabled={!isScheduledToday}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={20} className="completed-icon" />
                        ) : (
                          <Circle size={20} className={isScheduledToday ? "pending-icon" : "disabled-icon"} />
                        )}
                      </button>
                      
                      <div className="habit-content">
                        <div className="habit-title-row">
                          <span className={`habit-title ${isCompleted ? 'completed' : ''}`}>
                            {habit.title}
                          </span>
                          <div className="category-indicator" style={{ background: categoryInfo.color }}>
                            <span className="category-icon">{categoryInfo.icon}</span>
                            <span className="category-label">{categoryInfo.label}</span>
                          </div>
                        </div>
                        {habit.description && (
                          <p className="habit-description">{habit.description}</p>
                        )}
                        <div className="habit-meta">
                          <span className="frequency-badge">{habit.frequency}</span>
                          {!isScheduledToday && (
                            <span className="not-scheduled-badge">Not today</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="habit-stats">
                        <div className="habit-streak">
                          <span className="streak-icon">🔥</span>
                          <span className="streak-text">{streak} days</span>
                        </div>
                      </div>
                      
                      <button 
                        className="habit-menu"
                        onClick={(e) => handleHabitMenuClick(e, habit)}
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="habits-right">
          {/* Keep existing timer and insights cards exactly as they were */}
          <div className="timer-card">
            <div className="card-header">
              <h2>Focus Timer</h2>
              <div className="timer-mode-selector">
                {Object.entries(timerModes).map(([mode, config]) => (
                  <button
                    key={mode}
                    className={`mode-btn ${timerMode === mode ? 'active' : ''}`}
                    onClick={() => handleTimerModeChange(mode)}
                    disabled={isTimerRunning}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="timer-display">
              <div className="timer-progress">
                <div className="timer-circle">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="var(--border-light)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="var(--primary-teal)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - ((timerMinutes * 60 + timerSeconds) / (timerModes[timerMode].minutes * 60)))}`}
                      transform="rotate(-90 60 60)"
                      className="timer-progress-circle"
                    />
                  </svg>
                  <div className="timer-time">
                    {formatTime(timerMinutes, timerSeconds)}
                  </div>
                </div>
              </div>
              
              <div className="timer-controls">
                <button 
                  className="timer-btn secondary" 
                  onClick={handleTimerDecrease}
                  disabled={isTimerRunning}
                >
                  <Minus size={20} />
                </button>
                
                <div className="timer-main-controls">
                  {!isTimerRunning ? (
                    <button className="start-timer-btn" onClick={handleStartTimer}>
                      <Play size={16} />
                      Start
                    </button>
                  ) : (
                    <button className="pause-timer-btn" onClick={handlePauseTimer}>
                      <Bell size={16} />
                      Pause
                    </button>
                  )}
                  
                  <button className="reset-timer-btn" onClick={handleResetTimer}>
                    Reset
                  </button>
                </div>
                
                <button 
                  className="timer-btn secondary" 
                  onClick={handleTimerIncrease}
                  disabled={isTimerRunning}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="timer-stats">
              <div className="stat-item">
                <span className="stat-number">{completedPomodoros}</span>
                <span className="stat-label">Sessions Today</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{Math.floor(completedPomodoros * 25 / 60)}h {(completedPomodoros * 25) % 60}m</span>
                <span className="stat-label">Focus Time</span>
              </div>
            </div>

            <div className="activity-selection">
              <label className="form-label">Current Activity</label>
              <select 
                value={selectedActivity} 
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="activity-select"
              >
                <option value="Cardio dance">Cardio Dance</option>
                <option value="Reading">Reading</option>
                <option value="Coding">Coding</option>
                <option value="Writing">Writing</option>
                <option value="Study">Study</option>
                <option value="Work">Work</option>
                <option value="Exercise">Exercise</option>
              </select>
            </div>
          </div>

          <div className="inspiration-card">
            <div className="card-content">
              <div className="inspiration-text">
                <h3>Building Better Habits</h3>
                <p>Consistency is key to forming lasting habits. Keep going!</p>
              </div>
              <button className="learn-more-btn">
                Learn more
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddHabitModal
        isOpen={isAddHabitModalOpen}
        onClose={() => setIsAddHabitModalOpen(false)}
        onAddHabit={handleAddHabit}
      />

      <EditHabitModal
        isOpen={isEditHabitModalOpen}
        onClose={() => {
          setIsEditHabitModalOpen(false)
          setSelectedHabitForEdit(null)
        }}
        onUpdateHabit={handleUpdateHabit}
        habit={selectedHabitForEdit}
      />

      <HabitOptionsModal
        isOpen={habitOptionsModal.isOpen}
        onClose={closeHabitOptionsModal}
        onEdit={handleEditHabit}
        onDelete={handleDeleteHabit}
        onArchive={handleArchiveHabit}
        habit={habitOptionsModal.habit}
        position={habitOptionsModal.position}
      />
    </div>
  )
}

export default Habits
