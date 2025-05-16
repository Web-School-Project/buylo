"use client"

import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { CartContext } from "../../context/CartContext"
import "./Header.css"

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext)
  const { cart, itemCount } = useContext(CartContext)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <h1>EthioShop</h1>
            </Link>
          </div>

          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <nav className={`main-nav ${mobileMenuOpen ? "open" : ""}`}>
            <ul>
              <li>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" onClick={() => setMobileMenuOpen(false)}>
                  Products
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="header-actions">
            <Link to="/cart" className="cart-icon">
              <i className="fa fa-shopping-cart"></i>
              <span className="cart-count">{itemCount}</span>
            </Link>

            {isAuthenticated ? (
              <div className="user-dropdown">
                <div className="user-avatar" onClick={toggleDropdown}>
                  <img src={user.avatar || "/placeholder.svg"} alt={user.name} />
                </div>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <p>{user.name}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                    <ul>
                      <li>
                        <Link to="/dashboard" onClick={() => setDropdownOpen(false)}>
                          Dashboard
                        </Link>
                      </li>
                      {isAdmin && (
                        <li>
                          <Link to="/admin" onClick={() => setDropdownOpen(false)}>
                            Admin Panel
                          </Link>
                        </li>
                      )}
                      <li>
                        <button onClick={handleLogout}>Logout</button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-login">
                  Login
                </Link>
                <Link to="/register" className="btn-register">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
