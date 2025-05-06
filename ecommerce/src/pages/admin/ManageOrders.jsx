"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ordersData from "../../data/oreders.json";
import "./ManageOrders.css";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);

    // Fetch orders
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setOrders(ordersData);
      setLoading(false);
    }, 500);
  }, []);

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_name.toLowerCase().includes(searchTerm.toLowerCase());
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
          return b.total_amount - a.total_amount;
        case "total-low":
          return a.total_amount - b.total_amount;
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

  // Handle order status update
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
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
            <i className="fa fa-search"></i>
          </div>

          <div className="filter-options">
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
              <label>Payment:</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-results">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className="order-number">{order.order_number}</div>
                    </td>
                    <td>
                      <div className="customer-name">{order.user_name}</div>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>${order.total_amount.toFixed(2)}</td>
                    <td>
                      <select
                        className={`status-select status-${order.status}`}
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <span
                        className={`payment-badge payment-${order.payment_status}`}
                      >
                        {order.payment_status.charAt(0).toUpperCase() +
                          order.payment_status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="btn-view"
                        >
                          <i className="fa fa-eye"></i>
                        </Link>
                        <button className="btn-print">
                          <i className="fa fa-print"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              <i className="fa fa-chevron-left"></i>
            </button>

            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`pagination-button ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              <i className="fa fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
