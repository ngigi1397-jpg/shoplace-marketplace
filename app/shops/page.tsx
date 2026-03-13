"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COUNTIES = ["All","Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa","Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi","Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu","Machakos","Makueni","Mandera","Marsabit","Meru","Migori","Mombasa","Murang'a","Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua","Nyeri","Samburu","Siaya","Taita-Taveta","Tana River","Tharaka-Nithi","Trans Nzoia","Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot"];

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

export default function ShopsPage() {
  const [user, setUser] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [county, setCounty] = useState("All");
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
      if (!session) { window.location.href = "/auth/login?redirect=/shops"; return; }
      setUser(session.user);
      const [{ data: shopsData }, { data: savedData }] = await Promise.all([
        supabase.from("shops").select("*").eq("approval_status", "approved").order("is_verified", { ascending: false }).order("created_at", { ascending: false }),
        supabase.from("saved_shops").select("shop_id").eq("user_id", session.user.id),
      ]);
      setShops(shopsData || []);
      setSavedIds(new Set((savedData || []).map((s: any) => s.shop_id)));
      setLoading(false);
    });
  }, []);

  const toggleSave = async (e: React.MouseEvent, shopId: string) => {
    e.stopPropagation();
    if (!user || savingId) return;
    setSavingId(shopId);
    if (savedIds.has(shopId)) {
      await supabase.from("saved_shops").delete().eq("user_id", user.id).eq("shop_id", shopId);
      setSavedIds(prev => { const n = new Set(prev); n.delete(shopId); return n; });
      showToast("Shop removed from saved");
    } else {
      await supabase.from("saved_shops").insert({ user_id: user.id, shop_id: shopId });
      setSavedIds(prev => new Set([...prev, shopId]));
      showToast("Shop saved! ❤️");
    }
    setSavingId(null);
  };

  const submitRating = async () => {
    if (!ratingStars || !ratingTarget) return;
    setSubmittingRating(true);
    await supabase.from("ratings").upsert({
      user_id: user.id, shop_id: ratingTarget.id, stars: ratingStars, comment: ratingComment,
    }, { onConflict: "user_id,shop_id" });
    setRatingTarget(null); setRatingStars(0); setRatingComment("");
    showToast("Rating submitted! ⭐"); setSubmittingRating(false);
  };

  const submitReport = async () => {
    if (!reportReason || !reportTarget) return;
    setSubmittingReport(true);
    await supabase.from("reports").insert({
      reporter_id: user.id, shop_id: reportTarget.id, reason: reportReason, details: reportDetails,
    });
    setReportTarget(null); setReportReason(""); setReportDetails("");
    showToast("Report submitted. We'll review it."); setSubmittingReport(false);
  };

  const filtered = shops.filter(s => {
    const matchSearch = !search || s.shop_name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    const matchCounty = county === "All" || s.county === county;
    return matchSearch && matchCounty;
  });

  const verifiedCount = shops.filter(s => s.is_verified === true).length;
  const categoriesCount = shops.length ? new Set(shops.map(s => s.category).filter(Boolean)).size : 0;

  return (
    <>
      <style>{css}</style>
      {toast && <div className="toast">{toast}</div>}

      {/* RATING MODAL */}
      {ratingTarget && (
        <div className="modal-overlay" onClick={() => setRatingTarget(null)}>
          <div className="modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">⭐ Rate this Shop</div>
              <button className="modal-close" onClick={() => setRatingTarget(null)}>✕</button>
            </div>
            <div className="modal-product-name">{ratingTarget.shop_name}</div>
            <div className="modal-shop">📍 {ratingTarget.county} · {ratingTarget.category}</div>
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

      {/* REPORT MODAL */}
      {reportTarget && (
        <div className="modal-overlay" onClick={() => setReportTarget(null)}>
          <div className="modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">🚩 Report Shop</div>
              <button className="modal-close" onClick={() => setReportTarget(null)}>✕</button>
            </div>
            <div className="modal-product-name">{reportTarget.shop_name}</div>
            <div className="modal-shop">#{String(reportTarget.shop_number || "").padStart(5, "0")} · {reportTarget.county}</div>
            <div className="modal-label">Reason *</div>
            <select className="modal-select" value={reportReason} onChange={e => setReportReason(e.target.value)}>
              <option value="">Select a reason...</option>
              <option>Scam / fraud</option>
              <option>Fake products or services</option>
              <option>Harassment or abuse</option>
              <option>Inappropriate content</option>
              <option>Misleading information</option>
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
        {/* NAV */}
        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <ul className="sp-nav-links">
            <li><a href="/products">Products</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/counties">Counties</a></li>
          </ul>
          <div className="sp-nav-actions">
            <a href="/buyer/saved" className="btn-ghost">🔖 Saved ({savedIds.size})</a>
            <button className="btn-rust-outline" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>Sign Out</button>
          </div>
        </nav>

        {/* HERO — updated to match "fast image" */}
        <div className="hero">
          <div className="hero-bg" />
          <div className="hero-content">
            <div className="hero-tag">Counties</div>
            <h1>Kenya's Product Marketplace</h1>
            <p>Discover Products From Local Sellers. Shop electronics, fashion, food and more from verified sellers across Kenya</p>
            <div className="hero-search">
              <span className="hero-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search products or shops..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="hero-clear" onClick={() => setSearch("")}>✕</button>}
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><strong>{shops.length}</strong> Shops Listed</div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>{COUNTIES.length}</strong> Counties</div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>{categoriesCount}</strong> Categories</div>
            </div>
          </div>
        </div>

        {/* COUNTIES BAR (unchanged) */}
        <div className="cats-bar">
          <div className="cats-inner">
            {COUNTIES.map(c => (
              <button key={c} className={"cat-pill" + (county === c ? " active" : "")} onClick={() => setCounty(c)}>
                {c === "All" ? "🗺️ " : ""}{c}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT (unchanged) */}
        <div className="page-content">
          {loading ? (
            <div className="shops-grid">
              {[...Array(8)].map((_, i) => (
                <div className="skeleton-card" key={i}>
                  <div className="sk-top" />
                  <div className="sk-body">
                    <div className="sk-line w60" />
                    <div className="sk-line w90" />
                    <div className="sk-line w40" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-ico">🏪</div>
              <div className="empty-title">{search || county !== "All" ? "No shops match your search" : "No shops yet"}</div>
              <div className="empty-sub">{search || county !== "All" ? "Try different keywords or a different county." : "No shops have been approved yet."}</div>
            </div>
          ) : (
            <>
              <div className="results-bar">
                <div className="results-count">
                  <strong>{filtered.length}</strong> shop{filtered.length !== 1 ? "s" : ""} found
                  {county !== "All" && <span className="results-filter"> in {county}</span>}
                  {search && <span className="results-filter"> for &quot;{search}&quot;</span>}
                </div>
              </div>
              <div className="shops-grid">
                {filtered.map(s => (
                  <div key={s.id} className={"shop-card" + (s.is_verified === true ? " verified-card" : "")}>
                    {s.is_verified === true && (
                      <div className="verified-ribbon">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12.5L11 14.5L15.5 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Verified Seller
                      </div>
                    )}
                    <button
                      className={"save-btn" + (savedIds.has(s.id) ? " saved" : "")}
                      onClick={(e: React.MouseEvent) => toggleSave(e, s.id)}
                      disabled={savingId === s.id}
                      title={savedIds.has(s.id) ? "Remove from saved" : "Save shop"}
                    >
                      {savedIds.has(s.id) ? "♥" : "♡"}
                    </button>
                    <div className="shop-top" onClick={() => window.location.href = `/shops/${s.id}`}>
                      {s.is_verified === true ? (
                        <div className="shop-av verified-av">
                          <svg width="28" height="28" viewBox="0 0 220 220" fill="none">
                            <defs>
                              <linearGradient id={"bg" + s.id} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FF8040"/>
                                <stop offset="50%" stopColor="#FF5566"/>
                                <stop offset="100%" stopColor="#FF2880"/>
                              </linearGradient>
                            </defs>
                            <rect width="220" height="220" rx="50" fill={`url(#bg${s.id})`}/>
                            <path d="M 76 100 C 76 72 82 56 86 50 C 90 44 96 42 102 42 C 108 42 114 44 118 50 C 122 56 128 72 128 100" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round"/>
                            <path d="M 55 100 C 53 90 58 80 70 78 L 134 78 C 146 80 151 90 149 100 L 158 162 C 160 174 148 180 102 180 C 56 180 44 174 46 162 Z" fill="white" opacity="0.95"/>
                            <circle cx="102" cy="118" r="18" fill={`url(#bg${s.id})`}/>
                            <circle cx="102" cy="118" r="8" fill="white"/>
                            <path d="M 90 130 Q 102 154 114 130 Q 108 142 102 152 Q 96 142 90 130 Z" fill={`url(#bg${s.id})`}/>
                          </svg>
                        </div>
                      ) : (
                        <div className="shop-av">{s.shop_name?.[0]?.toUpperCase()}</div>
                      )}
                      <div className="shop-num">#{String(s.shop_number || "").padStart(5, "0")}</div>
                    </div>
                    <div className="shop-name" onClick={() => window.location.href = `/shops/${s.id}`}>{s.shop_name}</div>
                    {s.description && (
                      <div className="shop-desc" onClick={() => window.location.href = `/shops/${s.id}`}>
                        {s.description.slice(0, 70)}{s.description.length > 70 ? "..." : ""}
                      </div>
                    )}
                    <div className="shop-meta-row">
                      <span className="shop-county">📍 {s.county}</span>
                      <span className="shop-cat">{s.category}</span>
                    </div>
                    {s.phone && <div className="shop-phone">📞 {s.phone}</div>}
                    <div className="shop-card-actions">
                      <button className="card-action-btn rate-btn" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setRatingTarget(s); setRatingStars(0); setRatingComment(""); }}>⭐ Rate</button>
                      <button className="card-action-btn report-btn" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setReportTarget(s); setReportReason(""); setReportDetails(""); }}>🚩 Report</button>
                    </div>
                    <div className="shop-footer" onClick={() => window.location.href = `/shops/${s.id}`}>
                      <span className="shop-arrow">View Shop →</span>
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
:root{--ink:#0d0d0d;--cream:#f5f0e8;--rust:#c84b31;--orange:#e86b1a;--sage:#3d6b4f;--border:rgba(13,13,13,0.1);}
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
.cats-bar{background:white;border-bottom:1px solid var(--border);padding:0 4rem;position:sticky;top:68px;z-index:90;box-shadow:0 2px 12px rgba(0,0,0,0.04);}
.cats-inner{display:flex;gap:0.3rem;overflow-x:auto;padding:0.75rem 0;scrollbar-width:none;}
.cats-inner::-webkit-scrollbar{display:none;}
.cat-pill{display:inline-flex;align-items:center;gap:0.35rem;padding:0.42rem 0.9rem;border:1.5px solid var(--border);border-radius:100px;font-size:0.78rem;font-weight:500;background:transparent;color:rgba(13,13,13,0.55);cursor:pointer;transition:all .2s;white-space:nowrap;font-family:'DM Sans',sans-serif;}
.cat-pill:hover{border-color:var(--orange);color:var(--orange);}
.cat-pill.active{background:linear-gradient(135deg,var(--rust),var(--orange));border-color:transparent;color:white;}
.page-wrap{min-height:100vh;background:var(--cream);}
.page-content{padding:2.5rem 4rem 4rem;}
.results-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;}
.results-count{font-size:0.85rem;color:rgba(13,13,13,0.5);}
.results-count strong{color:var(--ink);font-weight:700;}
.results-filter{color:var(--orange);font-weight:500;}
.shops-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.3rem;}
.shop-card{background:white;border-radius:20px;padding:1.4rem;border:1px solid var(--border);transition:all .25s;position:relative;overflow:hidden;display:flex;flex-direction:column;gap:0.45rem;}
.shop-card:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(0,0,0,0.1);border-color:rgba(232,114,26,0.2);}
.verified-card{background:linear-gradient(150deg,#1a0a00 0%,#1f0d08 60%,#1a0812 100%);border:1px solid rgba(255,120,60,0.3);}
.verified-card:hover{box-shadow:0 18px 44px rgba(255,80,40,0.22);border-color:rgba(255,120,60,0.5);}
.verified-ribbon{display:inline-flex;align-items:center;gap:0.3rem;padding:0.22rem 0.7rem;background:linear-gradient(135deg,#ff8c42,#ff4e8c);border-radius:100px;font-size:0.65rem;font-weight:700;color:white;width:fit-content;}
.save-btn{position:absolute;top:0.8rem;right:0.8rem;width:32px;height:32px;border-radius:50%;border:none;background:rgba(255,255,255,0.15);backdrop-filter:blur(4px);cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:all .2s;color:rgba(255,255,255,0.6);z-index:3;}
.shop-card:not(.verified-card) .save-btn{background:rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.1);color:rgba(13,13,13,0.3);}
.save-btn:hover{transform:scale(1.15);}
.save-btn.saved{color:var(--rust)!important;}
.save-btn:disabled{opacity:0.5;}
.shop-top{display:flex;align-items:center;justify-content:space-between;cursor:pointer;}
.shop-av{width:44px;height:44px;background:var(--rust);border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:800;color:white;}
.verified-av{background:transparent;width:44px;height:44px;}
.shop-num{font-size:0.7rem;color:rgba(13,13,13,0.3);font-weight:500;}
.verified-card .shop-num{color:rgba(255,255,255,0.25);}
.shop-name{font-family:'Syne',sans-serif;font-size:1rem;font-weight:800;cursor:pointer;}
.verified-card .shop-name{color:white;}
.shop-desc{font-size:0.78rem;color:rgba(13,13,13,0.45);line-height:1.5;cursor:pointer;}
.verified-card .shop-desc{color:rgba(255,255,255,0.38);}
.shop-meta-row{display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;}
.shop-county{font-size:0.73rem;color:rgba(13,13,13,0.38);}
.verified-card .shop-county{color:rgba(255,255,255,0.3);}
.shop-cat{font-size:0.68rem;background:rgba(13,13,13,0.05);padding:0.15rem 0.5rem;border-radius:100px;color:rgba(13,13,13,0.4);}
.verified-card .shop-cat{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.3);}
.shop-phone{font-size:0.72rem;color:rgba(13,13,13,0.3);}
.verified-card .shop-phone{color:rgba(255,255,255,0.2);}
.shop-card-actions{display:flex;gap:0.4rem;margin-top:0.1rem;}
.card-action-btn{flex:1;padding:0.35rem 0.5rem;border-radius:8px;font-size:0.72rem;font-weight:600;cursor:pointer;border:1.5px solid rgba(255,255,255,0.12);background:transparent;transition:all .2s;font-family:'DM Sans',sans-serif;color:rgba(255,255,255,0.4);}
.shop-card:not(.verified-card) .card-action-btn{border-color:var(--border);color:rgba(13,13,13,0.45);}
.rate-btn:hover{border-color:#f5a623;color:#f5a623;background:rgba(245,166,35,0.08);}
.report-btn:hover{border-color:#ff6b6b;color:#ff6b6b;background:rgba(255,80,80,0.08);}
.shop-footer{padding-top:0.6rem;border-top:1px solid var(--border);cursor:pointer;margin-top:auto;}
.verified-card .shop-footer{border-color:rgba(255,255,255,0.07);}
.shop-arrow{font-size:0.78rem;font-weight:600;color:rgba(13,13,13,0.3);}
.verified-card .shop-arrow{color:#ff8c42;}
.empty-state{background:white;border-radius:18px;padding:5rem 2rem;text-align:center;border:1px solid var(--border);}
.empty-ico{font-size:2.5rem;margin-bottom:1rem;}
.empty-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;}
.empty-sub{font-size:0.85rem;color:rgba(13,13,13,0.42);line-height:1.6;}
.skeleton-card{background:white;border-radius:20px;padding:1.4rem;border:1px solid var(--border);}
.sk-top{height:44px;background:linear-gradient(90deg,#e8ede9 25%,#f0f4f1 50%,#e8ede9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:10px;margin-bottom:1rem;}
.sk-body{display:flex;flex-direction:column;gap:0.5rem;}
.sk-line{height:11px;background:linear-gradient(90deg,#e8ede9 25%,#f0f4f1 50%,#e8ede9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px;}
.w40{width:40%}.w60{width:60%}.w90{width:90%}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
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
.toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#0d0d0d;color:white;padding:0.65rem 1.5rem;border-radius:100px;font-size:0.85rem;font-weight:500;z-index:1100;animation:fadeup 0.3s ease;pointer-events:none;}
@keyframes fadeup{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
@media(max-width:1024px){.shops-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:768px){
  .sp-nav{padding:0.9rem 1.2rem;}
  .sp-nav-links{display:none;}
  .sp-nav-actions .btn-ghost{display:none;}
  .hero{padding:5.5rem 1.5rem 2.5rem;min-height:auto;}
  .hero-content h1{font-size:2rem;}
  .cats-bar{padding:0 1.2rem;}
  .page-content{padding:2rem 1.2rem 3rem;}
  .shops-grid{grid-template-columns:repeat(2,1fr);gap:0.8rem;}
  .shop-card{padding:1rem;}
}
@media(max-width:480px){
  .hero-content h1{font-size:1.65rem;}
  .hero-stats{flex-wrap:wrap;gap:0.8rem;}
  .shops-grid{grid-template-columns:repeat(2,1fr);gap:0.6rem;}
}
@media(max-width:400px){.shops-grid{grid-template-columns:1fr;}}
`;