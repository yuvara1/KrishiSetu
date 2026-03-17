import { useState, useEffect, useMemo, useCallback } from "react";
import { cropService, bidService } from "../../services";
import { useAuth } from "../../hooks/useAuth";
import {
  LoadingSkeleton,
  EmptyState,
  Modal,
  SearchInput,
} from "../../components/ui";
import {
  Wheat,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusBadge,
} from "../../utils/helpers";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 6;

export default function Marketplace() {
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [bidForm, setBidForm] = useState({ bidAmount: "", bidQuantity: "" });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchCrops = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const res = await cropService.getAllPaged(page, ITEMS_PER_PAGE);
      const paged = res.data.data;
      setCrops(paged.content || []);
      setTotalPages(paged.totalPages);
      setTotalElements(paged.totalElements);
      setCurrentPage(paged.page);
    } catch {
      /* handled */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCrops(0);
  }, []);

  const handlePageChange = (page) => {
    if (loading) return;
    fetchCrops(page);
  };

  const handleBid = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bidService.create({
        cropBatchId: selected.id,
        retailerId: user.id,
        bidAmount: parseFloat(bidForm.bidAmount),
        bidQuantity: parseFloat(bidForm.bidQuantity),
      });
      toast.success("Bid placed successfully!");
      setSelected(null);
      setBidForm({ bidAmount: "", bidQuantity: "" });
    } catch {
      /* handled */
    }
    setSubmitting(false);
  };

  // Client-side search/filter on current page data
  const filtered = useMemo(
    () =>
      crops.filter((c) => {
        const matchSearch =
          !search ||
          c.cropName?.toLowerCase().includes(search.toLowerCase()) ||
          c.farmerName?.toLowerCase().includes(search.toLowerCase()) ||
          c.location?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "ALL" || c.status === filter;
        return matchSearch && matchFilter;
      }),
    [crops, search, filter],
  );

  if (loading && crops.length === 0) return <LoadingSkeleton rows={6} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crop Marketplace</h1>
        <p className="text-gray-500 mt-1">
          Browse and bid on available crop batches
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search crops, farmers, locations..."
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="BIDDING_CLOSED">Bidding Closed</option>
          <option value="SOLD">Sold</option>
        </select>
      </div>

      {filtered.length === 0 && totalElements === 0 ? (
        <EmptyState
          icon={Wheat}
          title="No crops found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-70 bg-gradient-to-br from-primary-100 to-earth-100 flex items-center justify-center relative">
                  {crop.imageUrl ? (
                    <img
                      src={crop.imageUrl}
                      alt={crop.cropName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Wheat className="h-16 w-16 text-primary-300" />
                  )}
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(crop.status)}`}
                  >
                    {crop.status}
                  </span>
                  {crop.isOrganic && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded-full">
                      🌿 Organic
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {crop.cropName}
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">{crop.cropType}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                    <MapPin className="h-3 w-3" /> {crop.location || "N/A"}
                    <span className="mx-1">•</span>
                    <Calendar className="h-3 w-3" />{" "}
                    {formatDate(crop.harvestDate)}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Base Price</p>
                      <p className="text-lg font-bold text-primary-700">
                        {formatCurrency(crop.basePrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Quantity</p>
                      <p className="font-semibold text-gray-900">
                        {crop.quantity} {crop.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-500">By {crop.farmerName}</span>
                    <span className="text-gray-400">
                      {crop.totalBids || 0} bids
                    </span>
                  </div>
                  {crop.status === "AVAILABLE" && (
                    <button
                      onClick={() => {
                        setSelected(crop);
                        setBidForm({ bidAmount: "", bidQuantity: "" });
                      }}
                      className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      Place Bid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {currentPage * ITEMS_PER_PAGE + 1}–
                {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalElements)} of{" "}
                {totalElements}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || loading}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={loading || currentPage === page}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer ${
                      currentPage === page
                        ? "bg-primary-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }  disabled:cursor-not-allowed`}
                  >
                    {page + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || loading}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bid Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Place Bid - ${selected?.cropName}`}
      >
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Crop:</span>{" "}
              <span className="font-medium">{selected?.cropName}</span>
            </div>
            <div>
              <span className="text-gray-400">Farmer:</span>{" "}
              <span className="font-medium">{selected?.farmerName}</span>
            </div>
            <div>
              <span className="text-gray-400">Base Price:</span>{" "}
              <span className="font-medium">
                {formatCurrency(selected?.basePrice)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Available:</span>{" "}
              <span className="font-medium">
                {selected?.quantity} {selected?.unit}
              </span>
            </div>
          </div>
        </div>
        <form onSubmit={handleBid} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Bid Amount (₹) *
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              value={bidForm.bidAmount}
              onChange={(e) =>
                setBidForm({ ...bidForm, bidAmount: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              placeholder="Enter your bid amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              max={selected?.quantity}
              value={bidForm.bidQuantity}
              onChange={(e) =>
                setBidForm({ ...bidForm, bidQuantity: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              placeholder={`Max: ${selected?.quantity} ${selected?.unit}`}
            />
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
              {submitting ? "Placing..." : "Place Bid"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
