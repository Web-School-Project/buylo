"use client"

import { useState, useContext, useEffect } from "react"
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Settings,
  Bell,
  Search,
  LogOut,
  ChevronLeft,
  Menu,
  Moon,
  Sun,
  BarChart2,
} from "lucide-react"

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/admin/products", label: "Products", icon: <Package size={20} /> },
    { path: "/admin/orders", label: "Orders", icon: <ShoppingCart size={20} /> },
    { path: "/admin/users", label: "Users", icon: <Users size={20} /> },
    { path: "/admin/categories", label: "Categories", icon: <Tags size={20} /> },
    { path: "/admin/analytics", label: "Analytics", icon: <BarChart2 size={20} /> },
    { path: "/admin/settings", label: "Settings", icon: <Settings size={20} /> },
  ]

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${mobileOpen ? "overflow-hidden" : ""}`}>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-64"} 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Sidebar Header */}
        <div
          className={`h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {!collapsed && (
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold mr-2">
                A
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Admin Panel</h2>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
              collapsed ? "mx-auto" : ""
            }`}
          >
            <ChevronLeft size={18} className={`transform transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Admin Profile */}
        <div
          className={`px-4 py-4 border-b border-gray-200 dark:border-gray-700 ${
            collapsed ? "flex justify-center" : "flex items-center"
          }`}
        >
          {collapsed ? (
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user?.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-indigo-600 dark:text-indigo-300 font-semibold">
                    {user?.name?.charAt(0) || "A"}
                  </span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
            </div>
          ) : (
            <>
              <div className="relative mr-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user?.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-indigo-600 dark:text-indigo-300 font-semibold">
                      {user?.name?.charAt(0) || "A"}
                    </span>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            </>
          )}
        </div>

        {/* Search Bar */}
        {!collapsed && (
          <div className="px-4 py-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-2 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      location.pathname === item.path
                        ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                >
                  <span className={`${location.pathname === item.path ? "text-indigo-600 dark:text-indigo-300" : ""}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            {!collapsed && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {darkMode ? <Sun size={18} className="mr-2" /> : <Moon size={18} className="mr-2" />}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
            )}
            {collapsed && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mx-auto"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut size={18} />
            {!collapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"} min-h-screen flex flex-col`}>
        {/* Top Navigation */}
        <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <div className="hidden md:flex items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden mr-2">
                {user?.avatar ? (
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user?.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-indigo-600 dark:text-indigo-300 font-semibold">
                    {user?.name?.charAt(0) || "A"}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
