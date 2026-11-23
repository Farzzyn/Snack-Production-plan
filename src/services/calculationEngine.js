/**
 * Centralized Production Calculation Engine
 * Snack Production Planner (Enhanced Industry MRP Grade)
 * 
 * Accurately evaluates:
 * - Order & Net Finished Goods Weights
 * - Discrete Batch Sizing & Planned Bulk Yield vs Target Demand (Surplus Buffer Tracking)
 * - Raw Material BOM Requirements with Intelligent UOM & Cost Normalization
 * - Primary & Secondary Packaging Material Requirements (Pouches, Bottles, Master Shippers, Tape)
 * - Work-Center Routing & Direct Labor (Kitchen Cooking Stage & Packaging Line)
 * - Unit Economics (Cost per Packet, Cost per Box, Cost per KG)
 */

export function parseOperatingHours(val) {
  const num = Number(val);
  if (isNaN(num) || num <= 0) return 8;
  const hours = Math.floor(num);
  const frac = Math.round((num - hours) * 100);
  if (frac === 15) return parseFloat((hours + 0.25).toFixed(2));
  if (frac === 30 || frac === 3) return parseFloat((hours + 0.50).toFixed(2));
  if (frac === 45) return parseFloat((hours + 0.75).toFixed(2));
  return num;
}

