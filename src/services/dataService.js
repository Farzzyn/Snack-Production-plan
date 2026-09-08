import { supabase, isSupabaseConfigured } from './supabaseClient';
export { isSupabaseConfigured };
import {
  INITIAL_COUNTRIES,
  INITIAL_USERS,
  INITIAL_SKUS,
  INITIAL_CAPACITY,
  INITIAL_RECIPE_BOM,
  INITIAL_PACKAGING_BOM,
  INITIAL_STAFF,
  INITIAL_PLANS
} from './mockData';
import { hashPassword } from './authService';

// Local storage keys (v2 with real Google Sheets master data)
const STORAGE_PREFIX = 'snack_planner_v2_';
const STORAGE_KEYS = {
  COUNTRIES: `${STORAGE_PREFIX}countries`,
  USERS: `${STORAGE_PREFIX}users`,
  SKUS: `${STORAGE_PREFIX}skus`,
  CAPACITY: `${STORAGE_PREFIX}capacity`,
  RECIPE_BOM: `${STORAGE_PREFIX}recipe_bom`,
  PACKAGING_BOM: `${STORAGE_PREFIX}packaging_bom`,
  STAFF: `${STORAGE_PREFIX}staff`,
  PLANS: `${STORAGE_PREFIX}plans`,
  FORCE_MOCK: `${STORAGE_PREFIX}force_mock`,
  CREDENTIALS: `${STORAGE_PREFIX}credentials`
};

export const DEFAULT_CREDENTIALS = {
  'admin@snackplanner.com': 'ad89b64d66caa8e30e5d5ce4a9763f4ecc205814c412175f3e2c50027471426d', // Admin@123456
  'manager@snackplanner.com': 'dab7d42d92ec776106b87e867d0d0c8a55b62d8bf04aff87cf75ac5fca64572e', // Editor@123456
  'viewer@snackplanner.com': '3e9d68599f64d77ce16d4cb1d93f8fa2e3b8d5a5b77d4e3541235174a51c13a4', // Viewer@123456
  'admin121@gmail.com': 'ad89b64d66caa8e30e5d5ce4a9763f4ecc205814c412175f3e2c50027471426d' // Admin@123456
};

export function getCredentialStore() {
  const existing = getLocal(STORAGE_KEYS.CREDENTIALS, DEFAULT_CREDENTIALS);
  // Ensure defaults are populated if missing
  return { ...DEFAULT_CREDENTIALS, ...existing };
}

export function setCredential(email, hash) {
  const store = getCredentialStore();
  store[(email || '').trim().toLowerCase()] = hash;
  setLocal(STORAGE_KEYS.CREDENTIALS, store);
}

// Helper to initialize or get localStorage array
function getLocal(key, defaultData) {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return defaultData;
  }
}

function setLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export const isUsingMock = () => {
  if (!isSupabaseConfigured()) return true;
  return localStorage.getItem(STORAGE_KEYS.FORCE_MOCK) === 'true';
};

export const setForceMock = (force) => {
  localStorage.setItem(STORAGE_KEYS.FORCE_MOCK, force ? 'true' : 'false');
};

