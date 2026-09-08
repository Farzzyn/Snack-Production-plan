import React from 'react';
import { RotateCcw, Shield, LogOut, ChevronRight } from 'lucide-react';
import { isUsingMock } from '../../services/dataService';

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
      </div>

      <div className="top-nav-right">
        {/* Authenticated User Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={14} color="var(--primary-600)" />
          <span 
            className={`user-role-badge role-${currentUser?.role || 'viewer'}`} 
            style={{ fontSize: '11px', padding: '4px 10px', textTransform: 'capitalize' }}
            title={`Authenticated as ${currentUser?.full_name || 'User'} (${currentUser?.role})`}
          >
            {currentUser?.role === 'admin' 
              ? 'Plant Admin' 
              : currentUser?.role === 'production_manager' 
              ? 'Production Editor' 
              : 'Floor Viewer'}
          </span>
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
