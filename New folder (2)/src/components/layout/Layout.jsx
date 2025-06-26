import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import './Layout.css'

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div className="layout">
      <div className="layout-header">
        <Header />
      </div>
      <div className="layout-body">
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentPath={location.pathname}
        />
        <div className={`layout-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <main className="layout-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout
