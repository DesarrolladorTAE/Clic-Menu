// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import OwnerRoute from "./OwnerRoute";
import StaffProtectedRoute from "./StaffProtectedRoute";

//Registro o Login OWNER
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";

//STAFF
import StaffLogin from "../pages/staff/StaffLogin";
import StaffSelectBranch from "../pages/staff/StaffSelectBranch";
import StaffDashboard from "../pages/staff/StaffDashboard"; 
import WaiterTablesGrid from "../pages/staff/waiter/WaiterTablesGrid";

//Administrador
import Dashboard from "../pages/admin/Dashboard";
import StaffPage from "../pages/staff/RestaurantStaffPage";

//Restaurantes
import MyRestaurants from "../pages/restaurant/MyRestaurants";
import RestaurantSettings from "../pages/restaurant/RestaurantSettings";

//Sucursales
import BranchCreate from "../pages/restaurant/BranchCreate";
import BranchEdit from "../pages/restaurant/BranchEdit";

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

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/menu/:token" element={<PublicMenuEntryPage />} />

      {/* OWNER AUTH */}
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/login" element={<Login />} />

      {/* STAFF AUTH */}
      <Route path="/staff/login" element={<StaffLogin />} />

      {/* STAFF PROTECTED */}
      <Route element={<StaffProtectedRoute />}>
        <Route path="/staff/select-branch" element={<StaffSelectBranch />} />
        <Route path="/staff/app" element={<StaffDashboard />} />
        <Route path="/staff/waiter/tables/grid" element={<WaiterTablesGrid />} />
      </Route>

      {/* OWNER PROTECTED */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<Dashboard />} />
      </Route>

      {/* OWNER ROUTES */}
      <Route element={<OwnerRoute />}>
        <Route path="/owner/restaurants" element={<MyRestaurants />} />
        <Route path="/owner/restaurants/:restaurantId/settings" element={<RestaurantSettings />} />
        <Route path="/owner/restaurants/:restaurantId/staff" element={<StaffPage />} />

        <Route path="/owner/restaurants/:restaurantId/plans" element={<RestaurantPlans />} />

        <Route path="/owner/restaurants/:restaurantId/branches/new" element={<BranchCreate />} />
        <Route path="/owner/restaurants/:restaurantId/branches/:branchId/edit" element={<BranchEdit />} />

        <Route path="/owner/restaurants/:restaurantId/menu" element={<MenuManager />} />
        <Route path="/owner/restaurants/:restaurantId/products" element={<ProductsPage />} />
        <Route
          path="/owner/restaurants/:restaurantId/products/:productId/components"
          element={<ProductCompositionPage />}
        />
        <Route
          path="/owner/restaurants/:restaurantId/products/:productId/variants"
          element={<ProductVariantsPage />}
        />

        <Route path="/owner/restaurants/:restaurantId/sales-channels" element={<SalesChannelsPage />} />
        <Route
          path="/owner/restaurants/:restaurantId/branches/:branchId/sales-channels"
          element={<BranchSalesChannelsPage />}
        />
        <Route
          path="/owner/restaurants/:restaurantId/branches/:branchId/sales-channels/:salesChannelId/products"
          element={<ChannelProductsConfigPage />}
        />

        <Route path="/owner/restaurants/:restaurantId/branches/:branchId/catalog" element={<BranchCatalogPage />} />

        <Route path="/owner/restaurants/:restaurantId/settings/ingredients" element={<IngredientsPage />} />
        <Route
          path="/owner/restaurants/:restaurantId/settings/ingredients/:ingredientId/presentations"
          element={<IngredientPresentationsPage />}
        />

        <Route path="/owner/restaurants/:restaurantId/products/:productId/recipes" element={<ProductRecipesPage />} />

        <Route path="/owner/restaurants/:restaurantId/branches/:branchId/tables" element={<BranchFloorPlanPage />} />

        <Route path="/owner/restaurants/:restaurantId/branches/:branchId/qr-codes" element={<BranchQrCodesPage />} />
      </Route>

      {/* DEFAULT */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}