import { useState, useEffect } from "react";
import { adminService, orderService, cropService } from "../../services";
import { StatCard, LoadingSkeleton } from "../../components/ui";
import { Users, Wheat, ShoppingCart, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#16a34a", "#3b82f6", "#a855f7"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, ordersRes, cropsRes] = await Promise.all([
          adminService.getUsers(),
          orderService.getAll(),
          cropService.getAll(),
        ]);
        const users = usersRes.data.data || [];
        const orders = ordersRes.data.data || [];
        const crops = cropsRes.data.data || [];

        const totalRevenue = orders
          .filter((o) => o.paymentStatus === "COMPLETED")
          .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

        setStats({
          totalUsers: users.length,
          totalCrops: crops.length,
          totalOrders: orders.length,
          totalRevenue,
          userRoles: [
            {
              name: "Farmers",
              value: users.filter((u) => u.role === "FARMER").length,
            },
            {
              name: "Retailers",
              value: users.filter(
                (u) => u.role === "RETAILER" || u.role === "BUYER",
              ).length,
            },
            {
              name: "Admins",
              value: users.filter((u) => u.role === "ADMIN").length,
            },
          ],
          orderStatus: [
            {
              name: "Pending",
              count: orders.filter((o) => o.orderStatus === "PENDING").length,
            },
            {
              name: "Confirmed",
              count: orders.filter((o) => o.orderStatus === "CONFIRMED").length,
            },
            {
              name: "Shipped",
              count: orders.filter((o) => o.orderStatus === "SHIPPED").length,
            },
            {
              name: "Delivered",
              count: orders.filter((o) => o.orderStatus === "DELIVERED").length,
            },
            {
              name: "Cancelled",
              count: orders.filter((o) => o.orderStatus === "CANCELLED").length,
            },
          ],
        });
      } catch {
        /* handled */
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Total Crops"
          value={stats?.totalCrops || 0}
          icon={Wheat}
          color="yellow"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Platform Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats?.userRoles || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {(stats?.userRoles || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Orders by Status
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.orderStatus || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
