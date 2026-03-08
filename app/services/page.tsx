"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIES = ["All","Plumbing","Electrical","Carpentry","Painting","Cleaning","Delivery","Design","Tutoring","Photography","Catering","Beauty & Hair","IT & Tech","Farming & Agriculture","Transport","Security","Events","Other"];
const PRICE_LABEL: any = { fixed: "", hourly: "/hr", negotiable: "Negotiable", free: "Free" };

export default function ServicesPage() {
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = "/auth/login?redirect=/services"; return; }
      setUser(session.user);

      const [{ data: servicesData }, { data: savedData }] = await Promise.all([
        supabase.from("services").select("*, shops(id, shop_name, shop_number, county, phone, is_verified)").eq("is_active", true).order("created_at", { ascending: false }),
        supabase.from("saved_services").select("service_id").eq("user_id", session.user.id),
      ]);

      setServices(servicesData || []);
      setSavedIds(new Set((savedData || []).map((s: any) => s.service_id)));
      setLoading(false);
    });
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const toggleSave = async (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation();
    if (!user || savingId) return;
    setSavingId(serviceId);

    if (savedIds.has(serviceId)) {
      await supabase.from("saved_services").delete().eq("user_id", user.id).eq("service_id", serviceId);
      setSavedIds(prev => { const n = new Set(prev); n.delete(serviceId); return n; });
      showToast("Service removed from saved");
    } else {
      await supabase.from("saved_services").insert({ user_id: user.id, service_id: serviceId });
      setSavedIds(prev => new Set([...prev, serviceId]));
      showToast("Service saved!");
    }
    setSavingId(null);
  };

  const filtered = services.filter(s => {
    const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.shops?.shop_name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || s.category === category;
    return matchSearch && matchCat;
  });

  return (
    <>
      <style>{css}</style>
      {toast && <div className="toast">{toast}</div>}
      <div className="page-wrap">

        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <ul className="sp-nav-links">
            <li><a href="/shops">Shops</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/counties">Counties</a></li>
          </ul>
          <div className="sp-nav-actions">
            <a href="/buyer/saved" className="btn-ghost">🔖 Saved ({savedIds.size})</a>
            <button className="btn-rust-outline" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>Sign Out</button>
          </div>
        </nav>

        <div className="page-content">
          <div className="page-header">
            <h1>Browse Services</h1>
            <p>Find trusted service providers across Kenya</p>
          </div>

          <div className="filters-bar">
            <div className="search-box">
              <span>🔍</span>
              <input type="text" placeholder="Search services or shops..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="clear-btn" onClick={() => setSearch("")}>✕</button>}
            </div>
            <div className="cat-tabs">
              {CATEGORIES.map(c => (
                <button key={c} className={"cat-tab" + (category === c ? " active" : "")} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="services-grid">
              {[...Array(8)].map((_, i) => (
                <div className="skeleton-card" key={i}>
                  <div className="sk-top" />
                  <div className="sk-body"><div className="sk-line w60" /><div className="sk-line w90" /><div className="sk-line w40" /></div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-ico">🔧</div>
              <div className="empty-title">{search || category !== "All" ? "No services match your search" : "No services yet"}</div>
              <div className="empty-sub">{search || category !== "All" ? "Try different keywords or a different category." : "No sellers have listed services yet."}</div>
            </div>
          ) : (
            <>
              <div className="results-count">{filtered.length} service{filtered.length !== 1 ? "s" : ""} found{category !== "All" && ` in ${category}`}{search && ` for "${search}"`}</div>
              <div className="services-grid">
                {filtered.map(s => (
                  <div className="service-card" key={s.id} onClick={() => window.location.href = `/shops/${s.shops?.id || ""}`}>
                    <div className="service-top">
                      <div className="service-icon">⚙️</div>
                      <div className="service-top-right">
                        <div className="service-cat">{s.category}</div>
                        <button
                          className={"save-btn" + (savedIds.has(s.id) ? " saved" : "")}
                          onClick={e => toggleSave(e, s.id)}
                          disabled={savingId === s.id}
                          title={savedIds.has(s.id) ? "Remove from saved" : "Save service"}
                        >
                          {savedIds.has(s.id) ? "♥" : "♡"}
                        </button>
                      </div>
                    </div>
                    <div className="service-shop-row">
                      <span className="service-shop">{s.shops?.shop_name}</span>
                      {s.shops?.is_verified === true && <span className="v-mini">✓</span>}
                    </div>
                    <div className="service-name">{s.name}</div>
                    {s.description && (
                      <div className="service-desc">{s.description.slice(0, 80)}{s.description.length > 80 ? "..." : ""}</div>
                    )}
                    <div className="service-footer">
                      <div className="service-price">
                        {s.price_type === "free" ? "Free" :
                         s.price_type === "negotiable" ? "Negotiable" :
                         s.price ? `KSh ${s.price.toLocaleString()}${PRICE_LABEL[s.price_type] || ""}` : "Price on request"}
                      </div>
                      <div className="service-loc">📍 {s.county || s.shops?.county}</div>
                    </div>
                    <div className="service-actions">
                      {s.shops?.phone && (
                        <a href={`tel:${s.shops.phone}`} className="svc-btn" onClick={e => e.stopPropagation()}>📞 Call</a>
                      )}
                      {s.shops?.phone && (
                        <a
                          href={`https://wa.me/254${String(s.shops.phone).replace(/^0/, "")}?text=Hi, I saw your ${s.name} on Shoplace`}
                          className="svc-btn wa"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                        >
                          💬 WhatsApp
                        </a>
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
.btn-ghost{padding:0.45rem 1rem;border:1.5px solid rgba(13,13,13,0.25);border-radius:100px;font-size:0.82rem;font-weight:500;color:var(--ink);background:transparent;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:0.3rem;}
.btn-ghost:hover{background:var(--ink);color:var(--cream);}
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
.clear-btn{background:none;border:none;color:rgba(13,13,13,0.3);cursor:pointer;font-size:0.8rem;}
.cat-tabs{display:flex;gap:0.5rem;flex-wrap:wrap;}
.cat-tab{padding:0.38rem 0.85rem;border:1.5px solid var(--border);border-radius:100px;font-size:0.77rem;font-weight:500;background:white;color:rgba(13,13,13,0.55);cursor:pointer;transition:all .2s;white-space:nowrap;}
.cat-tab:hover{border-color:var(--rust);color:var(--rust);}
.cat-tab.active{background:var(--rust);border-color:var(--rust);color:white;}
.results-count{font-size:0.83rem;color:rgba(13,13,13,0.4);margin-bottom:1.2rem;}
.services-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.3rem;}
.service-card{background:white;border-radius:18px;padding:1.3rem;border:1px solid var(--border);transition:all .25s;cursor:pointer;display:flex;flex-direction:column;gap:0.55rem;}
.service-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,0.09);}
.service-top{display:flex;align-items:center;justify-content:space-between;}
.service-icon{font-size:1.6rem;}
.service-top-right{display:flex;align-items:center;gap:0.5rem;}
.service-cat{font-size:0.68rem;background:rgba(13,13,13,0.05);padding:0.18rem 0.55rem;border-radius:100px;color:rgba(13,13,13,0.45);}
.save-btn{width:28px;height:28px;border-radius:50%;border:none;background:rgba(13,13,13,0.04);cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:all .2s;color:rgba(13,13,13,0.25);}
.save-btn:hover{transform:scale(1.15);color:var(--rust);}
.save-btn.saved{color:var(--rust);background:rgba(200,75,49,0.08);}
.save-btn:disabled{opacity:0.5;}
.service-shop-row{display:flex;align-items:center;gap:0.3rem;}
.service-shop{font-size:0.72rem;color:var(--sage);font-weight:500;}
.v-mini{display:inline-flex;width:14px;height:14px;background:linear-gradient(135deg,#FF8040,#FF2880);border-radius:50%;align-items:center;justify-content:center;font-size:0.55rem;color:white;font-weight:700;}
.service-name{font-family:'Syne',sans-serif;font-size:0.92rem;font-weight:700;line-height:1.3;}
.service-desc{font-size:0.78rem;color:rgba(13,13,13,0.45);line-height:1.55;}
.service-footer{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:0.3rem;}
.service-price{font-size:0.92rem;font-weight:700;color:var(--rust);}
.service-loc{font-size:0.72rem;color:rgba(13,13,13,0.38);}
.service-actions{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;}
.svc-btn{padding:0.45rem;border-radius:8px;font-size:0.75rem;font-weight:500;text-align:center;border:1.5px solid var(--border);color:rgba(13,13,13,0.5);display:flex;align-items:center;justify-content:center;gap:0.3rem;transition:all .2s;}
.svc-btn:hover{border-color:var(--ink);color:var(--ink);}
.svc-btn.wa{background:rgba(37,211,102,0.05);border-color:rgba(37,211,102,0.25);color:rgba(18,140,126,0.8);}
.svc-btn.wa:hover{background:rgba(37,211,102,0.12);}
.empty-state{background:white;border-radius:18px;padding:5rem 2rem;text-align:center;border:1px solid var(--border);}
.empty-ico{font-size:2.5rem;margin-bottom:1rem;}
.empty-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;}
.empty-sub{font-size:0.85rem;color:rgba(13,13,13,0.42);line-height:1.6;}
.skeleton-card{background:white;border-radius:18px;padding:1.3rem;border:1px solid var(--border);}
.sk-top{height:40px;background:linear-gradient(90deg,#e8ede9 25%,#f0f4f1 50%,#e8ede9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:10px;margin-bottom:1rem;}
.sk-body{display:flex;flex-direction:column;gap:0.5rem;}
.sk-line{height:11px;background:linear-gradient(90deg,#e8ede9 25%,#f0f4f1 50%,#e8ede9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px;}
.w40{width:40%}.w60{width:60%}.w90{width:90%}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#0d0d0d;color:white;padding:0.65rem 1.5rem;border-radius:100px;font-size:0.85rem;font-weight:500;z-index:999;animation:fadeup 0.3s ease;}
@keyframes fadeup{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
@media(max-width:1024px){.services-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:768px){
  .sp-nav{padding:0.9rem 1.2rem;}
  .sp-nav-links{display:none;}
  .sp-nav-actions .btn-ghost{display:none;}
  .page-content{padding:5rem 1.2rem 3rem;}
  .page-header h1{font-size:1.5rem;}
  .services-grid{grid-template-columns:repeat(2,1fr);gap:0.8rem;}
  .service-card{padding:1rem;}
  .search-box{max-width:100%;}
}
@media(max-width:480px){
  .services-grid{grid-template-columns:repeat(2,1fr);gap:0.6rem;}
  .service-name{font-size:0.82rem;}
  .service-card{padding:0.8rem;}
}
`;