"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import productsData from "../data/products.json";
import categoriesData from "../data/categories.json";
import "./HomePage.css";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls
    setLoading(true);

    // Get featured products
    setTimeout(() => {
      const featured = productsData.filter((product) => product.is_featured);
      setFeaturedProducts(featured);
      setCategories(categoriesData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Discover Quality Products for Your Lifestyle</h1>
          <p>
            Shop our curated collection of premium products with fast delivery
            and secure payment options.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn-primary">
              Shop Now
            </Link>
            <Link to="/products" className="btn-secondary">
              Browse Categories
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop"
            alt="Hero"
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Browse our wide selection of products by category</p>
        </div>
        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              to={`/products?category=${category.id}`}
              key={category.id}
              className="category-card"
            >
              <div className="category-image">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                />
                <div className="category-overlay">
                  <h3>{category.name}</h3>
                  <p>{category.count} Products</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products-section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <p>Discover our most popular items loved by customers</p>
        </div>
        <div className="featured-products-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="featured-product-item">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <div className="view-all-container">
          <Link to="/products" className="btn-view-all">
            View All Products
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Our Customers Say</h2>
          <p>
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-avatar">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
                alt="Sarah Johnson"
              />
            </div>
            <h3>Sarah Johnson</h3>
            <p className="testimonial-role">Regular Customer</p>
            <p className="testimonial-content">
              I've been shopping here for over a year and the quality of
              products and customer service is consistently excellent. Highly
              recommend!
            </p>
            <div className="testimonial-rating">
              <i className="fa fa-star"></i>
              <i className="fa fa-star"></i>
              <i className="fa fa-star"></i>
              <i className="fa fa-star"></i>
              <i className="fa fa-star"></i>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-avatar">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
                alt="Michael Chen"
              />
            </div>
            <h3>Michael Chen</h3>
            <p className="testimonial-role">Tech Enthusiast</p>
            <p className="testimonial-content">
              The electronics section has the latest gadgets at competitive
              prices. Shipping is fast and the packaging is secure. Will
              definitely shop again.
            </p>
            <div className="testimonial-rating">
              <i className="fa fa-star"></i>
              <i className="fa fa-star"></i>
              <i className="fa fa-star"></i>
              <i className="fa fa-star"></i>
              <i className="fa fa-star-half-o"></i>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-avatar">
              <img
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1974&auto=format&fit=crop"
                alt="Amina Desta"
              />
            </div>
            <h3>Amina Desta</h3>
            <p className="testimonial-role">Fashion Blogger</p>
            <p className="testimonial-content">
              As someone from Ethiopia, I appreciate the seamless payment
              process through Chapa. The clothing collection is trendy and
              affordable!
            </p>
            <div className="testimonial-rating">
              <i className="fa fa-star"></i>
              <i className="fa fa-star"></i>
              <i className="fa fa-star"></i>
              <i className="fa fa-star"></i>
              <i className="fa fa-star"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Subscribe to Our Newsletter</h2>
          <p>
            Stay updated with our latest products, promotions, and exclusive
            offers
          </p>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" required />
            <button type="submit" className="btn-primary">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
