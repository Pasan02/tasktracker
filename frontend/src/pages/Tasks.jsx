import { useState, useEffect } from 'react'
import { Plus, Filter, ChevronDown, Clock, CheckCircle2, Circle, MoreHorizontal, Calendar, Flag, Tag } from 'lucide-react'
import { useTask } from '../context/TaskContext'
import AddTaskModal from '../components/tasks/AddTaskModal'
import EditTaskModal from '../components/tasks/EditTaskModal'
import TaskOptionsModal from '../components/tasks/TaskOptionsModal'
import './Tasks.css'

const Tasks = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTask()
  const [activeTab, setActiveTab] = useState('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskOptionsModal, setTaskOptionsModal] = useState({
    isOpen: false,
    task: null,
    position: { top: 0, left: 0 }
  })

  // Filter and Sort states
  const [activeFilters, setActiveFilters] = useState({
    priority: 'all',
    category: 'all',
    dueDate: 'all'
  })
  const [activeSortBy, setActiveSortBy] = useState('dueDate')
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' or 'desc'

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

  // Apply filters to tasks
  const applyFilters = (taskList) => {
    return taskList.filter(task => {
      // Priority filter
      if (activeFilters.priority !== 'all' && task.priority !== activeFilters.priority) {
        return false
      }
      
      // Category filter
      if (activeFilters.category !== 'all' && task.category !== activeFilters.category) {
        return false
      }
      
      // Due date filter
      if (activeFilters.dueDate !== 'all') {
        const today = new Date()
        const taskDate = new Date(task.dueDate)
        
        switch (activeFilters.dueDate) {
          case 'overdue':
            if (taskDate >= today || task.status === 'completed') return false
            break
          case 'today':
            if (taskDate.toDateString() !== today.toDateString()) return false
            break
          case 'week':
            const weekFromNow = new Date()
            weekFromNow.setDate(today.getDate() + 7)
            if (taskDate < today || taskDate > weekFromNow) return false
            break
          case 'month':
            const monthFromNow = new Date()
            monthFromNow.setMonth(today.getMonth() + 1)
            if (taskDate < today || taskDate > monthFromNow) return false
            break
          default:
            break
        }
      }
      
      return true
    })
  }

  // Apply sorting to tasks
  const applySorting = (taskList) => {
    return [...taskList].sort((a, b) => {
      let compareValue = 0
      
      switch (activeSortBy) {
        case 'dueDate':
          compareValue = new Date(a.dueDate) - new Date(b.dueDate)
          break
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
          compareValue = priorityOrder[b.priority] - priorityOrder[a.priority]
          break
        case 'title':
          compareValue = a.title.localeCompare(b.title)
          break
        case 'category':
          compareValue = a.category.localeCompare(b.category)
          break
        case 'created':
          compareValue = new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          break
        default:
          compareValue = 0
      }
      
      return sortOrder === 'desc' ? -compareValue : compareValue
    })
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
  const getFilteredTasksByTab = () => {
    return tasks.filter(task => {
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
  }

  // Get final filtered and sorted tasks
  const processedTasks = applySorting(applyFilters(getFilteredTasksByTab()))
  const tasksByDate = groupTasksByDate(processedTasks)

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

  // Filter options
  const filterOptions = {
    priority: [
      { value: 'all', label: 'All Priorities' },
      { value: 'high', label: 'High Priority', color: '#EF4444' },
      { value: 'medium', label: 'Medium Priority', color: '#F59E0B' },
      { value: 'low', label: 'Low Priority', color: '#10B981' }
    ],
    category: [
      { value: 'all', label: 'All Categories' },
      { value: 'work', label: 'Work' },
      { value: 'personal', label: 'Personal' },
      { value: 'shopping', label: 'Shopping' },
      { value: 'health', label: 'Health' },
      { value: 'learning', label: 'Learning' },
      { value: 'finance', label: 'Finance' },
      { value: 'other', label: 'Other' }
    ],
    dueDate: [
      { value: 'all', label: 'All Dates' },
      { value: 'overdue', label: 'Overdue' },
      { value: 'today', label: 'Due Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' }
    ]
  }

  // Sort options
  const sortOptions = [
    { value: 'dueDate', label: 'Due Date', icon: Calendar },
    { value: 'priority', label: 'Priority', icon: Flag },
    { value: 'title', label: 'Title', icon: Tag },
    { value: 'category', label: 'Category', icon: Tag },
    { value: 'created', label: 'Created Date', icon: Clock }
  ]

  // Event handlers
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

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setIsEditTaskModalOpen(true)
  }

  const handleUpdateTask = (taskId, updates) => {
    updateTask(taskId, updates)
    setIsEditTaskModalOpen(false)
    setSelectedTask(null)
  }

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId)
  }

  const handleTaskMenuClick = (e, task) => {
    e.stopPropagation()
    const rect = e.target.getBoundingClientRect()
    setTaskOptionsModal({
      isOpen: true,
      task,
      position: {
        top: rect.bottom + 8,
        left: rect.left - 120
      }
    })
  }

  const closeTaskOptionsModal = () => {
    setTaskOptionsModal({
      isOpen: false,
      task: null,
      position: { top: 0, left: 0 }
    })
  }

  // Filter handlers
  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearAllFilters = () => {
    setActiveFilters({
      priority: 'all',
      category: 'all',
      dueDate: 'all'
    })
  }

  const hasActiveFilters = Object.values(activeFilters).some(filter => filter !== 'all')

  // Sort handlers
  const handleSortChange = (sortBy) => {
    if (activeSortBy === sortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setActiveSortBy(sortBy)
      setSortOrder('asc')
    }
    setSortOpen(false)
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

  // Add this useEffect to handle clicking outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterOpen && !event.target.closest('.filter-dropdown')) {
        setFilterOpen(false)
      }
      if (sortOpen && !event.target.closest('.sort-dropdown')) {
        setSortOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [filterOpen, sortOpen])

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
          {/* Filter Dropdown */}
          <div className="filter-dropdown">
            <button 
              className={`filter-button ${hasActiveFilters ? 'active' : ''}`}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter size={16} />
              Filter
              {hasActiveFilters && <span className="filter-badge">{Object.values(activeFilters).filter(f => f !== 'all').length}</span>}
              <ChevronDown size={16} className={filterOpen ? 'rotated' : ''} />
            </button>
            
            {filterOpen && (
              <div className="dropdown-menu filter-menu">
                <div className="filter-section">
                  <h4 className="filter-title">Priority</h4>
                  <div className="filter-options">
                    {filterOptions.priority.map(option => (
                      <button
                        key={option.value}
                        className={`filter-option ${activeFilters.priority === option.value ? 'selected' : ''}`}
                        onClick={() => handleFilterChange('priority', option.value)}
                      >
                        {option.color && (
                          <div 
                            className="priority-dot" 
                            style={{ backgroundColor: option.color }}
                          ></div>
                        )}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="filter-section">
                  <h4 className="filter-title">Category</h4>
                  <div className="filter-options">
                    {filterOptions.category.map(option => (
                      <button
                        key={option.value}
                        className={`filter-option ${activeFilters.category === option.value ? 'selected' : ''}`}
                        onClick={() => handleFilterChange('category', option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="filter-section">
                  <h4 className="filter-title">Due Date</h4>
                  <div className="filter-options">
                    {filterOptions.dueDate.map(option => (
                      <button
                        key={option.value}
                        className={`filter-option ${activeFilters.dueDate === option.value ? 'selected' : ''}`}
                        onClick={() => handleFilterChange('dueDate', option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {hasActiveFilters && (
                  <div className="filter-actions">
                    <button className="clear-filters-btn" onClick={clearAllFilters}>
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Sort Dropdown */}
          <div className="sort-dropdown">
            <button 
              className="sort-button"
              onClick={() => setSortOpen(!sortOpen)}
            >
              Sort: {sortOptions.find(opt => opt.value === activeSortBy)?.label}
              <ChevronDown size={16} className={sortOpen ? 'rotated' : ''} />
            </button>
            
            {sortOpen && (
              <div className="dropdown-menu sort-menu">
                {sortOptions.map(option => {
                  const IconComponent = option.icon
                  return (
                    <button
                      key={option.value}
                      className={`sort-option ${activeSortBy === option.value ? 'selected' : ''}`}
                      onClick={() => handleSortChange(option.value)}
                    >
                      <IconComponent size={16} />
                      {option.label}
                      {activeSortBy === option.value && (
                        <span className="sort-order">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
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
                  
                  <button 
                    className="task-menu"
                    onClick={(e) => handleTaskMenuClick(e, task)}
                  >
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {Object.keys(tasksByDate).length === 0 && (
          <div className="empty-state-main">
            <div className="empty-icon">
              <CheckCircle2 size={48} />
            </div>
            <h3>No tasks found</h3>
            <p>
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more tasks' 
                : 'Create your first task to get started'
              }
            </p>
            {!hasActiveFilters && (
              <button 
                className="add-task-button-empty"
                onClick={() => setIsAddTaskModalOpen(true)}
              >
                <Plus size={20} />
                Add Your First Task
              </button>
            )}
            {hasActiveFilters && (
              <button 
                className="clear-filters-button-empty"
                onClick={clearAllFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => setIsEditTaskModalOpen(false)}
        onUpdateTask={handleUpdateTask}
        task={selectedTask}
      />

      <TaskOptionsModal
        isOpen={taskOptionsModal.isOpen}
        onClose={closeTaskOptionsModal}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        task={taskOptionsModal.task}
        position={taskOptionsModal.position}
      />
    </div>
  )
}

export default Tasks
