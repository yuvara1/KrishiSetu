import { useState, useEffect, useMemo, useCallback } from "react";
import { orderService } from "../../services";
import { LoadingSkeleton, EmptyState, Modal } from "../../components/ui";
import { ShoppingCart } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  getStatusBadge,
} from "../../utils/helpers";
import { AgGridReact } from "ag-grid-react";
import toast from "react-hot-toast";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const fetchOrders = async (page = 0) => {
    setLoading(true);
    try {
      const res = await orderService.getAllPaged(page, 10); // or getByFarmerPaged, etc.
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async () => {
    try {
      await orderService.updateStatus(selected.id, newStatus);
      toast.success("Order status updated");
      setSelected(null);
      fetchOrders();
    } catch {
      /* handled */
    }
  };

  const StatusBadge = useCallback(
    ({ value }) => (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(value)}`}
      >
        {value}
      </span>
    ),
    [],
  );

  const ActionRenderer = useCallback(
    (params) => (
      <button
        onClick={() => {
          setSelected(params.data);
          setNewStatus(params.data.orderStatus);
        }}
        className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 font-medium"
      >
        Update
      </button>
    ),
    [],
  );

  const columnDefs = useMemo(
    () => [
      {
        headerName: "#",
        field: "id",
        flex: 0.5,
        valueFormatter: (p) => `#${p.value}`,
      },
      { headerName: "Crop", field: "cropBatchName", flex: 1, filter: true },
      { headerName: "Farmer", field: "farmerName", flex: 1, filter: true },
      { headerName: "Retailer", field: "retailerName", flex: 1, filter: true },
      {
        headerName: "Amount",
        field: "finalAmount",
        flex: 0.8,
        valueFormatter: (p) => formatCurrency(p.value),
        cellClass: "font-semibold text-primary-700",
      },
      {
        headerName: "Status",
        field: "orderStatus",
        flex: 0.8,
        filter: true,
        cellRenderer: (p) => <StatusBadge value={p.value} />,
      },
      {
        headerName: "Payment",
        field: "paymentStatus",
        flex: 0.8,
        filter: true,
        cellRenderer: (p) => <StatusBadge value={p.value} />,
      },
      {
        headerName: "Date",
        field: "orderDate",
        flex: 1,
        valueFormatter: (p) => formatDateTime(p.value || p.data.createdAt),
      },
      {
        headerName: "Actions",
        flex: 0.7,
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
          <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
          <p className="text-gray-500 mt-1">Manage platform orders</p>
        </div>
        <EmptyState
          icon={ShoppingCart}
          title="No orders"
          description="No orders have been placed yet"
        />
      </div>
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
        <p className="text-gray-500 mt-1">Manage platform orders</p>
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
          Showing {currentPage * 10 + 1}–
          {Math.min((currentPage + 1) * 10, totalElements)} of {totalElements}
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
        title={`Update Order #${selected?.id}`}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setSelected(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusUpdate}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              Update Status
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
