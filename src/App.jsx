import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import Toast from './components/common/Toast';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreatePlanPage from './pages/CreatePlanPage';
import ProductionPlansPage from './pages/ProductionPlansPage';
import PlanDetailsPage from './pages/PlanDetailsPage';
import SkuMasterPage from './pages/SkuMasterPage';
import RecipeBomPage from './pages/RecipeBomPage';
import PackagingBomPage from './pages/PackagingBomPage';
import CapacityMasterPage from './pages/CapacityMasterPage';
import StaffSummaryPage from './pages/StaffSummaryPage';
import CountriesPage from './pages/CountriesPage';
import ImportDataPage from './pages/ImportDataPage';
import UsersRolesPage from './pages/UsersRolesPage';

import { dataService, resetLocalDatabase, isUsingMock, setForceMock } from './services/dataService';
import { getSessionUser, clearSession } from './services/authService';

export default function App() {
  // Navigation & Auth State
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(() => {
    return getSessionUser() || null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!getSessionUser();
  });


  // Selected Plan for PlanDetailsPage
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Master Data State
  const [countries, setCountries] = useState([]);
  const [skus, setSkus] = useState([]);
  const [capacityList, setCapacityList] = useState([]);
  const [recipeBom, setRecipeBom] = useState([]);
  const [packagingBom, setPackagingBom] = useState([]);
  const [staff, setStaff] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = null) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Load all master data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        cntData,
        skuData,
        capData,
        rcpData,
        pkgData,
        stfData,
        plnData,
        usrData
      ] = await Promise.all([
        dataService.getCountries(),
        dataService.getSkus(),
        dataService.getCapacity(),
        dataService.getRecipeBom(),
        dataService.getPackagingBom(),
        dataService.getStaff(),
        dataService.getProductionPlans(),
        dataService.getUsers()
      ]);

      setCountries(cntData || []);
      setSkus(skuData || []);
      setCapacityList(capData || []);
      setRecipeBom(rcpData || []);
      setPackagingBom(pkgData || []);
      setStaff(stfData || []);
      setPlans(plnData || []);
      setUsers(usrData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      addToast('Failed to load initial data. Check console.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Role Switcher for live demo
  const handleRoleChange = (newRole) => {
    setCurrentUser(prev => ({ ...prev, role: newRole }));
    addToast(`Switched active role to "${newRole.replace('_', ' ')}". Permissions updated.`, 'info');
  };

  // Reset Demo Data
  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to default factory seed? Any added plans or edits will be restored.')) {
      resetLocalDatabase();
      loadData();
      addToast('Demo database successfully reset to factory seed values.', 'success');
    }
  };

  const handleToggleDbMode = () => {
    const currentlyMock = isUsingMock();
    setForceMock(!currentlyMock);
    loadData();
    addToast(currentlyMock ? 'Switched to Live Supabase DB connection.' : 'Switched to Local Demo Mode.', 'info');
  };

  // ==================== ACTIONS ====================

  // Production Plan Actions
  const handleSavePlan = async (planPayload) => {
    try {
      const saved = await dataService.saveProductionPlan(planPayload);
      setPlans(prev => [saved, ...prev.filter(p => p.id !== saved.id)]);
      setSelectedPlan(saved);
      addToast(`Production plan ${saved.plan_number} successfully scheduled!`, 'success', 'Plan Created');
      setCurrentRoute('plan-details');
    } catch (err) {
      addToast(err.message || 'Error saving plan', 'error');
    }
  };

  const handleUpdatePlanStatus = async (planId, newStatus) => {
    try {
      await dataService.updatePlanStatus(planId, newStatus);
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, status: newStatus } : p));
      if (selectedPlan?.id === planId) {
        setSelectedPlan(prev => ({ ...prev, status: newStatus }));
      }
      addToast(`Plan status updated to "${newStatus}".`, 'success');
    } catch (err) {
      addToast(err.message || 'Error updating status', 'error');
    }
  };

  // SKU Actions
  const handleSaveSku = async (sku) => {
    try {
      await dataService.saveSku(sku);
      setSkus(prev => {
        const idx = prev.findIndex(s => s.id === sku.id || s.sku_id === sku.sku_id);
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = { ...arr[idx], ...sku };
          return arr;
        }
        return [sku, ...prev];
      });
      addToast(`SKU "${sku.sku_id}" saved successfully.`, 'success');
    } catch (err) {
      addToast(err.message || 'Error saving SKU', 'error');
    }
  };

  const handleDeleteSku = async (id) => {
    if (!window.confirm('Delete this SKU?')) return;
    try {
      await dataService.deleteSku(id);
      setSkus(prev => prev.filter(s => s.id !== id && s.sku_id !== id));
      addToast('SKU deleted.', 'info');
    } catch (err) {
      addToast(err.message || 'Error deleting SKU', 'error');
    }
  };

  // Recipe BOM Actions
  const handleSaveRecipeItem = async (itemOrItems) => {
    try {
      const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
      const savedList = [];
      for (const item of items) {
        const saved = await dataService.saveRecipeBomItem(item);
        savedList.push(saved || item);
      }
      setRecipeBom(prev => {
        let arr = [...prev];
        for (const item of savedList) {
          const idx = arr.findIndex(r => r.id === item.id);
          if (idx >= 0) {
            arr[idx] = { ...arr[idx], ...item };
          } else {
            arr = [item, ...arr];
          }
        }
        return arr;
      });
      addToast(
        items.length > 1
          ? `Added ${items.length} ingredients to "${items[0]?.base_product}" successfully!`
          : `Ingredient "${items[0]?.raw_material}" saved.`,
        'success'
      );
    } catch (err) {
      addToast(err.message || 'Error saving recipe item', 'error');
    }
  };

  const handleDeleteRecipeItem = async (id) => {
    if (!window.confirm('Remove ingredient from recipe BOM?')) return;
    try {
      await dataService.deleteRecipeBomItem(id);
      setRecipeBom(prev => prev.filter(r => r.id !== id));
      addToast('Ingredient removed.', 'info');
    } catch (err) {
      addToast(err.message || 'Error deleting recipe item', 'error');
    }
  };

  // Packaging BOM Actions
  const handleSavePackagingItem = async (item) => {
    try {
      await dataService.savePackagingBomItem(item);
      setPackagingBom(prev => {
        const idx = prev.findIndex(p => p.id === item.id);
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = { ...arr[idx], ...item };
          return arr;
        }
        return [item, ...prev];
      });
      addToast(`Packaging material "${item.packaging_material}" saved.`, 'success');
    } catch (err) {
      addToast(err.message || 'Error saving packaging material', 'error');
    }
  };

  const handleDeletePackagingItem = async (id) => {
    if (!window.confirm('Remove material from packaging BOM?')) return;
    try {
      await dataService.deletePackagingBomItem(id);
      setPackagingBom(prev => prev.filter(p => p.id !== id));
      addToast('Packaging material removed.', 'info');
    } catch (err) {
      addToast(err.message || 'Error deleting packaging material', 'error');
    }
  };

  // Capacity Actions
  const handleSaveCapacity = async (cap) => {
    try {
      await dataService.saveCapacity(cap);
      setCapacityList(prev => {
        const idx = prev.findIndex(c => c.id === cap.id || c.base_product === cap.base_product);
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = { ...arr[idx], ...cap };
          return arr;
        }
        return [cap, ...prev];
      });
      addToast(`Capacity for "${cap.base_product}" updated.`, 'success');
    } catch (err) {
      addToast(err.message || 'Error saving capacity', 'error');
    }
  };

  const handleDeleteCapacity = async (id) => {
    if (!window.confirm('Delete capacity configuration?')) return;
    try {
      await dataService.deleteCapacity(id);
      setCapacityList(prev => prev.filter(c => c.id !== id && c.base_product !== id));
      addToast('Capacity configuration deleted.', 'info');
    } catch (err) {
      addToast(err.message || 'Error deleting capacity', 'error');
    }
  };

  // Staff Actions
  const handleSaveStaff = async (member) => {
    try {
      await dataService.saveStaff(member);
      setStaff(prev => {
        const idx = prev.findIndex(s => s.id === member.id);
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = { ...arr[idx], ...member };
          return arr;
        }
        return [member, ...prev];
      });
      addToast(`Staff record for "${member.staff_name}" saved.`, 'success');
    } catch (err) {
      addToast(err.message || 'Error saving staff', 'error');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Delete personnel record?')) return;
    try {
      await dataService.deleteStaff(id);
      setStaff(prev => prev.filter(s => s.id !== id));
      addToast('Staff member deleted.', 'info');
    } catch (err) {
      addToast(err.message || 'Error deleting staff', 'error');
    }
  };

  // Country Actions
  const handleSaveCountry = async (country) => {
    try {
      await dataService.saveCountry(country);
      setCountries(prev => {
        const idx = prev.findIndex(c => c.id === country.id);
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = { ...arr[idx], ...country };
          return arr;
        }
        return [country, ...prev];
      });
      addToast(`Country "${country.country_name}" saved.`, 'success');
    } catch (err) {
      addToast(err.message || 'Error saving country', 'error');
    }
  };

  const handleDeleteCountry = async (id) => {
    if (!window.confirm('Delete country?')) return;
    try {
      await dataService.deleteCountry(id);
      setCountries(prev => prev.filter(c => c.id !== id));
      addToast('Country deleted.', 'info');
    } catch (err) {
      addToast(err.message || 'Error deleting country', 'error');
    }
  };

  // User Actions
  const handleSaveUser = async (user) => {
    try {
      await dataService.saveUser(user);
      setUsers(prev => {
        const idx = prev.findIndex(u => u.id === user.id || u.email === user.email);
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = { ...arr[idx], ...user };
          return arr;
        }
        return [user, ...prev];
      });
      addToast(`User account "${user.email}" updated.`, 'success');
    } catch (err) {
      addToast(err.message || 'Error saving user', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete user account?')) return;
    try {
      await dataService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      addToast('User deleted.', 'info');
    } catch (err) {
      addToast(err.message || 'Error deleting user', 'error');
    }
  };

  // Bulk CSV Import Action
  const handleBulkImport = async (type, items) => {
    try {
      if (type === 'sku') {
        for (const item of items) await dataService.saveSku(item);
      } else if (type === 'recipe_bom') {
        for (const item of items) await dataService.saveRecipeBomItem(item);
      } else if (type === 'packaging_bom') {
        for (const item of items) await dataService.savePackagingBomItem(item);
      } else if (type === 'capacity') {
        for (const item of items) await dataService.saveCapacity(item);
      } else if (type === 'staff') {
        for (const item of items) await dataService.saveStaff(item);
      } else if (type === 'countries') {
        for (const item of items) await dataService.saveCountry(item);
      }
      await loadData();
      addToast(`Imported ${items.length} records successfully!`, 'success');
    } catch (err) {
      addToast(err.message || 'Error executing bulk import', 'error');
    }
  };

  // Role-guarded route navigation
  const handleNavigate = useCallback((route) => {
    if ((route === 'users-roles' || route === 'import-data') && currentUser?.role !== 'admin') {
      addToast('Restricted: Administrator privileges required.', 'error');
      return;
    }
    if (route === 'create-plan' && currentUser?.role === 'viewer') {
      addToast('Restricted: View-only accounts cannot create production plans.', 'error');
      return;
    }
    setCurrentRoute(route);
  }, [currentUser, addToast]);

  if (!isAuthenticated || !currentUser) {
    return <LoginPage onLoginSuccess={(user) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
      addToast(`Welcome back, ${user.full_name}!`, 'success');
    }} />;
  }

  const pendingPlansCount = plans.filter(p => p.status === 'Planned' || p.status === 'In Production').length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        pendingPlansCount={pendingPlansCount}
      />

      {/* Main Layout Area */}
      <div className="main-layout">
        <TopNav
          currentRoute={currentRoute}
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          onLogout={() => {
            clearSession();
            setCurrentUser(null);
            setIsAuthenticated(false);
            setCurrentRoute('dashboard');
            addToast('Signed out of secure session.', 'info');
          }}
        />


        <main className="page-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-500)' }}>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>Loading manufacturing records...</div>
            </div>
          ) : (
            <>
              {currentRoute === 'dashboard' && (
                <DashboardPage
                  plans={plans}
                  skus={skus}
                  onNavigate={handleNavigate}
                  onSelectPlan={(plan) => {
                    setSelectedPlan(plan);
                    handleNavigate('plan-details');
                  }}
                />
              )}

              {currentRoute === 'create-plan' && currentUser?.role !== 'viewer' && (
                <CreatePlanPage
                  countries={countries}
                  skus={skus}
                  capacityList={capacityList}
                  recipeBomList={recipeBom}
                  packagingBomList={packagingBom}
                  staffList={staff}
                  onSavePlan={handleSavePlan}
                  onNavigate={handleNavigate}
                />
              )}

              {currentRoute === 'production-plans' && (
                <ProductionPlansPage
                  plans={plans}
                  countries={countries}
                  skus={skus}
                  onSelectPlan={(plan) => {
                    setSelectedPlan(plan);
                    handleNavigate('plan-details');
                  }}
                  onUpdateStatus={handleUpdatePlanStatus}
                  onNavigate={handleNavigate}
                  currentUser={currentUser}
                />
              )}

              {currentRoute === 'plan-details' && (
                <PlanDetailsPage
                  plan={selectedPlan}
                  onBack={() => handleNavigate('production-plans')}
                  onUpdateStatus={handleUpdatePlanStatus}
                  currentUser={currentUser}
                />
              )}

              {currentRoute === 'sku-master' && (
                <SkuMasterPage
                  skus={skus}
                  recipeBom={recipeBom}
                  capacityList={capacityList}
                  onSaveSku={handleSaveSku}
                  onDeleteSku={handleDeleteSku}
                  currentUser={currentUser}
                />
              )}

              {currentRoute === 'recipe-bom' && (
                <RecipeBomPage
                  recipeBom={recipeBom}
                  skus={skus}
                  capacityList={capacityList}
                  onSaveItem={handleSaveRecipeItem}
                  onDeleteItem={handleDeleteRecipeItem}
                  currentUser={currentUser}
                />
              )}

              {currentRoute === 'packaging-bom' && (
                <PackagingBomPage
                  packagingBom={packagingBom}
                  skus={skus}
                  onSaveItem={handleSavePackagingItem}
                  onDeleteItem={handleDeletePackagingItem}
                  currentUser={currentUser}
                />
              )}

              {currentRoute === 'capacity-master' && (
                <CapacityMasterPage
                  capacityList={capacityList}
                  onSaveCapacity={handleSaveCapacity}
                  onDeleteCapacity={handleDeleteCapacity}
                  currentUser={currentUser}
                />
              )}

              {currentRoute === 'staff-summary' && (
                <StaffSummaryPage
                  staff={staff}
                  onSaveStaff={handleSaveStaff}
                  onDeleteStaff={handleDeleteStaff}
                  currentUser={currentUser}
                />
              )}

              {currentRoute === 'countries' && (
                <CountriesPage
                  countries={countries}
                  onSaveCountry={handleSaveCountry}
                  onDeleteCountry={handleDeleteCountry}
                  currentUser={currentUser}
                />
              )}

              {currentRoute === 'import-data' && currentUser?.role === 'admin' && (
                <ImportDataPage
                  onBulkImport={handleBulkImport}
                  onNavigate={handleNavigate}
                />
              )}

              {currentRoute === 'users-roles' && currentUser?.role === 'admin' && (
                <UsersRolesPage
                  users={users}
                  onSaveUser={handleSaveUser}
                  onDeleteUser={handleDeleteUser}
                  currentUser={currentUser}
                />
              )}

            </>
          )}
        </main>
      </div>

      {/* Floating Toast Notification Stack */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
