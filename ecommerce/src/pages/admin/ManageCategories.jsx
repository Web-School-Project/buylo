import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import TableSkeleton from "../../components/admin/skeletons/TableSkeleton";
import { FaImage } from "react-icons/fa";
import "./ManageCategories.css";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State to control visibility of the form modal
  const [showForm, setShowForm] = useState(false);
  // State to hold form data for both creation and editing
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null, // For new image file upload
    existing_image_url: null, // To display current image when editing
  });
  // State to hold the category being edited (null for creation)
  const [editingCategory, setEditingCategory] = useState(null);
  // State for image preview (Data URL)
  const [imagePreview, setImagePreview] = useState(null);
  // State for form validation errors
  const [formError, setFormError] = useState("");
  // State to indicate form submission in progress
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to fetch categories from the backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/admin/categories");
      if (response.data.status === "success") {
        // Ensure data is an array, default to empty array if not
        setCategories(response.data.data || []);
        setError(null);
      } else {
        setError("Failed to fetch categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setFormError("Image size should be less than 2MB");
        // Clear the file input and preview if size is too large
        e.target.value = null;
        setFormData((prev) => ({ ...prev, image: null }));
        setImagePreview(null);
        return;
      }
      setFormError(""); // Clear previous size error

      // Set the image file in form data
      setFormData((prev) => ({
        ...prev,
        image: file,
        existing_image_url: null, // Clear existing image when a new one is selected
      }));
      // Create preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // If file is cleared (e.g., user cancels file selection)
      setFormData((prev) => ({ ...prev, image: null }));
      // If editing, restore the existing image preview; otherwise, clear preview
      setImagePreview(editingCategory?.image?.url || null);
    }
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(""); // Clear previous form errors

    // Basic validation
    if (!formData.name.trim()) {
      setFormError("Category name is required");
      return;
    }

    try {
      setIsSubmitting(true); // Set submitting state

      // Prepare data for sending (using FormData for file uploads)
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description || ""); // Ensure description is sent even if empty

      // Append image only if a new file is selected
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      let response;
      let url;
      let method;

      if (editingCategory) {
        // --- Update existing category ---
        url = `/admin/categories/${editingCategory.id}`;
        method = 'post'; // Use POST method for FormData with _method spoofing
        formDataToSend.append('_method', 'PUT'); // Add _method field to spoof PUT request

        // If the image was removed (existing_image_url is null and no new image)
        // Explicitly send a flag or the null value for existing_image_url
        // to tell the backend to remove the image.
        if (formData.existing_image_url === null && !formData.image) {
             formDataToSend.append('remove_image', 'true');
        }


      } else {
        // --- Create new category ---
        url = "/admin/categories";
        method = 'post'; // Use POST method for creation
      }

      console.log('Sending request:', { url, method });
      // Log FormData contents (for debugging)
      // Note: console.log(formDataToSend) itself might not show contents directly,
      // you can iterate over it: for (let pair of formDataToSend.entries()) { console.log(pair[0]+ ': '+ pair[1]); }
      console.log('FormData contents:');
      for (let pair of formDataToSend.entries()) {
          console.log(pair[0]+ ': '+ pair[1]);
      }


      response = await axios({
          method: method,
          url: url,
          data: formDataToSend,
          headers: {
            "Content-Type": "multipart/form-data", // Important for file uploads
          },
      });


      // Handle successful response
      if (response.data.status === "success") {
        // Reset form and close modal
        resetForm();
        setShowForm(false);
        // Refresh the category list
        fetchCategories();
      } else {
        // Handle API-specific errors
        setFormError(response.data.message || "Operation failed");
      }
    } catch (err) {
      // Handle network or server errors
      console.error("Error submitting category form:", err);
      if (err.response?.data?.errors) {
        // Handle Laravel validation errors
        const errors = err.response.data.errors;
        // Display the first validation error message
        setFormError(Object.values(errors)[0][0]);
      } else {
        // Display generic error message
        setFormError(
          err.response?.data?.message || "An error occurred. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  // Function to handle category deletion
  const handleDelete = async (id) => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        // Send DELETE request to backend
        const response = await axios.delete(`/admin/categories/${id}`);
        // Handle successful deletion
        if (response.data.status === "success") {
          // Refresh the category list after deletion
          fetchCategories();
        } else {
          // Handle API-specific errors
          setError(response.data.message || "Failed to delete category");
        }
      } catch (err) {
        // Handle network or server errors
        console.error("Error deleting category:", err);
        setError(err.response?.data?.message || "Failed to delete category");
      }
    }
  };

  // Function to handle category editing
  const handleEdit = (category) => {
    console.log('Attempting to show form for editing category:', category.id); // Log added here
    // Set the category being edited
    setEditingCategory(category);
    // Populate the form with the category's data
    setFormData({
      name: category.name,
      description: category.description || "", // Ensure description is not null
      image: null, // No new image selected initially
      existing_image_url: category.image?.url || null, // Store existing image URL for preview
    });
    // Set the initial image preview to the existing image
    setImagePreview(category.image?.url || null);
    // Show the form modal
    setShowForm(true); // This should trigger the modal to show
    setFormError(""); // Clear any previous form errors
  };

  // Function to reset the form state
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: null,
      existing_image_url: null,
    });
    setImagePreview(null);
    setEditingCategory(null); // Clear editing category state
    setFormError("");
  };

  // Render loading skeleton while fetching data
  if (loading) {
    return <TableSkeleton columns={5} rows={6} />;
  }

  // Render error message if fetching fails
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button
          onClick={() => window.location.reload()} // Option to retry fetching
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="manage-categories">
      <div className="page-header">
        <h1>Manage Categories</h1>
        {/* Button to open the create category form */}
        <button className="btn-primary" onClick={() => {
            resetForm(); // Reset form for creation
            setShowForm(true); // Show the modal
          }}>
          <i className="fa fa-plus"></i> Create Category
        </button>
      </div>

      <div className="admin-card">
        {/* Display message if no categories are found */}
        {categories.length === 0 ? (
          <div className="no-categories">
            <p>
              No categories found. Click the Create Category button to add one.
            </p>
          </div>
        ) : (
          // Display categories in a table
          <div className="table-responsive"> {/* Moved comment inside div */}
            <table className="categories-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Map through categories and display each row */}
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>
                      <div className="category-image-cell">
                        {/* Display category image or a placeholder */}
                        {category.image?.url ? (
                          <img src={category.image.url} alt={category.name} />
                        ) : (
                          <div className="no-image">
                            <FaImage />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{category.name}</td>
                    <td>{category.description}</td>
                    <td>
                      <div className="action-buttons">
                        {/* Edit button */}
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(category)} // Pass the category object to handleEdit
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                        {/* Delete button */}
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(category.id)} // Pass category ID to handleDelete
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form for Create/Edit */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {/* Dynamic title based on whether editing or creating */}
              <h2>{editingCategory ? "Edit Category" : "Create New Category"}</h2>
              {/* Close button */}
              <button
                className="modal-close"
                onClick={() => {
                  setShowForm(false);
                  resetForm(); // Reset form on close
                }}
              >
                <i className="fa fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="category-form">
              {/* Display form error message */}
              {formError && <div className="error-message">{formError}</div>}

              {/* Category Name Input */}
              <div className="form-group">
                <label htmlFor="name">Category Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name"
                  required
                />
              </div>

              {/* Description Input */}
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter category description"
                  rows="3"
                />
              </div>

              {/* Image Input and Preview */}
              <div className="form-group">
                <label htmlFor="image">Image</label>
                <div className="file-input-container">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="file-input"
                  />
                  <label htmlFor="image" className="file-input-label">
                    {/* Dynamic label based on whether a new image is selected or editing with existing */}
                    {formData.image || formData.existing_image_url ? "Change Image" : "Choose Image"}
                  </label>
                </div>
                {/* Display image preview (newly selected or existing) */}
                {(imagePreview || formData.existing_image_url) && (
                  <div className="image-preview">
                    <img src={imagePreview || formData.existing_image_url} alt="Preview" />
                  </div>
                )}
                 {/* Option to remove existing image when editing */}
                 {editingCategory && formData.existing_image_url && !formData.image && (
                     <button
                         type="button"
                         className="btn-remove-image"
                         onClick={() => {
                             setFormData(prev => ({ ...prev, existing_image_url: null }));
                             setImagePreview(null);
                         }}
                     >
                         Remove Image
                     </button>
                 )}
              </div>

              {/* Modal Actions (Cancel and Submit buttons) */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetForm(); // Reset form on cancel
                  }}
                >
                  Cancel
                </button>
                {/* Dynamic submit button text */}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? editingCategory
                      ? "Updating..."
                      : "Creating..."
                    : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
