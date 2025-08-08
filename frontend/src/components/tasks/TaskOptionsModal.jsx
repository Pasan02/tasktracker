import { useState } from 'react'
import { Edit, Trash2, X } from 'lucide-react'
import './TaskOptionsModal.css'

const TaskOptionsModal = ({ isOpen, onClose, onEdit, onDelete, task, position }) => {
  if (!isOpen || !task) return null

  const handleEdit = () => {
    onEdit(task)
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      onDelete(task.id)
      onClose()
    }
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div 
        className="task-options-modal"
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          zIndex: 1000
        }}
      >
        <button className="task-option" onClick={handleEdit}>
          <Edit size={16} />
          Edit Task
        </button>
        <button className="task-option delete" onClick={handleDelete}>
          <Trash2 size={16} />
          Delete Task
        </button>
      </div>
    </>
  )
}

export default TaskOptionsModal