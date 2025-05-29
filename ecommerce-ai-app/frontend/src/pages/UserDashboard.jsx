import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProductRecommendations from "../components/ProductRecommendations";
import AIChatbot from "../components/AIChatbot";
import { 
  FiShoppingCart, 
  FiHeart, 
  FiPackage, 
  FiUser, 
  FiEdit2, 
  FiArrowRight, 
  FiMessageSquare,
  FiGrid,
  FiMapPin,
  FiSettings,
  FiSearch,
  FiShoppingBag
} from 'react-icons/fi';

const UserDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const [profileRes, statsRes, ordersRes, cartRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:5000/api/stats/user", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:5000/api/orders/recent", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:5000/api/cart", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setProfile(profileRes.data);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data);
        setCart(cartRes.data);
      } catch (err) {
        setError("Gagal mengambil data user");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen text-red-500 bg-gray-50">{error}</div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Selamat Datang, {profile?.name || "User"}!
              </h1>
              <p className="text-blue-100">Kelola akun dan aktivitas belanja Anda di sini</p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate("/profile/edit")}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FiEdit2 />
                <span>Edit Profil</span>
              </button>
              <button 
                onClick={() => navigate("/settings")}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FiSettings />
                <span>Pengaturan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 -mt-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => navigate("/products")}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center text-center group"
          >
            <div className="p-3 bg-blue-50 rounded-lg mb-3 group-hover:bg-blue-100 transition-colors">
              <FiShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-medium text-gray-800">Katalog Produk</span>
            <span className="text-sm text-gray-500 mt-1">Jelajahi produk</span>
          </button>
          <button 
            onClick={() => navigate("/wishlist")}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center text-center group"
          >
            <div className="p-3 bg-red-50 rounded-lg mb-3 group-hover:bg-red-100 transition-colors">
              <FiHeart className="w-6 h-6 text-red-600" />
            </div>
            <span className="font-medium text-gray-800">Wishlist</span>
            <span className="text-sm text-gray-500 mt-1">Produk favorit</span>
          </button>
          <button 
            onClick={() => navigate("/address")}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center text-center group"
          >
            <div className="p-3 bg-green-50 rounded-lg mb-3 group-hover:bg-green-100 transition-colors">
              <FiMapPin className="w-6 h-6 text-green-600" />
            </div>
            <span className="font-medium text-gray-800">Alamat</span>
            <span className="text-sm text-gray-500 mt-1">Kelola alamat</span>
          </button>
          <button 
            onClick={() => document.getElementById('ai-chatbot').classList.toggle('hidden')}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center text-center group"
          >
            <div className="p-3 bg-purple-50 rounded-lg mb-3 group-hover:bg-purple-100 transition-colors">
              <FiMessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <span className="font-medium text-gray-800">Chat AI</span>
            <span className="text-sm text-gray-500 mt-1">Bantuan instan</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full px-4 py-3 pl-12 bg-white rounded-xl shadow-sm border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/products?search=${e.target.value}`);
                }
              }}
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Pesanan</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.totalOrders || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-green-600">Rp {stats?.totalSpent?.toLocaleString() || 0}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FiShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Wishlist</p>
                <p className="text-2xl font-bold text-red-600">{stats?.wishlistCount || 0}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <FiHeart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Pesanan Aktif</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.activeOrders || 0}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <FiPackage className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-full">
                  <FiUser className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Profil Saya</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-gray-500 text-sm block mb-1">Email</label>
                  <p className="text-gray-800 font-medium">{profile?.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-gray-500 text-sm block mb-1">Bergabung Sejak</label>
                  <p className="text-gray-800 font-medium">{new Date(profile?.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cart and Recent Orders */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cart Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-full">
                  <FiShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Keranjang Belanja</h2>
              </div>
              {cart?.items && cart.items.length > 0 ? (
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={item.product?.image} 
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{item.product?.name}</p>
                          <p className="text-sm text-gray-500">Jumlah: {item.quantity}</p>
                          <p className="text-sm text-gray-500">Rp {item.product?.price?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">
                          Rp {(item.product?.price * item.quantity)?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg mt-4">
                    <p className="font-semibold text-gray-800">Total</p>
                    <p className="font-bold text-lg text-blue-600">
                      Rp {cart.items.reduce((sum, item) => sum + (item.product?.price * item.quantity), 0)?.toLocaleString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate("/cart")}
                    className="w-full mt-4 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Lihat Detail Keranjang</span>
                    <FiArrowRight />
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4">
                    <FiShoppingCart className="w-8 h-8 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-500 mb-4">Keranjang belanja Anda kosong</p>
                  <button 
                    onClick={() => navigate("/products")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <span>Mulai Belanja</span>
                    <FiArrowRight />
                  </button>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-full">
                  <FiPackage className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Pesanan Terakhir</h2>
              </div>
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">Order #{order._id.slice(-6)}</p>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4">
                    <FiPackage className="w-8 h-8 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-500">Belum ada pesanan</p>
                </div>
              )}
              <button 
                onClick={() => navigate("/orders")}
                className="mt-4 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Lihat Semua Pesanan</span>
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Product Catalog Preview */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <FiGrid className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Katalog Produk</h2>
              </div>
              <button 
                onClick={() => navigate("/products")}
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-2"
              >
                <span>Lihat Semua</span>
                <FiArrowRight />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sample Products - Replace with actual data */}
              {[1, 2, 3, 4].map((item) => (
                <div 
                  key={item}
                  className="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/products/${item}`)}
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-100">
                    <img
                      src={`https://picsum.photos/400/400?random=${item}`}
                      alt="Product"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 mb-1">Produk {item}</h3>
                    <p className="text-sm text-gray-500 mb-2">Kategori Produk</p>
                    <p className="font-semibold text-blue-600">Rp {(Math.random() * 1000000).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Recommendations Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-purple-50 rounded-full">
                <FiHeart className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Rekomendasi untuk Anda</h2>
            </div>
            <ProductRecommendations />
          </div>
        </div>

        {/* AI Chatbot */}
        <div className="fixed bottom-6 right-6 z-50">
          <div id="ai-chatbot" className="hidden absolute bottom-20 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-100">
            <AIChatbot />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 