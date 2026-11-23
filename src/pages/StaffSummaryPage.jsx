import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

export default function StaffSummaryPage({
  staff = [],
  onSaveStaff,
  onDeleteStaff,
  currentUser
}) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    staff_name: '',
    pay_type: 'monthly', // 'monthly' | 'daily'
    salary: 10000,
    wage_per_day: 0
  });

  const canEdit = currentUser?.role === 'admin';

  const startEdit = (member) => {
    setEditingId(member.id);
    setEditForm({ ...member });
  };

  const saveEdit = async () => {
    await onSaveStaff(editForm);
    setEditingId(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newStaff.staff_name.trim()) return;

    const payload = {
      sl_no: staff.length + 1,
      staff_name: newStaff.staff_name.trim(),
      salary: newStaff.pay_type === 'monthly' ? Number(newStaff.salary) || 0 : 0,
      wage_per_day: newStaff.pay_type === 'daily' ? Number(newStaff.wage_per_day) || 0 : 0,
      is_active: true
    };

    await onSaveStaff(payload);
    setIsAddModalOpen(false);
    setNewStaff({
      staff_name: '',
      pay_type: 'monthly',
      salary: 10000,
      wage_per_day: 0
    });
  };

  const columns = [
    {
      header: 'SL NO.',
      key: 'sl_no',
      align: 'center',
      render: (val, row, idx) => (
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
          {val || idx + 1}
        </span>
      )
    },
    {
      header: 'STAFF NAME',
      key: 'staff_name',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <input
              type="text"
              className="input"
              style={{ minWidth: '180px', padding: '4px 8px' }}
              value={editForm.staff_name || ''}
              onChange={e => setEditForm({ ...editForm, staff_name: e.target.value })}
            />
          );
        }
        return (
          <strong style={{ color: 'var(--text-primary)', fontSize: '14px', letterSpacing: '0.3px' }}>
            {val}
          </strong>
        );
      }
    },
    {
      header: 'SALARY',
      key: 'salary',
      numeric: true,
      align: 'right',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <input
              type="number"
              className="inline-input"
              style={{ textAlign: 'right' }}
              value={editForm.salary ?? ''}
              onChange={e => setEditForm({ ...editForm, salary: e.target.value === '' ? '' : Number(e.target.value) })}
            />
          );
        }
        const num = Number(val);
        if (num > 0) {
          return (
            <span style={{ fontWeight: 600, color: '#10b981' }}>
              ₹{num.toLocaleString()}
            </span>
          );
        }
        return <span style={{ color: 'var(--text-muted)' }}>—</span>;
      }
    },
    {
      header: 'Wage / Day',
      key: 'wage_per_day',
      numeric: true,
      align: 'right',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <input
              type="number"
              className="inline-input"
              style={{ textAlign: 'right' }}
              value={editForm.wage_per_day ?? ''}
              onChange={e => setEditForm({ ...editForm, wage_per_day: e.target.value === '' ? '' : Number(e.target.value) })}
            />
          );
        }
        const num = Number(val);
        if (num > 0) {
          return (
            <span style={{ fontWeight: 600, color: '#38bdf8' }}>
              ₹{num.toLocaleString()} / day
            </span>
          );
        }
        // If salaried, show calculated industrial rate
        if (Number(row.salary) > 0) {
          const derived = (Number(row.salary) / 26).toFixed(2);
          return (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }} title="Calculated from Monthly Salary / 26 days">
              ≈ ₹{derived} / day <span style={{ fontSize: '10px', opacity: 0.7 }}>(derived)</span>
            </span>
          );
        }
        return <span style={{ color: 'var(--text-muted)' }}>—</span>;
      }
    },
    ...(canEdit ? [{
      header: 'ACTIONS',
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
            <button className="btn btn-danger btn-sm" onClick={() => onDeleteStaff(row.id)}>
              <Trash2 size={13} />
            </button>
          </div>
        );
      }
    }] : [])
  ];

  return (
    <div>
      <DataTable
        title="Staff Summary"
        description="Factory personnel payroll and wage master matching Google Sheet"
        columns={columns}
        data={staff}
        searchable={true}
        searchPlaceholder="Filter staff by name..."
        actionButton={canEdit ? (
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={14} /> Add Staff
          </button>
        ) : null}
      />

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Staff Member"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Save Staff</button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Staff Name *</label>
            <input
              type="text"
              className="input"
              placeholder="E.g., BIJU"
              value={newStaff.staff_name}
              onChange={e => setNewStaff({ ...newStaff, staff_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Type</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="pay_type"
                  value="monthly"
                  checked={newStaff.pay_type === 'monthly'}
                  onChange={() => setNewStaff({ ...newStaff, pay_type: 'monthly', wage_per_day: 0 })}
                />
                <span>Monthly Salaried</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="pay_type"
                  value="daily"
                  checked={newStaff.pay_type === 'daily'}
                  onChange={() => setNewStaff({ ...newStaff, pay_type: 'daily', salary: 0 })}
                />
                <span>Daily Wage</span>
              </label>
            </div>
          </div>

          {newStaff.pay_type === 'monthly' ? (
            <div className="form-group">
              <label className="form-label">Monthly Salary (₹) *</label>
              <input
                type="number"
                min="0"
                className="input"
                placeholder="10000"
                value={newStaff.salary}
                onChange={e => setNewStaff({ ...newStaff, salary: Number(e.target.value) })}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Daily Wage (₹ / Day) *</label>
              <input
                type="number"
                min="0"
                className="input"
                placeholder="400"
                value={newStaff.wage_per_day}
                onChange={e => setNewStaff({ ...newStaff, wage_per_day: Number(e.target.value) })}
                required
              />
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
