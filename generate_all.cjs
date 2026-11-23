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

function parseOperatingHours(val) {
  const num = parseFloat(val);
  if (isNaN(num) || num <= 0) return 8;
  const hours = Math.floor(num);
  const frac = Math.round((num - hours) * 100);
  if (frac === 15) return parseFloat((hours + 0.25).toFixed(2));
  if (frac === 30 || frac === 3) return parseFloat((hours + 0.50).toFixed(2));
  if (frac === 45) return parseFloat((hours + 0.75).toFixed(2));
  return num;
}

// 1. Capacity Master (15 rows from non-hidden sheet)
const capCSV = parseCSV(fs.readFileSync('Capacity_Master.csv', 'utf8'));
const capacities = capCSV.rows.map((r, i) => {
  const sl_no = parseInt(r[0], 10) || (i + 1);
  const base_product = r[1].trim();
  let max_capacity_per_day = parseFloat(r[2]) || 0;
  const uom = (r[3] || 'KG').trim();
  const batch_count = parseInt(r[4], 10) || 0;
  const operating_hours = parseOperatingHours(r[5]);
  const count_of_chef = parseInt(r[6], 10) || 0;
  const count_of_staff = parseInt(r[7], 10) || 0;

  if (base_product === 'RG CASSAVA STICK' && max_capacity_per_day <= 0) {
    max_capacity_per_day = 183.0;
  }

  const capacity_per_batch = batch_count > 0 ? parseFloat((max_capacity_per_day / batch_count).toFixed(2)) : 0;
  const hours_per_batch = batch_count > 0 ? parseFloat((operating_hours / batch_count).toFixed(2)) : 0;
  return {
    id: `cap-${String(i + 1).padStart(2, '0')}`,
    sl_no,
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

// 2. SKU Master (20 active rows from non-hidden sheet)
const skuCSV = parseCSV(fs.readFileSync('SKU_and_Pack_Size_Master.csv', 'utf8'));
const skus = skuCSV.rows.map((r, i) => {
  const sku_id = r[0].trim();
  let sku_name = r[1].trim();
  let base_product = r[2].trim();
  const pack_size_g = parseFloat(r[3]) || 0;
  const packet_per_box = parseInt(r[4], 10) || 0;
  const packing_qty_per_hour = parseFloat(r[5]) || 0;
  const packing_staff_count = parseInt(r[6], 10) || 0;

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

const activeSkuSet = new Set(skus.map(s => s.sku_id));

// 3. Recipe BOM (122 rows from non-hidden sheet)
const rcpCSV = parseCSV(fs.readFileSync('Recipe_BOM.csv', 'utf8'));
const recipes = rcpCSV.rows.map((r, i) => {
  const base_product = r[0].trim();
  const raw_material = r[1].trim();
  let quantity = 0;
  if (r[2] && r[2].includes('+')) {
    quantity = r[2].split('+').reduce((sum, val) => sum + (parseFloat(val.trim()) || 0), 0);
  } else {
    quantity = parseFloat(r[2]) || 0;
  }
  const uom = (r[3] || 'KG').trim();
  const cost_per_batch = parseFloat(r[4]) || 0;
  const unit_cost = quantity > 0 ? parseFloat((cost_per_batch / quantity).toFixed(4)) : cost_per_batch;

  return {
    id: `rcp-${String(i + 1).padStart(3, '0')}`,
    base_product,
    raw_material,
    quantity,
    uom,
    cost_per_batch,
    unit_cost
  };
});

// 4. Packaging BOM (Strictly from non-hidden sheet, 1:1 matching columns)
const pkgCSV = parseCSV(fs.readFileSync('Packaging_BOM.csv', 'utf8'));
const packagings = [];
let pkgIdx = 1;

for (let i = 0; i < pkgCSV.rows.length; i++) {
  const r = pkgCSV.rows[i];
  let sku_id = r[0] ? r[0].trim() : '';
  let packaging_material = r[1] ? r[1].trim() : '';
  let quantity = parseFloat(r[2]) || 1;
  let unit_cost = parseFloat(r[3]) || 0;

  if (!sku_id) {
    continue;
  }

  if (typeof unit_cost === 'string' || isNaN(unit_cost)) {
    unit_cost = parseFloat(String(unit_cost).replace(/[^0-9.]/g, '')) || 0;
  }

  packagings.push({
    id: `pkg-${String(pkgIdx++).padStart(3, '0')}`,
    sku_id,
    packaging_material,
    quantity,
    unit_cost
  });
}

// 5. Staff Summary (Strictly 12 rows from non-hidden sheet, matching real columns)
const stfCSV = parseCSV(fs.readFileSync('Staff_Summary.csv', 'utf8'));
const staff = stfCSV.rows.map((r, i) => {
  const sl_no = parseInt(r[0], 10) || (i + 1);
  const staff_name = r[1].trim();
  const salary = parseFloat(r[2]) || 0;
  const wage_per_day = parseFloat(r[3]) || 0;

  return {
    id: `stf-${String(i + 1).padStart(2, '0')}`,
    sl_no,
    staff_name,
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
-- MIGRATION: Synchronize Structure & Data Strictly with Google Sheets Non-Hidden Sheets
-- Date: 2026-11-21
-- Source: https://docs.google.com/spreadsheets/d/1o8n-sYenrBWNsSmBSnkp-cRdIcuXvwXyV8Ap9tPhuMI/
-- ============================================================================

-- 1. Ensure staff_summary columns match sheet (SL NO, STAFF NAME, SALARY, Wage / Day)
ALTER TABLE IF EXISTS staff_summary 
ADD COLUMN IF NOT EXISTS sl_no INTEGER,
ADD COLUMN IF NOT EXISTS salary NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS wage_per_day NUMERIC DEFAULT 0;

ALTER TABLE IF EXISTS staff_summary ALTER COLUMN role DROP NOT NULL;

-- 2. Clear out legacy records
DELETE FROM packaging_bom;
DELETE FROM sku_pack_size_master;
DELETE FROM recipe_bom;
DELETE FROM capacity_master;
DELETE FROM staff_summary;

-- 3. Insert Clean SKU Master Data (${skus.length} SKUs)
INSERT INTO sku_pack_size_master (sku_id, sku_name, base_product, pack_size_g, packet_per_box, packing_qty_per_hour, packing_staff_count, is_active)
VALUES
` + skus.map(s => `('${s.sku_id}', '${s.sku_name.replace(/'/g, "''")}', '${s.base_product.replace(/'/g, "''")}', ${s.pack_size_g}, ${s.packet_per_box}, ${s.packing_qty_per_hour}, ${s.packing_staff_count}, true)`).join(',\n') + `;

-- 4. Insert Clean Capacity Master Data (${capacities.length} Lines)
INSERT INTO capacity_master (base_product, max_capacity_per_day, uom, batch_count, operating_hours, count_of_chef, count_of_staff, capacity_per_batch, hours_per_batch)
VALUES
` + capacities.map(c => `('${c.base_product.replace(/'/g, "''")}', ${c.max_capacity_per_day}, '${c.uom}', ${c.batch_count}, ${c.operating_hours}, ${c.count_of_chef}, ${c.count_of_staff}, ${c.capacity_per_batch}, ${c.hours_per_batch})`).join(',\n') + `;

-- 5. Insert Clean Recipe BOM Data (${recipes.length} Ingredients)
INSERT INTO recipe_bom (base_product, raw_material, quantity, uom, unit_cost, wastage_percentage)
VALUES
` + recipes.map(r => `('${r.base_product.replace(/'/g, "''")}', '${r.raw_material.replace(/'/g, "''")}', ${r.quantity}, '${r.uom}', ${r.unit_cost}, 0)`).join(',\n') + `;

-- 6. Insert Clean Packaging BOM Data (${packagings.length} Items)
INSERT INTO packaging_bom (sku_id, packaging_material, quantity, unit_cost)
VALUES
` + packagings.map(p => `('${p.sku_id.replace(/'/g, "''")}', '${p.packaging_material.replace(/'/g, "''")}', ${p.quantity}, ${p.unit_cost})`).join(',\n') + `;

-- 7. Insert Clean Staff Summary Data (${staff.length} Personnel)
INSERT INTO staff_summary (sl_no, staff_name, salary, wage_per_day, is_active)
VALUES
` + staff.map(s => `(${s.sl_no}, '${s.staff_name.replace(/'/g, "''")}', ${s.salary}, ${s.wage_per_day}, true)`).join(',\n') + `;
`;

fs.writeFileSync('supabase/migrations/20260925_google_sheets_sync.sql', migrationSql);
console.log('Saved supabase/migrations/20260925_google_sheets_sync.sql');

// 2. Update supabase/seed.sql
let seedSql = `-- ============================================================================
-- SNACK PRODUCTION PLANNER - SEED DATA (UPDATED FROM GOOGLE SHEETS NON-HIDDEN SHEETS)
-- Source: https://docs.google.com/spreadsheets/d/1o8n-sYenrBWNsSmBSnkp-cRdIcuXvwXyV8Ap9tPhuMI/
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

-- 3. SKU_PACK_SIZE_MASTER (${skus.length} Active SKUs)
DELETE FROM packaging_bom;
DELETE FROM sku_pack_size_master;
INSERT INTO sku_pack_size_master (sku_id, sku_name, base_product, pack_size_g, packet_per_box, packing_qty_per_hour, packing_staff_count, is_active)
VALUES
` + skus.map(s => `('${s.sku_id}', '${s.sku_name.replace(/'/g, "''")}', '${s.base_product.replace(/'/g, "''")}', ${s.pack_size_g}, ${s.packet_per_box}, ${s.packing_qty_per_hour}, ${s.packing_staff_count}, true)`).join(',\n') + `;

-- 4. CAPACITY_MASTER (${capacities.length} Base Product Lines)
DELETE FROM capacity_master;
INSERT INTO capacity_master (base_product, max_capacity_per_day, uom, batch_count, operating_hours, count_of_chef, count_of_staff, capacity_per_batch, hours_per_batch)
VALUES
` + capacities.map(c => `('${c.base_product.replace(/'/g, "''")}', ${c.max_capacity_per_day}, '${c.uom}', ${c.batch_count}, ${c.operating_hours}, ${c.count_of_chef}, ${c.count_of_staff}, ${c.capacity_per_batch}, ${c.hours_per_batch})`).join(',\n') + `;

-- 5. RECIPE_BOM (${recipes.length} Ingredients)
DELETE FROM recipe_bom;
INSERT INTO recipe_bom (base_product, raw_material, quantity, uom, unit_cost, wastage_percentage)
VALUES
` + recipes.map(r => `('${r.base_product.replace(/'/g, "''")}', '${r.raw_material.replace(/'/g, "''")}', ${r.quantity}, '${r.uom}', ${r.unit_cost}, 0)`).join(',\n') + `;

-- 6. PACKAGING_BOM (${packagings.length} Items)
DELETE FROM packaging_bom;
INSERT INTO packaging_bom (sku_id, packaging_material, quantity, unit_cost)
VALUES
` + packagings.map(p => `('${p.sku_id.replace(/'/g, "''")}', '${p.packaging_material.replace(/'/g, "''")}', ${p.quantity}, ${p.unit_cost})`).join(',\n') + `;

-- 7. STAFF_SUMMARY (${staff.length} Personnel)
DELETE FROM staff_summary;
INSERT INTO staff_summary (sl_no, staff_name, salary, wage_per_day, is_active)
VALUES
` + staff.map(s => `(${s.sl_no}, '${s.staff_name.replace(/'/g, "''")}', ${s.salary}, ${s.wage_per_day}, true)`).join(',\n') + `;
`;

fs.writeFileSync('supabase/seed.sql', seedSql);
console.log('Saved supabase/seed.sql');

// 3. Update src/services/mockData.js
const mockDataContent = `/**
 * Real Master Data from Google Sheets (Non-Hidden Sheets Only)
 * Source: https://docs.google.com/spreadsheets/d/1o8n-sYenrBWNsSmBSnkp-cRdIcuXvwXyV8Ap9tPhuMI/
 * Snack Production Planner
 * Synchronized with Factory Ground Truth
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

// 4. Save parsed_summary.json
fs.writeFileSync('parsed_summary.json', JSON.stringify({ skus, capacities, recipes, packagings, staff }, null, 2));
console.log('Saved parsed_summary.json');
