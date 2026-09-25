const fs = require('fs');

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  
  function parseLine(line) {
    const res = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        res.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    res.push(cur.trim());
    return res;
  }
  
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(l => parseLine(l));
  return { headers, rows };
}

// 1. Capacity Master (15 rows)
const capCSV = parseCSV(fs.readFileSync('Capacity_Master.csv', 'utf8'));
const capacities = capCSV.rows.map((r, i) => {
  const base_product = r[1].trim();
  const max_capacity_per_day = parseFloat(r[2]) || 0;
  const uom = (r[3] || 'KG').trim();
  const batch_count = parseInt(r[4], 10) || 0;
  const operating_hours = parseFloat(r[5]) || 0;
  const count_of_chef = parseInt(r[6], 10) || 0;
  const count_of_staff = parseInt(r[7], 10) || 0;
  const capacity_per_batch = batch_count > 0 ? parseFloat((max_capacity_per_day / batch_count).toFixed(2)) : 0;
  const hours_per_batch = batch_count > 0 ? parseFloat((operating_hours / batch_count).toFixed(2)) : 0;
  return {
    id: `cap-${String(i + 1).padStart(2, '0')}`,
    base_product,
    max_capacity_per_day,
    uom,
    batch_count,
    operating_hours,
    count_of_chef,
    count_of_staff,
    capacity_per_batch,
    hours_per_batch
  };
});

// 2. SKU Master (35 rows)
const skuCSV = parseCSV(fs.readFileSync('SKU_and_Pack_Size_Master.csv', 'utf8'));
const skus = skuCSV.rows.map((r, i) => {
  const sku_id = r[0].trim();
  let sku_name = r[1].trim();
  let base_product = r[2].trim();
  const pack_size_g = parseFloat(r[3]) || 0;
  const packet_per_box = parseInt(r[4], 10) || 0;
  const packing_qty_per_hour = parseFloat(r[5]) || 0;
  const packing_staff_count = parseInt(r[6], 10) || 0;

  // Fix known typo in row 35 of sheet where RGSKVTY200B had base_product RG SPICY CASSAVA STICK instead of RG SHARKARAVARATTY
  if (sku_id === 'RGSKVTY200B') {
    base_product = 'RG SHARKARAVARATTY';
    sku_name = 'RG SHARKARAVARATTY 200 GM BOTTLE';
  }

  return {
    id: `sku-${String(i + 1).padStart(2, '0')}`,
    sku_id,
    sku_name,
    base_product,
    pack_size_g,
    packet_per_box,
    packing_qty_per_hour,
    packing_staff_count,
    is_active: true
  };
});

// 3. Recipe BOM (126 rows)
const rcpCSV = parseCSV(fs.readFileSync('Recipe_BOM.csv', 'utf8'));
const recipes = rcpCSV.rows.map((r, i) => {
  const base_product = r[0].trim();
  const raw_material = r[1].trim();
  const quantity = parseFloat(r[2]) || 0;
  const uom = (r[3] || 'KG').trim();
  const unit_cost = parseFloat(r[4]) || 0;
  return {
    id: `rcp-${String(i + 1).padStart(3, '0')}`,
    base_product,
    raw_material,
    quantity,
    uom,
    unit_cost,
    wastage_percentage: 1
  };
});

// 4. Packaging BOM
const pkgCSV = parseCSV(fs.readFileSync('Packaging_BOM.csv', 'utf8'));
let lastSku = '';
const packagings = [];
let pkgIdx = 1;

for (let i = 0; i < pkgCSV.rows.length; i++) {
  const r = pkgCSV.rows[i];
  let sku_id = r[0] ? r[0].trim() : '';
  let packaging_material = r[1] ? r[1].trim() : '';
  let quantity = parseFloat(r[2]) || 1;
  let unit_cost = parseFloat(r[3]) || 0;

  // Handle special rows
  if (!sku_id && packaging_material === 'BOTT') {
    // previous row was RGSBNC150 pouch, this row is bottle for RGSBNC200
    sku_id = 'RGSBNC200';
  }

  if (!sku_id && !packaging_material && !unit_cost) {
    // Blank separator row
    continue;
  }

  if (sku_id) {
    lastSku = sku_id;
  } else {
    sku_id = lastSku;
  }

  if (!packaging_material) {
    if (r[3] && r[3].includes('label')) {
      packaging_material = 'Bottle Label';
      unit_cost = parseFloat(r[3].replace('label', '').trim()) || 3.60;
    } else {
      packaging_material = 'Pouches : BOP, PP';
    }
  }

  // Parse label cost if in unit_cost column
  if (typeof unit_cost === 'string' || isNaN(unit_cost)) {
    unit_cost = parseFloat(String(unit_cost).replace(/[^0-9.]/g, '')) || 0;
  }

  packagings.push({
    id: `pkg-${String(pkgIdx++).padStart(3, '0')}`,
    sku_id,
    packaging_material,
    quantity,
    uom: 'PCS',
    unit_cost,
    wastage_percentage: 2
  });
}

