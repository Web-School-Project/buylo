"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productsData from "../../data/products.json";
import categoriesData from "../../data/categories.json";
import "./AddEditProduct.css";

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    is_featured: false,
    image: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);

    if (isEditMode) {
      // Fetch product data for editing
      setLoading(true);

      // Simulate API call
      setTimeout(() => {
        const product = productsData.find((p) => p.id === Number.parseInt(id));

        if (product) {
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stock: product.stock.toString(),
            category_id: product.category_id.toString(),
            is_featured: product.is_featured || false,
            image: product.image || "",
          });
        } else {
          // Product not found, redirect to products list
          navigate("/admin/products");
        }

        setLoading(false);
      }, 500);
    } else {
      // New product, just set loading to false
      setLoading(false);
    }
  }, [id, isEditMode, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Product description is required";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (
      isNaN(Number.parseFloat(formData.price)) ||
      Number.parseFloat(formData.price) <= 0
    ) {
      newErrors.price = "Price must be a positive number";
    }

    if (!formData.stock) {
      newErrors.stock = "Stock quantity is required";
    } else if (
      isNaN(Number.parseInt(formData.stock)) ||
      Number.parseInt(formData.stock) < 0
    ) {
      newErrors.stock = "Stock must be a non-negative number";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    // Simulate API call to save product
    setTimeout(() => {
      // In a real app, this would be an API call to create/update the product
      console.log("Product saved:", {
        ...formData,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
        category_id: Number.parseInt(formData.category_id),
      });

      setSaving(false);

      // Redirect to products list
      navigate("/admin/products");
    }, 1000);
  };

  if (loading) {
    return <div className="loading">Loading product data...</div>;
  }

  return (
    <div className="add-edit-product">
      <div className="page-header">
        <h1>{isEditMode ? "Edit Product" : "Add New Product"}</h1>
      </div>

      <div className="admin-card">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "error" : ""}
                />
                {errors.name && (
                  <div className="error-message">{errors.name}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  className={errors.description ? "error" : ""}
                ></textarea>
                {errors.description && (
                  <div className="error-message">{errors.description}</div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price ($)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={errors.price ? "error" : ""}
                  />
                  {errors.price && (
                    <div className="error-message">{errors.price}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="stock">Stock Quantity</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className={errors.stock ? "error" : ""}
                  />
                  {errors.stock && (
                    <div className="error-message">{errors.stock}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category_id">Category</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className={errors.category_id ? "error" : ""}
                >
                  <option value="">Select a category</option>
                  {categoriesData.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <div className="error-message">{errors.category_id}</div>
                )}
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_featured">Featured Product</label>
              </div>
            </div>

            <div className="form-column">
              <div className="form-group">
                <label htmlFor="image">Product Image URL</label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="Enter image URL or upload an image"
                />
              </div>

              <div className="image-preview">
                <label>Image Preview</label>
                <div className="preview-container">
                  {formData.image ? (
                    <img
                      src={formData.image || "/placeholder.svg"}
                      alt="Product preview"
                    />
                  ) : (
                    <div className="no-image">
                      <i className="fa fa-image"></i>
                      <p>No image selected</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="upload-section">
                <label>Upload Image</label>
                <div className="upload-area">
                  <i className="fa fa-cloud-upload"></i>
                  <p>Drag & drop an image here or click to browse</p>
                  <input type="file" accept="image/*" className="file-input" />
                </div>
                <p className="upload-note">
                  Supported formats: JPG, PNG, WebP. Max size: 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Product"
                : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditProduct;
