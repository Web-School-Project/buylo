"use client";

import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import TableSkeleton from "../../components/admin/skeletons/TableSkeleton";
import "./ManageUsers.css";
import { TrashIcon } from "lucide-react";

const ManageUsers = () => {
  const [users, setUsers] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, selectedRole, sortBy, sortOrder]);

  const fetchData = async () => {
    try {
    setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        search: searchTerm,
        role: selectedRole,
        sort: sortBy,
        direction: sortOrder,
      });

      const response = await axios.get(`/admin/users`);
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await axios.delete(`/admin/users/${id}`);
      // Refresh the user list
      fetchData();
    } catch (err) {
      console.error("Error deleting user:", err);
      setDeleteError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <TableSkeleton columns={5} rows={8} />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchData} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="manage-users">
      <div className="page-header">
        <h1>Manage Users</h1>
      </div>

      <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
            onChange={handleSearch}
            />
            <i className="fa fa-search"></i>
          </div>

              <select
          value={selectedRole}
          onChange={handleRoleChange}
          className="role-filter"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
          <option value="user">User</option>
              </select>
            </div>

        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
              <th onClick={() => handleSort("name")}>
                Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("email")}>
                Email {sortBy === "email" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("role")}>
                Role {sortBy === "role" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("created_at")}>
                Joined{" "}
                {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {users.data.length === 0 ? (
                <tr>
                <td colSpan="5" className="no-results">
                  No users found
                  </td>
                </tr>
              ) : (
              users.data.map((user) => (
                  <tr key={user.id}>
                    <td>
                        <div className="user-name">{user.name}</div>
                    <div className="user-id">ID: {user.id}</div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                    </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-delete"
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteLoading}
                        title="Delete User"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      {deleteError && (
        <div className="error-message delete-error">{deleteError}</div>
      )}

      {users.last_page > 1 && (
          <div className="pagination">
            <button
            onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
            Previous
            </button>
          <span>
            Page {currentPage} of {users.last_page}
          </span>
              <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === users.last_page}
          >
            Next
                </button>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
