import React, { useState } from 'react';
import { Shield, CheckCircle, AlertCircle, Zap, Lock } from 'lucide-react';
import { generateTestToken } from '../../utils/generateToken';
import { API_BASE_URL } from '../../config/api';

interface AccessTokenInputProps {
  onTokenSubmit: (token: string) => void;
}

const AccessTokenInput: React.FC<AccessTokenInputProps> = ({ onTokenSubmit }) => {
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testEmail, setTestEmail] = useState('daniel.romitelli@emailthewell.com');

  const handleQuickAccess = async () => {
    setError('');
    setSuccess('Generating access token...');
    
    // Check if email is authorized
    const authorizedEmails = [
      'daniel.romitelli@emailthewell.com',
      'admin@emailthewell.com',
      'admin@thewell.com'
    ];
    
    if (!authorizedEmails.includes(testEmail.toLowerCase())) {
      setError('This email is not authorized for quick access');
      setSuccess('');
      return;
    }
    
    try {
      // Try to generate token via API for authorized emails
      const response = await fetch(`${API_BASE_URL}/api/generate-supabase-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: testEmail })
      });
      
      let token;
      if (response.ok) {
        const data = await response.json();
        token = data.access_token;
      } else {
        // Fallback to local generation
        token = generateTestToken(testEmail);
      }
      
      // Store the token
      localStorage.setItem('authToken', token);
      sessionStorage.setItem('authToken', token);
      setSuccess('Access granted! Redirecting...');
      
      // Reload to apply authentication
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      onTokenSubmit(token);
    } catch (error) {
      // Fallback to local generation if API fails
      const token = generateTestToken(testEmail);
      localStorage.setItem('authToken', token);
      sessionStorage.setItem('authToken', token);
      setSuccess('Access granted! Redirecting...');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      onTokenSubmit(token);
    }
  };

  return (
    <div className="auth-alternative">
      <div className="divider">
        <span>OR</span>
      </div>
      
      <button
        type="button"
        onClick={() => setShowQuickAccess(!showQuickAccess)}
        className="auth-button secondary"
      >
        <Shield className="button-icon" />
        Quick Admin Access
      </button>

      {showQuickAccess && (
        <div className="token-input-section">
          {error && (
            <div className="auth-message error">
              <AlertCircle className="message-icon" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="auth-message success">
              <CheckCircle className="message-icon" />
              {success}
            </div>
          )}

          <div className="quick-token-section">
            <div className="form-group">
              <label className="form-label">
                <Zap className="label-icon" />
                Admin Email
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter authorized email"
                className="form-input"
              />
              <p className="form-hint" style={{ fontSize: '11px', marginTop: '4px' }}>
                <Lock style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px' }} />
                Authorized: daniel.romitelli@emailthewell.com, admin@emailthewell.com
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickAccess}
              className="auth-button primary"
            >
              <Zap className="button-icon" />
              Grant Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessTokenInput;