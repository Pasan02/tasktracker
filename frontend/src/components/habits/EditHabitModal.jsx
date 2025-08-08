import { useState, useEffect } from 'react'
import { X, Repeat, Calendar, Clock, Target } from 'lucide-react'
import './EditHabitModal.css'

const EditHabitModal = ({ isOpen, onClose, onUpdateHabit, habit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    targetDays: [1, 2, 3, 4, 5, 6, 0], // All days by default
    category: 'personal',
    reminderTime: '',
    targetCount: 1
  })

  const [errors, setErrors] = useState({})

  // Populate form when habit changes
  useEffect(() => {
    if (habit) {
      setFormData({
        title: habit.title || '',
        description: habit.description || '',
        frequency: habit.frequency || 'daily',
        targetDays: habit.targetDays || [1, 2, 3, 4, 5, 6, 0],
        category: habit.category || 'personal',
        reminderTime: habit.reminderTime || '',
        targetCount: habit.targetCount || 1
      })
    }
  }, [habit])

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'custom', label: 'Custom' }
  ]

  const categoryOptions = [
    { value: 'personal', label: 'Personal', color: '#8B5CF6' },
    { value: 'health', label: 'Health', color: '#EF4444' },
    { value: 'learning', label: 'Learning', color: '#3B82F6' },
    { value: 'work', label: 'Work', color: '#F59E0B' },
    { value: 'social', label: 'Social', color: '#10B981' },
    { value: 'other', label: 'Other', color: '#6B7280' }
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayValues = [0, 1, 2, 3, 4, 5, 6] // Sunday = 0, Monday = 1, etc.

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFrequencyChange = (frequency) => {
    let targetDays = []
    if (frequency === 'daily') {
      targetDays = [1, 2, 3, 4, 5, 6, 0] // All days
    } else if (frequency === 'weekly') {
      targetDays = formData.targetDays.length > 0 ? [formData.targetDays[0]] : [1] // Keep first selected day or default to Monday
    } else {
      targetDays = formData.targetDays // Keep current selection for custom
    }
    
    setFormData(prev => ({
      ...prev,
      frequency,
      targetDays
    }))
  }

  const handleDayToggle = (dayValue) => {
    setFormData(prev => {
      const newTargetDays = prev.targetDays.includes(dayValue)
        ? prev.targetDays.filter(day => day !== dayValue)
        : [...prev.targetDays, dayValue].sort()
      
      return {
        ...prev,
        targetDays: newTargetDays
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Habit title is required'
    }
    if (formData.frequency === 'custom' && formData.targetDays.length === 0) {
      newErrors.targetDays = 'Please select at least one day'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Update habit
    onUpdateHabit(habit.id, formData)
    
    // Close modal (parent will handle clearing the form)
    onClose()
  }

  const handleCancel = () => {
    // Reset form to original habit data
    if (habit) {
      setFormData({
        title: habit.title || '',
        description: habit.description || '',
        frequency: habit.frequency || 'daily',
        targetDays: habit.targetDays || [1, 2, 3, 4, 5, 6, 0],
        category: habit.category || 'personal',
        reminderTime: habit.reminderTime || '',
        targetCount: habit.targetCount || 1
      })
    }
    setErrors({})
    onClose()
  }

  if (!isOpen || !habit) return null

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="edit-habit-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Habit</h2>
          <button className="close-button" onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="habit-form">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Habit Name *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter habit name..."
                className={`form-input ${errors.title ? 'error' : ''}`}
                maxLength={100}
              />
              <div className="character-count">
                {formData.title.length}/100
              </div>
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add habit description..."
                className="form-textarea"
                rows={3}
                maxLength={500}
              />
              <div className="character-count">
                {formData.description.length}/500
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                <Repeat size={16} />
                Frequency *
              </label>
              <div className="frequency-selector">
                {frequencyOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`frequency-option ${formData.frequency === option.value ? 'selected' : ''}`}
                    onClick={() => handleFrequencyChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {(formData.frequency === 'weekly' || formData.frequency === 'custom') && (
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Target Days {formData.frequency === 'custom' ? '*' : ''}
                </label>
                <div className="days-selector">
                  {dayValues.map((dayValue, index) => (
                    <button
                      key={dayValue}
                      type="button"
                      className={`day-option ${formData.targetDays.includes(dayValue) ? 'selected' : ''}`}
                      onClick={() => handleDayToggle(dayValue)}
                    >
                      {dayNames[index]}
                    </button>
                  ))}
                </div>
                {errors.targetDays && <span className="error-message">{errors.targetDays}</span>}
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Target size={16} />
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  Reminder Time
                </label>
                <input
                  type="time"
                  name="reminderTime"
                  value={formData.reminderTime}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
            >
              Update Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditHabitModal