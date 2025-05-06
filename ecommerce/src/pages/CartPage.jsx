"use client";

import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "./CartPage.css";

const CartPage = () => {
  const { cart, loading, updateCartItem, removeFromCart } =
    useContext(CartContext);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this item from your cart?"
      )
    ) {
      removeFromCart(itemId);
    }
  };

  const applyCoupon = () => {
    // In a real app, this would validate the coupon with your API
    if (couponCode.toLowerCase() === "discount10") {
      setCouponApplied(true);
      setDiscount(cart.total * 0.1); // 10% discount
    } else {
      alert("Invalid coupon code");
    }
  };

  const calculateShipping = () => {
    // Free shipping for orders over $100
    return cart.total > 100 ? 0 : 10;
  };

  const calculateTotal = () => {
    return cart.total - discount + calculateShipping();
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">Your Shopping Cart</h1>

      {cart.items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <i className="fa fa-shopping-cart"></i>
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-items">
            <div className="cart-header">
              <div className="cart-header-product">Product</div>
              <div className="cart-header-price">Price</div>
              <div className="cart-header-quantity">Quantity</div>
              <div className="cart-header-total">Total</div>
              <div className="cart-header-action"></div>
            </div>

            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-product">
                  <div className="cart-item-image">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                    />
                  </div>
                  <div className="cart-item-details">
                    <Link
                      to={`/products/${item.product_id}`}
                      className="cart-item-name"
                    >
                      {item.name}
                    </Link>
                  </div>
                </div>

                <div className="cart-item-price">${item.price.toFixed(2)}</div>

                <div className="cart-item-quantity">
                  <div className="quantity-selector">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.id,
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                <div className="cart-item-action">
                  <button
                    className="remove-item-btn"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            {couponApplied && (
              <div className="summary-row discount">
                <span>Discount (10%)</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span>
                {calculateShipping() === 0
                  ? "Free"
                  : `$${calculateShipping().toFixed(2)}`}
              </span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>

            <div className="coupon-section">
              <h3>Apply Coupon</h3>
              <div className="coupon-form">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button onClick={applyCoupon}>Apply</button>
              </div>
              {couponApplied && (
                <p className="coupon-success">Coupon applied successfully!</p>
              )}
            </div>

            <div className="cart-actions">
              <Link to="/products" className="btn-secondary">
                Continue Shopping
              </Link>
              <Link to="/checkout" className="btn-primary">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
