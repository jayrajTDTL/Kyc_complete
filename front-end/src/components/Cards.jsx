import React from 'react';
import '../styles/Cards.css';

export const ModuleCard = ({ title, description, icon, onClick }) => {
  return (
    <div className="module-card" onClick={onClick}>
      <div className="module-card-icon">{icon}</div>
      <h3 className="module-card-title">{title}</h3>
      <p className="module-card-description">{description}</p>
      <div className="module-card-arrow">→</div>
    </div>
  );
};

export const DashboardCard = ({ title, value, subtitle, icon, trend = null }) => {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-icon">{icon}</div>
        <div className="card-title-section">
          <h4 className="card-title">{title}</h4>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="card-value">{value}</div>
      {trend && (
        <div className={`card-trend ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
};
