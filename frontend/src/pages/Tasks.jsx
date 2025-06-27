import { useState } from 'react'
import { Plus, Filter, ChevronDown, Clock, CheckCircle2, Circle, MoreHorizontal } from 'lucide-react'
import { useTask } from '../context/TaskContext'
import AddTaskModal from '../components/tasks/AddTaskModal'
import './Tasks.css'

const Tasks = () => {
  const { tasks, addTask, updateTask } = useTask()
  const [activeTab, setActiveTab] = useState('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)

  // Helper function to format dates
  const formatDateGroup = (date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const taskDate = new Date(date)
    
    if (taskDate.toDateString() === today.toDateString()) {
      return 'today'
    } else if (taskDate.toDateString() === tomorrow.toDateString()) {
      return 'tomorrow'
    } else {
      return 'upcoming'
    }
  }

  // Group tasks by date
  const groupTasksByDate = (taskList) => {
    const groups = {}
    
    taskList.forEach(task => {
      const dateGroup = formatDateGroup(task.dueDate)
      if (!groups[dateGroup]) {
        groups[dateGroup] = []
      }
      groups[dateGroup].push(task)
    })
    
    return groups
  }

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    switch (activeTab) {
      case 'today':
        return formatDateGroup(task.dueDate) === 'today' && task.status !== 'completed'
      case 'upcoming':
        return formatDateGroup(task.dueDate) === 'upcoming' && task.status !== 'completed'
      case 'completed':
        return task.status === 'completed'
      default:
        return task.status !== 'completed'
    }
  })

  const tasksByDate = groupTasksByDate(filteredTasks)

  // Calculate tab counts
  const tabCounts = {
    all: tasks.filter(task => task.status !== 'completed').length,
    today: tasks.filter(task => formatDateGroup(task.dueDate) === 'today' && task.status !== 'completed').length,
    upcoming: tasks.filter(task => formatDateGroup(task.dueDate) === 'upcoming' && task.status !== 'completed').length,
    completed: tasks.filter(task => task.status === 'completed').length
  }

  const tabs = [
    { id: 'all', label: 'All Tasks', count: tabCounts.all },
    { id: 'today', label: 'Today', count: tabCounts.today },
    { id: 'upcoming', label: 'Upcoming', count: tabCounts.upcoming },
    { id: 'completed', label: 'Completed', count: tabCounts.completed }
  ]

  const handleTaskToggle = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      const newStatus = task.status === 'completed' ? 'todo' : 'completed'
      updateTask(taskId, { status: newStatus })
    }
  }

  const handleAddTask = (taskData) => {
    addTask(taskData)
  }

  // Helper function to get date title
  const getDateTitle = (dateGroup) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    switch (dateGroup) {
      case 'today':
        return `Today's Tasks - ${today.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`
      case 'tomorrow':
        return `Tomorrow's Tasks - ${tomorrow.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`
      case 'upcoming':
        return 'Upcoming Tasks'
      default:
        return 'Tasks'
    }
  }

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div className="header-left">
          <h1 className="page-title">Tasks</h1>
          <span className="task-count">{tabCounts.all}</span>
        </div>
        <button 
          className="add-task-button"
          onClick={() => setIsAddTaskModalOpen(true)}
        >
          <Plus size={20} />
          Add Task
        </button>
      </div>

      <div className="tasks-controls">
        <div className="control-filters">
          <div className="filter-dropdown">
            <button 
              className="filter-button"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter size={16} />
              Filter
              <ChevronDown size={16} />
            </button>
          </div>
          
          <div className="sort-dropdown">
            <button 
              className="sort-button"
              onClick={() => setSortOpen(!sortOpen)}
            >
              Sort
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="tasks-tabs">
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

      <div className="tasks-content">
        {Object.entries(tasksByDate).map(([dateKey, taskList]) => (
          <div key={dateKey} className="task-day-group">
            <h2 className="day-title">{getDateTitle(dateKey)}</h2>
            
            <div className="task-day-card">
              {taskList.map(task => (
                <div key={task.id} className="task-item">
                  <button 
                    className={`task-checkbox ${task.status === 'completed' ? 'completed' : ''}`}
                    onClick={() => handleTaskToggle(task.id)}
                  >
                    {task.status === 'completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  
                  <div className="task-content">
                    <h3 className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}>
                      {task.title}
                    </h3>
                    <p className="task-description">{task.description}</p>
                    <div className="task-meta">
                      <span className={`priority-badge ${task.priority}`}>
                        {task.priority}
                      </span>
                      <span className="category-badge">
                        {task.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="task-time">
                    <Clock size={16} />
                    <span>{task.dueTime ? formatTime(task.dueTime) : 'No time set'}</span>
                  </div>
                  
                  <button className="task-menu">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              ))}
              {taskList.length === 0 && (
                <div className="empty-state">
                  <p>No tasks for this period</p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {Object.keys(tasksByDate).length === 0 && (
          <div className="empty-state-main">
            <div className="empty-icon">
              <CheckCircle2 size={48} />
            </div>
            <h3>No tasks found</h3>
            <p>Create your first task to get started</p>
            <button 
              className="add-task-button-empty"
              onClick={() => setIsAddTaskModalOpen(true)}
            >
              <Plus size={20} />
              Add Your First Task
            </button>
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </div>
  )
}

export default Tasks
