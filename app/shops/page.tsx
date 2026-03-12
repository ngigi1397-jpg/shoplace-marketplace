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
      user_id: user.id,
      shop_id: ratingTarget.id,
      stars: ratingStars,
      comment: ratingComment,
    }, { onConflict: "user_id,shop_id" });
    setRatingTarget(null); setRatingStars(0); setRatingComment("");
    showToast("Rating submitted! ⭐"); setSubmittingRating(false);
  };

  const submitReport = async () => {
    if (!reportReason || !reportTarget) return;
    setSubmittingReport(true);
    await supabase.from("reports").insert({
      reporter_id: user.id,
      shop_id: reportTarget.id,
      reason: reportReason,
      details: reportDetails,
    });
    setReportTarget(null); setReportReason(""); setReportDetails("");
    showToast("Report submitted. We'll review it."); setSubmittingReport(false);
  };

  const filtered = shops.filter(s => {
    const matchSearch = !search || s.shop_name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    const matchCounty = county === "All" || s.county === county;
    return matchSearch && matchCounty;
  });

  return (
    <>
      <style>{css}</style>
      {toast && <div className="toast">{toast}</div>}

      {ratingTarget && (
        <div className="modal-overlay" onClick={() => setRatingTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
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

      {reportTarget && (
        <div className="modal-overlay" onClick={() => setReportTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
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

        <div className="page-content">
          <div className="page-header">
            <h1>Browse Shops</h1>
            <p>Find trusted sellers across all 47 counties in Kenya</p>
          </div>

          <div className="filters-bar">
            <div className="search-box">
              <span>🔍</span>
              <input type="text" placeholder="Search shops..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="clear-btn" onClick={() => setSearch("")}>✕</button>}
            </div>
            <div className="county-tabs">
              {COUNTIES.map(c => (
                <button key={c} className={"county-tab" + (county === c ? " active" : "")} onClick={() => setCounty(c)}>{c}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="shops-grid">
              {[...Array(8)].map((_, i) => (
                <div className="skeleton-card" key={i}>
                  <div className="sk-top" /><div className="sk-body"><div className="sk-line w60" /><div className="sk-line w90" /><div className="sk-line w40" /></div>
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
              <div className="results-count">{filtered.length} shop{filtered.length !== 1 ? "s" : ""} found{county !== "All" && ` in ${county}`}{search && ` for "${search}"`}</div>
              <div className="shops-grid">
                {filtered.map(s => (
                  <div key={s.id} className={"shop-card" + (s.is_verified === true ? " verified-card" : "")}>
                    {s.is_verified === true && (
                      <div className="verified-ribbon">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M9 12.5L11 14.5L15.5 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Verified Seller
                      </div>
                    )}
                    <button className={"save-btn" + (savedIds.has(s.id) ? " saved" : "")} onClick={e => toggleSave(e, s.id)} disabled={savingId === s.id} title={savedIds.has(s.id) ? "Remove from saved" : "Save shop"}>
                      {savedIds.has(s.id) ? "♥" : "♡"}
                    </button>
                    <div className="shop-top" onClick={() => window.location.href = `/shops/${s.id}`}>
                      {s.is_verified === true ? (
                        <div className="shop-av verified-av">
                          <svg width="28" height="28" viewBox="0 0 220 220" fill="none">
                            <defs><linearGradient id={"bg"+s.id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF8040"/><stop offset="50%" stopColor="#FF5566"/><stop offset="100%" stopColor="#FF2880"/></linearGradient></defs>
                            <rect width="220" height="220" rx="50" fill={`url(#bg${s.id})`}/>
                            <path d="M 76 100 C 76 72 82 56 86 50 C 90 44 96 42 102 42 C 108 42 114 44 118 50 C 122 56 128 72 128 100" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round"/>
                            <path d="M 55 100 C 53 90 58 80 70 78 L 134 78 C 146 80 151 90 149 100 L 158 162 C 160 174 148 180 102 180 C 56 180 44 174 46 162 Z" fill="white" opacity="0.95"/>
                            <circle cx="102" cy="118" r="18" fill={`url(#bg${s.id})`}/><circle cx="102" cy="118" r="8" fill="white"/>
                            <path d="M 90 130 Q 102 154 114 130 Q 108 142 102 152 Q 96 142 90 130 Z" fill={`url(#bg${s.id})`}/>
                          </svg>
                        </div>
                      ) : (
                        <div className="shop-av">{s.shop_name?.[0]?.toUpperCase()}</div>
                      )}
                      <div className="shop-num">#{String(s.shop_number || "").padStart(5, "0")}</div>
                    </div>
                    <div className="shop-name" onClick={() => window.location.href = `/shops/${s.id}`}>{s.shop_name}</div>
                    {s.description && <div className="shop-desc" onClick={() => window.location.href = `/shops/${s.id}`}>{s.description.slice(0, 70)}{s.description.length > 70 ? "..." : ""}</div>}
                    <div className="shop-meta-row">
                      <span className="shop-county">📍 {s.county}</span>
                      <span className="shop-cat">{s.category}</span>
                    </div>
                    {s.phone && <div className="shop-phone">📞 {s.phone}</div>}
                    <div className="shop-card-actions">
                      <button className="card-action-btn rate-btn" onClick={e => { e.stopPropagation(); setRatingTarget(s); setRatingStars(0); setRatingComment(""); }}>⭐ Rate</button>
                      <button className="card-action-btn report-btn" onClick={e => { e.stopPropagation(); setReportTarget(s); setReportReason(""); setReportDetails(""); }}>🚩 Report</button>
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
.county-tabs{display:flex;gap:0.5rem;flex-wrap:wrap;}
.county-tab{padding:0.38rem 0.85rem;border:1.5px solid var(--border);border-radius:100px;font-size:0.77rem;font-weight:500;background:white;color:rgba(13,13,13,0.55);cursor:pointer;transition:all .2s;white-space:nowrap;}
.county-tab:hover{border-color:var(--rust);color:var(--rust);}
.county-tab.active{background:var(--rust);border-color:var(--rust);color:white;}
.results-count{font-size:0.83rem;color:rgba(13,13,13,0.4);margin-bottom:1.2rem;}
.shops-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.3rem;}
.shop-card{background:white;border-radius:18px;padding:1.4rem;border:1px solid var(--border);transition:all .25s;position:relative;overflow:hidden;display:flex;flex-direction:column;gap:0.45rem;}
.shop-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,0.09);}
.verified-card{background:linear-gradient(150deg,#1a0a00 0%,#1f0d08 60%,#1a0812 100%);border:1px solid rgba(255,120,60,0.3);}
.verified-card:hover{box-shadow:0 18px 44px rgba(255,80,40,0.22);border-color:rgba(255,120,60,0.5);}
.verified-ribbon{display:inline-flex;align-items:center;gap:0.3rem;padding:0.22rem 0.7rem;background:linear-gradient(135deg,#ff8c42,#ff4e8c);border-radius:100px;font-size:0.65rem;font-weight:700;color:white;width:fit-content;}
.save-btn{position:absolute;top:0.8rem;right:0.8rem;width:30px;height:30px;border-radius:50%;border:none;background:rgba(255,255,255,0.15);backdrop-filter:blur(4px);cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:all .2s;color:rgba(255,255,255,0.6);z-index:3;}
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
.skeleton-card{background:white;border-radius:18px;padding:1.4rem;border:1px solid var(--border);}
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
.modal-btn-cancel{padding:0.55rem 1.1rem;border:1.5px solid var(--border);border-radius:10px;background:white;font-family:'DM Sans',sans-serif;font-size:0.83rem;cursor:pointer;color:rgba(13,13,13,0.5);}
.modal-btn-cancel:hover{border-color:var(--ink);color:var(--ink);}
.modal-btn-submit{padding:0.55rem 1.3rem;border:none;border-radius:10px;background:#f5a623;font-family:'DM Sans',sans-serif;font-size:0.83rem;font-weight:700;cursor:pointer;color:white;}
.modal-btn-submit:hover{background:#d4881a;}
.modal-btn-submit:disabled{opacity:0.45;cursor:not-allowed;}
.modal-btn-report{padding:0.55rem 1.3rem;border:none;border-radius:10px;background:var(--rust);font-family:'DM Sans',sans-serif;font-size:0.83rem;font-weight:700;cursor:pointer;color:white;}
.modal-btn-report:hover{background:#a83a22;}
.modal-btn-report:disabled{opacity:0.45;cursor:not-allowed;}
.toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#0d0d0d;color:white;padding:0.65rem 1.5rem;border-radius:100px;font-size:0.85rem;font-weight:500;z-index:1100;animation:fadeup 0.3s ease;pointer-events:none;}
@keyframes fadeup{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
@media(max-width:1024px){.shops-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:768px){
  .sp-nav{padding:0.9rem 1.2rem;}
  .sp-nav-links{display:none;}
  .sp-nav-actions .btn-ghost{display:none;}
  .page-content{padding:5rem 1rem 3rem;}
  .page-header h1{font-size:1.5rem;}
  .shops-grid{grid-template-columns:repeat(2,1fr);gap:0.7rem;}
  .shop-card{padding:1rem;}
  .search-box{max-width:100%;}
}
@media(max-width:400px){.shops-grid{grid-template-columns:1fr;}}
`;