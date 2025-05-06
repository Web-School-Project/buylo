"use client";

import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ordersData from "../data/oreders.json";
import "./UserDashboard.css";

const UserDashboard = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("orders");
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);

    // Fetch user orders
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Filter orders for the current user
      const filteredOrders = ordersData.filter(
        (order) => order.user_id === user.id
      );
      setUserOrders(filteredOrders);

      // Set profile data
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });

      setLoading(false);
    }, 500);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    try {
      // Update profile
      await updateProfile(profileData);
      setUpdateSuccess(true);
      setIsEditing(false);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="user-dashboard">
      <h1 className="page-title">My Account</h1>

      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <div className="user-info">
            <div className="user-avatar">
              <img src={user.avatar || "/placeholder.svg"} alt={user.name} />
            </div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>

          <div className="dashboard-nav">
            <button
              className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <i className="fa fa-shopping-bag"></i>
              My Orders
            </button>
            <button
              className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <i className="fa fa-user"></i>
              Profile
            </button>
            <button
              className={`nav-item ${activeTab === "wishlist" ? "active" : ""}`}
              onClick={() => setActiveTab("wishlist")}
            >
              <i className="fa fa-heart"></i>
              Wishlist
            </button>
            <button
              className={`nav-item ${
                activeTab === "addresses" ? "active" : ""
              }`}
              onClick={() => setActiveTab("addresses")}
            >
              <i className="fa fa-map-marker"></i>
              Addresses
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {activeTab === "orders" && (
            <div className="dashboard-section">
              <h2>My Orders</h2>

              {userOrders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fa fa-shopping-bag"></i>
                  </div>
                  <h3>No orders yet</h3>
                  <p>
                    You haven't placed any orders yet. Start shopping to see
                    your orders here.
                  </p>
                  <Link to="/products" className="btn-primary">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="orders-list">
                  {userOrders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <span className="order-number">
                            Order #{order.order_number}
                          </span>
                          <span className="order-date">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="order-status">
                          <span
                            className={`status-badge status-${order.status}`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="order-items">
                        {order.items.map((item) => (
                          <div key={item.id} className="order-item">
                            <div className="item-name">{item.product_name}</div>
                            <div className="item-quantity">
                              x{item.quantity}
                            </div>
                            <div className="item-price">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-footer">
                        <div className="order-total">
                          <span>Total:</span>
                          <span className="total-amount">
                            ${order.total_amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="order-actions">
                          <button className="btn-secondary">Track Order</button>
                          <button className="btn-outline">View Details</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Profile Information</h2>
                {!isEditing && (
                  <button
                    className="btn-secondary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {updateSuccess && (
                <div className="success-message">
                  Profile updated successfully!
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleProfileUpdate} className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        required
                        disabled
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address">Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={updateLoading}
                    >
                      {updateLoading ? "Updating..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <div className="info-row">
                    <div className="info-label">Full Name</div>
                    <div className="info-value">{profileData.name}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Email Address</div>
                    <div className="info-value">{profileData.email}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Phone Number</div>
                    <div className="info-value">
                      {profileData.phone || "Not provided"}
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Address</div>
                    <div className="info-value">
                      {profileData.address || "Not provided"}
                    </div>
                  </div>
                </div>
              )}

              <div className="password-section">
                <h3>Change Password</h3>
                <p>For security reasons, you can change your password here.</p>
                <button className="btn-outline">Change Password</button>
              </div>
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="dashboard-section">
              <h2>My Wishlist</h2>
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fa fa-heart"></i>
                </div>
                <h3>Your wishlist is empty</h3>
                <p>
                  Save items you like to your wishlist and they will appear
                  here.
                </p>
                <Link to="/products" className="btn-primary">
                  Browse Products
                </Link>
              </div>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>My Addresses</h2>
                <button className="btn-secondary">Add New Address</button>
              </div>

              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fa fa-map-marker"></i>
                </div>
                <h3>No addresses saved</h3>
                <p>
                  Add your shipping and billing addresses for faster checkout.
                </p>
                <button className="btn-primary">Add Address</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
