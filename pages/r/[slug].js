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

  let products = [];
  if (restaurant) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('restaurant_id', restaurant.id);
    products = data || [];
  }

  return {
    props: {
      restaurant: restaurant || null,
      products: products,
    },
  };
}

const headerStyle = { background: "#222", color: "#fff", padding: "24px 20px" };
const callButtonStyle = { display: "inline-block", padding: "10px 16px", background: "#25D366", color: "#fff", borderRadius: 8, textDecoration: "none" };
const pageStyle = { fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: 100 };
const bodyStyle = { padding: 20 };
const cardStyle = { border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" };
const priceStyle = { fontWeight: "bold", marginTop: 4 };
const qtyButtonStyle = { width: 32, height: 32, borderRadius: 6, border: "1px solid #ccc", background: "#fff", fontSize: 18 };
const addButtonStyle = { padding: "8px 16px", background: "#222", color: "#fff", borderRadius: 6, border: "none" };
const cartBarStyle = { position: "fixed", bottom: 0, left: 0, right: 0, background: "#222", color: "#fff", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 480, margin: "0 auto" };
const placeOrderButtonStyle = { padding: "8px 16px", background: "#fff", color: "#222", borderRadius: 6, border: "none", fontWeight: "bold" };
const placeOrderButtonDisabledStyle = Object.assign({}, placeOrderButtonStyle, { opacity: 0.6 });
const confirmationBarStyle = { position: "fixed", bottom: 0, left: 0, right: 0, background: "#1a7f37", color: "#fff", padding: "16px 20px", maxWidth: 480, margin: "0 auto", textAlign: "center" };
const errorBarStyle = { position: "fixed", bottom: 0, left: 0, right: 0, background: "#b91c1c", color: "#fff", padding: "16px 20px", maxWidth: 480, margin: "0 auto", textAlign: "center" };
const retryButtonStyle = { marginTop: 8, padding: "8px 16px", background: "#fff", color: "#b91c1c", borderRadius: 6, border: "none", fontWeight: "bold" };

export default function RestaurantMenu(props) {
  const restaurant = props.restaurant;
  const products = props.products;
  const cartState = useState({});
  const cart = cartState[0];
  const setCart = cartState[1];
  const orderStatusState = useState('idle'); // idle | placing | sent | error
  const orderStatus = orderStatusState[0];
  const setOrderStatus = orderStatusState[1];

  function addItem(id) {
    setCart(function (prev) {
      const current = prev[id] || 0;
      const updated = Object.assign({}, prev);
      updated[id] = current + 1;
      return updated;
    });
  }

  function removeItem(id) {
    setCart(function (prev) {
      const current = prev[id] || 0;
      const updated = Object.assign({}, prev);
      updated[id] = Math.max(0, current - 1);
      return updated;
    });
  }

  async function placeOrder() {
    setOrderStatus('placing');

    let totalItems = 0;
    let totalPrice = 0;
    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      const qty = cart[item.id] || 0;
      totalItems += qty;
      totalPrice += qty * item.price;
    }

    if (totalItems === 0) {
      setOrderStatus('idle');
      return;
    }

    const orderResult = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurant.id,
        total: totalPrice,
        status: 'NEW',
      })
      .select()
      .single();

    if (orderResult.error || !orderResult.data) {
      setOrderStatus('error');
      return;
    }

    const newOrderId = orderResult.data.id;
    const itemsToInsert = [];
    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      const qty = cart[item.id] || 0;
      if (qty > 0) {
        itemsToInsert.push({
          order_id: newOrderId,
          product_id: item.id,
          quantity: qty,
          price: item.price,
        });
      }
    }

    const itemsResult = await supabase.from('order_items').insert(itemsToInsert);

    if (itemsResult.error) {
      setOrderStatus('error');
      return;
    }

    setOrderStatus('sent');
    setCart({});
  }

  function tryAgain() {
    setOrderStatus('idle');
    placeOrder();
  }

  if (!restaurant) {
    return <div style={bodyStyle}>Restaurant not found.</div>;
  }

  let totalItems = 0;
  let totalPrice = 0;
  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    const qty = cart[item.id] || 0;
    totalItems += qty;
    totalPrice += qty * item.price;
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1>{restaurant.name}</h1>
        <p>{restaurant.address}</p>
      </div>

      <div style={bodyStyle}>
        <a href={"tel:" + restaurant.phone} style={callButtonStyle}>
          Call: {restaurant.phone}
        </a>

        <h2>Menu</h2>

        {products.length === 0 ? <p>No menu items yet.</p> : null}

        {products.map(function (item) {
          const qty = cart[item.id] || 0;
          return (
            <div key={item.id} style={cardStyle}>
              <div>
                <div>{item.name}</div>
                <div>{item.description}</div>
                <div style={priceStyle}>Rs {item.price}</div>
              </div>
              <div>
                {qty === 0 ? (
                  <button style={addButtonStyle} onClick={function () { addItem(item.id); }}>Add</button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button style={qtyButtonStyle} onClick={function () { removeItem(item.id); }}>-</button>
                    <span>{qty}</span>
                    <button style={qtyButtonStyle} onClick={function () { addItem(item.id); }}>+</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {orderStatus === 'sent' ? (
        <div style={confirmationBarStyle}>
          Order sent — waiting for confirmation
        </div>
      ) : orderStatus === 'error' ? (
        <div style={errorBarStyle}>
          <div>Order didn't go through — check your connection.</div>
          <button style={retryButtonStyle} onClick={tryAgain}>Retry</button>
        </div>
      ) : totalItems > 0 ? (
        <div style={cartBarStyle}>
          <span>{totalItems} item(s)</span>
          <span>Rs {totalPrice}</span>
          <button
            style={orderStatus === 'placing' ? placeOrderButtonDisabledStyle : placeOrderButtonStyle}
            disabled={orderStatus === 'placing'}
            onClick={placeOrder}
          >
            {orderStatus === 'placing' ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      ) : null}
    </div>
  );
        }
