import React from 'react';
import { Database, RotateCcw, Shield, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
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
    dashboard: 'Manufacturing Dashboard',
    'create-plan': 'Create Production Plan',
    'production-plans': 'Production Plans & Schedule',
    'plan-details': 'Production Plan Dossier',
    'sku-master': 'SKU & Pack Configuration Master',
    'recipe-bom': 'Recipe Bill of Materials (BOM)',
    'packaging-bom': 'Packaging Bill of Materials (BOM)',
    'capacity-master': 'Plant & Chef Capacity Master',
    'staff-summary': 'Labor & Staff Directory',
    countries: 'Destination Countries',
    'import-data': 'CSV Master Data Importer',
    'users-roles': 'User Access & Permissions'
  };

  const isConfigured = isSupabaseConfigured();
  const usingMock = isUsingMock();

  return (
    <header className="top-navbar no-print">
      <div className="top-nav-left">
        <h1 className="page-title-badge">
          {routeTitles[currentRoute] || 'Snack Production Planner'}
        </h1>

        {/* Database Mode Pill */}
        <div 
          className={`db-mode-indicator ${usingMock ? 'db-mode-mock' : 'db-mode-supabase'}`}
          title={usingMock ? 'Running on Local Mock Storage (Zero latency, persistent)' : 'Connected to Supabase PostgreSQL'}
          style={{ cursor: isConfigured ? 'pointer' : 'default' }}
          onClick={isConfigured ? onToggleDbMode : undefined}
        >
          <Database size={13} />
          <span>{usingMock ? 'Demo Mode (Local)' : 'Supabase Live DB'}</span>
          {isConfigured && (
            <span style={{ fontSize: '10px', textDecoration: 'underline', marginLeft: '2px' }}>
              (switch)
            </span>
          )}
        </div>
      </div>

      <div className="top-nav-right">
        {/* Quick Role Switcher for Testing PRD Roles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={14} color="var(--slate-500)" />
          <span style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: 500 }}>Active Role:</span>
          <select 
            className="role-switch-select"
            value={currentUser?.role || 'admin'}
            onChange={e => onRoleChange(e.target.value)}
          >
            <option value="admin">Admin (Full CRUD)</option>
            <option value="production_manager">Production Manager (Planning & Orders)</option>
            <option value="viewer">Floor Staff / Viewer (Read-Only)</option>
          </select>
        </div>

        {/* Reset Mock Data Button */}
        {usingMock && (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onResetData}
            title="Reset demo data to initial factory state"
          >
            <RotateCcw size={13} />
            Reset Data
          </button>
        )}

        {/* Logout */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onLogout}
          title="Sign out"
        >
          <LogOut size={13} />
        </button>
      </div>
    </header>
  );
}
