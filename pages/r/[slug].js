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

export default function RestaurantMenu({ restaurant }) {
  if (!restaurant) {
    return <div style={{ padding: 40 }}>Restaurant not found.</div>;
  }

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ background: "#222", color: "#fff", padding: "24px 20px" }}>
        <h1 style={{ margin: 0 }}>{restaurant.name}</h1>
        <p style={{ margin: "8px 0 0", opacity: 0.8 }}>{restaurant.address}</p>
      </div>

      <div style={{ padding: 20 }}>
        
          href={`tel:${restaurant.phone}`}
          style={{
            display: "inline-block",
            padding: "10px 16px",
            background: "#25D366",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Call: {restaurant.phone}
        </a>

        <h2 style={{ marginTop: 32 }}>Menu</h2>
        <p style={{ color: "#888" }}>No menu items yet — coming in the next step!</p>
      </div>
    </div>
  );
              }
