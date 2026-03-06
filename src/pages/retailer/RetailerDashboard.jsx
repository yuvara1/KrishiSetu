import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { bidService, orderService, cropService } from "../../services";
import { StatCard, LoadingSkeleton } from "../../components/ui";
import { Wheat, Gavel, ShoppingCart, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ["#22c55e", "#eab308", "#ef4444"];

export default function RetailerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

        setStats({
          availableCrops: crops.filter((c) => c.status === "AVAILABLE").length,
          totalBids: bids.length,
          activeBids: bids.filter((b) => b.bidStatus === "PENDING").length,
          totalOrders: orders.length,
          spent,
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

  if (loading) return <LoadingSkeleton rows={4} />;

  const pieData = {
    labels: (stats?.bidChart || []).map((d) => d.name),
    datasets: [
      {
        data: (stats?.bidChart || []).map((d) => d.value),
        backgroundColor: COLORS,
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.fullName}
        </h1>
        <p className="text-gray-500 mt-1">
          Here's your retailer dashboard overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Available Crops"
          value={stats?.availableCrops || 0}
          icon={Wheat}
          color="primary"
        />
        <StatCard
          title="Active Bids"
          value={stats?.activeBids || 0}
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
          title="Total Spent"
          value={formatCurrency(stats?.spent || 0)}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Bid Status Distribution
        </h3>
        <div className="h-[300px] flex items-center justify-center">
          <Doughnut
            data={pieData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>
    </div>
  );
}
