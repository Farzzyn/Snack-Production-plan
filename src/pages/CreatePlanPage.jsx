import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  ChefHat, 
  Package, 
  Weight, 
  Layers, 
  Sparkles, 
  Clock, 
  Users, 
  ArrowRight, 
  Save,
  Globe,
  Sliders,
  DollarSign,
  Info
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
  // Wizard inputs
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
  const [activeBomTab, setActiveBomTab] = useState('raw'); // 'raw' | 'packaging'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected entities
  const selectedCountry = useMemo(() => {
    return countries.find(c => c.id === selectedCountryId) || countries[0] || null;
  }, [countries, selectedCountryId]);

  const selectedSku = useMemo(() => {
    return skus.find(s => s.sku_id === selectedSkuId) || skus[0] || null;
  }, [skus, selectedSkuId]);

  // Capacity config for selected base product
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

  // BOMs
  const relevantRecipeBom = useMemo(() => {
    if (!selectedSku) return [];
    return recipeBomList.filter(r => 
      r.base_product.toLowerCase() === selectedSku.base_product.toLowerCase()
    );
  }, [recipeBomList, selectedSku]);

  const relevantPackagingBom = useMemo(() => {
    if (!selectedSku) return [];
    return packagingBomList.filter(p => p.sku_id === selectedSku.sku_id);
  }, [packagingBomList, selectedSku]);

  // Centralized calculations
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

  const costPerPacket = calculation?.packets_required > 0 
    ? (calculation.total_material_cost / calculation.packets_required).toFixed(3)
    : '0.000';

  const costPerBox = calculation?.order_quantity_boxes > 0
    ? (calculation.total_material_cost / calculation.order_quantity_boxes).toFixed(2)
    : '0.00';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-600)', fontWeight: 700, marginBottom: '2px' }}>
            <Sparkles size={13} />
            MRP-Lite Manufacturing Engine
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Plan Production Order
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('production-plans')}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSubmitting || orderBoxes <= 0}
          >
            <Save size={15} />
            {isSubmitting ? 'Scheduling...' : 'Confirm & Save Production Plan'}
          </button>
        </div>
      </div>

      {/* Main Form Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1.85fr)', gap: '22px' }}>
        
        {/* LEFT COLUMN: Input Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Package size={17} color="var(--brand-600)" />
                Order Configuration
              </h3>
            </div>

            {/* Step 1: Destination Country */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={13} color="var(--text-muted)" />
                Destination Country
              </label>
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

            {/* Step 2: Finished SKU */}
            <div className="form-group">
              <label className="form-label">
                Finished SKU Code
              </label>
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
              <div className="form-hint" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span>Base Line: <strong>{selectedSku?.base_product}</strong></span>
                <span>Box Pack: <strong>{selectedSku?.packet_per_box} pkts/box</strong></span>
              </div>
            </div>

            {/* Step 3: Order Quantity in Boxes */}
            <div className="form-group">
              <label className="form-label">
                Order Quantity (Boxes)
              </label>
              <input 
                type="number" 
                min="1"
                step="1"
                className="input num-tabular" 
                value={orderBoxes}
                onChange={e => setOrderBoxes(Math.max(1, parseInt(e.target.value) || 0))}
                style={{ fontSize: '16px', fontWeight: 700 }}
              />
              <div className="form-hint" style={{ color: 'var(--brand-600)', fontWeight: 500, marginTop: '6px' }}>
                Generates <strong className="num-tabular">{calculation?.packets_required.toLocaleString()}</strong> packets ({calculation?.finished_goods_weight_kg.toLocaleString()} KG net weight)
              </div>
            </div>

            {/* Step 4: Chef Allocation Slider with Presets */}
            <div className="form-group" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ChefHat size={14} color="var(--brand-600)" />
                  Assigned Chefs
                </label>
                <span className="badge badge-planned" style={{ fontSize: '12px', padding: '2px 8px' }}>
                  {chefQuantity} Chefs
                </span>
              </div>

              <input 
                type="range" 
                min="1" 
                max="12" 
                value={chefQuantity} 
                onChange={e => setChefQuantity(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand-500)', cursor: 'pointer' }}
              />

              {/* Chef Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                {[2, 4, 6, 8, 10].map(qty => (
                  <button
                    key={qty}
                    type="button"
                    className={`btn btn-sm ${chefQuantity === qty ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '3px 0', fontSize: '11px' }}
                    onClick={() => setChefQuantity(qty)}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Production Date */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} color="var(--text-muted)" />
                Target Production Date
              </label>
              <input 
                type="date" 
                className="input"
                value={productionDate}
                onChange={e => setProductionDate(e.target.value)}
              />
            </div>

            {/* Step 6: Order Notes */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Packaging / Batch Notes</label>
              <textarea 
                className="textarea" 
                rows="2"
                placeholder="Export labeling instructions, lot number preferences..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Real-time Capacity Utilization Card */}
          {calculation && (
            <div className="card">
              <div className="card-header" style={{ marginBottom: '12px' }}>
                <h3 className="card-title">
                  <Sliders size={16} color="var(--brand-600)" />
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
                  style={{ marginTop: '10px', width: '100%' }}
                  onClick={() => setChefQuantity(calculation.recommended_chefs)}
                >
                  Auto-adjust to recommended {calculation.recommended_chefs} chefs
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Calculated Outputs & BOM Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Key Manufacturing KPIs */}
          {calculation && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div className="card" style={{ padding: '14px 16px' }}>
                <div className="kpi-label">Packets</div>
                <div className="kpi-value" style={{ fontSize: '20px' }}>
                  {calculation.packets_required.toLocaleString()}
                </div>
                <div className="kpi-subtext">{orderBoxes} boxes × {selectedSku?.packet_per_box}</div>
              </div>

              <div className="card" style={{ padding: '14px 16px' }}>
                <div className="kpi-label">Finished Goods</div>
                <div className="kpi-value" style={{ fontSize: '20px' }}>
                  {calculation.finished_goods_weight_kg.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500 }}>KG</span>
                </div>
                <div className="kpi-subtext">Target production</div>
              </div>

              <div className="card" style={{ padding: '14px 16px' }}>
                <div className="kpi-label">Batches</div>
                <div className="kpi-value" style={{ fontSize: '20px' }}>
                  {calculation.production_batches} <span style={{ fontSize: '12px', fontWeight: 500 }}>Batches</span>
                </div>
                <div className="kpi-subtext">@{calculation.capacity_per_batch} KG/batch</div>
              </div>

              <div className="card" style={{ padding: '14px 16px' }}>
                <div className="kpi-label">Crew & Hours</div>
                <div className="kpi-value" style={{ fontSize: '20px' }}>
                  {calculation.production_hours} <span style={{ fontSize: '12px', fontWeight: 500 }}>Hrs</span>
                </div>
                <div className="kpi-subtext">{calculation.required_staff} staff ({chefQuantity} chefs)</div>
              </div>
            </div>
          )}

          {/* BOM Tabbed Breakdown Card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', background: '#fafbfc', padding: '10px 16px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${activeBomTab === 'raw' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveBomTab('raw')}
                >
                  <Layers size={13} />
                  Raw Ingredients BOM ({calculation?.raw_material_requirements.length || 0})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${activeBomTab === 'packaging' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveBomTab('packaging')}
                >
                  <Package size={13} />
                  Packaging Materials BOM ({calculation?.packaging_requirements.length || 0})
                </button>
              </div>

              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {activeBomTab === 'raw' 
                  ? `Ingredients Total: $${calculation?.estimated_raw_material_cost.toFixed(2)}`
                  : `Packaging Total: $${calculation?.estimated_packaging_cost.toFixed(2)}`}
              </div>
            </div>

            {/* Tab 1: Raw Materials */}
            {activeBomTab === 'raw' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Raw Material Ingredient</th>
                      <th>UOM</th>
                      <th style={{ textAlign: 'right' }}>Calculated Qty</th>
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
                        <td style={{ textAlign: 'right', color: 'var(--text-tertiary)' }} className="num-tabular">
                          {mat.wastage_percentage}%
                        </td>
                        <td style={{ textAlign: 'right' }} className="num-tabular">
                          ${Number(mat.unit_cost).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }} className="num-tabular">
                          ${mat.estimated_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                    {(!calculation?.raw_material_requirements || calculation.raw_material_requirements.length === 0) && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          No recipe BOM configured for this base product.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Packaging Materials */}
            {activeBomTab === 'packaging' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Packaging Component</th>
                      <th>UOM</th>
                      <th style={{ textAlign: 'right' }}>Calculated Qty</th>
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
                        <td style={{ textAlign: 'right', color: 'var(--text-tertiary)' }} className="num-tabular">
                          {pkg.wastage_percentage}%
                        </td>
                        <td style={{ textAlign: 'right' }} className="num-tabular">
                          ${Number(pkg.unit_cost).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }} className="num-tabular">
                          ${pkg.estimated_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                    {(!calculation?.packaging_requirements || calculation.packaging_requirements.length === 0) && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          No packaging BOM configured for this SKU.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Minimal Modern Financial Summary Card */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #090d16 0%, #111827 100%)', color: '#ffffff', border: '1px solid #1f2937' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#38bdf8', fontWeight: 700 }}>
                  Estimated Material Cost Total
                </div>
                <div className="num-tabular" style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', fontWeight: 800, color: 'white', marginTop: '2px' }}>
                  ${calculation?.total_material_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  <span>Cost / Packet: <strong style={{ color: 'white' }}>${costPerPacket}</strong></span>
                  <span>•</span>
                  <span>Cost / Box: <strong style={{ color: 'white' }}>${costPerBox}</strong></span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleSave}
                  disabled={isSubmitting || orderBoxes <= 0}
                  style={{ padding: '12px 24px' }}
                >
                  <CheckCircle2 size={18} />
                  {isSubmitting ? 'Scheduling Plan...' : 'Approve & Save Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
