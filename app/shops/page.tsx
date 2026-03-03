"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion & Clothing",
  "Home & Living",
  "Agriculture & Farming",
  "Food & Groceries",
  "Health & Beauty",
  "Sports & Outdoors",
  "Automotive",
  "Books & Education",
  "Services",
  "Other",
];

export default function ShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const fetchShops = async () => {
      const { data } = await supabase.from("shops").select("*").eq("approval_status", "approved").order("created_at", { ascending: false });
      setShops(data || []);
      setLoading(false);
    };
    fetchShops();
  }, []);

  const filtered = shops.filter(s => {
    const matchSearch = !search || s.shop_name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || s.category === category;
    return matchSearch && matchCat;
  });

  return (
    <>
      <style>{css}</style>
      <div className="page-wrap">
        <nav className="sp-nav">
          <a href="/" className="sp-logo">
            Sho<span>place</span>
          </a>
          <div className="sp-nav-actions">
            <a href="/products" className="btn-ghost">
              Products
            </a>
            <a href="/seller/dashboard" className="btn-ghost">
              My Shop
            </a>
            <button
              className="btn-rust-outline"
              onClick={async () => {
                // Sign out logic would go here (optional)
                window.location.href = "/";
              }}
            >
              Sign Out
            </button>
          </div>
        </nav>

        <div className="page-content">
          <div className="page-header">
            <h1>Browse Shops</h1>
            <p>Verified sellers and businesses across Kenya</p>
          </div>

          {/* FILTERS BAR */}
          <div className="filters-bar">
            <div className="search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search shops..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="cat-tabs">
              {CATEGORIES.map((c) => (
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

          {/* RESULTS COUNT */}
          <div className="results-count">{filtered.length} shop{filtered.length !== 1 ? "s" : ""} found</div>

          {/* SHOPS GRID */}
          {loading ? (
            <div className="empty-state"><div className="empty-ico">⏳</div><div className="empty-title">Loading shops...</div></div>
          ) : filtered.length > 0 ? (
            <div className="shops-grid">
              {filtered.map((s) => (
                <div className="shop-card" key={s.id} onClick={() => window.location.href = `/shops/${s.id}`}>
                  <div className="shop-cover">
                    <div className="shop-avatar">{s.shop_name?.[0]}</div>
                  </div>
                  <div className="shop-body">
                    <div className="shop-name">{s.shop_name}</div>
                    <div className="shop-meta">Shop #{s.shop_number}</div>
                    <div className="shop-cat">{s.category}</div>
                    <div className="shop-loc">📍 {s.county}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="empty-state">
              <div className="empty-ico">🏪</div>
              <div className="empty-title">No shops found</div>
              <div className="empty-sub">Try a different search or category.</div>
              {(!search && category === "All") && (
                <a href="/seller/register" className="btn-solid" style={{ marginTop: "1.5rem", display: "inline-flex" }}>
                  Open a Shop →
                </a>
              )}
            </div>
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
.sp-nav-actions{display:flex;gap:0.65rem;align-items:center;}
.btn-ghost{padding:0.45rem 1rem;border:1.5px solid rgba(13,13,13,0.25);border-radius:100px;font-size:0.82rem;font-weight:500;color:var(--ink);background:transparent;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-ghost:hover{background:var(--ink);color:var(--cream);}
.btn-solid{padding:0.6rem 1.4rem;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:600;background:var(--rust);color:white;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-solid:hover{background:#a83a22;}
.btn-rust-outline{padding:0.45rem 1rem;border:1.5px solid var(--rust);border-radius:100px;font-size:0.82rem;font-weight:500;background:transparent;color:var(--rust);cursor:pointer;transition:all .2s;}
.btn-rust-outline:hover{background:var(--rust);color:white;}
.page-wrap{min-height:100vh;background:var(--cream);}
.page-content{padding:6rem 4rem 4rem;}
.page-header{margin-bottom:2rem;}
.page-header h1{font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;letter-spacing:-0.03em;}
.page-header p{font-size:0.88rem;color:rgba(13,13,13,0.45);margin-top:0.4rem;}
.filters-bar{margin-bottom:2rem;}
.search-box{display:flex;align-items:center;gap:0.6rem;background:white;border:1.5px solid var(--border);border-radius:12px;padding:0.75rem 1.1rem;max-width:480px;margin-bottom:1.2rem;}
.search-box input{flex:1;border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:0.9rem;background:transparent;}
.cat-tabs{display:flex;gap:0.5rem;flex-wrap:wrap;}
.cat-tab{padding:0.4rem 0.9rem;border:1.5px solid var(--border);border-radius:100px;font-size:0.78rem;font-weight:500;background:white;color:rgba(13,13,13,0.55);cursor:pointer;transition:all .2s;white-space:nowrap;}
.cat-tab:hover{border-color:var(--rust);color:var(--rust);}
.cat-tab.active{background:var(--rust);border-color:var(--rust);color:white;}
.results-count{font-size:0.83rem;color:rgba(13,13,13,0.4);margin-bottom:1.2rem;}
.shops-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.3rem;}
.shop-card{background:white;border-radius:18px;overflow:hidden;border:1px solid var(--border);transition:all .25s;cursor:pointer;}
.shop-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,0.09);}
.shop-cover{height:100px;background:var(--ink);display:flex;align-items:flex-end;justify-content:center;padding-bottom:1rem;position:relative;}
.shop-avatar{width:56px;height:56px;background:var(--rust);border:3px solid white;border-radius:14px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800;color:white;position:absolute;bottom:-28px;}
.shop-body{padding:2.5rem 1.2rem 1.5rem;text-align:center;}
.shop-name{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.2rem;}
.shop-meta{font-size:0.75rem;color:rgba(13,13,13,0.4);margin-bottom:0.6rem;}
.shop-cat{display:inline-block;padding:0.2rem 0.6rem;background:rgba(13,13,13,0.05);border-radius:100px;font-size:0.7rem;font-weight:500;color:rgba(13,13,13,0.6);margin-bottom:0.8rem;}
.shop-loc{font-size:0.75rem;color:var(--sage);font-weight:500;}
.empty-state{background:white;border-radius:18px;padding:5rem 2rem;text-align:center;border:1px solid var(--border);}
.empty-ico{font-size:2.5rem;margin-bottom:1rem;}
.empty-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;}
.empty-sub{font-size:0.85rem;color:rgba(13,13,13,0.42);line-height:1.6;max-width:360px;margin:0 auto;}
@media (max-width: 768px) {
  .sp-nav{padding:0.9rem 1.2rem;}
  .sp-nav-links{display:none;}
  .page-content{padding:5rem 1.2rem 3rem;}
  .shops-grid{grid-template-columns:1fr 1fr;}
  .county-tabs{gap:0.4rem;}
}
@media (max-width: 480px) {
  .shops-grid{grid-template-columns:1fr;}
}
  `
  ;