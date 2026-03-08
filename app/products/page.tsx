"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIES = ["All","Electronics","Fashion & Clothing","Home & Living","Agriculture & Farming","Food & Groceries","Health & Beauty","Sports & Outdoors","Automotive","Books & Education","Other"];

export default function ProductsPage() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = "/auth/login?redirect=/products"; return; }
      setUser(session.user);
      const { data } = await supabase
        .from("products")
        .select("*, shops(shop_name, shop_number, county)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = products.filter(p => {
    const matchSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.shops?.shop_name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <>
      <style>{css}</style>
      <div className="page-wrap">

        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <ul className="sp-nav-links">
            <li><a href="/shops">Shops</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/counties">Counties</a></li>
          </ul>
          <div className="sp-nav-actions">
            <a href="/seller/dashboard" className="btn-ghost">My Shop</a>
            <button className="btn-rust-outline" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>Sign Out</button>
          </div>
        </nav>

        <div className="page-content">
          <div className="page-header">
            <h1>Browse Products</h1>
            <p>Discover products from sellers across Kenya</p>
          </div>

          <div className="filters-bar">
            <div className="search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search products or shops..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="clear-btn" onClick={() => setSearch("")}>✕</button>
              )}
            </div>
            <div className="cat-tabs">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  className={`cat-tab ${category === c ? "active" : ""}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading-grid">
              {[...Array(8)].map((_, i) => (
                <div className="skeleton-card" key={i}>
                  <div className="skeleton-img" />
                  <div className="skeleton-body">
                    <div className="skeleton-line w60" />
                    <div className="skeleton-line w90" />
                    <div className="skeleton-line w40" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-ico">📦</div>
              <div className="empty-title">
                {search || category !== "All" ? "No products match your search" : "No products yet"}
              </div>
              <div className="empty-sub">
                {search || category !== "All"
                  ? "Try different keywords or a different category."
                  : "No sellers have listed any products yet. Be the first to open a shop!"}
              </div>
              {(!search && category === "All") && (
                <a href="/seller/register" className="btn-solid" style={{ marginTop: "1.5rem", display: "inline-flex" }}>
                  Open a Shop →
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="results-count">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
                {category !== "All" && ` in ${category}`}
                {search && ` for "${search}"`}
              </div>
              <div className="products-grid">
                {filtered.map(p => (
                  <div className="product-card" key={p.id} onClick={() => window.location.href = `/shops/${p.shops?.id || ""}`}>
                    <div className="product-img">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} />
                        : <span>📦</span>}
                      {p.original_price && p.original_price > p.price && (
                        <div className="discount-tag">
                          -{Math.round((1 - p.price / p.original_price) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="product-body">
                      <div className="product-shop">
                        {p.shops?.shop_name}
                        {p.shops?.is_verified && (
                          <span className="verified-mini">✓</span>
                        )}
                      </div>
                      <div className="product-name">{p.name}</div>
                      <div className="product-price-row">
                        <div className="product-price">KSh {p.price?.toLocaleString()}</div>
                        {p.original_price && p.original_price > p.price && (
                          <div className="product-original">KSh {p.original_price?.toLocaleString()}</div>
                        )}
                      </div>
                      <div className="product-meta">
                        <span>📍 {p.shops?.county}</span>
                        {p.condition && <span>· {p.condition === "new" ? "✨ New" : "Used"}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
:root{--ink:#0d0d0d;--cream:#f5f0e8;--rust:#c84b31;--sage:#3d6b4f;--border:rgba(13,13,13,0.1);}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);}
a{text-decoration:none;color:inherit;}
.sp-nav{position:fixed;top:0;width:100%;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1rem 4rem;background:rgba(245,240,232,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);}
.sp-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.5rem;letter-spacing:-0.04em;color:var(--ink);}
.sp-logo span{color:var(--rust);}
.sp-nav-links{display:flex;gap:2rem;list-style:none;}
.sp-nav-links a{font-size:0.88rem;font-weight:500;color:rgba(13,13,13,0.6);}
.sp-nav-links a:hover{color:var(--ink);}
.sp-nav-actions{display:flex;gap:0.65rem;align-items:center;}
.btn-ghost{padding:0.45rem 1rem;border:1.5px solid rgba(13,13,13,0.25);border-radius:100px;font-size:0.82rem;font-weight:500;color:var(--ink);background:transparent;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-ghost:hover{background:var(--ink);color:var(--cream);}
.btn-solid{padding:0.6rem 1.4rem;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:600;background:var(--rust);color:white;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-solid:hover{background:#a83a22;}
.btn-rust-outline{padding:0.45rem 1rem;border:1.5px solid var(--rust);border-radius:100px;font-size:0.82rem;font-weight:500;background:transparent;color:var(--rust);cursor:pointer;transition:all .2s;}
.btn-rust-outline:hover{background:var(--rust);color:white;}
.page-wrap{min-height:100vh;background:var(--cream);}
.page-content{padding:6rem 4rem 4rem;}
.page-header{margin-bottom:1.8rem;}
.page-header h1{font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;letter-spacing:-0.03em;}
.page-header p{font-size:0.88rem;color:rgba(13,13,13,0.45);margin-top:0.4rem;}
.filters-bar{margin-bottom:2rem;}
.search-box{display:flex;align-items:center;gap:0.6rem;background:white;border:1.5px solid var(--border);border-radius:12px;padding:0.75rem 1.1rem;max-width:480px;margin-bottom:1.2rem;}
.search-box input{flex:1;border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:0.9rem;background:transparent;}
.clear-btn{background:none;border:none;color:rgba(13,13,13,0.3);cursor:pointer;font-size:0.8rem;padding:0.1rem 0.3rem;}
.cat-tabs{display:flex;gap:0.5rem;flex-wrap:wrap;}
.cat-tab{padding:0.38rem 0.85rem;border:1.5px solid var(--border);border-radius:100px;font-size:0.77rem;font-weight:500;background:white;color:rgba(13,13,13,0.55);cursor:pointer;transition:all .2s;white-space:nowrap;}
.cat-tab:hover{border-color:var(--rust);color:var(--rust);}
.cat-tab.active{background:var(--rust);border-color:var(--rust);color:white;}
.results-count{font-size:0.83rem;color:rgba(13,13,13,0.4);margin-bottom:1.2rem;}
.products-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.3rem;}
.product-card{background:white;border-radius:18px;overflow:hidden;border:1px solid var(--border);transition:all .25s;cursor:pointer;}
.product-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,0.09);}
.product-img{height:190px;background:#e8ede9;display:flex;align-items:center;justify-content:center;font-size:3rem;overflow:hidden;position:relative;}
.product-img img{width:100%;height:100%;object-fit:cover;}
.discount-tag{position:absolute;top:0.6rem;left:0.6rem;background:var(--rust);color:white;font-size:0.68rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:6px;}
.product-body{padding:1rem;}
.product-shop{font-size:0.72rem;color:var(--sage);font-weight:500;margin-bottom:0.25rem;display:flex;align-items:center;gap:0.3rem;}
.verified-mini{display:inline-flex;width:14px;height:14px;background:linear-gradient(135deg,#1a6b3c,#2d9b5a);border-radius:50%;align-items:center;justify-content:center;font-size:0.55rem;color:white;font-weight:700;flex-shrink:0;}
.product-name{font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:700;margin-bottom:0.4rem;line-height:1.3;}
.product-price-row{display:flex;align-items:center;gap:0.4rem;margin-bottom:0.3rem;}
.product-price{font-size:0.95rem;font-weight:700;color:var(--rust);}
.product-original{font-size:0.72rem;color:rgba(13,13,13,0.3);text-decoration:line-through;}
.product-meta{font-size:0.72rem;color:rgba(13,13,13,0.38);display:flex;gap:0.3rem;flex-wrap:wrap;}
.empty-state{background:white;border-radius:18px;padding:5rem 2rem;text-align:center;border:1px solid var(--border);}
.empty-ico{font-size:2.5rem;margin-bottom:1rem;}
.empty-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;}
.empty-sub{font-size:0.85rem;color:rgba(13,13,13,0.42);line-height:1.6;max-width:360px;margin:0 auto;}
.loading-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.3rem;}
.skeleton-card{background:white;border-radius:18px;overflow:hidden;border:1px solid var(--border);}
.skeleton-img{height:190px;background:linear-gradient(90deg,#e8ede9 25%,#f0f4f1 50%,#e8ede9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}
.skeleton-body{padding:1rem;display:flex;flex-direction:column;gap:0.5rem;}
.skeleton-line{height:12px;background:linear-gradient(90deg,#e8ede9 25%,#f0f4f1 50%,#e8ede9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px;}
.w40{width:40%}.w60{width:60%}.w90{width:90%}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@media(max-width:1024px){.products-grid,.loading-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:768px){
  .sp-nav{padding:0.9rem 1.2rem;}
  .sp-nav-links{display:none;}
  .sp-nav-actions .btn-ghost{display:none;}
  .page-content{padding:5rem 1.2rem 3rem;}
  .page-header h1{font-size:1.5rem;}
  .products-grid,.loading-grid{grid-template-columns:repeat(2,1fr);gap:0.8rem;}
  .product-img{height:150px;}
  .search-box{max-width:100%;}
  .cat-tabs{gap:0.35rem;}
  .cat-tab{padding:0.3rem 0.65rem;font-size:0.72rem;}
}
@media(max-width:480px){
  .products-grid,.loading-grid{grid-template-columns:repeat(2,1fr);gap:0.6rem;}
  .product-body{padding:0.7rem;}
  .product-name{font-size:0.82rem;}
}
`;
