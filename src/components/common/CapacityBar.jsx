import React from 'react';
import { AlertTriangle, CheckCircle2, TrendingUp, Users } from 'lucide-react';

export default function CapacityBar({ 
  requiredKg = 0, 
  availableKg = 0, 
  utilization = 0, 
  isExceeded = false, 
  chefCount = 1,
  recommendedChefs = 1 
}) {
  const barClass = isExceeded ? 'cap-danger' : utilization > 85 ? 'cap-warn' : 'cap-ok';

  return (
    <div className="capacity-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={16} color="var(--brand-500)" />
          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
            Plant Capacity Utilization
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="num-tabular" style={{ fontWeight: 700, fontSize: '15px', color: isExceeded ? '#ef4444' : 'var(--text-primary)' }}>
            {utilization}%
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            ({requiredKg.toLocaleString()} / {availableKg.toLocaleString()} KG)
          </span>
        </div>
      </div>

      <div className="capacity-bar-track">
        <div 
          className={`capacity-bar-fill ${barClass}`} 
          style={{ width: `${Math.min(100, Math.max(2, utilization))}%` }}
        />
      </div>

      {isExceeded ? (
        <div className="alert alert-danger" style={{ marginTop: '10px' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600 }}>Capacity Exceeded!</div>
            <div>
              Required production ({requiredKg.toLocaleString()} KG) exceeds daily capacity ({availableKg.toLocaleString()} KG) with {chefCount} chef(s).
            </div>
            <div style={{ marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} />
              Recommended: Assign at least {recommendedChefs} chefs to fulfill this order within 1 day.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>Assigned: {chefCount} Chef(s)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80', fontWeight: 500 }}>
            <CheckCircle2 size={13} />
            Within daily production limits
          </span>
        </div>
      )}
    </div>
  );
}
