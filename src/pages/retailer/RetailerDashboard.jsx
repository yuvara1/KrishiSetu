import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { bidService, orderService, cropService } from "../../services";
import { StatCard, LoadingSkeleton } from "../../components/ui";
import { Wheat, Gavel, ShoppingCart, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

const COLORS = ["#22c55e", "#eab308", "#ef4444"];

export default function RetailerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [bidsRes, ordersRes, cropsRes] = await Promise.all([
          bidService.getByRetailer(user.id),
          orderService.getByRetailer(user.id),
          cropService.getAll(),
        ]);
        const bids = bidsRes.data.data || [];
        const orders = ordersRes.data.data || [];
        const crops = cropsRes.data.data || [];

        const spent = orders
          .filter((o) => o.paymentStatus === "COMPLETED")
          .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

        // Monthly spending for line chart
        const monthlySpending = {};
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        orders
          .filter((o) => o.paymentStatus === "COMPLETED")
          .forEach((o) => {
            const d = new Date(o.createdAt);
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            monthlySpending[key] =
              (monthlySpending[key] || 0) + (o.finalAmount || 0);
          });

        const recentBids = bids.slice(0, 5);

        setStats({
          availableCrops: crops.filter((c) => c.status === "AVAILABLE").length,
          totalBids: bids.length,
          activeBids: bids.filter((b) => b.bidStatus === "PENDING").length,
          totalOrders: orders.length,
          spent,
          recentBids,
          monthlySpending: Object.entries(monthlySpending).map(
            ([month, amount]) => ({ month, amount }),
          ),
          bidChart: [
            {
              name: "Pending",
              value: bids.filter((b) => b.bidStatus === "PENDING").length,
            },
            {
              name: "Accepted",
              value: bids.filter((b) => b.bidStatus === "ACCEPTED").length,
            },
            {
              name: "Rejected",
              value: bids.filter((b) => b.bidStatus === "REJECTED").length,
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

  const pieData = useMemo(
    () => ({
      labels: (stats?.bidChart || []).map((d) => d.name),
      datasets: [
        {
          data: (stats?.bidChart || []).map((d) => d.value),
          backgroundColor: COLORS,
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    }),
    [stats?.bidChart],
  );

  const lineData = useMemo(
    () => ({
      labels: (stats?.monthlySpending || []).map((d) => d.month),
      datasets: [
        {
          label: "Spending",
          data: (stats?.monthlySpending || []).map((d) => d.amount),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    }),
    [stats?.monthlySpending],
  );

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white-900">
          {t("welcome")}, {user?.fullName}
        </h1>
        <p className="text-gray-500 mt-1 dark:text-gray-400">
          {t("dashboardOverview")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t("availableCrops")}
          value={stats?.availableCrops || 0}
          icon={Wheat}
          color="primary"
        />
        <StatCard
          title={t("activeBids")}
          value={stats?.activeBids || 0}
          icon={Gavel}
          color="yellow"
        />
        <StatCard
          title={t("totalOrders")}
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title={t("totalSpent")}
          value={formatCurrency(stats?.spent || 0)}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("bidStatusDistribution")}
          </h3>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut
              data={pieData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("spendingTrend")}
          </h3>
          <div className="h-[300px]">
            {(stats?.monthlySpending || []).length > 0 ? (
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No spending data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bids */}
      {(stats?.recentBids || []).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Bids
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">
                    Bid ID
                  </th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">
                    Crop
                  </th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">
                    Amount
                  </th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBids.map((bid) => (
                  <tr
                    key={bid.id}
                    className="border-b border-gray-100 dark:border-gray-700"
                  >
                    <td className="py-3 text-gray-900 dark:text-gray-200">
                      #{bid.id}
                    </td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">
                      {bid.cropBatchName || "—"}
                    </td>
                    <td className="py-3 text-gray-900 dark:text-gray-200">
                      {formatCurrency(bid.bidAmount || 0)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bid.bidStatus === "ACCEPTED"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : bid.bidStatus === "REJECTED"
                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {bid.bidStatus}
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
