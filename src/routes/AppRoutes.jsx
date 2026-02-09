import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import OwnerRoute from "./OwnerRoute";

// Home (nueva página principal)
//import Home from "../pages/public/Home";// ajusta la ruta si tu carpeta es otra

//Registro o Login
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";

//Administrador
import Dashboard from "../pages/admin/Dashboard";

//Restaurantes
import MyRestaurants from "../pages/restaurant/MyRestaurants";
import RestaurantCreate from "../pages/restaurant/RestaurantCreate";
import RestaurantEdit from "../pages/restaurant/RestaurantEdit";
import RestaurantSettings from "../pages/restaurant/RestaurantSettings";

//Sucursales
import BranchCreate from "../pages/restaurant/BranchCreate";
import BranchEdit from "../pages/restaurant/BranchEdit";

//Menu y así
import MenuManager from "../pages/menu/MenuManager";
import ProductsPage from "../pages/products/ProductsPage";
import ProductVariantsPage from "../pages/products/products_variants/ProductVariantsPage";
import ProductCompositionPage from "../pages/products/ProductCompositionPage";


import BranchCatalogPage from "../pages/restaurant/catalog/BranchCatalogPage";
import SalesChannelsPage from "../pages/sales_channels/SalesChannelsPage";
import BranchSalesChannelsPage from "../pages/sales_channels/BranchSalesChannelsPage";
import ChannelProductsConfigPage from "../pages/sales_channels/ChannelsProductsConfigPage";

//Inventario
import IngredientsPage from "../pages/inventory/IngredientsPage";
import IngredientPresentationsPage from "../pages/inventory/IngredientPresentationsPage";
import ProductRecipesPage from "../pages/menu/ProductRecipesPage";



//Planes
import RestaurantPlans from "../pages/owner/RestaurantPlans";


export default function AppRoutes() {
  return (
    <Routes>
      {/* Home */}
     
      {/* Registros */}
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/login" element={<Login />} />

      {/* Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<Dashboard />} />
      </Route>


      {/* Restaurantes */}
      <Route element={<OwnerRoute />}>
        <Route path="/owner/restaurants" element={<MyRestaurants />} />
        <Route path="/owner/restaurants/new" element={<RestaurantCreate />} />
        <Route path="/owner/restaurants/:id/edit" element={<RestaurantEdit />} />

        <Route path="/owner/restaurants/:restaurantId/settings" element={<RestaurantSettings />} />

        <Route path="/owner/restaurants/:restaurantId/plans" element={<RestaurantPlans />} />
        
        <Route path="/owner/restaurants/:restaurantId/branches/new" element={<BranchCreate />} />
        <Route path="/owner/restaurants/:restaurantId/branches/:branchId/edit" element={<BranchEdit />} />

        <Route path="/owner/restaurants/:restaurantId/menu" element={<MenuManager />} />
        <Route path="/owner/restaurants/:restaurantId/products" element={<ProductsPage />} />
        <Route path="/owner/restaurants/:restaurantId/products/:productId/components" element={<ProductCompositionPage />}/>
        <Route path="/owner/restaurants/:restaurantId/products/:productId/variants"element={<ProductVariantsPage />}/>


        <Route path="/owner/restaurants/:restaurantId/sales-channels" element={<SalesChannelsPage /> }/>
        <Route path="/owner/restaurants/:restaurantId/branches/:branchId/sales-channels" element={<BranchSalesChannelsPage />} />
        <Route path="/owner/restaurants/:restaurantId/branches/:branchId/sales-channels/:salesChannelId/products" element={<ChannelProductsConfigPage />} />

        <Route path="/owner/restaurants/:restaurantId/branches/:branchId/catalog" element={<BranchCatalogPage />} />

        <Route path="/owner/restaurants/:restaurantId/settings/ingredients" element={<IngredientsPage />} />
        <Route path="/owner/restaurants/:restaurantId/settings/ingredients/:ingredientId/presentations" element={<IngredientPresentationsPage />} />

        <Route path="/owner/restaurants/:restaurantId/products/:productId/recipes" element={<ProductRecipesPage />} />

      </Route>
      
      
      {/* Default */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}
