import { Edit, Trash2, Archive, BarChart3 } from 'lucide-react'
import './HabitOptionsModal.css'

const HabitOptionsModal = ({ isOpen, onClose, onEdit, onDelete, onArchive, habit, position }) => {
  if (!isOpen || !habit) return null

  const handleEdit = () => {
    onEdit(habit)
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      onDelete(habit.id)
      onClose()
    }
  }

  const handleArchive = () => {
    onArchive(habit.id)
    onClose()
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div 
        className="habit-options-modal"
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 1001
        }}
      >
        <div className="habit-options-header">
          <h3 className="habit-options-title">{habit.title}</h3>
        </div>
        
        <div className="habit-options-list">
          <button className="habit-option-item edit" onClick={handleEdit}>
            <Edit size={16} />
            <span>Edit Habit</span>
          </button>
          
          <button className="habit-option-item archive" onClick={handleArchive}>
            <Archive size={16} />
            <span>{habit.isActive ? 'Archive Habit' : 'Restore Habit'}</span>
          </button>
          
          <button className="habit-option-item delete" onClick={handleDelete}>
            <Trash2 size={16} />
            <span>Delete Habit</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default HabitOptionsModal