import { useState, useEffect, useMemo, useCallback } from "react";
import { orderService, paymentService } from "../../services";
import { LoadingSkeleton, EmptyState, Modal } from "../../components/ui";
import { CreditCard } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  getStatusBadge,
} from "../../utils/helpers";
import { AgGridReact } from "ag-grid-react";
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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (page = 0) => {
    setLoading(true);
    try {
      const res = await orderService.getAllPaged(page, PAGE_SIZE);
      const paged = res.data.data;
      setOrders(paged.content || []);
      setTotalPages(paged.totalPages);
      setTotalElements(paged.totalElements);
      setCurrentPage(paged.page);
    } catch {
      /* handled */
    }
    setLoading(false);
  };

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

  const ActionRenderer = useCallback(
    (params) => (
      <button
        onClick={() => {
          setSelected(params.data);
          setPaymentForm({
            paymentMethod: "UPI",
            amount: params.data.finalAmount,
          });
        }}
        className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 font-medium"
      >
        Create Payment
      </button>
    ),
    [],
  );

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Order #",
        field: "id",
        flex: 0.6,
        valueFormatter: (p) => `#${p.value}`,
      },
      { headerName: "Crop", field: "cropBatchName", flex: 1.2, filter: true },
      {
        headerName: "Amount",
        field: "finalAmount",
        flex: 0.8,
        valueFormatter: (p) => formatCurrency(p.value),
        cellClass: "font-semibold text-primary-700",
      },
      {
        headerName: "Payment Status",
        field: "paymentStatus",
        flex: 1,
        filter: true,
        cellRenderer: (p) => (
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(p.value)}`}
          >
            {p.value}
          </span>
        ),
      },
      {
        headerName: "Date",
        field: "createdAt",
        flex: 1,
        valueFormatter: (p) => formatDateTime(p.value),
      },
      {
        headerName: "Actions",
        flex: 1,
        cellRenderer: ActionRenderer,
        sortable: false,
        filter: false,
      },
    ],
    [ActionRenderer],
  );

  const defaultColDef = useMemo(
    () => ({ sortable: true, resizable: true }),
    [],
  );

  if (loading) return <LoadingSkeleton rows={5} />;

  if (orders.length === 0)
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Payment Management
          </h1>
          <p className="text-gray-500 mt-1">
            Create and manage payment records
          </p>
        </div>
        <EmptyState
          icon={CreditCard}
          title="No orders"
          description="Payments can be created once orders exist"
        />
      </div>
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-500 mt-1">Create and manage payment records</p>
      </div>

      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden ag-theme-alpine"
        style={{ height: 500 }}
      >
        <AgGridReact
          rowData={orders}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowHeight={48}
          domLayout="autoHeight"
        />
      </div>

      <div className="flex items-center justify-between mt-4 px-2">
        <p className="text-sm text-gray-500">
          Showing {currentPage * PAGE_SIZE + 1}–
          {Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} of{" "}
          {totalElements}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => fetchOrders(currentPage - 1)}
            disabled={currentPage === 0}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
            <button
              key={page}
              onClick={() => fetchOrders(page)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                currentPage === page
                  ? "bg-primary-600 text-white"
                  : "border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page + 1}
            </button>
          ))}
          <button
            onClick={() => fetchOrders(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

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
