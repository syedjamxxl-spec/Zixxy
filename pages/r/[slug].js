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

export default function RestaurantMenu({ restaurant, products }) {
  const [cart, setCart] = useState({});

  function addItem(id) {
    setCart(function (prev) {
      const current = prev[id] || 0;
      return { ...prev, [id]: current + 1 };
    });
  }

  function removeItem(id) {
    setCart(function (prev) {
      const current = prev[id] || 0;
      const updated = { ...prev, [id]: Math.max(0, current - 1) };
      return updated;
    });
  }

  if (!restaurant) {
    return <div style={bodyStyle}>Restaurant not found.</div>;
  }

  let totalItems = 0;
  let totalPrice = 0;
  products.forEach(function (item) {
    const qty = cart[item.id] || 0;
    totalItems += qty;
    totalPrice += qty * item.price;
  });

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

        {products.length === 0 && <p>No menu items yet.</p>}
