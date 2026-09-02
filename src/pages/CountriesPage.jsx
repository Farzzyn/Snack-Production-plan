import React, { useState } from 'react';
import { Globe, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

export default function CountriesPage({
  countries = [],
  onSaveCountry,
  onDeleteCountry,
  currentUser
}) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCountry, setNewCountry] = useState({
    country_code: '',
    country_name: '',
    is_active: true
  });

  const canEdit = currentUser?.role === 'admin';

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditForm({ ...c });
  };

  const saveEdit = async () => {
    await onSaveCountry(editForm);
    setEditingId(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newCountry.country_code.trim() || !newCountry.country_name.trim()) return;
    await onSaveCountry(newCountry);
    setIsAddModalOpen(false);
    setNewCountry({ country_code: '', country_name: '', is_active: true });
  };

  const columns = [
    {
      header: 'Country Code (ISO)',
      key: 'country_code',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <input
              type="text"
              className="inline-input"
              value={editForm.country_code || ''}
              onChange={e => setEditForm({ ...editForm, country_code: e.target.value.toUpperCase() })}
            />
          );
        }
        return <strong style={{ color: 'var(--primary-600)' }}>{val}</strong>;
      }
    },
    {
      header: 'Country Name',
      key: 'country_name',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <input
              type="text"
              className="input"
              style={{ minWidth: '180px', padding: '4px 8px' }}
              value={editForm.country_name || ''}
              onChange={e => setEditForm({ ...editForm, country_name: e.target.value })}
            />
          );
        }
        return <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{val}</span>;
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
            {val !== false ? 'Active Export' : 'Inactive'}
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
            <button className="btn btn-danger btn-sm" onClick={() => onDeleteCountry(row.id)}>
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
        title="Destination Export Countries Master"
        description="Authorized customer distribution markets for snack manufacturing orders"
        columns={columns}
        data={countries}
        searchable={true}
        searchPlaceholder="Filter countries..."
        actionButton={canEdit ? (
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={14} /> Add Country
          </button>
        ) : null}
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Destination Country"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Save Country</button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Country Code (ISO 3-Letter) *</label>
            <input
              type="text"
              maxLength="3"
              className="input"
              placeholder="E.g., UAE, SAU, QAT, SGP"
              value={newCountry.country_code}
              onChange={e => setNewCountry({ ...newCountry, country_code: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Country Name *</label>
            <input
              type="text"
              className="input"
              placeholder="E.g., United Arab Emirates, Singapore"
              value={newCountry.country_name}
              onChange={e => setNewCountry({ ...newCountry, country_name: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
