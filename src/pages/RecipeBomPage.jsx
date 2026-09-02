import React, { useState, useMemo } from 'react';
import { ChefHat, Plus, Trash2, Edit2, Check, X, Filter } from 'lucide-react';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

export default function RecipeBomPage({
  recipeBom = [],
  skus = [],
  onSaveItem,
  onDeleteItem,
  currentUser
}) {
  const [selectedProductFilter, setSelectedProductFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    base_product: 'Roasted Gram Healthy Mix',
    raw_material: '',
    quantity: 10,
    uom: 'KG',
    unit_cost: 2.50,
    wastage_percentage: 1.0
  });

  const canEdit = currentUser?.role === 'admin';

  // Distinct base products
  const baseProducts = useMemo(() => {
    const set = new Set();
    recipeBom.forEach(r => r.base_product && set.add(r.base_product));
    skus.forEach(s => s.base_product && set.add(s.base_product));
    return Array.from(set);
  }, [recipeBom, skus]);

  const filteredBom = useMemo(() => {
    if (!selectedProductFilter) return recipeBom;
    return recipeBom.filter(r => r.base_product === selectedProductFilter);
  }, [recipeBom, selectedProductFilter]);

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
    if (!newItem.raw_material.trim()) return;
    await onSaveItem(newItem);
    setIsAddModalOpen(false);
    setNewItem({
      base_product: selectedProductFilter || baseProducts[0] || 'Roasted Gram Healthy Mix',
      raw_material: '',
      quantity: 10,
      uom: 'KG',
      unit_cost: 2.50,
      wastage_percentage: 1.0
    });
  };

  const columns = [
    {
      header: 'Base Product',
      key: 'base_product',
      render: (val) => <strong style={{ color: 'var(--primary-600)' }}>{val}</strong>
    },
    {
      header: 'Raw Material / Ingredient',
      key: 'raw_material',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <input
              type="text"
              className="input"
              style={{ minWidth: '180px', padding: '4px 8px' }}
              value={editForm.raw_material || ''}
              onChange={e => setEditForm({ ...editForm, raw_material: e.target.value })}
            />
          );
        }
        return <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{val}</span>;
      }
    },
    {
      header: 'Batch Qty',
      key: 'quantity',
      numeric: true,
      align: 'right',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <input
              type="number"
              className="inline-input"
              style={{ textAlign: 'right' }}
              value={editForm.quantity}
              onChange={e => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
            />
          );
        }
        return <strong>{Number(val).toLocaleString()}</strong>;
      }
    },
    {
      header: 'UOM',
      key: 'uom',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <select
              className="select"
              style={{ width: '80px', padding: '4px 8px' }}
              value={editForm.uom || 'KG'}
              onChange={e => setEditForm({ ...editForm, uom: e.target.value })}
            >
              <option value="KG">KG</option>
              <option value="LTR">LTR</option>
              <option value="GM">GM</option>
              <option value="PCS">PCS</option>
            </select>
          );
        }
        return <span className="badge badge-draft">{val}</span>;
      }
    },
    {
      header: 'Wastage %',
      key: 'wastage_percentage',
      numeric: true,
      align: 'right',
      render: (val, row) => {
        if (editingId === row.id) {
          return (
            <input
              type="number"
              step="0.1"
              className="inline-input"
              style={{ textAlign: 'right', width: '70px' }}
              value={editForm.wastage_percentage}
              onChange={e => setEditForm({ ...editForm, wastage_percentage: Number(e.target.value) })}
            />
          );
        }
        return <span>{val || 0}%</span>;
      }
    },
    {
      header: 'Unit Cost ($)',
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
        return <span>${Number(val || 0).toFixed(2)}</span>;
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
      {/* Product Filter Bar */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
            <Filter size={15} />
            Filter by Base Product Recipe:
          </div>

          <div style={{ minWidth: '240px' }}>
            <select
              className="select"
              value={selectedProductFilter}
              onChange={e => setSelectedProductFilter(e.target.value)}
            >
              <option value="">All Recipes ({recipeBom.length} materials)</option>
              {baseProducts.map(bp => (
                <option key={bp} value={bp}>{bp}</option>
              ))}
            </select>
          </div>

          {canEdit && (
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={14} /> Add Ingredient to BOM
              </button>
            </div>
          )}
        </div>
      </div>

      <DataTable
        title="Recipe Bill of Materials (BOM)"
        description="Ingredient formulas per batch used to calculate raw material requirements and production costs"
        columns={columns}
        data={filteredBom}
        searchable={true}
        searchPlaceholder="Filter ingredients, products..."
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Ingredient to Recipe BOM"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Save Ingredient</button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Base Product Formula *</label>
            <input
              type="text"
              className="input"
              list="bp-list"
              value={newItem.base_product}
              onChange={e => setNewItem({ ...newItem, base_product: e.target.value })}
              required
            />
            <datalist id="bp-list">
              {baseProducts.map(bp => <option key={bp} value={bp} />)}
            </datalist>
          </div>

          <div className="form-group">
            <label className="form-label">Raw Material Name *</label>
            <input
              type="text"
              className="input"
              placeholder="E.g., Roasted Bengal Gram, Refined Sunflower Oil"
              value={newItem.raw_material}
              onChange={e => setNewItem({ ...newItem, raw_material: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Quantity per Batch *</label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={newItem.quantity}
                onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit of Measure (UOM) *</label>
              <select
                className="select"
                value={newItem.uom}
                onChange={e => setNewItem({ ...newItem, uom: e.target.value })}
              >
                <option value="KG">KG</option>
                <option value="LTR">LTR</option>
                <option value="GM">GM</option>
                <option value="PCS">PCS</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Unit Cost ($) *</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={newItem.unit_cost}
                onChange={e => setNewItem({ ...newItem, unit_cost: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Production Wastage %</label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={newItem.wastage_percentage}
                onChange={e => setNewItem({ ...newItem, wastage_percentage: Number(e.target.value) })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
