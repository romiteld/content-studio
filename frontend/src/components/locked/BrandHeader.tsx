import React from 'react';
import { ShootingStars } from '../ui/shooting-stars';

interface BrandHeaderProps {
  title?: string;
  subtitle?: string;
}

const BrandHeader: React.FC<BrandHeaderProps> = ({ title, subtitle }) => {
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
      </div>
    </div>
  );
};

export default BrandHeader;