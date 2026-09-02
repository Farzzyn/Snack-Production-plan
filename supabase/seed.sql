-- ============================================================================
-- SNACK PRODUCTION PLANNER - SEED DATA
-- ============================================================================

-- 1. COUNTRIES
INSERT INTO countries (id, country_code, country_name, is_active) VALUES
('a0000000-0000-0000-0000-000000000001', 'UAE', 'United Arab Emirates', true),
('a0000000-0000-0000-0000-000000000002', 'SAU', 'Saudi Arabia', true),
('a0000000-0000-0000-0000-000000000003', 'QAT', 'Qatar', true),
('a0000000-0000-0000-0000-000000000004', 'OMN', 'Oman', true),
('a0000000-0000-0000-0000-000000000005', 'IND', 'India', true),
('a0000000-0000-0000-0000-000000000006', 'KWT', 'Kuwait', true),
('a0000000-0000-0000-0000-000000000007', 'BHR', 'Bahrain', true)
ON CONFLICT (country_code) DO NOTHING;

-- 2. APP USERS
INSERT INTO app_users (id, full_name, email, role, is_active) VALUES
('b0000000-0000-0000-0000-000000000001', 'David Miller (Plant Director)', 'admin@snackplanner.com', 'admin', true),
('b0000000-0000-0000-0000-000000000002', 'Sarah Jenkins (Production Head)', 'manager@snackplanner.com', 'production_manager', true),
('b0000000-0000-0000-0000-000000000003', 'Raj Patel (Floor Supervisor)', 'viewer@snackplanner.com', 'viewer', true)
ON CONFLICT (email) DO NOTHING;

-- 3. SKU_PACK_SIZE_MASTER
INSERT INTO sku_pack_size_master (id, sku_id, sku_name, base_product, pack_size_g, packet_per_box, is_active) VALUES
('c0000000-0000-0000-0000-000000000001', 'RGHMIX150', 'Roasted Gram Healthy Mix 150g', 'Roasted Gram Healthy Mix', 150, 20, true),
('c0000000-0000-0000-0000-000000000002', 'RGHMIX200', 'Roasted Gram Healthy Mix 200g', 'Roasted Gram Healthy Mix', 200, 20, true),
('c0000000-0000-0000-0000-000000000003', 'RGHMIX50', 'Roasted Gram Healthy Mix 50g Pocket', 'Roasted Gram Healthy Mix', 50, 40, true),
('c0000000-0000-0000-0000-000000000004', 'MPNUT100', 'Masala Peanut Crunch 100g', 'Masala Peanut Crunch', 100, 24, true),
('c0000000-0000-0000-0000-000000000005', 'MPNUT200', 'Masala Peanut Crunch 200g Share Pack', 'Masala Peanut Crunch', 200, 16, true),
('c0000000-0000-0000-0000-000000000006', 'CSSCHP120', 'Spiced Cassava Pepper Chips 120g', 'Spiced Cassava Chips', 120, 20, true),
('c0000000-0000-0000-0000-000000000007', 'MKHNA70', 'Roasted Peri-Peri Makhana 70g', 'Roasted Makhana', 70, 20, true),
('c0000000-0000-0000-0000-000000000008', 'BANCHP150', 'Kerala Golden Banana Crisps 150g', 'Golden Banana Crisps', 150, 20, true)
ON CONFLICT (sku_id) DO NOTHING;

-- 4. CAPACITY_MASTER
-- PRD Example: Roasted Gram Healthy Mix base capacity 2 chefs = 500 KG/day, 8 operating hours, 4 batches
INSERT INTO capacity_master (id, base_product, max_capacity_per_day, uom, batch_count, operating_hours, count_of_chef, count_of_staff, capacity_per_batch, hours_per_batch) VALUES
('d0000000-0000-0000-0000-000000000001', 'Roasted Gram Healthy Mix', 500, 'KG', 4, 8, 2, 4, 125, 2.0),
('d0000000-0000-0000-0000-000000000002', 'Masala Peanut Crunch', 600, 'KG', 6, 8, 2, 4, 100, 1.33),
('d0000000-0000-0000-0000-000000000003', 'Spiced Cassava Chips', 400, 'KG', 4, 8, 2, 5, 100, 2.0),
('d0000000-0000-0000-0000-000000000004', 'Roasted Makhana', 250, 'KG', 5, 8, 2, 3, 50, 1.6),
('d0000000-0000-0000-0000-000000000005', 'Golden Banana Crisps', 450, 'KG', 3, 8, 2, 4, 150, 2.67)
ON CONFLICT (base_product) DO NOTHING;

-- 5. RECIPE_BOM (Raw material quantities per batch)
INSERT INTO recipe_bom (base_product, raw_material, quantity, uom, unit_cost, wastage_percentage) VALUES
-- Roasted Gram Healthy Mix (per 125 KG batch)
('Roasted Gram Healthy Mix', 'Roasted Bengal Gram', 85, 'KG', 2.80, 1.5),
('Roasted Gram Healthy Mix', 'Cold-Pressed Rice Bran Oil', 8, 'LTR', 2.20, 2.0),
('Roasted Gram Healthy Mix', 'Pink Himalayan Rock Salt', 2, 'KG', 0.60, 0.0),
('Roasted Gram Healthy Mix', 'Signature Spice & Herb Blend', 5, 'KG', 8.50, 1.0),
('Roasted Gram Healthy Mix', 'Crispy Curry Leaves & Cashews', 25, 'KG', 6.00, 2.0),

