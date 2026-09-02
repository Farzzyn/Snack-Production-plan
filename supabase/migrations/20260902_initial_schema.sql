-- ============================================================================
-- SNACK PRODUCTION PLANNER - DATABASE SCHEMA MIGRATION
-- Target Database: Supabase PostgreSQL
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COUNTRIES TABLE
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_code TEXT UNIQUE NOT NULL,
    country_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. APP_USERS (Application Profile & Roles)
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'production_manager', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SKU_PACK_SIZE_MASTER
CREATE TABLE IF NOT EXISTS sku_pack_size_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku_id TEXT UNIQUE NOT NULL,
    sku_name TEXT NOT NULL,
    base_product TEXT NOT NULL,
    pack_size_g NUMERIC NOT NULL CHECK (pack_size_g > 0),
    packet_per_box INTEGER NOT NULL CHECK (packet_per_box > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CAPACITY_MASTER
CREATE TABLE IF NOT EXISTS capacity_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_product TEXT NOT NULL UNIQUE,
    max_capacity_per_day NUMERIC NOT NULL CHECK (max_capacity_per_day > 0),
    uom TEXT NOT NULL DEFAULT 'KG',
    batch_count INTEGER NOT NULL CHECK (batch_count > 0),
    operating_hours NUMERIC NOT NULL CHECK (operating_hours > 0),
    count_of_chef INTEGER NOT NULL CHECK (count_of_chef > 0),
    count_of_staff INTEGER NOT NULL CHECK (count_of_staff >= 0),
    capacity_per_batch NUMERIC,
    hours_per_batch NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RECIPE_BOM (Bill of Materials for Ingredients per Base Product)
CREATE TABLE IF NOT EXISTS recipe_bom (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_product TEXT NOT NULL,
    raw_material TEXT NOT NULL,
    quantity NUMERIC NOT NULL CHECK (quantity >= 0),
    uom TEXT NOT NULL,
    unit_cost NUMERIC NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
    wastage_percentage NUMERIC DEFAULT 0 CHECK (wastage_percentage >= 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PACKAGING_BOM (Bill of Materials for Packaging per SKU)
CREATE TABLE IF NOT EXISTS packaging_bom (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku_id TEXT NOT NULL REFERENCES sku_pack_size_master(sku_id) ON DELETE CASCADE,
    packaging_material TEXT NOT NULL,
    quantity NUMERIC NOT NULL CHECK (quantity >= 0),
    uom TEXT NOT NULL,
    unit_cost NUMERIC NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
    wastage_percentage NUMERIC DEFAULT 0 CHECK (wastage_percentage >= 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. STAFF_SUMMARY
CREATE TABLE IF NOT EXISTS staff_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_name TEXT NOT NULL,
    role TEXT NOT NULL,
    salary NUMERIC DEFAULT 0,
    wage_per_day NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    country_id UUID REFERENCES countries(id) ON DELETE RESTRICT,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Draft', 'Confirmed', 'Processing', 'Fulfilled', 'Cancelled')),
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. ORDER_ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sku_id TEXT NOT NULL REFERENCES sku_pack_size_master(sku_id) ON DELETE RESTRICT,
    pack_size_g NUMERIC NOT NULL,
    order_quantity_boxes INTEGER NOT NULL CHECK (order_quantity_boxes > 0),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. PRODUCTION_PLANS
CREATE TABLE IF NOT EXISTS production_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    plan_number TEXT UNIQUE NOT NULL,
    
    country_id UUID REFERENCES countries(id) ON DELETE RESTRICT,
    country_name TEXT,
    sku_id TEXT NOT NULL REFERENCES sku_pack_size_master(sku_id) ON DELETE RESTRICT,
    sku_name TEXT,
    base_product TEXT NOT NULL,

    pack_size_g NUMERIC NOT NULL,
    order_quantity_boxes INTEGER NOT NULL,
    packets_required NUMERIC NOT NULL,
    finished_goods_weight_kg NUMERIC NOT NULL,

    selected_chef_quantity INTEGER NOT NULL,
    available_capacity_per_day NUMERIC NOT NULL,

    production_batches NUMERIC NOT NULL,
    target_production_quantity NUMERIC NOT NULL,
    production_hours NUMERIC NOT NULL,

    required_staff INTEGER NOT NULL,
    production_date DATE NOT NULL,

    status TEXT NOT NULL DEFAULT 'Planned' CHECK (status IN ('Draft', 'Planned', 'In Production', 'Completed', 'Cancelled')),

    estimated_raw_material_cost NUMERIC DEFAULT 0,
    estimated_packaging_cost NUMERIC DEFAULT 0,
    total_material_cost NUMERIC DEFAULT 0,

    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. PRODUCTION_PLAN_RAW_MATERIALS (Immutable Snapshot)
CREATE TABLE IF NOT EXISTS production_plan_raw_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    production_plan_id UUID NOT NULL REFERENCES production_plans(id) ON DELETE CASCADE,
    raw_material TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    uom TEXT NOT NULL,
    unit_cost NUMERIC DEFAULT 0,
    estimated_cost NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. PRODUCTION_PLAN_PACKAGING (Immutable Snapshot)
CREATE TABLE IF NOT EXISTS production_plan_packaging (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    production_plan_id UUID NOT NULL REFERENCES production_plans(id) ON DELETE CASCADE,
    packaging_material TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    uom TEXT NOT NULL,
    unit_cost NUMERIC DEFAULT 0,
    estimated_cost NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR HIGH-PERFORMANCE MRP LOOKUPS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_sku_base_product ON sku_pack_size_master(base_product);
CREATE INDEX IF NOT EXISTS idx_recipe_base_product ON recipe_bom(base_product);
CREATE INDEX IF NOT EXISTS idx_packaging_sku_id ON packaging_bom(sku_id);
CREATE INDEX IF NOT EXISTS idx_capacity_base_product ON capacity_master(base_product);
CREATE INDEX IF NOT EXISTS idx_orders_country_id ON orders(country_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_prod_plans_sku_id ON production_plans(sku_id);
CREATE INDEX IF NOT EXISTS idx_prod_plans_date ON production_plans(production_date);
CREATE INDEX IF NOT EXISTS idx_prod_plans_status ON production_plans(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sku_pack_size_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_bom ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaging_bom ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_plan_raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_plan_packaging ENABLE ROW LEVEL SECURITY;

-- Helper to get active user role from auth session
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM app_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Universal Read Access for Authenticated Users
CREATE POLICY "Allow authenticated read on countries" ON countries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on app_users" ON app_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on sku" ON sku_pack_size_master FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on recipe" ON recipe_bom FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on packaging" ON packaging_bom FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on capacity" ON capacity_master FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on staff" ON staff_summary FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on order_items" ON order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on plans" ON production_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on plan_raw" ON production_plan_raw_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on plan_pack" ON production_plan_packaging FOR SELECT TO authenticated USING (true);

-- Admin: Full Access
CREATE POLICY "Admin full on countries" ON countries FOR ALL TO authenticated USING (current_user_role() = 'admin');
CREATE POLICY "Admin full on app_users" ON app_users FOR ALL TO authenticated USING (current_user_role() = 'admin');
CREATE POLICY "Admin full on sku" ON sku_pack_size_master FOR ALL TO authenticated USING (current_user_role() = 'admin');
CREATE POLICY "Admin full on recipe" ON recipe_bom FOR ALL TO authenticated USING (current_user_role() = 'admin');
CREATE POLICY "Admin full on packaging" ON packaging_bom FOR ALL TO authenticated USING (current_user_role() = 'admin');
CREATE POLICY "Admin full on capacity" ON capacity_master FOR ALL TO authenticated USING (current_user_role() = 'admin');
CREATE POLICY "Admin full on staff" ON staff_summary FOR ALL TO authenticated USING (current_user_role() = 'admin');
CREATE POLICY "Admin full on orders" ON orders FOR ALL TO authenticated USING (current_user_role() = 'admin');
CREATE POLICY "Admin full on order_items" ON order_items FOR ALL TO authenticated USING (current_user_role() = 'admin');
CREATE POLICY "Admin full on plans" ON production_plans FOR ALL TO authenticated USING (current_user_role() = 'admin');
CREATE POLICY "Admin full on plan_raw" ON production_plan_raw_materials FOR ALL TO authenticated USING (current_user_role() = 'admin');
CREATE POLICY "Admin full on plan_pack" ON production_plan_packaging FOR ALL TO authenticated USING (current_user_role() = 'admin');

-- Production Manager: Orders and Plans Insert & Update
CREATE POLICY "PM create/update orders" ON orders FOR ALL TO authenticated 
    USING (current_user_role() IN ('admin', 'production_manager'));
CREATE POLICY "PM create/update order_items" ON order_items FOR ALL TO authenticated 
    USING (current_user_role() IN ('admin', 'production_manager'));
CREATE POLICY "PM create/update plans" ON production_plans FOR ALL TO authenticated 
    USING (current_user_role() IN ('admin', 'production_manager'));
CREATE POLICY "PM create/update plan_raw" ON production_plan_raw_materials FOR ALL TO authenticated 
    USING (current_user_role() IN ('admin', 'production_manager'));
CREATE POLICY "PM create/update plan_pack" ON production_plan_packaging FOR ALL TO authenticated 
    USING (current_user_role() IN ('admin', 'production_manager'));
