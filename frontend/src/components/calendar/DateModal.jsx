import { X, Calendar, CheckCircle, Circle, Clock, Star } from 'lucide-react'
import { useTask } from '../../context/TaskContext'
import { useHabit } from '../../context/HabitContext'
import { format, isSameDay } from 'date-fns'
import './DateModal.css'

const DateModal = ({ isOpen, onClose, selectedDate }) => {
  const { tasks, toggleTaskStatus } = useTask()
  const { habits, habitCompletions, toggleHabitCompletion } = useHabit()

  if (!isOpen || !selectedDate) return null

  // Filter tasks for the selected date
  const dateTasks = tasks.filter(task => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate)
    return isSameDay(taskDate, selectedDate)
  })

  // Filter habits for the selected date
  const dateHabits = habits.filter(habit => {
    if (!habit.isActive) return false
    const dayOfWeek = selectedDate.getDay()
    return habit.targetDays.includes(dayOfWeek)
  })

  // Check if habit is completed for the selected date
  const isHabitCompleted = (habitId) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    return habitCompletions.some(completion => 
      completion.habitId === habitId && 
      completion.date === dateStr && 
      completion.completed
    )
  }

  const handleTaskToggle = (taskId) => {
    toggleTaskStatus(taskId)
  }

  const handleHabitToggle = (habitId) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    toggleHabitCompletion(habitId, dateStr)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444'
      case 'medium': return '#F59E0B'
      case 'low': return '#10B981'
      default: return '#94A3B8'
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour12 = hours % 12 || 12
    const ampm = hours < 12 ? 'AM' : 'PM'
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="date-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <Calendar size={24} className="modal-icon" />
            <div>
              <h2 className="modal-title">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <p className="modal-subtitle">
                {dateTasks.length} tasks • {dateHabits.length} habits
              </p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {/* Tasks Section */}
          <div className="section">
            <div className="section-header">
              <h3 className="section-title">Tasks ({dateTasks.length})</h3>
            </div>
            
            {dateTasks.length === 0 ? (
              <div className="empty-state">
                <Clock size={48} className="empty-icon" />
                <p className="empty-text">No tasks scheduled for this date</p>
                <p className="empty-subtext">Add a task to get started</p>
              </div>
            ) : (
              <div className="items-list">
                {dateTasks.map(task => (
                  <div key={task.id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
                    <button
                      className="task-toggle"
                      onClick={() => handleTaskToggle(task.id)}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle size={20} className="completed-icon" />
                      ) : (
                        <Circle size={20} className="pending-icon" />
                      )}
                    </button>
                    
                    <div className="task-content">
                      <div className="task-header">
                        <h4 className="task-title">{task.title}</h4>
                        <div className="task-meta">
                          {task.dueTime && (
                            <span className="task-time">{formatTime(task.dueTime)}</span>
                          )}
                          <div 
                            className="priority-indicator"
                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                          ></div>
                          <span className="task-category">{task.category}</span>
                        </div>
                      </div>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Habits Section */}
          <div className="section">
            <div className="section-header">
              <h3 className="section-title">Habits ({dateHabits.length})</h3>
            </div>
            
            {dateHabits.length === 0 ? (
              <div className="empty-state">
                <Star size={48} className="empty-icon" />
                <p className="empty-text">No habits scheduled for this date</p>
                <p className="empty-subtext">Create a habit to get started</p>
              </div>
            ) : (
              <div className="items-list">
                {dateHabits.map(habit => {
                  const completed = isHabitCompleted(habit.id)
                  return (
                    <div key={habit.id} className={`habit-item ${completed ? 'completed' : ''}`}>
                      <button
                        className="habit-toggle"
                        onClick={() => handleHabitToggle(habit.id)}
                      >
                        {completed ? (
                          <CheckCircle size={20} className="completed-icon" />
                        ) : (
                          <Circle size={20} className="pending-icon" />
                        )}
                      </button>
                      
                      <div className="habit-content">
                        <div className="habit-header">
                          <h4 className="habit-title">{habit.title}</h4>
                          <span className="habit-frequency">{habit.frequency}</span>
                        </div>
                        {habit.description && (
                          <p className="habit-description">{habit.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DateModal
