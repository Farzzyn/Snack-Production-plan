import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

export default function SkuMasterPage({
  skus = [],
  onSaveSku,
  onDeleteSku,
  currentUser
}) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSku, setNewSku] = useState({
    sku_id: '',
    sku_name: '',
    base_product: 'Roasted Gram Healthy Mix',
    pack_size_g: 150,
    packet_per_box: 20,
    is_active: true
  });

  const canEdit = currentUser?.role === 'admin';

  const startEdit = (sku) => {
    setEditingId(sku.id || sku.sku_id);
    setEditForm({ ...sku });
  };

  const saveEdit = async () => {
    await onSaveSku(editForm);
    setEditingId(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newSku.sku_id.trim() || !newSku.sku_name.trim()) return;
    await onSaveSku(newSku);
    setIsAddModalOpen(false);
    setNewSku({
      sku_id: '',
      sku_name: '',
      base_product: 'Roasted Gram Healthy Mix',
      pack_size_g: 150,
      packet_per_box: 20,
      is_active: true
    });
  };

  const columns = [
    {
      header: 'SKU Code',
      key: 'sku_id',
      render: (val, row) => {
        if (editingId === (row.id || row.sku_id)) {
          return (
            <input
              type="text"
              className="inline-input"
              value={editForm.sku_id || ''}
              onChange={e => setEditForm({ ...editForm, sku_id: e.target.value })}
            />
          );
        }
        return <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{val}</span>;
      }
    },
    {
      header: 'SKU Description',
      key: 'sku_name',
      render: (val, row) => {
        if (editingId === (row.id || row.sku_id)) {
          return (
            <input
              type="text"
              className="input"
              style={{ minWidth: '220px', padding: '4px 8px' }}
              value={editForm.sku_name || ''}
              onChange={e => setEditForm({ ...editForm, sku_name: e.target.value })}
            />
          );
        }
        return <span>{val}</span>;
      }
    },
    {
      header: 'Base Product',
      key: 'base_product',
      render: (val, row) => {
        if (editingId === (row.id || row.sku_id)) {
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
        return <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{val}</span>;
      }
    },
    {
      header: 'Pack Size (g)',
      key: 'pack_size_g',
      numeric: true,
      align: 'right',
      render: (val, row) => {
        if (editingId === (row.id || row.sku_id)) {
          return (
            <input
              type="number"
              className="inline-input"
              style={{ textAlign: 'right' }}
              value={editForm.pack_size_g || ''}
              onChange={e => setEditForm({ ...editForm, pack_size_g: Number(e.target.value) })}
            />
          );
        }
        return <strong>{val}g</strong>;
      }
    },
    {
      header: 'Packets / Box',
      key: 'packet_per_box',
      numeric: true,
      align: 'right',
      render: (val, row) => {
        if (editingId === (row.id || row.sku_id)) {
          return (
            <input
              type="number"
              className="inline-input"
              style={{ textAlign: 'right' }}
              value={editForm.packet_per_box || ''}
              onChange={e => setEditForm({ ...editForm, packet_per_box: Number(e.target.value) })}
            />
          );
        }
        return <span>{val} pkts</span>;
      }
    },
    {
      header: 'Status',
      key: 'is_active',
      align: 'center',
      render: (val, row) => {
        if (editingId === (row.id || row.sku_id)) {
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
        const isEditing = editingId === (row.id || row.sku_id);
        if (isEditing) {
          return (
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={saveEdit} title="Save changes">
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
            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(row)} title="Inline Edit">
              <Edit2 size={13} />
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDeleteSku(row.id || row.sku_id)} title="Delete SKU">
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
        title="SKU & Pack Size Master Register"
        description="Configure product codes, net grams per packet, and shipper box packaging ratios"
        columns={columns}
        data={skus}
        searchable={true}
        searchPlaceholder="Filter SKUs by code, product..."
        actionButton={canEdit ? (
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={14} /> Add SKU
          </button>
        ) : null}
      />

      {/* Add SKU Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Finished SKU"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Save SKU</button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">SKU Code / ID *</label>
            <input
              type="text"
              className="input"
              placeholder="E.g., RGHMIX150, BANCHP100"
              value={newSku.sku_id}
              onChange={e => setNewSku({ ...newSku, sku_id: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full SKU Description *</label>
            <input
              type="text"
              className="input"
              placeholder="E.g., Roasted Gram Healthy Mix 150g"
              value={newSku.sku_name}
              onChange={e => setNewSku({ ...newSku, sku_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Base Product (Recipe & Capacity Join Key) *</label>
            <input
              type="text"
              className="input"
              placeholder="E.g., Roasted Gram Healthy Mix"
              value={newSku.base_product}
              onChange={e => setNewSku({ ...newSku, base_product: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Pack Size (Grams) *</label>
              <input
                type="number"
                min="1"
                className="input"
                value={newSku.pack_size_g}
                onChange={e => setNewSku({ ...newSku, pack_size_g: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Packets Per Shipper Box *</label>
              <input
                type="number"
                min="1"
                className="input"
                value={newSku.packet_per_box}
                onChange={e => setNewSku({ ...newSku, packet_per_box: Number(e.target.value) })}
                required
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
