// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import OwnerRoute from "./OwnerRoute";
import StaffProtectedRoute from "./StaffProtectedRoute";

import TestMui from "../pages/TestMui";


//Registro o Login OWNER
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";

//STAFF
import StaffLogin from "../pages/staff/StaffLogin";
import StaffSelectContext from "../pages/staff/StaffSelectContext";
import StaffDashboard from "../pages/staff/waiter/StaffDashboard"; 
import WaiterTablesGrid from "../pages/staff/waiter/WaiterTablesGrid";
import StaffMenuEntryPage from "../pages/staff/waiter/StaffMenuEntryPage";

import KitchenDashboard from "../pages/staff/kitchen/KitchenDashboard";

//Administrador
import Dashboard from "../pages/admin/Dashboard";
import StaffPage from "../pages/staff/RestaurantStaffPage";

//Restaurantes
import MyRestaurants from "../pages/restaurant/MyRestaurants";
import RestaurantEdit from "../pages/restaurant/RestaurantEdit";

//Menu 1
import RestaurantAdminLayout from "../layouts/RestaurantAdminLayout";
import RestaurantSettings from "../pages/restaurant/RestaurantSettings";

//Menu 2
import RestaurantOperationLayout from "../layouts/RestaurantOperationLayout";

import ModifierManager from "../pages/menu/ModifierManager";
import ProductModifierCatalogPage from "../pages/menu/modifiers/catalogs/ProductModifierCatalogPage";
import VariantModifierCatalogPage from "../pages/menu/modifiers/catalogs/VariantModifierCatalogPage";
import CompositeComponentModifierCatalogPage from "../pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage";
import CompositeComponentVariantModifierCatalogPage from "../pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage";


//Sucursales
import BranchesPage from "../pages/restaurant/BranchesPage";

//Menu y así
import MenuManager from "../pages/menu/MenuManager";
import ProductsPage from "../pages/products/ProductsPage";
import ProductVariantsPage from "../pages/products/products_variants/ProductVariantsPage";
import ProductCompositionPage from "../pages/products/ProductCompositionPage";
import ProductRecipesPage from "../pages/products/ProductRecipesPage";

import BranchCatalogPage from "../pages/restaurant/catalog/BranchCatalogPage";
import SalesChannelsPage from "../pages/sales_channels/SalesChannelsPage";
import BranchSalesChannelsPage from "../pages/sales_channels/BranchSalesChannelsPage";
import ChannelProductsConfigPage from "../pages/sales_channels/ChannelsProductsConfigPage";

//Inventario
import IngredientsPage from "../pages/inventory/IngredientsPage";
import IngredientPresentationsPage from "../pages/inventory/IngredientPresentationsPage";

//Piso
import BranchFloorPlanPage from "../pages/floor/BranchFloorPlanPage";

//Planes
import RestaurantPlans from "../pages/owner/RestaurantPlans";

import BranchQrCodesPage from "../pages/floor/BranchQrCodesPage";
import PublicMenuEntryPage from "../pages/public/PublicMenuEntryPage";

import TestEventPage from "../realtime/TestEventPage";
//PRUEBAAAS
import MyRestaurantsHome from "../pages/restaurant/MyRestaurantsHome";

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/menu/:token" element={<PublicMenuEntryPage />} />

      <Route path="/test-mui" element={<TestMui />} />

      <Route path="/test-event" element={<TestEventPage />} />

      {/* OWNER AUTH */}
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/login" element={<Login />} />

      {/* STAFF AUTH */}
      <Route path="/staff/login" element={<StaffLogin />} />

      {/* STAFF PROTECTED */}
      <Route element={<StaffProtectedRoute />}>
        <Route path="/staff/select-context" element={<StaffSelectContext />} />

        {/* Mesero*/}
        <Route path="/staff/app" element={<StaffDashboard />} />
        <Route path="/staff/waiter/tables/grid" element={<WaiterTablesGrid />} />
        <Route path="/staff/waiter/tables/:tableId/order" element={<StaffMenuEntryPage />} />

        {/* Cocina */}
        <Route path="/staff/kitchen" element={<KitchenDashboard />} />

      </Route>

      {/* OWNER PROTECTED */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<Dashboard />} />
      </Route>

      {/* OWNER ROUTES */}
      <Route element={<OwnerRoute />}>
        <Route path="/owner/restaurants-home" element={<MyRestaurantsHome />} /> 

        {/* Menu 1: Principal */}
        <Route path="/owner/restaurants/:restaurantId" element={<RestaurantAdminLayout />}>

          <Route path="edit-info" element={<RestaurantEdit />} />
          
          <Route path="settings" element={<RestaurantSettings />} />

          <Route path="branches" element={<BranchesPage />} />
          
          <Route path="sales-channels" element={<SalesChannelsPage />} />
        </Route>


        {/* Menu 2: Operación */}
        <Route path="/owner/restaurants/:restaurantId/operation" element={<RestaurantOperationLayout />}>
          <Route index element={<Navigate to="staff" replace />} />
          <Route path="staff" element={<StaffPage />} />

          <Route path="branch-sales-channels" element={<BranchSalesChannelsPage />} />
          <Route path="branches/:branchId/sales-channels/:salesChannelId/products" element={<ChannelProductsConfigPage />} />

          <Route path="ingredients" element={<IngredientsPage />} />
          <Route path="ingredients/:ingredientId/presentations" element={<IngredientPresentationsPage />} />

          <Route path="menu" element={<MenuManager />} />
          <Route path="menu/products" element={<ProductsPage />} />
          <Route path="menu/products/:productId/variants" element={<ProductVariantsPage />} />
          <Route path="menu/products/:productId/recipes" element={<ProductRecipesPage />} />
          <Route path="menu/products/:productId/components" element={<ProductCompositionPage />} />


          <Route path="modifiers" element={<ModifierManager />} />
          <Route path="modifiers/catalogs/products" element={<ProductModifierCatalogPage />} />
          <Route path="modifiers/catalogs/variants" element={<VariantModifierCatalogPage />} />
          <Route path="modifiers/catalogs/components" element={<CompositeComponentModifierCatalogPage />} />
          <Route path="modifiers/catalogs/component-variants" element={<CompositeComponentVariantModifierCatalogPage />} />

        </Route>


        <Route
          path="/owner/restaurants/:restaurantId/branches/:branchId/sales-channels/:salesChannelId/products"
          element={<ChannelProductsConfigPage />}
        />
        <Route path="/owner/restaurants" element={<MyRestaurants />} />



        <Route path="/owner/restaurants/:restaurantId/plans" element={<RestaurantPlans />} />


        
        


        <Route path="/owner/restaurants/:restaurantId/branches/:branchId/catalog" element={<BranchCatalogPage />} />

        <Route path="/owner/restaurants/:restaurantId/branches/:branchId/tables" element={<BranchFloorPlanPage />} />

        <Route path="/owner/restaurants/:restaurantId/branches/:branchId/qr-codes" element={<BranchQrCodesPage />} />
      </Route>

      {/* DEFAULT */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}