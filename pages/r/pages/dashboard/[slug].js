import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function getServerSideProps({ params }) {
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', params.slug)
    .single();

  let orders = [];
  if (restaurant) {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false });
    orders = data || [];
  }

  return {
    props: {
      restaurant: restaurant || null,
      orders: orders,
    },
  };
}

const pageStyle = { fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto", padding: 20 };
const headerStyle = { marginBottom: 20 };
const orderCardStyle = { border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 12 };
const orderTopRowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 };
const statusSelectStyle = { padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc" };
const itemLineStyle = { fontSize: 14, color: "#444" };
const totalStyle = { fontWeight: "bold", marginTop: 8 };
const emptyStyle = { color: "#888", textAlign: "center", marginTop: 40 };

const STATUS_OPTIONS = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

export default function OrderDashboard(props) {
  const restaurant = props.restaurant;
  const ordersState = useState(props.orders);
  const orders = ordersState[0];
  const setOrders = ordersState[1];

  async function updateStatus(orderId, newStatus) {
    setOrders(function (prev) {
      return prev.map(function (o) {
        return o.id === orderId ? Object.assign({}, o, { status: newStatus }) : o;
      });
    });

    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
  }

  if (!restaurant) {
    return <div style={pageStyle}>Restaurant not found.</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1>{restaurant.name} — Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div style={emptyStyle}>No orders yet.</div>
      ) : (
        orders.map(function (order) {
          return (
            <div key={order.id} style={orderCardStyle}>
              <div style={orderTopRowStyle}>
                <strong>Order #{order.id}</strong>
                <select
                  style={statusSelectStyle}
                  value={order.status}
                  onChange={function (e) { updateStatus(order.id, e.target.value); }}
                >
                  {STATUS_OPTIONS.map(function (s) {
                    return <option key={s} value={s}>{s}</option>;
                  })}
                </select>
              </div>
              {order.order_items.map(function (oi) {
                return (
                  <div key={oi.id} style={itemLineStyle}>
                    {oi.quantity}x {oi.products ? oi.products.name : 'Item'} — Rs {oi.price * oi.quantity}
                  </div>
                );
              })}
              <div style={totalStyle}>Total: Rs {order.total}</div>
            </div>
          );
        })
      )}
    </div>
  );
        }
