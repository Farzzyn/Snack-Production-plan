/**
 * Direct Sync to Supabase PostgreSQL Database
 * Reads configuration from .env and pushes updated Google Sheet datasets.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        env[key] = val;
      }
    }
  });
  return env;
}

const env = loadEnv();
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Key not found in .env');
  process.exit(1);
}

console.log(`Connecting to Supabase at: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncAll() {
  const summaryPath = path.resolve(__dirname, '../parsed_summary.json');
  if (!fs.existsSync(summaryPath)) {
    console.error('❌ parsed_summary.json not found. Run generate_all.cjs first.');
    process.exit(1);
  }

  const { skus, capacities, recipes, packagings, staff } = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

  try {
    // 1. Sync SKUs
    console.log(`\n📦 Upserting ${skus.length} SKUs...`);
    const skuPayload = skus.map(s => ({
      sku_id: s.sku_id,
      sku_name: s.sku_name,
      base_product: s.base_product,
      pack_size_g: s.pack_size_g,
      packet_per_box: s.packet_per_box,
      packing_qty_per_hour: s.packing_qty_per_hour,
      packing_staff_count: s.packing_staff_count,
      is_active: true
    }));
    const { error: skuErr } = await supabase.from('sku_pack_size_master').upsert(skuPayload, { onConflict: 'sku_id' });
    if (skuErr) console.error('SKU Error:', skuErr.message);
    else console.log('✅ SKUs synced successfully');

    // 2. Sync Capacity
    console.log(`\n🏭 Upserting ${capacities.length} Capacity lines...`);
    const capPayload = capacities.map(c => ({
      base_product: c.base_product,
      max_capacity_per_day: c.max_capacity_per_day,
      uom: c.uom,
      batch_count: c.batch_count,
      operating_hours: c.operating_hours,
      count_of_chef: c.count_of_chef,
      count_of_staff: c.count_of_staff,
      capacity_per_batch: c.capacity_per_batch,
      hours_per_batch: c.hours_per_batch
    }));
    const { error: capErr } = await supabase.from('capacity_master').upsert(capPayload, { onConflict: 'base_product' });
    if (capErr) console.error('Capacity Error:', capErr.message);
    else console.log('✅ Capacity synced successfully');

    // 3. Sync Recipe BOM
    console.log(`\n📋 Upserting ${recipes.length} Recipe ingredients...`);
    await supabase.from('recipe_bom').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const rcpPayload = recipes.map(r => ({
      base_product: r.base_product,
      raw_material: r.raw_material,
      quantity: r.quantity,
      uom: r.uom,
      unit_cost: r.unit_cost,
      wastage_percentage: r.wastage_percentage
    }));
    const { error: rcpErr } = await supabase.from('recipe_bom').insert(rcpPayload);
    if (rcpErr) console.error('Recipe BOM Error:', rcpErr.message);
    else console.log('✅ Recipe BOM synced successfully');

    // 4. Sync Packaging BOM
    console.log(`\n📦 Upserting ${packagings.length} Packaging items...`);
    await supabase.from('packaging_bom').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const pkgPayload = packagings.map(p => ({
      sku_id: p.sku_id,
      packaging_material: p.packaging_material,
      quantity: p.quantity,
      uom: p.uom,
      unit_cost: p.unit_cost,
      wastage_percentage: p.wastage_percentage
    }));
    const { error: pkgErr } = await supabase.from('packaging_bom').insert(pkgPayload);
    if (pkgErr) console.error('Packaging BOM Error:', pkgErr.message);
    else console.log('✅ Packaging BOM synced successfully');

    // 5. Sync Staff
    console.log(`\n👥 Upserting ${staff.length} Staff members...`);
    await supabase.from('staff_summary').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const stfPayload = staff.map(s => ({
      staff_name: s.staff_name,
      role: s.role,
      salary: s.salary,
      wage_per_day: s.wage_per_day,
      is_active: true
    }));
    const { error: stfErr } = await supabase.from('staff_summary').insert(stfPayload);
    if (stfErr) console.error('Staff Error:', stfErr.message);
    else console.log('✅ Staff synced successfully');

    console.log('\n🎉 ALL MASTER DATA SYNCED TO SUPABASE!');
  } catch (err) {
    console.error('Sync failed:', err.message);
  }
}

syncAll();
