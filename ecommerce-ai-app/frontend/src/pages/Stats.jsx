import React, { useEffect, useState } from "react";
import axios from "axios";

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/stats/admin", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        setError("Gagal mengambil data statistik");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Statistik Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-blue-600">{stats.totalProducts}</div>
          <div className="text-gray-500">Total Produk</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-green-600">{stats.totalOrders}</div>
          <div className="text-gray-500">Total Pesanan</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-purple-600">{stats.totalUsers}</div>
          <div className="text-gray-500">Total User</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-yellow-600">Rp {stats.totalRevenue.toLocaleString()}</div>
          <div className="text-gray-500">Total Pendapatan</div>
        </div>
      </div>
    </div>
  );
};

export default Stats; 