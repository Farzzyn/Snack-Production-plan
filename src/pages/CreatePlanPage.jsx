import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  ChefHat, 
  Package, 
  Weight, 
  Layers, 
  Sparkles, 
  DollarSign, 
  Clock, 
  Users, 
  ArrowRight, 
  Save 
} from 'lucide-react';
import { calculateProductionPlan } from '../services/calculationEngine';
import CapacityBar from '../components/common/CapacityBar';

export default function CreatePlanPage({
  countries = [],
  skus = [],
  capacityList = [],
  recipeBomList = [],
  packagingBomList = [],
  onSavePlan,
  onNavigate
}) {
  // Wizard / Form inputs
  const [selectedCountryId, setSelectedCountryId] = useState(countries[0]?.id || '');
  const [selectedSkuId, setSelectedSkuId] = useState(skus[0]?.sku_id || '');
  const [orderBoxes, setOrderBoxes] = useState(500);
  const [chefQuantity, setChefQuantity] = useState(4);
  const [productionDate, setProductionDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected entities
  const selectedCountry = useMemo(() => {
    return countries.find(c => c.id === selectedCountryId) || countries[0] || null;
  }, [countries, selectedCountryId]);

  const selectedSku = useMemo(() => {
    return skus.find(s => s.sku_id === selectedSkuId) || skus[0] || null;
  }, [skus, selectedSkuId]);

  // Find capacity configuration for the selected SKU's base product
  const baseProductCapacity = useMemo(() => {
    if (!selectedSku) return null;
    return capacityList.find(c => 
      c.base_product.toLowerCase() === selectedSku.base_product.toLowerCase()
    ) || {
      base_product: selectedSku.base_product,
      max_capacity_per_day: 500,
      count_of_chef: 2,
      count_of_staff: 4,
      batch_count: 4,
      operating_hours: 8,
      capacity_per_batch: 125,
      hours_per_batch: 2
    };
  }, [capacityList, selectedSku]);

  // Filter Recipe BOM for base product
  const relevantRecipeBom = useMemo(() => {
    if (!selectedSku) return [];
    return recipeBomList.filter(r => 
      r.base_product.toLowerCase() === selectedSku.base_product.toLowerCase()
    );
  }, [recipeBomList, selectedSku]);

  // Filter Packaging BOM for SKU
  const relevantPackagingBom = useMemo(() => {
    if (!selectedSku) return [];
    return packagingBomList.filter(p => p.sku_id === selectedSku.sku_id);
  }, [packagingBomList, selectedSku]);

  // Reactive centralized calculation engine
  const calculation = useMemo(() => {
    if (!selectedSku) return null;

    return calculateProductionPlan({
      sku: selectedSku,
      orderQuantityBoxes: orderBoxes,
      chefQuantity: chefQuantity,
      capacityMaster: baseProductCapacity,
      recipeBOM: relevantRecipeBom,
      packagingBOM: relevantPackagingBom,
      country: selectedCountry,
      productionDate: productionDate
    });
  }, [selectedSku, orderBoxes, chefQuantity, baseProductCapacity, relevantRecipeBom, relevantPackagingBom, selectedCountry, productionDate]);

  const handleSave = async () => {
    if (!calculation) return;
    if (orderBoxes <= 0) {
      alert('Please enter a valid order quantity greater than 0.');
      return;
    }
    if (!productionDate) {
      alert('Please select a valid production date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const planPayload = {
        country_id: selectedCountry?.id,
        country_name: selectedCountry?.country_name,
        sku_id: selectedSku?.sku_id,
        sku_name: selectedSku?.sku_name,
        base_product: selectedSku?.base_product,
        pack_size_g: selectedSku?.pack_size_g,
        order_quantity_boxes: calculation.order_quantity_boxes,
        packets_required: calculation.packets_required,
        finished_goods_weight_kg: calculation.finished_goods_weight_kg,
        selected_chef_quantity: calculation.selected_chef_quantity,
        available_capacity_per_day: calculation.available_capacity_per_day,
        production_batches: calculation.production_batches,
        target_production_quantity: calculation.target_production_quantity,
        production_hours: calculation.production_hours,
        required_staff: calculation.required_staff,
        production_date: calculation.production_date,
        status: 'Planned',
        estimated_raw_material_cost: calculation.estimated_raw_material_cost,
        estimated_packaging_cost: calculation.estimated_packaging_cost,
        total_material_cost: calculation.total_material_cost,
        notes: notes,
        raw_material_snapshots: calculation.raw_material_requirements,
        packaging_snapshots: calculation.packaging_requirements
      };

      await onSavePlan(planPayload);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedSku) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h3>No active SKUs available</h3>
        <p style={{ color: 'var(--slate-500)', marginTop: '8px' }}>
          Please add SKUs in the SKU Master before planning production.
        </p>
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => onNavigate('sku-master')}>
          Go to SKU Master
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Plan Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--navy-900)' }}>
            New Snack Production Order
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '13px' }}>
            Transform customer orders into manufacturing schedules, batch numbers, ingredient BOMs, and staffing plans.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => onNavigate('production-plans')}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary btn-lg"
            onClick={handleSave}
            disabled={isSubmitting || orderBoxes <= 0}
          >
            <Save size={18} />
            {isSubmitting ? 'Generating Plan...' : 'Confirm & Generate Plan'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1.85fr)', gap: '24px' }}>
        
        {/* LEFT COLUMN: Input Configuration Parameters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Package size={18} color="var(--primary-600)" />
                Order & Product Parameters
              </h3>
            </div>

            {/* Step 1: Destination Country */}
            <div className="form-group">
              <label className="form-label">Step 1 — Destination / Customer Country</label>
              <select 
                className="select"
                value={selectedCountryId}
                onChange={e => setSelectedCountryId(e.target.value)}
              >
                {countries.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.country_name} ({c.country_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: SKU Selection */}
            <div className="form-group">
              <label className="form-label">Step 2 — Select Finished SKU</label>
              <select 
                className="select"
                value={selectedSkuId}
                onChange={e => setSelectedSkuId(e.target.value)}
              >
                {skus.filter(s => s.is_active !== false).map(s => (
                  <option key={s.sku_id} value={s.sku_id}>
                    {s.sku_id} — {s.sku_name} ({s.pack_size_g}g)
                  </option>
                ))}
              </select>
              <div className="form-hint" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Base Product: <strong>{selectedSku.base_product}</strong></span>
                <span>Box Spec: <strong>{selectedSku.packet_per_box} packets/box</strong></span>
              </div>
            </div>

            {/* Step 3: Pack Size Display */}
            <div className="form-group">
              <label className="form-label">Step 3 — Pack Size (Grams)</label>
              <input 
                type="text" 
                className="input" 
                value={`${selectedSku.pack_size_g} grams`} 
                disabled 
                style={{ backgroundColor: 'var(--slate-100)', fontWeight: 600 }}
              />
            </div>

            {/* Step 4: Order Quantity in Boxes */}
            <div className="form-group">
              <label className="form-label">Step 4 — Order Quantity (Boxes)</label>
              <div className="input-group">
                <input 
                  type="number" 
                  min="1"
                  step="1"
                  className="input num-tabular" 
                  value={orderBoxes}
                  onChange={e => setOrderBoxes(Math.max(1, parseInt(e.target.value) || 0))}
                  style={{ fontSize: '16px', fontWeight: 700 }}
                />
              </div>
              <div className="form-hint" style={{ color: 'var(--primary-600)', fontWeight: 500 }}>
                Yields: <strong>{calculation?.packets_required.toLocaleString()}</strong> packets = <strong>{calculation?.finished_goods_weight_kg.toLocaleString()} KG</strong> of finished snacks
              </div>
            </div>

            {/* Step 5: Chef Quantity Slider */}
            <div className="form-group" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Step 5 — Assigned Chefs
                </label>
                <span style={{ 
                  background: 'var(--primary-50)', 
                  color: 'var(--primary-600)', 
                  padding: '2px 10px', 
                  borderRadius: '12px', 
                  fontWeight: 700, 
                  fontSize: '14px' 
                }}>
                  {chefQuantity} Chefs
                </span>
              </div>

              <input 
                type="range" 
                min="1" 
                max="12" 
                value={chefQuantity} 
                onChange={e => setChefQuantity(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--slate-500)' }}>
                <span>1 Chef ({calculation?.capacity_per_chef} KG)</span>
                <span>6 Chefs ({(calculation?.capacity_per_chef || 250) * 6} KG)</span>
                <span>12 Chefs ({(calculation?.capacity_per_chef || 250) * 12} KG)</span>
              </div>
            </div>

            {/* Step 6: Production Date */}
            <div className="form-group">
              <label className="form-label">Step 6 — Planned Production Date</label>
              <input 
                type="date" 
                className="input"
                value={productionDate}
                onChange={e => setProductionDate(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Production Order Notes / Instructions</label>
              <textarea 
                className="textarea" 
                rows="2"
                placeholder="E.g., Special export carton branding, priority shipment..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Real-time Capacity Utilization Card */}
          {calculation && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <ChefHat size={18} color="var(--primary-600)" />
                  Daily Capacity Feasibility
                </h3>
              </div>
              <CapacityBar
                requiredKg={calculation.finished_goods_weight_kg}
                availableKg={calculation.available_capacity_per_day}
                utilization={calculation.capacity_utilization}
                isExceeded={calculation.is_capacity_exceeded}
                chefCount={chefQuantity}
                recommendedChefs={calculation.recommended_chefs}
              />
              {calculation.is_capacity_exceeded && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '12px', width: '100%' }}
                  onClick={() => setChefQuantity(calculation.recommended_chefs)}
                >
                  Auto-adjust to recommended {calculation.recommended_chefs} chefs
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Real-Time Calculated Manufacturing Outputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Production Output KPI Metrics */}
          {calculation && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--primary-500)' }}>
                <div className="kpi-label">Total Packets</div>
                <div className="kpi-value" style={{ fontSize: '20px' }}>
                  {calculation.packets_required.toLocaleString()}
                </div>
                <div className="kpi-subtext">{orderBoxes} boxes × {selectedSku.packet_per_box}</div>
              </div>

              <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--success-500)' }}>
                <div className="kpi-label">Finished Goods</div>
                <div className="kpi-value" style={{ fontSize: '20px' }}>
                  {calculation.finished_goods_weight_kg.toLocaleString()} <span style={{ fontSize: '13px' }}>KG</span>
                </div>
                <div className="kpi-subtext">Target weight</div>
              </div>

              <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--warning-500)' }}>
                <div className="kpi-label">Production Batches</div>
                <div className="kpi-value" style={{ fontSize: '20px' }}>
                  {calculation.production_batches} <span style={{ fontSize: '13px' }}>Batches</span>
                </div>
                <div className="kpi-subtext">@{calculation.capacity_per_batch} KG / batch</div>
              </div>

              <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid #8b5cf6' }}>
                <div className="kpi-label">Labor & Hours</div>
                <div className="kpi-value" style={{ fontSize: '20px' }}>
                  {calculation.production_hours} <span style={{ fontSize: '13px' }}>Hrs</span>
                </div>
                <div className="kpi-subtext">{calculation.required_staff} total crew ({chefQuantity} chefs + {calculation.support_staff} staff)</div>
              </div>
            </div>
          )}

          {/* Raw Material Requirements Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--slate-200)', background: 'var(--slate-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={17} color="var(--primary-600)" />
                  Raw Material Requirements (Recipe BOM)
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>
                  Scaled automatically for {calculation?.production_batches} batches of {selectedSku.base_product}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: 'var(--slate-500)' }}>Raw Materials Subtotal:</span>
                <div className="num-tabular" style={{ fontWeight: 700, fontSize: '16px', color: 'var(--navy-900)' }}>
                  ${calculation?.estimated_raw_material_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Raw Material</th>
                    <th>UOM</th>
                    <th style={{ textAlign: 'right' }}>Required Qty</th>
                    <th style={{ textAlign: 'right' }}>Wastage %</th>
                    <th style={{ textAlign: 'right' }}>Unit Cost</th>
                    <th style={{ textAlign: 'right' }}>Estimated Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {(calculation?.raw_material_requirements || []).map((mat, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{mat.raw_material}</td>
                      <td><span className="badge badge-draft">{mat.uom}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }} className="num-tabular">
                        {mat.quantity.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--slate-500)' }} className="num-tabular">
                        {mat.wastage_percentage}%
                      </td>
                      <td style={{ textAlign: 'right' }} className="num-tabular">
                        ${Number(mat.unit_cost).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--navy-900)' }} className="num-tabular">
                        ${mat.estimated_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {(!calculation?.raw_material_requirements || calculation.raw_material_requirements.length === 0) && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--slate-500)' }}>
                        No recipe BOM entries configured for this base product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Packaging Requirements Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--slate-200)', background: 'var(--slate-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={17} color="var(--primary-600)" />
                  Packaging Material Requirements (Packaging BOM)
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>
                  Scaled for {calculation?.packets_required.toLocaleString()} packets & {orderBoxes} shipper cartons
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: 'var(--slate-500)' }}>Packaging Subtotal:</span>
                <div className="num-tabular" style={{ fontWeight: 700, fontSize: '16px', color: 'var(--navy-900)' }}>
                  ${calculation?.estimated_packaging_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Packaging Material</th>
                    <th>UOM</th>
                    <th style={{ textAlign: 'right' }}>Required Qty</th>
                    <th style={{ textAlign: 'right' }}>Wastage %</th>
                    <th style={{ textAlign: 'right' }}>Unit Cost</th>
                    <th style={{ textAlign: 'right' }}>Estimated Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {(calculation?.packaging_requirements || []).map((pkg, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{pkg.packaging_material}</td>
                      <td><span className="badge badge-draft">{pkg.uom}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }} className="num-tabular">
                        {pkg.quantity.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--slate-500)' }} className="num-tabular">
                        {pkg.wastage_percentage}%
                      </td>
                      <td style={{ textAlign: 'right' }} className="num-tabular">
                        ${Number(pkg.unit_cost).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--navy-900)' }} className="num-tabular">
                        ${pkg.estimated_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {(!calculation?.packaging_requirements || calculation.packaging_requirements.length === 0) && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--slate-500)' }}>
                        No packaging BOM entries configured for this SKU.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Summary Card Before Confirmation */}
          <div className="card" style={{ backgroundColor: 'var(--navy-900)', color: 'white', border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary-400)', fontWeight: 700 }}>
                  Estimated Production BOM Total
                </div>
                <div className="num-tabular" style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: 'white' }}>
                  ${calculation?.total_material_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate-400)', marginTop: '2px' }}>
                  Raw Ingredients (${calculation?.estimated_raw_material_cost.toFixed(2)}) + Packaging (${calculation?.estimated_packaging_cost.toFixed(2)})
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleSave}
                  disabled={isSubmitting || orderBoxes <= 0}
                  style={{ background: 'linear-gradient(135deg, var(--primary-500), #0369a1)', padding: '14px 28px', fontSize: '15px' }}
                >
                  <CheckCircle2 size={18} />
                  {isSubmitting ? 'Saving Plan...' : 'Approve & Save Production Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
