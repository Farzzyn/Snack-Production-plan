import React, { useState } from 'react';
import { Gauge, Plus, Trash2, Edit2, Check, X, ChefHat, Clock } from 'lucide-react';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

export default function CapacityMasterPage({
  capacityList = [],
  onSaveCapacity,
  onDeleteCapacity,
  currentUser
}) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCap, setNewCap] = useState({
    base_product: '',
    max_capacity_per_day: 500,
    uom: 'KG',
    batch_count: 4,
    operating_hours: 8,
    count_of_chef: 2,
    count_of_staff: 4
  });

  const canEdit = currentUser?.role === 'admin';

  const startEdit = (cap) => {
    setEditingId(cap.id || cap.base_product);
    setEditForm({ ...cap });
  };

  const saveEdit = async () => {
    // Auto recalculate helper fields
    const maxCap = Number(editForm.max_capacity_per_day) || 500;
    const batches = Number(editForm.batch_count) || 4;
    const hours = Number(editForm.operating_hours) || 8;
    const payload = {
      ...editForm,
      capacity_per_batch: Number((maxCap / batches).toFixed(2)),
      hours_per_batch: Number((hours / batches).toFixed(2))
    };
    await onSaveCapacity(payload);
    setEditingId(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newCap.base_product.trim()) return;
    const maxCap = Number(newCap.max_capacity_per_day) || 500;
    const batches = Number(newCap.batch_count) || 4;
    const hours = Number(newCap.operating_hours) || 8;
    const payload = {
      ...newCap,
      capacity_per_batch: Number((maxCap / batches).toFixed(2)),
      hours_per_batch: Number((hours / batches).toFixed(2))
    };
    await onSaveCapacity(payload);
    setIsAddModalOpen(false);
    setNewCap({
      base_product: '',
      max_capacity_per_day: 500,
      uom: 'KG',
      batch_count: 4,
      operating_hours: 8,
      count_of_chef: 2,
      count_of_staff: 4
    });
  };

  const columns = [
    {
      header: 'Base Product',
      key: 'base_product',
      render: (val, row) => {
        if (editingId === (row.id || row.base_product)) {
          return (
            <input
              type="text"
              className="input"
              style={{ minWidth: '180px', padding: '4px 8px' }}
              value={editForm.base_product || ''}
              onChange={e => setEditForm({ ...editForm, base_product: e.target.value })}
            />
          );
        }
        return <strong style={{ color: 'var(--navy-900)' }}>{val}</strong>;
      }
    },
    {
      header: 'Max Daily Cap (KG)',
      key: 'max_capacity_per_day',
      numeric: true,
      align: 'right',
      render: (val, row) => {
        if (editingId === (row.id || row.base_product)) {
          return (
            <input
              type="number"
              className="inline-input"
              style={{ textAlign: 'right' }}
              value={editForm.max_capacity_per_day}
              onChange={e => setEditForm({ ...editForm, max_capacity_per_day: Number(e.target.value) })}
            />
          );
        }
        return <strong>{Number(val).toLocaleString()} {row.uom || 'KG'}</strong>;
      }
    },
    {
      header: 'Base Chefs',
      key: 'count_of_chef',
      numeric: true,
      align: 'center',
      render: (val, row) => {
        if (editingId === (row.id || row.base_product)) {
          return (
            <input
              type="number"
              min="1"
              className="inline-input"
              style={{ textAlign: 'center', width: '60px' }}
              value={editForm.count_of_chef}
              onChange={e => setEditForm({ ...editForm, count_of_chef: Number(e.target.value) })}
            />
          );
        }
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <ChefHat size={13} color="var(--primary-600)" />
            {val} chefs
          </span>
        );
      }
    },
    {
      header: 'Cap / Chef',
      align: 'right',
      render: (_, row) => {
        const capPerChef = row.count_of_chef > 0 ? (row.max_capacity_per_day / row.count_of_chef) : 0;
        return <strong style={{ color: 'var(--primary-600)' }}>{capPerChef.toFixed(0)} KG</strong>;
      }
    },
    {
      header: 'Daily Batches',
      key: 'batch_count',
      numeric: true,
      align: 'center',
      render: (val, row) => {
        if (editingId === (row.id || row.base_product)) {
          return (
            <input
              type="number"
              min="1"
              className="inline-input"
              style={{ textAlign: 'center', width: '60px' }}
              value={editForm.batch_count}
              onChange={e => setEditForm({ ...editForm, batch_count: Number(e.target.value) })}
            />
          );
        }
        return <span>{val} batches</span>;
      }
    },
    {
      header: 'Cap / Batch',
      align: 'right',
      render: (_, row) => {
        const capPerBatch = row.capacity_per_batch || (row.batch_count > 0 ? (row.max_capacity_per_day / row.batch_count) : 0);
        return <span>{Number(capPerBatch).toFixed(0)} KG</span>;
      }
    },
    {
      header: 'Hours / Day',
      key: 'operating_hours',
      numeric: true,
      align: 'center',
      render: (val, row) => {
        if (editingId === (row.id || row.base_product)) {
          return (
            <input
              type="number"
              min="1"
              className="inline-input"
              style={{ textAlign: 'center', width: '60px' }}
              value={editForm.operating_hours}
              onChange={e => setEditForm({ ...editForm, operating_hours: Number(e.target.value) })}
            />
          );
        }
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} color="var(--slate-400)" />
            {val} hrs
          </span>
        );
      }
    },
    {
      header: 'Support Staff',
      key: 'count_of_staff',
      numeric: true,
      align: 'center',
      render: (val, row) => {
        if (editingId === (row.id || row.base_product)) {
          return (
            <input
              type="number"
              min="0"
              className="inline-input"
              style={{ textAlign: 'center', width: '60px' }}
              value={editForm.count_of_staff}
              onChange={e => setEditForm({ ...editForm, count_of_staff: Number(e.target.value) })}
            />
          );
        }
        return <span>{val} crew</span>;
      }
    },
    ...(canEdit ? [{
      header: 'Actions',
      align: 'center',
      render: (_, row) => {
        const isEditing = editingId === (row.id || row.base_product);
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
            <button className="btn btn-danger btn-sm" onClick={() => onDeleteCapacity(row.id || row.base_product)}>
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
        title="Manufacturing Capacity & Chef Throughput Master"
        description="Defines plant production rates, batch sizing, operating hours, and dynamic chef capacity scaling"
        columns={columns}
        data={capacityList}
        searchable={true}
        searchPlaceholder="Search capacity by product..."
        actionButton={canEdit ? (
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={14} /> Add Capacity Config
          </button>
        ) : null}
      />

      {/* Add Capacity Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Plant Capacity Model"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Save Capacity</button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Base Product Line *</label>
            <input
              type="text"
              className="input"
              placeholder="E.g., Roasted Gram Healthy Mix, Spiced Cassava Chips"
              value={newCap.base_product}
              onChange={e => setNewCap({ ...newCap, base_product: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Max Daily Capacity (KG) *</label>
              <input
                type="number"
                min="1"
                className="input"
                value={newCap.max_capacity_per_day}
                onChange={e => setNewCap({ ...newCap, max_capacity_per_day: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Baseline Chef Count *</label>
              <input
                type="number"
                min="1"
                className="input"
                value={newCap.count_of_chef}
                onChange={e => setNewCap({ ...newCap, count_of_chef: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Batches / Day *</label>
              <input
                type="number"
                min="1"
                className="input"
                value={newCap.batch_count}
                onChange={e => setNewCap({ ...newCap, batch_count: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Operating Hours *</label>
              <input
                type="number"
                min="1"
                className="input"
                value={newCap.operating_hours}
                onChange={e => setNewCap({ ...newCap, operating_hours: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Support Staff *</label>
              <input
                type="number"
                min="0"
                className="input"
                value={newCap.count_of_staff}
                onChange={e => setNewCap({ ...newCap, count_of_staff: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="alert alert-info">
            Calculated: <strong>{(newCap.max_capacity_per_day / (newCap.count_of_chef || 1)).toFixed(0)} KG / Chef</strong> • <strong>{(newCap.max_capacity_per_day / (newCap.batch_count || 1)).toFixed(0)} KG / Batch</strong>
          </div>
        </form>
      </Modal>
    </div>
  );
}
