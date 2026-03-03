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
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "products" | "shops" | "services">("all");
  const [query, setQuery] = useState(q);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = `/auth/login?redirect=/search?q=${q}`; return; }
      setUser(session.user);
    });
  }, []);

  useEffect(() => {
    if (!q) { setLoading(false); return; }
    const doSearch = async () => {
      setLoading(true);
      const [{ data: p }, { data: s }, { data: sv }] = await Promise.all([
        supabase.from("products").select("*, shops(shop_name, shop_number, county)").ilike("name", `%${q}%`).eq("is_active", true).limit(20),
        supabase.from("shops").select("*").ilike("shop_name", `%${q}%`).eq("approval_status", "approved").limit(20),
        supabase.from("services").select("*, shops(shop_name, shop_number, county, phone, whatsapp)").ilike("name", `%${q}%`).eq("is_active", true).limit(20),
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
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <>
      <style>{css}</style>
      <div className="page-wrap">
        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <div className="sp-nav-links-center">
            <div className="nav-search">
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder="Search products, shops, services..." />
              <button onClick={handleSearch}>Search</button>
            </div>
          </div>
          <div className="sp-nav-actions">
            <a href="/products" className="btn-ghost">Browse</a>
            <button className="btn-rust-outline" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>Sign Out</button>
          </div>
        </nav>

        <div className="page-content">
          {q ? (
            <>
              <div className="search-header">
                <h1>{loading ? "Searching..." : `${total} result${total !== 1 ? "s" : ""} for "${q}"`}</h1>
                {!loading && <p>{products.length} products · {shops.length} shops · {services.length} services</p>}
              </div>

              {/* TABS */}
              <div className="search-tabs">
                <button className={`s-tab ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>All ({total})</button>
                <button className={`s-tab ${tab === "products" ? "active" : ""}`} onClick={() => setTab("products")}>Products ({products.length})</button>
                <button className={`s-tab ${tab === "shops" ? "active" : ""}`} onClick={() => setTab("shops")}>Shops ({shops.length})</button>
                <button className={`s-tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>Services ({services.length})</button>
              </div>

              {loading ? (
                <div className="empty-state"><div className="empty-ico">⏳</div><div className="empty-title">Searching...</div></div>
              ) : total === 0 ? (
                <div className="empty-state">
                  <div className="empty-ico">🔍</div>
                  <div className="empty-title">No results found for &quot;{q}&quot;</div>
                  <div className="empty-sub">Try different keywords or browse all products and shops.</div>
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.5rem" }}>
                    <a href="/products" className="btn-solid">Browse Products</a>
                    <a href="/shops" className="btn-ghost">Browse Shops</a>
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
                          <div className="product-card" key={p.id}>
                            <div className="product-img">📦</div>
                            <div className="product-body">
                              <div className="product-shop">{p.shops?.shop_name}</div>
                              <div className="product-name">{p.name}</div>
                              <div className="product-price">KSh {p.price?.toLocaleString()}</div>
                              <div className="product-loc">📍 {p.shops?.county}</div>
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
                      <div className="shops-list">
                        {shops.map(s => (
                          <div className="shop-row" key={s.id} onClick={() => window.location.href = `/shops/${s.id}`}>
                            <div className="shop-av">{s.shop_name?.[0]}</div>
                            <div className="shop-info">
                              <div className="shop-name">{s.shop_name}</div>
                              <div className="shop-meta">Shop #{s.shop_number} · {s.county} · {s.category}</div>
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
                      <div className="shops-list">
                        {services.map(s => (
                          <div className="shop-row" key={s.id}>
                            <div className="shop-av" style={{ background: "#3d6b4f" }}>⚙️</div>
                            <div className="shop-info">
                              <div className="shop-name">{s.name}</div>
                              <div className="shop-meta">{s.shops?.shop_name} · {s.shops?.county} {s.price ? `· From KSh ${s.price.toLocaleString()}` : ""}</div>
                            </div>
                            {s.shops?.whatsapp && (
                              <a href={`https://wa.me/${s.shops.whatsapp?.replace(/\D/g, "")}`} target="_blank" className="btn-ghost" style={{ fontSize: "0.75rem" }}>WhatsApp</a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state" style={{ marginTop: "2rem" }}>
              <div className="empty-ico">🔍</div>
              <div className="empty-title">Search Shoplace</div>
              <div className="empty-sub">Search for products, shops, and services across Kenya.</div>
            </div>
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
.sp-nav{position:fixed;top:0;width:100%;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0.9rem 3rem;background:rgba(245,240,232,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);gap:2rem;}
.sp-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.4rem;letter-spacing:-0.04em;color:var(--ink);flex-shrink:0;}
.sp-logo span{color:var(--rust);}
.sp-nav-links-center{flex:1;max-width:520px;}
.nav-search{display:flex;background:white;border:1.5px solid var(--border);border-radius:10px;overflow:hidden;}
.nav-search input{flex:1;padding:0.65rem 1rem;border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:0.88rem;background:transparent;}
.nav-search button{padding:0.6rem 1.1rem;background:var(--rust);color:white;border:none;font-family:'DM Sans',sans-serif;font-weight:500;font-size:0.82rem;cursor:pointer;}
.sp-nav-actions{display:flex;gap:0.65rem;align-items:center;flex-shrink:0;}
.btn-ghost{padding:0.45rem 1rem;border:1.5px solid rgba(13,13,13,0.25);border-radius:100px;font-size:0.82rem;font-weight:500;color:var(--ink);background:transparent;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-ghost:hover{background:var(--ink);color:var(--cream);}
.btn-solid{padding:0.6rem 1.4rem;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:600;background:var(--rust);color:white;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-solid:hover{background:#a83a22;}
.btn-rust-outline{padding:0.45rem 1rem;border:1.5px solid var(--rust);border-radius:100px;font-size:0.82rem;font-weight:500;background:transparent;color:var(--rust);cursor:pointer;transition:all .2s;}
.btn-rust-outline:hover{background:var(--rust);color:white;}
.page-wrap{min-height:100vh;background:var(--cream);}
.page-content{padding:5.5rem 4rem 4rem;}
.search-header{margin-bottom:1.5rem;}
.search-header h1{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;letter-spacing:-0.02em;}
.search-header p{font-size:0.83rem;color:rgba(13,13,13,0.42);margin-top:0.3rem;}
.search-tabs{display:flex;gap:0.5rem;margin-bottom:2rem;border-bottom:1px solid var(--border);padding-bottom:0;}
.s-tab{padding:0.6rem 1.2rem;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:500;color:rgba(13,13,13,0.45);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .2s;}
.s-tab:hover{color:var(--ink);}
.s-tab.active{color:var(--rust);border-bottom-color:var(--rust);}
.results-wrap{display:flex;flex-direction:column;gap:2.5rem;}
.results-section{}
.results-section-title{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;margin-bottom:1rem;}
.products-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.1rem;}
.product-card{background:white;border-radius:16px;overflow:hidden;border:1px solid var(--border);transition:all .2s;cursor:pointer;}
.product-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.07);}
.product-img{height:140px;background:#e8ede9;display:flex;align-items:center;justify-content:center;font-size:2.5rem;}
.product-body{padding:1rem;}
.product-shop{font-size:0.7rem;color:var(--sage);font-weight:500;margin-bottom:0.2rem;}
.product-name{font-family:'Syne',sans-serif;font-size:0.88rem;font-weight:700;margin-bottom:0.3rem;}
.product-price{font-size:0.92rem;font-weight:600;color:var(--rust);}
.product-loc{font-size:0.68rem;color:rgba(13,13,13,0.35);margin-top:0.25rem;}
.shops-list{display:flex;flex-direction:column;gap:0.65rem;}
.shop-row{background:white;border-radius:12px;padding:1rem 1.2rem;border:1px solid var(--border);display:flex;align-items:center;gap:1rem;cursor:pointer;transition:all .2s;}
.shop-row:hover{border-color:rgba(200,75,49,0.2);transform:translateX(3px);}
.shop-av{width:38px;height:38px;background:var(--rust);border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:1rem;font-weight:800;color:white;flex-shrink:0;}
.shop-info{flex:1;}
.shop-name{font-weight:600;font-size:0.9rem;}
.shop-meta{font-size:0.73rem;color:rgba(13,13,13,0.42);margin-top:0.15rem;}
.shop-arrow{color:rgba(13,13,13,0.25);font-size:0.9rem;}
.empty-state{background:white;border-radius:18px;padding:5rem 2rem;text-align:center;border:1px solid var(--border);}
.empty-ico{font-size:2.5rem;margin-bottom:1rem;}
.empty-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;}
.empty-sub{font-size:0.85rem;color:rgba(13,13,13,0.42);line-height:1.6;max-width:360px;margin:0 auto;}
`;