import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Github, Chrome } from 'lucide-react'
import './Auth.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Workaround: Use forgot password to go to dashboard
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Auto-login with demo credentials
      const result = await login('demo@wellife.com', 'password123')
      if (result.success) {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Unable to access dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-hero">
          <div className="auth-hero-content">
            <h1 className="auth-hero-title">Welcome to Wellife</h1>
            <p className="auth-hero-subtitle">Manage your tasks and projects efficiently</p>
            
            <div className="auth-hero-image">
              <div className="hero-mockup">
                <div className="mockup-screen">
                  <div className="mockup-header"></div>
                  <div className="mockup-content">
                    <div className="mockup-card teal"></div>
                    <div className="mockup-card purple"></div>
                    <div className="mockup-card yellow"></div>
                  </div>
                </div>
                <div className="mockup-elements">
                  <div className="floating-element element-1"></div>
                  <div className="floating-element element-2"></div>
                  <div className="floating-element element-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Sign in to Wellife</h2>
            <p>Start managing your tasks efficiently</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Remember me</span>
              </label>
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="forgot-link"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Forgot your password? (Go to Dashboard)'}
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? <div className="spinner"></div> : null}
              Sign in
            </button>

            <div className="auth-divider">
              <span>Or continue with</span>
            </div>

            <div className="social-buttons">
              <button type="button" className="btn social-btn">
                <Chrome size={20} />
                Google
              </button>
              <button type="button" className="btn social-btn">
                <Github size={20} />
                GitHub
              </button>
            </div>

            <p className="auth-footer">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Register now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
