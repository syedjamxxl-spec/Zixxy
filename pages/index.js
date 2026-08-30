import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function getServerSideProps() {
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*');

  return {
    props: {
      restaurants: restaurants || [],
    },
  };
}

export default function Home({ restaurants }) {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Zixxy 🎉</h1>
      <p>Restaurants in the database:</p>
      <ul>
        {restaurants.map((r) => (
          <li key={r.id}>
            {r.name} — {r.slug} — {r.phone}
          </li>
        ))}
      </ul>
    </div>
  );
}
