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
  getUsersPaged: (page = 0, size = 10) =>
    api.get(`/admin/users/paged?page=${page}&size=${size}`),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export const cropService = {
  create: (data) => api.post("/crop-batches", data),
  getAll: () => api.get("/crop-batches"),
  getAllPaged: (page = 0, size = 6) =>
    api.get(`/crop-batches/paged?page=${page}&size=${size}`),
  getById: (id) => api.get(`/crop-batches/${id}`),
  update: (id, data) => api.put(`/crop-batches/${id}`, data),
  delete: (id) => api.delete(`/crop-batches/${id}`),
  getByFarmer: (farmerId) => api.get(`/crop-batches/farmer/${farmerId}`),
  getByFarmerPaged: (farmerId, page = 0, size = 6) =>
    api.get(`/crop-batches/farmer/${farmerId}/paged?page=${page}&size=${size}`),
  getByStatus: (status) => api.get(`/crop-batches/status/${status}`),
};

export const bidService = {
  create: (data) => api.post("/bids", data),
  getByCrop: (cropBatchId) => api.get(`/bids/crop/${cropBatchId}`),
  getByCropPaged: (cropBatchId, page = 0, size = 10) =>
    api.get(`/bids/crop/${cropBatchId}/paged?page=${page}&size=${size}`),
  getByRetailer: (retailerId) => api.get(`/bids/retailer/${retailerId}`),
  getByRetailerPaged: (retailerId, page = 0, size = 10) =>
    api.get(`/bids/retailer/${retailerId}/paged?page=${page}&size=${size}`),
  accept: (id) => api.put(`/bids/${id}/accept`),
  reject: (id) => api.put(`/bids/${id}/reject`),
  delete: (id) => api.delete(`/bids/${id}`),
};

export const orderService = {
  createFromBid: (bidId, deliveryAddress) =>
    api.post(`/orders/from-bid/${bidId}`, { deliveryAddress }),
  getById: (id) => api.get(`/orders/${id}`),
  getByFarmer: (farmerId) => api.get(`/orders/farmer/${farmerId}`),
  getByFarmerPaged: (farmerId, page = 0, size = 10) =>
    api.get(`/orders/farmer/${farmerId}/paged?page=${page}&size=${size}`),
  getByRetailer: (retailerId) => api.get(`/orders/retailer/${retailerId}`),
  getByRetailerPaged: (retailerId, page = 0, size = 10) =>
    api.get(`/orders/retailer/${retailerId}/paged?page=${page}&size=${size}`),
  getAll: () => api.get("/orders"),
  getAllPaged: (page = 0, size = 10) =>
    api.get(`/orders/paged?page=${page}&size=${size}`),
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

export const notificationService = {
  getByUser: (userId) => api.get(`/notifications/user/${userId}`),
  getUnreadCount: (userId) =>
    api.get(`/notifications/user/${userId}/unread-count`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
};

export const profileService = {
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
  forgotPassword: (email, method = "email") =>
    api.post("/auth/forgot-password", { email, method }),
  verifyOtp: (email, otp) => api.post("/auth/verify-otp", { email, otp }),
  resetPassword: (email, otp, newPassword) =>
    api.post("/auth/reset-password", { email, otp, newPassword }),
};

export const invoiceService = {
  download: (orderId) =>
    api.get(`/orders/${orderId}/invoice`, { responseType: "blob" }),
};
