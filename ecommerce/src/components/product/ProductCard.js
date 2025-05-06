"use client"

import { useContext } from "react"
import { Link } from "react-router-dom"
import { CartContext } from "../../context/CartContext"
import "./ProductCard.css"

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      addToCart(product.id, 1)
      alert("Product added to cart!")
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-link">
        <div className="product-image">
          <img src={product.image || "/placeholder.svg"} alt={product.name} />
          {product.stock < 10 && product.stock > 0 && <span className="product-badge low-stock">Low Stock</span>}
          {product.stock === 0 && <span className="product-badge out-of-stock">Out of Stock</span>}
          {product.is_featured && <span className="product-badge featured">Featured</span>}
        </div>
        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          <div className="product-category">{product.category}</div>
          <div className="product-rating">
            <span className="stars">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`fa fa-star${i < Math.floor(product.rating) ? "" : i < product.rating ? "-half-o" : "-o"}`}
                ></i>
              ))}
            </span>
            <span className="rating-count">({product.reviews})</span>
          </div>
          <div className="product-price">${product.price.toFixed(2)}</div>
        </div>
      </Link>
      <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={product.stock === 0}>
        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  )
}

export default ProductCard
