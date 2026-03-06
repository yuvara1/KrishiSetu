import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { cropService, orderService, bidService } from "../../services";
import { StatCard, LoadingSkeleton } from "../../components/ui";
import { Wheat, Gavel, ShoppingCart, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

        // Gather bids for all crops
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

        setStats({
          totalCrops: crops.length,
          activeCrops: crops.filter((c) => c.status === "AVAILABLE").length,
          totalBids,
          totalOrders: orders.length,
          completedOrders: orders.filter((o) => o.orderStatus === "DELIVERED")
            .length,
          revenue,
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

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Crop Status Overview
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats?.chartData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
