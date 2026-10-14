/**
 * ============================================================
 * Centralized API Service for Frontend
 * ============================================================
 *
 * Communicates with Node.js Express REST API backend
 * with JWT Authorization
 */

// ============================================================
// BASE API URL
// ============================================================

const BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:5050/api'
).replace(/\/$/, '');


// ============================================================
// COMMON ADMIN REQUEST FUNCTION
// ============================================================

async function request(path, options = {}) {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const token = localStorage.getItem('pos_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {

      if (
        response.status === 401 &&
        window.location.pathname.startsWith('/admin')
      ) {
        localStorage.removeItem('pos_token');
        localStorage.removeItem('pos_user');

        window.location.href = '/login';
      }

      const errorMsg =
        data.error ||
        data.message ||
        `Request failed with status ${response.status}`;

      throw new Error(errorMsg);
    }

    return data;

  } catch (error) {

    console.error(
      `API Error: ${path}`,
      error.message
    );

    throw error;
  }
}


// ============================================================
// CUSTOMER REQUEST FUNCTION
// ============================================================

async function customerRequest(path, options = {}) {

  const url =
    `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const token =
    localStorage.getItem('customer_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {

    const response = await fetch(url, config);

    const data =
      await response.json().catch(() => ({}));

    if (!response.ok) {

      if (
        response.status === 401 &&
        !window.location.pathname.startsWith('/admin')
      ) {

        localStorage.removeItem('customer_token');
        localStorage.removeItem('store_customer');
        localStorage.removeItem('customer_registered');

        if (
          window.location.pathname !== '/customer-login' &&
          window.location.pathname !== '/customer-register' &&
          window.location.pathname !== '/track'
        ) {
          window.location.href = '/customer-login';
        }
      }

      const errorMsg =
        data.error ||
        data.message ||
        `Request failed with status ${response.status}`;

      throw new Error(errorMsg);
    }

    return data;

  } catch (error) {

    console.error(
      `Customer API Error: ${path}`,
      error.message
    );

    throw error;
  }
}


// ============================================================
// API SERVICES
// ============================================================

export const api = {

  // ==========================================================
  // HEALTH
  // ==========================================================

  checkHealth: () =>
    request('/health'),


  // ==========================================================
  // SETTINGS
  // ==========================================================

  getSettings: () =>
    request('/settings'),

  updateSettings: (data) =>
    request('/settings', {
      method: 'PUT',
      body: data
    }),


  // ==========================================================
  // DELIVERY AVAILABILITY
  // ==========================================================

  checkDeliveryAvailability: (value) =>
    customerRequest(
      `/delivery-zones/check/${encodeURIComponent(
        String(value || '').trim()
      )}`
    ),


  // ==========================================================
  // PRODUCTS & INVENTORY
  // ==========================================================

  getProducts: (params = {}) => {

    const query =
      new URLSearchParams(params).toString();

    return request(
      `/products${query ? `?${query}` : ''}`
    );
  },

  getLowStock: () =>
    request('/products/low-stock'),

  getExpiringProducts: (days = 30) =>
    request(`/products/expiring?days=${days}`),

  getProductByBarcode: (barcode) =>
    request(
      `/products/barcode/${encodeURIComponent(barcode)}`
    ),

  createProduct: (data) =>
    request('/products', {
      method: 'POST',
      body: data
    }),

  updateProduct: (id, data) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: data
    }),

  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE'
    }),


  // ==========================================================
  // SALES & POS BILLING
  // ==========================================================

  createSale: (saleData) =>
    request('/sales', {
      method: 'POST',
      body: saleData
    }),

  getSales: (params = {}) => {

    const query =
      new URLSearchParams(params).toString();

    return request(
      `/sales${query ? `?${query}` : ''}`
    );
  },

  getSaleById: (id) =>
    request(`/sales/${id}`),


  // ==========================================================
  // GOODS RECEIVING / PURCHASES
  // ==========================================================

  createPurchase: (data) =>
    request('/purchases', {
      method: 'POST',
      body: data
    }),

  getPurchases: (params = {}) => {

    const query =
      new URLSearchParams(params).toString();

    return request(
      `/purchases${query ? `?${query}` : ''}`
    );
  },

  getPurchaseById: (id) =>
    request(`/purchases/${id}`),

  deletePurchase: (id) =>
    request(`/purchases/${id}`, {
      method: 'DELETE'
    }),


  // ==========================================================
  // RETURNS & REFUNDS
  // ==========================================================

  createReturn: (data) =>
    request('/returns', {
      method: 'POST',
      body: data
    }),

  getReturns: (params = {}) => {

    const query =
      new URLSearchParams(params).toString();

    return request(
      `/returns${query ? `?${query}` : ''}`
    );
  },

  getReturnById: (id) =>
    request(`/returns/${id}`),


  // ==========================================================
  // CUSTOMERS
  // ==========================================================

  getCustomers: (params = {}) => {

    const query =
      new URLSearchParams(params).toString();

    return request(
      `/customers${query ? `?${query}` : ''}`
    );
  },


  // ==========================================================
  // CUSTOMER REGISTRATION
  // ==========================================================

  registerCustomer: (data) =>
    customerRequest('/customers/register', {
      method: 'POST',
      body: data
    }),


  // ==========================================================
  // CUSTOMER LOGIN
  // ==========================================================

  loginCustomer: (data) =>
    customerRequest('/customers/login', {
      method: 'POST',
      body: data
    }),


  // ==========================================================
  // CUSTOMER PROFILE
  // ==========================================================

  getCustomerProfile: (id) =>
    customerRequest(`/customers/${id}`),

  updateCustomerProfile: (id, data) =>
    customerRequest(`/customers/${id}`, {
      method: 'PUT',
      body: data
    }),


  // ==========================================================
  // ADMIN CUSTOMER MANAGEMENT
  // ==========================================================

  createCustomer: (data) =>
    request('/customers', {
      method: 'POST',
      body: data
    }),

  updateCustomer: (id, data) =>
    request(`/customers/${id}`, {
      method: 'PUT',
      body: data
    }),

  deleteCustomer: (id) =>
    request(`/customers/${id}`, {
      method: 'DELETE'
    }),


  // ==========================================================
  // CUSTOMER LEDGER
  // ==========================================================

  getCustomerLedger: (id) =>
    request(`/customers/${id}/ledger`),

  recordCustomerPayment: (id, data) =>
    request(`/customers/${id}/payments`, {
      method: 'POST',
      body: data
    }),


  // ==========================================================
  // SUPPLIERS
  // ==========================================================

  getSuppliers: (params = {}) => {

    const query =
      new URLSearchParams(params).toString();

    return request(
      `/suppliers${query ? `?${query}` : ''}`
    );
  },

  createSupplier: (data) =>
    request('/suppliers', {
      method: 'POST',
      body: data
    }),

  updateSupplier: (id, data) =>
    request(`/suppliers/${id}`, {
      method: 'PUT',
      body: data
    }),

  deleteSupplier: (id) =>
    request(`/suppliers/${id}`, {
      method: 'DELETE'
    }),


  // ==========================================================
  // EXPENSES
  // ==========================================================

  getExpenses: (params = {}) => {

    const query =
      new URLSearchParams(params).toString();

    return request(
      `/expenses${query ? `?${query}` : ''}`
    );
  },

  createExpense: (data) =>
    request('/expenses', {
      method: 'POST',
      body: data
    }),

  deleteExpense: (id) =>
    request(`/expenses/${id}`, {
      method: 'DELETE'
    }),


  // ==========================================================
  // EXPENSE CATEGORIES
  // ==========================================================

  getExpenseCategories: () =>
    request('/expense-categories'),

  getAllExpenseCategories: () =>
    request('/expense-categories/all'),

  createExpenseCategory: (data) =>
    request('/expense-categories', {
      method: 'POST',
      body: data
    }),

  updateExpenseCategory: (id, data) =>
    request(`/expense-categories/${id}`, {
      method: 'PUT',
      body: data
    }),

  deleteExpenseCategory: (id) =>
    request(`/expense-categories/${id}`, {
      method: 'DELETE'
    }),


  // ==========================================================
  // REPORTS & ANALYTICS
  // ==========================================================

  getDashboard: () =>
    request('/reports/dashboard'),

  getAnalytics: () =>
    request('/reports/analytics'),


  // ==========================================================
  // STAFF MANAGEMENT
  // ==========================================================

  getStaff: () =>
    request('/staff'),

  getStaffById: (id) =>
    request(`/staff/${id}`),

  createStaff: (data) =>
    request('/staff', {
      method: 'POST',
      body: data
    }),

  updateStaff: (id, data) =>
    request(`/staff/${id}`, {
      method: 'PUT',
      body: data
    }),

  deleteStaff: (id) =>
    request(`/staff/${id}`, {
      method: 'DELETE'
    }),


  // ==========================================================
  // STAFF ROLES
  // ==========================================================

  getStaffRoles: () =>
    request('/staff-roles'),

  getStaffRoleById: (id) =>
    request(`/staff-roles/${id}`),

  createStaffRole: (data) =>
    request('/staff-roles', {
      method: 'POST',
      body: data
    }),

  updateStaffRole: (id, data) =>
    request(`/staff-roles/${id}`, {
      method: 'PUT',
      body: data
    }),

  deleteStaffRole: (id) =>
    request(`/staff-roles/${id}`, {
      method: 'DELETE'
    }),


  // ==========================================================
  // STAFF ATTENDANCE
  // ==========================================================

  getAttendance: () =>
    request('/staff/attendance/all'),

  createAttendance: (data) =>
    request('/staff/attendance', {
      method: 'POST',
      body: data
    }),


  // ==========================================================
  // STAFF PAYROLL
  // ==========================================================

  getPayroll: () =>
    request('/staff/payroll/all'),

  createPayroll: (data) =>
    request('/staff/payroll', {
      method: 'POST',
      body: data
    }),


  // ==========================================================
  // AUDIT LOGS
  // ==========================================================

  getAuditLogs: (limit = 100) =>
    request(`/audit?limit=${limit}`),


  // ==========================================================
  // ADMIN AUTHENTICATION & USERS
  // ==========================================================

  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: credentials
    }),

  getUsers: () =>
    request('/auth/users'),

  createUser: (data) =>
    request('/auth/users', {
      method: 'POST',
      body: data
    }),

  deleteUser: (id) =>
    request(`/auth/users/${id}`, {
      method: 'DELETE'
    }),


  // ==========================================================
  // ONLINE ORDERS - ADMIN
  // ==========================================================

  getOnlineOrders: (params = {}) => {

    const query =
      new URLSearchParams(params).toString();

    return request(
      `/orders${query ? `?${query}` : ''}`
    );
  },

  createOnlineOrder: (data) =>
    request('/orders', {
      method: 'POST',
      body: data
    }),

  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, {
      method: 'PUT',
      body: { status }
    }),

  updateRiderLocation: (id, data) =>
    request(`/orders/${id}/location`, {
      method: 'POST',
      body: data
    }),


  // ==========================================================
  // CUSTOMER ORDER TRACKING
  // ==========================================================
  //
  // IMPORTANT:
  // Backend route:
  // GET /api/orders/track/:query
  //
  // This supports:
  // 1. Mobile number
  // 2. Order number
  // 3. Order ID
  //
  // Example:
  // /api/orders/track/9876543210
  // /api/orders/track/WEB-248415
  //
  // ==========================================================

  trackCustomerOrder: async (query) => {

    const value =
      String(query || '').trim();

    if (!value) {
      return [];
    }

    try {

      const result =
        await customerRequest(
          `/orders/track/${encodeURIComponent(value)}`
        );

      // Backend returns array
      if (Array.isArray(result)) {
        return result;
      }

      // Backend returns { orders: [...] }
      if (Array.isArray(result?.orders)) {
        return result.orders;
      }

      // Backend returns { order: {...} }
      if (result?.order) {
        return [result.order];
      }

      // Backend returns single order object
      if (
        result &&
        typeof result === 'object' &&
        (
          result.order_number ||
          result.id ||
          result.customer_phone
        )
      ) {
        return [result];
      }

      return [];

    } catch (error) {

      console.warn(
        'Primary tracking endpoint failed:',
        error.message
      );

      // ======================================================
      // FALLBACK
      // ======================================================
      //
      // This fallback works when customer is logged in.
      //

      try {

        const orders =
          await customerRequest(
            '/orders/my-orders'
          );

        const list =
          Array.isArray(orders)
            ? orders
            : Array.isArray(orders?.orders)
              ? orders.orders
              : [];

        const search =
          value.toLowerCase();

        return list.filter((order) => {

          const orderNumber =
            String(
              order.order_number || ''
            ).toLowerCase();

          const orderId =
            String(
              order.id || ''
            ).toLowerCase();

          const phone =
            String(
              order.customer_phone || ''
            ).toLowerCase();

          const customerName =
            String(
              order.customer_name || ''
            ).toLowerCase();

          return (
            orderNumber === search ||
            orderId === search ||
            phone === search ||
            customerName.includes(search)
          );
        });

      } catch (fallbackError) {

        console.error(
          'Unable to load customer orders:',
          fallbackError
        );

        return [];
      }
    }
  },


  // ==========================================================
  // LIVE RIDER GPS TRACKING
  // ==========================================================
  //
  // Backend route:
  // GET /api/orders/track/:query/live
  //
  // Example:
  // /api/orders/track/WEB-248415/live
  //
  // ==========================================================

  getLiveOrderTracking: async (query) => {

    const value =
      String(query || '').trim();

    if (!value) {
      return null;
    }

    try {

      return await customerRequest(
        `/orders/track/${encodeURIComponent(value)}/live`
      );

    } catch (error) {

      console.error(
        'Live tracking API error:',
        error.message
      );

      return null;
    }
  },


  // ==========================================================
  // CUSTOMER ONLINE ORDERS
  // ==========================================================

  createCustomerOnlineOrder: (data) =>
    customerRequest('/orders', {
      method: 'POST',
      body: data
    }),

  getCustomerOnlineOrders: () =>
    customerRequest('/orders/my-orders'),

  getCustomerOnlineOrderById: (id) =>
    customerRequest(`/orders/my-orders/${id}`),


  // ==========================================================
  // CASH SHIFTS
  // ==========================================================

  getCurrentShift: () =>
    request('/shifts/current'),

  openShift: (data) =>
    request('/shifts/open', {
      method: 'POST',
      body: data
    }),

  closeShift: (data) =>
    request('/shifts/close', {
      method: 'POST',
      body: data
    }),

  getShifts: () =>
    request('/shifts')
};