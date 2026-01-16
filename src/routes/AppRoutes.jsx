import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import OwnerRoute from "./OwnerRoute";

//Registro o Login
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";

//Administrador
import Dashboard from "../pages/admin/Dashboard";

//Restaurantes
import MyRestaurants from "../pages/restaurant/MyRestaurants";
import RestaurantCreate from "../pages/restaurant/RestaurantCreate";
import RestaurantEdit from "../pages/restaurant/RestaurantEdit";

//Sucursale
import BranchCreate from "../pages/restaurant/BranchCreate";
import BranchEdit from "../pages/restaurant/BranchEdit";

export default function AppRoutes() {
  return (
    <Routes>
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

        <Route path="/owner/restaurants/:restaurantId/branches/new" element={<BranchCreate />} />
        <Route path="/owner/restaurants/:restaurantId/branches/:branchId/edit" element={<BranchEdit />} />
        
      </Route>
      
      
      {/* Default */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}
