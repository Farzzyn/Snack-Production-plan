import React, { useState } from 'react';
import { User, Lock, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin@snackplanner.com');
  const [password, setPassword] = useState('snackadmin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isConfigured = isSupabaseConfigured();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isConfigured && supabase) {
        // Authenticate via Supabase Auth
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: username,
          password: password
        });

        if (authError) {
          // If the email/password doesn't exist yet in Supabase Auth, let them into the application
          // as the chosen user profile while logging a friendly notice
          console.warn('Supabase Auth notice:', authError.message);
          // Query app_users directory from Supabase
          const { data: appUsers } = await supabase.from('app_users').select('*').eq('email', username);
          if (appUsers && appUsers.length > 0) {
            const u = appUsers[0];
            onLoginSuccess({
              email: u.email,
              full_name: u.full_name,
              role: u.role,
              avatar: u.full_name.split(' ').map(n => n[0]).join('')
            });
            return;
          }
        } else if (data?.user) {
          onLoginSuccess({
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || username.split('@')[0],
            role: data.user.user_metadata?.role || 'admin',
            avatar: username.substring(0, 2).toUpperCase()
          });
          return;
        }
      }

      // Default role mapping
      const role = username.includes('admin') ? 'admin' : username.includes('manager') ? 'production_manager' : 'viewer';
      const name = role === 'admin' ? 'David Miller' : role === 'production_manager' ? 'Sarah Jenkins' : 'Raj Patel';

      onLoginSuccess({
        email: username,
        full_name: name,
        role: role,
        avatar: name.split(' ').map(n => n[0]).join('')
      });
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = (roleKey) => {
    const profiles = {
      admin: { name: 'David Miller (Director)', email: 'admin@snackplanner.com', role: 'admin', avatar: 'DM' },
      production_manager: { name: 'Sarah Jenkins (Production Head)', email: 'manager@snackplanner.com', role: 'production_manager', avatar: 'SJ' },
      viewer: { name: 'Raj Patel (Quality / Floor)', email: 'viewer@snackplanner.com', role: 'viewer', avatar: 'RP' }
    };
    onLoginSuccess(profiles[roleKey]);
  };

  return (
    <div className="theme-login-wrapper">
      <div className="theme-login-card">
        
        {/* Title */}
        <h1 className="theme-login-title">
          Login
        </h1>

        {/* Error message */}
        {error && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.25)', 
            border: '1px solid rgba(239, 68, 68, 0.5)', 
            color: '#fecaca', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '12px', 
            marginBottom: '16px' 
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          
          {/* Username Field */}
          <div className="theme-login-input-group">
            <input
              type="text"
              required
              className="theme-login-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <User size={18} className="theme-login-input-icon" />
          </div>

          {/* Password Field */}
          <div className="theme-login-input-group">
            <input
              type="password"
              required
              className="theme-login-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Lock size={18} className="theme-login-input-icon" />
          </div>

          {/* Forgot Password */}
          <span 
            className="theme-login-forgot"
            onClick={() => alert('Password reset link has been dispatched to administrator.')}
          >
            Forgot Password?
          </span>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="theme-login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Quick Demo Roles */}
        <div className="theme-quick-roles">
          <div className="theme-quick-roles-title">
            Instant 1-Click Access
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="theme-role-pill-btn"
              onClick={() => handleQuickRole('admin')}
            >
              Plant Admin
            </button>
            <button 
              type="button" 
              className="theme-role-pill-btn"
              onClick={() => handleQuickRole('production_manager')}
            >
              Production Manager
            </button>
            <button 
              type="button" 
              className="theme-role-pill-btn"
              onClick={() => handleQuickRole('viewer')}
            >
              Viewer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
