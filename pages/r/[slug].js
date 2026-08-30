import { createClient } from '@supabase/supabase-js';

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

  return {
    props: {
      restaurant: restaurant || null,
    },
  };
}

const headerStyle = { background: "#222", color: "#fff", padding: "24px 20px" };
const callButtonStyle = { display: "inline-block", padding: "10px 16px", background: "#25D366", color: "#fff", borderRadius: 8, textDecoration: "none" };
const pageStyle = { fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto" };
const bodyStyle = { padding: 20 };

export default function RestaurantMenu({ restaurant }) {
  if (!restaurant) {
    return <div style={bodyStyle}>Restaurant not found.</div>;
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
        <p>No menu items yet — coming in the next step!</p>
      </div>
    </div>
  );
}
