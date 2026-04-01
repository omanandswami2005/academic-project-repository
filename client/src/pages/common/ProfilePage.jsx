import { useState, useEffect } from 'react'
import { Mail, Phone, User, Lock, Eye, EyeOff, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { userAPI, authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import './SupportPages.css'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    identifier: ''
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const { data } = await userAPI.getProfile()
        if (isMounted && data.user) {
          setProfile({
            name: String(data.user.username || ''),
            email: String(data.user.email || ''),
            phone: String(data.user.mobile || ''),
            bio: String(data.user.bio || ''),
            identifier: String(data.user.id || '')
          })
        }
      } catch (err) {
        if (isMounted && user) {
          setProfile({
            name: String(user.username || ''),
            email: String(user.email || ''),
            phone: String(user.mobile || ''),
            bio: String(user.bio || ''),
            identifier: String(user.id || '')
          })
        }
      }
    }
    loadProfile()
    return () => { isMounted = false }
  }, [user])

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    setPasswordError('')
    setPasswordMessage('')
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setPasswordError('')
    setPasswordMessage('')

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Please fill in all fields.')
      setLoading(false)
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.')
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.')
      setLoading(false)
      return
    }

    try {
      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      setPasswordMessage('Password updated successfully!')
      toast.success('Password updated!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordMessage('')
      }, 1500)
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to update password. Please try again.')
      toast.error(error.response?.data?.message || 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout
      pageTitle="Profile & Settings"
      pageDescription="Update your contact details, profile image, and account preferences."
    >
      <div className="support-grid">
        <section className="support-card">
          <h3>Profile Overview</h3>
          <div className="profile-summary">
            <div className="avatar-xl">{profile.name ? profile.name[0] : 'U'}</div>
            <div>
              <strong>{profile.name || 'User'}</strong>
              <p>{profile.bio || 'No bio available'}</p>
              <span>Email • {profile.email || 'N/A'}</span>
              <br/>
              <span>Phone • {profile.phone || 'No phone number added'}</span>
            </div>
          </div>
        </section>

        <section className="support-card">
          <h3>Contact Information</h3>
          <form className="support-form">
            <label>
              Full Name
              <div className="input-icon">
                <User size={16} />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
            </label>
            <label>
              Email
              <div className="input-icon">
                <Mail size={16} />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
            </label>
            <label>
              Phone
              <div className="input-icon">
                <Phone size={16} />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </label>
            <div className="form-group-bio">
              <label>Bio</label>
              <textarea
                rows="3"
                value={profile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                style={{ width: '100%' }}
              />
              <div style={{
                textAlign: 'right',
                fontSize: '0.8rem',
                color: profile.bio.length > 500 ? 'var(--error, red)' : (profile.bio.length > 450 ? 'var(--error, red)' : 'var(--text-muted, gray)')
              }}>
                {profile.bio.length} / 500 characters
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              type="button"
              loading={savingProfile}
              disabled={savingProfile || profile.bio.length > 500}
              onClick={async () => {
                setSavingProfile(true)
                try {
                  const updatePayload = {
                    username: String(profile.name || ''),
                    mobile: String(profile.phone || ''),
                    bio: String(profile.bio ?? ''),
                  }
                  const { data } = await userAPI.updateProfile(updatePayload)
                  updateUser(data.user)
                  setProfile(prev => ({
                    ...prev,
                    name: String(data.user.username || ''),
                    email: String(data.user.email || ''),
                    phone: String(data.user.mobile || ''),
                    bio: String(data.user.bio || ''),
                    identifier: String(data.user.id || '')
                  }))
                  toast.success('Profile updated!')
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to update profile.')
                } finally {
                  setSavingProfile(false)
                }
              }}
            >
              Save Changes
            </Button>
          </form>
        </section>

        <section className="support-card">
          <h3>Security</h3>
          <div className="security-grid">
            <div>
              <p>Password</p>
              <span>Update your account password</span>
            </div>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>
          </div>
        </section>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="password-modal-overlay">
          <div className="password-modal">
            <div className="password-modal-header">
              <h2>Change Password</h2>
              <button
                type="button"
                className="btn-icon"
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  setPasswordError('')
                  setPasswordMessage('')
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword}>
              <div className="password-field">
                <label>Current Password</label>
                <div className="password-input-wrap">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-vis"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="password-field">
                <label>New Password</label>
                <div className="password-input-wrap">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-vis"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="password-field">
                <label>Confirm New Password</label>
                <div className="password-input-wrap">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-vis"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="password-msg error">{passwordError}</div>
              )}

              {passwordMessage && (
                <div className="password-msg success">{passwordMessage}</div>
              )}

              <div className="password-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    setPasswordError('')
                    setPasswordMessage('')
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default ProfilePage

