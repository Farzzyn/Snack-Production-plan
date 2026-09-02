import React, { useState } from 'react';
import { Sparkles, Shield, User, KeyRound, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@snackplanner.com');
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
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (authError) throw authError;
        onLoginSuccess({
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          role: data.user.user_metadata?.role || 'admin',
          avatar: email.substring(0, 2).toUpperCase()
        });
        return;
      }

      // Demo login
      const role = email.includes('admin') ? 'admin' : email.includes('manager') ? 'production_manager' : 'viewer';
      const name = role === 'admin' ? 'David Miller' : role === 'production_manager' ? 'Sarah Jenkins' : 'Raj Patel';

      onLoginSuccess({
        email,
        full_name: name,
        role,
        avatar: name.split(' ').map(n => n[0]).join('')
      });
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role) => {
    const roles = {
      admin: { name: 'David Miller (Plant Director)', email: 'admin@snackplanner.com', role: 'admin', avatar: 'DM' },
      production_manager: { name: 'Sarah Jenkins (Production Head)', email: 'manager@snackplanner.com', role: 'production_manager', avatar: 'SJ' },
      viewer: { name: 'Raj Patel (Floor Staff)', email: 'viewer@snackplanner.com', role: 'viewer', avatar: 'RP' }
    };
    onLoginSuccess(roles[role]);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--navy-950)',
      backgroundImage: 'radial-gradient(ellipse at top, #1e293b, #090d16)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden'
      }}>
        {/* Header Banner */}
        <div style={{
          backgroundColor: 'var(--navy-900)',
          padding: '32px 28px',
          textAlign: 'center',
          color: 'white',
          borderBottom: '1px solid var(--navy-800)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, var(--primary-500), #0369a1)',
            borderRadius: 'var(--radius-lg)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginBottom: '14px',
            boxShadow: '0 8px 16px rgba(2, 132, 199, 0.35)'
          }}>
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'white' }}>
            Snack Production Planner
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--slate-400)', marginTop: '4px' }}>
            Enterprise MRP-Lite Manufacturing System
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px' }}>
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-group">
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '10px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Operations'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--slate-200)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate-500)', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>
              Instant Demo Access (Click to test roles)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
                onClick={() => handleQuickLogin('admin')}
              >
                <span className="user-role-badge role-admin" style={{ marginRight: '6px' }}>Admin</span>
                <span>Plant Director (Full CRUD, BOMs, Users)</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
                onClick={() => handleQuickLogin('production_manager')}
              >
                <span className="user-role-badge role-production_manager" style={{ marginRight: '6px' }}>Manager</span>
                <span>Production Head (Planning, Orders, Schedules)</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
                onClick={() => handleQuickLogin('viewer')}
              >
                <span className="user-role-badge role-viewer" style={{ marginRight: '6px' }}>Viewer</span>
                <span>Floor Staff (Read-Only Schedules & BOMs)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
