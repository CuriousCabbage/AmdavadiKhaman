import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

interface Order {
  id: string;
  items: any[];
  total: number;
  status: string;
  createdAt: any;
  pointsEarned: number;
}

export default function OrdersView({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
        });
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) return <div className="text-center py-20">Loading your history...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Orders</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <div className="text-5xl mb-4">🧾</div>
          <h3 className="text-xl font-bold text-gray-900">No orders yet</h3>
          <p className="text-gray-500 mt-2">Looks like you haven't tried our famous Khaman yet!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-50">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-lg">Order #{order.id.slice(0, 6).toUpperCase()}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                        {order.status ? order.status.toUpperCase() : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {/* Added check for createdAt to prevent crashes on old data */}
                    {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown Date'} 
                    {' '}at{' '} 
                    {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString() : ''}
                  </p>
                </div>
                <div className="text-right">
                   <p className="font-bold text-xl">${order.total ? order.total.toFixed(2) : "0.00"}</p>
                   <p className="text-xs text-green-600 font-bold">+{order.pointsEarned || 0} pts earned</p>
                </div>
              </div>

              <div className="space-y-2">
                {/* FIXED: Added (order.items || []) to handle missing items safely */}
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-gray-700">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}