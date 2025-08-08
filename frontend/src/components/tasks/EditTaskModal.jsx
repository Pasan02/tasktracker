import { useState, useEffect } from 'react'
import { X, Calendar, Clock, Flag, Tag } from 'lucide-react'
import './AddTaskModal.css' // Reuse the same styles

const EditTaskModal = ({ isOpen, onClose, onUpdateTask, task }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'work',
    dueDate: '',
    dueTime: ''
  })

  const [errors, setErrors] = useState({})

  const priorityOptions = [
    { value: 'low', label: 'Low', color: '#10B981' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' }
  ]

  const categoryOptions = [
    { value: 'work', label: 'Work', color: '#3B82F6' },
    { value: 'personal', label: 'Personal', color: '#8B5CF6' },
    { value: 'shopping', label: 'Shopping', color: '#06B6D4' },
    { value: 'health', label: 'Health', color: '#10B981' },
    { value: 'learning', label: 'Learning', color: '#F59E0B' },
    { value: 'finance', label: 'Finance', color: '#EF4444' },
    { value: 'other', label: 'Other', color: '#6B7280' }
  ]

  // Populate form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        category: task.category || 'work',
        dueDate: task.dueDate || '',
        dueTime: task.dueTime || ''
      })
    }
  }, [task])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required'
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Update task
    onUpdateTask(task.id, formData)
    
    // Reset form
    setErrors({})
    onClose()
  }

  const handleCancel = () => {
    setErrors({})
    onClose()
  }

  if (!isOpen || !task) return null

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="add-task-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Task</h2>
          <button className="close-button" onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter task title..."
                className={`form-input ${errors.title ? 'error' : ''}`}
                maxLength={100}
              />
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
                placeholder="Add task description..."
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
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className={`form-input ${errors.dueDate ? 'error' : ''}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  Due Time
                </label>
                <input
                  type="time"
                  name="dueTime"
                  value={formData.dueTime}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Flag size={16} />
                  Priority
                </label>
                <div className="priority-selector">
                  {priorityOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`priority-option ${formData.priority === option.value ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                      style={{ '--priority-color': option.color }}
                    >
                      <div className="priority-indicator"></div>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Tag size={16} />
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
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTaskModal