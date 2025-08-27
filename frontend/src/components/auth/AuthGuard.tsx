import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SignIn from './SignIn';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <img 
                src="/logo.png" 
                alt="The Well" 
                style={{ 
                  width: '150px', 
                  height: '150px', 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 12px rgba(212, 175, 55, 0.3))'
                }} 
              />
            </div>
            <h1 className="auth-title" style={{ fontSize: '24px', whiteSpace: 'nowrap' }}>The Well Recruiting Solutions</h1>
            <h2 className="auth-subtitle" style={{ fontSize: '20px', fontWeight: '600', marginTop: '16px', marginBottom: '8px' }}>Content Studio</h2>
            <p className="auth-subtitle">Loading...</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <span className="loading-spinner"></span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  return <>{children}</>;
};

export default AuthGuard;