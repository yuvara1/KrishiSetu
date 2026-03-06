import { useState, useEffect } from "react";
import { orderService, paymentService } from "../../services";
import { LoadingSkeleton, EmptyState, Modal } from "../../components/ui";
import { CreditCard } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  getStatusBadge,
} from "../../utils/helpers";
import toast from "react-hot-toast";

export default function AdminPayments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "UPI",
    amount: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    orderService
      .getAll()
      .then((res) => setOrders(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await paymentService.create({
        orderId: selected.id,
        amount: parseFloat(paymentForm.amount || selected.finalAmount),
        paymentMethod: paymentForm.paymentMethod,
      });
      toast.success("Payment record created");
      setSelected(null);
    } catch {
      /* handled */
    }
    setSubmitting(false);
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-500 mt-1">Create and manage payment records</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No orders"
          description="Payments can be created once orders exist"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Order #</th>
                  <th className="text-left px-6 py-3 font-medium">Crop</th>
                  <th className="text-left px-6 py-3 font-medium">Amount</th>
                  <th className="text-left px-6 py-3 font-medium">
                    Payment Status
                  </th>
                  <th className="text-left px-6 py-3 font-medium">Date</th>
                  <th className="text-left px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {order.cropBatchName}
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary-700">
                      {formatCurrency(order.finalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.paymentStatus)}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelected(order);
                          setPaymentForm({
                            paymentMethod: "UPI",
                            amount: order.finalAmount,
                          });
                        }}
                        className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 font-medium"
                      >
                        Create Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Payment for Order #${selected?.id}`}
        size="sm"
      >
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              required
              step="0.01"
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, amount: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  paymentMethod: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            >
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Payment"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
