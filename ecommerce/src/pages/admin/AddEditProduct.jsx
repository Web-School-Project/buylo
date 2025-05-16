"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../utils/axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./AddEditProduct.css";

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    images: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);

    // Fetch categories
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const response = await axios.get("/admin/categories");
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoriesError("Failed to load categories. Please try again.");
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    // If in edit mode, fetch product data
    const fetchProduct = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await axios.get(`/admin/products/${id}`);
          const product = response.data;
          console.log(response);
          // Format existing images to include isPreview flag and maintain original structure
          const formattedImages = (product.images || []).map((img) => ({
            url: img.url,
            cloudinary_id: img.cloudinary_id,
            is_primary: img.is_primary || false,
            isPreview: false,
          }));

          setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price || "",
            stock: product.stock || "",
            category_id: product.category_id || "",
            images: formattedImages,
          });
        } catch (error) {
          console.error("Error fetching product:", error);
          setErrors((prev) => ({
            ...prev,
            submit: "Failed to load product data. Please try again.",
          }));
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Create preview URLs for all selected files
    const previewUrls = files.map((file) => ({
      file: file,
      url: URL.createObjectURL(file),
      isPreview: true,
      is_primary: false,
    }));

    // Add preview images to the form data
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...previewUrls],
    }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formData.images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update primary image if needed
    const updatedItems = items.map((item, index) => ({
      ...item,
      is_primary: index === 0,
    }));

    setFormData((prev) => ({
      ...prev,
      images: updatedItems,
    }));
  };

  const setPrimaryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((image, i) => ({
        ...image,
        is_primary: i === index,
      })),
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      // If we removed the primary image and there are other images, make the first one primary
      if (prev.images[index].is_primary && newImages.length > 0) {
        newImages[0].is_primary = true;
      }
      return {
        ...prev,
        images: newImages,
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Only validate required fields for new products
    if (!isEditMode) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
      if (!formData.price) newErrors.price = "Price is required";
      if (!formData.stock) newErrors.stock = "Stock is required";
      if (!formData.category_id) newErrors.category_id = "Category is required";
      if (formData.images.length === 0)
        newErrors.images = "At least one image is required";
    } else {
      // For edit mode, only validate if the field has been changed
      if (formData.name.trim() === "") newErrors.name = "Name cannot be empty";
      if (formData.description.trim() === "")
        newErrors.description = "Description cannot be empty";
      if (formData.price === "") newErrors.price = "Price cannot be empty";
      if (formData.stock === "") newErrors.stock = "Stock cannot be empty";
      if (formData.category_id === "")
        newErrors.category_id = "Category cannot be empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      // Add basic product data
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("category_id", formData.category_id);

      // Handle images
      const existingImages = formData.images.filter((img) => !img.isPreview);
      const newImages = formData.images.filter((img) => img.isPreview);

      // Add existing images data with their original structure
      if (existingImages.length > 0) {
        const existingImagesData = existingImages.map((img) => ({
          url: img.url,
          cloudinary_id: img.cloudinary_id,
          is_primary: img.is_primary,
        }));
        formDataToSend.append(
          "existing_images",
          JSON.stringify(existingImagesData)
        );
      }

      // Add new images if any
      if (newImages.length > 0) {
        newImages.forEach((image) => {
          formDataToSend.append("images[]", image.file);
        });
      }

      if (isEditMode) {
        // For PUT request, we need to add _method=PUT
        formDataToSend.append("_method", "PUT");

        const response = await axios.post(
          `/admin/products/${id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data) {
          navigate("/admin/products");
        }
      } else {
        const response = await axios.post("/admin/products", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data) {
          navigate("/admin/products");
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setErrors((prev) => ({
        ...prev,
        submit:
          error.response?.data?.message ||
          "Failed to save product. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-edit-product">
      <div className="page-header">
        <h1>{isEditMode ? "Edit Product" : "Add New Product"}</h1>
      </div>

      <div className="admin-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "error" : ""}
                placeholder="Enter product name"
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="category_id">Category</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className={errors.category_id ? "error" : ""}
                disabled={categoriesLoading}
              >
                <option value="">Select a category</option>
                {categoriesLoading ? (
                  <option value="" disabled>
                    Loading categories...
                  </option>
                ) : categoriesError ? (
                  <option value="" disabled>
                    Error loading categories
                  </option>
                ) : categories.length === 0 ? (
                  <option value="" disabled>
                    No categories available
                  </option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
              {errors.category_id && (
                <span className="error-message">{errors.category_id}</span>
              )}
              {categoriesError && (
                <span className="error-message">{categoriesError}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={errors.price ? "error" : ""}
                placeholder="Enter price"
              />
              {errors.price && (
                <span className="error-message">{errors.price}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                className={errors.stock ? "error" : ""}
                placeholder="Enter stock quantity"
              />
              {errors.stock && (
                <span className="error-message">{errors.stock}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className={errors.description ? "error" : ""}
                placeholder="Enter product description"
              />
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label>Product Images</label>
              <div className="image-upload-container">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="images" direction="horizontal">
                    {(provided) => (
                      <div
                        className="image-preview-grid"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {formData.images.map((image, index) => (
                          <Draggable
                            key={image.cloudinary_id || `preview-${index}`}
                            draggableId={
                              image.cloudinary_id || `preview-${index}`
                            }
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`image-preview ${
                                  image.is_primary ? "primary" : ""
                                } ${image.isPreview ? "preview" : ""}`}
                              >
                                <img
                                  src={image.url}
                                  alt={`Product ${index + 1}`}
                                />
                                <div className="image-actions">
                                  {!image.is_primary && (
                                    <button
                                      type="button"
                                      className="set-primary"
                                      onClick={() => setPrimaryImage(index)}
                                      title="Set as primary image"
                                    >
                                      <i className="fa fa-star"></i>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="remove-image"
                                    onClick={() => removeImage(index)}
                                    title="Remove image"
                                  >
                                    <i className="fa fa-times"></i>
                                  </button>
                                </div>
                                {image.is_primary && (
                                  <div className="primary-badge">Primary</div>
                                )}
                                {image.isPreview && (
                                  <div className="preview-badge">
                                    Uploading...
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        <label className="upload-button">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            disabled={loading}
                          />
                          <div className="upload-content">
                            <i className="fa fa-cloud-upload"></i>
                            <span>
                              {loading ? "Uploading..." : "Add Images"}
                            </span>
                          </div>
                        </label>
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                {errors.images && (
                  <span className="error-message">{errors.images}</span>
                )}
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? "Saving..."
                : isEditMode
                ? "Update Product"
                : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditProduct;
