"use client";

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const { cart, loading: cartLoading, clearCart } = useContext(CartContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Ethiopia",
  });

  const [paymentMethod, setPaymentMethod] = useState("chapa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);

    // Pre-fill form with user data if available
    if (user) {
      setFormData({
        ...formData,
        firstName: user.name.split(" ")[0] || "",
        lastName: user.name.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const calculateShipping = () => {
    // Free shipping for orders over $100
    return cart.total > 100 ? 0 : 10;
  };

  const calculateTotal = () => {
    return cart.total + calculateShipping();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // In a real app, this would call your API to process the order
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Clear cart after successful order
      await clearCart();

      // Redirect to success page
      navigate("/checkout/success");
    } catch (error) {
      setError(
        "An error occurred while processing your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return <div className="loading">Loading checkout information...</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-cart-message">
          <h2>Your cart is empty</h2>
          <p>
            You need to add items to your cart before proceeding to checkout.
          </p>
          <button onClick={() => navigate("/products")} className="btn-primary">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="page-title">Checkout</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="checkout-container">
        <div className="checkout-form-container">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h2>Contact Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Shipping Address</h2>
              <div className="form-group">
                <label htmlFor="address">Street Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State/Region *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="zipCode">Postal/Zip Code *</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <div className="payment-method">
                  <input
                    type="radio"
                    id="chapa"
                    name="paymentMethod"
                    value="chapa"
                    checked={paymentMethod === "chapa"}
                    onChange={() => setPaymentMethod("chapa")}
                  />
                  <label htmlFor="chapa">
                    <div className="payment-logo">
                      <img
                        src="https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?q=80&w=2069&auto=format&fit=crop"
                        alt="Chapa"
                      />
                    </div>
                    <div className="payment-info">
                      <span className="payment-name">
                        Chapa Payment (Ethiopia)
                      </span>
                      <span className="payment-description">
                        Secure payment via Chapa
                      </span>
                    </div>
                  </label>
                </div>

                <div className="payment-method">
                  <input
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  <label htmlFor="card">
                    <div className="payment-logo">
                      <i className="fa fa-credit-card"></i>
                    </div>
                    <div className="payment-info">
                      <span className="payment-name">Credit/Debit Card</span>
                      <span className="payment-description">
                        Pay with Visa, Mastercard, etc.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="payment-method">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <label htmlFor="cod">
                    <div className="payment-logo">
                      <i className="fa fa-money"></i>
                    </div>
                    <div className="payment-info">
                      <span className="payment-name">Cash on Delivery</span>
                      <span className="payment-description">
                        Pay when you receive your order
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="checkout-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/cart")}
              >
                Back to Cart
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </form>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cart.items.map((item) => (
              <div key={item.id} className="order-item">
                <div className="order-item-image">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} />
                  <span className="order-item-quantity">{item.quantity}</span>
                </div>
                <div className="order-item-details">
                  <span className="order-item-name">{item.name}</span>
                  <span className="order-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="order-total-row">
              <span>Subtotal</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            <div className="order-total-row">
              <span>Shipping</span>
              <span>
                {calculateShipping() === 0
                  ? "Free"
                  : `$${calculateShipping().toFixed(2)}`}
              </span>
            </div>
            <div className="order-total-row total">
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="secure-checkout">
            <i className="fa fa-lock"></i>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
