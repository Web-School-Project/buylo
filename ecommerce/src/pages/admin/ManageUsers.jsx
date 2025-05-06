"use client";

import { useState, useEffect } from "react";
import usersData from "../../data/users.json";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    role: "customer",
    phone: "",
    address: "",
  });

  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);

    // Fetch users
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setUsers(usersData);
      setLoading(false);
    }, 500);
  }, []);

  // Filter and sort users
  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "email-asc":
          return a.email.localeCompare(b.email);
        case "email-desc":
          return b.email.localeCompare(a.email);
        case "oldest":
          return a.id - b.id;
        case "newest":
        default:
          return b.id - a.id;
      }
    });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle user selection
  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map((user) => user.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle user deletion
  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== userId));
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedUsers.length} selected users?`
      )
    ) {
      setUsers(users.filter((user) => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
      setSelectAll(false);
    }
  };

  // Handle role change
  const handleRoleChange = (userId, newRole) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  // Handle new user form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserData({
      ...newUserData,
      [name]: value,
    });
  };

  const handleAddUser = (e) => {
    e.preventDefault();

    // Validate form
    if (!newUserData.name || !newUserData.email) {
      alert("Name and email are required");
      return;
    }

    // Check if email already exists
    if (users.some((user) => user.email === newUserData.email)) {
      alert("A user with this email already exists");
      return;
    }

    // Add new user
    const newUser = {
      id: users.length + 1,
      ...newUserData,
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop",
    };

    setUsers([...users, newUser]);

    // Reset form and close modal
    setNewUserData({
      name: "",
      email: "",
      role: "customer",
      phone: "",
      address: "",
    });
    setShowAddUserModal(false);
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="manage-users">
      <div className="page-header">
        <h1>Manage Users</h1>
        <button
          className="btn-primary"
          onClick={() => setShowAddUserModal(true)}
        >
          <i className="fa fa-plus"></i> Add New User
        </button>
      </div>

      <div className="admin-card">
        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fa fa-search"></i>
          </div>

          <div className="filter-options">
            <div className="filter-group">
              <label>Role:</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
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
                <option value="email-asc">Email (A-Z)</option>
                <option value="email-desc">Email (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="bulk-actions">
            <span>{selectedUsers.length} users selected</span>
            <button className="btn-danger" onClick={handleBulkDelete}>
              <i className="fa fa-trash"></i> Delete Selected
            </button>
          </div>
        )}

        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-results">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                    </td>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          <img
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                          />
                        </div>
                        <div className="user-name">{user.name}</div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className={`role-select role-${user.role}`}
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                      >
                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                      </select>
                    </td>
                    <td>{user.phone || "-"}</td>
                    <td>{user.address || "-"}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit">
                          <i className="fa fa-edit"></i>
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button
                className="modal-close"
                onClick={() => setShowAddUserModal(false)}
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddUser} className="modal-body">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newUserData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newUserData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={newUserData.role}
                  onChange={handleInputChange}
                >
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number (Optional)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={newUserData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address (Optional)</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={newUserData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
