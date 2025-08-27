import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const AuthGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    validateSession();
  }, []);

  const validateSession = async () => {
    const token = localStorage.getItem('sessionToken');
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          localStorage.removeItem('sessionToken');
        }
      } else {
        localStorage.removeItem('sessionToken');
      }
    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem('sessionToken');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Validating session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="authenticated-app">
      <div className="auth-header">
        <span className="user-info">
          Welcome, {user?.name} ({user?.organization})
        </span>
        <button 
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem('sessionToken');
            window.location.href = '/login';
          }}
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
};

export default AuthGuard;