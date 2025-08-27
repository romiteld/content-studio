import React, { useState } from 'react';
import { Shield, Key, CheckCircle, AlertCircle, Zap, Lock } from 'lucide-react';
import { generateTestToken } from '../../utils/generateToken';
import { API_BASE_URL } from '../../config/api';

interface AccessTokenInputProps {
  onTokenSubmit: (token: string) => void;
}

const AccessTokenInput: React.FC<AccessTokenInputProps> = ({ onTokenSubmit }) => {
  const [token, setToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testEmail, setTestEmail] = useState('admin@emailthewell.com');

  const handleDirectToken = () => {
    if (!token.trim()) {
      setError('Access token is required');
      return;
    }

    // Store the token
    localStorage.setItem('authToken', token.trim());
    sessionStorage.setItem('authToken', token.trim());
    setSuccess('Access token saved successfully');
    
    // Reload to apply authentication
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    onTokenSubmit(token.trim());
  };

  const generateQuickToken = async () => {
    setError('');
    setSuccess('');
    
    // Check if email is authorized
    const authorizedEmails = [
      'daniel.romitelli@emailthewell.com',
      'admin@emailthewell.com',
      'admin@thewell.com'
    ];
    
    if (!authorizedEmails.includes(testEmail.toLowerCase())) {
      // Generate development token for non-authorized emails
      const newToken = generateTestToken(testEmail);
      setToken(newToken);
      setSuccess('Development token generated! Click "Authenticate with Token" to proceed.');
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
      
      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        setSuccess('Supabase token generated! Click "Authenticate with Token" to proceed.');
      } else {
        // Fallback to local generation
        const newToken = generateTestToken(testEmail);
        setToken(newToken);
        setSuccess('Development token generated! Click "Authenticate with Token" to proceed.');
      }
    } catch (error) {
      // Fallback to local generation if API fails
      const newToken = generateTestToken(testEmail);
      setToken(newToken);
      setSuccess('Development token generated! Click "Authenticate with Token" to proceed.');
    }
  };

  return (
    <div className="auth-alternative">
      <div className="divider">
        <span>OR</span>
      </div>
      
      <button
        type="button"
        onClick={() => setShowTokenInput(!showTokenInput)}
        className="auth-button secondary"
      >
        <Shield className="button-icon" />
        Use Access Token
      </button>

      {showTokenInput && (
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

          <div className="form-group">
            <label className="form-label">
              <Key className="label-icon" />
              Direct Access Token
            </label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your access token"
              className="form-input"
              rows={3}
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <p className="form-hint">
              Enter a valid JWT access token to bypass email authentication
            </p>
          </div>

          {/* Quick Token Generator for Testing */}
          <div className="quick-token-section">
            <div className="form-group">
              <label className="form-label">
                <Zap className="label-icon" />
                Quick Access Token Generator
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email for access token"
                className="form-input"
              />
              <p className="form-hint" style={{ fontSize: '11px', marginTop: '4px' }}>
                <Lock style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px' }} />
                Authorized emails: daniel.romitelli@emailthewell.com, admin@emailthewell.com
              </p>
            </div>
            <button
              type="button"
              onClick={generateQuickToken}
              className="auth-button secondary"
            >
              <Zap className="button-icon" />
              Generate Access Token
            </button>
          </div>

          <button
            type="button"
            onClick={handleDirectToken}
            className="auth-button primary"
            disabled={!token.trim()}
          >
            <Shield className="button-icon" />
            Authenticate with Token
          </button>
        </div>
      )}
    </div>
  );
};

export default AccessTokenInput;