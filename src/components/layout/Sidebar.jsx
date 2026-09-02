import React from 'react';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  ClipboardList, 
  Package, 
  ChefHat, 
  Boxes, 
  Gauge, 
  Users, 
  Globe, 
  FileUp, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export default function Sidebar({ currentRoute, onNavigate, currentUser, pendingPlansCount = 0 }) {
  const navSections = [
    {
      title: 'Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'create-plan', label: 'Create Plan', icon: CalendarPlus, highlight: true },
        { id: 'production-plans', label: 'Production Plans', icon: ClipboardList, badge: pendingPlansCount }
      ]
    },
    {
      title: 'Master Data',
      items: [
        { id: 'sku-master', label: 'SKU Master', icon: Package },
        { id: 'recipe-bom', label: 'Recipe BOM', icon: ChefHat },
        { id: 'packaging-bom', label: 'Packaging BOM', icon: Boxes },
        { id: 'capacity-master', label: 'Capacity Master', icon: Gauge },
        { id: 'staff-summary', label: 'Staff Summary', icon: Users },
        { id: 'countries', label: 'Countries', icon: Globe }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'import-data', label: 'Import Data (CSV)', icon: FileUp },
        { id: 'users-roles', label: 'Users & Roles', icon: ShieldCheck, adminOnly: true }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="sidebar-title">Snack Planner</div>
          <div className="sidebar-subtitle">MRP-Lite Manufacturing</div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="sidebar-nav">
        {navSections.map(section => (
          <div key={section.title}>
            <div className="nav-section-title">{section.title}</div>
            {section.items.map(item => {
              // Hide admin-only items if current user is not admin
              if (item.adminOnly && currentUser?.role !== 'admin') return null;

              const Icon = item.icon;
              const isActive = currentRoute === item.id;

              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon size={18} style={{ color: isActive ? 'var(--primary-400)' : 'inherit' }} />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="nav-item-badge">{item.badge}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="sidebar-footer">
        <div className="user-avatar">
          {currentUser?.avatar || 'AD'}
        </div>
        <div className="user-info">
          <div className="user-name">{currentUser?.full_name || 'Plant User'}</div>
          <span className={`user-role-badge role-${currentUser?.role || 'admin'}`}>
            {(currentUser?.role || 'admin').replace('_', ' ')}
          </span>
        </div>
      </div>
    </aside>
  );
}
