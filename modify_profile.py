import re

with open('client/src/pages/common/ProfilePage.jsx', 'r') as f:
    content = f.read()

# 1. Merge useEffects
old_use_effects = """  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.username || '',
        email: user.email || '',
        phone: user.mobile || '',
        bio: String(user.bio || ''),
        identifier: user.id || ''
      }))
    }
  }, [user])

  // Fetch fresh profile from API on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await userAPI.getProfile()
        if (data.user) {
          setProfile({
            name: data.user.username || '',
            email: data.user.email || '',
            phone: data.user.mobile || '',
            bio: String(data.user.bio || ''),
            identifier: data.user.id || ''
          })
        }
      } catch (err) {
        // Fall back to cached user from AuthContext
        console.error('Failed to fetch profile:', err)
      }
    }
    fetchProfile()
  }, [])"""

new_use_effects = """  useEffect(() => {
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
  }, [user])"""

content = content.replace(old_use_effects, new_use_effects)

# 2. Add loading state for profile save
content = content.replace("const [loading, setLoading] = useState(false)", "const [loading, setLoading] = useState(false)\n  const [savingProfile, setSavingProfile] = useState(false)")

# 3. Modify Save Handler
old_save_handler = """            <Button
              variant="primary"
              size="md"
              type="button"
              onClick={async () => {
                try {
                  const updatePayload = {
                    username: profile.name || '',
                    mobile: profile.phone || '',
                    bio: String(profile.bio || ''),
                  }
                  console.log('Sending update payload:', updatePayload)
                  const { data } = await userAPI.updateProfile(updatePayload)
                  console.log('Update response:', data)
                  updateUser(data.user)
                  toast.success('Profile updated!')
                } catch (err) {
                  console.error('Update error:', err)
                  toast.error(err.response?.data?.message || 'Failed to update profile.')
                }
              }}
            >
              Save Changes
            </Button>"""

new_save_handler = """            <Button
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
            </Button>"""

content = content.replace(old_save_handler, new_save_handler)

# 4. Modify Profile Overview to show mobile
old_overview = """            <div>
              <strong>{profile.name || 'User'}</strong>
              <p>{profile.bio || 'No bio available'}</p>
              <span>Email • {profile.email || 'N/A'}</span>
            </div>"""

new_overview = """            <div>
              <strong>{profile.name || 'User'}</strong>
              <p>{profile.bio || 'No bio available'}</p>
              <span>Email • {profile.email || 'N/A'}</span>
              <br/>
              <span>Phone • {profile.phone || 'No phone number added'}</span>
            </div>"""

content = content.replace(old_overview, new_overview)

# 5. Add Char counter for Bio
old_bio = """            <label>
              Bio
              <textarea
                rows="3"
                value={profile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
              />
            </label>"""

new_bio = """            <div className="form-group-bio">
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
            </div>"""

content = content.replace(old_bio, new_bio)

with open('client/src/pages/common/ProfilePage.jsx', 'w') as f:
    f.write(content)
