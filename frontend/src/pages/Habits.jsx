import { useState } from 'react'
import { Plus, Minus, Play, Bell, MoreHorizontal, ChevronDown } from 'lucide-react'
import AddHabitModal from '../components/habits/AddHabitModal'
import { useHabit } from '../context/HabitContext'
import './Habits.css'

const Habits = () => {
  const { addHabit } = useHabit()
  const [activeTab, setActiveTab] = useState('all')
  const [timerMinutes, setTimerMinutes] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(30)
  const [selectedActivity, setSelectedActivity] = useState('Cardio dance')
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false)

  const tabs = [
    { id: 'all', label: 'All Goals', count: 12 },
    { id: 'progress', label: 'In Progress', count: 12 },
    { id: 'completed', label: 'Completed', count: 12 },
    { id: 'archived', label: 'Archived', count: 12 }
  ]

  const mockHabits = [
    { id: 1, title: 'Morning meditation', streak: 10, completed: true },
    { id: 2, title: 'Morning meditation', streak: 10, completed: false },
    { id: 3, title: 'Morning meditation', streak: 10, completed: false },
    { id: 4, title: 'Morning meditation', streak: 10, completed: false },
    { id: 5, title: 'Morning meditation', streak: 10, completed: false },
    { id: 6, title: 'Morning meditation', streak: 10, completed: false }
  ]

  const handleTimerIncrease = () => {
    if (timerSeconds < 59) {
      setTimerSeconds(timerSeconds + 1)
    } else {
      setTimerMinutes(timerMinutes + 1)
      setTimerSeconds(0)
    }
  }

  const handleTimerDecrease = () => {
    if (timerSeconds > 0) {
      setTimerSeconds(timerSeconds - 1)
    } else if (timerMinutes > 0) {
      setTimerMinutes(timerMinutes - 1)
      setTimerSeconds(59)
    }
  }

  const formatTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleAddHabit = (habitData) => {
    addHabit(habitData)
    setIsAddHabitModalOpen(false)
  }

  const handleOpenAddHabitModal = () => {
    setIsAddHabitModalOpen(true)
  }

  // Mock chart data for progress
  const chartData = [
    { month: 'Jan', value: 25 },
    { month: 'Feb', value: 45 },
    { month: 'Mar', value: 70 },
    { month: 'Apr', value: 45 },
    { month: 'May', value: 100 }
  ]

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
          Add Habit
        </button>
      </div>

      <div className="habits-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="habits-content">
        <div className="habits-left">
          <div className="habits-progress-card">
            <div className="card-header">
              <h2>Habits Progress</h2>
              <div className="header-actions">
                <span className="all-habits-link">All Habits</span>
                <button className="add-habit-btn" onClick={handleOpenAddHabitModal}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="progress-chart">
              <div className="chart-container">
                <svg width="100%" height="120" viewBox="0 0 300 120">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1DD1A1" />
                      <stop offset="100%" stopColor="#10AC84" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map(y => (
                    <line 
                      key={y} 
                      x1="40" 
                      y1={100 - y * 0.8} 
                      x2="280" 
                      y2={100 - y * 0.8} 
                      stroke="#f0f0f0" 
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Y-axis labels */}
                  {[0, 25, 50, 75, 100].map(y => (
                    <text 
                      key={y} 
                      x="30" 
                      y={105 - y * 0.8} 
                      fill="#999" 
                      fontSize="12" 
                      textAnchor="end"
                    >
                      {y}
                    </text>
                  ))}
                  
                  {/* Chart line */}
                  <path
                    d={`M 60 ${100 - chartData[0].value * 0.8} 
                        L 100 ${100 - chartData[1].value * 0.8} 
                        L 140 ${100 - chartData[2].value * 0.8}
                        L 180 ${100 - chartData[3].value * 0.8}
                        L 220 ${100 - chartData[4].value * 0.8}`}
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Chart points */}
                  {chartData.map((point, index) => (
                    <circle
                      key={index}
                      cx={60 + index * 40}
                      cy={100 - point.value * 0.8}
                      r="4"
                      fill="#1DD1A1"
                    />
                  ))}
                  
                  {/* X-axis labels */}
                  {chartData.map((point, index) => (
                    <text
                      key={index}
                      x={60 + index * 40}
                      y="115"
                      fill="#999"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      {point.month}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          <div className="daily-habits-card">
            <div className="card-header">
              <h2>Daily Habits</h2>
              <div className="header-actions">
                <span className="add-habits-link">Add Habits</span>
                <button className="add-habit-btn" onClick={handleOpenAddHabitModal}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="habits-list">
              {mockHabits.map(habit => (
                <div key={habit.id} className="habit-item">
                  <div className="habit-checkbox">
                    <input 
                      type="checkbox" 
                      checked={habit.completed}
                      onChange={() => {}}
                    />
                    <span className="checkmark"></span>
                  </div>
                  <div className="habit-content">
                    <span className={`habit-title ${habit.completed ? 'completed' : ''}`}>
                      {habit.title}
                    </span>
                  </div>
                  <div className="habit-streak">
                    <span className="streak-icon">🔥</span>
                    <span className="streak-text">{habit.streak} days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="habits-right">
          <div className="timer-card">
            <div className="card-header">
              <h2>Timer focus</h2>
              <div className="activity-dropdown">
                <button className="activity-selector">
                  {selectedActivity}
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            <div className="timer-display">
              <div className="timer-controls">
                <button className="timer-btn" onClick={handleTimerDecrease}>
                  <Minus size={20} />
                </button>
                <div className="timer-time">
                  {formatTime(timerMinutes, timerSeconds)}
                </div>
                <button className="timer-btn" onClick={handleTimerIncrease}>
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <button className="start-timer-btn">
              Start timer
            </button>
          </div>

          <div className="reminder-card">
            <div className="card-header">
              <h2>Reminder</h2>
              <button className="more-btn">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="reminder-content">
              <div className="reminder-icon">
                <Bell size={24} />
              </div>
              <p className="reminder-text">
                Don't forget to take your pills.<br />
                Stay healthy!
              </p>
            </div>
          </div>

          <div className="inspiration-card">
            <div className="card-content">
              <div className="inspiration-text">
                <h3>The nine habits to increase your energy</h3>
              </div>
              <div className="inspiration-image">
                <div className="energy-illustration">
                  <div className="energy-elements">
                    <div className="energy-item energy-book"></div>
                    <div className="energy-item energy-laptop"></div>
                    <div className="energy-item energy-plant"></div>
                    <div className="energy-item energy-coffee"></div>
                  </div>
                </div>
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
    </div>
  )
}

export default Habits
