import React, { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        setError("Gagal mengambil data pesanan");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(orders => orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert("Gagal update status pesanan");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Daftar Pesanan</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border">
          <thead>
            <tr>
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">User</th>
              <th className="py-2 px-4">Total</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="border-b">
                <td className="py-2 px-4 font-mono">{order._id}</td>
                <td className="py-2 px-4">{order.user?.name || order.user?.email || "-"}</td>
                <td className="py-2 px-4">Rp {order.totalAmount?.toLocaleString()}</td>
                <td className="py-2 px-4">{order.status}</td>
                <td className="py-2 px-4">
                  <select
                    value={order.status}
                    onChange={e => handleUpdateStatus(order._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders; 