export const resetLocalDatabase = () => {
  setLocal(STORAGE_KEYS.COUNTRIES, INITIAL_COUNTRIES);
  setLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
  setLocal(STORAGE_KEYS.CREDENTIALS, DEFAULT_CREDENTIALS);
  setLocal(STORAGE_KEYS.SKUS, INITIAL_SKUS);
  setLocal(STORAGE_KEYS.CAPACITY, INITIAL_CAPACITY);

  setLocal(STORAGE_KEYS.RECIPE_BOM, INITIAL_RECIPE_BOM);
  setLocal(STORAGE_KEYS.PACKAGING_BOM, INITIAL_PACKAGING_BOM);
  setLocal(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  setLocal(STORAGE_KEYS.PLANS, INITIAL_PLANS);
};

export const dataService = {
  // ==================== COUNTRIES ====================
  async getCountries() {
    if (!isUsingMock() && supabase) {
      const { data, error } = await supabase.from('countries').select('*').order('country_name');
      if (!error && data) return data;
    }
    return getLocal(STORAGE_KEYS.COUNTRIES, INITIAL_COUNTRIES);
  },

  async saveCountry(country) {
    if (!isUsingMock() && supabase) {
      const { data, error } = await supabase.from('countries').upsert([country]).select();
      if (!error && data) return data[0];
    }
    const list = getLocal(STORAGE_KEYS.COUNTRIES, INITIAL_COUNTRIES);
    let updated;
    if (country.id) {
      updated = list.map(c => c.id === country.id ? { ...c, ...country } : c);
    } else {
      const newCountry = { ...country, id: `cnt-${Date.now()}` };
      updated = [newCountry, ...list];
    }
    setLocal(STORAGE_KEYS.COUNTRIES, updated);
    return country;
  },

  async deleteCountry(id) {
    if (!isUsingMock() && supabase) {
      await supabase.from('countries').delete().eq('id', id);
    }
    const list = getLocal(STORAGE_KEYS.COUNTRIES, INITIAL_COUNTRIES);
    setLocal(STORAGE_KEYS.COUNTRIES, list.filter(c => c.id !== id));
    return true;
  },

  // ==================== SKUs ====================
  async getSkus() {
    if (!isUsingMock() && supabase) {
      const { data, error } = await supabase.from('sku_pack_size_master').select('*').order('sku_id');
      if (!error && data) return data;
    }
    return getLocal(STORAGE_KEYS.SKUS, INITIAL_SKUS);
  },

  async saveSku(sku) {
    if (!isUsingMock() && supabase) {
      const { data, error } = await supabase.from('sku_pack_size_master').upsert([sku]).select();
      if (!error && data) return data[0];
    }
    const list = getLocal(STORAGE_KEYS.SKUS, INITIAL_SKUS);
    let updated;
    const existingIndex = list.findIndex(s => s.id === sku.id || s.sku_id === sku.sku_id);
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...updated[existingIndex], ...sku };
    } else {
      const newSku = { ...sku, id: sku.id || `sku-${Date.now()}` };
      updated = [newSku, ...list];
    }
    setLocal(STORAGE_KEYS.SKUS, updated);
    return sku;
  },

  async deleteSku(id) {
    if (!isUsingMock() && supabase) {
      await supabase.from('sku_pack_size_master').delete().eq('id', id);
    }
    const list = getLocal(STORAGE_KEYS.SKUS, INITIAL_SKUS);
    setLocal(STORAGE_KEYS.SKUS, list.filter(s => s.id !== id && s.sku_id !== id));
    return true;
  },

  // ==================== CAPACITY MASTER ====================
  async getCapacity() {
    if (!isUsingMock() && supabase) {
      const { data, error } = await supabase.from('capacity_master').select('*').order('base_product');
      if (!error && data) return data;
    }
    return getLocal(STORAGE_KEYS.CAPACITY, INITIAL_CAPACITY);
  },

  async saveCapacity(cap) {
    if (!isUsingMock() && supabase) {
      const { data, error } = await supabase.from('capacity_master').upsert([cap]).select();
      if (!error && data) return data[0];
    }
    const list = getLocal(STORAGE_KEYS.CAPACITY, INITIAL_CAPACITY);
    let updated;
    const existingIndex = list.findIndex(c => c.id === cap.id || c.base_product === cap.base_product);
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...updated[existingIndex], ...cap };
    } else {
      const newCap = { ...cap, id: cap.id || `cap-${Date.now()}` };
      updated = [newCap, ...list];
    }
    setLocal(STORAGE_KEYS.CAPACITY, updated);
    return cap;
  },

  async deleteCapacity(id) {
    if (!isUsingMock() && supabase) {
      await supabase.from('capacity_master').delete().eq('id', id);
    }
    const list = getLocal(STORAGE_KEYS.CAPACITY, INITIAL_CAPACITY);
    setLocal(STORAGE_KEYS.CAPACITY, list.filter(c => c.id !== id));
    return true;
  },

  // ==================== RECIPE BOM ====================
  async getRecipeBom(baseProduct = null) {
    if (!isUsingMock() && supabase) {
      let query = supabase.from('recipe_bom').select('*');
      if (baseProduct) query = query.eq('base_product', baseProduct);
      const { data, error } = await query;
      if (!error && data) return data;
    }
    const list = getLocal(STORAGE_KEYS.RECIPE_BOM, INITIAL_RECIPE_BOM);
    if (baseProduct) {
      return list.filter(r => r.base_product.toLowerCase() === baseProduct.toLowerCase());
    }
    return list;
  },

  async saveRecipeBomItem(item) {
    if (!isUsingMock() && supabase) {
      const { data, error } = await supabase.from('recipe_bom').upsert([item]).select();
      if (!error && data) return data[0];
    }
    const list = getLocal(STORAGE_KEYS.RECIPE_BOM, INITIAL_RECIPE_BOM);
    let updated;
    const existingIndex = list.findIndex(r => r.id === item.id);
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...updated[existingIndex], ...item };
    } else {
      const newItem = { ...item, id: item.id || `rcp-${Date.now()}` };
      updated = [newItem, ...list];
    }
    setLocal(STORAGE_KEYS.RECIPE_BOM, updated);
    return item;
  },

  async deleteRecipeBomItem(id) {
    if (!isUsingMock() && supabase) {
      await supabase.from('recipe_bom').delete().eq('id', id);
    }
    const list = getLocal(STORAGE_KEYS.RECIPE_BOM, INITIAL_RECIPE_BOM);
    setLocal(STORAGE_KEYS.RECIPE_BOM, list.filter(r => r.id !== id));
    return true;
  },

  // ==================== PACKAGING BOM ====================
  async getPackagingBom(skuId = null) {
    if (!isUsingMock() && supabase) {
      let query = supabase.from('packaging_bom').select('*');
      if (skuId) query = query.eq('sku_id', skuId);
      const { data, error } = await query;
      if (!error && data) return data;
    }
    const list = getLocal(STORAGE_KEYS.PACKAGING_BOM, INITIAL_PACKAGING_BOM);
    if (skuId) {
      return list.filter(p => p.sku_id === skuId);
    }
    return list;
  },

  async savePackagingBomItem(item) {
    if (!isUsingMock() && supabase) {
      const { data, error } = await supabase.from('packaging_bom').upsert([item]).select();
      if (!error && data) return data[0];
    }
    const list = getLocal(STORAGE_KEYS.PACKAGING_BOM, INITIAL_PACKAGING_BOM);
    let updated;
    const existingIndex = list.findIndex(p => p.id === item.id);
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...updated[existingIndex], ...item };
    } else {
      const newItem = { ...item, id: item.id || `pkg-${Date.now()}` };
      updated = [newItem, ...list];
    }
    setLocal(STORAGE_KEYS.PACKAGING_BOM, updated);
    return item;
  },

  async deletePackagingBomItem(id) {
    if (!isUsingMock() && supabase) {
      await supabase.from('packaging_bom').delete().eq('id', id);
    }
    const list = getLocal(STORAGE_KEYS.PACKAGING_BOM, INITIAL_PACKAGING_BOM);
    setLocal(STORAGE_KEYS.PACKAGING_BOM, list.filter(p => p.id !== id));
    return true;
  },

  // ==================== STAFF SUMMARY ====================
  async getStaff() {
    if (!isUsingMock() && supabase) {
      const { data, error } = await supabase.from('staff_summary').select('*').order('staff_name');
      if (!error && data) return data;
    }
    return getLocal(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  },

  async saveStaff(staffMember) {
    if (!isUsingMock() && supabase) {
      const { data, error } = await supabase.from('staff_summary').upsert([staffMember]).select();
      if (!error && data) return data[0];
    }
    const list = getLocal(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    let updated;
    const existingIndex = list.findIndex(s => s.id === staffMember.id);
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...updated[existingIndex], ...staffMember };
    } else {
      const newStaff = { ...staffMember, id: staffMember.id || `stf-${Date.now()}` };
      updated = [newStaff, ...list];
    }
    setLocal(STORAGE_KEYS.STAFF, updated);
    return staffMember;
  },

  async deleteStaff(id) {
    if (!isUsingMock() && supabase) {
      await supabase.from('staff_summary').delete().eq('id', id);
    }
    const list = getLocal(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    setLocal(STORAGE_KEYS.STAFF, list.filter(s => s.id !== id));
    return true;
  },

  // ==================== PRODUCTION PLANS ====================
  async getProductionPlans() {
    if (!isUsingMock() && supabase) {
      const { data, error } = await supabase
        .from('production_plans')
        .select(`
          *,
          raw_materials:production_plan_raw_materials(*),
          packaging:production_plan_packaging(*)
        `)
        .order('production_date', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal(STORAGE_KEYS.PLANS, INITIAL_PLANS);
  },

  async getProductionPlanById(id) {
    if (!isUsingMock() && supabase) {
      const { data, error } = await supabase
        .from('production_plans')
        .select(`
          *,
          raw_materials:production_plan_raw_materials(*),
          packaging:production_plan_packaging(*)
        `)
        .eq('id', id)
        .single();
      if (!error && data) return data;
    }
    const list = getLocal(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    return list.find(p => p.id === id || p.plan_number === id) || null;
  },

  async saveProductionPlan(plan) {
    const planNumber = plan.plan_number || `PP-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const newId = plan.id || `pln-${Date.now()}`;
    const createdAt = plan.created_at || new Date().toISOString();

    const planRecord = {
      ...plan,
      id: newId,
      plan_number: planNumber,
      created_at: createdAt,
      status: plan.status || 'Planned'
    };

    if (!isUsingMock() && supabase) {
      const isValidUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

      const dbPayload = {
        plan_number: planNumber,
        country_id: isValidUuid(plan.country_id) ? plan.country_id : null,
        country_name: plan.country_name,
        sku_id: plan.sku_id,
        sku_name: plan.sku_name,
        base_product: plan.base_product,
        pack_size_g: plan.pack_size_g,
        order_quantity_boxes: plan.order_quantity_boxes,
        packets_required: plan.packets_required,
        finished_goods_weight_kg: plan.finished_goods_weight_kg,
        selected_chef_quantity: plan.selected_chef_quantity,
        available_capacity_per_day: plan.available_capacity_per_day,
        production_batches: plan.production_batches,
        target_production_quantity: plan.target_production_quantity,
        production_hours: plan.production_hours,
        required_staff: plan.required_staff,
        production_date: plan.production_date,
        status: plan.status || 'Planned',
        estimated_raw_material_cost: plan.estimated_raw_material_cost,
        estimated_packaging_cost: plan.estimated_packaging_cost,
        total_material_cost: plan.total_material_cost,
        notes: plan.notes
      };

      if (isValidUuid(plan.id)) {
        dbPayload.id = plan.id;
      }

      const { data: savedPlan, error } = await supabase
        .from('production_plans')
        .upsert([dbPayload])
        .select();

      if (!error && savedPlan && savedPlan.length > 0) {
        const planDbId = savedPlan[0].id;
        planRecord.id = planDbId;

        // Save snapshots
        if (plan.raw_material_snapshots?.length) {
          const rawItems = plan.raw_material_snapshots.map(r => ({
            production_plan_id: planDbId,
            raw_material: r.raw_material,
            quantity: r.quantity,
            uom: r.uom,
            unit_cost: r.unit_cost,
            estimated_cost: r.estimated_cost
          }));
          await supabase.from('production_plan_raw_materials').insert(rawItems);
        }

        if (plan.packaging_snapshots?.length) {
          const packItems = plan.packaging_snapshots.map(p => ({
            production_plan_id: planDbId,
            packaging_material: p.packaging_material,
            quantity: p.quantity,
            uom: p.uom,
            unit_cost: p.unit_cost,
            estimated_cost: p.estimated_cost
          }));
          await supabase.from('production_plan_packaging').insert(packItems);
        }

        return planRecord;
      } else if (error) {
        console.warn('Supabase plan save error, falling back to local storage:', error);
      }
    }

    // Local Storage Mock Save
    const list = getLocal(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    const existingIndex = list.findIndex(p => p.id === planRecord.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = planRecord;
    } else {
      updated = [planRecord, ...list];
    }
    setLocal(STORAGE_KEYS.PLANS, updated);
    return planRecord;
  },

  async updatePlanStatus(id, newStatus) {
    if (!isUsingMock() && supabase) {
      await supabase.from('production_plans').update({ status: newStatus }).eq('id', id);
    }
    const list = getLocal(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    const updated = list.map(p => p.id === id ? { ...p, status: newStatus } : p);
    setLocal(STORAGE_KEYS.PLANS, updated);
    return true;
  },

  async deleteProductionPlan(id) {
    if (!isUsingMock() && supabase) {
      await supabase.from('production_plans').delete().eq('id', id);
    }
    const list = getLocal(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    setLocal(STORAGE_KEYS.PLANS, list.filter(p => p.id !== id));
    return true;
  },

  // ==================== USERS & ROLES ====================
  async getUsers() {
    let rawList = [];
    if (!isUsingMock() && supabase) {
      try {
        const { data, error } = await supabase.from('app_users').select('*').order('full_name');
        if (!error && data && data.length > 0) {
          rawList = data;
        }
      } catch (err) {
        console.warn('Error querying Supabase app_users:', err);
      }
    }

    if (rawList.length === 0) {
      rawList = getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
    }

    // Ensure factory initial accounts are always present in the returned list
    for (const init of INITIAL_USERS) {
      if (!rawList.some(u => (u.email || '').trim().toLowerCase() === init.email.trim().toLowerCase())) {
        rawList.push(init);
      }
    }

    // Attach password_hash to each user from the credential store or defaults
    const credStore = getCredentialStore();
    const resolved = rawList.map(u => {
      const emailKey = (u.email || '').trim().toLowerCase();
      const hash = credStore[emailKey] || u.password_hash || DEFAULT_CREDENTIALS[emailKey] || '';
      return {
        ...u,
        password_hash: hash,
        avatar: u.avatar || (u.full_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      };
    });

    return resolved;
  },

  async saveUser(user) {
    const userPayload = { ...user };
    const emailKey = (userPayload.email || '').trim().toLowerCase();
    
    // Hash password if plain password was supplied and save into credentials store
    if (userPayload.password && userPayload.password.trim()) {
      const newHash = await hashPassword(userPayload.password.trim());
      setCredential(emailKey, newHash);
      userPayload.password_hash = newHash;
      delete userPayload.password;
    } else if (userPayload.password_hash) {
      setCredential(emailKey, userPayload.password_hash);
    }

    // When saving to Supabase, omit password and password_hash to prevent schema column error
    if (!isUsingMock() && supabase) {
      const supabasePayload = {
        full_name: userPayload.full_name,
        email: userPayload.email,
        role: userPayload.role,
        is_active: userPayload.is_active !== false
      };
      if (userPayload.id && !userPayload.id.startsWith('usr-')) {
        supabasePayload.id = userPayload.id;
      }
      try {
        const { data, error } = await supabase.from('app_users').upsert([supabasePayload]).select();
        if (!error && data && data[0]) {
          userPayload.id = data[0].id;
        }
      } catch (err) {
        console.warn('Supabase app_users upsert warning:', err);
      }
    }

    const list = getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
    let updated;
    const existingIndex = list.findIndex(u => u.id === userPayload.id || (u.email || '').toLowerCase() === emailKey);
    
    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      const preservedHash = userPayload.password_hash || existing.password_hash || getCredentialStore()[emailKey];
      updated = [...list];
      updated[existingIndex] = {
        ...existing,
        ...userPayload,
        password_hash: preservedHash
      };
    } else {
      const initials = (userPayload.full_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const newUser = { 
        ...userPayload, 
        id: userPayload.id || `usr-${Date.now()}`, 
        avatar: initials,
        is_active: userPayload.is_active !== false,
        password_hash: userPayload.password_hash || getCredentialStore()[emailKey]
      };
      updated = [newUser, ...list];
    }

    setLocal(STORAGE_KEYS.USERS, updated);
    return userPayload;
  },

  async deleteUser(id) {
    const list = getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
    const userToDelete = list.find(u => u.id === id);

    // Prevent deleting the last remaining admin
    if (userToDelete?.role === 'admin') {
      const remainingAdmins = list.filter(u => u.role === 'admin' && u.id !== id && u.is_active !== false);
      if (remainingAdmins.length === 0) {
        throw new Error('Cannot delete the last active Administrator account.');
      }
    }

    if (!isUsingMock() && supabase) {
      await supabase.from('app_users').delete().eq('id', id);
    }

    setLocal(STORAGE_KEYS.USERS, list.filter(u => u.id !== id));
    return true;
  }

};