// 5. Staff Summary (13 rows)
const stfCSV = parseCSV(fs.readFileSync('Staff_Summary.csv', 'utf8'));
const staff = stfCSV.rows.map((r, i) => {
  const staff_name = r[1].trim();
  const salary = parseFloat(r[2]) || 0;
  const wage_per_day = parseFloat(r[3]) || 0;
  let role = 'Production Staff';
  const lower = staff_name.toLowerCase();
  if (lower.includes('biju') || lower.includes('chef') || lower.includes('ratheesh')) {
    role = 'Master Chef';
  } else if (lower.includes('naseema') || lower.includes('asya') || lower.includes('suhara')) {
    role = 'Production Assistant';
  } else if (lower.includes('bindu') || lower.includes('praveena')) {
    role = 'Senior Operator';
  } else if (lower.includes('tej') || lower.includes('vikase')) {
    role = 'Line Supervisor';
  } else if (lower.includes('jyothi') || lower.includes('bavina')) {
    role = 'Packaging Specialist';
  }

  return {
    id: `stf-${String(i + 1).padStart(2, '0')}`,
    staff_name,
    role,
    salary,
    wage_per_day,
    is_active: true
  };
});

console.log(`Generated:
- SKUs: ${skus.length}
- Capacities: ${capacities.length}
- Recipes: ${recipes.length}
- Packaging: ${packagings.length}
- Staff: ${staff.length}
`);

// 1. Generate SQL migration: supabase/migrations/20260925_google_sheets_sync.sql
let migrationSql = `-- ============================================================================
-- MIGRATION: Update Schema & Sync Data with Google Sheets
-- Date: 2026-09-25
-- Source: https://docs.google.com/spreadsheets/d/1o8n-sYenrBWNsSmBSnkp-cRdIcuXvwXyV8Ap9tPhuMI/
-- ============================================================================

-- 1. Add new columns to sku_pack_size_master if not existing
ALTER TABLE sku_pack_size_master 
ADD COLUMN IF NOT EXISTS packing_qty_per_hour NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS packing_staff_count INTEGER DEFAULT 0;

-- 2. Upsert SKU Master Data (35 SKUs)
INSERT INTO sku_pack_size_master (sku_id, sku_name, base_product, pack_size_g, packet_per_box, packing_qty_per_hour, packing_staff_count, is_active)
VALUES
` + skus.map(s => `('${s.sku_id}', '${s.sku_name.replace(/'/g, "''")}', '${s.base_product.replace(/'/g, "''")}', ${s.pack_size_g}, ${s.packet_per_box}, ${s.packing_qty_per_hour}, ${s.packing_staff_count}, true)`).join(',\n') + `
ON CONFLICT (sku_id) DO UPDATE SET
  sku_name = EXCLUDED.sku_name,
  base_product = EXCLUDED.base_product,
  pack_size_g = EXCLUDED.pack_size_g,
  packet_per_box = EXCLUDED.packet_per_box,
  packing_qty_per_hour = EXCLUDED.packing_qty_per_hour,
  packing_staff_count = EXCLUDED.packing_staff_count,
  updated_at = now();

-- 3. Upsert Capacity Master Data (15 Lines)
INSERT INTO capacity_master (base_product, max_capacity_per_day, uom, batch_count, operating_hours, count_of_chef, count_of_staff, capacity_per_batch, hours_per_batch)
VALUES
` + capacities.map(c => `('${c.base_product.replace(/'/g, "''")}', ${c.max_capacity_per_day}, '${c.uom}', ${c.batch_count}, ${c.operating_hours}, ${c.count_of_chef}, ${c.count_of_staff}, ${c.capacity_per_batch}, ${c.hours_per_batch})`).join(',\n') + `
ON CONFLICT (base_product) DO UPDATE SET
  max_capacity_per_day = EXCLUDED.max_capacity_per_day,
  uom = EXCLUDED.uom,
  batch_count = EXCLUDED.batch_count,
  operating_hours = EXCLUDED.operating_hours,
  count_of_chef = EXCLUDED.count_of_chef,
  count_of_staff = EXCLUDED.count_of_staff,
  capacity_per_batch = EXCLUDED.capacity_per_batch,
  hours_per_batch = EXCLUDED.hours_per_batch,
  updated_at = now();

-- 4. Replace Recipe BOM Data (126 Ingredients)
DELETE FROM recipe_bom;
INSERT INTO recipe_bom (base_product, raw_material, quantity, uom, unit_cost, wastage_percentage)
VALUES
` + recipes.map(r => `('${r.base_product.replace(/'/g, "''")}', '${r.raw_material.replace(/'/g, "''")}', ${r.quantity}, '${r.uom}', ${r.unit_cost}, ${r.wastage_percentage})`).join(',\n') + `;

-- 5. Replace Packaging BOM Data (51 Items)
DELETE FROM packaging_bom;
INSERT INTO packaging_bom (sku_id, packaging_material, quantity, uom, unit_cost, wastage_percentage)
VALUES
` + packagings.map(p => `('${p.sku_id.replace(/'/g, "''")}', '${p.packaging_material.replace(/'/g, "''")}', ${p.quantity}, '${p.uom}', ${p.unit_cost}, ${p.wastage_percentage})`).join(',\n') + `;

-- 6. Replace Staff Summary Data (13 Personnel)
DELETE FROM staff_summary;
INSERT INTO staff_summary (staff_name, role, salary, wage_per_day, is_active)
VALUES
` + staff.map(s => `('${s.staff_name.replace(/'/g, "''")}', '${s.role}', ${s.salary}, ${s.wage_per_day}, true)`).join(',\n') + `;
`;

