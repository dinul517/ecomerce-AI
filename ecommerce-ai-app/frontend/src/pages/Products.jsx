import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../component/Productcard";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`http://localhost:5000/api/products?category=${selectedCategory}&search=${searchTerm}`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Gagal mengambil daftar produk");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Anda harus login terlebih dahulu!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/cart", {
        productId,
        quantity: 1,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Produk berhasil ditambahkan ke keranjang!");
    } catch (err) {
      alert("Gagal menambahkan ke keranjang: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
            Katalog Produk
          </h1>
          <button
            onClick={() => navigate("/cart")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center gap-2"
          >
            🛒 Lihat Keranjang
          </button>
        </div>
        <p className="text-center text-gray-600 max-w-2xl mx-auto">
          Temukan produk berkualitas dengan harga terbaik untuk kebutuhan Anda
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
            <span className="absolute right-3 top-3 text-gray-400">
              🔍
            </span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full max-w-md px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            <option value="all">Semua Kategori</option>
            <option value="Electronics">Elektronik</option>
            <option value="Clothing">Fashion</option>
            <option value="Home">Rumah Tangga</option>
            <option value="Books">Buku</option>
            <option value="Beauty">Kecantikan</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Tidak ada produk yang ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
