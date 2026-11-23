import React, { useState, useMemo } from 'react';
import { Boxes, Plus, Trash2, Edit2, Check, X, Filter } from 'lucide-react';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

export default function PackagingBomPage({
  packagingBom = [],
  skus = [],
  onSaveItem,
  onDeleteItem,
  currentUser
}) {
  const [selectedSkuFilter, setSelectedSkuFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    sku_id: skus[0]?.sku_id || 'RGHMIX150',
    packaging_material: 'packet',
    quantity: 1.0,
    unit_cost: 2.5
  });

  const canEdit = currentUser?.role === 'admin';

  const filteredBom = useMemo(() => {
    if (!selectedSkuFilter) return packagingBom;
    return packagingBom.filter(p => p.sku_id === selectedSkuFilter);
  }, [packagingBom, selectedSkuFilter]);

  const skuMap = useMemo(() => {
    const map = new Map();
    skus.forEach(s => {
      if (s.sku_id) {
        map.set(s.sku_id.trim().toUpperCase(), s);
        map.set(s.sku_id, s);
      }
    });
    return map;
  }, [skus]);

  const enrichedBom = useMemo(() => {
    return filteredBom.map(item => {
      const skuObj = skuMap.get(item.sku_id) || (item.sku_id ? skuMap.get(item.sku_id.trim().toUpperCase()) : null);
      return {
        ...item,
        sku_name: skuObj?.sku_name || item.sku_name || ''
      };
    });
  }, [filteredBom, skuMap]);

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const saveEdit = async () => {
    await onSaveItem(editForm);
    setEditingId(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.packaging_material.trim()) return;
    await onSaveItem(newItem);
    setIsAddModalOpen(false);
    setNewItem({
      sku_id: selectedSkuFilter || skus[0]?.sku_id || 'RGHMIX150',
      packaging_material: '',
      quantity: 1.0,
      uom: 'PCS',
      unit_cost: 0.12,
      wastage_percentage: 3.0
    });
  };

  const columns = [
    {
      header: 'SKU ID',
      key: 'sku_id',
      render: (val, row) => (
        <div>
          <strong style={{ color: 'var(--brand-500)', fontFamily: 'monospace' }}>{val}</strong>
          {row.sku_name && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.sku_name}</div>
          )}
        </div>
      )
    },
    {
      header: 'Packaging Material',
      key: 'packaging_material',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <input
              type="text"
              className="input"
              style={{ minWidth: '220px', padding: '4px 8px' }}
              value={editForm.packaging_material || ''}
              onChange={e => setEditForm({ ...editForm, packaging_material: e.target.value })}
            />
          );
        }
        return <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>;
      }
    },
    {
      header: 'Quantity',
      key: 'quantity',
      numeric: true,
      align: 'right',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <input
              type="number"
              step="0.001"
              className="inline-input"
              style={{ textAlign: 'right' }}
              value={editForm.quantity}
              onChange={e => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
            />
          );
        }
        return <span>{val}</span>;
      }
    },
    {
      header: 'Unit Cost',
      key: 'unit_cost',
      numeric: true,
      align: 'right',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <input
              type="number"
              step="0.01"
              className="inline-input"
              style={{ textAlign: 'right' }}
              value={editForm.unit_cost}
              onChange={e => setEditForm({ ...editForm, unit_cost: Number(e.target.value) })}
            />
          );
        }
        return <strong style={{ color: '#10b981' }}>₹{Number(val || 0).toFixed(2)}</strong>;
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
            <button className="btn btn-danger btn-sm" onClick={() => onDeleteItem(row.id)}>
              <Trash2 size={13} />
            </button>
          </div>
        );
      }
    }] : [])
  ];

  return (
    <div>
      {/* SKU Filter Bar */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
            <Filter size={15} />
            Filter by Finished SKU:
          </div>

          <div style={{ minWidth: '240px' }}>
            <select
              className="select"
              value={selectedSkuFilter}
              onChange={e => setSelectedSkuFilter(e.target.value)}
            >
              <option value="">All SKUs ({packagingBom.length} materials)</option>
              {skus.map(s => (
                <option key={s.sku_id} value={s.sku_id}>{s.sku_id} - {s.sku_name}</option>
              ))}
            </select>
          </div>

          {canEdit && (
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={14} /> Add Packaging Material
              </button>
            </div>
          )}
        </div>
      </div>

      <DataTable
        title="Packaging BOM"
        description="Packaging materials, quantities, and unit costs matching Google Sheet"
        columns={columns}
        data={enrichedBom}
        searchable={true}
        searchPlaceholder="Filter by SKU ID, packaging material..."
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Packaging Material"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Save Material</button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">SKU ID *</label>
            <select
              className="select"
              value={newItem.sku_id}
              onChange={e => setNewItem({ ...newItem, sku_id: e.target.value })}
              required
            >
              {skus.map(s => (
                <option key={s.sku_id} value={s.sku_id}>{s.sku_id} - {s.sku_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Packaging Material *</label>
            <input
              type="text"
              className="input"
              placeholder="E.g., packet, Bottle"
              value={newItem.packaging_material}
              onChange={e => setNewItem({ ...newItem, packaging_material: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                step="0.001"
                className="input"
                placeholder="1"
                value={newItem.quantity}
                onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit Cost (₹) *</label>
              <input
                type="number"
                step="0.01"
                className="input"
                placeholder="2.50"
                value={newItem.unit_cost}
                onChange={e => setNewItem({ ...newItem, unit_cost: Number(e.target.value) })}
                required
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
