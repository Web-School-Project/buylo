"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductList from "../components/product/ProductList";
import categoriesData from "../data/categories.json";
import "./ProductPage.css";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category")
      ? Number.parseInt(searchParams.get("category"))
      : null
  );
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setCategories(categoriesData);
      setLoading(false);
    }, 300);
  }, []);

  const handleCategoryChange = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      searchParams.delete("category");
    } else {
      setSelectedCategory(categoryId);
      searchParams.set("category", categoryId.toString());
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm) {
      searchParams.set("search", searchTerm);
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPriceRange([0, Number.parseInt(value)]);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="products-page">
      <h1 className="page-title">All Products</h1>

      <div className="products-container">
        {/* Filters Sidebar */}
        <div className="filters-sidebar">
          <div className="filter-section">
            <h3>Search Products</h3>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          </div>

          <div className="filter-section">
            <h3>Categories</h3>
            <div className="categories-filter">
              {categories.map((category) => (
                <div key={category.id} className="category-checkbox">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={selectedCategory === category.id}
                    onChange={() => handleCategoryChange(category.id)}
                  />
                  <label htmlFor={`category-${category.id}`}>
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-filter">
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={priceRange[1]}
                onChange={handlePriceChange}
                className="price-slider"
              />
              <div className="price-range-values">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h3>Rating</h3>
            <div className="rating-filter">
              <div className="rating-checkbox">
                <input type="checkbox" id="rating-4" />
                <label htmlFor="rating-4">
                  <span className="stars">
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star-o"></i>
                  </span>
                  & Up
                </label>
              </div>
              <div className="rating-checkbox">
                <input type="checkbox" id="rating-3" />
                <label htmlFor="rating-3">
                  <span className="stars">
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star-o"></i>
                    <i className="fa fa-star-o"></i>
                  </span>
                  & Up
                </label>
              </div>
              <div className="rating-checkbox">
                <input type="checkbox" id="rating-2" />
                <label htmlFor="rating-2">
                  <span className="stars">
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star-o"></i>
                    <i className="fa fa-star-o"></i>
                    <i className="fa fa-star-o"></i>
                  </span>
                  & Up
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="products-content">
          <ProductList />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