-- Masala Peanut Crunch (per 100 KG batch)
('Masala Peanut Crunch', 'Premium Raw Peanuts', 80, 'KG', 2.10, 2.0),
('Masala Peanut Crunch', 'Gram Flour (Besan)', 12, 'KG', 1.40, 1.0),
('Masala Peanut Crunch', 'Sunflower Oil', 10, 'LTR', 2.00, 2.5),
('Masala Peanut Crunch', 'Chili Pepper & Cumin Seasoning', 4, 'KG', 7.20, 1.0),
('Masala Peanut Crunch', 'Iodized Salt', 1.5, 'KG', 0.40, 0.0),

-- Spiced Cassava Chips (per 100 KG batch)
('Spiced Cassava Chips', 'Fresh Farm Cassava Roots', 180, 'KG', 0.90, 8.0),
('Spiced Cassava Chips', 'Palm Frying Oil', 18, 'LTR', 1.70, 3.0),
('Spiced Cassava Chips', 'Black Pepper & Sea Salt Seasoning', 3.5, 'KG', 9.00, 0.5),

-- Roasted Makhana (per 50 KG batch)
('Roasted Makhana', 'Raw Jumbo Fox Nuts (Phool Makhana)', 45, 'KG', 14.00, 3.0),
('Roasted Makhana', 'Pure Olive Oil Mist', 3, 'LTR', 6.50, 1.0),
('Roasted Makhana', 'Peri-Peri Spice Mix', 3, 'KG', 11.00, 0.5),

-- Golden Banana Crisps (per 150 KG batch)
('Golden Banana Crisps', 'Raw Green Nendran Bananas', 320, 'KG', 0.85, 10.0),
('Golden Banana Crisps', 'Pure Coconut Oil', 28, 'LTR', 3.40, 2.0),
('Golden Banana Crisps', 'Turmeric Infused Salt Water', 4, 'LTR', 0.50, 0.0);

-- 6. PACKAGING_BOM
INSERT INTO packaging_bom (sku_id, packaging_material, quantity, uom, unit_cost, wastage_percentage) VALUES
-- RGHMIX150 (per packet/box basis)
('RGHMIX150', 'Metallized Barrier Pouch (150g Matte Finish)', 1.0, 'PCS', 0.14, 3.0),
('RGHMIX150', 'Master Corrugated Shipper Carton (20 Packets)', 0.05, 'PCS', 0.85, 1.0),
('RGHMIX150', 'Holographic Tamper Seal Label', 1.0, 'PCS', 0.03, 2.0),
('RGHMIX150', 'Heavy Duty Carton Packing Tape', 0.002, 'ROLL', 3.20, 0.0),

-- RGHMIX200
('RGHMIX200', 'Metallized Barrier Pouch (200g Matte Finish)', 1.0, 'PCS', 0.16, 3.0),
('RGHMIX200', 'Master Corrugated Shipper Carton (20 Packets)', 0.05, 'PCS', 0.90, 1.0),
('RGHMIX200', 'Holographic Tamper Seal Label', 1.0, 'PCS', 0.03, 2.0),
('RGHMIX200', 'Heavy Duty Carton Packing Tape', 0.002, 'ROLL', 3.20, 0.0),

-- RGHMIX50
('RGHMIX50', 'Pocket Pillow Pouch (50g)', 1.0, 'PCS', 0.09, 4.0),
('RGHMIX50', 'Master Corrugated Shipper Carton (40 Packets)', 0.025, 'PCS', 0.75, 1.0),
('RGHMIX50', 'Carton Shipping Label', 0.025, 'PCS', 0.04, 1.0),

-- MPNUT100
('MPNUT100', 'Nitrogen-Flushed Standup Pouch (100g)', 1.0, 'PCS', 0.13, 3.0),
('MPNUT100', 'Master Corrugated Shipper Carton (24 Packets)', 0.0417, 'PCS', 0.85, 1.0),
('MPNUT100', 'Heavy Duty Carton Packing Tape', 0.002, 'ROLL', 3.20, 0.0),

-- CSSCHP120
('CSSCHP120', 'Pillow Foil Pouch (120g)', 1.0, 'PCS', 0.12, 3.0),
('CSSCHP120', 'Master Corrugated Shipper Carton (20 Packets)', 0.05, 'PCS', 0.85, 1.0),

-- MKHNA70
('MKHNA70', 'Zip-Lock Resealable Kraft Pouch (70g)', 1.0, 'PCS', 0.22, 2.0),
('MKHNA70', 'Master Corrugated Shipper Carton (20 Packets)', 0.05, 'PCS', 0.95, 1.0),

-- BANCHP150
('BANCHP150', 'Printed Poly Pouch (150g)', 1.0, 'PCS', 0.11, 3.0),
('BANCHP150', 'Master Corrugated Shipper Carton (20 Packets)', 0.05, 'PCS', 0.85, 1.0);

-- 7. STAFF_SUMMARY
INSERT INTO staff_summary (staff_name, role, salary, wage_per_day, is_active) VALUES
('Ramesh Kumar', 'Master Chef', 4500, 150, true),
('Suresh Menon', 'Executive Fryer Chef', 4200, 140, true),
('Vikram Singh', 'Senior Roasting Chef', 4200, 140, true),
('Abdul Rahman', 'Assistant Chef', 3200, 110, true),
('Anil Verma', 'Floor Packaging Operator', 2500, 85, true),
('Sunil Sharma', 'Packaging & Sealing Operator', 2500, 85, true),
('Devi Prasad', 'Quality Control Inspector', 3000, 100, true),
('Manoj Tiwari', 'Material Handler & Loader', 2200, 75, true),
('Kishore Nair', 'Machine Maintenance Technician', 3500, 120, true),
('Farhan Akhtar', 'Sanitation & Hygiene Lead', 2100, 70, true);
