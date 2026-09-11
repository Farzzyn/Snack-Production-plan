import React from 'react';

export default function KPICard({ label, value, subtext, icon: Icon, color = 'primary' }) {
  const colorMap = {
    primary: { bg: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' },
    success: { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' },
    purple: { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' },
    slate: { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' }
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
