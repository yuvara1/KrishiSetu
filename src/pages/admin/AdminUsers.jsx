import { useState, useEffect, useMemo, useCallback } from "react";
import { adminService } from "../../services";
import { LoadingSkeleton, Modal, ConfirmDialog } from "../../components/ui";
import { Pencil, Trash2 } from "lucide-react";
import { formatDateTime } from "../../utils/helpers";
import { AgGridReact } from "ag-grid-react";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = () => {
    adminService
      .getUsers()
      .then((res) => setUsers(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEdit = (user) => {
    setEditUser(user);
    setForm({
      fullName: user.fullName || "",
      username: user.username || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      role: user.role || "FARMER",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminService.updateUser(editUser.id, form);
      toast.success("User updated");
      setEditUser(null);
      fetchUsers();
    } catch {
      /* handled */
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteUser(deleteId);
      toast.success("User deleted");
      setDeleteId(null);
      fetchUsers();
    } catch {
      /* handled */
    }
  };

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const roleColors = {
    FARMER: "bg-green-100 text-green-800",
    RETAILER: "bg-blue-100 text-blue-800",
    BUYER: "bg-blue-100 text-blue-800",
    ADMIN: "bg-purple-100 text-purple-800",
  };

  const ActionRenderer = useCallback(
    (params) => (
      <div className="flex gap-2 items-center h-full">
        <button
          onClick={() => openEdit(params.data)}
          className="p-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => setDeleteId(params.data.id)}
          className="p-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
    [],
  );

  const columnDefs = useMemo(
    () => [
      {
        headerName: "User",
        field: "fullName",
        flex: 1.5,
        filter: true,
        cellRenderer: (params) => (
          <div className="flex items-center gap-3 h-full">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
              {params.data.fullName?.charAt(0) || "U"}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {params.data.fullName}
              </p>
              <p className="text-xs text-gray-400">@{params.data.username}</p>
            </div>
          </div>
        ),
      },
      { headerName: "Email", field: "email", flex: 1.2, filter: true },
      { headerName: "Phone", field: "phoneNumber", flex: 1 },
      {
        headerName: "Role",
        field: "role",
        flex: 0.8,
        filter: true,
        cellRenderer: (params) => (
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[params.value] || "bg-gray-100 text-gray-800"}`}
          >
            {params.value}
          </span>
        ),
      },
      {
        headerName: "Joined",
        field: "createdAt",
        flex: 1,
        valueFormatter: (params) => formatDateTime(params.value),
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

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">View and manage platform users</p>
      </div>

      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden ag-theme-alpine"
        style={{ height: 500 }}
      >
        <AgGridReact
          rowData={users}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
          domLayout="normal"
          rowHeight={56}
          quickFilterText=""
        />
      </div>

      {/* Edit User Modal */}
      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit User"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.fullName || ""}
                onChange={update("fullName")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={form.username || ""}
                onChange={update("username")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email || ""}
              onChange={update("email")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phoneNumber || ""}
              onChange={update("phoneNumber")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              rows={2}
              value={form.address || ""}
              onChange={update("address")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={form.role || ""}
              onChange={update("role")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            >
              <option value="FARMER">Farmer</option>
              <option value="RETAILER">Retailer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditUser(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Update User"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}
