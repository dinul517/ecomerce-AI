import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState([]);
  const [shippingMethod, setShippingMethod] = useState("regular");
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const shippingCosts = {
    regular: 15000,
    express: 30000,
    sameDay: 50000
  };

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Kamu harus login dulu!");
        window.location.href = "/Login";
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCartItems(res.data.items || []);
        setLoading(false);
      } catch (err) {
        console.error("Gagal ambil cart:", err.message);
        alert("Gagal ambil keranjang");
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const token = localStorage.getItem("token");
    setUpdating(true);
    try {
      const res = await axios.put(
        "http://localhost:5000/api/cart",
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(res.data.items || []);
    } catch (err) {
      alert("Gagal update quantity: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/cart/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(response.data.items || []);
    } catch (err) {
      alert("Gagal hapus item: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSaveForLater = (item) => {
    setSavedItems([...savedItems, item]);
    handleRemoveItem(item.product._id);
  };

  const handleMoveToCart = (item) => {
    setCartItems([...cartItems, item]);
    setSavedItems(savedItems.filter(i => i.product._id !== item.product._id));
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/checkout",
        { shippingMethod },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Checkout berhasil! Kamu akan diarahkan ke dashboard.");
      setCartItems([]);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      alert("Checkout gagal: " + (err.response?.data?.message || err.message));
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + shippingCosts[shippingMethod];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Show loading spinner if updating quantity */}
      {updating && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 mb-4">
            🛒 Keranjang Belanja
          </h1>
          <p className="text-gray-600">Kelola produk dalam keranjang belanja Anda</p>
        </div>

        {cartItems.length === 0 && savedItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Keranjang Belanja Kosong</h2>
            <p className="text-gray-600 mb-6">Tambahkan beberapa produk ke keranjang Anda</p>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:-translate-y-1"
            >
              Lihat Produk
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Item dalam Keranjang</h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                      <img
                        src={item.product.image || "https://via.placeholder.com/100"}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-blue-600 font-semibold mt-2">
                          Rp {(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleSaveForLater(item)}
                          className="p-2 text-gray-600 hover:text-blue-600"
                        >
                          💾
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.product._id)}
                          className="p-2 text-gray-600 hover:text-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Saved Items */}
                {savedItems.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-6">Disimpan untuk Nanti</h2>
                    <div className="space-y-4">
                      {savedItems.map((item) => (
                        <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <img
                            src={item.product.image || "https://via.placeholder.com/100"}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                            <p className="text-blue-600 font-semibold">
                              Rp {(item.product.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleMoveToCart(item)}
                            className="p-2 text-gray-600 hover:text-blue-600"
                          >
                            ➕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-6">Ringkasan Pesanan</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Rp {calculateSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-600">Metode Pengiriman</label>
                    <select
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="regular">Regular (2-3 hari) - Rp 15.000</option>
                      <option value="express">Express (1-2 hari) - Rp 30.000</option>
                      <option value="sameDay">Same Day - Rp 50.000</option>
                    </select>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-blue-600">Rp {calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    🧾 Checkout Sekarang
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
                  >
                    ⬅️ Kembali ke Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
