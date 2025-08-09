import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { useTask } from '../../context/TaskContext'
import { useHabit } from '../../context/HabitContext'
import { searchAll } from '../../utils/search'
import { Sun, Moon, Bell, Search, User, Sparkles, Settings, LogOut, ChevronDown } from 'lucide-react'

const Header = () => {
  const { user, logout } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } = useNotification()
  const { tasks } = useTask()
  const { habits } = useHabit()
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  // Search state
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const searchContainerRef = useRef(null)
  const inputRef = useRef(null)

  // Apply saved or system theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = saved || (prefersDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', initial)
    setIsDarkMode(initial === 'dark')
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  // Debounced search
  useEffect(() => {
    const id = setTimeout(() => {
      if (query.trim()) {
        const results = searchAll(query, tasks, habits, 8)
        setSearchResults(results)
        setSearchOpen(true)
        setActiveIndex(results.length ? 0 : -1)
      } else {
        setSearchResults([])
        setSearchOpen(false)
        setActiveIndex(-1)
      }
    }, 150)
    return () => clearTimeout(id)
  }, [query, tasks, habits])

  // Global shortcuts: "/" focus, Cmd/Ctrl+K open
  useEffect(() => {
    const onKey = (e) => {
      const isCmdK = (e.key.toLowerCase() === 'k') && (e.metaKey || e.ctrlKey)
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        inputRef.current?.focus()
        setSearchOpen(true)
      } else if (isCmdK) {
        e.preventDefault()
        inputRef.current?.focus()
        setSearchOpen(true)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close search on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const onSearchKeyDown = (e) => {
    if (!searchOpen || !searchResults.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, searchResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = activeIndex >= 0 ? searchResults[activeIndex] : searchResults[0]
      if (target) {
        navigate(target.route)
        setSearchOpen(false)
        setQuery('')
      }
    }
  }

  const toggleDarkMode = () => {
    const next = isDarkMode ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    setIsDarkMode(!isDarkMode)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    setShowUserMenu(false)
  }

  const handleProfileClick = () => {
    navigate('/profile')
    setShowUserMenu(false)
  }

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <Link to="/" className="app-logo" aria-label="TaskFlow">
            {/* Icon + text logo */}
            <img src="/logo.png" alt="TaskFlow icon" className="logo-icon" />
            <span className="logo-text">TaskFlow</span>
          </Link>
        </div>
      </div>

      <div className="header-center" ref={searchContainerRef}>
        <div className="search-container" role="combobox" aria-expanded={searchOpen} aria-haspopup="listbox">
          <Search size={18} className="search-icon" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search tasks or habits… (Press / or Cmd/Ctrl+K)" 
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setSearchOpen(true)}
            onKeyDown={onSearchKeyDown}
            aria-controls="header-search-listbox"
          />
          {searchOpen && (
            <div className="search-results" id="header-search-listbox" role="listbox">
              {searchResults.length === 0 ? (
                <div className="search-empty">No matches</div>
              ) : (
                searchResults.map((r, idx) => (
                  <button
                    key={r.id}
                    className={`search-result-item ${idx === activeIndex ? 'active' : ''}`}
                    role="option"
                    aria-selected={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => {
                      navigate(r.route)
                      setSearchOpen(false)
                      setQuery('')
                    }}
                    title={r.subtitle}
                  >
                    <span className={`result-type ${r.type}`}>{r.type === 'task' ? 'T' : 'H'}</span>
                    <div className="result-texts">
                      <span className="result-title">{r.title}</span>
                      <span className="result-subtitle">{r.subtitle}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        <button 
          className="header-btn theme-toggle"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="notifications-container">
          <button 
            className="header-btn notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="mark-all-read" onClick={markAllRead}>Mark all as read</button>
                  <button className="mark-all-read" onClick={clearAll}>Clear all</button>
                </div>
              </div>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="notification-item">
                    <div className="notification-content">
                      <p className="notification-title">All caught up</p>
                      <p className="notification-desc">No new notifications</p>
                    </div>
                  </div>
                ) : notifications.map(n => (
                  <div 
                    key={n.id} 
                    className="notification-item"
                    onClick={() => markAsRead(n.id)}
                    role="button"
                  >
                    <div className="notification-content">
                      <p className="notification-title">
                        {n.title}
                        {!n.read && <span style={{ marginLeft: 8, color: 'var(--primary-teal)' }}>•</span>}
                      </p>
                      {n.description && <p className="notification-desc">{n.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="user-profile" ref={userMenuRef}>
          <button 
            className="user-profile-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="Account menu"
          >
            <div className="user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.firstName} className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">
                  <User size={16} />
                </div>
              )}
            </div>
          </button>

          {showUserMenu && (
            <div className="user-menu-dropdown">
              <div className="user-menu-header">
                <div className="user-avatar-large">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.firstName} className="avatar-img" />
                  ) : (
                    <div className="avatar-placeholder">
                      <User size={20} />
                    </div>
                  )}
                </div>
                <div className="user-details">
                  <p className="user-full-name">{user?.firstName} {user?.lastName}</p>
                  <p className="user-email">{user?.email}</p>
                </div>
              </div>
              <div className="user-menu-divider"></div>
              <div className="user-menu-items">
                <button className="user-menu-item" onClick={handleProfileClick}>
                  <Settings size={16} />
                  <span>Account Settings</span>
                </button>
                <button className="user-menu-item logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
