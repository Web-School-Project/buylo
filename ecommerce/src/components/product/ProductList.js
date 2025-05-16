"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import ProductCard from "./ProductCard"
import productsData from "../../data/products.json"
import "./ProductList.css"

const ProductList = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(8)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [sortOption, setSortOption] = useState("featured")

  const categoryId = searchParams.get("category") ? Number.parseInt(searchParams.get("category")) : null
  const searchQuery = searchParams.get("search") || ""

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      setProducts(productsData)
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    if (products.length > 0) {
      let result = [...products]

      // Apply category filter
      if (categoryId) {
        result = result.filter((product) => product.category_id === categoryId)
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        result = result.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query),
        )
      }

      // Apply sorting
      switch (sortOption) {
        case "price-low":
          result.sort((a, b) => a.price - b.price)
          break
        case "price-high":
          result.sort((a, b) => b.price - a.price)
          break
        case "rating":
          result.sort((a, b) => b.rating - a.rating)
          break
        case "newest":
          // In a real app, you would sort by date
          // Here we'll just use the ID as a proxy for "newest"
          result.sort((a, b) => b.id - a.id)
          break
        case "featured":
        default:
          result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
          break
      }

      setFilteredProducts(result)
      setCurrentPage(1) // Reset to first page when filters change
    }
  }, [products, categoryId, searchQuery, sortOption])

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) {
    return <div className="loading">Loading products...</div>
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <div className="product-count">{filteredProducts.length} Products Found</div>
        <div className="product-sort">
          <label htmlFor="sort">Sort by:</label>
          <select id="sort" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>No products found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {currentProducts.map((product) => (
              <div key={product.id} className="product-grid-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredProducts.length > productsPerPage && (
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>

              {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`pagination-button ${currentPage === index + 1 ? "active" : ""}`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProductList
