import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { cropService } from "../../services";
import {
  Modal,
  EmptyState,
  LoadingSkeleton,
  ConfirmDialog,
  SearchInput,
} from "../../components/ui";
import {
  Plus,
  Wheat,
  Pencil,
  Trash2,
  Upload,
  X as XIcon,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusBadge,
} from "../../utils/helpers";
import { uploadImage } from "../../services/imageUpload";
import toast from "react-hot-toast";

const emptyForm = {
  cropName: "",
  cropType: "",
  quantity: "",
  basePrice: "",
  harvestDate: "",
  expiryDate: "",
  description: "",
  imageUrl: "",
  location: "",
  isOrganic: false,
  unit: "kg",
};

const ITEMS_PER_PAGE = 6;

export default function FarmerCrops() {
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const fileInputRef = useRef(null);

  const fetchCrops = useCallback(
    async (page = 0) => {
      setLoading(true);
      try {
        const res = await cropService.getByFarmerPaged(
          user.id,
          page,
          ITEMS_PER_PAGE,
        );
        const paged = res.data.data;
        setCrops(paged.content || []);
        setTotalPages(paged.totalPages);
        setTotalElements(paged.totalElements);
        setCurrentPage(paged.page);
      } catch {
        /* handled */
      }
      setLoading(false);
    },
    [user?.id],
  );

  useEffect(() => {
    if (user) fetchCrops(0);
  }, [user]);

  const handlePageChange = (page) => {
    if (loading) return;
    fetchCrops(page);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, farmerId: user.id });
    setPreview(null);
    setModalOpen(true);
  };

  const openEdit = (crop) => {
    setEditing(crop.id);
    setForm({
      cropName: crop.cropName || "",
      cropType: crop.cropType || "",
      quantity: crop.quantity || "",
      basePrice: crop.basePrice || "",
      harvestDate: crop.harvestDate || "",
      expiryDate: crop.expiryDate || "",
      description: crop.description || "",
      imageUrl: crop.imageUrl || "",
      location: crop.location || "",
      isOrganic: crop.isOrganic || false,
      unit: crop.unit || "kg",
      farmerId: user.id,
    });
    setPreview(crop.imageUrl || null);
    setModalOpen(true);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      setPreview(url);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err.message || "Image upload failed");
      setPreview(form.imageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    handleImageUpload(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleImageUpload(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const removeImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: "" }));
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await cropService.update(editing, form);
        toast.success("Crop updated");
      } else {
        await cropService.create(form);
        toast.success("Crop listed");
      }
      setModalOpen(false);
      fetchCrops(currentPage);
    } catch {
      /* handled */
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    try {
      await cropService.delete(deleteId);
      toast.success("Crop deleted");
      setDeleteId(null);
      fetchCrops(currentPage);
    } catch {
      /* handled */
    }
  };

  const update = (field) => (e) =>
    setForm({
      ...form,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });

  // Client-side search filter on current page data
  const filtered = search
    ? crops.filter(
        (c) =>
          c.cropName?.toLowerCase().includes(search.toLowerCase()) ||
          c.cropType?.toLowerCase().includes(search.toLowerCase()),
      )
    : crops;

  if (loading && crops.length === 0) return <LoadingSkeleton rows={5} />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Crops</h1>
          <p className="text-gray-500 mt-1">Manage your crop listings</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" /> Add Crop
        </button>
      </div>

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search crops..."
        />
      </div>

      {filtered.length === 0 && totalElements === 0 ? (
        <EmptyState
          icon={Wheat}
          title="No crops yet"
          description="Start by adding your first crop listing"
          action={
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              Add Crop
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-70 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                  {crop.imageUrl ? (
                    <img
                      src={crop.imageUrl}
                      alt={crop.cropName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Wheat className="h-16 w-16 text-primary-300" />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {crop.cropName}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(crop.status)}`}
                    >
                      {crop.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{crop.cropType}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <span className="text-gray-400">Qty:</span>{" "}
                      <span className="font-medium">
                        {crop.quantity} {crop.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Price:</span>{" "}
                      <span className="font-medium">
                        {formatCurrency(crop.basePrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Harvest:</span>{" "}
                      <span className="font-medium">
                        {formatDate(crop.harvestDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Bids:</span>{" "}
                      <span className="font-medium">{crop.totalBids || 0}</span>
                    </div>
                  </div>
                  {crop.isOrganic && (
                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full mb-3">
                      🌿 Organic
                    </span>
                  )}
                  {crop.status !== "SOLD" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(crop)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(crop.id)}
                        className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
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

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Crop" : "Add New Crop"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Crop Image
            </label>
            {preview ? (
              <div className="relative w-full h-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={preview}
                  alt="Crop preview"
                  className="w-full h-full object-contain bg-gray-50"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center group">
                  <div className="hidden group-hover:flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-primary-600"
                      title="Change image"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-red-600"
                      title="Remove image"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  dragActive
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50"
                }`}
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                ) : (
                  <>
                    <ImageIcon className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">
                      Click or drag & drop to upload
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crop Name *
              </label>
              <input
                type="text"
                required
                value={form.cropName}
                onChange={update("cropName")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crop Type
              </label>
              <select
                value={form.cropType}
                onChange={update("cropType")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              >
                <option value="">Select a crop type</option>
                <option value="vegetable">Vegetable</option>
                <option value="fruit">Fruit</option>
                <option value="grain">Grain</option>
                <option value="legume">Legume</option>
                <option value="nut">Nut</option>
                <option value="seed">Seed</option>
                <option value="herb">Herb</option>
                <option value="flower">Flower</option>
                <option value="other">Other</option>
              </select>
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
                value={form.quantity}
                onChange={update("quantity")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={form.unit}
                onChange={update("unit")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="quintal">Quintal</option>
                <option value="ton">Ton</option>
                <option value="bag">Bag</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price (₹) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                value={form.basePrice}
                onChange={update("basePrice")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={update("location")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harvest Date
              </label>
              <input
                type="date"
                value={form.harvestDate}
                onChange={update("harvestDate")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={update("expiryDate")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={update("description")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isOrganic}
              onChange={update("isOrganic")}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Organic produce</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : editing
                  ? "Update Crop"
                  : "Create Crop"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Crop"
        message="Are you sure you want to delete this crop listing? This action cannot be undone."
      />
    </div>
  );
}
