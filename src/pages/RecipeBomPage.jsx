import React, { useState, useMemo } from 'react';
import { ChefHat, Plus, Trash2, Edit2, Check, X, Filter, Package, Layers, Scale, IndianRupee } from 'lucide-react';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

export default function RecipeBomPage({
  recipeBom = [],
  skus = [],
  capacityList = [],
  onSaveItem,
  onDeleteItem,
  currentUser
}) {
  const [selectedProductFilter, setSelectedProductFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const createEmptyRow = () => ({
    tempId: `row-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    raw_material: '',
    quantity: 10,
    uom: 'KG',
    unit_cost: 0,
    wastage_percentage: 1.0
  });

  const [selectedBaseProductForAdd, setSelectedBaseProductForAdd] = useState('');
  const [ingredientRows, setIngredientRows] = useState([createEmptyRow(), createEmptyRow(), createEmptyRow()]);

  const canEdit = currentUser?.role === 'admin';

  // Distinct base products from Capacity Master, Recipe BOM, and SKUs (sorted)
  const baseProducts = useMemo(() => {
    const set = new Set();
    capacityList.forEach(c => c.base_product && set.add(c.base_product.trim()));
    recipeBom.forEach(r => r.base_product && set.add(r.base_product.trim()));
    skus.forEach(s => s.base_product && set.add(s.base_product.trim()));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [capacityList, recipeBom, skus]);

  // Active base product resolves to selectedProductFilter, or defaults to the first available
  const activeBaseProduct = useMemo(() => {
    if (selectedProductFilter && baseProducts.includes(selectedProductFilter)) {
      return selectedProductFilter;
    }
    return baseProducts[0] || 'RG HOT MIXTURE';
  }, [selectedProductFilter, baseProducts]);

  // Strictly single base product view
  const filteredBom = useMemo(() => {
    if (!activeBaseProduct) return [];
    return recipeBom.filter(r => (r.base_product?.trim() || '') === activeBaseProduct);
  }, [recipeBom, activeBaseProduct]);

  // Summary Metrics for the active base product
  const totalIngredientsCount = filteredBom.length;

  const totalBatchWeightKg = useMemo(() => {
    return filteredBom.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const u = (item.uom || '').toUpperCase();
      const inKg = (u === 'G' || u === 'GM' || u === 'GRAMS') ? (q / 1000) : q;
      return sum + inKg;
    }, 0);
  }, [filteredBom]);

  const totalBatchCost = useMemo(() => {
    return filteredBom.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const c = Number(item.unit_cost) || 0;
      return sum + (q * c);
    }, 0);
  }, [filteredBom]);

  // Multi-ingredient modal helpers
  const validIngredientCount = useMemo(() => {
    return ingredientRows.filter(r => r.raw_material && r.raw_material.trim()).length;
  }, [ingredientRows]);

  const newBatchWeightKg = useMemo(() => {
    return ingredientRows.reduce((sum, r) => {
      if (!r.raw_material || !r.raw_material.trim()) return sum;
      const q = Number(r.quantity) || 0;
      const u = (r.uom || '').toUpperCase();
      const inKg = (u === 'G' || u === 'GM' || u === 'GRAMS') ? (q / 1000) : q;
      return sum + inKg;
    }, 0);
  }, [ingredientRows]);

  const newBatchCost = useMemo(() => {
    return ingredientRows.reduce((sum, r) => {
      if (!r.raw_material || !r.raw_material.trim()) return sum;
      const q = Number(r.quantity) || 0;
      const c = Number(r.unit_cost) || 0;
      return sum + (q * c);
    }, 0);
  }, [ingredientRows]);

  const handleOpenAddModal = () => {
    setSelectedBaseProductForAdd(activeBaseProduct);
    setIngredientRows([
      createEmptyRow(),
      createEmptyRow(),
      createEmptyRow()
    ]);
    setIsAddModalOpen(true);
  };

  const handleUpdateIngredientRow = (index, field, value) => {
    setIngredientRows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddIngredientRow = () => {
    setIngredientRows(prev => [...prev, createEmptyRow()]);
  };

  const handleRemoveIngredientRow = (index) => {
    if (ingredientRows.length <= 1) return;
    setIngredientRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const validRows = ingredientRows.filter(r => r.raw_material && r.raw_material.trim());
    if (validRows.length === 0) {
      alert('Please enter at least one ingredient raw material name.');
      return;
    }

    const finalProduct = selectedBaseProductForAdd || activeBaseProduct;
    const itemsToSave = validRows.map(r => ({
      base_product: finalProduct,
      raw_material: r.raw_material.trim(),
      quantity: Number(r.quantity) || 0,
      uom: r.uom || 'KG',
      unit_cost: Number(r.unit_cost) || 0,
      wastage_percentage: Number(r.wastage_percentage) || 0
    }));

    await onSaveItem(itemsToSave);
    setSelectedProductFilter(finalProduct);
    setIsAddModalOpen(false);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const saveEdit = async () => {
    await onSaveItem(editForm);
    setEditingId(null);
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
      header: 'Unit Cost (₹)',
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
        return <span>₹{Number(val || 0).toFixed(2)}</span>;
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
      {/* Product Selection Bar (Single Base Product View) */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            <Filter size={15} color="var(--brand-600)" />
            Base Product Recipe:
          </div>

          <div style={{ minWidth: '260px' }}>
            <select
              className="select"
              value={activeBaseProduct}
              onChange={e => setSelectedProductFilter(e.target.value)}
              style={{ fontWeight: 600 }}
            >
              {baseProducts.map(bp => (
                <option key={bp} value={bp}>{bp}</option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredBom.length}</strong> ingredients for <strong>{activeBaseProduct}</strong>
          </div>

          {canEdit && (
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
                <Plus size={14} /> Add Ingredient to BOM
              </button>
            </div>
          )}
        </div>
      </div>

      <DataTable
        title={`Recipe BOM: ${activeBaseProduct}`}
        description="Ingredient formula per batch used to calculate raw material requirements and batch costs"
        columns={columns}
        data={filteredBom}
        searchable={true}
        searchPlaceholder="Filter ingredients..."
        emptyMessage={`No ingredients configured for "${activeBaseProduct}" yet. Click "+ Add Ingredient to BOM" above to register formula components.`}
      />

      {/* Recipe BOM Base Product Summary Section with Visual Border */}
      <div 
        className="card" 
        style={{ 
          marginTop: '20px', 
          border: '1.5px solid var(--border-default)', 
          borderRadius: 'var(--radius-lg, 12px)', 
          padding: '20px 24px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
          background: 'var(--bg-card, #ffffff)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle, #f1f5f9)', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--brand-50, #ecfdf5)', color: 'var(--brand-600, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChefHat size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--brand-600, #059669)' }}>
                Recipe BOM Base Product Summary
              </div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {activeBaseProduct}
              </h3>
            </div>
          </div>

          <span className="badge badge-planned" style={{ fontSize: '12px', padding: '4px 10px' }}>
            Single Base Product View
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* 1. BASE PRODUCT NAME */}
          <div style={{ background: 'var(--bg-subtle, #f8fafc)', border: '1.5px solid var(--border-default, #e2e8f0)', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={13} color="var(--brand-600)" />
              Base Product Name
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={activeBaseProduct}>
              {activeBaseProduct}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
              Selected Recipe Formula
            </div>
          </div>

          {/* 2. TOTAL INGREDIENTS NOS */}
          <div style={{ background: 'var(--bg-subtle, #f8fafc)', border: '1.5px solid var(--border-default, #e2e8f0)', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={13} color="var(--brand-600)" />
              Total Ingredients Nos
            </div>
            <div className="num-tabular" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {totalIngredientsCount} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Items</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
              Formula components
            </div>
          </div>

          {/* 3. TOTAL RAW MATERIAL QTY FOR A BATCH */}
          <div style={{ background: 'var(--bg-subtle, #f8fafc)', border: '1.5px solid var(--border-default, #e2e8f0)', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scale size={13} color="var(--brand-600)" />
              TOTAL RAW MATERIAL QTY FOR A BATCH
            </div>
            <div className="num-tabular" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {totalBatchWeightKg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>KG</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
              Net batch formula weight
            </div>
          </div>

          {/* 4. SUM OF COST UP TO THE BASE PRODUCT */}
          <div style={{ background: 'var(--bg-subtle, #f8fafc)', border: '1.5px solid var(--border-default, #e2e8f0)', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IndianRupee size={13} color="var(--brand-600)" />
              Sum of Cost Up to Base Product
            </div>
            <div className="num-tabular" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-700, #047857)', marginTop: '4px' }}>
              ₹{totalBatchCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
              Batch raw ingredients cost
            </div>
          </div>
        </div>
      </div>

      {/* Add Multiple Ingredients Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="860px"
        title="Add Ingredients to Recipe BOM"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleAddSubmit}
              disabled={validIngredientCount === 0}
            >
              {validIngredientCount > 1 
                ? `Save All ${validIngredientCount} Ingredients` 
                : validIngredientCount === 1 
                ? 'Save 1 Ingredient' 
                : 'Save Ingredients'}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit}>
          {/* Base Product Selector */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>
              Target Base Product Recipe *
            </label>
            <select
              className="select"
              value={selectedBaseProductForAdd || activeBaseProduct}
              onChange={e => setSelectedBaseProductForAdd(e.target.value)}
              style={{ fontWeight: 600 }}
              required
            >
              {baseProducts.map(bp => (
                <option key={bp} value={bp}>{bp}</option>
              ))}
            </select>
            <div className="form-hint" style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
              All ingredients entered below will be registered to this base product formula.
            </div>
          </div>

          {/* Multiple Ingredients Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
              Recipe Formulations ({ingredientRows.length} rows)
            </label>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddIngredientRow}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '12px' }}
            >
              <Plus size={13} /> Add Ingredient Row
            </button>
          </div>

          {/* Table Header Labels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '26px minmax(180px, 2.5fr) 90px 90px 105px 75px 32px',
            gap: '8px',
            padding: '6px 12px',
            background: 'var(--bg-subtle, #f8fafc)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '6px'
          }}>
            <div>#</div>
            <div>Raw Material Name *</div>
            <div style={{ textAlign: 'right' }}>Batch Qty *</div>
            <div>UOM *</div>
            <div style={{ textAlign: 'right' }}>Unit Cost (₹) *</div>
            <div style={{ textAlign: 'right' }}>Wastage %</div>
            <div></div>
          </div>

          {/* Rows List */}
          <div style={{ maxHeight: '330px', overflowY: 'auto', paddingRight: '2px' }}>
            {ingredientRows.map((row, idx) => (
              <div
                key={row.tempId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '26px minmax(180px, 2.5fr) 90px 90px 105px 75px 32px',
                  gap: '8px',
                  alignItems: 'center',
                  background: idx % 2 === 0 ? '#ffffff' : '#fcfdfd',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  marginBottom: '6px'
                }}
              >
                {/* Index badge */}
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {idx + 1}
                </div>

                {/* Raw Material Name */}
                <input
                  type="text"
                  className="input"
                  style={{ padding: '6px 10px', fontSize: '13px' }}
                  placeholder="E.g., Gram flour, Palm oil, Spices..."
                  value={row.raw_material}
                  onChange={e => handleUpdateIngredientRow(idx, 'raw_material', e.target.value)}
                  required
                />

                {/* Batch Qty */}
                <input
                  type="number"
                  step="0.01"
                  min="0.001"
                  className="input num-tabular"
                  style={{ padding: '6px 8px', fontSize: '13px', textAlign: 'right' }}
                  value={row.quantity}
                  onChange={e => handleUpdateIngredientRow(idx, 'quantity', e.target.value)}
                  required
                />

                {/* UOM */}
                <select
                  className="select"
                  style={{ padding: '6px 8px', fontSize: '12px' }}
                  value={row.uom}
                  onChange={e => handleUpdateIngredientRow(idx, 'uom', e.target.value)}
                >
                  <option value="KG">KG</option>
                  <option value="G">G</option>
                  <option value="LTR">LTR</option>
                  <option value="PCS">PCS</option>
                </select>

                {/* Unit Cost */}
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input num-tabular"
                  style={{ padding: '6px 8px', fontSize: '13px', textAlign: 'right' }}
                  value={row.unit_cost}
                  onChange={e => handleUpdateIngredientRow(idx, 'unit_cost', e.target.value)}
                  required
                />

                {/* Wastage % */}
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="input num-tabular"
                  style={{ padding: '6px 8px', fontSize: '13px', textAlign: 'right' }}
                  value={row.wastage_percentage}
                  onChange={e => handleUpdateIngredientRow(idx, 'wastage_percentage', e.target.value)}
                />

                {/* Delete button */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredientRow(idx)}
                    disabled={ingredientRows.length <= 1}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: ingredientRows.length <= 1 ? '#cbd5e1' : '#ef4444',
                      cursor: ingredientRows.length <= 1 ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                    title={ingredientRows.length <= 1 ? 'At least one ingredient row required' : 'Remove this ingredient'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddIngredientRow}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Add Another Ingredient
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setIngredientRows(prev => [
                  ...prev,
                  createEmptyRow(),
                  createEmptyRow(),
                  createEmptyRow()
                ]);
              }}
              style={{ fontSize: '11px' }}
            >
              + Add 3 More Rows
            </button>
          </div>

          {/* Formulation Preview Card */}
          <div style={{
            marginTop: '16px',
            padding: '12px 18px',
            background: 'var(--brand-50, #ecfdf5)',
            border: '1.5px solid var(--brand-200, #a7f3d0)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px'
          }}>
            <div>
              <strong>Formulation:</strong> {validIngredientCount} valid ingredient{validIngredientCount === 1 ? '' : 's'} for <strong>{selectedBaseProductForAdd || activeBaseProduct}</strong>
            </div>
            <div style={{ display: 'flex', gap: '18px' }}>
              <span>Total Weight: <strong>{newBatchWeightKg.toFixed(2)} KG</strong></span>
              <span>Total Cost: <strong style={{ color: 'var(--brand-700, #047857)' }}>₹{newBatchCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
