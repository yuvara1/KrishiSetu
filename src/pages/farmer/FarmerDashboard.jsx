import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { cropService, orderService, bidService } from "../../services";
import { StatCard, LoadingSkeleton } from "../../components/ui";
import { Wheat, Gavel, ShoppingCart, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [cropsRes, ordersRes] = await Promise.all([
          cropService.getByFarmer(user.id),
          orderService.getByFarmer(user.id),
        ]);
        const crops = cropsRes.data.data || [];
        const orders = ordersRes.data.data || [];

        let totalBids = 0;
        for (const crop of crops.slice(0, 10)) {
          try {
            const bidRes = await bidService.getByCrop(crop.id);
            totalBids += (bidRes.data.data || []).length;
          } catch {
            /* skip */
          }
        }

        const revenue = orders
          .filter((o) => o.paymentStatus === "COMPLETED")
          .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

        // Monthly revenue for line chart
        const monthlyRevenue = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        orders
          .filter((o) => o.paymentStatus === "COMPLETED")
          .forEach((o) => {
            const d = new Date(o.createdAt);
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (o.finalAmount || 0);
          });

        const recentOrders = orders.slice(0, 5);

        setStats({
          totalCrops: crops.length,
          activeCrops: crops.filter((c) => c.status === "AVAILABLE").length,
          totalBids,
          totalOrders: orders.length,
          completedOrders: orders.filter((o) => o.orderStatus === "DELIVERED")
            .length,
          revenue,
          recentOrders,
          monthlyRevenue: Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount })),
          chartData: [
            {
              name: "Available",
              count: crops.filter((c) => c.status === "AVAILABLE").length,
            },
            {
              name: "Bidding Closed",
              count: crops.filter((c) => c.status === "BIDDING_CLOSED").length,
            },
            {
              name: "Sold",
              count: crops.filter((c) => c.status === "SOLD").length,
            },
          ],
        });
      } catch {
        /* handled */
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const barData = useMemo(
    () => ({
      labels: (stats?.chartData || []).map((d) => d.name),
      datasets: [
        {
          label: "Crops",
          data: (stats?.chartData || []).map((d) => d.count),
          backgroundColor: "#16a34a",
          borderRadius: 6,
        },
      ],
    }),
    [stats?.chartData],
  );

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    }),
    [],
  );

  const lineData = useMemo(
    () => ({
      labels: (stats?.monthlyRevenue || []).map((d) => d.month),
      datasets: [
        {
          label: "Revenue",
          data: (stats?.monthlyRevenue || []).map((d) => d.amount),
          borderColor: "#16a34a",
          backgroundColor: "rgba(22,163,74,0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    }),
    [stats?.monthlyRevenue],
  );

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    }),
    [],
  );

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.fullName}
        </h1>
        <p className="text-gray-500 mt-1">
          Here's your farming dashboard overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Crops"
          value={stats?.totalCrops || 0}
          icon={Wheat}
          color="primary"
        />
        <StatCard
          title="Active Bids"
          value={stats?.totalBids || 0}
          icon={Gavel}
          color="yellow"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats?.revenue || 0)}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Crop Status Overview
          </h3>
          <div className="h-[300px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Trend
          </h3>
          <div className="h-[300px]">
            {(stats?.monthlyRevenue || []).length > 0 ? (
              <Line data={lineData} options={lineOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No revenue data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      {(stats?.recentOrders || []).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Order ID</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Crop</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 text-gray-900 dark:text-gray-200">#{order.id}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{order.cropBatchName || "—"}</td>
                    <td className="py-3 text-gray-900 dark:text-gray-200">{formatCurrency(order.finalAmount || 0)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.orderStatus === "DELIVERED" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                        order.orderStatus === "CANCELLED" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
