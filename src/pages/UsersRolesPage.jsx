import React, { useState } from 'react';
import { ShieldCheck, Plus, Trash2, Edit2, Check, X, Shield, Lock, Eye } from 'lucide-react';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

export default function UsersRolesPage({
  users = [],
  onSaveUser,
  onDeleteUser,
  currentUser
}) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    role: 'production_manager',
    is_active: true
  });

  const canEdit = currentUser?.role === 'admin';

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({ ...user });
  };

  const saveEdit = async () => {
    await onSaveUser(editForm);
    setEditingId(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newUser.email.trim() || !newUser.full_name.trim()) return;
    await onSaveUser(newUser);
    setIsAddModalOpen(false);
    setNewUser({
      full_name: '',
      email: '',
      role: 'production_manager',
      is_active: true
    });
  };

  const columns = [
    {
      header: 'User Name',
      key: 'full_name',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <input
              type="text"
              className="input"
              style={{ minWidth: '180px', padding: '4px 8px' }}
              value={editForm.full_name || ''}
              onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
            />
          );
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '11px' }}>
              {row.avatar || val.substring(0, 2).toUpperCase()}
            </div>
            <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{val}</span>
          </div>
        );
      }
    },
    {
      header: 'Email Address',
      key: 'email',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <input
              type="email"
              className="input"
              style={{ minWidth: '200px', padding: '4px 8px' }}
              value={editForm.email || ''}
              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
            />
          );
        }
        return <span style={{ color: 'var(--slate-600)' }}>{val}</span>;
      }
    },
    {
      header: 'Assigned Role',
      key: 'role',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <select
              className="select"
              style={{ padding: '4px 8px' }}
              value={editForm.role}
              onChange={e => setEditForm({ ...editForm, role: e.target.value })}
            >
              <option value="admin">admin</option>
              <option value="production_manager">production_manager</option>
              <option value="viewer">viewer</option>
            </select>
          );
        }
        return (
          <span className={`user-role-badge role-${val}`} style={{ fontSize: '11px', padding: '3px 8px' }}>
            {val.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      header: 'Account Status',
      key: 'is_active',
      align: 'center',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <input
              type="checkbox"
              checked={editForm.is_active !== false}
              onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })}
            />
          );
        }
        return (
          <span className={`badge ${val !== false ? 'badge-completed' : 'badge-draft'}`}>
            {val !== false ? 'Active' : 'Disabled'}
          </span>
        );
      }
    },
    ...(canEdit ? [{
      header: 'Actions',
      align: 'center',
      render: (_, row) => {
        const isEditing = editingId === row.id;
        if (isEditing) {
          return (
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={saveEdit}>
                <Check size={13} />
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                <X size={13} />
              </button>
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(row)}>
              <Edit2 size={13} />
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDeleteUser(row.id)}>
              <Trash2 size={13} />
            </button>
          </div>
        );
      }
    }] : [])
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', marginBottom: '24px' }}>
        
        {/* Table of Users */}
        <DataTable
          title="Application User Accounts"
          description="Manage operator profiles, authentication mappings, and role-based permissions"
          columns={columns}
          data={users}
          searchable={true}
          searchPlaceholder="Search users..."
          actionButton={canEdit ? (
            <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={14} /> Add User
            </button>
          ) : null}
        />

        {/* Role Permissions Matrix Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Lock size={18} color="var(--primary-600)" />
              Role Permission Matrix
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div style={{ borderLeft: '3px solid #dc2626', paddingLeft: '12px' }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>1. Admin</div>
              <div style={{ color: 'var(--slate-500)', fontSize: '12px' }}>
                Full CRUD permissions on all database tables, user management, recipe editing, unit costing, capacity calibration, and CSV imports.
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #0284c7', paddingLeft: '12px' }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>2. Production Manager</div>
              <div style={{ color: 'var(--slate-500)', fontSize: '12px' }}>
                Create and generate production plans, update order statuses, schedule chef quantities, and review BOM calculations. Read-only on core recipes and costs.
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #64748b', paddingLeft: '12px' }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>3. Floor Staff / Viewer</div>
              <div style={{ color: 'var(--slate-500)', fontSize: '12px' }}>
                Read-only access to view daily production schedules, batch quantities, and ingredient requirement lists. Cannot alter plans, recipes, or costs.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Application User Account"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Create User</button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="input"
              placeholder="E.g., John Doe"
              value={newUser.full_name}
              onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="input"
              placeholder="E.g., operator@snackplanner.com"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">System Role *</label>
            <select
              className="select"
              value={newUser.role}
              onChange={e => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="admin">admin (Full CRUD access)</option>
              <option value="production_manager">production_manager (Create & edit plans)</option>
              <option value="viewer">viewer (Read-only)</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
