import React from 'react';

/**
 * Modern iOS / Material style swipe toggle switch
 */
export default function SwipeSwitch({
  checked = true,
  onChange,
  label = '',
  color = '#22c55e',
  size = 'md',
  disabled = false,
  badgeText = null
}) {
  const isSm = size === 'sm';
  const width = isSm ? 32 : 40;
  const height = isSm ? 18 : 22;
  const circleSize = isSm ? 14 : 16;
  const translate = isSm ? 14 : 18;

  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        opacity: disabled ? 0.5 : 1
      }}
      onClick={(e) => {
        if (disabled) return;
        e.preventDefault();
        onChange && onChange(!checked);
      }}
    >
      <div
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!disabled && onChange) onChange(!checked);
          }
        }}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: `${height}px`,
          backgroundColor: checked ? color : 'rgba(255, 255, 255, 0.15)',
          boxShadow: checked ? `0 0 12px ${color}66` : 'none',
          position: 'relative',
          transition: 'background-color 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s ease',
          flexShrink: 0,
          border: `1.5px solid ${checked ? color : 'rgba(255, 255, 255, 0.25)'}`
        }}
      >
        <div
          style={{
            width: `${circleSize}px`,
            height: `${circleSize}px`,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            position: 'absolute',
            top: `${(height - circleSize - 3) / 2}px`,
            left: '2px',
            transform: checked ? `translateX(${translate}px)` : 'translateX(0)',
            transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.35)'
          }}
        />
      </div>

      {label && (
        <span style={{ fontSize: isSm ? '12px' : '13px', fontWeight: 600, color: checked ? '#ffffff' : 'var(--text-muted)' }}>
          {label}
        </span>
      )}

      {badgeText && (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            background: checked ? `${color}25` : 'rgba(239, 68, 68, 0.15)',
            color: checked ? color : '#f87171',
            border: `1px solid ${checked ? color + '44' : 'rgba(239, 68, 68, 0.3)'}`
          }}
        >
          {badgeText}
        </span>
      )}
    </label>
  );
}
