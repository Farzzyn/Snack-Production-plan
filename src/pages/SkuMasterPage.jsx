import React, { useState, useMemo } from 'react';
import { Package, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

export default function SkuMasterPage({
  skus = [],
  recipeBom = [],
  capacityList = [],
  onSaveSku,
  onDeleteSku,
  currentUser
}) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Extract unique base products from Capacity Master, Recipe BOM, and SKUs
  const availableBaseProducts = useMemo(() => {
    const set = new Set();
    capacityList.forEach(c => c.base_product && set.add(c.base_product.trim()));
    recipeBom.forEach(r => r.base_product && set.add(r.base_product.trim()));
    skus.forEach(s => s.base_product && set.add(s.base_product.trim()));
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return list.length > 0 ? list : ['RG HOT MIXTURE'];
  }, [capacityList, recipeBom, skus]);

  const [newSku, setNewSku] = useState({
    sku_id: '',
    sku_name: '',
    base_product: '',
    pack_size_g: 150,
    packet_per_box: 20,
    packing_qty_per_hour: 200,
    packing_staff_count: 3,
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

  const handleOpenAddModal = () => {
    setNewSku({
      sku_id: '',
      sku_name: '',
      base_product: availableBaseProducts[0] || 'RG HOT MIXTURE',
      pack_size_g: 150,
      packet_per_box: 20,
      packing_qty_per_hour: 200,
      packing_staff_count: 3,
      is_active: true
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newSku.sku_id.trim() || !newSku.sku_name.trim()) return;
    const finalBaseProduct = newSku.base_product || availableBaseProducts[0] || 'RG HOT MIXTURE';
    await onSaveSku({
      ...newSku,
      base_product: finalBaseProduct
    });
    setIsAddModalOpen(false);
    setNewSku({
      sku_id: '',
      sku_name: '',
      base_product: availableBaseProducts[0] || 'RG HOT MIXTURE',
      pack_size_g: 150,
      packet_per_box: 20,
      packing_qty_per_hour: 200,
      packing_staff_count: 3,
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
          const currentVal = editForm.base_product || '';
          const options = availableBaseProducts.includes(currentVal)
            ? availableBaseProducts
            : (currentVal ? [currentVal, ...availableBaseProducts] : availableBaseProducts);

          return (
            <select
              className="select"
              style={{ minWidth: '180px', padding: '4px 8px', fontSize: '12px' }}
              value={currentVal}
              onChange={e => setEditForm({ ...editForm, base_product: e.target.value })}
            >
              {options.map(bp => (
                <option key={bp} value={bp}>{bp}</option>
              ))}
            </select>
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
      header: 'Packing Qty/Hr',
      key: 'packing_qty_per_hour',
      numeric: true,
      align: 'right',
      render: (val, row) => {
        if (editingId === (row.id || row.sku_id)) {
          return (
            <input
              type="number"
              className="inline-input"
              style={{ textAlign: 'right' }}
              value={editForm.packing_qty_per_hour || ''}
              onChange={e => setEditForm({ ...editForm, packing_qty_per_hour: Number(e.target.value) })}
            />
          );
        }
        return <span>{val || 0} / hr</span>;
      }
    },
    {
      header: 'Packing Staff',
      key: 'packing_staff_count',
      numeric: true,
      align: 'right',
      render: (val, row) => {
        if (editingId === (row.id || row.sku_id)) {
          return (
            <input
              type="number"
              className="inline-input"
              style={{ textAlign: 'right' }}
              value={editForm.packing_staff_count || ''}
              onChange={e => setEditForm({ ...editForm, packing_staff_count: Number(e.target.value) })}
            />
          );
        }
        return <span>{val || 0}</span>;
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
          <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
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
            <label className="form-label">Base Product (From Recipe BOM) *</label>
            <select
              className="select"
              value={newSku.base_product || availableBaseProducts[0] || ''}
              onChange={e => setNewSku({ ...newSku, base_product: e.target.value })}
              required
            >
              {availableBaseProducts.map(bp => (
                <option key={bp} value={bp}>
                  {bp}
                </option>
              ))}
            </select>
            <div className="form-hint" style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
              Populated dynamically from base products defined in the Recipe BOM.
            </div>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Packing Qty / Hour</label>
              <input
                type="number"
                min="0"
                className="input"
                value={newSku.packing_qty_per_hour}
                onChange={e => setNewSku({ ...newSku, packing_qty_per_hour: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Packing Staff Count</label>
              <input
                type="number"
                min="0"
                className="input"
                value={newSku.packing_staff_count}
                onChange={e => setNewSku({ ...newSku, packing_staff_count: Number(e.target.value) })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