fs.writeFileSync('supabase/migrations/20260925_google_sheets_sync.sql', migrationSql);
console.log('Saved supabase/migrations/20260925_google_sheets_sync.sql');

// 2. Update supabase/seed.sql
let seedSql = `-- ============================================================================
-- SNACK PRODUCTION PLANNER - SEED DATA (UPDATED FROM GOOGLE SHEETS)
-- Source: https://docs.google.com/spreadsheets/d/1o8n-sYenrBWNsSmBSnkp-cRdIcuXvwXyV8Ap9tPhuMI/
-- Safe for repeated runs
-- ============================================================================

-- 1. COUNTRIES
INSERT INTO countries (country_code, country_name, is_active) VALUES
('UAE', 'United Arab Emirates', true),
('SAU', 'Saudi Arabia', true),
('QAT', 'Qatar', true),
('OMN', 'Oman', true),
('IND', 'India', true),
('KWT', 'Kuwait', true),
('BHR', 'Bahrain', true)
ON CONFLICT (country_code) DO NOTHING;

-- 2. APP USERS
INSERT INTO app_users (full_name, email, role, is_active) VALUES
('David Miller', 'admin@snackplanner.com', 'admin', true),
('Sarah Jenkins', 'manager@snackplanner.com', 'production_manager', true),
('Raj Patel', 'viewer@snackplanner.com', 'viewer', true)
ON CONFLICT (email) DO NOTHING;

-- 3. SKU_PACK_SIZE_MASTER (35 SKUs)
INSERT INTO sku_pack_size_master (sku_id, sku_name, base_product, pack_size_g, packet_per_box, packing_qty_per_hour, packing_staff_count, is_active)
VALUES
` + skus.map(s => `('${s.sku_id}', '${s.sku_name.replace(/'/g, "''")}', '${s.base_product.replace(/'/g, "''")}', ${s.pack_size_g}, ${s.packet_per_box}, ${s.packing_qty_per_hour}, ${s.packing_staff_count}, true)`).join(',\n') + `
ON CONFLICT (sku_id) DO UPDATE SET
  sku_name = EXCLUDED.sku_name,
  base_product = EXCLUDED.base_product,
  pack_size_g = EXCLUDED.pack_size_g,
  packet_per_box = EXCLUDED.packet_per_box,
  packing_qty_per_hour = EXCLUDED.packing_qty_per_hour,
  packing_staff_count = EXCLUDED.packing_staff_count;

-- 4. CAPACITY_MASTER (15 Base Product Lines)
INSERT INTO capacity_master (base_product, max_capacity_per_day, uom, batch_count, operating_hours, count_of_chef, count_of_staff, capacity_per_batch, hours_per_batch)
VALUES
` + capacities.map(c => `('${c.base_product.replace(/'/g, "''")}', ${c.max_capacity_per_day}, '${c.uom}', ${c.batch_count}, ${c.operating_hours}, ${c.count_of_chef}, ${c.count_of_staff}, ${c.capacity_per_batch}, ${c.hours_per_batch})`).join(',\n') + `
ON CONFLICT (base_product) DO UPDATE SET
  max_capacity_per_day = EXCLUDED.max_capacity_per_day,
  uom = EXCLUDED.uom,
  batch_count = EXCLUDED.batch_count,
  operating_hours = EXCLUDED.operating_hours,
  count_of_chef = EXCLUDED.count_of_chef,
  count_of_staff = EXCLUDED.count_of_staff,
  capacity_per_batch = EXCLUDED.capacity_per_batch,
  hours_per_batch = EXCLUDED.hours_per_batch;

-- 5. RECIPE_BOM (126 Ingredients)
DELETE FROM recipe_bom;
INSERT INTO recipe_bom (base_product, raw_material, quantity, uom, unit_cost, wastage_percentage)
VALUES
` + recipes.map(r => `('${r.base_product.replace(/'/g, "''")}', '${r.raw_material.replace(/'/g, "''")}', ${r.quantity}, '${r.uom}', ${r.unit_cost}, ${r.wastage_percentage})`).join(',\n') + `;

-- 6. PACKAGING_BOM (51 Items)
DELETE FROM packaging_bom;
INSERT INTO packaging_bom (sku_id, packaging_material, quantity, uom, unit_cost, wastage_percentage)
VALUES
` + packagings.map(p => `('${p.sku_id.replace(/'/g, "''")}', '${p.packaging_material.replace(/'/g, "''")}', ${p.quantity}, '${p.uom}', ${p.unit_cost}, ${p.wastage_percentage})`).join(',\n') + `;

-- 7. STAFF_SUMMARY (13 Personnel)
DELETE FROM staff_summary;
INSERT INTO staff_summary (staff_name, role, salary, wage_per_day, is_active)
VALUES
` + staff.map(s => `('${s.staff_name.replace(/'/g, "''")}', '${s.role}', ${s.salary}, ${s.wage_per_day}, true)`).join(',\n') + `;
`;

fs.writeFileSync('supabase/seed.sql', seedSql);
console.log('Saved supabase/seed.sql');

// 3. Update src/services/mockData.js
const mockDataContent = `/**
 * Real Master Data from Google Sheets
 * Source: https://docs.google.com/spreadsheets/d/1o8n-sYenrBWNsSmBSnkp-cRdIcuXvwXyV8Ap9tPhuMI/
 * Snack Production Planner
 * Updated: 2026-09-25
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
  { 
    id: 'usr-01', 
    full_name: 'David Miller', 
    email: 'admin@snackplanner.com', 
    role: 'admin', 
    is_active: true, 
    avatar: 'DM',
    password_hash: 'ad89b64d66caa8e30e5d5ce4a9763f4ecc205814c412175f3e2c50027471426d' // Admin@123456
  },
  { 
    id: 'usr-02', 
    full_name: 'Sarah Jenkins', 
    email: 'manager@snackplanner.com', 
    role: 'production_manager', 
    is_active: true, 
    avatar: 'SJ',
    password_hash: 'dab7d42d92ec776106b87e867d0d0c8a55b62d8bf04aff87cf75ac5fca64572e' // Editor@123456
  },
  { 
    id: 'usr-03', 
    full_name: 'Raj Patel', 
    email: 'viewer@snackplanner.com', 
    role: 'viewer', 
    is_active: true, 
    avatar: 'RP',
    password_hash: '3e9d68599f64d77ce16d4cb1d93f8fa2e3b8d5a5b77d4e3541235174a51c13a4' // Viewer@123456
  }
];

export const INITIAL_SKUS = ${JSON.stringify(skus, null, 2)};

export const INITIAL_CAPACITY = ${JSON.stringify(capacities, null, 2)};

export const INITIAL_RECIPE_BOM = ${JSON.stringify(recipes, null, 2)};

export const INITIAL_PACKAGING_BOM = ${JSON.stringify(packagings, null, 2)};

export const INITIAL_STAFF = ${JSON.stringify(staff, null, 2)};

export const INITIAL_PLANS = [];
`;

fs.writeFileSync('src/services/mockData.js', mockDataContent);
console.log('Saved src/services/mockData.js');

// 4. Update initial schema to have packing columns
let initialSchema = fs.readFileSync('supabase/migrations/20260902_initial_schema.sql', 'utf8');
if (!initialSchema.includes('packing_qty_per_hour')) {
  initialSchema = initialSchema.replace(
    'packet_per_box INTEGER NOT NULL CHECK (packet_per_box > 0),',
    'packet_per_box INTEGER NOT NULL CHECK (packet_per_box > 0),\n    packing_qty_per_hour NUMERIC DEFAULT 0,\n    packing_staff_count INTEGER DEFAULT 0,'
  );
  fs.writeFileSync('supabase/migrations/20260902_initial_schema.sql', initialSchema);
  console.log('Updated supabase/migrations/20260902_initial_schema.sql with packing columns');
}

// 5. Save parsed_summary.json for sync script
fs.writeFileSync('parsed_summary.json', JSON.stringify({ skus, capacities, recipes, packagings, staff }, null, 2));
console.log('Saved parsed_summary.json');

