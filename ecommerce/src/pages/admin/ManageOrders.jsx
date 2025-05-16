"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Removed ordersData import as we are fetching from API
// import ordersData from "../../data/oreders.json";
import "./ManageOrders.css";
import axios from "../../utils/axios";
import {
  PrinterIcon,
  SearchIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"; // Added Trash2 and ChevronLeft/Right

// Simple Modal/Alert Component (Inline for demonstration)
const ConfirmationModal = ({ message, onConfirm, onCancel, show }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Confirm Action</h2>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [error, setError] = useState(null); // Added error state

  // State for the custom confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);

    // Fetch orders
    fetchOrders();
  }, []); // Empty dependency array means this runs once on mount

  // Function to fetch orders from the backend API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      // Assuming the backend route /admin/orders is protected and returns all orders for admin
      const response = await axios.get("/orders"); // Changed to /admin/orders as per route definition
      if (response.data.status === "success") {
        // Ensure data is an array, default to empty array if not
        const fetchedOrders = response.data.data || [];
        // Add a unique order_number if not present (based on ID for display)
        const ordersWithNumbers = fetchedOrders.map((order) => ({
          ...order,
          order_number: order.order_number || `ORD-${order.id}`, // Generate if missing
        }));
        setOrders(ordersWithNumbers);
        console.log("Fetched orders:", ordersWithNumbers);
        setError(null);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      // Search by order number or customer name
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()); // Use optional chaining for user

      const matchesStatus =
        statusFilter === "" || order.status === statusFilter;
      const matchesPayment =
        paymentFilter === "" || order.payment_status === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "total-high":
          return Number(b.total_amount) - Number(a.total_amount);
        case "total-low":
          return Number(a.total_amount) - Number(b.total_amount);
        case "newest":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- Delete Functionality with Custom Modal ---

  // Function to open the delete confirmation modal
  const confirmDelete = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  // Function to handle the actual deletion after confirmation
  const handleDelete = async () => {
    if (!orderToDelete) return; // Should not happen if modal is shown correctly

    setShowDeleteModal(false); // Close the modal
    setLoading(true); // Show loading state

    try {
      // Assuming the backend route for deleting an order is DELETE /admin/orders/{order}
      const response = await axios.delete(`/orders/${orderToDelete.id}`);

      if (response.data.status === "success") {
        // Remove the deleted order from the local state
        setOrders(orders.filter((order) => order.id !== orderToDelete.id));
        console.log(`Order ${orderToDelete.id} deleted successfully.`);
        // Reset orderToDelete state
        setOrderToDelete(null);
        // If the current page is now empty and not the first page, go back one page
        if (currentOrders.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        console.error("Failed to delete order:", response.data.message);
        setError(response.data.message || "Failed to delete order");
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      setError(err.response?.data?.message || "Failed to delete order");
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  // Function to cancel the delete action
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  // --- End Delete Functionality ---

  // Handle print action (Placeholder)
  const handlePrint = (orderId) => {
    // TODO: Implement actual print logic
    console.log("Printing order:", orderId);
    // You might open a new window with a printable view of the order,
    // or trigger a PDF generation from the backend.
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
          <button
            onClick={fetchOrders} // Retry fetching data
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Retry Loading Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-orders">
      <div className="page-header">
        <h1>Manage Orders</h1>
      </div>

      <div className="admin-card">
        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="w-4 h-4 text-gray-500" />{" "}
            {/* Added text color */}
          </div>

          <div className="filter-options">
            <div className="filter-group">
              <label className="text-gray-700 dark:text-gray-300">
                Status:
              </label>{" "}
              {/* Added text color */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select" // Added class for potential styling
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="text-gray-700 dark:text-gray-300">
                Payment:
              </label>{" "}
              {/* Added text color */}
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="form-select" // Added class for potential styling
              >
                <option value="">All Payments</option>
                <option value="pending">Pending</option>{" "}
                {/* Changed order to match backend */}
                <option value="completed">Completed</option>{" "}
                {/* Changed from paid to completed */}
                <option value="failed">Failed</option>{" "}
                {/* Added failed status */}
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="text-gray-700 dark:text-gray-300">
                Sort By:
              </label>{" "}
              {/* Added text color */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select" // Added class for potential styling
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="total-high">Total (High to Low)</option>
                <option value="total-low">Total (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                {/* Removed Status column from table header as it's now in actions */}
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-results text-center py-4">
                    {" "}
                    {/* Adjusted colspan and added styling */}
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      {/* Link to view order details */}
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="order-number hover:underline text-indigo-600 dark:text-indigo-400"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td>
                      <div className="customer-name">
                        {order.user?.name || "N/A"}
                      </div>{" "}
                      {/* Use optional chaining */}
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>${Number(order.total_amount).toFixed(2)}</td>

                    <td>
                      <span
                        className={`payment-badge payment-${order.payment_status}`}
                      >
                        {order.payment_status.charAt(0).toUpperCase() +
                          order.payment_status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons flex items-center space-x-2">
                        {" "}
                        {/* Added flex and spacing */}
                        {/* Status Badge (Moved from separate column) */}
                        <span className={`status-badge status-${order.status}`}>
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                        {/* Print Button */}
                        <button
                          className="btn-icon btn-print"
                          onClick={() => handlePrint(order.id)}
                          title="Print Order"
                        >
                          <PrinterIcon className="w-4 h-4" />
                        </button>
                        {/* Delete Button */}
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => confirmDelete(order)} // Call confirmDelete to show modal
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination flex justify-center items-center mt-4 space-x-2">
            {" "}
            {/* Added flex and spacing */}
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" // Added Tailwind classes
            >
              <ChevronLeft className="w-4 h-4" /> {/* Used Lucide icon */}
            </button>
            {/* Render page number buttons */}
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`pagination-button px-3 py-1 rounded-md border ${
                  currentPage === index + 1
                    ? "bg-indigo-600 text-white border-indigo-600" // Active state
                    : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" // Inactive state
                } text-sm font-medium`} // Added Tailwind classes
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" // Added Tailwind classes
            >
              <ChevronRight className="w-4 h-4" /> {/* Used Lucide icon */}
            </button>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteModal}
        message={`Are you sure you want to delete order ${
          orderToDelete?.order_number || ""
        }? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default ManageOrders;
