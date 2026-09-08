import React, { useState, useEffect } from 'react';
import { User, Eye, EyeOff, AlertCircle, Clock } from 'lucide-react';
import AppLogo from '../components/common/AppLogo';
import { dataService } from '../services/dataService';
import { authenticateUser, checkLockout, clearLockout } from '../services/authService';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin@snackplanner.com');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lockoutSec, setLockoutSec] = useState(0);

  // Check lockout on mount and when username changes
  useEffect(() => {
    const status = checkLockout(username);
    if (status.isLocked) {
      setLockoutSec(status.remainingSec);
    } else {
      setLockoutSec(0);
    }
  }, [username]);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSec <= 0) return;
    const interval = setInterval(() => {
      setLockoutSec(prev => {
        if (prev <= 1) {
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSec]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (lockoutSec > 0) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch current users list from dataService (Supabase or LocalStorage)
      const userList = await dataService.getUsers();

      // 2. Cryptographically verify credentials with SHA-256 and brute-force protection
      const sessionUser = await authenticateUser(username, password, userList);

      // 3. Login successful
      onLoginSuccess(sessionUser);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
      // Update lockout if triggered
      const status = checkLockout(username);
      if (status.isLocked) {
        setLockoutSec(status.remainingSec);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-login-wrapper">
      <div className="theme-login-card">
        
        {/* Snack Brand Emblem & Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="login-logo-glow" style={{ marginBottom: '14px' }}>
            <AppLogo variant="icon" size={64} theme="dark" />
          </div>
          <h1 className="theme-login-title" style={{ marginBottom: '6px', fontSize: '30px' }}>
            Production Portal
          </h1>
          <div style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.85)', letterSpacing: '0.04em', fontWeight: 500 }}>
            Artisanal Savouries &bull; MRP Manufacturing
          </div>
        </div>

        {/* Lockout Notice */}
        {lockoutSec > 0 && (
          <div style={{ 
            backgroundColor: 'rgba(234, 88, 12, 0.3)', 
            border: '1px solid rgba(251, 146, 60, 0.6)', 
            color: '#ffedd5', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '12px', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#fb923c" />
              <div>
                <strong>Security Cooldown:</strong> Please wait {lockoutSec}s.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                clearLockout(username);
                setLockoutSec(0);
                setError(null);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                color: '#fff',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          </div>
        )}


        {/* Error message */}
        {error && lockoutSec === 0 && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.3)', 
            border: '1px solid rgba(239, 68, 68, 0.6)', 
            color: '#fecaca', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '12px', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          
          {/* Username / Email Field */}
          <div className="theme-login-input-group">
            <input
              type="email"
              required
              disabled={lockoutSec > 0 || loading}
              className="theme-login-input"
              placeholder="Email address"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <User size={18} className="theme-login-input-icon" />
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div className="theme-login-input-group" style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              disabled={lockoutSec > 0 || loading}
              className="theme-login-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ paddingRight: '50px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.85)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', margin: '4px 4px 22px' }}>
            <button
              type="button"
              className="theme-login-forgot"
              style={{ margin: 0, background: 'none', border: 'none', padding: 0 }}
              onClick={() => alert('For password resets, contact your designated System Administrator.')}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="theme-login-submit-btn"
            disabled={loading || lockoutSec > 0}
            style={{ opacity: (loading || lockoutSec > 0) ? 0.7 : 1, cursor: (loading || lockoutSec > 0) ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Signing in...' : lockoutSec > 0 ? `Locked (${lockoutSec}s)` : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}
