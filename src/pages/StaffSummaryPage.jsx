import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit2, Check, X, UserCheck } from 'lucide-react';
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
    role: 'Assistant Chef',
    salary: 3200,
    wage_per_day: 110,
    is_active: true
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
    await onSaveStaff(newStaff);
    setIsAddModalOpen(false);
    setNewStaff({
      staff_name: '',
      role: 'Assistant Chef',
      salary: 3200,
      wage_per_day: 110,
      is_active: true
    });
  };

  const columns = [
    {
      header: 'Staff Name',
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
        return <strong style={{ color: 'var(--navy-900)' }}>{val}</strong>;
      }
    },
    {
      header: 'Operational Role',
      key: 'role',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <select
              className="select"
              style={{ padding: '4px 8px' }}
              value={editForm.role || ''}
              onChange={e => setEditForm({ ...editForm, role: e.target.value })}
            >
              <option value="Master Chef">Master Chef</option>
              <option value="Executive Fryer Chef">Executive Fryer Chef</option>
              <option value="Senior Roasting Chef">Senior Roasting Chef</option>
              <option value="Assistant Chef">Assistant Chef</option>
              <option value="Floor Packaging Operator">Floor Packaging Operator</option>
              <option value="Packaging & Sealing Operator">Packaging & Sealing Operator</option>
              <option value="Quality Control Inspector">Quality Control Inspector</option>
              <option value="Maintenance Technician">Maintenance Technician</option>
              <option value="Material Handler & Loader">Material Handler & Loader</option>
              <option value="Sanitation & Hygiene Lead">Sanitation & Hygiene Lead</option>
            </select>
          );
        }
        const isChef = (val || '').toLowerCase().includes('chef');
        return (
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px',
            background: isChef ? 'rgba(14, 165, 233, 0.15)' : 'var(--bg-subtle)',
            color: isChef ? '#38bdf8' : 'var(--text-secondary)',
            border: isChef ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid var(--border-default)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 600,
            fontSize: '12px'
          }}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Daily Wage (₹)',
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
              value={editForm.wage_per_day}
              onChange={e => setEditForm({ ...editForm, wage_per_day: Number(e.target.value) })}
            />
          );
        }
        return <strong>₹{val} / day</strong>;
      }
    },
    {
      header: 'Monthly Base (₹)',
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
              value={editForm.salary}
              onChange={e => setEditForm({ ...editForm, salary: Number(e.target.value) })}
            />
          );
        }
        return <span>₹{Number(val).toLocaleString()}</span>;
      }
    },
    {
      header: 'Status',
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
            {val !== false ? 'Active' : 'Inactive'}
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
        title="Plant Personnel & Staff Directory"
        description="Roster of certified chefs, packaging technicians, machine operators, and floor labor"
        columns={columns}
        data={staff}
        searchable={true}
        searchPlaceholder="Filter staff by name or role..."
        actionButton={canEdit ? (
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={14} /> Add Personnel
          </button>
        ) : null}
      />

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Factory Personnel"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Save Staff Member</button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Full Employee Name *</label>
            <input
              type="text"
              className="input"
              placeholder="E.g., Ramesh Kumar"
              value={newStaff.staff_name}
              onChange={e => setNewStaff({ ...newStaff, staff_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Operational Role *</label>
            <select
              className="select"
              value={newStaff.role}
              onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
            >
              <option value="Master Chef">Master Chef</option>
              <option value="Executive Fryer Chef">Executive Fryer Chef</option>
              <option value="Senior Roasting Chef">Senior Roasting Chef</option>
              <option value="Assistant Chef">Assistant Chef</option>
              <option value="Floor Packaging Operator">Floor Packaging Operator</option>
              <option value="Packaging & Sealing Operator">Packaging & Sealing Operator</option>
              <option value="Quality Control Inspector">Quality Control Inspector</option>
              <option value="Maintenance Technician">Maintenance Technician</option>
              <option value="Material Handler & Loader">Material Handler & Loader</option>
              <option value="Sanitation & Hygiene Lead">Sanitation & Hygiene Lead</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Daily Wage (₹) *</label>
              <input
                type="number"
                min="0"
                className="input"
                value={newStaff.wage_per_day}
                onChange={e => setNewStaff({ ...newStaff, wage_per_day: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Salary (₹) *</label>
              <input
                type="number"
                min="0"
                className="input"
                value={newStaff.salary}
                onChange={e => setNewStaff({ ...newStaff, salary: Number(e.target.value) })}
                required
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
