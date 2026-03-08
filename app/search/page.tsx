"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "products" | "shops" | "services">("all");
  const [query, setQuery] = useState(q);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = `/auth/login?redirect=/search?q=${q}`; return; }
    });
  }, []);

  useEffect(() => {
    if (!q) { setLoading(false); return; }
    const doSearch = async () => {
      setLoading(true);
      const [{ data: p }, { data: s }, { data: sv }] = await Promise.all([
        supabase.from("products")
          .select("*, shops(id, shop_name, shop_number, county, is_verified)")
          .or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
          .eq("is_active", true)
          .limit(24),
        supabase.from("shops")
          .select("*")
          .or(`shop_name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
          .eq("approval_status", "approved")
          .limit(12),
        supabase.from("services")
          .select("*, shops(id, shop_name, shop_number, county, phone, is_verified)")
          .or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
          .eq("is_active", true)
          .limit(12),
      ]);
      setProducts(p || []);
      setShops(s || []);
      setServices(sv || []);
      setLoading(false);
    };
    doSearch();
  }, [q]);

  const total = products.length + shops.length + services.length;

  const handleSearch = () => {
    if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
  };

  return (
    <>
      <style>{css}</style>
      <div className="page-wrap">

        {/* NAV WITH SEARCH */}
        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <div className="nav-search-wrap">
            <div className="nav-search-box">
              <span className="nav-search-icon">🔍</span>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search products, shops, services..."
              />
              {query && <button className="nav-clear" onClick={() => setQuery("")}>✕</button>}
            </div>
            <button className="btn-search" onClick={handleSearch}>Search</button>
          </div>
          <div className="sp-nav-actions">
            <a href="/products" className="btn-ghost">Browse</a>
            <button className="btn-rust-outline" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>Sign Out</button>
          </div>
        </nav>

        <div className="page-content">
          {!q ? (
            <div className="empty-state">
              <div className="empty-ico">🔍</div>
              <div className="empty-title">Search Shoplace</div>
              <div className="empty-sub">Find products, shops and services across all 47 counties in Kenya.</div>
              <div className="browse-links">
                <a href="/products" className="browse-link">📦 Browse Products</a>
                <a href="/shops" className="browse-link">🏪 Browse Shops</a>
                <a href="/services" className="browse-link">⚙️ Browse Services</a>
              </div>
            </div>
          ) : (
            <>
              <div className="search-header">
                <h1>
                  {loading ? "Searching..." : total === 0
                    ? `No results for "${q}"`
                    : `${total} result${total !== 1 ? "s" : ""} for "${q}"`}
                </h1>
                {!loading && total > 0 && (
                  <p>{products.length} products · {shops.length} shops · {services.length} services</p>
                )}
              </div>

              {/* TABS */}
              {!loading && total > 0 && (
                <div className="search-tabs">
                  <button className={"s-tab" + (tab === "all" ? " active" : "")} onClick={() => setTab("all")}>All ({total})</button>
                  <button className={"s-tab" + (tab === "products" ? " active" : "")} onClick={() => setTab("products")}>Products ({products.length})</button>
                  <button className={"s-tab" + (tab === "shops" ? " active" : "")} onClick={() => setTab("shops")}>Shops ({shops.length})</button>
                  <button className={"s-tab" + (tab === "services" ? " active" : "")} onClick={() => setTab("services")}>Services ({services.length})</button>
                </div>
              )}

              {loading ? (
                <div className="loading-grid">
                  {[...Array(8)].map((_, i) => (
                    <div className="skeleton-card" key={i}>
                      <div className="sk-img" />
                      <div className="sk-body">
                        <div className="sk-line w60" />
                        <div className="sk-line w90" />
                        <div className="sk-line w40" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : total === 0 ? (
                <div className="empty-state">
                  <div className="empty-ico">😔</div>
                  <div className="empty-title">Nothing found for "{q}"</div>
                  <div className="empty-sub">Try different keywords or browse all products and shops.</div>
                  <div className="browse-links">
                    <a href="/products" className="browse-link">📦 Browse Products</a>
                    <a href="/shops" className="browse-link">🏪 Browse Shops</a>
                  </div>
                </div>
              ) : (
                <div className="results-wrap">

                  {/* PRODUCTS */}
                  {(tab === "all" || tab === "products") && products.length > 0 && (
                    <div className="results-section">
                      <div className="results-section-title">📦 Products</div>
                      <div className="products-grid">
                        {products.map(p => (
                          <div
                            className="product-card"
                            key={p.id}
                            onClick={() => window.location.href = `/shops/${p.shops?.id}`}
                          >
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
                              <div className="product-shop-row">
                                <span className="product-shop">{p.shops?.shop_name}</span>
                                {p.shops?.is_verified === true && <span className="v-mini">✓</span>}
                              </div>
                              <div className="product-name">{p.name}</div>
                              <div className="product-price-row">
                                <span className="product-price">KSh {p.price?.toLocaleString()}</span>
                                {p.original_price > p.price && (
                                  <span className="product-original">KSh {p.original_price?.toLocaleString()}</span>
                                )}
                              </div>
                              <div className="product-meta">📍 {p.shops?.county}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SHOPS */}
                  {(tab === "all" || tab === "shops") && shops.length > 0 && (
                    <div className="results-section">
                      <div className="results-section-title">🏪 Shops</div>
                      <div className="shops-grid">
                        {shops.map(s => (
                          <div
                            className={"shop-row" + (s.is_verified === true ? " shop-row-verified" : "")}
                            key={s.id}
                            onClick={() => window.location.href = `/shops/${s.id}`}
                          >
                            <div className={"shop-av" + (s.is_verified === true ? " shop-av-v" : "")}>
                              {s.shop_name?.[0]?.toUpperCase()}
                            </div>
                            <div className="shop-info">
                              <div className="shop-name-row">
                                <span className="shop-name">{s.shop_name}</span>
                                {s.is_verified === true && <span className="verified-pill">✓ Verified</span>}
                              </div>
                              <div className="shop-meta">#{String(s.shop_number || "").padStart(5,"0")} · {s.county} · {s.category}</div>
                            </div>
                            <div className="shop-arrow">→</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SERVICES */}
                  {(tab === "all" || tab === "services") && services.length > 0 && (
                    <div className="results-section">
                      <div className="results-section-title">⚙️ Services</div>
                      <div className="shops-grid">
                        {services.map(s => (
                          <div
                            className="shop-row"
                            key={s.id}
                            onClick={() => window.location.href = `/shops/${s.shops?.id}`}
                          >
                            <div className="shop-av" style={{ background: "#3d6b4f", fontSize: "1rem" }}>⚙️</div>
                            <div className="shop-info">
                              <div className="shop-name-row">
                                <span className="shop-name">{s.name}</span>
                                {s.shops?.is_verified === true && <span className="verified-pill">✓ Verified</span>}
                              </div>
                              <div className="shop-meta">
                                {s.shops?.shop_name} · {s.county || s.shops?.county}
                                {s.price ? ` · KSh ${s.price.toLocaleString()}` : s.price_type === "free" ? " · Free" : " · Negotiable"}
                              </div>
                            </div>
                            {s.shops?.phone && (
                              <a
                                href={`https://wa.me/254${String(s.shops.phone).replace(/^0/, "")}?text=Hi, I found your ${s.name} on Shoplace`}
                                className="wa-btn"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                              >
                                WhatsApp
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f5f0e8" }} />}>
      <SearchResults />
    </Suspense>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
:root{--ink:#0d0d0d;--cream:#f5f0e8;--rust:#c84b31;--sage:#3d6b4f;--border:rgba(13,13,13,0.1);}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);}
a{text-decoration:none;color:inherit;}
.sp-nav{position:fixed;top:0;width:100%;z-index:100;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:0.8rem 3rem;background:rgba(245,240,232,0.97);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);}
.sp-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.4rem;letter-spacing:-0.04em;color:var(--ink);flex-shrink:0;}
.sp-logo span{color:var(--rust);}
.nav-search-wrap{flex:1;max-width:520px;display:flex;gap:0.5rem;align-items:center;}
.nav-search-box{flex:1;display:flex;align-items:center;gap:0.5rem;background:white;border:1.5px solid var(--border);border-radius:10px;padding:0.55rem 0.9rem;transition:border-color .2s;}
.nav-search-box:focus-within{border-color:var(--rust);}
.nav-search-icon{font-size:0.9rem;}
.nav-search-box input{flex:1;border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:0.88rem;background:transparent;}
.nav-clear{background:none;border:none;color:rgba(13,13,13,0.3);cursor:pointer;font-size:0.75rem;}
.btn-search{padding:0.55rem 1.2rem;background:var(--rust);color:white;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:600;cursor:pointer;white-space:nowrap;}
.btn-search:hover{background:#a83a22;}
.sp-nav-actions{display:flex;gap:0.5rem;align-items:center;flex-shrink:0;}
.btn-ghost{padding:0.4rem 0.9rem;border:1.5px solid rgba(13,13,13,0.25);border-radius:100px;font-size:0.8rem;font-weight:500;color:var(--ink);background:transparent;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-ghost:hover{background:var(--ink);color:var(--cream);}
.btn-rust-outline{padding:0.4rem 0.9rem;border:1.5px solid var(--rust);border-radius:100px;font-size:0.8rem;font-weight:500;background:transparent;color:var(--rust);cursor:pointer;transition:all .2s;}
.btn-rust-outline:hover{background:var(--rust);color:white;}
.page-wrap{min-height:100vh;background:var(--cream);}
.page-content{padding:5.5rem 3rem 4rem;}
.search-header{margin-bottom:1.5rem;}
.search-header h1{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;letter-spacing:-0.02em;}
.search-header p{font-size:0.83rem;color:rgba(13,13,13,0.4);margin-top:0.3rem;}
.search-tabs{display:flex;gap:0.5rem;margin-bottom:2rem;flex-wrap:wrap;}
.s-tab{padding:0.4rem 1rem;border:1.5px solid var(--border);border-radius:100px;font-size:0.8rem;font-weight:500;background:white;color:rgba(13,13,13,0.55);cursor:pointer;transition:all .2s;}
.s-tab:hover{border-color:var(--rust);color:var(--rust);}
.s-tab.active{background:var(--rust);border-color:var(--rust);color:white;}
.results-wrap{display:flex;flex-direction:column;gap:2.5rem;}
.results-section{}
.results-section-title{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;margin-bottom:1rem;padding-bottom:0.6rem;border-bottom:1px solid var(--border);}
.products-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.2rem;}
.product-card{background:white;border-radius:16px;overflow:hidden;border:1px solid var(--border);cursor:pointer;transition:all .25s;}
.product-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,0.08);}
.product-img{height:160px;background:#e8ede9;display:flex;align-items:center;justify-content:center;font-size:2.5rem;overflow:hidden;position:relative;}
.product-img img{width:100%;height:100%;object-fit:cover;}
.discount-tag{position:absolute;top:0.5rem;left:0.5rem;background:var(--rust);color:white;font-size:0.65rem;font-weight:700;padding:0.15rem 0.4rem;border-radius:5px;}
.product-body{padding:0.9rem;}
.product-shop-row{display:flex;align-items:center;gap:0.3rem;margin-bottom:0.2rem;}
.product-shop{font-size:0.7rem;color:var(--sage);font-weight:500;}
.v-mini{display:inline-flex;width:13px;height:13px;background:linear-gradient(135deg,#FF8040,#FF2880);border-radius:50%;align-items:center;justify-content:center;font-size:0.5rem;color:white;font-weight:700;}
.product-name{font-family:'Syne',sans-serif;font-size:0.85rem;font-weight:700;margin-bottom:0.3rem;line-height:1.3;}
.product-price-row{display:flex;align-items:center;gap:0.35rem;margin-bottom:0.2rem;}
.product-price{font-size:0.88rem;font-weight:700;color:var(--rust);}
.product-original{font-size:0.7rem;color:rgba(13,13,13,0.3);text-decoration:line-through;}
.product-meta{font-size:0.7rem;color:rgba(13,13,13,0.38);}
.shops-grid{display:flex;flex-direction:column;gap:0.6rem;}
.shop-row{display:flex;align-items:center;gap:1rem;background:white;border-radius:14px;padding:1rem 1.2rem;border:1px solid var(--border);cursor:pointer;transition:all .2s;}
.shop-row:hover{border-color:rgba(200,75,49,0.25);box-shadow:0 4px 16px rgba(0,0,0,0.06);}
.shop-row-verified{background:linear-gradient(135deg,#0d1f14,#0f2318);border-color:rgba(255,120,60,0.25);}
.shop-row-verified:hover{border-color:rgba(255,120,60,0.45);}
.shop-av{width:40px;height:40px;background:var(--rust);border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:1rem;font-weight:800;color:white;flex-shrink:0;}
.shop-av-v{background:linear-gradient(135deg,#FF8040,#FF2880);}
.shop-info{flex:1;}
.shop-name-row{display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;}
.shop-name{font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:700;}
.shop-row-verified .shop-name{color:white;}
.shop-meta{font-size:0.75rem;color:rgba(13,13,13,0.4);margin-top:0.15rem;}
.shop-row-verified .shop-meta{color:rgba(255,255,255,0.35);}
.shop-arrow{color:rgba(13,13,13,0.25);font-size:1rem;flex-shrink:0;}
.shop-row-verified .shop-arrow{color:rgba(255,255,255,0.3);}
.verified-pill{display:inline-flex;padding:0.15rem 0.5rem;background:linear-gradient(135deg,#FF8040,#FF2880);border-radius:100px;font-size:0.62rem;font-weight:700;color:white;}
.wa-btn{padding:0.35rem 0.75rem;background:rgba(37,211,102,0.08);border:1.5px solid rgba(37,211,102,0.25);border-radius:8px;font-size:0.75rem;font-weight:600;color:#168a4e;flex-shrink:0;transition:all .2s;}
.wa-btn:hover{background:rgba(37,211,102,0.15);}
.empty-state{background:white;border-radius:18px;padding:5rem 2rem;text-align:center;border:1px solid var(--border);margin-top:1rem;}
.empty-ico{font-size:2.5rem;margin-bottom:1rem;}
.empty-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;}
.empty-sub{font-size:0.85rem;color:rgba(13,13,13,0.42);line-height:1.6;margin-bottom:1.5rem;}
.browse-links{display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;}
.browse-link{padding:0.5rem 1.2rem;background:white;border:1.5px solid var(--border);border-radius:100px;font-size:0.82rem;font-weight:500;color:rgba(13,13,13,0.6);transition:all .2s;}
.browse-link:hover{border-color:var(--rust);color:var(--rust);}
.loading-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.2rem;}
.skeleton-card{background:white;border-radius:16px;overflow:hidden;border:1px solid var(--border);}
.sk-img{height:160px;background:linear-gradient(90deg,#e8ede9 25%,#f0f4f1 50%,#e8ede9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}
.sk-body{padding:0.9rem;display:flex;flex-direction:column;gap:0.4rem;}
.sk-line{height:10px;background:linear-gradient(90deg,#e8ede9 25%,#f0f4f1 50%,#e8ede9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:5px;}
.w40{width:40%}.w60{width:60%}.w90{width:90%}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@media(max-width:1024px){.products-grid,.loading-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:768px){
  .sp-nav{padding:0.8rem 1rem;flex-wrap:wrap;}
  .nav-search-wrap{order:3;flex:0 0 100%;max-width:100%;}
  .sp-nav-actions .btn-ghost{display:none;}
  .page-content{padding:8rem 1rem 3rem;}
  .products-grid,.loading-grid{grid-template-columns:repeat(2,1fr);gap:0.8rem;}
  .search-header h1{font-size:1.2rem;}
}
@media(max-width:480px){
  .products-grid,.loading-grid{grid-template-columns:repeat(2,1fr);gap:0.6rem;}
  .product-img{height:130px;}
}
`;
