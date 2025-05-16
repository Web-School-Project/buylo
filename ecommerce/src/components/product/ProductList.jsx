"use client";

import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import ProductCard from "./ProductCard";
import "./ProductList.css";

const ProductList = ({ categoryId, searchQuery, priceRange }) => {
  const [products, setProducts] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("featured");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: products.current_page,
          category_id: categoryId || "",
          search: searchQuery || "",
          min_price: priceRange[0],
          max_price: priceRange[1],
          sort: sortOption,
        });

        const response = await axios.get(`/products`);
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, searchQuery, priceRange, sortOption, products.current_page]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setProducts((prev) => ({ ...prev, current_page: 1 })); // Reset to first page when sort changes
  };

  const handlePageChange = (page) => {
    setProducts((prev) => ({ ...prev, current_page: page }));
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <div className="product-count">{products.total} Products Found</div>
        <div className="product-sort">
          <label htmlFor="sort">Sort by:</label>
          <select id="sort" value={sortOption} onChange={handleSortChange}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {products.data.length === 0 ? (
        <div className="no-products">
          <p>No products found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.data.map((product) => (
              <div key={product.id} className="product-grid-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {products.last_page > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(products.current_page - 1)}
                disabled={products.current_page === 1}
                className="pagination-button"
              >
                Previous
              </button>

              {Array.from({ length: products.last_page }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`pagination-button ${
                    products.current_page === index + 1 ? "active" : ""
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(products.current_page + 1)}
                disabled={products.current_page === products.last_page}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;
