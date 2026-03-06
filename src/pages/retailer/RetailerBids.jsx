import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { bidService, razorpayService } from "../../services";
import {
  LoadingSkeleton,
  EmptyState,
  ConfirmDialog,
} from "../../components/ui";
import { Gavel, Trash2, CreditCard } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  getStatusBadge,
} from "../../utils/helpers";
import toast from "react-hot-toast";

export default function RetailerBids() {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [processing, setProcessing] = useState(null);

  const fetchBids = () => {
    bidService
      .getByRetailer(user.id)
      .then((res) => setBids(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) fetchBids();
  }, [user]);

  const handleDelete = async () => {
    try {
      await bidService.delete(deleteId);
      toast.success("Bid withdrawn");
      setDeleteId(null);
      fetchBids();
    } catch {
      /* handled */
    }
  };

  const handlePay = async (bid) => {
    setProcessing(bid.id);
    try {
      const orderRes = await razorpayService.createOrder(bid.id);
      const orderData = orderRes.data.data;

      const options = {
        key: orderData.key,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: "Krishi Setu",
        description: `Payment for ${orderData.cropName}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: orderData.retailerName,
          email: orderData.retailerEmail,
          contact: orderData.retailerPhone,
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [{ method: "upi" }],
              },
            },
            sequence: ["block.upi"],
            preferences: { show_default_blocks: true },
          },
        },
        theme: { color: "#d97706" },
        handler: async (response) => {
          try {
            await razorpayService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bidId: bid.id,
            });
            toast.success("Payment successful! Order has been created.");
            fetchBids();
          } catch {
            toast.error("Payment verification failed");
          }
          setProcessing(null);
        },
        modal: {
          ondismiss: () => {
            setProcessing(null);
            toast.error("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        toast.error("Payment failed: " + response.error.description);
        setProcessing(null);
      });
      rzp.open();
    } catch {
      toast.error("Could not initiate payment");
      setProcessing(null);
    }
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bids</h1>
        <p className="text-gray-500 mt-1">Track all your placed bids</p>
      </div>

      {bids.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="No bids placed"
          description="Visit the marketplace to place bids on available crops"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Crop</th>
                  <th className="text-left px-6 py-3 font-medium">
                    Bid Amount
                  </th>
                  <th className="text-left px-6 py-3 font-medium">Quantity</th>
                  <th className="text-left px-6 py-3 font-medium">Date</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                  <th className="text-left px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {bid.cropBatchName}
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
                      <div className="flex gap-2">
                        {bid.bidStatus === "ACCEPTED" && !bid.paid && (
                          <button
                            onClick={() => handlePay(bid)}
                            disabled={processing === bid.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-xs font-medium disabled:opacity-50"
                          >
                            {processing === bid.id ? (
                              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CreditCard className="h-3.5 w-3.5" />
                            )}
                            Pay Now
                          </button>
                        )}
                        {bid.bidStatus === "ACCEPTED" && bid.paid && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                            ✓ Paid
                          </span>
                        )}
                        {bid.bidStatus === "PENDING" && (
                          <button
                            onClick={() => setDeleteId(bid.id)}
                            className="p-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                            title="Withdraw bid"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Withdraw Bid"
        message="Are you sure you want to withdraw this bid?"
        confirmText="Withdraw"
      />
    </div>
  );
}
