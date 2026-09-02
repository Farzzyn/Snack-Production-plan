/**
 * Centralized Production Calculation Engine
 * Snack Production Planner
 * 
 * Evaluates all manufacturing parameters, capacities, BOMs, labor, and costs.
 */

export function calculateProductionPlan({
  sku,
  orderQuantityBoxes,
  chefQuantity,
  capacityMaster,
  recipeBOM = [],
  packagingBOM = [],
  country = null,
  productionDate = ''
}) {
  const boxes = Number(orderQuantityBoxes) || 0;
  const chefs = Number(chefQuantity) || 1;
  const packetsPerBox = Number(sku?.packet_per_box) || 20;
  const packSizeG = Number(sku?.pack_size_g) || 150;

  // 1. Total Packets Required
  const packets_required = boxes * packetsPerBox;

  // 2. Finished Goods Weight in Kilograms
  const finished_goods_weight_kg = Number(((packets_required * packSizeG) / 1000).toFixed(2));

  // 3. Chef Capacity Calculations
  const maxCapacityPerDay = Number(capacityMaster?.max_capacity_per_day) || 500;
  const baseChefCount = Number(capacityMaster?.count_of_chef) || 2;
  const baseStaffCount = Number(capacityMaster?.count_of_staff) || 4;
  const batchCount = Number(capacityMaster?.batch_count) || 4;
  const operatingHours = Number(capacityMaster?.operating_hours) || 8;

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
    : (batchCount > 0 ? (maxCapacityPerDay / batchCount) : 125);

  const production_batches = (finished_goods_weight_kg > 0 && capacity_per_batch > 0)
    ? Math.ceil(finished_goods_weight_kg / capacity_per_batch)
    : 0;

  // 5. Production Hours
  const hours_per_batch = capacityMaster?.hours_per_batch
    ? Number(capacityMaster.hours_per_batch)
    : (batchCount > 0 ? (operatingHours / batchCount) : 2);

  const production_hours = Number((production_batches * hours_per_batch).toFixed(1));

  // 6. Staff Requirements
  // Support staff scales proportionally with assigned chefs
  const support_staff = baseChefCount > 0
    ? Math.ceil(chefs * (baseStaffCount / baseChefCount))
    : baseStaffCount;
  const required_staff = chefs + support_staff;

  // 7. Raw Material Requirements (proportional to batches & wastage)
  const raw_material_requirements = (recipeBOM || []).map(item => {
    const qtyPerBatch = Number(item.quantity) || 0;
    const wastage = Number(item.wastage_percentage) || 0;
    const baseQty = qtyPerBatch * production_batches;
    const totalRequired = Number((baseQty * (1 + wastage / 100)).toFixed(2));
    const unitCost = Number(item.unit_cost) || 0;
    const estimatedCost = Number((totalRequired * unitCost).toFixed(2));

    return {
      id: item.id || `${item.raw_material}_${Date.now()}`,
      raw_material: item.raw_material,
      base_quantity: baseQty,
      quantity: totalRequired,
      uom: item.uom || 'KG',
      wastage_percentage: wastage,
      unit_cost: unitCost,
      estimated_cost: estimatedCost
    };
  });

  // 8. Packaging Material Requirements
  const packaging_requirements = (packagingBOM || []).map(item => {
    const matName = (item.packaging_material || '').toLowerCase();
    const wastage = Number(item.wastage_percentage) || 0;
    const itemQty = Number(item.quantity) || 1;
    let baseQty = 0;

    if (matName.includes('carton') || matName.includes('box') || matName.includes('shipper')) {
      // Carton scales directly with order boxes
      baseQty = itemQty < 1 ? Math.ceil(packets_required * itemQty) : Math.ceil(boxes * itemQty);
    } else if (matName.includes('tape') || matName.includes('roll')) {
      // Tape scales with boxes
      baseQty = Number((boxes * (itemQty < 0.1 ? itemQty : 0.002)).toFixed(2));
    } else {
      // Pouches, sachets, packets, labels
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

  // 9. Cost Summaries
  const estimated_raw_material_cost = Number(
    raw_material_requirements.reduce((sum, item) => sum + item.estimated_cost, 0).toFixed(2)
  );
  const estimated_packaging_cost = Number(
    packaging_requirements.reduce((sum, item) => sum + item.estimated_cost, 0).toFixed(2)
  );
  const total_material_cost = Number(
    (estimated_raw_material_cost + estimated_packaging_cost).toFixed(2)
  );

  // 10. Warnings
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
    hours_per_batch,
    production_hours,
    required_chefs: chefs,
    support_staff,
    required_staff,
    raw_material_requirements,
    packaging_requirements,
    estimated_raw_material_cost,
    estimated_packaging_cost,
    total_material_cost,
    capacity_warning
  };
}
