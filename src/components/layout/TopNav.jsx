import React from 'react';
import { Database, RotateCcw, Shield, LogOut, ChevronRight } from 'lucide-react';
import { isSupabaseConfigured, isUsingMock } from '../../services/dataService';

export default function TopNav({ 
  currentRoute, 
  currentUser, 
  onRoleChange, 
  onResetData, 
  onToggleDbMode,
  onLogout 
}) {
  const routeTitles = {
    dashboard: 'Operations Dashboard',
    'create-plan': 'Create Production Plan',
    'production-plans': 'Production Plans Register',
    'plan-details': 'Production Dossier',
    'sku-master': 'SKU Master',
    'recipe-bom': 'Recipe BOM',
    'packaging-bom': 'Packaging BOM',
    'capacity-master': 'Capacity Master',
    'staff-summary': 'Staff Directory',
    countries: 'Export Countries',
    'import-data': 'CSV Importer',
    'users-roles': 'Users & Permissions'
  };

  const isConfigured = isSupabaseConfigured();
  const usingMock = isUsingMock();

  return (
    <header className="top-navbar no-print">
      <div className="top-nav-left">
        {/* Minimal Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Snack MRP</span>
          <ChevronRight size={14} color="var(--text-muted)" />
          <h1 className="page-title-badge">
            {routeTitles[currentRoute] || 'Overview'}
          </h1>
        </div>

        {/* Database Mode Indicator */}
        <div 
          className={`db-mode-indicator ${usingMock ? 'db-mode-mock' : 'db-mode-supabase'}`}
          title={usingMock ? 'Running on Local Storage. Changes persist in your browser.' : 'Connected to Supabase PostgreSQL'}
          style={{ cursor: isConfigured ? 'pointer' : 'default' }}
          onClick={isConfigured ? onToggleDbMode : undefined}
        >
          <Database size={12} />
          <span>{usingMock ? 'Local Demo' : 'Supabase Live'}</span>
          {isConfigured && (
            <span style={{ fontSize: '10px', textDecoration: 'underline', opacity: 0.8 }}>
              (switch)
            </span>
          )}
        </div>
      </div>

      <div className="top-nav-right">
        {/* Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={13} color="var(--text-muted)" />
          <select 
            className="role-switch-select"
            value={currentUser?.role || 'admin'}
            onChange={e => onRoleChange(e.target.value)}
            title="Switch user role to simulate Admin, Manager, or Viewer access"
          >
            <option value="admin">Admin (Full Access)</option>
            <option value="production_manager">Production Manager</option>
            <option value="viewer">Viewer (Read Only)</option>
          </select>
        </div>

        {/* Reset Mock Data */}
        {usingMock && (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onResetData}
            title="Reset data back to factory default seed"
          >
            <RotateCcw size={12} />
            Reset Data
          </button>
        )}

        {/* Logout */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onLogout}
          title="Sign Out"
        >
          <LogOut size={12} />
        </button>
      </div>
    </header>
  );
}
