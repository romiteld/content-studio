import React from 'react';

interface RoleCardProps {
  title: string;
  description: string;
  keyPoints?: string[];
  compensation?: {
    base: string;
    bonus: string;
    total: string;
    equity?: string;
  };
}

const RoleCard: React.FC<RoleCardProps> = ({ 
  title, 
  description, 
  keyPoints, 
  compensation 
}) => {
  return (
    <div className="role-card">
      <h3 className="role-title">{title}</h3>
      
      <div className="role-description">
        <p>{description}</p>
      </div>
      
      {keyPoints && keyPoints.length > 0 && (
        <div className="key-points">
          <ul>
            {keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
      
      {compensation && (
        <div className="compensation-grid">
          <div className="comp-item">
            <div className="comp-label">Base Salary</div>
            <div className="comp-value">{compensation.base}</div>
          </div>
          <div className="comp-item">
            <div className="comp-label">Bonus</div>
            <div className="comp-value">{compensation.bonus}</div>
          </div>
          <div className="comp-item">
            <div className="comp-label">Total Comp</div>
            <div className="comp-value">{compensation.total}</div>
          </div>
          {compensation.equity && (
            <div className="comp-item">
              <div className="comp-label">Equity</div>
              <div className="comp-value">{compensation.equity}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoleCard;