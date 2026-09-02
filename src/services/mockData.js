/**
 * Realistic Mock Seed Data for Snack Production Planner
 * Single source of initial state for Local/Demo Mode.
 */

export const INITIAL_COUNTRIES = [
  { id: 'cnt-01', country_code: 'UAE', country_name: 'United Arab Emirates', is_active: true },
  { id: 'cnt-02', country_code: 'SAU', country_name: 'Saudi Arabia', is_active: true },
  { id: 'cnt-03', country_code: 'QAT', country_name: 'Qatar', is_active: true },
  { id: 'cnt-04', country_code: 'OMN', country_name: 'Oman', is_active: true },
  { id: 'cnt-05', country_code: 'IND', country_name: 'India', is_active: true },
  { id: 'cnt-06', country_code: 'KWT', country_name: 'Kuwait', is_active: true },
  { id: 'cnt-07', country_code: 'BHR', country_name: 'Bahrain', is_active: true }
];

export const INITIAL_USERS = [
  { id: 'usr-01', full_name: 'David Miller', email: 'admin@snackplanner.com', role: 'admin', is_active: true, avatar: 'DM' },
  { id: 'usr-02', full_name: 'Sarah Jenkins', email: 'manager@snackplanner.com', role: 'production_manager', is_active: true, avatar: 'SJ' },
  { id: 'usr-03', full_name: 'Raj Patel', email: 'viewer@snackplanner.com', role: 'viewer', is_active: true, avatar: 'RP' }
];

export const INITIAL_SKUS = [
  { id: 'sku-01', sku_id: 'RGHMIX150', sku_name: 'Roasted Gram Healthy Mix 150g', base_product: 'Roasted Gram Healthy Mix', pack_size_g: 150, packet_per_box: 20, is_active: true },
  { id: 'sku-02', sku_id: 'RGHMIX200', sku_name: 'Roasted Gram Healthy Mix 200g', base_product: 'Roasted Gram Healthy Mix', pack_size_g: 200, packet_per_box: 20, is_active: true },
  { id: 'sku-03', sku_id: 'RGHMIX50', sku_name: 'Roasted Gram Healthy Mix 50g Pocket', base_product: 'Roasted Gram Healthy Mix', pack_size_g: 50, packet_per_box: 40, is_active: true },
  { id: 'sku-04', sku_id: 'MPNUT100', sku_name: 'Masala Peanut Crunch 100g', base_product: 'Masala Peanut Crunch', pack_size_g: 100, packet_per_box: 24, is_active: true },
  { id: 'sku-05', sku_id: 'MPNUT200', sku_name: 'Masala Peanut Crunch 200g Share Pack', base_product: 'Masala Peanut Crunch', pack_size_g: 200, packet_per_box: 16, is_active: true },
  { id: 'sku-06', sku_id: 'CSSCHP120', sku_name: 'Spiced Cassava Pepper Chips 120g', base_product: 'Spiced Cassava Chips', pack_size_g: 120, packet_per_box: 20, is_active: true },
  { id: 'sku-07', sku_id: 'MKHNA70', sku_name: 'Roasted Peri-Peri Makhana 70g', base_product: 'Roasted Makhana', pack_size_g: 70, packet_per_box: 20, is_active: true },
  { id: 'sku-08', sku_id: 'BANCHP150', sku_name: 'Kerala Golden Banana Crisps 150g', base_product: 'Golden Banana Crisps', pack_size_g: 150, packet_per_box: 20, is_active: true }
];

export const INITIAL_CAPACITY = [
  { id: 'cap-01', base_product: 'Roasted Gram Healthy Mix', max_capacity_per_day: 500, uom: 'KG', batch_count: 4, operating_hours: 8, count_of_chef: 2, count_of_staff: 4, capacity_per_batch: 125, hours_per_batch: 2.0 },
  { id: 'cap-02', base_product: 'Masala Peanut Crunch', max_capacity_per_day: 600, uom: 'KG', batch_count: 6, operating_hours: 8, count_of_chef: 2, count_of_staff: 4, capacity_per_batch: 100, hours_per_batch: 1.33 },
  { id: 'cap-03', base_product: 'Spiced Cassava Chips', max_capacity_per_day: 400, uom: 'KG', batch_count: 4, operating_hours: 8, count_of_chef: 2, count_of_staff: 5, capacity_per_batch: 100, hours_per_batch: 2.0 },
  { id: 'cap-04', base_product: 'Roasted Makhana', max_capacity_per_day: 250, uom: 'KG', batch_count: 5, operating_hours: 8, count_of_chef: 2, count_of_staff: 3, capacity_per_batch: 50, hours_per_batch: 1.6 },
  { id: 'cap-05', base_product: 'Golden Banana Crisps', max_capacity_per_day: 450, uom: 'KG', batch_count: 3, operating_hours: 8, count_of_chef: 2, count_of_staff: 4, capacity_per_batch: 150, hours_per_batch: 2.67 }
];

export const INITIAL_RECIPE_BOM = [
  // Roasted Gram Healthy Mix
  { id: 'rcp-01', base_product: 'Roasted Gram Healthy Mix', raw_material: 'Roasted Bengal Gram', quantity: 85, uom: 'KG', unit_cost: 2.80, wastage_percentage: 1.5 },
  { id: 'rcp-02', base_product: 'Roasted Gram Healthy Mix', raw_material: 'Cold-Pressed Rice Bran Oil', quantity: 8, uom: 'LTR', unit_cost: 2.20, wastage_percentage: 2.0 },
  { id: 'rcp-03', base_product: 'Roasted Gram Healthy Mix', raw_material: 'Pink Himalayan Rock Salt', quantity: 2, uom: 'KG', unit_cost: 0.60, wastage_percentage: 0 },
  { id: 'rcp-04', base_product: 'Roasted Gram Healthy Mix', raw_material: 'Signature Spice & Herb Blend', quantity: 5, uom: 'KG', unit_cost: 8.50, wastage_percentage: 1.0 },
  { id: 'rcp-05', base_product: 'Roasted Gram Healthy Mix', raw_material: 'Crispy Curry Leaves & Cashews', quantity: 25, uom: 'KG', unit_cost: 6.00, wastage_percentage: 2.0 },

  // Masala Peanut Crunch
  { id: 'rcp-06', base_product: 'Masala Peanut Crunch', raw_material: 'Premium Raw Peanuts', quantity: 80, uom: 'KG', unit_cost: 2.10, wastage_percentage: 2.0 },
  { id: 'rcp-07', base_product: 'Masala Peanut Crunch', raw_material: 'Gram Flour (Besan)', quantity: 12, uom: 'KG', unit_cost: 1.40, wastage_percentage: 1.0 },
  { id: 'rcp-08', base_product: 'Masala Peanut Crunch', raw_material: 'Sunflower Oil', quantity: 10, uom: 'LTR', unit_cost: 2.00, wastage_percentage: 2.5 },
  { id: 'rcp-09', base_product: 'Masala Peanut Crunch', raw_material: 'Chili Pepper & Cumin Seasoning', quantity: 4, uom: 'KG', unit_cost: 7.20, wastage_percentage: 1.0 },
  { id: 'rcp-10', base_product: 'Masala Peanut Crunch', raw_material: 'Iodized Salt', quantity: 1.5, uom: 'KG', unit_cost: 0.40, wastage_percentage: 0 },

  // Spiced Cassava Chips
  { id: 'rcp-11', base_product: 'Spiced Cassava Chips', raw_material: 'Fresh Farm Cassava Roots', quantity: 180, uom: 'KG', unit_cost: 0.90, wastage_percentage: 8.0 },
  { id: 'rcp-12', base_product: 'Spiced Cassava Chips', raw_material: 'Palm Frying Oil', quantity: 18, uom: 'LTR', unit_cost: 1.70, wastage_percentage: 3.0 },
  { id: 'rcp-13', base_product: 'Spiced Cassava Chips', raw_material: 'Black Pepper & Sea Salt Seasoning', quantity: 3.5, uom: 'KG', unit_cost: 9.00, wastage_percentage: 0.5 },

  // Roasted Makhana
  { id: 'rcp-14', base_product: 'Roasted Makhana', raw_material: 'Raw Jumbo Fox Nuts (Phool Makhana)', quantity: 45, uom: 'KG', unit_cost: 14.00, wastage_percentage: 3.0 },
  { id: 'rcp-15', base_product: 'Roasted Makhana', raw_material: 'Pure Olive Oil Mist', quantity: 3, uom: 'LTR', unit_cost: 6.50, wastage_percentage: 1.0 },
  { id: 'rcp-16', base_product: 'Roasted Makhana', raw_material: 'Peri-Peri Spice Mix', quantity: 3, uom: 'KG', unit_cost: 11.00, wastage_percentage: 0.5 },

  // Golden Banana Crisps
  { id: 'rcp-17', base_product: 'Golden Banana Crisps', raw_material: 'Raw Green Nendran Bananas', quantity: 320, uom: 'KG', unit_cost: 0.85, wastage_percentage: 10.0 },
  { id: 'rcp-18', base_product: 'Golden Banana Crisps', raw_material: 'Pure Coconut Oil', quantity: 28, uom: 'LTR', unit_cost: 3.40, wastage_percentage: 2.0 },
  { id: 'rcp-19', base_product: 'Golden Banana Crisps', raw_material: 'Turmeric Infused Salt Water', quantity: 4, uom: 'LTR', unit_cost: 0.50, wastage_percentage: 0 }
];

export const INITIAL_PACKAGING_BOM = [
  // RGHMIX150
  { id: 'pkg-01', sku_id: 'RGHMIX150', packaging_material: 'Metallized Barrier Pouch (150g Matte Finish)', quantity: 1.0, uom: 'PCS', unit_cost: 0.14, wastage_percentage: 3.0 },
  { id: 'pkg-02', sku_id: 'RGHMIX150', packaging_material: 'Master Corrugated Shipper Carton (20 Packets)', quantity: 0.05, uom: 'PCS', unit_cost: 0.85, wastage_percentage: 1.0 },
  { id: 'pkg-03', sku_id: 'RGHMIX150', packaging_material: 'Holographic Tamper Seal Label', quantity: 1.0, uom: 'PCS', unit_cost: 0.03, wastage_percentage: 2.0 },
  { id: 'pkg-04', sku_id: 'RGHMIX150', packaging_material: 'Heavy Duty Carton Packing Tape', quantity: 0.002, uom: 'ROLL', unit_cost: 3.20, wastage_percentage: 0 },

  // RGHMIX200
  { id: 'pkg-05', sku_id: 'RGHMIX200', packaging_material: 'Metallized Barrier Pouch (200g Matte Finish)', quantity: 1.0, uom: 'PCS', unit_cost: 0.16, wastage_percentage: 3.0 },
  { id: 'pkg-06', sku_id: 'RGHMIX200', packaging_material: 'Master Corrugated Shipper Carton (20 Packets)', quantity: 0.05, uom: 'PCS', unit_cost: 0.90, wastage_percentage: 1.0 },
  { id: 'pkg-07', sku_id: 'RGHMIX200', packaging_material: 'Holographic Tamper Seal Label', quantity: 1.0, uom: 'PCS', unit_cost: 0.03, wastage_percentage: 2.0 },
  { id: 'pkg-08', sku_id: 'RGHMIX200', packaging_material: 'Heavy Duty Carton Packing Tape', quantity: 0.002, uom: 'ROLL', unit_cost: 3.20, wastage_percentage: 0 },

  // RGHMIX50
  { id: 'pkg-09', sku_id: 'RGHMIX50', packaging_material: 'Pocket Pillow Pouch (50g)', quantity: 1.0, uom: 'PCS', unit_cost: 0.09, wastage_percentage: 4.0 },
  { id: 'pkg-10', sku_id: 'RGHMIX50', packaging_material: 'Master Corrugated Shipper Carton (40 Packets)', quantity: 0.025, uom: 'PCS', unit_cost: 0.75, wastage_percentage: 1.0 },

  // MPNUT100
  { id: 'pkg-11', sku_id: 'MPNUT100', packaging_material: 'Nitrogen-Flushed Standup Pouch (100g)', quantity: 1.0, uom: 'PCS', unit_cost: 0.13, wastage_percentage: 3.0 },
  { id: 'pkg-12', sku_id: 'MPNUT100', packaging_material: 'Master Corrugated Shipper Carton (24 Packets)', quantity: 0.0417, uom: 'PCS', unit_cost: 0.85, wastage_percentage: 1.0 },
  { id: 'pkg-13', sku_id: 'MPNUT100', packaging_material: 'Heavy Duty Carton Packing Tape', quantity: 0.002, uom: 'ROLL', unit_cost: 3.20, wastage_percentage: 0 },

  // CSSCHP120
  { id: 'pkg-14', sku_id: 'CSSCHP120', packaging_material: 'Pillow Foil Pouch (120g)', quantity: 1.0, uom: 'PCS', unit_cost: 0.12, wastage_percentage: 3.0 },
  { id: 'pkg-15', sku_id: 'CSSCHP120', packaging_material: 'Master Corrugated Shipper Carton (20 Packets)', quantity: 0.05, uom: 'PCS', unit_cost: 0.85, wastage_percentage: 1.0 },

  // MKHNA70
  { id: 'pkg-16', sku_id: 'MKHNA70', packaging_material: 'Zip-Lock Resealable Kraft Pouch (70g)', quantity: 1.0, uom: 'PCS', unit_cost: 0.22, wastage_percentage: 2.0 },
  { id: 'pkg-17', sku_id: 'MKHNA70', packaging_material: 'Master Corrugated Shipper Carton (20 Packets)', quantity: 0.05, uom: 'PCS', unit_cost: 0.95, wastage_percentage: 1.0 },

  // BANCHP150
  { id: 'pkg-18', sku_id: 'BANCHP150', packaging_material: 'Printed Poly Pouch (150g)', quantity: 1.0, uom: 'PCS', unit_cost: 0.11, wastage_percentage: 3.0 },
  { id: 'pkg-19', sku_id: 'BANCHP150', packaging_material: 'Master Corrugated Shipper Carton (20 Packets)', quantity: 0.05, uom: 'PCS', unit_cost: 0.85, wastage_percentage: 1.0 }
];

export const INITIAL_STAFF = [
  { id: 'stf-01', staff_name: 'Ramesh Kumar', role: 'Master Chef', salary: 4500, wage_per_day: 150, is_active: true },
  { id: 'stf-02', staff_name: 'Suresh Menon', role: 'Executive Fryer Chef', salary: 4200, wage_per_day: 140, is_active: true },
  { id: 'stf-03', staff_name: 'Vikram Singh', role: 'Senior Roasting Chef', salary: 4200, wage_per_day: 140, is_active: true },
  { id: 'stf-04', staff_name: 'Abdul Rahman', role: 'Assistant Chef', salary: 3200, wage_per_day: 110, is_active: true },
  { id: 'stf-05', staff_name: 'Anil Verma', role: 'Floor Packaging Operator', salary: 2500, wage_per_day: 85, is_active: true },
  { id: 'stf-06', staff_name: 'Sunil Sharma', role: 'Packaging & Sealing Operator', salary: 2500, wage_per_day: 85, is_active: true },
  { id: 'stf-07', staff_name: 'Devi Prasad', role: 'Quality Control Inspector', salary: 3000, wage_per_day: 100, is_active: true },
  { id: 'stf-08', staff_name: 'Manoj Tiwari', role: 'Material Handler & Loader', salary: 2200, wage_per_day: 75, is_active: true },
  { id: 'stf-09', staff_name: 'Kishore Nair', role: 'Maintenance Technician', salary: 3500, wage_per_day: 120, is_active: true },
  { id: 'stf-10', staff_name: 'Farhan Akhtar', role: 'Sanitation & Hygiene Lead', salary: 2100, wage_per_day: 70, is_active: true }
];

// Initial seeded production plans for immediate dashboard visualization
export const INITIAL_PLANS = [
  {
    id: 'pln-1001',
    plan_number: 'PP-2026-0901',
    order_number: 'ORD-DXB-8821',
    country_id: 'cnt-01',
    country_name: 'United Arab Emirates',
    sku_id: 'RGHMIX150',
    sku_name: 'Roasted Gram Healthy Mix 150g',
    base_product: 'Roasted Gram Healthy Mix',
    pack_size_g: 150,
    order_quantity_boxes: 500,
    packets_required: 10000,
    finished_goods_weight_kg: 1500,
    selected_chef_quantity: 6,
    available_capacity_per_day: 1500,
    capacity_utilization: 100,
    production_batches: 12,
    target_production_quantity: 1500,
    production_hours: 24,
    required_staff: 18,
    production_date: '2026-09-03',
    status: 'Planned',
    estimated_raw_material_cost: 3845.00,
    estimated_packaging_cost: 1842.00,
    total_material_cost: 5687.00,
    notes: 'Priority export shipment for Dubai Retail chain. Check tamper seals.',
    created_at: '2026-09-01T08:30:00Z',
    raw_material_snapshots: [
      { raw_material: 'Roasted Bengal Gram', quantity: 1035.3, uom: 'KG', unit_cost: 2.80, estimated_cost: 2898.84 },
      { raw_material: 'Cold-Pressed Rice Bran Oil', quantity: 97.9, uom: 'LTR', unit_cost: 2.20, estimated_cost: 215.38 },
      { raw_material: 'Pink Himalayan Rock Salt', quantity: 24.0, uom: 'KG', unit_cost: 0.60, estimated_cost: 14.40 },
      { raw_material: 'Signature Spice & Herb Blend', quantity: 60.6, uom: 'KG', unit_cost: 8.50, estimated_cost: 515.10 },
      { raw_material: 'Crispy Curry Leaves & Cashews', quantity: 306.0, uom: 'KG', unit_cost: 6.00, estimated_cost: 1836.00 }
    ],
    packaging_snapshots: [
      { packaging_material: 'Metallized Barrier Pouch (150g Matte Finish)', quantity: 10300, uom: 'PCS', unit_cost: 0.14, estimated_cost: 1442.00 },
      { packaging_material: 'Master Corrugated Shipper Carton (20 Packets)', quantity: 505, uom: 'PCS', unit_cost: 0.85, estimated_cost: 429.25 },
      { packaging_material: 'Holographic Tamper Seal Label', quantity: 10200, uom: 'PCS', unit_cost: 0.03, estimated_cost: 306.00 },
      { packaging_material: 'Heavy Duty Carton Packing Tape', quantity: 1.0, uom: 'ROLL', unit_cost: 3.20, estimated_cost: 3.20 }
    ]
  },
  {
    id: 'pln-1002',
    plan_number: 'PP-2026-0902',
    order_number: 'ORD-RUH-4419',
    country_id: 'cnt-02',
    country_name: 'Saudi Arabia',
    sku_id: 'MPNUT100',
    sku_name: 'Masala Peanut Crunch 100g',
    base_product: 'Masala Peanut Crunch',
    pack_size_g: 100,
    order_quantity_boxes: 300,
    packets_required: 7200,
    finished_goods_weight_kg: 720,
    selected_chef_quantity: 3,
    available_capacity_per_day: 900,
    capacity_utilization: 80.0,
    production_batches: 8,
    target_production_quantity: 720,
    production_hours: 10.6,
    required_staff: 9,
    production_date: '2026-09-02',
    status: 'In Production',
    estimated_raw_material_cost: 1690.00,
    estimated_packaging_cost: 1220.00,
    total_material_cost: 2910.00,
    notes: 'Riyadh hypermarket distributor order.',
    created_at: '2026-09-01T11:15:00Z',
    raw_material_snapshots: [
      { raw_material: 'Premium Raw Peanuts', quantity: 652.8, uom: 'KG', unit_cost: 2.10, estimated_cost: 1370.88 },
      { raw_material: 'Gram Flour (Besan)', quantity: 96.96, uom: 'KG', unit_cost: 1.40, estimated_cost: 135.74 },
      { raw_material: 'Sunflower Oil', quantity: 82.0, uom: 'LTR', unit_cost: 2.00, estimated_cost: 164.00 }
    ],
    packaging_snapshots: [
      { packaging_material: 'Nitrogen-Flushed Standup Pouch (100g)', quantity: 7416, uom: 'PCS', unit_cost: 0.13, estimated_cost: 964.08 },
      { packaging_material: 'Master Corrugated Shipper Carton (24 Packets)', quantity: 303, uom: 'PCS', unit_cost: 0.85, estimated_cost: 257.55 }
    ]
  },
  {
    id: 'pln-1003',
    plan_number: 'PP-2026-0903',
    order_number: 'ORD-DOH-1102',
    country_id: 'cnt-03',
    country_name: 'Qatar',
    sku_id: 'CSSCHP120',
    sku_name: 'Spiced Cassava Pepper Chips 120g',
    base_product: 'Spiced Cassava Chips',
    pack_size_g: 120,
    order_quantity_boxes: 200,
    packets_required: 4000,
    finished_goods_weight_kg: 480,
    selected_chef_quantity: 3,
    available_capacity_per_day: 600,
    capacity_utilization: 80.0,
    production_batches: 5,
    target_production_quantity: 480,
    production_hours: 10.0,
    required_staff: 10,
    production_date: '2026-08-31',
    status: 'Completed',
    estimated_raw_material_cost: 1120.00,
    estimated_packaging_cost: 650.00,
    total_material_cost: 1770.00,
    notes: 'Batch QC inspection passed without remarks.',
    created_at: '2026-08-30T09:00:00Z',
    raw_material_snapshots: [
      { raw_material: 'Fresh Farm Cassava Roots', quantity: 972.0, uom: 'KG', unit_cost: 0.90, estimated_cost: 874.80 },
      { raw_material: 'Palm Frying Oil', quantity: 92.7, uom: 'LTR', unit_cost: 1.70, estimated_cost: 157.59 }
    ],
    packaging_snapshots: [
      { packaging_material: 'Pillow Foil Pouch (120g)', quantity: 4120, uom: 'PCS', unit_cost: 0.12, estimated_cost: 494.40 },
      { packaging_material: 'Master Corrugated Shipper Carton (20 Packets)', quantity: 202, uom: 'PCS', unit_cost: 0.85, estimated_cost: 171.70 }
    ]
  }
];
