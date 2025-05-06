"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import productsData from "../data/products.json";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    window.scrollTo(0, 0);

    setTimeout(() => {
      const foundProduct = productsData.find(
        (p) => p.id === Number.parseInt(id)
      );

      if (foundProduct) {
        setProduct(foundProduct);
        setMainImage(foundProduct.image);

        // Get related products from the same category
        const related = productsData
          .filter(
            (p) =>
              p.category_id === foundProduct.category_id &&
              p.id !== foundProduct.id
          )
          .slice(0, 4);

        setRelatedProducts(related);
      }

      setLoading(false);
    }, 500);
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = Number.parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    try {
      addToCart(product.id, quantity);
      alert("Product added to cart!");
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (!product) {
    return <div className="error-message">Product not found.</div>;
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-images">
          <div className="main-image">
            <img src={mainImage || "/placeholder.svg"} alt={product.name} />
          </div>
          <div className="image-thumbnails">
            <button
              className={`thumbnail ${
                mainImage === product.image ? "active" : ""
              }`}
              onClick={() => setMainImage(product.image)}
            >
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
              />
            </button>
            {/* In a real app, you would have multiple images */}
            <button className="thumbnail">
              <img
                src={`https://source.unsplash.com/random/100x100/?${product.category.toLowerCase()}`}
                alt="Product view"
              />
            </button>
            <button className="thumbnail">
              <img
                src={`https://source.unsplash.com/random/100x100/?${product.category.toLowerCase()},product`}
                alt="Product view"
              />
            </button>
            <button className="thumbnail">
              <img
                src={`https://source.unsplash.com/random/100x100/?${product.category.toLowerCase()},detail`}
                alt="Product view"
              />
            </button>
          </div>
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-meta">
            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`fa fa-star${
                      i < Math.floor(product.rating)
                        ? ""
                        : i < product.rating
                        ? "-half-o"
                        : "-o"
                    }`}
                  ></i>
                ))}
              </div>
              <span className="rating-count">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
            <div className="product-category">
              Category: <span>{product.category}</span>
            </div>
          </div>

          <div className="product-price">${product.price.toFixed(2)}</div>

          <div className="product-stock">
            {product.stock > 0 ? (
              <span className="in-stock">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>

          <div className="product-short-description">
            <p>{product.description}</p>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <button onClick={decrementQuantity} disabled={quantity <= 1}>
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={product.stock}
              />
              <button
                onClick={incrementQuantity}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>

            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            <button className="wishlist-btn">
              <i className="fa fa-heart-o"></i> Add to Wishlist
            </button>
          </div>

          <div className="product-shipping-info">
            <div className="shipping-item">
              <i className="fa fa-truck"></i>
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="shipping-item">
              <i className="fa fa-shield"></i>
              <span>2-year warranty</span>
            </div>
            <div className="shipping-item">
              <i className="fa fa-refresh"></i>
              <span>30-day return policy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="product-tabs">
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === "description" ? "active" : ""}`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={`tab-btn ${
              activeTab === "specifications" ? "active" : ""
            }`}
            onClick={() => setActiveTab("specifications")}
          >
            Specifications
          </button>
          <button
            className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({product.reviews})
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === "description" && (
            <div className="tab-pane">
              <h3>Product Description</h3>
              <p>{product.description}</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                facilisi. Sed euismod, nisl vel ultricies lacinia, nisl nisl
                aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod,
                nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam
                nisl nisl sit amet nisl.
              </p>
              <p>
                Nulla facilisi. Sed euismod, nisl vel ultricies lacinia, nisl
                nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed
                euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl,
                eget aliquam nisl nisl sit amet nisl.
              </p>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="tab-pane">
              <h3>Technical Specifications</h3>
              <table className="specs-table">
                <tbody>
                  <tr>
                    <td>Brand</td>
                    <td>EthioShop</td>
                  </tr>
                  <tr>
                    <td>Model</td>
                    <td>ES-{product.id}00</td>
                  </tr>
                  <tr>
                    <td>Weight</td>
                    <td>0.5 kg</td>
                  </tr>
                  <tr>
                    <td>Dimensions</td>
                    <td>20 x 15 x 5 cm</td>
                  </tr>
                  <tr>
                    <td>Material</td>
                    <td>Premium Quality</td>
                  </tr>
                  <tr>
                    <td>Color</td>
                    <td>As shown</td>
                  </tr>
                  <tr>
                    <td>Warranty</td>
                    <td>2 Years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="tab-pane">
              <h3>Customer Reviews</h3>
              <div className="reviews-summary">
                <div className="average-rating">
                  <div className="rating-number">
                    {product.rating.toFixed(1)}
                  </div>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`fa fa-star${
                          i < Math.floor(product.rating)
                            ? ""
                            : i < product.rating
                            ? "-half-o"
                            : "-o"
                        }`}
                      ></i>
                    ))}
                  </div>
                  <div className="rating-count">
                    Based on {product.reviews} reviews
                  </div>
                </div>
                <button className="write-review-btn">Write a Review</button>
              </div>

              <div className="reviews-list">
                <div className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
                        alt="Sarah Johnson"
                      />
                      <div>
                        <h4>Sarah Johnson</h4>
                        <span className="review-date">2 days ago</span>
                      </div>
                    </div>
                    <div className="review-rating">
                      <div className="stars">
                        <i className="fa fa-star"></i>
                        <i className="fa fa-star"></i>
                        <i className="fa fa-star"></i>
                        <i className="fa fa-star"></i>
                        <i className="fa fa-star"></i>
                      </div>
                    </div>
                  </div>
                  <div className="review-content">
                    <p>
                      This product exceeded my expectations! The quality is
                      excellent and it arrived earlier than expected. I would
                      definitely recommend it to anyone looking for a reliable
                      product.
                    </p>
                  </div>
                </div>

                <div className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
                        alt="Michael Chen"
                      />
                      <div>
                        <h4>Michael Chen</h4>
                        <span className="review-date">1 week ago</span>
                      </div>
                    </div>
                    <div className="review-rating">
                      <div className="stars">
                        <i className="fa fa-star"></i>
                        <i className="fa fa-star"></i>
                        <i className="fa fa-star"></i>
                        <i className="fa fa-star"></i>
                        <i className="fa fa-star-o"></i>
                      </div>
                    </div>
                  </div>
                  <div className="review-content">
                    <p>
                      Great product for the price. It works as described and the
                      shipping was fast. The only reason I'm giving it 4 stars
                      instead of 5 is because the packaging could have been
                      better.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>Related Products</h2>
          <div className="related-products-grid">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="related-product-item">
                <Link
                  to={`/products/${relatedProduct.id}`}
                  className="related-product-link"
                >
                  <div className="related-product-image">
                    <img
                      src={relatedProduct.image || "/placeholder.svg"}
                      alt={relatedProduct.name}
                    />
                  </div>
                  <div className="related-product-info">
                    <h3>{relatedProduct.name}</h3>
                    <div className="related-product-price">
                      ${relatedProduct.price.toFixed(2)}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
