import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Eye, 
  PlusCircle, 
  ChefHat, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar 
} from 'lucide-react';
import DataTable from '../components/common/DataTable';

export default function ProductionPlansPage({
  plans = [],
  countries = [],
  skus = [],
  onSelectPlan,
  onUpdateStatus,
  onNavigate,
  currentUser
}) {
  const [filterCountry, setFilterCountry] = useState('');
  const [filterSku, setFilterSku] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: plans.length,
      planned: plans.filter(p => p.status === 'Planned').length,
      in_production: plans.filter(p => p.status === 'In Production').length,
      completed: plans.filter(p => p.status === 'Completed').length,
      cancelled: plans.filter(p => p.status === 'Cancelled').length
    };
  }, [plans]);

  // Filtering
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      if (filterCountry && plan.country_name !== filterCountry && plan.country_id !== filterCountry) return false;
      if (filterSku && plan.sku_id !== filterSku) return false;
      if (filterStatus && plan.status !== filterStatus) return false;
      if (filterDate && plan.production_date !== filterDate) return false;
      return true;
    });
  }, [plans, filterCountry, filterSku, filterStatus, filterDate]);

  const canEditStatus = currentUser?.role !== 'viewer';

  const columns = [
    {
      header: 'Plan #',
      key: 'plan_number',
      render: (val, row) => (
        <span 
          style={{ fontWeight: 700, color: 'var(--primary-600)', cursor: 'pointer' }}
          onClick={() => onSelectPlan(row)}
        >
          {val}
        </span>
      )
    },
    {
      header: 'Production Date',
      key: 'production_date',
      render: (val) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
          <Calendar size={13} color="var(--slate-400)" />
          {val}
        </span>
      )
    },
    {
      header: 'Destination',
      key: 'country_name',
      render: (val) => <span style={{ fontWeight: 500 }}>{val}</span>
    },
    {
      header: 'SKU Item',
      key: 'sku_name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{row.sku_id}</div>
          <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>{val} ({row.pack_size_g}g)</div>
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
      header: 'Finished KG',
      key: 'finished_goods_weight_kg',
      numeric: true,
      align: 'right',
      render: (val) => <strong>{Number(val).toLocaleString()} KG</strong>
    },
    {
      header: 'Batches',
      key: 'production_batches',
      numeric: true,
      align: 'center',
      render: (val) => `${val} bth`
    },
    {
      header: 'Crew',
      key: 'selected_chef_quantity',
      numeric: true,
      align: 'center',
      render: (val, row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--slate-100)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
          <ChefHat size={12} /> {val} chefs ({row.required_staff} total)
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      align: 'center',
      render: (val, row) => {
        if (!canEditStatus) {
          const key = (val || '').toLowerCase().replace(' ', '_');
          return <span className={`badge badge-${key}`}>{val}</span>;
        }

        return (
          <select
            className="select"
            value={val}
            onChange={(e) => onUpdateStatus(row.id, e.target.value)}
            style={{ 
              padding: '3px 8px', 
              fontSize: '12px', 
              fontWeight: 600,
              width: 'auto',
              borderRadius: '12px',
              backgroundColor: val === 'Completed' ? '#d1fae5' : val === 'In Production' ? '#fef3c7' : val === 'Cancelled' ? '#fee2e2' : '#e0f2fe',
              color: val === 'Completed' ? '#065f46' : val === 'In Production' ? '#92400e' : val === 'Cancelled' ? '#991b1b' : '#0369a1'
            }}
          >
            <option value="Draft">Draft</option>
            <option value="Planned">Planned</option>
            <option value="In Production">In Production</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        );
      }
    },
    {
      header: 'Actions',
      align: 'center',
      render: (_, row) => (
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onSelectPlan(row)}
        >
          <Eye size={13} />
          View Plan
        </button>
      )
    }
  ];

  return (
    <div>
      {/* Top Status Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${filterStatus === '' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setFilterStatus('')}
        >
          All Plans ({counts.all})
        </button>
        <button 
          className={`btn ${filterStatus === 'Planned' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setFilterStatus('Planned')}
        >
          Planned ({counts.planned})
        </button>
        <button 
          className={`btn ${filterStatus === 'In Production' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setFilterStatus('In Production')}
        >
          In Production ({counts.in_production})
        </button>
        <button 
          className={`btn ${filterStatus === 'Completed' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setFilterStatus('Completed')}
        >
          Completed ({counts.completed})
        </button>
        <button 
          className={`btn ${filterStatus === 'Cancelled' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setFilterStatus('Cancelled')}
        >
          Cancelled ({counts.cancelled})
        </button>
      </div>

      {/* Multi-Field Filter Bar */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--navy-800)' }}>
            <Filter size={15} />
            Filters:
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="select"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              value={filterCountry}
              onChange={e => setFilterCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c.id} value={c.country_name}>{c.country_name}</option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="select"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              value={filterSku}
              onChange={e => setFilterSku(e.target.value)}
            >
              <option value="">All SKUs</option>
              {skus.map(s => (
                <option key={s.sku_id} value={s.sku_id}>{s.sku_id} - {s.base_product}</option>
              ))}
            </select>
          </div>

          <div>
            <input 
              type="date" 
              className="input"
              style={{ padding: '5px 10px', fontSize: '12px' }}
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>

          {(filterCountry || filterSku || filterDate || filterStatus) && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setFilterCountry('');
                setFilterSku('');
                setFilterDate('');
                setFilterStatus('');
              }}
            >
              Reset Filters
            </button>
          )}

          <div style={{ marginLeft: 'auto' }}>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('create-plan')}
            >
              <PlusCircle size={14} />
              New Production Plan
            </button>
          </div>
        </div>
      </div>

      {/* Plans Data Table */}
      <DataTable
        title="Production Plan Register"
        description={`${filteredPlans.length} plans matching current filters`}
        columns={columns}
        data={filteredPlans}
        searchable={true}
        searchPlaceholder="Quick search plan #, country, SKU..."
      />
    </div>
  );
}
