import React, { useState } from 'react';
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
  Search,
  ChevronRight,
  MoreVertical,
  X
} from 'lucide-react';

export default function Sidebar({ currentRoute, onNavigate, currentUser, pendingPlansCount = 0 }) {
  const [isHovered, setIsHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItemId, setHoveredItemId] = useState(null);

  // Flat navigation list without any categorization headers
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, desc: 'Plant KPI & Metrics' },
    { id: 'create-plan', label: 'Create Plan', icon: CalendarPlus, desc: 'New Production Batch', canEditOnly: true },
    { id: 'production-plans', label: 'Production Plans', icon: ClipboardList, desc: 'Batch Orders & Schedules', badge: pendingPlansCount },
    { id: 'countries', label: 'Countries', icon: Globe, desc: 'Export Destinations' },
    { id: 'capacity-master', label: 'Capacity Master', icon: Gauge, desc: 'Line Limits & Speeds' },
    { id: 'recipe-bom', label: 'Recipe BOM', icon: ChefHat, desc: 'Formulas & Batches' },
    { id: 'sku-master', label: 'Products Master', icon: Package, desc: 'Finished Savouries & SKUs' },
    { id: 'packaging-bom', label: 'Packaging BOM', icon: Boxes, desc: 'Cartons, Pouches & Film' },
    { id: 'staff-summary', label: 'Staff Directory', icon: Users, desc: 'Operators & Headcount' },
    { id: 'import-data', label: 'Import CSV', icon: FileUp, desc: 'Bulk Master Data Ingest', adminOnly: true },
    { id: 'users-roles', label: 'Users & Roles', icon: ShieldCheck, desc: 'Operator Privileges', adminOnly: true }
  ];

  const filteredItems = navItems.filter(item => {
    // Hide admin-only items if current user is not admin
    if (item.adminOnly && currentUser?.role !== 'admin') return false;
    // Hide edit-only items (like Create Plan) if user is viewer
    if (item.canEditOnly && currentUser?.role === 'viewer') return false;
    if (!searchQuery.trim()) return true;
    return item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (item.desc && item.desc.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const userEmail = currentUser?.email || (currentUser?.role === 'admin' ? 'admin@snackmrp.com' : 'operator@snackmrp.com');

  return (
    <aside className="sidebar-track">
      <div 
        className={`sidebar-dock ${isHovered ? 'dock-expanded' : 'dock-collapsed'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoveredItemId(null);
          setSearchQuery('');
        }}
      >
        {/* Profile / Header Section */}
        <div className="dock-header">
          <div className="dock-user-lockup">
            <div className="dock-avatar-wrapper">
              <div className="dock-avatar">
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="User" />
                ) : (
                  <img src="/app-logo.png" alt="Chef Logo" className="dock-avatar-img" />
                )}
              </div>
              <span className="dock-status-dot" title="Online" />
            </div>

            <div className="dock-user-details">
              <div className="dock-user-name" title={currentUser?.full_name || 'Plant Operator'}>
                {currentUser?.full_name || 'Plant Operator'}
              </div>
              <div className="dock-user-email" title={userEmail}>
                {userEmail}
              </div>
            </div>

            <button 
              className="dock-header-action-btn"
              title="User Options"
              onClick={() => onNavigate('users-roles')}
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Search Box (Visible when exploded) */}
          <div className="dock-search-wrapper">
            <Search size={15} className="dock-search-icon" />
            <input
              type="text"
              className="dock-search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="dock-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Unified Flat Navigation List (No Categorization) */}
        <nav className="dock-nav-list">
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            const isItemHovered = hoveredItemId === item.id;

            return (
              <div 
                key={item.id}
                className="dock-item-wrapper"
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                <button
                  className={`dock-nav-btn ${isActive ? 'dock-active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                  title={!isHovered ? item.label : undefined}
                >
                  <div className="dock-icon-box">
                    <Icon size={19} className="dock-icon" />
                    {item.badge && !isHovered ? (
                      <span className="dock-icon-badge-dot">{item.badge}</span>
                    ) : null}
                  </div>

                  <div className="dock-label-box">
                    <span className="dock-item-label">{item.label}</span>
                    {item.badge ? (
                      <span className="dock-item-badge">{item.badge}</span>
                    ) : (
                      <ChevronRight size={14} className="dock-item-arrow" />
                    )}
                  </div>
                </button>

                {/* Instant Popover Flyout Pill in Collapsed Mode */}
                {!isHovered && isItemHovered && (
                  <div className="dock-flyout-pill" onClick={() => onNavigate(item.id)}>
                    <div className="dock-flyout-header">
                      <span className="dock-flyout-title">{item.label}</span>
                      <ChevronRight size={13} className="dock-flyout-arrow" />
                    </div>
                    {item.desc && (
                      <div className="dock-flyout-desc">{item.desc}</div>
                    )}
                    {item.badge ? (
                      <div className="dock-flyout-badge-line">
                        <span className="dock-item-badge">{item.badge} active</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

