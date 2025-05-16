"use client";

import { useContext, useState } from "react";
// import { Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import "./ProductCard.css";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsAddingToCart(true);
      await addToCart(product, 1);
      // Show success message
      const successMessage = document.createElement("div");
      successMessage.className = "cart-success-message";
      successMessage.textContent = "Added to cart!";
      e.target.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 2000);
    } catch (error) {
      // Show error message
      const errorMessage = document.createElement("div");
      errorMessage.className = "cart-error-message";
      errorMessage.textContent = error.message;
      e.target.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 2000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Get the primary image or first image
  const productImage =
    product.images?.find((img) => img.is_primary)?.url ||
    product.images?.[0]?.url ||
    "/placeholder.svg";

  console.log(product);
  return (
    <div
      className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 border border-gray-100 flex flex-col h-full max-w-xs"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={`/products/${product.id}`}
        className="text-current no-underline flex flex-col flex-1"
      >
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
          <img
            src={productImage || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/40 flex flex-col justify-between p-4 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex flex-wrap gap-2">
          {product.stock < 10 && product.stock > 0 && (
                <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-800 rounded-full">
                  Low Stock
                </span>
          )}
          {product.stock === 0 && (
                <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wide bg-red-100 text-red-800 rounded-full">
                  Out of Stock
                </span>
          )}
          {product.is_featured && (
                <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-800 rounded-full">
                  Featured
                </span>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Implement quick view functionality
                  alert("Quick view clicked");
                }}
                aria-label="Quick view"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button
                className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Implement wishlist functionality
                  alert("Added to wishlist");
                }}
                aria-label="Add to wishlist"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            {product.category?.name}
          </div>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => {
                // Create star rating with full, half, and empty stars
                if (i < Math.floor(product.rating)) {
                  return (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  );
                } else if (i < product.rating) {
                  return (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                      <path
                        d="M12 2v15.77"
                        fill="none"
                        stroke="currentColor"
                      ></path>
                      <path d="M12 17.77v0" fill="none"></path>
                    </svg>
                  );
                } else {
                  return (
                    <svg
                  key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  );
                }
              })}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviews || 0})
            </span>
          </div>
          <div className="text-base font-bold text-gray-900 mt-auto pt-2">
            ${Number.parseFloat(product.price).toFixed(2)}
          </div>
        </div>
      </a>
      <button
        className={`w-full  h-10 flex items-center justify-center gap-2 text-xs font-semibold transition-colors duration-200 rounded-b-xl
          ${
            product.stock === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-900 text-white hover:bg-black"
          } ${isAddingToCart ? "bg-gray-700" : ""}`}
        onClick={handleAddToCart}
        disabled={product.stock === 0 || isAddingToCart}
      >
        {isAddingToCart ? (
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : product.stock === 0 ? (
          "Out of Stock"
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1"></circle>
              <circle cx="19" cy="21" r="1"></circle>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
            </svg>
            Add to Cart
          </>
        )}
      </button>
    </div>
  );
};

export default ProductCard;
