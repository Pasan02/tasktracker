import { createContext, useContext, useState, useEffect } from 'react'

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

  useEffect(() => {
    // Check if user is logged in (localStorage, token, etc.)
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // Mock login - replace with actual API call
      const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: email,
        avatar: null,
        createdAt: new Date().toISOString()
      }
      
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
      return { success: true, user: mockUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      // Mock register - replace with actual API call
      const newUser = {
        id: Date.now(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        avatar: null,
        createdAt: new Date().toISOString()
      }
      
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      return { success: true, user: newUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
