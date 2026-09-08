import React from 'react';

/**
 * AppLogo - Dedicated Brand Logo for Snack Production Planner
 * 
 * Features the Master Snack Chef mascot emblem in a theme-sinking
 * emerald green & golden circular crest, with crisp responsive typography.
 * 
 * Props:
 * - variant: 'full' (icon + text), 'icon' (emblem only), 'compact' (horizontal lockup)
 * - size: 'sm' | 'md' | 'lg' | 'xl' | number
 * - theme: 'dark' (for dark headers/login/sidebar) | 'light' (for dossiers/white paper)
 * - subtitle: custom subtitle or default
 * - className: additional CSS classes
 * - style: custom styles
 */
export default function AppLogo({
  variant = 'full',
  size = 'md',
  theme = 'dark',
  subtitle,
  className = '',
  style = {}
}) {
  // Dimension mapping
  const sizeMap = {
    sm: { icon: 30, titleSize: '14.5px', subSize: '9px', gap: '9px' },
    md: { icon: 42, titleSize: '16.5px', subSize: '10.5px', gap: '12px' },
    lg: { icon: 56, titleSize: '20px', subSize: '12px', gap: '14px' },
    xl: { icon: 76, titleSize: '26px', subSize: '13.5px', gap: '16px' }
  };

  const config = typeof size === 'number'
    ? { icon: size, titleSize: `${Math.round(size * 0.42)}px`, subSize: `${Math.round(size * 0.26)}px`, gap: '10px' }
    : (sizeMap[size] || sizeMap.md);

  const iconDim = config.icon;
  const isLight = theme === 'light';

  // CRUNCH Badge Emblem
  const CrunchIcon = (
    <div 
      className="app-logo-badge" 
      style={{ 
        width: `${iconDim}px`, 
        height: `${iconDim}px`,
        flexShrink: 0,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '22%',
        filter: isLight 
          ? 'drop-shadow(0 3px 6px rgba(20, 83, 45, 0.25))' 
          : 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45))'
      }}
    >
      <img
        src="/app-logo.png"
        alt="CRUNCH Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '22%',
          display: 'block'
        }}
      />
    </div>
  );

  if (variant === 'icon') {
    return (
      <div 
        className={`app-logo-container app-logo-icon-only ${className}`} 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
        title="CRUNCH - Snack Production Planner"
      >
        {CrunchIcon}
      </div>
    );
  }

  // Full Brand Lockup with Typography
  const defaultSub = isLight ? 'MRP Manufacturing System' : 'MRP-Lite Manufacturing';
  const displaySubtitle = subtitle !== undefined ? subtitle : defaultSub;

  return (
    <div 
      className={`app-logo-container app-logo-${variant} ${isLight ? 'theme-light' : 'theme-dark'} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: config.gap,
        textDecoration: 'none',
        ...style
      }}
    >
      {CrunchIcon}

      <div className="app-logo-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <div 
          className="app-logo-title"
          style={{
            fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
            fontSize: config.titleSize,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: isLight ? '#14532d' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <span>Snack</span>
          <span style={{ 
            color: isLight ? '#d97706' : '#fde68a',
            fontWeight: 700 
          }}>
            Planner
          </span>
        </div>

        {displaySubtitle && (
          <div 
            className="app-logo-subtitle"
            style={{
              fontSize: config.subSize,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: isLight ? '#526f5d' : '#9ec5ad',
              marginTop: '3px'
            }}
          >
            {displaySubtitle}
          </div>
        )}
      </div>
    </div>
  );
}
