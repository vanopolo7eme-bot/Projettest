import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

export default function StatCard({ label, value, icon, trend = null, trendValue = null, color = '#3498db' }) {
  // If value is a pure number, animate it
  const numericValue = typeof value === 'number' ? value : null;
  
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div>
          <div className="stat-card-label">{label}</div>
          <div className="stat-card-value">
            {numericValue !== null ? <AnimatedCounter value={numericValue} /> : value}
          </div>
        </div>
        <div className="stat-card-icon" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
      </div>
      {trendValue !== undefined && (
        <div className={`stat-card-trend ${trend === 'up' ? 'up' : 'down'}`}>
          {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
