import React, { useState } from 'react';
import { Shield, Key, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { generateTestToken } from '../../utils/generateToken';

interface AccessTokenInputProps {
  onTokenSubmit: (token: string) => void;
}

const AccessTokenInput: React.FC<AccessTokenInputProps> = ({ onTokenSubmit }) => {
  const [token, setToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testEmail, setTestEmail] = useState('admin@thewell.solutions');

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

  const generateQuickToken = () => {
    const newToken = generateTestToken(testEmail);
    setToken(newToken);
    setSuccess('Test token generated! Click "Authenticate with Token" to proceed.');
    setError('');
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
                Quick Test Token
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email for test token"
                className="form-input"
              />
            </div>
            <button
              type="button"
              onClick={generateQuickToken}
              className="auth-button secondary"
            >
              <Zap className="button-icon" />
              Generate Test Token
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