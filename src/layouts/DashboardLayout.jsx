import { useState, useCallback, useMemo, memo } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import NotificationBell from "../components/NotificationBell";
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
  Sun,
  Moon,
  UserCircle,
} from "lucide-react";
import logo from "../assets/krishi-setu-logo.png";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "react-i18next";

const navItems = {
  FARMER: [
    { to: "/farmer", icon: LayoutDashboard, labelKey: "dashboard" },
    { to: "/farmer/crops", icon: Wheat, labelKey: "myCrops" },
    { to: "/farmer/bids", icon: Gavel, labelKey: "bidsReceived" },
    { to: "/farmer/orders", icon: ShoppingCart, labelKey: "orders" },
  ],
  RETAILER: [
    { to: "/retailer", icon: LayoutDashboard, labelKey: "dashboard" },
    { to: "/retailer/marketplace", icon: Wheat, labelKey: "marketplace" },
    { to: "/retailer/bids", icon: Gavel, labelKey: "myBids" },
    { to: "/retailer/orders", icon: ShoppingCart, labelKey: "orders" },
  ],
  ADMIN: [
    { to: "/admin", icon: LayoutDashboard, labelKey: "dashboard" },
    { to: "/admin/users", icon: Users, labelKey: "users" },
    { to: "/admin/orders", icon: ShoppingCart, labelKey: "orders" },
    { to: "/admin/payments", icon: CreditCard, labelKey: "payments" },
  ],
};

const Sidebar = memo(function Sidebar({
  items,
  roleLabel,
  location,
  onNavClick,
  onLogout,
  t, // <-- add t prop
}) {
  return (
    <div className="flex flex-col h-full bg-primary-900 text-white w-64">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-primary-800">
        <img src={logo} alt="Krishi Setu" className="h-8 w-8" />
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
              {t(item.labelKey)} {/* <-- use t() here */}
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
          {t("logout")} {/* <-- translate */}
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
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications(user?.id);
  const { darkMode, toggleDarkMode } = useTheme();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = useCallback(
    (e) => {
      i18n.changeLanguage(e.target.value);
    },
    [i18n],
  );

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
    <div className="flex h-screen overflow-hidden bg-stone-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex">
        <Sidebar
          items={items}
          roleLabel={roleLabel}
          location={location}
          onNavClick={closeSidebar}
          onLogout={handleLogout}
          t={t}
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
              t={t}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-8 h-16 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-2">
            <select
              value={i18n.language?.substring(0, 2)}
              onChange={handleLanguageChange}
              className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="ta">தமிழ்</option>
            </select>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />
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
                  <Link
                    to={`/${user?.role?.toLowerCase()}/profile`}
                    onClick={() => setProfileOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <UserCircle className="h-4 w-4" />
                    {t("profile")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
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
