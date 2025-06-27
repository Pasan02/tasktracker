import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Sun, Moon, Bell, Search, User, Sparkles } from 'lucide-react'

const Header = () => {
  const { user } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // Add dark mode logic here
  }

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <div className="logo-icon">
            <Sparkles size={24} />
          </div>
          <span className="logo-text">Wellife</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search tasks, habits, or notes..." 
            className="search-input"
          />
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
            <span className="notification-badge">3</span>
          </button>
          
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                <button className="mark-all-read">Mark all as read</button>
              </div>
              <div className="notifications-list">
                <div className="notification-item">
                  <div className="notification-content">
                    <p className="notification-title">Task reminder</p>
                    <p className="notification-desc">Prepare presentation slides is due in 2 hours</p>
                    <span className="notification-time">2h ago</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-content">
                    <p className="notification-title">Habit streak</p>
                    <p className="notification-desc">Great job! You've completed Morning meditation for 5 days</p>
                    <span className="notification-time">1d ago</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-content">
                    <p className="notification-title">Weekly summary</p>
                    <p className="notification-desc">Your productivity report is ready</p>
                    <span className="notification-time">3d ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.firstName} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <User size={16} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
