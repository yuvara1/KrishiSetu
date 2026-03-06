import api from "./api";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/me"),
  logout: (token) =>
    api.post("/auth/logout", null, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  refresh: (refreshToken) =>
    api.post("/auth/refresh", null, {
      headers: { Authorization: refreshToken },
    }),
};

export const adminService = {
  getUsers: () => api.get("/admin/users"),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export const cropService = {
  create: (data) => api.post("/crop-batches", data),
  getAll: () => api.get("/crop-batches"),
  getById: (id) => api.get(`/crop-batches/${id}`),
  update: (id, data) => api.put(`/crop-batches/${id}`, data),
  delete: (id) => api.delete(`/crop-batches/${id}`),
  getByFarmer: (farmerId) => api.get(`/crop-batches/farmer/${farmerId}`),
  getByStatus: (status) => api.get(`/crop-batches/status/${status}`),
};

export const bidService = {
  create: (data) => api.post("/bids", data),
  getByCrop: (cropBatchId) => api.get(`/bids/crop/${cropBatchId}`),
  getByRetailer: (retailerId) => api.get(`/bids/retailer/${retailerId}`),
  accept: (id) => api.put(`/bids/${id}/accept`),
  reject: (id) => api.put(`/bids/${id}/reject`),
  delete: (id) => api.delete(`/bids/${id}`),
};

export const orderService = {
  createFromBid: (bidId, deliveryAddress) =>
    api.post(`/orders/from-bid/${bidId}`, { deliveryAddress }),
  getById: (id) => api.get(`/orders/${id}`),
  getByFarmer: (farmerId) => api.get(`/orders/farmer/${farmerId}`),
  getByRetailer: (retailerId) => api.get(`/orders/retailer/${retailerId}`),
  getAll: () => api.get("/orders"),
  updateStatus: (id, status) =>
    api.put(`/orders/${id}/status`, null, { params: { status } }),
};

export const paymentService = {
  create: (data) => api.post("/payments", data),
  getByOrder: (orderId) => api.get(`/payments/order/${orderId}`),
  updateStatus: (id, data) => api.put(`/payments/${id}/status`, data),
};

export const razorpayService = {
  createOrder: (bidId) => api.post(`/payments/razorpay/create-order/${bidId}`),
  verifyPayment: (data) => api.post("/payments/razorpay/verify", data),
};
