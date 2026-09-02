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
  ChefHat 
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

  // KPIs
  const todayStr = new Date().toISOString().split('T')[0];

  const todayPlans = useMemo(() => plans.filter(p => p.production_date === todayStr), [plans, todayStr]);
  const upcomingPlans = useMemo(() => plans.filter(p => p.production_date > todayStr), [plans, todayStr]);
  const completedPlans = useMemo(() => plans.filter(p => p.status === 'Completed'), [plans]);

  const totalPackets = useMemo(() => plans.reduce((acc, p) => acc + (Number(p.packets_required) || 0), 0), [plans]);
  const totalWeightKg = useMemo(() => plans.reduce((acc, p) => acc + (Number(p.finished_goods_weight_kg) || 0), 0), [plans]);

  // Calendar aggregation for the upcoming 7 days
  const calendarDays = useMemo(() => {
    const days = [];
    const base = new Date();
    // Show from yesterday to next 5 days
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

  // Filtered plans based on calendar click
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
          style={{ fontWeight: 600, color: 'var(--primary-600)', cursor: 'pointer' }}
          onClick={() => onSelectPlan(row)}
        >
          {val}
        </span>
      )
    },
    {
      header: 'Country',
      key: 'country_name',
      render: (val) => (
        <span style={{ fontWeight: 500 }}>{val || 'Export'}</span>
      )
    },
    {
      header: 'SKU & Product',
      key: 'sku_name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{row.sku_id}</div>
          <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>{val}</div>
        </div>
      )
    },
    {
      header: 'Order (Boxes)',
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
      header: 'FG Weight',
      key: 'finished_goods_weight_kg',
      numeric: true,
      align: 'right',
      render: (val) => <strong>{Number(val).toLocaleString()} KG</strong>
    },
    {
      header: 'Chefs',
      key: 'selected_chef_quantity',
      numeric: true,
      align: 'center',
      render: (val) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--slate-100)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
          <ChefHat size={12} /> {val}
        </span>
      )
    },
    {
      header: 'Date',
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
      header: 'Actions',
      align: 'center',
      render: (_, row) => (
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onSelectPlan(row)}
          title="View Details"
        >
          <Eye size={13} />
          Details
        </button>
      )
    }
  ];

  return (
    <div>
      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <KPICard
          label="Today's Production"
          value={`${todayPlans.length} Plans`}
          subtext={`${todayPlans.reduce((s, p) => s + (Number(p.finished_goods_weight_kg) || 0), 0).toLocaleString()} KG scheduled`}
          icon={Clock}
          color="primary"
        />
        <KPICard
          label="Upcoming Production"
          value={`${upcomingPlans.length} Plans`}
          subtext="In pipeline schedule"
          icon={Calendar}
          color="purple"
        />
        <KPICard
          label="Total Planned FG Weight"
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

      {/* Quick Actions & Calendar Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '20px', marginBottom: '24px' }}>
        
        {/* Production Calendar Ribbon */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Calendar size={18} color="var(--primary-600)" />
                Production Schedule Calendar
              </h3>
              <div className="card-description">
                Click any production date to filter scheduled orders
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {calendarDays.map(day => {
              const isSelected = selectedDateFilter === day.dateStr;
              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDateFilter(isSelected ? null : day.dateStr)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected 
                      ? '2px solid var(--primary-500)' 
                      : day.isToday 
                        ? '2px solid #0284c7' 
                        : '1px solid var(--slate-200)',
                    backgroundColor: isSelected 
                      ? 'var(--primary-50)' 
                      : day.isToday 
                        ? '#f0f9ff' 
                        : 'var(--slate-50)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 600, color: day.isToday ? 'var(--primary-600)' : 'var(--slate-500)' }}>
                    {day.dayName}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy-900)', margin: '2px 0' }}>
                    {day.dayNum}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--slate-400)' }}>
                    {day.month}
                  </div>
                  <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed var(--slate-200)' }}>
                    <span style={{ 
                      display: 'inline-block',
                      fontSize: '11px', 
                      fontWeight: 700, 
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: day.count > 0 ? 'var(--primary-100)' : 'var(--slate-200)',
                      color: day.count > 0 ? 'var(--primary-600)' : 'var(--slate-500)'
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
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className="btn btn-primary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => onNavigate('create-plan')}
            >
              <PlusCircle size={16} />
              Create Production Plan
            </button>
            <button 
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => onNavigate('sku-master')}
            >
              <Package size={16} />
              Manage SKU Configurations
            </button>
            <button 
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => onNavigate('recipe-bom')}
            >
              <Layers size={16} />
              View Recipe & Packaging BOMs
            </button>
            <button 
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => onNavigate('import-data')}
            >
              <FileUp size={16} />
              Import Master Data (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Recent / Filtered Production Plans */}
      <DataTable
        title={selectedDateFilter ? `Production Plans for ${selectedDateFilter}` : 'Recent Production Plans'}
        description="Live manufacturing orders with chef allocations and status"
        columns={columns}
        data={displayedPlans}
        searchable={true}
        searchPlaceholder="Filter by order, SKU, country..."
        actionButton={
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('create-plan')}
          >
            <PlusCircle size={14} />
            New Plan
          </button>
        }
      />
    </div>
  );
}
