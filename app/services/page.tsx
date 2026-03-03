"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SERVICE_CATS = ["All","Plumbing","Electrical","Carpentry","Painting","Cleaning","Delivery","Design","Tutoring","Photography","Catering","Beauty & Hair","IT & Tech","Other"];

export default function ServicesPage() {
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = "/auth/login?redirect=/services"; return; }
      setUser(session.user);
      const { data } = await supabase.from("services").select("*, shops(shop_name, shop_number, county, phone, whatsapp)").eq("is_active", true).order("created_at", { ascending: false });
      setServices(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = services.filter(s => {
    const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.shops?.shop_name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || s.category === category;
    return matchSearch && matchCat;
  });

  return (
    <>
      <style>{css}</style>
      <div className="page-wrap">
        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <ul className="sp-nav-links">
            <li><a href="/products">Products</a></li>
            <li><a href="/shops">Shops</a></li>
            <li><a href="/counties">Counties</a></li>
          </ul>
          <div className="sp-nav-actions">
            <a href="/seller/dashboard" className="btn-ghost">My Shop</a>
            <button className="btn-rust-outline" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>Sign Out</button>
          </div>
        </nav>

        <div className="page-content">
          <div className="page-header">
            <h1>Browse Services</h1>
            <p>Find skilled service providers across Kenya</p>
          </div>

          <div className="filters-bar">
            <div className="search-box">
              <span>🔍</span>
              <input type="text" placeholder="Search services or providers..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="cat-tabs">
              {SERVICE_CATS.map(c => (
                <button key={c} className={`cat-tab ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-ico">⏳</div><div className="empty-title">Loading services...</div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-ico">⚙️</div>
              <div className="empty-title">{search || category !== "All" ? "No services match your search" : "No services yet"}</div>
              <div className="empty-sub">
                {search || category !== "All"
                  ? "Try a different search or category."
                  : "No services have been listed yet. Open a shop and be the first to offer your skills!"}
              </div>
              {(!search && category === "All") && (
                <a href="/seller/register" className="btn-solid" style={{ marginTop: "1.5rem", display: "inline-flex" }}>
                  Offer Your Services →
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="results-count">{filtered.length} service{filtered.length !== 1 ? "s" : ""} found</div>
              <div className="services-grid">
                {filtered.map(s => (
                  <div className="service-card" key={s.id}>
                    <div className="service-top">
                      <div className="service-icon">⚙️</div>
                      <div className="service-cat-tag">{s.category}</div>
                    </div>
                    <div className="service-name">{s.name}</div>
                    <div className="service-shop">{s.shops?.shop_name} · Shop #{s.shops?.shop_number}</div>
                    {s.description && <div className="service-desc">{s.description.slice(0, 80)}{s.description.length > 80 ? "..." : ""}</div>}
                    <div className="service-footer">
                      <div className="service-price">
                        {s.price ? `From KSh ${s.price.toLocaleString()}` : "Price on request"}
                      </div>
                      <div className="service-loc">📍 {s.shops?.county}</div>
                    </div>
                    <div className="service-actions">
                      {s.shops?.phone && (
                        <a href={`tel:${s.shops.phone}`} className="contact-btn phone">📞 Call</a>
                      )}
                      {s.shops?.whatsapp && (
                        <a href={`https://wa.me/${s.shops.whatsapp?.replace(/\D/g, "")}`} target="_blank" className="contact-btn whatsapp">💬 WhatsApp</a>
                      )}
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
.page-header{margin-bottom:2rem;}
.page-header h1{font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;letter-spacing:-0.03em;}
.page-header p{font-size:0.88rem;color:rgba(13,13,13,0.45);margin-top:0.4rem;}
.filters-bar{margin-bottom:2rem;}
.search-box{display:flex;align-items:center;gap:0.6rem;background:white;border:1.5px solid var(--border);border-radius:12px;padding:0.75rem 1.1rem;max-width:480px;margin-bottom:1.2rem;}
.search-box input{flex:1;border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:0.9rem;background:transparent;}
.cat-tabs{display:flex;gap:0.5rem;flex-wrap:wrap;}
.cat-tab{padding:0.38rem 0.85rem;border:1.5px solid var(--border);border-radius:100px;font-size:0.77rem;font-weight:500;background:white;color:rgba(13,13,13,0.55);cursor:pointer;transition:all .2s;white-space:nowrap;}
.cat-tab:hover{border-color:var(--rust);color:var(--rust);}
.cat-tab.active{background:var(--rust);border-color:var(--rust);color:white;}
.results-count{font-size:0.83rem;color:rgba(13,13,13,0.4);margin-bottom:1.2rem;}
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.3rem;}
.service-card{background:white;border-radius:18px;padding:1.6rem;border:1px solid var(--border);transition:all .25s;}
.service-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,0.07);}
.service-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;}
.service-icon{font-size:1.6rem;}
.service-cat-tag{font-size:0.7rem;background:rgba(13,13,13,0.06);padding:0.2rem 0.6rem;border-radius:100px;color:rgba(13,13,13,0.5);font-weight:500;}
.service-name{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;margin-bottom:0.3rem;}
.service-shop{font-size:0.73rem;color:var(--sage);font-weight:500;margin-bottom:0.6rem;}
.service-desc{font-size:0.8rem;color:rgba(13,13,13,0.5);line-height:1.6;margin-bottom:0.8rem;}
.service-footer{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;}
.service-price{font-size:0.9rem;font-weight:600;color:var(--rust);}
.service-loc{font-size:0.72rem;color:rgba(13,13,13,0.38);}
.service-actions{display:flex;gap:0.6rem;}
.contact-btn{flex:1;padding:0.55rem 0.8rem;border-radius:8px;font-size:0.8rem;font-weight:500;text-align:center;cursor:pointer;transition:all .2s;border:1.5px solid var(--border);}
.contact-btn.phone:hover{border-color:var(--sage);color:var(--sage);}
.contact-btn.whatsapp{background:rgba(37,211,102,0.08);border-color:rgba(37,211,102,0.3);color:#128C7E;}
.contact-btn.whatsapp:hover{background:rgba(37,211,102,0.15);}
.empty-state{background:white;border-radius:18px;padding:5rem 2rem;text-align:center;border:1px solid var(--border);}
.empty-ico{font-size:2.5rem;margin-bottom:1rem;}
.empty-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;}
.empty-sub{font-size:0.85rem;color:rgba(13,13,13,0.42);line-height:1.6;max-width:360px;margin:0 auto;}
`;