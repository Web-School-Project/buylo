"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import productsData from "../../data/products.json";
import categoriesData from "../../data/categories.json";
import "./ManageProducts.css";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);

    // Fetch products
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setProducts(productsData);
      setLoading(false);
    }, 500);
  }, []);

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "" ||
        product.category_id.toString() === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "stock-low":
          return a.stock - b.stock;
        case "stock-high":
          return b.stock - a.stock;
        case "oldest":
          return a.id - b.id;
        case "newest":
        default:
          return b.id - a.id;
      }
    });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle product selection
  const toggleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentProducts.map((product) => product.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle product deletion
  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((product) => product.id !== productId));
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedProducts.length} selected products?`
      )
    ) {
      setProducts(
        products.filter((product) => !selectedProducts.includes(product.id))
      );
      setSelectedProducts([]);
      setSelectAll(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="manage-products">
      <div className="page-header">
        <h1>Manage Products</h1>
        <Link to="/admin/products/create" className="btn-primary">
          <i className="fa fa-plus"></i> Add New Product
        </Link>
      </div>

      <div className="admin-card">
        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fa fa-search"></i>
          </div>

          <div className="filter-options">
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categoriesData.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
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
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="stock-low">Stock (Low to High)</option>
                <option value="stock-high">Stock (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="bulk-actions">
            <span>{selectedProducts.length} products selected</span>
            <button className="btn-danger" onClick={handleBulkDelete}>
              <i className="fa fa-trash"></i> Delete Selected
            </button>
          </div>
        )}

        <div className="table-responsive">
          <table className="products-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-results">
                    No products found matching your criteria.
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => {
                  const category = categoriesData.find(
                    (c) => c.id === product.category_id
                  );

                  return (
                    <tr key={product.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                        />
                      </td>
                      <td>
                        <div className="product-image">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="product-name">{product.name}</div>
                        <div className="product-id">ID: {product.id}</div>
                      </td>
                      <td>{category?.name || "Uncategorized"}</td>
                      <td>${product.price.toFixed(2)}</td>
                      <td className={product.stock < 10 ? "low-stock" : ""}>
                        {product.stock}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            product.stock > 0 ? "in-stock" : "out-of-stock"
                          }`}
                        >
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="btn-edit"
                          >
                            <i className="fa fa-edit"></i>
                          </Link>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

export default ManageProducts;
