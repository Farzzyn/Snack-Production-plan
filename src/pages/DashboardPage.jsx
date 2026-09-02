import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Weight, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  PlusCircle, 
  FileUp, 
  Layers, 
  Eye, 
  ChefHat,
  ArrowUpRight
} from 'lucide-react';
import KPICard from '../components/common/KPICard';
import DataTable from '../components/common/DataTable';

export default function DashboardPage({ 
  plans = [], 
  skus = [], 
  onNavigate, 
  onSelectPlan 
}) {
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const todayPlans = useMemo(() => plans.filter(p => p.production_date === todayStr), [plans, todayStr]);
  const upcomingPlans = useMemo(() => plans.filter(p => p.production_date > todayStr), [plans, todayStr]);

  const totalPackets = useMemo(() => plans.reduce((acc, p) => acc + (Number(p.packets_required) || 0), 0), [plans]);
  const totalWeightKg = useMemo(() => plans.reduce((acc, p) => acc + (Number(p.finished_goods_weight_kg) || 0), 0), [plans]);

  // 7-day calendar timeline
  const calendarDays = useMemo(() => {
    const days = [];
    const base = new Date();
    for (let i = -1; i <= 5; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayPlans = plans.filter(p => p.production_date === dateStr);
      const totalDayWeight = dayPlans.reduce((sum, p) => sum + (Number(p.finished_goods_weight_kg) || 0), 0);

      days.push({
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        count: dayPlans.length,
        totalWeight: totalDayWeight,
        isToday: dateStr === todayStr
      });
    }
    return days;
  }, [plans, todayStr]);

  const displayedPlans = useMemo(() => {
    if (!selectedDateFilter) return plans.slice(0, 8);
    return plans.filter(p => p.production_date === selectedDateFilter);
  }, [plans, selectedDateFilter]);

  const columns = [
    {
      header: 'Plan #',
      key: 'plan_number',
      render: (val, row) => (
        <span 
          style={{ fontWeight: 600, color: 'var(--brand-600)', cursor: 'pointer' }}
          onClick={() => onSelectPlan(row)}
        >
          {val}
        </span>
      )
    },
    {
      header: 'Country',
      key: 'country_name',
      render: (val) => <span style={{ fontWeight: 500 }}>{val || 'Export'}</span>
    },
    {
      header: 'Finished SKU',
      key: 'sku_name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.sku_id}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{val}</div>
        </div>
      )
    },
    {
      header: 'Boxes',
      key: 'order_quantity_boxes',
      numeric: true,
      align: 'right',
      render: (val) => Number(val).toLocaleString()
    },
    {
      header: 'Packets',
      key: 'packets_required',
      numeric: true,
      align: 'right',
      render: (val) => Number(val).toLocaleString()
    },
    {
      header: 'Net Weight',
      key: 'finished_goods_weight_kg',
      numeric: true,
      align: 'right',
      render: (val) => <strong>{Number(val).toLocaleString()} KG</strong>
    },
    {
      header: 'Crew',
      key: 'selected_chef_quantity',
      numeric: true,
      align: 'center',
      render: (val) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '12px' }}>
          <ChefHat size={12} color="var(--brand-600)" /> {val}
        </span>
      )
    },
    {
      header: 'Schedule Date',
      key: 'production_date'
    },
    {
      header: 'Status',
      key: 'status',
      align: 'center',
      render: (val) => {
        const key = (val || '').toLowerCase().replace(' ', '_');
        return <span className={`badge badge-${key}`}>{val}</span>;
      }
    },
    {
      header: '',
      align: 'center',
      render: (_, row) => (
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onSelectPlan(row)}
          style={{ padding: '4px 8px' }}
        >
          <Eye size={13} />
          View
        </button>
      )
    }
  ];

  return (
    <div>
      {/* KPI Grid */}
      <div className="kpi-grid">
        <KPICard
          label="Today's Production"
          value={`${todayPlans.length} Plans`}
          subtext={`${todayPlans.reduce((s, p) => s + (Number(p.finished_goods_weight_kg) || 0), 0).toLocaleString()} KG queued today`}
          icon={Clock}
          color="primary"
        />
        <KPICard
          label="Upcoming Schedule"
          value={`${upcomingPlans.length} Orders`}
          subtext="Next 7 days in queue"
          icon={Calendar}
          color="purple"
        />
        <KPICard
          label="Planned Finished Goods"
          value={`${(totalWeightKg / 1000).toFixed(1)} MT`}
          subtext={`${totalWeightKg.toLocaleString()} Kilograms`}
          icon={Weight}
          color="success"
        />
        <KPICard
          label="Total Packets Planned"
          value={totalPackets.toLocaleString()}
          subtext={`Across ${skus.length} active SKUs`}
          icon={Package}
          color="warning"
        />
      </div>

      {/* Calendar & Quick Actions Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '18px', marginBottom: '20px' }}>
        
        {/* Timeline Calendar Bar */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '14px' }}>
            <div>
              <h3 className="card-title">
                <Calendar size={16} color="var(--brand-600)" />
                Production Timeline
              </h3>
              <div className="card-description">
                Click any day to filter scheduled manufacturing orders
              </div>
            </div>
            {selectedDateFilter && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedDateFilter(null)}
              >
                Clear Filter ({selectedDateFilter})
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {calendarDays.map(day => {
              const isSelected = selectedDateFilter === day.dateStr;
              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDateFilter(isSelected ? null : day.dateStr)}
                  style={{
                    padding: '10px 6px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected 
                      ? '2px solid var(--brand-500)' 
                      : day.isToday 
                        ? '1px solid #0284c7' 
                        : '1px solid var(--border-default)',
                    backgroundColor: isSelected 
                      ? 'var(--brand-50)' 
                      : day.isToday 
                        ? '#f0f9ff' 
                        : 'var(--bg-surface)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 0 3px var(--brand-glow)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '10.5px', fontWeight: 600, color: day.isToday ? 'var(--brand-600)' : 'var(--text-muted)' }}>
                    {day.dayName}
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0' }}>
                    {day.dayNum}
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ 
                      display: 'inline-block',
                      fontSize: '10px', 
                      fontWeight: 700, 
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: day.count > 0 ? 'var(--brand-100)' : 'var(--bg-subtle)',
                      color: day.count > 0 ? 'var(--brand-600)' : 'var(--text-muted)'
                    }}>
                      {day.count} {day.count === 1 ? 'plan' : 'plans'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '14px' }}>
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              className="btn btn-primary"
              style={{ justifyContent: 'flex-start', padding: '9px 14px' }}
              onClick={() => onNavigate('create-plan')}
            >
              <PlusCircle size={15} />
              New Production Plan
            </button>
            <button 
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '9px 14px' }}
              onClick={() => onNavigate('sku-master')}
            >
              <Package size={15} />
              Configure SKUs & Pack Sizes
            </button>
            <button 
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '9px 14px' }}
              onClick={() => onNavigate('recipe-bom')}
            >
              <Layers size={15} />
              Ingredient & Packaging BOMs
            </button>
            <button 
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '9px 14px' }}
              onClick={() => onNavigate('import-data')}
            >
              <FileUp size={15} />
              Import Master Data (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Production Plans Table */}
      <DataTable
        title={selectedDateFilter ? `Production Schedule for ${selectedDateFilter}` : 'Recent Production Orders'}
        description="Active manufacturing orders with chef allocations and fulfillment states"
        columns={columns}
        data={displayedPlans}
        searchable={true}
        searchPlaceholder="Search order, SKU, country..."
        actionButton={
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('create-plan')}
          >
            <PlusCircle size={13} />
            Create Plan
          </button>
        }
      />
    </div>
  );
}
