"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "../../utils/axios" // Assuming axios is configured with your backend URL
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, Package, ArrowUpRight, ArrowDownRight, Clock, CreditCard, Truck, CheckCircle, XCircle, ChevronRight, Calendar } from 'lucide-react'

// Chart components
import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  // Stats will now be calculated from fetched data where possible,
  // but some will remain mocked as the backend doesn't provide aggregates.
  const [stats, setStats] = useState({
    totalSales: 0, // Will remain mocked without a dedicated backend endpoint
    totalOrders: 0, // Will be calculated from fetched orders
    totalCustomers: 0, // Will be calculated from fetched users
    totalProducts: 0, // Will be calculated from fetched products
    salesGrowth: 0, // Will remain mocked
    ordersGrowth: 0, // Will remain mocked
    customersGrowth: 0, // Will remain mocked
    productsGrowth: 0, // Will remain mocked
  })
  const [recentOrders, setRecentOrders] = useState([]) // Will fetch real recent orders
  const [topProducts, setTopProducts] = useState([]) // Will fetch real products and display a few (not necessarily "top-selling" without backend sorting)
  // Chart data will remain mocked as dedicated backend endpoints are needed for time-series/aggregated data
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [],
  })
  const [ordersStatusData, setOrdersStatusData] = useState({
    labels: [],
    datasets: [],
  })
    const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState("week") // State for time range selection (affects mock data generation)

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange]) // Refetch data when time range changes (currently only affects mock data)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch real data from backend endpoints
      const [ordersResponse, usersResponse, productsResponse] = await Promise.all([
        axios.get("/orders"), // Fetch orders (assuming admin can see all orders here)
        axios.get("/admin/users"), // Fetch users (assuming admin can see all users here)
        axios.get("/products"), // Fetch products
      ]);
        console.log(productsResponse.data.status);

      // Process fetched data
      const orders = ordersResponse.data.status === 'success' ? ordersResponse.data.data : [];
      const users = usersResponse.data.data.length > 0 ? usersResponse.data.data : [];
      const products = productsResponse.data.data.length > 0  ? productsResponse.data.data : [];
        console.log(orders);
        console.log(users);
        console.log(products);
      // Calculate basic stats from fetched data
      const totalOrders = orders.length;
      const totalCustomers = users.length; // Assuming all users are customers for simplicity
      const totalProducts = products.length;

      // For recent orders, take the first few (e.g., 5)
      const recentOrdersList = orders.slice(0, 5);

      // For top products, take the first few (e.g., 4).
      // Note: This does NOT represent top-selling without backend sorting.
      // Consider renaming this section in the UI or implementing backend sorting.
      const topProductsList = products.slice(0, 4).map(product => ({
           ...product,
           // Add a mock 'sold' count as backend doesn't provide it here
           sold: Math.floor(Math.random() * 200) // Mock sold count
      }));


      // Update stats state with calculated real values and retain mocked values
      setStats(prevStats => ({
        ...prevStats,
        totalOrders: totalOrders,
        totalCustomers: totalCustomers,
        totalProducts: totalProducts,
        // totalSales, salesGrowth, ordersGrowth, etc. remain mocked
      }));

      // Update state with real fetched data
      setRecentOrders(recentOrdersList);
      setTopProducts(topProductsList);


      // --- Mock Data for Charts and Aggregates (Backend Endpoints Needed) ---
      // The following data requires dedicated backend endpoints to calculate aggregates
      // over time ranges (for charts) or overall (for total sales, growth).
      // Keeping mock data for demonstration.

      // Mock data for total sales and growth percentages
       const mockStatsAggregates = {
         totalSales: 24859.75, // Mocked
         salesGrowth: 12.5, // Mocked
         ordersGrowth: 8.3, // Mocked
         customersGrowth: 15.2, // Mocked
         productsGrowth: 4.7, // Mocked
       };
       setStats(prevStats => ({
           ...prevStats,
           ...mockStatsAggregates // Merge mocked aggregates
       }));


      // Generate sales data based on time range (Mocked)
      const salesLabels = generateTimeLabels(timeRange)
      const salesValues = generateRandomData(salesLabels.length, 1000, 5000) // Mocked data

      const mockSalesData = {
        labels: salesLabels,
        datasets: [
          {
            label: "Sales",
            data: salesValues,
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            borderColor: "rgba(99, 102, 241, 1)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
        ],
      }
        const pending = orders.filter(order => order.payment_status === 'pending').length;
        const completed = orders.filter(order => order.payment_status === 'completed').length;
        const cancelled = orders.filter(order => order.payment_status === 'cancelled').length;

      // Generate orders status data (Mocked counts)
      // In a real app, you'd get counts per status from the backend for the selected time range
      const mockOrdersStatusData = {
        labels: ["Pending", "Completed",  "Cancelled"],
        data: [pending, completed, cancelled], // Mocked counts
        backgroundColor: [
          "rgba(234, 179, 8, 0.6)",

          "rgba(34, 197, 94, 0.6)",
          "rgba(239, 68, 68, 0.6)",
        ],
        borderColor: [
          "rgba(234, 179, 8, 1)",
          
          "rgba(34, 197, 94, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      };

      setSalesData(mockSalesData);
      setOrdersStatusData({
          labels: mockOrdersStatusData.labels,
          datasets: [{
              label: "Orders by Status",
              data: mockOrdersStatusData.data,
              backgroundColor: mockOrdersStatusData.backgroundColor,
              borderColor: mockOrdersStatusData.borderColor,
              borderWidth: mockOrdersStatusData.borderWidth
          }]
      });
      // --- End Mock Data Section ---


    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Set a user-friendly error message
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false)
    }
  }

  // Helper function to generate time labels based on selected range
  const generateTimeLabels = (range) => {
    const labels = []
    const now = new Date()

    if (range === "week") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        labels.push(days[date.getDay()])
      }
    } else if (range === "month") {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        labels.push(`${date.getDate()}/${date.getMonth() + 1}`)
      }
    } else if (range === "year") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      // Generate labels for the last 12 months relative to today
      for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push(months[date.getMonth()]);
      }
    }

    return labels
  }

  // Helper function to generate random data (Used for Mocking)
  const generateRandomData = (length, min, max) => {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min)
  }

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fit container height
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fit container height
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  // Helper function to format currency (USD used as placeholder, adjust as needed)
  const formatCurrency = (amount) => {
    // Use ETB for Ethiopian Birr
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB", // Using ETB currency code
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
         // Check if the date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Invalid Date';
    }
  }

  // Helper function to get status color (Tailwind classes)
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
      case "processing":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-500"
      case "shipped":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-500"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Helper function to get payment status color (Tailwind classes)
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "completed": // Changed from 'paid' to 'completed' to match backend
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
      case "failed": // Added failed status
      case "refunded":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Helper function to get status icon (Lucide React icons)
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "processing":
        return <CreditCard className="w-4 h-4" /> // Using CreditCard for processing as a placeholder
      case "shipped":
        return <Truck className="w-4 h-4" />
      case "delivered":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  // Render loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

   // Render error message if fetching failed
   if (error) {
       return (
           <div className="flex items-center justify-center min-h-[60vh]">
               <div className="text-center">
                   <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
                   <button
                       onClick={fetchDashboardData} // Retry fetching data
                       className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                   >
                       Retry Loading Data
                   </button>
               </div>
           </div>
       );
   }


  return (
    <div className="space-y-6 p-6 bg-gray-100 dark:bg-gray-900 min-h-screen"> {/* Added padding and background */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        {/* Time range selector (currently only affects mock data) */}
        <div className="mt-3 sm:mt-0 flex items-center space-x-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Time Range:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors duration-200 ${
                timeRange === "week"
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setTimeRange("week")}
            >
              Week
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                timeRange === "month"
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setTimeRange("month")}
            >
              Month
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors duration-200 ${
                timeRange === "year"
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setTimeRange("year")}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales Card (Mocked Data) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales (Mocked)</p> {/* Indicate Mocked */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(stats.totalSales)}</h3>
            </div>
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {stats.salesGrowth > 0 ? (
              <div className="flex items-center text-green-600 dark:text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{stats.salesGrowth}%</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600 dark:text-red-500">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{Math.abs(stats.salesGrowth)}%</span>
              </div>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">from last {timeRange} (Mocked)</span> {/* Indicate Mocked */}
          </div>
        </div>

        {/* Orders Card (Real Count) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalOrders}</h3>
            </div>
            <div className="h-12 w-12 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
             {/* Orders Growth (Mocked Data) */}
            {stats.ordersGrowth > 0 ? (
              <div className="flex items-center text-green-600 dark:text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{stats.ordersGrowth}%</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600 dark:text-red-500">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{Math.abs(stats.ordersGrowth)}%</span>
              </div>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">from last {timeRange} (Mocked)</span> {/* Indicate Mocked */}
          </div>
        </div>

        {/* Customers Card (Real Count) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Customers</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalCustomers}</h3>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
             {/* Customers Growth (Mocked Data) */}
            {stats.customersGrowth > 0 ? (
              <div className="flex items-center text-green-600 dark:text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{stats.customersGrowth}%</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600 dark:text-red-500">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{Math.abs(stats.customersGrowth)}%</span>
              </div>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">from last {timeRange} (Mocked)</span> {/* Indicate Mocked */}
          </div>
        </div>

        {/* Products Card (Real Count) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalProducts}</h3>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
             {/* Products Growth (Mocked Data) */}
            {stats.productsGrowth > 0 ? (
              <div className="flex items-center text-green-600 dark:text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{stats.productsGrowth}%</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600 dark:text-red-500">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{Math.abs(stats.productsGrowth)}%</span>
              </div>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">from last {timeRange} (Mocked)</span> {/* Indicate Mocked */}
          </div>
        </div>
      </div>

      {/* Charts (Mocked Data) */}
      {/* Note: Real chart data requires backend endpoints that aggregate sales/orders
          data over specific time periods and by status. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart (Mocked Data) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Overview (Mocked)</h3> {/* Indicate Mocked */}
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {stats.salesGrowth > 0 ? "+" : ""}
                {stats.salesGrowth}% growth (Mocked)
              </span> {/* Indicate Mocked */}
            </div>
          </div>
          <div className="h-80"> {/* Fixed height for charts */}
            {salesData.labels.length > 0 && salesData.datasets.length > 0 && (
                 <Line data={salesData} options={lineChartOptions} />
            )}
          </div>
        </div>

        {/* Orders by Status Chart (Mocked Data) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Orders by Status (Mocked)</h3> {/* Indicate Mocked */}
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {stats.ordersGrowth > 0 ? "+" : ""}
                {stats.ordersGrowth}% growth (Mocked)
              </span> {/* Indicate Mocked */}
            </div>
          </div>
          <div className="h-80"> {/* Fixed height for charts */}
             {ordersStatusData.labels.length > 0 && ordersStatusData.datasets.length > 0 && (
                 <Bar data={ordersStatusData} options={barChartOptions} />
             )}
          </div>
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders (Real Data) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentOrders.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">No recent orders found.</div>
            ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {order.order_number || `Order #${order.id}`} {/* Use order_number if available */}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                           <Calendar className="w-3 h-3 mr-1" /> {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(order.total_amount)}
                        </p>
                        <div className="flex items-center justify-end mt-1 space-x-2"> {/* Align icons to the right */}
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(
                              order.payment_status
                            )}`}
                          >
                            <span className="capitalize">{order.payment_status}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      Customer: <span className="font-medium">{order.user?.name || 'N/A'}</span> {/* Access user name */}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Top Products (Displaying Recent Products from fetched data) */}
         {/* Note: Backend needs an endpoint to return actual top-selling products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Products</h3> {/* Changed title to Recent Products */}
            <Link
              to="/admin/products"
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
             {topProducts.length === 0 ? (
                 <div className="p-4 text-center text-gray-500 dark:text-gray-400">No products found.</div>
             ) : (
                topProducts.map((product) => (
                  <div key={product.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-md bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                        <img
                          src={product.image || "/placeholder.svg"} // Access image URL
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <Link
                          to={`/admin/products/edit/${product.id}`} // Link to edit product
                          className="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {formatCurrency(product.price)} {/* Display price */}
                           {/* Mocked sold count */}
                           <span className="ml-2">· {product.sold} sold (Mocked)</span>
                        </p>
                      </div>
                       {/* Removed "Top Seller" badge as data is not based on sales */}
                    </div>
                  </div>
                ))
             )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
