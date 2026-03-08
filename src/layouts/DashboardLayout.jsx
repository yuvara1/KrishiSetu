import { useState, useCallback, useMemo, memo } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutDashboard,
  Wheat,
  Gavel,
  ShoppingCart,
  CreditCard,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sprout,
} from "lucide-react";

const navItems = {
  FARMER: [
    { to: "/farmer", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/farmer/crops", icon: Wheat, label: "My Crops" },
    { to: "/farmer/bids", icon: Gavel, label: "Bids Received" },
    { to: "/farmer/orders", icon: ShoppingCart, label: "Orders" },
  ],
  RETAILER: [
    { to: "/retailer", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/retailer/marketplace", icon: Wheat, label: "Marketplace" },
    { to: "/retailer/bids", icon: Gavel, label: "My Bids" },
    { to: "/retailer/orders", icon: ShoppingCart, label: "Orders" },
  ],
  ADMIN: [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/admin/payments", icon: CreditCard, label: "Payments" },
  ],
};

const Sidebar = memo(function Sidebar({
  items,
  roleLabel,
  location,
  onNavClick,
  onLogout,
}) {
  return (
    <div className="flex flex-col h-full bg-primary-900 text-white w-64">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-primary-800">
        <Sprout className="h-8 w-8 text-primary-300" />
        <span className="text-xl font-bold">Krishi Setu</span>
      </div>
      <div className="px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary-400">
          {roleLabel} Panel
        </span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-700 text-white"
                  : "text-primary-200 hover:bg-primary-800 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-primary-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-primary-200 hover:bg-primary-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
});

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const items = navItems[user?.role] || [];
  const roleLabel = useMemo(
    () =>
      user?.role === "RETAILER"
        ? "Retailer"
        : user?.role === "ADMIN"
          ? "Admin"
          : "Farmer",
    [user?.role],
  );

  const handleLogout = useCallback(() => {
    setProfileOpen(false);
    setSidebarOpen(false);
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleProfile = useCallback(() => setProfileOpen((p) => !p), []);

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex">
        <Sidebar
          items={items}
          roleLabel={roleLabel}
          location={location}
          onNavClick={closeSidebar}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={closeSidebar} />
          <div className="fixed inset-y-0 left-0 z-50">
            <Sidebar
              items={items}
              roleLabel={roleLabel}
              location={location}
              onNavClick={closeSidebar}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 h-16 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block" />

          <div className="relative">
            <button
              onClick={toggleProfile}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user?.fullName}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                    {roleLabel}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
