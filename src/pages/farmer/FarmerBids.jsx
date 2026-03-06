import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { cropService, bidService } from "../../services";
import { LoadingSkeleton, EmptyState } from "../../components/ui";
import { Gavel, Check, X } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  getStatusBadge,
} from "../../utils/helpers";
import toast from "react-hot-toast";

export default function FarmerBids() {
  const { user } = useAuth();
  const [cropBids, setCropBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBids = async () => {
      try {
        const cropsRes = await cropService.getByFarmer(user.id);
        const crops = cropsRes.data.data || [];
        const allBids = [];
        for (const crop of crops) {
          try {
            const bidRes = await bidService.getByCrop(crop.id);
            const bids = (bidRes.data.data || []).map((b) => ({
              ...b,
              cropName: crop.cropName,
            }));
            allBids.push(...bids);
          } catch {
            /* skip */
          }
        }
        setCropBids(allBids);
      } catch {
        /* handled */
      }
      setLoading(false);
    };
    fetchBids();
  }, [user]);

  const handleAccept = async (id) => {
    try {
      await bidService.accept(id);
      toast.success("Bid accepted — retailer will be notified to pay");
      setCropBids((prev) =>
        prev.map((b) => (b.id === id ? { ...b, bidStatus: "ACCEPTED" } : b)),
      );
    } catch {
      /* handled */
    }
  };

  const handleReject = async (id) => {
    try {
      await bidService.reject(id);
      toast.success("Bid rejected");
      setCropBids((prev) =>
        prev.map((b) => (b.id === id ? { ...b, bidStatus: "REJECTED" } : b)),
      );
    } catch {
      /* handled */
    }
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bids Received</h1>
        <p className="text-gray-500 mt-1">
          Review and manage bids on your crops
        </p>
      </div>

      {cropBids.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="No bids yet"
          description="Bids from retailers will appear here"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Crop</th>
                  <th className="text-left px-6 py-3 font-medium">Retailer</th>
                  <th className="text-left px-6 py-3 font-medium">Amount</th>
                  <th className="text-left px-6 py-3 font-medium">Quantity</th>
                  <th className="text-left px-6 py-3 font-medium">Date</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                  <th className="text-left px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cropBids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {bid.cropBatchName || bid.cropName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {bid.retailerName}
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary-700">
                      {formatCurrency(bid.bidAmount)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {bid.bidQuantity}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDateTime(bid.bidDate || bid.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(bid.bidStatus)}`}
                      >
                        {bid.bidStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {bid.bidStatus === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(bid.id)}
                            className="p-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                            title="Accept"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(bid.id)}
                            className="p-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
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
