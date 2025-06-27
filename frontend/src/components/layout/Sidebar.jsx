import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Calendar, 
  User, 
  LogOut
} from 'lucide-react'

const Sidebar = ({ isCollapsed, onToggle, currentPath }) => {
  const { user, logout } = useAuth()

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Overview',
      isActive: currentPath === '/' || currentPath === '/dashboard'
    },
    {
      path: '/tasks',
      icon: CheckSquare,
      label: 'Tasks',
      isActive: currentPath === '/tasks'
    },
    {
      path: '/habits', 
      icon: Target,
      label: 'Goals & Habits',
      isActive: currentPath === '/habits'
    },
    {
      path: '/calendar',
      icon: Calendar,
      label: 'Calendar & Review',
      isActive: currentPath === '/calendar'
    }
  ]

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map(item => {
            const Icon = item.icon
            return (
              <li key={item.path} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${item.isActive ? 'active' : ''}`}
                >
                  <Icon size={20} className="nav-icon" />
                  {!isCollapsed && <span className="nav-text">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <Link to="/profile" className={`user-link ${currentPath === '/profile' ? 'active' : ''}`}>
            <User size={20} className="nav-icon" />
            {!isCollapsed && <span className="nav-text">Account</span>}
          </Link>
        </div>
        <button className="nav-link logout-btn" onClick={handleLogout}>
          <LogOut size={20} className="nav-icon" />
          {!isCollapsed && <span className="nav-text">Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