export function calculateProductionPlan({
  sku,
  orderQuantityBoxes,
  chefQuantity,
  capacityMaster,
  recipeBOM = [],
  packagingBOM = [],
  staffList = [],
  country = null,
  productionDate = '',
  scalingMode = 'batch_planned' // 'batch_planned' (standard discrete batches) or 'exact_demand'
}) {
  const boxes = Number(orderQuantityBoxes) || 0;
  const chefs = Number(chefQuantity) || 1;
  const packetsPerBox = Number(sku?.packet_per_box) || 20;
  const packSizeG = Number(sku?.pack_size_g) || 150;

  // 1. Total Packets Required
  const packets_required = boxes * packetsPerBox;

  // 2. Target Finished Goods Weight in Kilograms (Net Customer Requirement)
  const finished_goods_weight_kg = Number(((packets_required * packSizeG) / 1000).toFixed(2));

  // 3. Chef Capacity Calculations
  const maxCapacityPerDay = Number(capacityMaster?.max_capacity_per_day) || 500;
  const baseChefCount = Number(capacityMaster?.count_of_chef) || 1;
  const baseStaffCount = Number(capacityMaster?.count_of_staff) || 14;
  const batchCount = Number(capacityMaster?.batch_count) || 10;
  const rawOperatingHours = Number(capacityMaster?.operating_hours) || 8;
  const operatingHours = parseOperatingHours(rawOperatingHours);

  const capacity_per_chef = baseChefCount > 0 ? (maxCapacityPerDay / baseChefCount) : 250;
  const available_capacity_per_day = Number((capacity_per_chef * chefs).toFixed(2));

  // Capacity Utilization & Validation
  const capacity_utilization = available_capacity_per_day > 0
    ? Number(((finished_goods_weight_kg / available_capacity_per_day) * 100).toFixed(1))
    : 0;

  const is_capacity_exceeded = finished_goods_weight_kg > available_capacity_per_day;
  const recommended_chefs = capacity_per_chef > 0
    ? Math.max(1, Math.ceil(finished_goods_weight_kg / capacity_per_chef))
    : chefs;

  // 4. Batch Calculations
  // Batch capacity derived from capacity master
  const capacity_per_batch = capacityMaster?.capacity_per_batch 
    ? Number(capacityMaster.capacity_per_batch)
    : (batchCount > 0 ? (maxCapacityPerDay / batchCount) : 25);

  const production_batches = (finished_goods_weight_kg > 0 && capacity_per_batch > 0)
    ? Math.ceil(finished_goods_weight_kg / capacity_per_batch)
    : 0;

  // Discrete Batch Planned Output vs Exact Demand (Surplus Yield Accounting)
  const batch_planned_output_kg = Number((production_batches * capacity_per_batch).toFixed(2));
  const surplus_bulk_weight_kg = Number(Math.max(0, batch_planned_output_kg - finished_goods_weight_kg).toFixed(2));
  const surplus_packets = packSizeG > 0 ? Math.floor((surplus_bulk_weight_kg * 1000) / packSizeG) : 0;

  // 5. Work Center Timeline & Production Operating Hours
  const hours_per_batch = capacityMaster?.hours_per_batch
    ? Number(capacityMaster.hours_per_batch)
    : (batchCount > 0 ? (operatingHours / batchCount) : 0.92);

  // Cooking / Processing stage duration
  const cooking_hours = Number((production_batches * hours_per_batch).toFixed(2));

  // Packaging line throughput & duration
  const packingQtyPerHour = Number(sku?.packing_qty_per_hour) || (packSizeG <= 250 ? 250 : (packSizeG <= 454 ? 144 : 121));
  const packing_staff_line = Number(sku?.packing_staff_count) || 3;
  const packaging_hours = packingQtyPerHour > 0 ? Number((packets_required / packingQtyPerHour).toFixed(2)) : 0;

  // Primary plant operating hours (driven by kitchen batch scheduling)
  const production_hours = Number(cooking_hours.toFixed(1));

  // 6. Crew & Staff Allocation
  // Support floor staff assigned to the line (mixers, fryers, transfer & packing line crew)
  const support_staff = baseChefCount > 0
    ? Math.ceil(chefs * (baseStaffCount / baseChefCount))
    : baseStaffCount;
  const required_staff = chefs + support_staff;

  // 7. Raw Material Requirements (Intelligent UOM & Unit Cost Normalization)
  const raw_material_requirements = (recipeBOM || []).map(item => {
    const qtyPerBatch = Number(item.quantity) || 0;
    const wastage = Number(item.wastage_percentage) || 1;
    const uom = (item.uom || 'KG').trim().toUpperCase();
    let rawUnitCost = Number(item.unit_cost) || 0;

    // Intelligent UOM & Cost Guard:
    // If UOM is Grams (G) but unit cost is > ₹50, the cost was recorded in ₹/KG. Auto-convert to ₹/G!
    let unitCostEffective = rawUnitCost;
    if ((uom === 'G' || uom === 'GM' || uom === 'GRAMS') && rawUnitCost > 50) {
      unitCostEffective = Number((rawUnitCost / 1000).toFixed(5));
    }

    // Scaling mode: 'batch_planned' evaluates full physical batches; 'exact_demand' scales strictly to net order weight
    const batchScaleFactor = (scalingMode === 'exact_demand' && capacity_per_batch > 0)
      ? (finished_goods_weight_kg / capacity_per_batch)
      : production_batches;

    const baseQty = Number((qtyPerBatch * batchScaleFactor).toFixed(3));
    const totalRequired = Number((baseQty * (1 + wastage / 100)).toFixed(2));
    const estimatedCost = Number((totalRequired * unitCostEffective).toFixed(2));

    return {
      id: item.id || `${item.raw_material}_${Date.now()}`,
      raw_material: item.raw_material,
      base_quantity: baseQty,
      quantity: totalRequired,
      uom: item.uom || 'KG',
      wastage_percentage: wastage,
      unit_cost: unitCostEffective,
      estimated_cost: estimatedCost
    };
  });

  // 8. Packaging Material Requirements (Primary & Secondary Master Shipper Cartons)
  const packaging_requirements = (packagingBOM || []).map(item => {
    const matName = (item.packaging_material || '').toLowerCase();
    const wastage = Number(item.wastage_percentage) || 2;
    const itemQty = Number(item.quantity) || 1;
    let baseQty = 0;

    if (matName.includes('carton') || matName.includes('box') || matName.includes('shipper')) {
      // Secondary Packaging: Master shipping cartons scale directly with order boxes
      baseQty = itemQty < 1 ? Math.ceil(packets_required * itemQty) : Math.ceil(boxes * itemQty);
    } else if (matName.includes('tape') || matName.includes('roll')) {
      // Box sealing tape scales with boxes
      baseQty = Number((boxes * (itemQty < 0.1 ? itemQty : 0.002)).toFixed(2));
    } else {
      // Primary Packaging: Pouches, PET bottles, induction seals, labels (1 per packet)
      baseQty = Number((packets_required * itemQty).toFixed(0));
    }

    const totalRequired = Number((baseQty * (1 + wastage / 100)).toFixed(item.uom === 'ROLL' ? 2 : 0));
    const unitCost = Number(item.unit_cost) || 0;
    const estimatedCost = Number((totalRequired * unitCost).toFixed(2));

    return {
      id: item.id || `${item.packaging_material}_${Date.now()}`,
      packaging_material: item.packaging_material,
      base_quantity: baseQty,
      quantity: totalRequired,
      uom: item.uom || 'PCS',
      wastage_percentage: wastage,
      unit_cost: unitCost,
      estimated_cost: estimatedCost
    };
  });

  // 9. Staff Cost Calculations (Labor Cost Breakdown with Full Payroll Integration)
  let chefDailyWage = 1400; // Master Chef baseline: ₹1,400/day
  let staffDailyWage = 416.79; // Baseline Production Floor Staff average: ₹416.79/day

  if (Array.isArray(staffList) && staffList.length > 0) {
    // Process both daily wage and salaried personnel (monthly salary / 26 working days)
    const normalizedStaff = staffList.map(s => {
      let dailyRate = Number(s.wage_per_day) || 0;
      if (dailyRate === 0 && Number(s.salary) > 0) {
        dailyRate = Number(s.salary) / 26;
      }
      return {
        ...s,
        effectiveDailyWage: dailyRate
      };
    });

    const chefStaff = normalizedStaff.filter(s => 
      ((s.staff_name || '').toLowerCase().includes('biju') || (s.wage_per_day >= 1000) || (s.role || '').toLowerCase().includes('chef')) && 
      s.effectiveDailyWage > 0
    );
    const floorStaff = normalizedStaff.filter(s => 
      !((s.staff_name || '').toLowerCase().includes('biju') || (s.wage_per_day >= 1000) || (s.role || '').toLowerCase().includes('chef')) && 
      s.effectiveDailyWage > 0
    );
    
    if (chefStaff.length > 0) {
      chefDailyWage = chefStaff.reduce((sum, s) => sum + s.effectiveDailyWage, 0) / chefStaff.length;
    }
    if (floorStaff.length > 0) {
      staffDailyWage = floorStaff.reduce((sum, s) => sum + s.effectiveDailyWage, 0) / floorStaff.length;
    }
  }

  // Hourly rates derived from daily wage and plant operating hours per shift
  const shiftHours = operatingHours > 0 ? operatingHours : 9.25;
  const chefHourlyRate = Number((chefDailyWage / shiftHours).toFixed(2));
  const staffHourlyRate = Number((staffDailyWage / shiftHours).toFixed(2));

  // Direct labor costs proportional to planned production operating hours
  const chefLaborCost = Number((chefs * production_hours * chefHourlyRate).toFixed(2));
  const supportStaffLaborCost = Number((support_staff * production_hours * staffHourlyRate).toFixed(2));
  const estimated_staff_cost = Number((chefLaborCost + supportStaffLaborCost).toFixed(2));

  const staff_cost_breakdown = [
    {
      role: 'Master Chef / Section Lead',
      headcount: chefs,
      hours: production_hours,
      daily_wage: Number(chefDailyWage.toFixed(2)),
      hourly_rate: chefHourlyRate,
      estimated_cost: chefLaborCost
    },
    {
      role: 'Production & Packaging Floor Crew',
      headcount: support_staff,
      hours: production_hours,
      daily_wage: Number(staffDailyWage.toFixed(2)),
      hourly_rate: staffHourlyRate,
      estimated_cost: supportStaffLaborCost
    }
  ];

  // 10. Cost Summaries & Unit Economics
  const estimated_raw_material_cost = Number(
    raw_material_requirements.reduce((sum, item) => sum + item.estimated_cost, 0).toFixed(2)
  );
  const estimated_packaging_cost = Number(
    packaging_requirements.reduce((sum, item) => sum + item.estimated_cost, 0).toFixed(2)
  );
  const total_material_cost = Number(
    (estimated_raw_material_cost + estimated_packaging_cost).toFixed(2)
  );
  // Comprehensive manufacturing cost (Materials + Direct Labor)
  const total_production_cost = Number(
    (estimated_raw_material_cost + estimated_packaging_cost + estimated_staff_cost).toFixed(2)
  );

  // Unit economics
  const cost_per_packet = packets_required > 0 ? Number((total_production_cost / packets_required).toFixed(3)) : 0;
  const cost_per_box = boxes > 0 ? Number((total_production_cost / boxes).toFixed(2)) : 0;
  const cost_per_kg = finished_goods_weight_kg > 0 ? Number((total_production_cost / finished_goods_weight_kg).toFixed(2)) : 0;
  const raw_cost_per_packet = packets_required > 0 ? Number((estimated_raw_material_cost / packets_required).toFixed(3)) : 0;
  const pkg_cost_per_packet = packets_required > 0 ? Number((estimated_packaging_cost / packets_required).toFixed(3)) : 0;
  const labor_cost_per_packet = packets_required > 0 ? Number((estimated_staff_cost / packets_required).toFixed(3)) : 0;

  // 11. Capacity & Production Warnings
  let capacity_warning = null;
  if (is_capacity_exceeded) {
    capacity_warning = `⚠ Production capacity exceeded! Required: ${finished_goods_weight_kg.toLocaleString()} KG, but available capacity with ${chefs} chef(s) is only ${available_capacity_per_day.toLocaleString()} KG. Recommended minimum: ${recommended_chefs} chefs (${(recommended_chefs * capacity_per_chef).toLocaleString()} KG capacity).`;
  }

  return {
    country,
    sku,
    order_quantity_boxes: boxes,
    selected_chef_quantity: chefs,
    production_date: productionDate,
    packets_required,
    finished_goods_weight_kg,
    target_production_quantity: finished_goods_weight_kg,
    capacity_per_chef,
    available_capacity_per_day,
    capacity_utilization,
    is_capacity_exceeded,
    recommended_chefs,
    capacity_per_batch,
    production_batches,
    batch_planned_output_kg,
    surplus_bulk_weight_kg,
    surplus_packets,
    hours_per_batch,
    cooking_hours,
    packaging_hours,
    production_hours,
    required_chefs: chefs,
    support_staff,
    required_staff,
    raw_material_requirements,
    packaging_requirements,
    estimated_raw_material_cost,
    estimated_packaging_cost,
    total_material_cost,
    estimated_staff_cost,
    total_production_cost,
    staff_cost_breakdown,
    chef_daily_wage: Number(chefDailyWage.toFixed(2)),
    staff_daily_wage: Number(staffDailyWage.toFixed(2)),
    chef_hourly_rate: chefHourlyRate,
    staff_hourly_rate: staffHourlyRate,
    cost_per_packet,
    cost_per_box,
    cost_per_kg,
    raw_cost_per_packet,
    pkg_cost_per_packet,
    labor_cost_per_packet,
    capacity_warning
  };
}
