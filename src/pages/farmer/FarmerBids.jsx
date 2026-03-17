import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { cropService, bidService } from "../../services";
import { LoadingSkeleton, EmptyState } from "../../components/ui";
import { Gavel, Check, X } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  getStatusBadge,
} from "../../utils/helpers";
import { AgGridReact } from "ag-grid-react";
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

  const ActionRenderer = useCallback((params) => {
    if (params.data.bidStatus !== "PENDING") return null;
    return (
      <div className="flex gap-2 items-center h-full">
        <button
          onClick={() => handleAccept(params.data.id)}
          className="p-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
          title="Accept"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleReject(params.data.id)}
          className="p-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
          title="Reject"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }, []);

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Crop",
        valueGetter: (p) => p.data.cropBatchName || p.data.cropName,
        flex: 1,
        filter: true,
      },
      { headerName: "Retailer", field: "retailerName", flex: 1, filter: true },
      {
        headerName: "Amount",
        field: "bidAmount",
        flex: 0.8,
        valueFormatter: (p) => formatCurrency(p.value),
        cellClass: "font-semibold text-primary-700",
      },
      { headerName: "Quantity", field: "bidQuantity", flex: 0.6 },
      {
        headerName: "Date",
        field: "bidDate",
        flex: 1,
        valueFormatter: (p) => formatDateTime(p.value || p.data.createdAt),
      },
      {
        headerName: "Status",
        field: "bidStatus",
        flex: 0.8,
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
        <div
          className="bg-white rounded-xl border border-gray-200 overflow-hidden ag-theme-alpine"
          style={{ height: 500 }}
        >
          <AgGridReact
            rowData={cropBids}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={48}
            domLayout="autoHeight"
          />
        </div>
      )}
    </div>
  );
}
