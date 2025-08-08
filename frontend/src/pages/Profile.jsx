import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Camera, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react'
import './Pages.css'
import './Profile.css'

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth() // Add updatePassword here
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  })
  
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Load user data when component mounts
  useEffect(() => {
    console.log('Profile useEffect - user data:', user); // Debug log
  
    if (user) {
      setProfileData({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || ''
      })
    } else {
      // Try to get user from localStorage if not in context
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          console.log('Profile loaded from localStorage:', parsedUser); // Debug log
          
          setProfileData({
            name: `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim(),
            email: parsedUser.email || '',
            phone: parsedUser.phone || '',
            location: parsedUser.location || ''
          })
        } catch (error) {
          console.error('Error parsing saved user:', error)
        }
      }
    }
  }, [user])

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25
    return strength
  }

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 25) return '#ff4757'
    if (strength <= 50) return '#ffa502'
    if (strength <= 75) return '#3742fa'
    return '#2ed573'
  }

  const getPasswordStrengthText = (strength) => {
    if (strength <= 25) return 'Weak'
    if (strength <= 50) return 'Fair'
    if (strength <= 75) return 'Good'
    return 'Strong'
  }

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSecurityChange = (field, value) => {
    setSecurityData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Split name into firstName and lastName
      const nameParts = profileData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Log the data being sent
      console.log('Sending profile update with data:', {
        firstName,
        lastName,
        phone: profileData.phone,
        location: profileData.location
      });
      
      const result = await updateProfile({
        firstName,
        lastName,
        phone: profileData.phone,
        location: profileData.location
      });
      
      if (result.success) {
        if (result.warning) {
          // Show warning if using fallback
          setMessage({ 
            text: 'Profile saved locally. ' + result.warning, 
            type: 'warning' 
          });
        } else {
          // Success message with animation consistent with the app's design
          setMessage({ 
            text: 'Your profile has been updated successfully!', 
            type: 'success' 
          });
        }
      } else {
        // Enhanced error message
        setMessage({ 
          text: 'Failed to update profile: ' + (result.error || 'Unknown error'), 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        text: 'An error occurred while updating your profile', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    }
  }

  const handleUpdatePassword = async () => {
    // Validate passwords
    if (securityData.newPassword !== securityData.confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' })
      return
    }
    
    if (securityData.newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' })
      return
    }
    
    setIsLoading(true)
    try {
      // Use updatePassword from useAuth instead of authService directly
      const result = await updatePassword(
        securityData.currentPassword, 
        securityData.newPassword
      )
      
      if (result.success) {
        setMessage({ 
          text: 'Your password has been updated successfully!', 
          type: 'success' 
        })
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setMessage({ 
          text: result.error || 'Failed to update password', 
          type: 'error' 
        })
      }
    } catch (error) {
      setMessage({ 
        text: 'An error occurred while updating your password', 
        type: 'error' 
      })
    } finally {
      setIsLoading(false)
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' })
      }, 3000)
    }
  }

  const passwordStrength = calculatePasswordStrength(securityData.newPassword)

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Account Settings</h1>
        <p>Manage your account information and security settings</p>
      </div>
      
      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="profile-content">
        {/* Profile Information Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Profile Information</h2>
            <p>Update your personal information and profile picture</p>
          </div>
          
          <div className="profile-photo-section">
            <div className="profile-photo">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.firstName} className="avatar-img" />
              ) : (
                <div className="photo-placeholder">
                  <User size={40} />
                </div>
              )}
              <button className="photo-upload-btn">
                <Camera size={16} />
              </button>
            </div>
            <div className="photo-info">
              <h3>Profile Photo</h3>
              <p>Upload a new profile picture</p>
              <button className="upload-btn">Upload Photo</button>
            </div>
          </div>
          
          <div className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={20} />
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={20} />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  placeholder="Enter your email"
                  disabled={true} // Email should not be editable
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-with-icon">
                <Phone size={20} />
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Location</label>
              <div className="input-with-icon">
                <MapPin size={20} />
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => handleProfileChange('location', e.target.value)}
                  placeholder="Enter your location"
                />
              </div>
            </div>
            
            <button 
              className={`save-btn ${isLoading ? 'loading' : ''}`}
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        
        {/* Security Settings Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Security Settings</h2>
            <p>Update your password and security preferences</p>
          </div>
          
          <div className="security-form">
            <div className="form-group">
              <label>Current Password</label>
              <div className="input-with-icon">
                <Lock size={20} />
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={securityData.currentPassword}
                  onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <Lock size={20} />
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={securityData.newPassword}
                  onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {securityData.newPassword && (
                <div className="password-strength">
                  <div className="password-strength-bar">
                    <div 
                      className="password-strength-fill"
                      style={{
                        width: `${passwordStrength}%`,
                        backgroundColor: getPasswordStrengthColor(passwordStrength)
                      }}
                    ></div>
                  </div>
                  <span 
                    className="password-strength-text"
                    style={{ color: getPasswordStrengthColor(passwordStrength) }}
                  >
                    {getPasswordStrengthText(passwordStrength)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-with-icon">
                <Lock size={20} />
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={securityData.confirmPassword}
                  onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {securityData.confirmPassword && securityData.newPassword !== securityData.confirmPassword && (
                <span className="password-mismatch">Passwords do not match</span>
              )}
            </div>
            
            <button 
              className={`save-btn ${isLoading ? 'loading' : ''}`}
              onClick={handleUpdatePassword}
              disabled={isLoading || 
                !securityData.currentPassword || 
                !securityData.newPassword || 
                !securityData.confirmPassword ||
                securityData.newPassword !== securityData.confirmPassword}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
