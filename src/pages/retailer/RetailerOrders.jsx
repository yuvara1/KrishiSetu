import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { orderService } from "../../services";
import { LoadingSkeleton, EmptyState } from "../../components/ui";
import { ShoppingCart } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  getStatusBadge,
} from "../../utils/helpers";
import { AgGridReact } from "ag-grid-react";

export default function RetailerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    orderService
      .getByRetailer(user.id)
      .then((res) => setOrders(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

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

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Order #",
        field: "id",
        flex: 0.6,
        valueFormatter: (p) => `#${p.value}`,
      },
      { headerName: "Crop", field: "cropBatchName", flex: 1, filter: true },
      { headerName: "Farmer", field: "farmerName", flex: 1, filter: true },
      {
        headerName: "Amount",
        field: "finalAmount",
        flex: 0.8,
        valueFormatter: (p) => formatCurrency(p.value),
        cellClass: "font-semibold text-primary-700",
      },
      { headerName: "Qty", field: "quantity", flex: 0.5 },
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
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({ sortable: true, resizable: true }),
    [],
  );

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 mt-1">
          Track your purchases and deliveries
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders yet"
          description="Your orders will appear here after your bids are accepted"
        />
      ) : (
        <div
          className="bg-white rounded-xl border border-gray-200 overflow-hidden ag-theme-alpine"
          style={{ height: 500 }}
        >
          <AgGridReact
            rowData={orders}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            rowHeight={48}
          />
        </div>
      )}
    </div>
  );
}
