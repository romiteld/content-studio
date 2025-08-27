import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Key, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { SplashCursor } from '../ui/splash-cursor';
// import AccessTokenInput from './AccessTokenInput'; // Removed test token functionality
import '../../styles/auth.css';

interface SignInProps {
  onSuccess?: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signInWithOTP, verifyOTP } = useAuth();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await signInWithOTP(email.trim());
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Check your email for the verification code');
        setStep('otp');
      }
    } catch (err) {
      setError('Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode.trim()) {
      setError('Verification code is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await verifyOTP(email, otpCode.trim());
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Welcome to The Well!');
        onSuccess?.();
      }
    } catch (err) {
      setError('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await signInWithOTP(email);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Verification code sent again');
      }
    } catch (err) {
      setError('Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Animated background with brand colors */}
      <SplashCursor 
        BACK_COLOR={{ r: 0.0, g: 0.0, b: 0.0 }}
        TRANSPARENT={true}
        COLOR_UPDATE_SPEED={8}
        DENSITY_DISSIPATION={2.5}
        VELOCITY_DISSIPATION={1.5}
        CURL={4}
        SPLAT_FORCE={4000}
        SPLAT_RADIUS={0.3}
      />
      
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <img 
              src="/logo.png" 
              alt="The Well" 
              className="brand-logo-img"
              draggable={false}
            />
          </div>
          <p className="auth-subtitle">The Well Recruiting Solutions<br/>Content Studio</p>
        </div>

        {/* Error/Success Messages */}
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

        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={handleSendOTP} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <Mail className="label-icon" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="form-input"
                disabled={loading}
                required
              />
              <p className="form-hint">
                We'll send you a secure sign-in code to access The Well Recruiting Solutions platform
              </p>
            </div>

            <button
              type="submit"
              className="auth-button primary"
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  Send Sign-In Code
                  <ArrowRight className="button-icon" />
                </>
              )}
            </button>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <Key className="label-icon" />
                Verification Code
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="form-input code-input"
                maxLength={6}
                disabled={loading}
                required
              />
              <p className="form-hint">
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>
            </div>

            <button
              type="submit"
              className="auth-button primary"
              disabled={loading || !otpCode.trim()}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  Verify & Sign In
                  <ArrowRight className="button-icon" />
                </>
              )}
            </button>

            <div className="auth-actions">
              <button
                type="button"
                onClick={resendOTP}
                className="auth-link"
                disabled={loading}
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtpCode('');
                  setError('');
                  setSuccess('');
                }}
                className="auth-link"
                disabled={loading}
              >
                Change email
              </button>
            </div>
          </form>
        )}

        {/* Access Token Alternative - Removed for production */}
        {/* {step === 'email' && (
          <AccessTokenInput onTokenSubmit={() => onSuccess?.()} />
        )} */}

        {/* Company Info */}
        <div className="auth-footer">
          <p className="company-info">
            Secure access to The Well Recruiting Solutions platform.<br/>
            Multiple users from the same company can collaborate.
          </p>
          <div className="brand-protection-notice">
            © The Well 2025
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;