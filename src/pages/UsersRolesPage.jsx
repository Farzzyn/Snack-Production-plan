import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Shield, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle2,
  UserX,
  UserCheck
} from 'lucide-react';
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
  
  // Add User Form State
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    role: 'production_manager',
    password: '',
    confirmPassword: '',
    is_active: true
  });
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [addError, setAddError] = useState('');

  // Password Reset Modal State
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

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
    setAddError('');

    if (!newUser.full_name.trim() || !newUser.email.trim()) {
      setAddError('Full name and email are required.');
      return;
    }

    if (!newUser.password || newUser.password.length < 6) {
      setAddError('Password must be at least 6 characters long.');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      setAddError('Passwords do not match.');
      return;
    }

    // Check if email already exists
    const emailExists = users.some(u => u.email.toLowerCase() === newUser.email.trim().toLowerCase());
    if (emailExists) {
      setAddError('A user with this email address already exists.');
      return;
    }

    try {
      await onSaveUser({
        full_name: newUser.full_name.trim(),
        email: newUser.email.trim().toLowerCase(),
        role: newUser.role,
        password: newUser.password,
        is_active: newUser.is_active
      });

      setIsAddModalOpen(false);
      setNewUser({
        full_name: '',
        email: '',
        role: 'production_manager',
        password: '',
        confirmPassword: '',
        is_active: true
      });
      setShowAddPassword(false);
    } catch (err) {
      setAddError(err.message || 'Failed to create user account.');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmResetPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    try {
      await onSaveUser({
        ...resetModalUser,
        password: newPassword
      });

      setResetSuccess(`Password updated successfully for ${resetModalUser.full_name}!`);
      setTimeout(() => {
        setResetModalUser(null);
        setNewPassword('');
        setConfirmResetPassword('');
        setResetSuccess('');
      }, 1200);
    } catch (err) {
      setResetError(err.message || 'Failed to reset password.');
    }
  };

  const toggleUserActiveStatus = async (user) => {
    if (!canEdit) return;
    const newStatus = user.is_active === false ? true : false;
    await onSaveUser({
      ...user,
      is_active: newStatus
    });
  };

  const columns = [
    {
      header: 'User & Access',
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
            <div className="user-avatar" style={{ width: '34px', height: '34px', fontSize: '11px', fontWeight: 700 }}>
              {row.avatar || val.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                {val}
                {row.id === currentUser?.id && (
                  <span style={{ fontSize: '10px', marginLeft: '6px', color: 'var(--primary-700)', fontWeight: 700 }}>
                    (You)
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>{row.email}</div>
            </div>
          </div>
        );
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
              <option value="admin">admin (Full CRUD + Users)</option>
              <option value="production_manager">production_manager (Editor: Plans)</option>
              <option value="viewer">viewer (Read Only)</option>
            </select>
          );
        }

        const roleLabels = {
          admin: 'Plant Admin',
          production_manager: 'Production Editor',
          viewer: 'Floor Viewer'
        };

        return (
          <span className={`user-role-badge role-${val}`} style={{ fontSize: '11px', padding: '3px 10px' }}>
            {roleLabels[val] || val.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      header: 'Account Status',
      key: 'is_active',
      align: 'center',
      render: (val, row) => {
        const isActive = val !== false;
        if (editingId === row.id) {
          return (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={editForm.is_active !== false}
                onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })}
              />
              <span>{editForm.is_active !== false ? 'Active' : 'Disabled'}</span>
            </label>
          );
        }
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className={`badge ${isActive ? 'badge-completed' : 'badge-draft'}`} style={{ padding: '2px 8px' }}>
              {isActive ? 'Active' : 'Disabled'}
            </span>
            {canEdit && row.id !== currentUser?.id && (
              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 6px', fontSize: '10px', height: '22px' }}
                onClick={() => toggleUserActiveStatus(row)}
                title={isActive ? 'Disable account (blocks login)' : 'Enable account'}
              >
                {isActive ? <UserX size={11} color="#dc2626" /> : <UserCheck size={11} color="#16a34a" />}
              </button>
            )}
          </div>
        );
      }
    },
    {
      header: 'Security Credential',
      key: 'password_status',
      align: 'center',
      render: (_, row) => (
        <span style={{ fontSize: '11.5px', color: 'var(--slate-600)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Lock size={12} color="#16a34a" /> SHA-256 Hashed
        </span>
      )
    },
    ...(canEdit ? [{
      header: 'Actions',
      align: 'center',
      render: (_, row) => {
        const isEditing = editingId === row.id;
        if (isEditing) {
          return (
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={saveEdit} title="Save Changes">
                <Check size={13} />
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)} title="Cancel">
                <X size={13} />
              </button>
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => startEdit(row)}
              title="Edit Profile & Role"
            >
              <Edit2 size={13} />
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => {
                setResetModalUser(row);
                setNewPassword('');
                setConfirmResetPassword('');
                setResetError('');
                setResetSuccess('');
              }}
              title="Reset Password"
              style={{ color: 'var(--primary-700)' }}
            >
              <KeyRound size={13} />
            </button>
            <button 
              className="btn btn-danger btn-sm" 
              onClick={() => onDeleteUser(row.id)}
              title="Delete User Account"
              disabled={row.id === currentUser?.id}
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      }
    }] : [])
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.2fr) minmax(0, 1fr)', gap: '24px', marginBottom: '24px' }}>
        
        {/* Table of Users */}
        <DataTable
          title="User Directory & Credentials"
          description="Manage operator profiles, passwords, role-based editing privileges, and login states."
          columns={columns}
          data={users}
          searchable={true}
          searchPlaceholder="Search users by name or email..."
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
              <ShieldCheck size={18} color="var(--primary-600)" />
              Security Role Matrix
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div style={{ borderLeft: '3px solid #dc2626', paddingLeft: '12px' }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>1. Plant Admin</div>
              <div style={{ color: 'var(--slate-600)', fontSize: '12px', marginTop: '2px' }}>
                Full CRUD permissions: manage user accounts, assign initial passwords, reset passwords, edit recipe BOMs, unit costs, machine capacity, and generate plans.
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #0284c7', paddingLeft: '12px' }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>2. Production Editor</div>
              <div style={{ color: 'var(--slate-600)', fontSize: '12px', marginTop: '2px' }}>
                Create & generate production plans, adjust shift schedules, and update production statuses. Read-only on recipe BOMs, cost structures, and user administration.
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #64748b', paddingLeft: '12px' }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>3. Floor Viewer</div>
              <div style={{ color: 'var(--slate-600)', fontSize: '12px', marginTop: '2px' }}>
                Strict read-only observation. Can inspect production schedules, view ingredient batches, and download reports. Cannot modify data or access user administration.
              </div>
            </div>

            <div style={{ 
              background: 'var(--slate-50)', 
              padding: '10px 12px', 
              borderRadius: 'var(--radius-md)', 
              fontSize: '11.5px', 
              color: 'var(--slate-600)',
              marginTop: '8px'
            }}>
              🔒 <strong>Security Policy:</strong> Passwords are cryptographic SHA-256 hashed. Disabled accounts are immediately blocked from authenticating.
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Authorized User Account"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Create & Encrypt</button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          {addError && (
            <div style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              color: '#dc2626', 
              padding: '8px 12px', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '12px', 
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={14} />
              <span>{addError}</span>
            </div>
          )}

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
            <label className="form-label">Email Address (Username for Login) *</label>
            <input
              type="email"
              className="input"
              placeholder="E.g., john@snackplanner.com"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Role & Permissions *</label>
            <select
              className="select"
              value={newUser.role}
              onChange={e => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="admin">Plant Admin (Full CRUD & User Management)</option>
              <option value="production_manager">Production Editor (Create & Edit Plans)</option>
              <option value="viewer">Floor Viewer (Read-Only Access)</option>
            </select>
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Initial Password (min 6 characters) *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showAddPassword ? 'text' : 'password'}
                className="input"
                placeholder="Assign secure password"
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowAddPassword(!showAddPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--slate-500)'
                }}
              >
                {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              type={showAddPassword ? 'text' : 'password'}
              className="input"
              placeholder="Confirm password"
              value={newUser.confirmPassword}
              onChange={e => setNewUser({ ...newUser, confirmPassword: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <input
              type="checkbox"
              id="newUserActive"
              checked={newUser.is_active}
              onChange={e => setNewUser({ ...newUser, is_active: e.target.checked })}
            />
            <label htmlFor="newUserActive" style={{ fontSize: '13px', cursor: 'pointer' }}>
              Activate account immediately (permits login)
            </label>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetModalUser}
        onClose={() => setResetModalUser(null)}
        title={`Reset Password for ${resetModalUser?.full_name || 'User'}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setResetModalUser(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleResetPasswordSubmit}>Save New Password</button>
          </>
        }
      >
        <form onSubmit={handleResetPasswordSubmit}>
          <div style={{ fontSize: '12.5px', color: 'var(--slate-600)', marginBottom: '16px' }}>
            Assign a new password for <strong>{resetModalUser?.email}</strong>. The password will be immediately encrypted using SHA-256.
          </div>

          {resetError && (
            <div style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              color: '#dc2626', 
              padding: '8px 12px', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '12px', 
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={14} />
              <span>{resetError}</span>
            </div>
          )}

          {resetSuccess && (
            <div style={{ 
              backgroundColor: 'rgba(22, 163, 74, 0.15)', 
              border: '1px solid rgba(22, 163, 74, 0.3)', 
              color: '#16a34a', 
              padding: '8px 12px', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '12px', 
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={14} />
              <span>{resetSuccess}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">New Password (min 6 characters) *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showResetPassword ? 'text' : 'password'}
                className="input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowResetPassword(!showResetPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--slate-500)'
                }}
              >
                {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password *</label>
            <input
              type={showResetPassword ? 'text' : 'password'}
              className="input"
              placeholder="Confirm new password"
              value={confirmResetPassword}
              onChange={e => setConfirmResetPassword(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
