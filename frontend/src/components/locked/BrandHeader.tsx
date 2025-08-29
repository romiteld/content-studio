import React from 'react';
import { ShootingStars } from '../ui/shooting-stars';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';

interface BrandHeaderProps {
  title?: string;
  subtitle?: string;
}

const BrandHeader: React.FC<BrandHeaderProps> = ({ title, subtitle }) => {
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };
  
  return (
    <div className="brand-header">
      {/* Starry night background with shooting stars */}
      <div className="starry-background">
        <div className="stars-overlay" />
        <ShootingStars
          starColor="#D4AF37"
          trailColor="#4FC3F7"
          minSpeed={8}
          maxSpeed={25}
          minDelay={1500}
          maxDelay={3500}
          starWidth={12}
          starHeight={2}
        />
        <ShootingStars
          starColor="#4FC3F7"
          trailColor="#D4AF37"
          minSpeed={5}
          maxSpeed={20}
          minDelay={2000}
          maxDelay={4000}
          starWidth={8}
          starHeight={1}
        />
      </div>
      
      {/* Content - stays consistent regardless of page */}
      <div className="brand-header-content">
        <img 
          src="/logo.png" 
          alt="The Well" 
          className="brand-logo"
          draggable={false}
        />
        {title && <h1 className="brand-title">{title}</h1>}
        {subtitle && <p className="brand-subtitle">{subtitle}</p>}
        
        {user && (
          <button 
            className="sign-out-btn"
            onClick={handleSignOut}
            title="Sign Out"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: '#D4AF37',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
              e.currentTarget.style.borderColor = '#D4AF37';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};

export default BrandHeader;