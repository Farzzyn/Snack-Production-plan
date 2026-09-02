import React from 'react';

export default function KPICard({ label, value, subtext, icon: Icon, color = 'primary' }) {
  const colorMap = {
    primary: { bg: '#e0f2fe', color: '#0284c7' },
    success: { bg: '#d1fae5', color: '#059669' },
    warning: { bg: '#fef3c7', color: '#d97706' },
    purple: { bg: '#ede9fe', color: '#7c3aed' },
    slate: { bg: '#f1f5f9', color: '#475569' }
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="kpi-card">
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {subtext && <div className="kpi-subtext">{subtext}</div>}
      </div>
      {Icon && (
        <div className="kpi-icon-wrap" style={{ backgroundColor: scheme.bg, color: scheme.color }}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}
