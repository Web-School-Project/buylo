"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import productsData from "../../data/products.json";
import ordersData from "../../data/oreders.json";
import usersData from "../../data/users.json";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      // Calculate dashboard stats
      const totalProducts = productsData.length;
      const totalOrders = ordersData.length;
      const totalUsers = usersData.length;
      const totalRevenue = ordersData.reduce(
        (sum, order) => sum + order.total_amount,
        0
      );

      // Get recent orders
      const recentOrders = [...ordersData]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      // Get low stock products
      const lowStockProducts = productsData
        .filter((product) => product.stock < 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

      setStats({
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        recentOrders,
        lowStockProducts,
      });

      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fa fa-box"></i>
          </div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <p className="stat-value">{stats.totalProducts}</p>
            <Link to="/admin/products" className="stat-link">
              View All
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fa fa-shopping-cart"></i>
          </div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
            <Link to="/admin/orders" className="stat-link">
              View All
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fa fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
            <Link to="/admin/users" className="stat-link">
              View All
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fa fa-dollar-sign"></i>
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2 className="section-title">Recent Orders</h2>
          {stats.recentOrders.length > 0 ? (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.order_number}</td>
                      <td>{order.user_name}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>${order.total_amount.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="action-link"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No recent orders found.</p>
          )}
          <div className="section-footer">
            <Link to="/admin/orders" className="view-all-link">
              View All Orders
            </Link>
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">Low Stock Products</h2>
          {stats.lowStockProducts.length > 0 ? (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>
                        <span className="low-stock-value">{product.stock}</span>
                      </td>
                      <td>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="action-link"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No low stock products found.</p>
          )}
          <div className="section-footer">
            <Link to="/admin/products" className="view-all-link">
              View All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
