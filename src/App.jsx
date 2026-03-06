import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";

// Farmer pages
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import FarmerCrops from "./pages/farmer/FarmerCrops";
import FarmerBids from "./pages/farmer/FarmerBids";
import FarmerOrders from "./pages/farmer/FarmerOrders";

// Retailer pages
import RetailerDashboard from "./pages/retailer/RetailerDashboard";
import Marketplace from "./pages/retailer/Marketplace";
import RetailerBids from "./pages/retailer/RetailerBids";
import RetailerOrders from "./pages/retailer/RetailerOrders";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPayments from "./pages/admin/AdminPayments";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const routes = { FARMER: "/farmer", RETAILER: "/retailer", ADMIN: "/admin" };
  return <Navigate to={routes[user.role] || "/login"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: "10px", background: "#333", color: "#fff" },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Home redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Farmer routes */}
          <Route
            path="/farmer"
            element={
              <ProtectedRoute roles={["FARMER"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<FarmerDashboard />} />
            <Route path="crops" element={<FarmerCrops />} />
            <Route path="bids" element={<FarmerBids />} />
            <Route path="orders" element={<FarmerOrders />} />
          </Route>

          {/* Retailer routes */}
          <Route
            path="/retailer"
            element={
              <ProtectedRoute roles={["RETAILER", "BUYER"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RetailerDashboard />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="bids" element={<RetailerBids />} />
            <Route path="orders" element={<RetailerOrders />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
