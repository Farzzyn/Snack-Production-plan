import React from 'react';
import { 
  Printer, 
  ArrowLeft, 
  Calendar, 
  ChefHat, 
  Package, 
  Weight, 
  Clock, 
  Users, 
  IndianRupee, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import AppLogo from '../components/common/AppLogo';

export default function PlanDetailsPage({ 
  plan, 
  onBack, 
  onUpdateStatus, 
  currentUser 
}) {
  if (!plan) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h3>No plan selected</h3>
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={onBack}>
          <ArrowLeft size={16} /> Back to Production Plans
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const rawMaterials = plan.raw_materials || plan.raw_material_snapshots || [];
  const packaging = plan.packaging || plan.packaging_snapshots || [];
  const staffBreakdown = plan.staff_cost_breakdown || [];

  const includeRaw = plan.include_raw_materials !== false;
  const includePackaging = plan.include_packaging !== false;
  const includeStaff = plan.include_staff_labor !== false;

  const rawCost = Number(plan.estimated_raw_material_cost) || rawMaterials.reduce((s, i) => s + (Number(i.estimated_cost) || 0), 0);
  const packCost = Number(plan.estimated_packaging_cost) || packaging.reduce((s, i) => s + (Number(i.estimated_cost) || 0), 0);
  const staffCost = Number(plan.estimated_staff_cost) || staffBreakdown.reduce((s, i) => s + (Number(i.estimated_cost) || 0), 0);

  const effectiveRawCost = includeRaw ? rawCost : 0;
  const effectivePackCost = includePackaging ? packCost : 0;
  const effectiveStaffCost = includeStaff ? staffCost : 0;

  const totalProductionCost = plan.total_production_cost != null
    ? Number(plan.total_production_cost)
    : (effectiveRawCost + effectivePackCost + effectiveStaffCost);
  const totalMaterialCost = Number(plan.total_material_cost) || (effectiveRawCost + effectivePackCost);

  const canEdit = currentUser?.role !== 'viewer';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Top Toolbar (Hidden during print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to Plans
        </button>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {canEdit && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: 500 }}>Update Status:</span>
              <select
                className="select"
                value={plan.status}
                onChange={e => onUpdateStatus(plan.id, e.target.value)}
                style={{ padding: '6px 12px', fontSize: '13px', fontWeight: 600 }}
              >
                <option value="Draft">Draft</option>
                <option value="Planned">Planned</option>
                <option value="In Production">In Production</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* Official Production Plan Dossier Card (Printable) */}
      <div className="card" style={{ padding: '32px 36px' }}>
        
        {/* Document Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-strong)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <AppLogo variant="icon" size={48} theme="dark" />
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-500)', fontWeight: 700 }}>
                Snack Manufacturing Facility • Production Order Dossier
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {plan.plan_number}
              </h1>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Destination Country: <strong>{plan.country_name || 'Export'}</strong> | Customer Order Ref: <strong>{plan.order_number || 'N/A'}</strong>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className={`badge badge-${(plan.status || '').toLowerCase().replace(' ', '_')}`} style={{ fontSize: '13px', padding: '4px 12px' }}>
              {plan.status}
            </span>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Scheduled Date: <strong style={{ color: 'var(--text-primary)' }}>{plan.production_date}</strong>
            </div>
          </div>
        </div>

        {/* Product & Order Configuration Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', background: 'var(--bg-subtle)', padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>SKU Code</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{plan.sku_id}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{plan.sku_name}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Pack Spec</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{plan.pack_size_g} Grams</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Base: {plan.base_product}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Order Quantity</div>
            <div className="num-tabular" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {Number(plan.order_quantity_boxes).toLocaleString()} Boxes
            </div>
            <div className="num-tabular" style={{ fontSize: '12px', color: 'var(--brand-500)', fontWeight: 600 }}>
              {Number(plan.packets_required).toLocaleString()} Packets
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Target Net Weight</div>
            <div className="num-tabular" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {Number(plan.finished_goods_weight_kg).toLocaleString()} KG
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {(Number(plan.finished_goods_weight_kg) / 1000).toFixed(2)} Metric Tons
            </div>
          </div>
        </div>

        {/* Manufacturing Operations & Labor Schedule */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          <div style={{ border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ChefHat size={14} color="var(--brand-500)" />
              Chefs Assigned
            </div>
            <div className="num-tabular" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {plan.selected_chef_quantity} Chefs
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Capacity: {Number(plan.available_capacity_per_day).toLocaleString()} KG/day
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={14} color="var(--brand-500)" />
              Production Batches
            </div>
            <div className="num-tabular" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {plan.production_batches} Batches
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {plan.batch_planned_output_kg ? `${plan.batch_planned_output_kg} KG bulk yield` : 'Scheduled sequentially'}
              {plan.surplus_bulk_weight_kg > 0 ? ` (+${plan.surplus_bulk_weight_kg} KG surplus)` : ''}
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} color="var(--brand-500)" />
              Total Plant Hours
            </div>
            <div className="num-tabular" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {plan.production_hours} Hours
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Operating time
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={14} color="var(--brand-500)" />
              Total Required Crew
            </div>
            <div className="num-tabular" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {plan.required_staff} Staff
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {plan.selected_chef_quantity} Chefs + {Math.max(0, (plan.required_staff || 0) - (plan.selected_chef_quantity || 0))} Floor crew
            </div>
          </div>
        </div>

        {/* Raw Material Requirements Snapshot Table */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              1. Raw Material Requirements (Historical BOM Snapshot)
              {!includeRaw && (
                <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '11px' }}>
                  Excluded from Total
                </span>
              )}
            </h3>
            <span style={{ fontSize: '13px', fontWeight: 700, color: includeRaw ? 'var(--text-primary)' : '#94a3b8', textDecoration: includeRaw ? 'none' : 'line-through' }}>
              Subtotal: ₹{rawCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <table className="data-table" style={{ border: '1px solid var(--border-default)' }}>
            <thead>
              <tr>
                <th>Raw Material Ingredient</th>
                <th>UOM</th>
                <th style={{ textAlign: 'right' }}>Calculated Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Cost (₹)</th>
                <th style={{ textAlign: 'right' }}>Estimated Cost</th>
              </tr>
            </thead>
            <tbody>
              {rawMaterials.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{item.raw_material}</td>
                  <td><span className="badge badge-draft">{item.uom}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }} className="num-tabular">
                    {Number(item.quantity).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }} className="num-tabular">
                    ₹{Number(item.unit_cost || 0).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--brand-500)' }} className="num-tabular">
                    ₹{Number(item.estimated_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {rawMaterials.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                    No raw materials snapshot recorded for this plan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Packaging Requirements Snapshot Table */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              2. Packaging Material Requirements (Historical BOM Snapshot)
              {!includePackaging && (
                <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '11px' }}>
                  Excluded from Total
                </span>
              )}
            </h3>
            <span style={{ fontSize: '13px', fontWeight: 700, color: includePackaging ? 'var(--text-primary)' : '#94a3b8', textDecoration: includePackaging ? 'none' : 'line-through' }}>
              Subtotal: ₹{packCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <table className="data-table" style={{ border: '1px solid var(--border-default)' }}>
            <thead>
              <tr>
                <th>Packaging Material</th>
                <th>UOM</th>
                <th style={{ textAlign: 'right' }}>Calculated Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Cost (₹)</th>
                <th style={{ textAlign: 'right' }}>Estimated Cost</th>
              </tr>
            </thead>
            <tbody>
              {packaging.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{item.packaging_material}</td>
                  <td><span className="badge badge-draft">{item.uom}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }} className="num-tabular">
                    {Number(item.quantity).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }} className="num-tabular">
                    ₹{Number(item.unit_cost || 0).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--brand-500)' }} className="num-tabular">
                    ₹{Number(item.estimated_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {packaging.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                    No packaging snapshot recorded for this plan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Crew & Labor Allocation Snapshot Table */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              3. Crew & Staff Labor Allocation (Schedule & Direct Wages)
              {!includeStaff && (
                <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '11px' }}>
                  Excluded from Total
                </span>
              )}
            </h3>
            <span style={{ fontSize: '13px', fontWeight: 700, color: includeStaff ? 'var(--text-primary)' : '#94a3b8', textDecoration: includeStaff ? 'none' : 'line-through' }}>
              Subtotal: ₹{staffCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <table className="data-table" style={{ border: '1px solid var(--border-default)' }}>
            <thead>
              <tr>
                <th>Labor Role / Crew Category</th>
                <th style={{ textAlign: 'center' }}>Headcount</th>
                <th style={{ textAlign: 'right' }}>Operating Hours</th>
                <th style={{ textAlign: 'right' }}>Daily Wage (₹)</th>
                <th style={{ textAlign: 'right' }}>Hourly Rate (₹)</th>
                <th style={{ textAlign: 'right' }}>Estimated Labor Cost</th>
              </tr>
            </thead>
            <tbody>
              {staffBreakdown.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{item.role}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-draft">{item.headcount} Staff</span>
                  </td>
                  <td style={{ textAlign: 'right' }} className="num-tabular">
                    {item.hours} hrs
                  </td>
                  <td style={{ textAlign: 'right' }} className="num-tabular">
                    ₹{Number(item.daily_wage || 0).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }} className="num-tabular">
                    ₹{Number(item.hourly_rate || 0).toFixed(2)}/hr
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--brand-500)' }} className="num-tabular">
                    ₹{Number(item.estimated_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {staffBreakdown.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                    Standard crew allocation: {plan.selected_chef_quantity || 1} Chef(s) + {Math.max(0, (plan.required_staff || 1) - (plan.selected_chef_quantity || 1))} Floor Crew ({plan.production_hours || 0} plant hours).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Notes & Authorizations */}
        {plan.notes && (
          <div style={{ background: 'var(--bg-subtle)', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', marginBottom: '28px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Production Notes & Instructions
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '4px' }}>
              {plan.notes}
            </div>
          </div>
        )}

        {/* Total Cost Summary & Signoff Blocks */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '18px', borderTop: '2px solid var(--border-strong)', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', gap: '18px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{ opacity: includeRaw ? 1 : 0.5, textDecoration: includeRaw ? 'none' : 'line-through' }}>
                Raw Materials: <strong>₹{rawCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                {!includeRaw && ' (Excluded)'}
              </span>
              <span>•</span>
              <span style={{ opacity: includePackaging ? 1 : 0.5, textDecoration: includePackaging ? 'none' : 'line-through' }}>
                Packaging: <strong>₹{packCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                {!includePackaging && ' (Excluded)'}
              </span>
              <span>•</span>
              <span style={{ opacity: includeStaff ? 1 : 0.5, textDecoration: includeStaff ? 'none' : 'line-through' }}>
                Staff Labor: <strong>₹{staffCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                {!includeStaff && ' (Excluded)'}
              </span>
            </div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-500)', fontWeight: 700 }}>
              Total Effective Manufacturing Cost ({[
                includeRaw && 'Raw Materials',
                includePackaging && 'Packaging',
                includeStaff && 'Crew Labor'
              ].filter(Boolean).join(' + ') || 'None selected'}):
            </div>
            <div className="num-tabular" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              ₹{totalProductionCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>Cost/Packet: <strong style={{ color: 'var(--text-primary)' }}>₹{Number(plan.packets_required) > 0 ? (totalProductionCost / Number(plan.packets_required)).toFixed(2) : '0.00'}</strong></span>
              <span>•</span>
              <span>Cost/Box: <strong style={{ color: 'var(--text-primary)' }}>₹{Number(plan.order_quantity_boxes) > 0 ? (totalProductionCost / Number(plan.order_quantity_boxes)).toFixed(2) : '0.00'}</strong></span>
              <span>•</span>
              <span>Cost/Finished KG: <strong style={{ color: 'var(--text-primary)' }}>₹{Number(plan.finished_goods_weight_kg) > 0 ? (totalProductionCost / Number(plan.finished_goods_weight_kg)).toFixed(2) : '0.00'}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '32px' }}>
            <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-strong)', width: '160px', paddingTop: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Production Head Signature</div>
            </div>
            <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-strong)', width: '160px', paddingTop: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quality Lead Signoff</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
