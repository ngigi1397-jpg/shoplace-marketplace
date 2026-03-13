"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIES = ["All","Plumbing","Electrical","Carpentry","Painting","Cleaning","Delivery","Design","Tutoring","Photography","Catering","Beauty & Hair","IT & Tech","Farming & Agriculture","Transport","Security","Events","Other"];
const PRICE_LABEL: any = { fixed: "", hourly: "/hr", negotiable: "Negotiable", free: "Free" };

const CAT_ICONS: any = {
  "Plumbing":"🔧","Electrical":"⚡","Carpentry":"🪚","Painting":"🎨","Cleaning":"🧹",
  "Delivery":"📦","Design":"✏️","Tutoring":"📚","Photography":"📷","Catering":"🍽️",
  "Beauty & Hair":"💇","IT & Tech":"💻","Farming & Agriculture":"🌾","Transport":"🚗",
  "Security":"🔒","Events":"🎉","Other":"⚙️"
};

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: "0.3rem" }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          style={{ fontSize: "1.6rem", cursor: "pointer", color: s <= (hover || value) ? "#f5a623" : "rgba(13,13,13,0.15)", transition: "color .15s" }}>★</span>
      ))}
    </div>
  );
}

export default function ServicesPage() {
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const [ratingTarget, setRatingTarget] = useState<any>(null);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  const [reportTarget, setReportTarget] = useState<any>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

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

  const toggleSave = async (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation();
    if (!user || savingId) return;
    setSavingId(serviceId);
    if (savedIds.has(serviceId)) {
      await supabase.from("saved_services").delete().eq("user_id", user.id).eq("service_id", serviceId);
      setSavedIds(prev => { const n = new Set(prev); n.delete(serviceId); return n; });
      showToast("Removed from saved");
    } else {
      await supabase.from("saved_services").insert({ user_id: user.id, service_id: serviceId });
      setSavedIds(prev => new Set([...prev, serviceId]));
      showToast("Service saved! ❤️");
    }
    setSavingId(null);
  };

  const submitRating = async () => {
    if (!ratingStars || !ratingTarget) return;
    setSubmittingRating(true);
    await supabase.from("ratings").upsert({
      user_id: user.id,
      service_id: ratingTarget.id,
      shop_id: ratingTarget.shops?.id,
      stars: ratingStars,
      comment: ratingComment,
    }, { onConflict: "user_id,service_id" });
    setRatingTarget(null); setRatingStars(0); setRatingComment("");
    showToast("Rating submitted! ⭐"); setSubmittingRating(false);
  };

  const submitReport = async () => {
    if (!reportReason || !reportTarget) return;
    setSubmittingReport(true);
    await supabase.from("reports").insert({
      reporter_id: user.id,
      shop_id: reportTarget.shops?.id,
      reason: reportReason,
      details: reportDetails,
    });
    setReportTarget(null); setReportReason(""); setReportDetails("");
    showToast("Report submitted. We'll review it."); setSubmittingReport(false);
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

      {/* ── RATING MODAL ── */}
      {ratingTarget && (
        <div className="modal-overlay" onClick={() => setRatingTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">⭐ Rate this Service</div>
              <button className="modal-close" onClick={() => setRatingTarget(null)}>✕</button>
            </div>
            <div className="modal-product-name">{ratingTarget.name}</div>
            <div className="modal-shop">by {ratingTarget.shops?.shop_name}</div>
            <div className="modal-stars-wrap">
              <StarPicker value={ratingStars} onChange={setRatingStars} />
              <span className="modal-stars-label">{["","Poor","Fair","Good","Very Good","Excellent"][ratingStars] || "Tap to rate"}</span>
            </div>
            <textarea className="modal-textarea" placeholder="Write a review (optional)..." value={ratingComment} onChange={e => setRatingComment(e.target.value)} rows={3} />
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setRatingTarget(null)}>Cancel</button>
              <button className="modal-btn-submit" onClick={submitRating} disabled={!ratingStars || submittingRating}>{submittingRating ? "Submitting..." : "Submit Rating"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── REPORT MODAL ── */}
      {reportTarget && (
        <div className="modal-overlay" onClick={() => setReportTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">🚩 Report Seller</div>
              <button className="modal-close" onClick={() => setReportTarget(null)}>✕</button>
            </div>
            <div className="modal-product-name">{reportTarget.shops?.shop_name}</div>
            <div className="modal-shop">Reporting via service: {reportTarget.name}</div>
            <div className="modal-label">Reason *</div>
            <select className="modal-select" value={reportReason} onChange={e => setReportReason(e.target.value)}>
              <option value="">Select a reason...</option>
              <option>Fake or misleading service</option>
              <option>Scam / fraud</option>
              <option>Wrong price listed</option>
              <option>Inappropriate content</option>
              <option>Service not as described</option>
              <option>Other</option>
            </select>
            <textarea className="modal-textarea" placeholder="Additional details (optional)..." value={reportDetails} onChange={e => setReportDetails(e.target.value)} rows={3} />
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setReportTarget(null)}>Cancel</button>
              <button className="modal-btn-report" onClick={submitReport} disabled={!reportReason || submittingReport}>{submittingReport ? "Submitting..." : "Submit Report"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-wrap">
        {/* ── NAV ── */}
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

        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-bg" />
          <div className="hero-content">
            <div className="hero-tag">🇰🇪 Kenya's Service Marketplace</div>
            <h1>Find Trusted<br />Service Providers</h1>
            <p>Connect with verified professionals across Kenya — from plumbing to web design</p>
            <div className="hero-search">
              <span className="hero-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search services or providers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="hero-clear" onClick={() => setSearch("")}>✕</button>}
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><strong>{services.length}</strong> Services Listed</div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>{new Set(services.map(s => s.shops?.county)).size}</strong> Counties Covered</div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>{CATEGORIES.length - 1}</strong> Categories</div>
            </div>
          </div>
        </div>

        {/* ── CATEGORIES ── */}
        <div className="cats-bar">
          <div className="cats-inner">
            {CATEGORIES.map(c => (
              <button key={c} className={"cat-pill" + (category === c ? " active" : "")} onClick={() => setCategory(c)}>
                {c !== "All" && <span>{CAT_ICONS[c] || "⚙️"}</span>}
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="page-content">
          {loading ? (
            <div className="services-grid">
              {[...Array(8)].map((_, i) => (
                <div className="skeleton-card" key={i}>
                  <div className="sk-img" />
                  <div className="sk-body">
                    <div className="sk-line w60" /><div className="sk-line w90" /><div className="sk-line w40" />
                  </div>
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
              <div className="results-bar">
                <div className="results-count">
                  <strong>{filtered.length}</strong> service{filtered.length !== 1 ? "s" : ""} found
                  {category !== "All" && <span className="results-filter"> in {category}</span>}
                  {search && <span className="results-filter"> for "{search}"</span>}
                </div>
              </div>
              <div className="services-grid">
                {filtered.map(s => {
                  const icon = CAT_ICONS[s.category] || "⚙️";
                  const isSaved = savedIds.has(s.id);
                  return (
                    <div className="service-card" key={s.id}>
                      {/* IMAGE / BANNER */}
                      <div className="card-img" onClick={() => window.location.href = `/shops/${s.shops?.id || ""}`}>
                        {s.image_url ? (
                          <img src={s.image_url} alt={s.name} />
                        ) : (
                          <div className="card-img-placeholder">
                            <span className="card-img-icon">{icon}</span>
                            <span className="card-img-cat">{s.category || "Service"}</span>
                          </div>
                        )}
                        <button
                          className={"save-btn" + (isSaved ? " saved" : "")}
                          onClick={e => toggleSave(e, s.id)}
                          disabled={savingId === s.id}
                          title={isSaved ? "Remove from saved" : "Save service"}
                        >
                          {isSaved ? "♥" : "♡"}
                        </button>
                        {s.shops?.is_verified === true && (
                          <div className="verified-ribbon">✓ Verified</div>
                        )}
                      </div>

                      {/* BODY */}
                      <div className="card-body">
                        <div className="card-meta-row">
                          <span className="card-cat-badge">{icon} {s.category}</span>
                          <span className="card-loc">📍 {s.county || s.shops?.county}</span>
                        </div>

                        <div className="card-shop" onClick={() => window.location.href = `/shops/${s.shops?.id || ""}`}>
                          {s.shops?.shop_name}
                        </div>

                        <div className="card-name" onClick={() => window.location.href = `/shops/${s.shops?.id || ""}`}>
                          {s.name}
                        </div>

                        {s.description && (
                          <div className="card-desc">
                            {s.description.slice(0, 90)}{s.description.length > 90 ? "..." : ""}
                          </div>
                        )}

                        <div className="card-price">
                          {s.price_type === "free" ? "Free" :
                           s.price_type === "negotiable" ? "Negotiable" :
                           s.price ? `KSh ${s.price.toLocaleString()}${PRICE_LABEL[s.price_type] || ""}` :
                           "Price on request"}
                        </div>

                        <div className="card-actions">
                          {s.shops?.phone && (
                            <a href={`tel:${s.shops.phone}`} className="card-btn call-btn" onClick={e => e.stopPropagation()}>
                              📞 Call
                            </a>
                          )}
                          {s.shops?.phone && (
                            <a href={`https://wa.me/254${String(s.shops.phone).replace(/^0/, "")}?text=Hi, I saw your ${s.name} on Shoplace`} className="card-btn wa-btn" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                              💬 WhatsApp
                            </a>
                          )}
                        </div>

                        <div className="card-footer-actions">
                          <button className="footer-btn rate-btn" onClick={() => { setRatingTarget(s); setRatingStars(0); setRatingComment(""); }}>
                            ⭐ Rate Service
                          </button>
                          <button className="footer-btn report-btn" onClick={() => { setReportTarget(s); setReportReason(""); setReportDetails(""); }}>
                            🚩 Report
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
:root{--ink:#0d0d0d;--cream:#f5f0e8;--rust:#c84b31;--orange:#e86b1a;--orange2:#f59332;--sage:#3d6b4f;--border:rgba(13,13,13,0.1);}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);}
a{text-decoration:none;color:inherit;}

/* NAV */
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

/* HERO */
.hero{position:relative;padding:7rem 4rem 4rem;overflow:hidden;min-height:380px;display:flex;align-items:center;}
.hero-bg{position:absolute;inset:0;background:linear-gradient(135deg,#c84b31 0%,#e8721a 40%,#f5a623 100%);z-index:0;}
.hero-bg::after{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");}
.hero-content{position:relative;z-index:1;max-width:680px;}
.hero-tag{display:inline-flex;align-items:center;gap:0.4rem;background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.25);border-radius:100px;padding:0.3rem 0.85rem;font-size:0.75rem;font-weight:600;color:white;margin-bottom:1.2rem;letter-spacing:0.03em;}
.hero-content h1{font-family:'Syne',sans-serif;font-size:3rem;font-weight:800;color:white;line-height:1.1;letter-spacing:-0.03em;margin-bottom:0.8rem;}
.hero-content p{font-size:1rem;color:rgba(255,255,255,0.8);line-height:1.6;margin-bottom:2rem;max-width:500px;}
.hero-search{display:flex;align-items:center;gap:0.7rem;background:white;border-radius:14px;padding:0.85rem 1.2rem;max-width:520px;box-shadow:0 8px 32px rgba(0,0,0,0.15);}
.hero-search-icon{font-size:1rem;flex-shrink:0;}
.hero-search input{flex:1;border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:0.95rem;background:transparent;color:var(--ink);}
.hero-search input::placeholder{color:rgba(13,13,13,0.35);}
.hero-clear{background:none;border:none;color:rgba(13,13,13,0.3);cursor:pointer;font-size:0.85rem;padding:0.2rem;border-radius:50%;}
.hero-clear:hover{color:var(--rust);}
.hero-stats{display:flex;align-items:center;gap:1.2rem;margin-top:1.5rem;}
.hero-stat{font-size:0.82rem;color:rgba(255,255,255,0.8);}
.hero-stat strong{color:white;font-size:1rem;font-family:'Syne',sans-serif;font-weight:700;}
.hero-stat-divider{width:1px;height:20px;background:rgba(255,255,255,0.25);}

/* CATEGORIES BAR */
.cats-bar{background:white;border-bottom:1px solid var(--border);padding:0 4rem;position:sticky;top:68px;z-index:90;box-shadow:0 2px 12px rgba(0,0,0,0.04);}
.cats-inner{display:flex;gap:0.3rem;overflow-x:auto;padding:0.75rem 0;scrollbar-width:none;}
.cats-inner::-webkit-scrollbar{display:none;}
.cat-pill{display:inline-flex;align-items:center;gap:0.35rem;padding:0.42rem 0.9rem;border:1.5px solid var(--border);border-radius:100px;font-size:0.78rem;font-weight:500;background:transparent;color:rgba(13,13,13,0.55);cursor:pointer;transition:all .2s;white-space:nowrap;font-family:'DM Sans',sans-serif;}
.cat-pill:hover{border-color:var(--orange);color:var(--orange);}
.cat-pill.active{background:linear-gradient(135deg,var(--rust),var(--orange));border-color:transparent;color:white;}

/* CONTENT */
.page-wrap{min-height:100vh;background:var(--cream);}
.page-content{padding:2.5rem 4rem 4rem;}
.results-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;}
.results-count{font-size:0.85rem;color:rgba(13,13,13,0.5);}
.results-count strong{color:var(--ink);font-weight:700;}
.results-filter{color:var(--orange);font-weight:500;}

/* SERVICE CARDS GRID */
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;}
.service-card{background:white;border-radius:20px;overflow:hidden;border:1px solid var(--border);transition:all .25s;display:flex;flex-direction:column;}
.service-card:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(0,0,0,0.1);border-color:rgba(232,114,26,0.2);}

/* CARD IMAGE */
.card-img{position:relative;height:190px;overflow:hidden;cursor:pointer;flex-shrink:0;}
.card-img img{width:100%;height:100%;object-fit:cover;transition:transform .35s;}
.service-card:hover .card-img img{transform:scale(1.05);}
.card-img-placeholder{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;background:linear-gradient(135deg,rgba(200,75,49,0.08),rgba(232,114,26,0.12));}
.card-img-icon{font-size:3rem;}
.card-img-cat{font-size:0.72rem;font-weight:600;color:rgba(13,13,13,0.35);text-transform:uppercase;letter-spacing:0.06em;}
.save-btn{position:absolute;top:0.75rem;right:0.75rem;width:34px;height:34px;border-radius:50%;border:none;background:rgba(255,255,255,0.9);backdrop-filter:blur(4px);cursor:pointer;font-size:1.05rem;display:flex;align-items:center;justify-content:center;transition:all .2s;color:rgba(13,13,13,0.3);box-shadow:0 2px 8px rgba(0,0,0,0.12);}
.save-btn:hover{transform:scale(1.15);color:var(--rust);}
.save-btn.saved{color:var(--rust);background:white;}
.save-btn:disabled{opacity:0.5;}
.verified-ribbon{position:absolute;bottom:0.75rem;left:0.75rem;display:inline-flex;align-items:center;padding:0.2rem 0.6rem;background:linear-gradient(135deg,#FF8040,#FF2880);border-radius:100px;font-size:0.62rem;font-weight:700;color:white;}

/* CARD BODY */
.card-body{padding:1.1rem 1.2rem;display:flex;flex-direction:column;gap:0.45rem;flex:1;}
.card-meta-row{display:flex;align-items:center;justify-content:space-between;}
.card-cat-badge{font-size:0.68rem;background:rgba(232,114,26,0.08);color:var(--orange);padding:0.18rem 0.55rem;border-radius:100px;font-weight:600;}
.card-loc{font-size:0.68rem;color:rgba(13,13,13,0.38);}
.card-shop{font-size:0.72rem;color:var(--sage);font-weight:600;cursor:pointer;}
.card-shop:hover{text-decoration:underline;}
.card-name{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;line-height:1.3;cursor:pointer;}
.card-name:hover{color:var(--orange);}
.card-desc{font-size:0.78rem;color:rgba(13,13,13,0.45);line-height:1.55;}
.card-price{font-size:1rem;font-weight:700;color:var(--rust);margin-top:auto;padding-top:0.3rem;}
.card-actions{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-top:0.3rem;}
.card-btn{padding:0.5rem;border-radius:10px;font-size:0.76rem;font-weight:500;text-align:center;display:flex;align-items:center;justify-content:center;gap:0.3rem;transition:all .2s;border:1.5px solid var(--border);color:rgba(13,13,13,0.55);}
.call-btn:hover{border-color:var(--ink);color:var(--ink);}
.wa-btn{background:rgba(37,211,102,0.05);border-color:rgba(37,211,102,0.25);color:#168a4e;}
.wa-btn:hover{background:rgba(37,211,102,0.12);}
.card-footer-actions{display:flex;gap:0.4rem;padding-top:0.5rem;border-top:1px solid rgba(13,13,13,0.06);}
.footer-btn{flex:1;padding:0.38rem 0.5rem;border-radius:8px;font-size:0.72rem;font-weight:600;cursor:pointer;border:1.5px solid var(--border);background:transparent;transition:all .2s;font-family:'DM Sans',sans-serif;}
.rate-btn{color:rgba(13,13,13,0.5);}
.rate-btn:hover{border-color:#f5a623;color:#c8830a;background:rgba(245,166,35,0.06);}
.report-btn{color:rgba(13,13,13,0.4);}
.report-btn:hover{border-color:var(--rust);color:var(--rust);background:rgba(200,75,49,0.05);}

/* EMPTY & SKELETON */
.empty-state{background:white;border-radius:18px;padding:5rem 2rem;text-align:center;border:1px solid var(--border);}
.empty-ico{font-size:2.5rem;margin-bottom:1rem;}
.empty-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;}
.empty-sub{font-size:0.85rem;color:rgba(13,13,13,0.42);line-height:1.6;}
.skeleton-card{background:white;border-radius:20px;overflow:hidden;border:1px solid var(--border);}
.sk-img{height:190px;background:linear-gradient(90deg,#e8ede9 25%,#f0f4f1 50%,#e8ede9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}
.sk-body{padding:1.1rem;display:flex;flex-direction:column;gap:0.5rem;}
.sk-line{height:11px;background:linear-gradient(90deg,#e8ede9 25%,#f0f4f1 50%,#e8ede9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px;}
.w40{width:40%}.w60{width:60%}.w90{width:90%}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* MODALS */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem;}
.modal{background:white;border-radius:20px;padding:1.8rem;width:100%;max-width:420px;box-shadow:0 24px 64px rgba(0,0,0,0.18);}
.modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem;}
.modal-title{font-family:'Syne',sans-serif;font-size:1.05rem;font-weight:800;}
.modal-close{background:none;border:none;font-size:1rem;cursor:pointer;color:rgba(13,13,13,0.35);width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:all .2s;}
.modal-close:hover{background:rgba(13,13,13,0.06);}
.modal-product-name{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;margin-bottom:0.2rem;}
.modal-shop{font-size:0.75rem;color:rgba(13,13,13,0.42);margin-bottom:1.2rem;}
.modal-stars-wrap{display:flex;align-items:center;gap:0.8rem;margin-bottom:1.2rem;}
.modal-stars-label{font-size:0.82rem;font-weight:600;color:rgba(13,13,13,0.45);}
.modal-label{font-size:0.78rem;font-weight:600;color:rgba(13,13,13,0.55);margin-bottom:0.4rem;}
.modal-select{width:100%;padding:0.7rem 0.9rem;border:1.5px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:0.85rem;background:white;color:var(--ink);margin-bottom:1rem;outline:none;}
.modal-select:focus{border-color:var(--rust);}
.modal-textarea{width:100%;padding:0.75rem 0.9rem;border:1.5px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:0.85rem;resize:none;outline:none;margin-bottom:1.2rem;color:var(--ink);}
.modal-textarea:focus{border-color:var(--rust);}
.modal-actions{display:flex;gap:0.6rem;justify-content:flex-end;}
.modal-btn-cancel{padding:0.55rem 1.1rem;border:1.5px solid var(--border);border-radius:10px;background:white;font-family:'DM Sans',sans-serif;font-size:0.83rem;cursor:pointer;color:rgba(13,13,13,0.5);transition:all .2s;}
.modal-btn-cancel:hover{border-color:var(--ink);color:var(--ink);}
.modal-btn-submit{padding:0.55rem 1.3rem;border:none;border-radius:10px;background:#f5a623;font-family:'DM Sans',sans-serif;font-size:0.83rem;font-weight:700;cursor:pointer;color:white;transition:all .2s;}
.modal-btn-submit:hover{background:#d4881a;}
.modal-btn-submit:disabled{opacity:0.45;cursor:not-allowed;}
.modal-btn-report{padding:0.55rem 1.3rem;border:none;border-radius:10px;background:var(--rust);font-family:'DM Sans',sans-serif;font-size:0.83rem;font-weight:700;cursor:pointer;color:white;transition:all .2s;}
.modal-btn-report:hover{background:#a83a22;}
.modal-btn-report:disabled{opacity:0.45;cursor:not-allowed;}

/* TOAST */
.toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#0d0d0d;color:white;padding:0.65rem 1.5rem;border-radius:100px;font-size:0.85rem;font-weight:500;z-index:1100;animation:fadeup 0.3s ease;pointer-events:none;}
@keyframes fadeup{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}

/* RESPONSIVE */
@media(max-width:1200px){.services-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:1024px){.services-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:768px){
  .sp-nav{padding:0.9rem 1.2rem;}
  .sp-nav-links{display:none;}
  .sp-nav-actions .btn-ghost{display:none;}
  .hero{padding:5.5rem 1.5rem 2.5rem;min-height:auto;}
  .hero-content h1{font-size:2rem;}
  .cats-bar{padding:0 1.2rem;}
  .page-content{padding:2rem 1.2rem 3rem;}
  .services-grid{grid-template-columns:repeat(2,1fr);gap:1rem;}
  .card-img{height:150px;}
}
@media(max-width:480px){
  .hero-content h1{font-size:1.65rem;}
  .hero-stats{flex-wrap:wrap;gap:0.8rem;}
  .services-grid{grid-template-columns:repeat(2,1fr);gap:0.7rem;}
  .card-body{padding:0.85rem;}
  .card-name{font-size:0.85rem;}
  .card-img{height:130px;}
}
`;