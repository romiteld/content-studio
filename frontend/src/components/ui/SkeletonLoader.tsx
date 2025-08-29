import React from 'react';
import './skeleton.css';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'shimmer';
  count?: number;
  spacing?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'shimmer',
  count = 1,
  spacing = 8
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return {
          width: width || '100%',
          height: height || '1.2em',
          borderRadius: '4px'
        };
      case 'rectangular':
        return {
          width: width || '100%',
          height: height || '120px',
          borderRadius: '8px'
        };
      case 'circular':
        return {
          width: width || '40px',
          height: height || width || '40px',
          borderRadius: '50%'
        };
      case 'card':
        return {
          width: width || '100%',
          height: height || '200px',
          borderRadius: '12px'
        };
      default:
        return {};
    }
  };

  const skeletonElements = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`skeleton skeleton-${variant} skeleton-${animation} ${className}`}
      style={{
        ...getVariantStyles(),
        marginBottom: index < count - 1 ? spacing : 0
      }}
    />
  ));

  return <>{skeletonElements}</>;
};

interface CardSkeletonProps {
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showImage = true,
  showTitle = true,
  showDescription = true,
  showActions = false
}) => {
  return (
    <div className="skeleton-card">
      {showImage && <Skeleton variant="rectangular" height={180} />}
      <div className="skeleton-card-content">
        {showTitle && <Skeleton variant="text" width="60%" height={24} />}
        {showDescription && (
          <>
            <Skeleton variant="text" spacing={4} />
            <Skeleton variant="text" spacing={4} />
            <Skeleton variant="text" width="80%" />
          </>
        )}
        {showActions && (
          <div className="skeleton-card-actions">
            <Skeleton variant="rectangular" width={80} height={32} />
            <Skeleton variant="rectangular" width={80} height={32} />
          </div>
        )}
      </div>
    </div>
  );
};

interface TextSkeletonProps {
  lines?: number;
  spacing?: number;
  lastLineWidth?: string;
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({
  lines = 3,
  spacing = 8,
  lastLineWidth = '60%'
}) => {
  return (
    <div className="skeleton-text">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? lastLineWidth : '100%'}
          spacing={index < lines - 1 ? spacing : 0}
        />
      ))}
    </div>
  );
};

interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 5,
  showAvatar = false,
  showActions = false
}) => {
  return (
    <div className="skeleton-list">
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="skeleton-list-item">
          {showAvatar && <Skeleton variant="circular" width={40} height={40} />}
          <div className="skeleton-list-content">
            <Skeleton variant="text" width="30%" height={20} />
            <Skeleton variant="text" width="70%" height={16} />
          </div>
          {showActions && (
            <Skeleton variant="rectangular" width={24} height={24} />
          )}
        </div>
      ))}
    </div>
  );
};

interface FormSkeletonProps {
  fields?: number;
  showLabels?: boolean;
  showButton?: boolean;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fields = 3,
  showLabels = true,
  showButton = true
}) => {
  return (
    <div className="skeleton-form">
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="skeleton-form-field">
          {showLabels && <Skeleton variant="text" width="30%" height={16} />}
          <Skeleton variant="rectangular" height={40} />
        </div>
      ))}
      {showButton && (
        <Skeleton variant="rectangular" width={120} height={40} />
      )}
    </div>
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true
}) => {
  return (
    <div className="skeleton-table">
      {showHeader && (
        <div className="skeleton-table-header">
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton key={index} variant="text" height={20} />
          ))}
        </div>
      )}
      <div className="skeleton-table-body">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="skeleton-table-row">
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton key={colIndex} variant="text" height={16} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;