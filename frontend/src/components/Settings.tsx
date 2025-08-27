import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Building, 
  Mail, 
  LogOut, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Shield,
  Bell,
  Palette,
  Globe,
  Lock,
  Edit3,
  Camera,
  Key,
  UserCheck
} from 'lucide-react';

const Settings: React.FC = () => {
  const { profile, signOut, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    company_name: profile?.company_name || '',
    role: profile?.role || 'user',
    notifications: true,
    theme: 'dark',
    language: 'en'
  });

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await updateProfile(formData);
      
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        setIsEditing(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to sign out' });
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      company_name: profile?.company_name || '',
      role: profile?.role || 'user',
      notifications: true,
      theme: 'dark',
      language: 'en'
    });
    setIsEditing(false);
    setMessage(null);
  };

  return (
    <div className="settings-container">
      <div className="settings-header-enhanced">
        <div className="header-content">
          <div className="header-text">
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">Manage your account and preferences</p>
          </div>
          <div className="header-actions">
            <button className="btn-icon-primary" title="Help">
              <AlertCircle className="icon-sm" />
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`notification-banner ${message.type}`}>
          <div className="notification-content">
            {message.type === 'success' ? (
              <CheckCircle className="notification-icon" />
            ) : (
              <AlertCircle className="notification-icon" />
            )}
            <span>{message.text}</span>
          </div>
          <button 
            className="notification-close" 
            onClick={() => setMessage(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User className="nav-icon" />
              <span>Profile</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Shield className="nav-icon" />
              <span>Security</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="nav-icon" />
              <span>Notifications</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <Palette className="nav-icon" />
              <span>Appearance</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <Globe className="nav-icon" />
              <span>Preferences</span>
            </button>
          </nav>
          
          <div className="sidebar-footer">
            <button
              onClick={handleSignOut}
              className="nav-item danger"
              disabled={loading}
            >
              <LogOut className="nav-icon" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="content-section">
              <div className="section-header">
                <div className="section-title-group">
                  <h2 className="section-title">Profile Information</h2>
                  <p className="section-description">Update your personal details and company information</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary-outline"
                  >
                    <Edit3 className="btn-icon" />
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="profile-card">
                <div className="avatar-section">
                  <div className="avatar-container">
                    <div className="avatar-placeholder">
                      {formData.full_name ? formData.full_name[0].toUpperCase() : 'U'}
                    </div>
                    <button className="avatar-upload" title="Change avatar">
                      <Camera className="icon-sm" />
                    </button>
                  </div>
                  <div className="avatar-info">
                    <p className="avatar-name">{formData.full_name || 'User'}</p>
                    <p className="avatar-role">{formData.role}</p>
                  </div>
                </div>

                <div className="profile-fields">
                  <div className="field-group">
                    <label className="field-label">
                      <Mail className="field-icon" />
                      Email Address
                    </label>
                    <div className="field-input-group">
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="field-input locked"
                      />
                      <Lock className="lock-icon" />
                    </div>
                    <span className="field-hint">Contact support to change email</span>
                  </div>

                  <div className="field-row">
                    <div className="field-group">
                      <label className="field-label">
                        <User className="field-icon" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        disabled={!isEditing}
                        className={`field-input ${!isEditing ? 'disabled' : ''}`}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="field-group">
                      <label className="field-label">
                        <Building className="field-icon" />
                        Company
                      </label>
                      <input
                        type="text"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        disabled={!isEditing}
                        className={`field-input ${!isEditing ? 'disabled' : ''}`}
                        placeholder="Acme Corporation"
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label">
                      <UserCheck className="field-icon" />
                      Account Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      disabled={!isEditing}
                      className={`field-input ${!isEditing ? 'disabled' : ''}`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Administrator</option>
                      <option value="manager">Manager</option>
                      <option value="editor">Editor</option>
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="action-bar">
                    <button
                      onClick={handleCancel}
                      className="btn-ghost"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner"></span>
                      ) : (
                        <>
                          <Save className="btn-icon" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="content-section">
              <div className="section-header">
                <div className="section-title-group">
                  <h2 className="section-title">Security</h2>
                  <p className="section-description">Manage your password and security settings</p>
                </div>
              </div>

              <div className="security-card">
                <div className="security-item">
                  <div className="security-icon">
                    <Key />
                  </div>
                  <div className="security-content">
                    <h3>Change Password</h3>
                    <p>Update your password regularly to keep your account secure</p>
                  </div>
                  <button className="btn-primary-outline">Change</button>
                </div>

                <div className="security-item">
                  <div className="security-icon">
                    <Shield />
                  </div>
                  <div className="security-content">
                    <h3>Two-Factor Authentication</h3>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <button className="btn-primary-outline">Enable</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="content-section">
              <div className="section-header">
                <div className="section-title-group">
                  <h2 className="section-title">Notifications</h2>
                  <p className="section-description">Choose what updates you receive</p>
                </div>
              </div>

              <div className="notification-settings">
                <div className="toggle-item">
                  <div className="toggle-content">
                    <h3>Email Notifications</h3>
                    <p>Receive updates about your content and campaigns</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={formData.notifications}
                      onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-content">
                    <h3>Marketing Updates</h3>
                    <p>Get notified about new features and updates</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="content-section">
              <div className="section-header">
                <div className="section-title-group">
                  <h2 className="section-title">Appearance</h2>
                  <p className="section-description">Customize your interface</p>
                </div>
              </div>

              <div className="appearance-settings">
                <div className="theme-selector">
                  <h3>Theme</h3>
                  <div className="theme-options">
                    <label className="theme-option">
                      <input 
                        type="radio" 
                        name="theme" 
                        value="dark"
                        checked={formData.theme === 'dark'}
                        onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                      />
                      <div className="theme-preview dark">
                        <span>Dark</span>
                      </div>
                    </label>
                    <label className="theme-option">
                      <input 
                        type="radio" 
                        name="theme" 
                        value="light"
                        checked={formData.theme === 'light'}
                        onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                      />
                      <div className="theme-preview light">
                        <span>Light</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="content-section">
              <div className="section-header">
                <div className="section-title-group">
                  <h2 className="section-title">Preferences</h2>
                  <p className="section-description">Customize your experience</p>
                </div>
              </div>

              <div className="preferences-settings">
                <div className="field-group">
                  <label className="field-label">
                    <Globe className="field-icon" />
                    Language
                  </label>
                  <select 
                    className="field-input"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="settings-footer">
        <div className="footer-content">
          <div className="brand-badge">
            <Shield className="brand-icon" />
            <span>Brand Design System: LOCKED</span>
          </div>
          <div className="footer-links">
            <button className="link-btn">Privacy</button>
            <span className="divider">•</span>
            <button className="link-btn">Terms</button>
            <span className="divider">•</span>
            <button className="link-btn">Support</button>
          </div>
          <div className="copyright">
            © The Well 2025
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;