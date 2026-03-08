import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
  </div>
);

// Auth pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const UnauthorizedPage = lazy(() => import("./pages/auth/UnauthorizedPage"));

// Farmer pages
const FarmerDashboard = lazy(() => import("./pages/farmer/FarmerDashboard"));
const FarmerCrops = lazy(() => import("./pages/farmer/FarmerCrops"));
const FarmerBids = lazy(() => import("./pages/farmer/FarmerBids"));
const FarmerOrders = lazy(() => import("./pages/farmer/FarmerOrders"));

// Retailer pages
const RetailerDashboard = lazy(
  () => import("./pages/retailer/RetailerDashboard"),
);
const Marketplace = lazy(() => import("./pages/retailer/Marketplace"));
const RetailerBids = lazy(() => import("./pages/retailer/RetailerBids"));
const RetailerOrders = lazy(() => import("./pages/retailer/RetailerOrders"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));

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
          <Route
            path="/login"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <RegisterPage />
              </Suspense>
            }
          />
          <Route
            path="/unauthorized"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <UnauthorizedPage />
              </Suspense>
            }
          />

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
            <Route
              index
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <FarmerDashboard />
                </Suspense>
              }
            />
            <Route
              path="crops"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <FarmerCrops />
                </Suspense>
              }
            />
            <Route
              path="bids"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <FarmerBids />
                </Suspense>
              }
            />
            <Route
              path="orders"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <FarmerOrders />
                </Suspense>
              }
            />
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
            <Route
              index
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <RetailerDashboard />
                </Suspense>
              }
            />
            <Route
              path="marketplace"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Marketplace />
                </Suspense>
              }
            />
            <Route
              path="bids"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <RetailerBids />
                </Suspense>
              }
            />
            <Route
              path="orders"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <RetailerOrders />
                </Suspense>
              }
            />
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
            <Route
              index
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              }
            />
            <Route
              path="users"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminUsers />
                </Suspense>
              }
            />
            <Route
              path="orders"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminOrders />
                </Suspense>
              }
            />
            <Route
              path="payments"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminPayments />
                </Suspense>
              }
            />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
