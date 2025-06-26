import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Habits from './pages/Habits'
import Calendar from './pages/Calendar'
import Profile from './pages/Profile'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TaskProvider } from './context/TaskContext'
import { HabitProvider } from './context/HabitContext'
import './styles/globals.css'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        {!isAuthenticated ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        ) : (
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Layout>
        )}
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <HabitProvider>
          <AppContent />
        </HabitProvider>
      </TaskProvider>
    </AuthProvider>
  )
}

export default App
