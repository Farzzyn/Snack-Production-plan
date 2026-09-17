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
  IndianRupee,
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
  staffList = [],
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
  const [isCostingExpanded, setIsCostingExpanded] = useState(true);

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
      staffList: staffList,
      country: selectedCountry,
      productionDate: productionDate
    });
  }, [selectedSku, orderBoxes, chefQuantity, baseProductCapacity, relevantRecipeBom, relevantPackagingBom, staffList, selectedCountry, productionDate]);

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
        estimated_staff_cost: calculation.estimated_staff_cost,
        total_production_cost: calculation.total_production_cost,
        staff_cost_breakdown: calculation.staff_cost_breakdown,
        notes: notes,
        raw_material_snapshots: calculation.raw_material_requirements,
        packaging_snapshots: calculation.packaging_requirements
      };

      await onSavePlan(planPayload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rawCost = calculation?.estimated_raw_material_cost || 0;
  const pkgCost = calculation?.estimated_packaging_cost || 0;
  const staffCost = calculation?.estimated_staff_cost || 0;
  const totalCost = calculation?.total_production_cost || (rawCost + pkgCost + staffCost);
  const totalMaterialCost = calculation?.total_material_cost || (rawCost + pkgCost);
  const packets = calculation?.packets_required || 0;
  const fgKg = calculation?.finished_goods_weight_kg || 0;
  const boxes = calculation?.order_quantity_boxes || 0;

  const rawPercent = totalCost > 0 ? ((rawCost / totalCost) * 100).toFixed(1) : '0';
  const pkgPercent = totalCost > 0 ? ((pkgCost / totalCost) * 100).toFixed(1) : '0';
  const staffPercent = totalCost > 0 ? ((staffCost / totalCost) * 100).toFixed(1) : '0';

  const costPerPacket = packets > 0 ? (totalCost / packets).toFixed(3) : '0.000';
  const costPerBox = boxes > 0 ? (totalCost / boxes).toFixed(2) : '0.00';
  const rawCostPerPacket = packets > 0 ? (rawCost / packets).toFixed(3) : '0.000';
  const pkgCostPerPacket = packets > 0 ? (pkgCost / packets).toFixed(3) : '0.000';
  const staffCostPerPacket = packets > 0 ? (staffCost / packets).toFixed(3) : '0.000';
  const costPerKg = fgKg > 0 ? (totalCost / fgKg).toFixed(2) : '0.00';
  const rawCostPerBox = boxes > 0 ? (rawCost / boxes).toFixed(2) : '0.00';
  const pkgCostPerBox = boxes > 0 ? (pkgCost / boxes).toFixed(2) : '0.00';
  const staffCostPerBox = boxes > 0 ? (staffCost / boxes).toFixed(2) : '0.00';

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
      
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-subtle)', padding: '10px 16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                <button
                  type="button"
                  className={`btn btn-sm ${activeBomTab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveBomTab('staff')}
                >
                  <Users size={13} />
                  Crew & Labor Allocation ({calculation?.staff_cost_breakdown?.length || 2})
                </button>
              </div>

              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {activeBomTab === 'raw' 
                  ? `Ingredients Total: ₹${calculation?.estimated_raw_material_cost.toFixed(2)}`
                  : activeBomTab === 'packaging'
                  ? `Packaging Total: ₹${calculation?.estimated_packaging_cost.toFixed(2)}`
                  : `Labor Total: ₹${(calculation?.estimated_staff_cost || 0).toFixed(2)}`}
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
                      <th style={{ textAlign: 'right' }}>Unit Cost (₹)</th>
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
                          ₹{Number(mat.unit_cost).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }} className="num-tabular">
                          ₹{mat.estimated_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                      <th style={{ textAlign: 'right' }}>Unit Cost (₹)</th>
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
                          ₹{Number(pkg.unit_cost).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }} className="num-tabular">
                          ₹{pkg.estimated_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

            {/* Tab 3: Crew & Staff Labor Allocation */}
            {activeBomTab === 'staff' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Crew Role / Labor Category</th>
                      <th style={{ textAlign: 'center' }}>Assigned Count</th>
                      <th style={{ textAlign: 'right' }}>Operating Hours</th>
                      <th style={{ textAlign: 'right' }}>Shift Wage (₹/day)</th>
                      <th style={{ textAlign: 'right' }}>Hourly Rate (₹)</th>
                      <th style={{ textAlign: 'right' }}>Allocated Labor Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(calculation?.staff_cost_breakdown || []).map((stf, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{stf.role}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-primary">{stf.headcount} Staff</span>
                        </td>
                        <td style={{ textAlign: 'right' }} className="num-tabular">
                          {stf.hours} hrs
                        </td>
                        <td style={{ textAlign: 'right' }} className="num-tabular">
                          ₹{Number(stf.daily_wage).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }} className="num-tabular">
                          ₹{Number(stf.hourly_rate).toFixed(2)} / hr
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-700)' }} className="num-tabular">
                          ₹{Number(stf.estimated_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: 'var(--bg-subtle)', fontWeight: 700 }}>
                      <td>Total Crew Labor</td>
                      <td style={{ textAlign: 'center' }}>
                        {calculation?.required_staff} Personnel
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {((calculation?.required_staff || 0) * (calculation?.production_hours || 0)).toFixed(1)} Man-Hrs
                      </td>
                      <td colSpan="2" style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '11.5px', fontWeight: 500 }}>
                        Shift basis ({calculation?.hours_per_batch || 0} hrs/batch)
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--brand-700)' }}>
                        ₹{Number(calculation?.estimated_staff_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* BOTTOM LANDSCAPE SECTION: Expanded Modern Financial & Costing Summary Card */}
      {calculation && (
        <div 
          className="card" 
          style={{ 
            background: 'linear-gradient(145deg, #09140e 0%, #112419 100%)', 
            color: '#ffffff', 
            border: '1.5px solid var(--border-default)',
            borderRadius: '16px',
            padding: '24px 28px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
            marginTop: '4px'
          }}
        >
          {/* Top Primary Landscape Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IndianRupee size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.09em', color: '#38bdf8', fontWeight: 700 }}>
                  Estimated Manufacturing Cost Total
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Commercial production cost (Raw Materials + Packaging + Crew Labor) for <strong style={{ color: '#ffffff' }}>{packets.toLocaleString()}</strong> packets ({boxes} boxes • {fgKg.toLocaleString()} KG)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <div className="num-tabular" style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  ₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span style={{ fontSize: '11.5px', color: '#4ade80', fontWeight: 700, background: 'rgba(34, 197, 94, 0.15)', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.35)', whiteSpace: 'nowrap' }}>
                  BOM & Crew Verified
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCostingExpanded(prev => !prev)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px' }}
                >
                  <Sliders size={14} />
                  {isCostingExpanded ? 'Hide Detailed Ledger' : 'Show Detailed Ledger'}
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleSave}
                  disabled={isSubmitting || orderBoxes <= 0}
                  style={{ padding: '12px 24px', fontWeight: 700 }}
                >
                  <CheckCircle2 size={18} />
                  {isSubmitting ? 'Scheduling Plan...' : 'Approve & Save Plan'}
                </button>
              </div>
            </div>
          </div>

          {/* Visual Distribution Split Bar (3-Pillar) */}
          <div style={{ marginTop: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', marginBottom: '8px', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#22c55e', display: 'inline-block' }}></span>
                  <strong>Raw Ingredients:</strong> ₹{rawCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({rawPercent}%)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#38bdf8', display: 'inline-block' }}></span>
                  <strong>Packaging & Cartons:</strong> ₹{pkgCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({pkgPercent}%)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f59e0b', display: 'inline-block' }}></span>
                  <strong>Crew & Staff Labor:</strong> ₹{staffCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({staffPercent}%)
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Combined Materials: ₹{totalMaterialCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({(Number(rawPercent) + Number(pkgPercent)).toFixed(1)}%)
              </div>
            </div>

            <div style={{ height: '10px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${rawPercent}%`, background: '#22c55e', transition: 'width 0.4s ease' }} title={`Raw Materials: ${rawPercent}%`}></div>
              <div style={{ width: `${pkgPercent}%`, background: '#38bdf8', transition: 'width 0.4s ease' }} title={`Packaging: ${pkgPercent}%`}></div>
              <div style={{ width: `${staffPercent}%`, background: '#f59e0b', transition: 'width 0.4s ease' }} title={`Staff Labor: ${staffPercent}%`}></div>
            </div>
          </div>

          {/* 5-Pillar Well-Aligned Landscape Metric Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginTop: '20px' }}>
            
            {/* 1. RAW MATERIALS SUB-TOTAL */}
            <div style={{ background: 'rgba(15, 31, 22, 0.75)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#4ade80', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ChefHat size={14} />
                  Raw Materials Subtotal
                </div>
                <div className="num-tabular" style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
                  ₹{rawCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>• ₹{rawCostPerPacket} / packet</span>
                <span>• ₹{rawCostPerBox} / box</span>
              </div>
            </div>

            {/* 2. PACKAGING MATERIALS SUB-TOTAL */}
            <div style={{ background: 'rgba(15, 31, 22, 0.75)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={14} />
                  Packaging Subtotal
                </div>
                <div className="num-tabular" style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
                  ₹{pkgCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>• ₹{pkgCostPerPacket} / packet</span>
                <span>• ₹{pkgCostPerBox} / box</span>
              </div>
            </div>

            {/* 3. STAFF & LABOR SUB-TOTAL */}
            <div style={{ background: 'rgba(15, 31, 22, 0.75)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} />
                  Staff Labor Subtotal
                </div>
                <div className="num-tabular" style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
                  ₹{staffCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>• ₹{staffCostPerPacket} / packet</span>
                <span>• {calculation?.required_staff || 0} crew @ {calculation?.production_hours || 0} hrs</span>
              </div>
            </div>

            {/* 4. TOTAL UNIT ECONOMICS */}
            <div style={{ background: 'rgba(15, 31, 22, 0.75)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c084fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} />
                  Finished Unit Economics
                </div>
                <div className="num-tabular" style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
                  ₹{costPerPacket} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>/ packet</span>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>• ₹{costPerBox} / box ({selectedSku?.packet_per_box || 0} pkts)</span>
                <span>• Order: {boxes} boxes ({packets.toLocaleString()} pkts)</span>
              </div>
            </div>

            {/* 5. BULK YIELD COST RATE */}
            <div style={{ background: 'rgba(15, 31, 22, 0.75)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#f472b6', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Weight size={14} />
                  Bulk Yield Cost Rate
                </div>
                <div className="num-tabular" style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
                  ₹{costPerKg} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>/ KG FG</span>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>• Net FG: {fgKg.toFixed(2)} KG</span>
                <span>• {calculation?.production_batches || 0} Batches @ {calculation?.production_hours || 0} hrs</span>
              </div>
            </div>

          </div>

          {/* Expanded Itemized Cost Ledger (Toggled) */}
          {isCostingExpanded && (
            <div style={{ marginTop: '22px', paddingTop: '20px', borderTop: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} color="#38bdf8" />
                  Itemized Cost Contribution Ledger
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'none', fontWeight: 500 }}>
                  Live Breakdown across Ingredients, Packaging & Labor
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                
                {/* 1. Raw Materials Cost Breakdown */}
                <div style={{ background: '#0a1a11', borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#4ade80', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '6px' }}>
                    <span>Raw Materials ({calculation?.raw_material_requirements?.length || 0} items)</span>
                    <span>Subtotal: ₹{rawCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '12px' }}>
                    {(calculation?.raw_material_requirements || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)' }}>
                        <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.raw_material}>
                          {item.raw_material}
                        </span>
                        <span className="num-tabular" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                          {item.quantity} {item.uom} @ ₹{item.unit_cost}
                        </span>
                        <strong className="num-tabular" style={{ color: '#ffffff' }}>
                          ₹{item.estimated_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Packaging Materials Cost Breakdown */}
                <div style={{ background: '#0a1a11', borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '6px' }}>
                    <span>Packaging Materials ({calculation?.packaging_requirements?.length || 0} items)</span>
                    <span>Subtotal: ₹{pkgCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '12px' }}>
                    {(calculation?.packaging_requirements || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)' }}>
                        <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.packaging_material}>
                          {item.packaging_material}
                        </span>
                        <span className="num-tabular" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                          {item.quantity} {item.uom} @ ₹{item.unit_cost}
                        </span>
                        <strong className="num-tabular" style={{ color: '#ffffff' }}>
                          ₹{item.estimated_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Crew Labor Cost Breakdown */}
                <div style={{ background: '#0a1a11', borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#fbbf24', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '6px' }}>
                    <span>Crew & Staff Labor ({calculation?.staff_cost_breakdown?.length || 2} roles)</span>
                    <span>Subtotal: ₹{staffCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '12px' }}>
                    {(calculation?.staff_cost_breakdown || []).map((stf, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)' }}>
                        <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={stf.role}>
                          {stf.role}
                        </span>
                        <span className="num-tabular" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                          {stf.headcount} staff × {stf.hours}h @ ₹{stf.hourly_rate}/h
                        </span>
                        <strong className="num-tabular" style={{ color: '#ffffff' }}>
                          ₹{stf.estimated_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
