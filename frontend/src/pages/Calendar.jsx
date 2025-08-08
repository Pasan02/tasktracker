import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTask } from '../context/TaskContext'
import { useHabit } from '../context/HabitContext'
import { format, isSameDay, parseISO } from 'date-fns'
import DateModal from '../components/calendar/DateModal'
import './Calendar.css'

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const { tasks } = useTask()
  const { habits, isHabitCompletedOnDate } = useHabit()
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Generate calendar tasks with proper sorting
  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      try {
        const taskDate = parseISO(task.dueDate)
        return isSameDay(taskDate, date)
      } catch (error) {
        return false
      }
    }).sort((a, b) => {
      // Sort by priority (high first) and then by time
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority] || 1
      const bPriority = priorityOrder[b.priority] || 1
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      if (a.dueTime && b.dueTime) {
        return a.dueTime.localeCompare(b.dueTime)
      }
      
      return 0
    })
  }

  // Helper functions
  const formatTime = (timeString) => {
    if (!timeString) return null
    try {
      const [hours, minutes] = timeString.split(':')
      const hour12 = parseInt(hours) % 12 || 12
      const ampm = parseInt(hours) < 12 ? 'AM' : 'PM'
      return `${hour12}:${minutes} ${ampm}`
    } catch (error) {
      return timeString
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#EF4444'
      case 'medium': return '#F59E0B'
      case 'low': return '#10B981'
      default: return '#94A3B8'
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(clickedDate)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
  }

  const isToday = (day) => {
    const today = new Date()
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return isSameDay(today, checkDate)
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayTasks = getTasksForDate(dayDate)
      const isTodayDate = isToday(day)
      
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isTodayDate ? 'today' : ''} ${dayTasks.length > 0 ? 'has-tasks' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          <div className="day-number">{day}</div>
          
          {dayTasks.length > 0 && (
            <div className="day-tasks">
              {dayTasks.slice(0, 4).map((task, index) => (
                <div key={index} className="task-text">
                  <span className="task-title">{task.title}</span>
                  {task.dueTime && (
                    <span className="task-time">{formatTime(task.dueTime)}</span>
                  )}
                </div>
              ))}
              {dayTasks.length > 4 && (
                <div className="more-tasks">
                  +{dayTasks.length - 4} more
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    return days
  }

  return (
    <div className="calendar-page">
      {/* Simplified Header - No subtitle, no stats */}
      <div className="calendar-header">
        <h1 className="page-title">Calendar</h1>
        <div className="calendar-navigation">
          <button className="nav-button" onClick={() => navigateMonth(-1)}>
            <ChevronLeft size={20} />
          </button>
          <h2 className="current-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button className="nav-button" onClick={() => navigateMonth(1)}>
            <ChevronRight size={20} />
          </button>
          <button className="today-button" onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-container">
        <div className="calendar-grid">
          {/* Day Headers */}
          {dayNames.map(day => (
            <div key={day} className="day-header">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {renderCalendarDays()}
        </div>
      </div>

      {/* Date Modal - Keep unchanged */}
      <DateModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedDate={selectedDate}
      />
    </div>
  )
}

export default Calendar
