import React, { useEffect, useState } from "react";
import { FaTachometerAlt, FaBoxOpen, FaShoppingCart, FaUsers, FaChartBar, FaCog, FaSignOutAlt, FaHome } from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import axios from "axios";

const sidebarMenu = [
  { name: "Home", icon: <FaHome />, path: "/" },
  { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
  { name: "Produk", icon: <FaBoxOpen />, path: "/products" },
  { name: "Pesanan", icon: <FaShoppingCart />, path: "/orders" },
  { name: "User", icon: <FaUsers />, path: "/users" },
  { name: "Statistik", icon: <FaChartBar />, path: "/stats" },
  { name: "Setting", icon: <FaCog />, path: "/settings" },
];

const pieColors = ["#3b82f6", "#10b981", "#f59e42", "#6366f1"];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [pieData, setPieData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        // Fetch products (produk publik, tidak perlu token)
        const productsRes = await axios.get("http://localhost:5000/api/products");
        const products = productsRes.data;
        // Count categories for pie chart
        const categoryCount = {};
        products.forEach((p) => {
          categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        });
        const pie = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

        // Fetch orders (perlu token)
        const ordersRes = await axios.get("http://localhost:5000/api/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orders = ordersRes.data;
        // Total revenue
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        // Recent orders (ambil 5 terakhir)
        const recent = orders.slice(-5).reverse().map((o) => ({
          id: o._id,
          user: o.user?.name || o.user || "-",
          total: `Rp ${(o.totalAmount || 0).toLocaleString()}`,
          status: o.status,
        }));

        // Fetch users (perlu token)
        const usersRes = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const users = usersRes.data;

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalUsers: users.length,
          totalRevenue,
        });
        setPieData(pie);
        setRecentOrders(recent);
      } catch (err) {
        setError("Gagal mengambil data dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col justify-between">
        <div>
          <div className="px-6 py-6 text-2xl font-bold text-blue-600">Ai din store</div>
          <nav className="mt-8">
            {sidebarMenu.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition rounded-lg mb-1"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="px-6 py-4 border-t flex items-center gap-3 text-gray-500 hover:text-red-600 cursor-pointer">
          <FaSignOutAlt />
          <span>Logout</span>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-10 py-6 bg-white shadow">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Selamat datang, di Ai din store</h2>
            <p className="text-gray-500">Semoga harimu menyenangkan dan penjualanmu lancar!</p>
          </div>
          <div className="flex items-center gap-4">
            <img
              src="https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff"
              alt="avatar"
              className="w-12 h-12 rounded-full border-2 border-blue-500"
            />
          </div>
        </header>

        {/* Loading & Error */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-500 text-lg">{error}</div>
        ) : (
          <>
            {/* Statistic Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-10 py-8">
              <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
                <div className="text-3xl"><FaBoxOpen className="text-blue-500" /></div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stats.totalProducts}</div>
                  <div className="text-gray-500">Total Produk</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
                <div className="text-3xl"><FaShoppingCart className="text-green-500" /></div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stats.totalOrders}</div>
                  <div className="text-gray-500">Total Pesanan</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
                <div className="text-3xl"><FaUsers className="text-purple-500" /></div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stats.totalUsers}</div>
                  <div className="text-gray-500">User Terdaftar</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
                <div className="text-3xl"><FaChartBar className="text-yellow-500" /></div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">Rp {stats.totalRevenue.toLocaleString()}</div>
                  <div className="text-gray-500">Pendapatan</div>
                </div>
              </div>
            </section>

            {/* Chart & Recent Orders */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-10 pb-8">
              {/* Pie Chart */}
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <h3 className="font-semibold text-lg mb-4">Kategori Produk</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-4">
                  {pieData.map((entry, idx) => (
                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ background: pieColors[idx] }}></span>
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white rounded-xl shadow p-6 col-span-2">
                <h3 className="font-semibold text-lg mb-4">Pesanan Terbaru</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr>
                        <th className="py-2 px-4">ID</th>
                        <th className="py-2 px-4">User</th>
                        <th className="py-2 px-4">Total</th>
                        <th className="py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 font-mono">{order.id}</td>
                          <td className="py-2 px-4">{order.user}</td>
                          <td className="py-2 px-4">{order.total}</td>
                          <td className="py-2 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === "delivered" || order.status === "Selesai" ? "bg-green-100 text-green-700" : order.status === "processing" || order.status === "Diproses" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Footer */}
        <footer className="mt-auto py-4 px-10 bg-white border-t text-gray-500 flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} Ai din store. All rights reserved.</span>
          <button className="hover:underline text-blue-600 bg-transparent border-none p-0 m-0 cursor-pointer">Bantuan</button>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
