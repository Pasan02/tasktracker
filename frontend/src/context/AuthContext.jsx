import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Auth validation error:', error)
          localStorage.removeItem('token')
        }
      }
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      setUser(response.user)
      setIsAuthenticated(true)
      return { success: true, user: response.user }
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      
      console.log('Registration response in context:', response); // Debug log
      
      if (response.success) {
        // Set user data immediately after successful registration
        setUser(response.user)
        setIsAuthenticated(true)
        return { success: true, user: response.user }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error('Registration error in context:', error)
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateProfile = async (userData) => {
    try {
      const result = await authService.updateProfile(userData)
      if (result.success) {
        setUser(result.user)
        return { 
          success: true, 
          user: result.user,
          warning: result.warning 
        }
      } else {
        return { 
          success: false, 
          error: result.error || 'Update failed' 
        }
      }
    } catch (error) {
      console.error('Profile update error in context:', error)
      return { 
        success: false, 
        error: error.message || 'Update failed' 
      }
    }
  }

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const result = await authService.updatePassword(currentPassword, newPassword)
      return { success: true, message: result.message }
    } catch (error) {
      return { success: false, error: error.message || 'Password update failed' }
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
