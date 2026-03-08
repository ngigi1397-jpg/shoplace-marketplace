"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Tab = "overview" | "products" | "shops" | "services" | "inquiries";

export default function BuyerDashboard() {
  const [user, setUser]     = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [tab, setTab]       = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  const [savedProducts, setSavedProducts]   = useState<any[]>([]);
  const [savedShops,    setSavedShops]       = useState<any[]>([]);
  const [savedServices, setSavedServices]   = useState<any[]>([]);
  const [inquiries,     setInquiries]        = useState<any[]>([]);
  const [removingId,    setRemovingId]       = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = "/auth/login?redirect=/buyer/saved"; return; }
      setUser(session.user);

      const [{ data: prof }, { data: prods }, { data: shps }, { data: svcs }, { data: inqs }] = await Promise.all([
        supabase.from("users").select("full_name, role, county, created_at").eq("id", session.user.id).single(),
        supabase.from("saved_products").select("product_id, created_at, products(id, name, price, original_price, image_url, condition, category, shops(id, shop_name, county, is_verified))").eq("user_id", session.user.id).order("created_at", { ascending: false }),
        supabase.from("saved_shops").select("shop_id, created_at, shops(id, shop_name, shop_number, county, category, phone, is_verified, description)").eq("user_id", session.user.id).order("created_at", { ascending: false }),
        supabase.from("saved_services").select("service_id, created_at, services(id, name, price, price_type, category, county, shops(id, shop_name, county, phone, is_verified))").eq("user_id", session.user.id).order("created_at", { ascending: false }),
        supabase.from("inquiries").select("*, shops(id, shop_name, shop_number, county, is_verified, phone)").eq("buyer_id", session.user.id).order("created_at", { ascending: false }),
      ]);

      if (prof?.role === "seller") { window.location.href = "/seller/dashboard"; return; }
      setProfile(prof);
      setSavedProducts(prods || []);
      setSavedShops(shps || []);
      setSavedServices(svcs || []);
      setInquiries(inqs || []);
      setLoading(false);
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const removeProduct = async (id: string) => {
    setRemovingId(id);
    await supabase.from("saved_products").delete().eq("user_id", user.id).eq("product_id", id);
    setSavedProducts(p => p.filter(x => x.product_id !== id));
    showToast("Removed from saved"); setRemovingId(null);
  };
  const removeShop = async (id: string) => {
    setRemovingId(id);
    await supabase.from("saved_shops").delete().eq("user_id", user.id).eq("shop_id", id);
    setSavedShops(p => p.filter(x => x.shop_id !== id));
    showToast("Shop removed"); setRemovingId(null);
  };
  const removeService = async (id: string) => {
    setRemovingId(id);
    await supabase.from("saved_services").delete().eq("user_id", user.id).eq("service_id", id);
    setSavedServices(p => p.filter(x => x.service_id !== id));
    showToast("Service removed"); setRemovingId(null);
  };

  const totalSaved   = savedProducts.length + savedShops.length + savedServices.length;
  const firstName    = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Buyer";
  const fmtDate      = (d: string) => new Date(d).toLocaleDateString("en-KE", { day:"numeric", month:"short", year:"numeric" });
  const fmtTime      = (d: string) => new Date(d).toLocaleTimeString("en-KE", { hour:"2-digit", minute:"2-digit" });

  const statusColor: any = {
    pending:    { bg:"rgba(245,166,35,0.1)",  color:"#b8830a",  label:"Pending" },
    replied:    { bg:"rgba(37,211,102,0.1)",  color:"#168a4e",  label:"Replied" },
    closed:     { bg:"rgba(13,13,13,0.06)",   color:"rgba(13,13,13,0.4)", label:"Closed" },
    seen:       { bg:"rgba(59,130,246,0.1)",  color:"#2563eb",  label:"Seen" },
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0d1117", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"rgba(255,255,255,0.3)", fontFamily:"sans-serif" }}>Loading your dashboard...</div>
    </div>
  );

  const NAV = [
    { id:"overview",  icon:"🏠", label:"Overview" },
    { id:"products",  icon:"📦", label:"Products",  count: savedProducts.length },
    { id:"shops",     icon:"🏪", label:"Shops",     count: savedShops.length },
    { id:"services",  icon:"⚙️", label:"Services",  count: savedServices.length },
    { id:"inquiries", icon:"💬", label:"Inquiries", count: inquiries.length },
  ] as { id:Tab; icon:string; label:string; count?:number }[];

  return (
    <>
      <style>{css}</style>
      {toast && <div className="toast">{toast}</div>}

      <div className="bd-page">

        {/* ─── SIDEBAR ─── */}
        <aside className="bd-sidebar">
          <a href="/" className="bd-logo">Sho<span>place</span></a>

          <div className="bd-profile">
            <div className="bd-avatar">{firstName[0]?.toUpperCase()}</div>
            <div className="bd-name">{firstName}</div>
            <div className="bd-email">{user?.email}</div>
            <div className="bd-badge">Buyer</div>
          </div>

          <nav className="bd-nav">
            {NAV.map(item => (
              <div key={item.id} className={"bd-nav-item"+(tab===item.id?" active":"")} onClick={() => setTab(item.id)}>
                <span className="bd-nav-icon">{item.icon}</span>
                <span className="bd-nav-label">{item.label}</span>
                {item.count !== undefined && item.count > 0 && <span className="bd-nav-count">{item.count}</span>}
              </div>
            ))}
          </nav>

          <div className="bd-sidebar-footer">
            <a href="/products" className="bd-link">Browse Products →</a>
            <a href="/shops"    className="bd-link">Browse Shops →</a>
            <a href="/services" className="bd-link">Browse Services →</a>
            <button className="bd-signout" onClick={async () => { await supabase.auth.signOut(); window.location.href="/"; }}>Sign Out</button>
          </div>
        </aside>

        {/* ─── MAIN ─── */}
        <main className="bd-main">

          {/* ════ OVERVIEW ════ */}
          {tab === "overview" && (
            <div className="bd-section">
              <div className="bd-section-header">
                <h1>Welcome back, {firstName} 👋</h1>
                <p>Here is everything you have saved and sent on Shoplace</p>
              </div>

              <div className="bd-stats">
                {[
                  { ico:"📦", num:savedProducts.length, label:"Saved Products",  dest:"products" },
                  { ico:"🏪", num:savedShops.length,    label:"Saved Shops",     dest:"shops" },
                  { ico:"⚙️", num:savedServices.length, label:"Saved Services",  dest:"services" },
                  { ico:"💬", num:inquiries.length,     label:"Inquiries Sent",  dest:"inquiries", dark:true },
                ].map(s => (
                  <div key={s.label} className={"bd-stat"+(s.dark?" bd-stat-dark":"")} onClick={() => setTab(s.dest as Tab)}>
                    <div className="bd-stat-ico">{s.ico}</div>
                    <div className="bd-stat-num">{s.num}</div>
                    <div className="bd-stat-label">{s.label}</div>
                    <div className="bd-stat-action">View all →</div>
                  </div>
                ))}
              </div>

              {totalSaved === 0 && inquiries.length === 0 ? (
                <div className="bd-empty">
                  <div className="bd-empty-ico">🔖</div>
                  <div className="bd-empty-title">Nothing here yet</div>
                  <div className="bd-empty-sub">Browse products, shops and services — tap ♡ to save them here.</div>
                  <div className="bd-empty-acts">
                    <a href="/products" className="bd-cta">Browse Products</a>
                    <a href="/shops"    className="bd-cta-ghost">Browse Shops</a>
                  </div>
                </div>
              ) : (
                <>
                  {savedProducts.length > 0 && (
                    <div className="bd-recent">
                      <div className="bd-recent-hd">Recently Saved Products <span onClick={() => setTab("products")}>See all →</span></div>
                      <div className="mini-grid">
                        {savedProducts.slice(0,4).map(item => {
                          const p = item.products; if (!p) return null;
                          return (
                            <div className="mini-card" key={item.product_id} onClick={() => window.location.href=`/shops/${p.shops?.id}`}>
                              <div className="mini-img">{p.image_url ? <img src={p.image_url} alt={p.name}/> : "📦"}</div>
                              <div className="mini-body">
                                <div className="mini-shop">{p.shops?.shop_name}{p.shops?.is_verified===true&&<span className="vd">✓</span>}</div>
                                <div className="mini-name">{p.name}</div>
                                <div className="mini-price">KSh {p.price?.toLocaleString()}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {inquiries.length > 0 && (
                    <div className="bd-recent">
                      <div className="bd-recent-hd">Recent Inquiries <span onClick={() => setTab("inquiries")}>See all →</span></div>
                      <div className="inq-mini-list">
                        {inquiries.slice(0,3).map(inq => {
                          const st = statusColor[inq.status || "pending"];
                          return (
                            <div className="inq-mini-row" key={inq.id}>
                              <div className={"inq-av"+(inq.shops?.is_verified===true?" inq-av-v":"")}>{inq.shops?.shop_name?.[0]?.toUpperCase()}</div>
                              <div className="inq-mini-info">
                                <div className="inq-mini-shop">{inq.shops?.shop_name}{inq.shops?.is_verified===true&&<span className="vp">✓ Verified</span>}</div>
                                <div className="inq-mini-msg">{inq.message?.slice(0,60)}{inq.message?.length>60?"...":""}</div>
                              </div>
                              <div className="inq-mini-right">
                                <div className="inq-status-dot" style={{ background:st?.bg, color:st?.color }}>{st?.label}</div>
                                <div className="inq-mini-date">{fmtDate(inq.created_at)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {savedShops.length > 0 && (
                    <div className="bd-recent">
                      <div className="bd-recent-hd">Saved Shops <span onClick={() => setTab("shops")}>See all →</span></div>
                      <div className="shops-mini-list">
                        {savedShops.slice(0,3).map(item => {
                          const s = item.shops; if (!s) return null;
                          return (
                            <div className={"shop-mini-row"+(s.is_verified===true?" sv":"")} key={item.shop_id} onClick={() => window.location.href=`/shops/${s.id}`}>
                              <div className={"sav"+(s.is_verified===true?" sav-v":"")}>{s.shop_name?.[0]?.toUpperCase()}</div>
                              <div className="smi">
                                <div className="smn">{s.shop_name}{s.is_verified===true&&<span className="vp">✓ Verified</span>}</div>
                                <div className="smm">#{String(s.shop_number||"").padStart(5,"0")} · {s.county}</div>
                              </div>
                              <span className="sarr">→</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ════ SAVED PRODUCTS ════ */}
          {tab === "products" && (
            <div className="bd-section">
              <div className="bd-section-header">
                <h1>Saved Products</h1>
                <p>{savedProducts.length} product{savedProducts.length!==1?"s":""} saved</p>
              </div>
              {savedProducts.length === 0 ? (
                <div className="bd-empty">
                  <div className="bd-empty-ico">📦</div>
                  <div className="bd-empty-title">No saved products yet</div>
                  <div className="bd-empty-sub">Tap ♡ on any product to save it here.</div>
                  <a href="/products" className="bd-cta">Browse Products</a>
                </div>
              ) : (
                <div className="full-products-grid">
                  {savedProducts.map(item => {
                    const p = item.products; if (!p) return null;
                    return (
                      <div className="fp-card" key={item.product_id}>
                        <div className="fp-img" onClick={() => window.location.href=`/shops/${p.shops?.id}`}>
                          {p.image_url ? <img src={p.image_url} alt={p.name}/> : <span>📦</span>}
                          {p.original_price > p.price && <div className="disc-tag">-{Math.round((1-p.price/p.original_price)*100)}%</div>}
                        </div>
                        <div className="fp-body">
                          <div className="fp-shop">{p.shops?.shop_name}{p.shops?.is_verified===true&&<span className="vd">✓</span>}</div>
                          <div className="fp-name">{p.name}</div>
                          <div className="fp-meta">{p.category} · {p.condition==="new"?"✨ New":"♻️ Used"} · 📍 {p.shops?.county}</div>
                          <div className="fp-price-row">
                            <span className="fp-price">KSh {p.price?.toLocaleString()}</span>
                            {p.original_price > p.price && <span className="fp-orig">KSh {p.original_price?.toLocaleString()}</span>}
                          </div>
                          <div className="fp-actions">
                            <button className="btn-dark" onClick={() => window.location.href=`/shops/${p.shops?.id}`}>View Shop →</button>
                            <button className="btn-remove" onClick={() => removeProduct(item.product_id)} disabled={removingId===item.product_id}>
                              {removingId===item.product_id ? "..." : "✕ Remove"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════ SAVED SHOPS ════ */}
          {tab === "shops" && (
            <div className="bd-section">
              <div className="bd-section-header">
                <h1>Saved Shops</h1>
                <p>{savedShops.length} shop{savedShops.length!==1?"s":""} saved</p>
              </div>
              {savedShops.length === 0 ? (
                <div className="bd-empty">
                  <div className="bd-empty-ico">🏪</div>
                  <div className="bd-empty-title">No saved shops yet</div>
                  <div className="bd-empty-sub">Tap ♡ on any shop to save it here.</div>
                  <a href="/shops" className="bd-cta">Browse Shops</a>
                </div>
              ) : (
                <div className="full-shops">
                  {savedShops.map(item => {
                    const s = item.shops; if (!s) return null;
                    return (
                      <div className={"fs-card"+(s.is_verified===true?" fs-card-v":"")} key={item.shop_id}>
                        {s.is_verified===true && <div className="v-ribbon">✓ Verified Seller</div>}
                        <div className="fs-top">
                          <div className={"fs-av"+(s.is_verified===true?" fs-av-v":"")} onClick={() => window.location.href=`/shops/${s.id}`}>{s.shop_name?.[0]?.toUpperCase()}</div>
                          <div className="fs-info" onClick={() => window.location.href=`/shops/${s.id}`}>
                            <div className="fs-name">{s.shop_name}</div>
                            <div className="fs-meta">#{String(s.shop_number||"").padStart(5,"0")} · {s.county} · {s.category}</div>
                            {s.description && <div className="fs-desc">{s.description.slice(0,90)}{s.description.length>90?"...":""}</div>}
                          </div>
                        </div>
                        <div className="fs-actions">
                          {s.phone && <a href={`tel:${s.phone}`} className="btn-call">📞 Call</a>}
                          {s.phone && <a href={`https://wa.me/254${String(s.phone).replace(/^0/,"")}?text=Hi, I found your shop on Shoplace`} target="_blank" className="btn-wa">💬 WhatsApp</a>}
                          <button className="btn-dark" onClick={() => window.location.href=`/shops/${s.id}`}>View Shop →</button>
                          <button className="btn-remove" onClick={() => removeShop(item.shop_id)} disabled={removingId===item.shop_id}>{removingId===item.shop_id?"...":"✕ Remove"}</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════ SAVED SERVICES ════ */}
          {tab === "services" && (
            <div className="bd-section">
              <div className="bd-section-header">
                <h1>Saved Services</h1>
                <p>{savedServices.length} service{savedServices.length!==1?"s":""} saved</p>
              </div>
              {savedServices.length === 0 ? (
                <div className="bd-empty">
                  <div className="bd-empty-ico">⚙️</div>
                  <div className="bd-empty-title">No saved services yet</div>
                  <div className="bd-empty-sub">Tap ♡ on any service to save it here.</div>
                  <a href="/services" className="bd-cta">Browse Services</a>
                </div>
              ) : (
                <div className="full-services-grid">
                  {savedServices.map(item => {
                    const s = item.services; if (!s) return null;
                    return (
                      <div className="fsvc-card" key={item.service_id}>
                        <div className="fsvc-top">
                          <span className="fsvc-ico">⚙️</span>
                          <span className="fsvc-cat">{s.category}</span>
                          {s.shops?.is_verified===true && <span className="vp">✓ Verified</span>}
                        </div>
                        <div className="fsvc-shop">{s.shops?.shop_name}</div>
                        <div className="fsvc-name">{s.name}</div>
                        <div className="fsvc-price">
                          {s.price_type==="free"?"Free":s.price_type==="negotiable"?"Negotiable":s.price?`KSh ${s.price.toLocaleString()}${s.price_type==="hourly"?"/hr":""}` :"Price on request"}
                        </div>
                        <div className="fsvc-loc">📍 {s.county||s.shops?.county}</div>
                        <div className="fsvc-actions">
                          {s.shops?.phone && <a href={`tel:${s.shops.phone}`} className="btn-call">📞 Call</a>}
                          {s.shops?.phone && <a href={`https://wa.me/254${String(s.shops.phone).replace(/^0/,"")}?text=Hi, I saw your ${s.name} on Shoplace`} target="_blank" className="btn-wa">💬 WhatsApp</a>}
                          <button className="btn-remove" onClick={() => removeService(item.service_id)} disabled={removingId===item.service_id}>{removingId===item.service_id?"...":"✕ Remove"}</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════ INQUIRIES ════ */}
          {tab === "inquiries" && (
            <div className="bd-section">
              <div className="bd-section-header">
                <h1>Inquiry History</h1>
                <p>{inquiries.length} message{inquiries.length!==1?"s":""} sent to sellers</p>
              </div>

              {inquiries.length === 0 ? (
                <div className="bd-empty">
                  <div className="bd-empty-ico">💬</div>
                  <div className="bd-empty-title">No inquiries yet</div>
                  <div className="bd-empty-sub">When you contact a seller through Shoplace, your messages will appear here so you can track responses.</div>
                  <a href="/shops" className="bd-cta">Browse Shops</a>
                </div>
              ) : (
                <div className="inq-list">
                  {inquiries.map(inq => {
                    const st = statusColor[inq.status || "pending"];
                    return (
                      <div className="inq-card" key={inq.id}>
                        <div className="inq-card-top">
                          <div className="inq-card-left">
                            <div className={"inq-av-lg"+(inq.shops?.is_verified===true?" inq-av-lg-v":"")} onClick={() => window.location.href=`/shops/${inq.shops?.id}`}>
                              {inq.shops?.shop_name?.[0]?.toUpperCase()}
                            </div>
                            <div className="inq-card-info">
                              <div className="inq-card-shop" onClick={() => window.location.href=`/shops/${inq.shops?.id}`}>
                                {inq.shops?.shop_name}
                                {inq.shops?.is_verified===true && <span className="vp">✓ Verified</span>}
                              </div>
                              <div className="inq-card-meta">
                                #{String(inq.shops?.shop_number||"").padStart(5,"0")} · {inq.shops?.county}
                              </div>
                              <div className="inq-card-time">{fmtDate(inq.created_at)} at {fmtTime(inq.created_at)}</div>
                            </div>
                          </div>
                          <div className="inq-card-right">
                            <div className="inq-status-pill" style={{ background:st?.bg, color:st?.color }}>{st?.label}</div>
                          </div>
                        </div>

                        {/* Message sent */}
                        <div className="inq-bubble-wrap">
                          <div className="inq-bubble-label">Your message</div>
                          <div className="inq-bubble inq-bubble-out">{inq.message}</div>
                        </div>

                        {/* Seller reply */}
                        {inq.reply ? (
                          <div className="inq-bubble-wrap">
                            <div className="inq-bubble-label">Seller replied · {inq.replied_at ? fmtDate(inq.replied_at) : ""}</div>
                            <div className="inq-bubble inq-bubble-in">{inq.reply}</div>
                          </div>
                        ) : (
                          <div className="inq-no-reply">
                            <span>⏳</span> Waiting for seller to reply
                          </div>
                        )}

                        {/* Actions */}
                        <div className="inq-card-actions">
                          {inq.shops?.phone && (
                            <a href={`https://wa.me/254${String(inq.shops.phone).replace(/^0/,"")}?text=Hi, following up on my inquiry on Shoplace`} target="_blank" className="btn-wa">💬 Follow up on WhatsApp</a>
                          )}
                          {inq.shops?.phone && (
                            <a href={`tel:${inq.shops.phone}`} className="btn-call">📞 Call Seller</a>
                          )}
                          <button className="btn-dark" onClick={() => window.location.href=`/shops/${inq.shops?.id}`}>View Shop →</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </main>
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

/* ── LAYOUT ── */
.bd-page{display:grid;grid-template-columns:255px 1fr;min-height:100vh;}

/* ── SIDEBAR ── */
.bd-sidebar{background:linear-gradient(160deg,#1a3326 0%,#0f2318 100%);padding:1.8rem 1.4rem;display:flex;flex-direction:column;gap:1.4rem;position:sticky;top:0;height:100vh;overflow-y:auto;}
.bd-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.45rem;letter-spacing:-0.04em;color:white;flex-shrink:0;}
.bd-logo span{color:#ff8c42;}
.bd-profile{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:1.1rem;text-align:center;}
.bd-avatar{width:50px;height:50px;background:linear-gradient(135deg,#c84b31,#ff6b35);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;color:white;margin:0 auto 0.55rem;}
.bd-name{font-family:'Syne',sans-serif;font-size:0.93rem;font-weight:700;color:white;margin-bottom:0.15rem;}
.bd-email{font-size:0.68rem;color:rgba(255,255,255,0.32);margin-bottom:0.55rem;word-break:break-all;}
.bd-badge{display:inline-flex;padding:0.16rem 0.65rem;background:rgba(255,255,255,0.09);border-radius:100px;font-size:0.62rem;font-weight:600;color:rgba(255,255,255,0.45);letter-spacing:0.06em;text-transform:uppercase;}
.bd-nav{display:flex;flex-direction:column;gap:0.18rem;}
.bd-nav-item{display:flex;align-items:center;gap:0.65rem;padding:0.68rem 0.85rem;border-radius:10px;cursor:pointer;transition:all .18s;color:rgba(255,255,255,0.48);}
.bd-nav-item:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.78);}
.bd-nav-item.active{background:rgba(255,255,255,0.11);color:white;border-left:3px solid #4ade80;padding-left:calc(0.85rem - 3px);}
.bd-nav-icon{font-size:0.88rem;width:20px;text-align:center;flex-shrink:0;}
.bd-nav-label{flex:1;font-size:0.84rem;font-weight:500;}
.bd-nav-count{background:#c84b31;color:white;font-size:0.62rem;font-weight:700;padding:0.1rem 0.42rem;border-radius:100px;min-width:18px;text-align:center;}
.bd-sidebar-footer{display:flex;flex-direction:column;gap:0.35rem;padding-top:0.6rem;border-top:1px solid rgba(255,255,255,0.06);margin-top:auto;}
.bd-link{font-size:0.76rem;color:rgba(255,255,255,0.28);transition:color .2s;padding:0.15rem 0;}
.bd-link:hover{color:rgba(255,255,255,0.65);}
.bd-signout{margin-top:0.5rem;padding:0.55rem;border:1px solid rgba(255,255,255,0.09);border-radius:10px;background:transparent;color:rgba(255,255,255,0.32);font-family:'DM Sans',sans-serif;font-size:0.78rem;cursor:pointer;transition:all .2s;}
.bd-signout:hover{background:rgba(255,80,80,0.1);border-color:rgba(255,80,80,0.22);color:rgba(255,120,120,0.8);}

/* ── MAIN ── */
.bd-main{background:var(--cream);overflow-y:auto;}
.bd-section{padding:2.4rem 2.8rem;max-width:1080px;}
.bd-section-header{margin-bottom:1.8rem;}
.bd-section-header h1{font-family:'Syne',sans-serif;font-size:1.75rem;font-weight:800;letter-spacing:-0.03em;}
.bd-section-header p{font-size:0.84rem;color:rgba(13,13,13,0.42);margin-top:0.3rem;}

/* ── STATS ── */
.bd-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2.5rem;}
.bd-stat{background:white;border:1px solid var(--border);border-radius:16px;padding:1.3rem;cursor:pointer;transition:all .2s;}
.bd-stat:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.08);}
.bd-stat-dark{background:linear-gradient(135deg,#1a3326,#0f2318);border-color:rgba(255,255,255,0.07);}
.bd-stat-dark .bd-stat-num{color:white;}
.bd-stat-dark .bd-stat-label,.bd-stat-dark .bd-stat-action{color:rgba(255,255,255,0.3);}
.bd-stat-ico{font-size:1.3rem;margin-bottom:0.55rem;}
.bd-stat-num{font-family:'Syne',sans-serif;font-size:1.9rem;font-weight:800;letter-spacing:-0.03em;color:var(--rust);margin-bottom:0.25rem;}
.bd-stat-label{font-size:0.77rem;font-weight:500;color:rgba(13,13,13,0.48);margin-bottom:0.45rem;}
.bd-stat-action{font-size:0.7rem;color:rgba(13,13,13,0.22);}

/* ── RECENT SECTIONS ── */
.bd-recent{margin-bottom:2rem;}
.bd-recent-hd{font-family:'Syne',sans-serif;font-size:0.88rem;font-weight:700;display:flex;align-items:center;justify-content:space-between;margin-bottom:0.9rem;padding-bottom:0.55rem;border-bottom:1px solid var(--border);}
.bd-recent-hd span{font-size:0.76rem;font-weight:500;color:var(--rust);cursor:pointer;}
.bd-recent-hd span:hover{text-decoration:underline;}

/* ── MINI PRODUCT GRID ── */
.mini-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.9rem;}
.mini-card{background:white;border-radius:13px;overflow:hidden;border:1px solid var(--border);cursor:pointer;transition:all .2s;}
.mini-card:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,0.07);}
.mini-img{height:120px;background:#e8ede9;display:flex;align-items:center;justify-content:center;font-size:1.8rem;overflow:hidden;}
.mini-img img{width:100%;height:100%;object-fit:cover;}
.mini-body{padding:0.65rem;}
.mini-shop{font-size:0.66rem;color:var(--sage);font-weight:500;margin-bottom:0.18rem;display:flex;align-items:center;gap:0.25rem;}
.mini-name{font-family:'Syne',sans-serif;font-size:0.78rem;font-weight:700;margin-bottom:0.2rem;line-height:1.3;}
.mini-price{font-size:0.82rem;font-weight:700;color:var(--rust);}

/* ── INQUIRY MINI LIST ── */
.inq-mini-list{display:flex;flex-direction:column;gap:0.55rem;}
.inq-mini-row{display:flex;align-items:center;gap:0.85rem;background:white;border-radius:12px;padding:0.85rem 1rem;border:1px solid var(--border);}
.inq-av{width:34px;height:34px;background:var(--rust);border-radius:9px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:0.88rem;font-weight:800;color:white;flex-shrink:0;}
.inq-av-v{background:linear-gradient(135deg,#FF8040,#FF2880);}
.inq-mini-info{flex:1;min-width:0;}
.inq-mini-shop{font-size:0.8rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.inq-mini-msg{font-size:0.72rem;color:rgba(13,13,13,0.42);margin-top:0.1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.inq-mini-right{text-align:right;flex-shrink:0;}
.inq-status-dot{font-size:0.64rem;font-weight:600;padding:0.15rem 0.5rem;border-radius:100px;display:inline-block;margin-bottom:0.2rem;}
.inq-mini-date{font-size:0.65rem;color:rgba(13,13,13,0.3);}

/* ── SHOP MINI LIST ── */
.shops-mini-list{display:flex;flex-direction:column;gap:0.55rem;}
.shop-mini-row{display:flex;align-items:center;gap:0.8rem;background:white;border-radius:12px;padding:0.85rem 1rem;border:1px solid var(--border);cursor:pointer;transition:all .2s;}
.shop-mini-row:hover{border-color:rgba(200,75,49,0.2);}
.shop-mini-row.sv{background:linear-gradient(135deg,#0d1f14,#0f2318);border-color:rgba(255,120,60,0.18);}
.sav{width:34px;height:34px;background:var(--rust);border-radius:9px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:0.88rem;font-weight:800;color:white;flex-shrink:0;}
.sav-v{background:linear-gradient(135deg,#FF8040,#FF2880);}
.smi{flex:1;}
.smn{font-size:0.84rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;}
.sv .smn{color:white;}
.smm{font-size:0.7rem;color:rgba(13,13,13,0.38);margin-top:0.1rem;}
.sv .smm{color:rgba(255,255,255,0.28);}
.sarr{color:rgba(13,13,13,0.2);font-size:0.9rem;}
.sv .sarr{color:rgba(255,255,255,0.2);}

/* ── FULL PRODUCTS GRID ── */
.full-products-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem;}
.fp-card{background:white;border-radius:16px;overflow:hidden;border:1px solid var(--border);}
.fp-img{height:175px;background:#e8ede9;display:flex;align-items:center;justify-content:center;font-size:2.5rem;overflow:hidden;position:relative;cursor:pointer;}
.fp-img img{width:100%;height:100%;object-fit:cover;}
.disc-tag{position:absolute;top:0.5rem;left:0.5rem;background:var(--rust);color:white;font-size:0.62rem;font-weight:700;padding:0.15rem 0.42rem;border-radius:5px;}
.fp-body{padding:1rem;}
.fp-shop{font-size:0.7rem;color:var(--sage);font-weight:500;margin-bottom:0.2rem;display:flex;align-items:center;gap:0.25rem;}
.fp-name{font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:700;margin-bottom:0.3rem;line-height:1.3;}
.fp-meta{font-size:0.7rem;color:rgba(13,13,13,0.38);margin-bottom:0.45rem;}
.fp-price-row{display:flex;align-items:center;gap:0.4rem;margin-bottom:0.8rem;}
.fp-price{font-size:0.95rem;font-weight:700;color:var(--rust);}
.fp-orig{font-size:0.7rem;color:rgba(13,13,13,0.28);text-decoration:line-through;}
.fp-actions{display:flex;gap:0.5rem;flex-wrap:wrap;}

/* ── FULL SHOPS ── */
.full-shops{display:flex;flex-direction:column;gap:1rem;}
.fs-card{background:white;border-radius:16px;padding:1.35rem;border:1px solid var(--border);}
.fs-card-v{background:linear-gradient(150deg,#1a0a00,#1f0d08,#1a0812);border-color:rgba(255,120,60,0.22);}
.v-ribbon{display:inline-flex;padding:0.2rem 0.65rem;background:linear-gradient(135deg,#ff8c42,#ff4e8c);border-radius:100px;font-size:0.6rem;font-weight:700;color:white;margin-bottom:0.75rem;}
.fs-top{display:flex;gap:1rem;margin-bottom:1rem;}
.fs-av{width:48px;height:48px;background:var(--rust);border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:1.25rem;font-weight:800;color:white;flex-shrink:0;cursor:pointer;}
.fs-av-v{background:linear-gradient(135deg,#FF8040,#FF2880);}
.fs-info{flex:1;cursor:pointer;}
.fs-name{font-family:'Syne',sans-serif;font-size:0.98rem;font-weight:700;margin-bottom:0.18rem;}
.fs-card-v .fs-name{color:white;}
.fs-meta{font-size:0.72rem;color:rgba(13,13,13,0.38);margin-bottom:0.25rem;}
.fs-card-v .fs-meta{color:rgba(255,255,255,0.28);}
.fs-desc{font-size:0.76rem;color:rgba(13,13,13,0.42);line-height:1.5;}
.fs-card-v .fs-desc{color:rgba(255,255,255,0.28);}
.fs-actions{display:flex;gap:0.6rem;flex-wrap:wrap;}

/* ── FULL SERVICES GRID ── */
.full-services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem;}
.fsvc-card{background:white;border-radius:16px;padding:1.25rem;border:1px solid var(--border);display:flex;flex-direction:column;gap:0.48rem;}
.fsvc-top{display:flex;align-items:center;gap:0.45rem;}
.fsvc-ico{font-size:1.4rem;}
.fsvc-cat{font-size:0.66rem;background:rgba(13,13,13,0.05);padding:0.16rem 0.5rem;border-radius:100px;color:rgba(13,13,13,0.4);}
.fsvc-shop{font-size:0.7rem;color:var(--sage);font-weight:500;}
.fsvc-name{font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:700;line-height:1.3;}
.fsvc-price{font-size:0.9rem;font-weight:700;color:var(--rust);}
.fsvc-loc{font-size:0.7rem;color:rgba(13,13,13,0.36);}
.fsvc-actions{display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.3rem;}

/* ── INQUIRIES ── */
.inq-list{display:flex;flex-direction:column;gap:1.2rem;}
.inq-card{background:white;border-radius:18px;padding:1.5rem;border:1px solid var(--border);}
.inq-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1.2rem;}
.inq-card-left{display:flex;gap:0.9rem;align-items:flex-start;}
.inq-av-lg{width:44px;height:44px;background:var(--rust);border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:800;color:white;flex-shrink:0;cursor:pointer;transition:opacity .2s;}
.inq-av-lg:hover{opacity:0.8;}
.inq-av-lg-v{background:linear-gradient(135deg,#FF8040,#FF2880);}
.inq-card-info{}
.inq-card-shop{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;display:flex;align-items:center;gap:0.45rem;cursor:pointer;margin-bottom:0.15rem;}
.inq-card-shop:hover{text-decoration:underline;}
.inq-card-meta{font-size:0.72rem;color:rgba(13,13,13,0.38);margin-bottom:0.1rem;}
.inq-card-time{font-size:0.68rem;color:rgba(13,13,13,0.28);}
.inq-card-right{flex-shrink:0;}
.inq-status-pill{font-size:0.7rem;font-weight:600;padding:0.25rem 0.75rem;border-radius:100px;}
.inq-bubble-wrap{margin-bottom:0.8rem;}
.inq-bubble-label{font-size:0.68rem;color:rgba(13,13,13,0.35);margin-bottom:0.3rem;font-weight:500;}
.inq-bubble{padding:0.85rem 1rem;border-radius:12px;font-size:0.84rem;line-height:1.6;}
.inq-bubble-out{background:#f0f4f1;border-radius:12px 12px 4px 12px;color:var(--ink);}
.inq-bubble-in{background:linear-gradient(135deg,rgba(26,51,38,0.06),rgba(15,35,24,0.06));border:1px solid rgba(26,51,38,0.1);border-radius:12px 12px 12px 4px;color:var(--ink);}
.inq-no-reply{font-size:0.78rem;color:rgba(13,13,13,0.35);padding:0.65rem 0.9rem;background:rgba(245,166,35,0.05);border:1px dashed rgba(245,166,35,0.25);border-radius:10px;margin-bottom:0.8rem;}
.inq-card-actions{display:flex;gap:0.6rem;flex-wrap:wrap;padding-top:0.8rem;border-top:1px solid var(--border);}

/* ── SHARED BUTTONS ── */
.btn-dark{padding:0.45rem 1rem;background:var(--ink);color:white;border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:0.78rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;}
.btn-dark:hover{background:#2a2a2a;}
.btn-remove{padding:0.45rem 0.9rem;background:transparent;border:1.5px solid rgba(200,75,49,0.2);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:0.78rem;font-weight:500;color:rgba(200,75,49,0.6);cursor:pointer;transition:all .2s;white-space:nowrap;}
.btn-remove:hover{background:rgba(200,75,49,0.06);border-color:var(--rust);color:var(--rust);}
.btn-remove:disabled{opacity:0.4;cursor:not-allowed;}
.btn-call{padding:0.45rem 0.9rem;background:white;border:1.5px solid var(--border);border-radius:8px;font-size:0.78rem;font-weight:500;color:rgba(13,13,13,0.6);transition:all .2s;display:inline-flex;align-items:center;gap:0.3rem;white-space:nowrap;}
.btn-call:hover{border-color:var(--ink);color:var(--ink);}
.btn-wa{padding:0.45rem 0.9rem;background:rgba(37,211,102,0.06);border:1.5px solid rgba(37,211,102,0.22);border-radius:8px;font-size:0.78rem;font-weight:500;color:#168a4e;transition:all .2s;display:inline-flex;align-items:center;gap:0.3rem;white-space:nowrap;}
.btn-wa:hover{background:rgba(37,211,102,0.12);}

/* ── EMPTY STATE ── */
.bd-empty{background:white;border-radius:18px;padding:4rem 2rem;text-align:center;border:1px solid var(--border);}
.bd-empty-ico{font-size:2.5rem;margin-bottom:1rem;}
.bd-empty-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;}
.bd-empty-sub{font-size:0.84rem;color:rgba(13,13,13,0.42);line-height:1.6;max-width:380px;margin:0 auto;}
.bd-empty-acts{display:flex;gap:0.75rem;justify-content:center;margin-top:1.5rem;}
.bd-cta{display:inline-flex;padding:0.6rem 1.4rem;background:var(--rust);color:white;border-radius:100px;font-size:0.84rem;font-weight:600;transition:all .2s;}
.bd-cta:hover{background:#a83a22;transform:translateY(-1px);}
.bd-cta-ghost{display:inline-flex;padding:0.6rem 1.4rem;border:1.5px solid var(--border);color:rgba(13,13,13,0.6);border-radius:100px;font-size:0.84rem;font-weight:500;transition:all .2s;}
.bd-cta-ghost:hover{border-color:var(--ink);color:var(--ink);}

/* ── BADGES ── */
.vd{display:inline-flex;width:14px;height:14px;background:linear-gradient(135deg,#FF8040,#FF2880);border-radius:50%;align-items:center;justify-content:center;font-size:0.5rem;color:white;font-weight:700;flex-shrink:0;}
.vp{display:inline-flex;padding:0.13rem 0.48rem;background:linear-gradient(135deg,#FF8040,#FF2880);border-radius:100px;font-size:0.6rem;font-weight:700;color:white;flex-shrink:0;}

/* ── TOAST ── */
.toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#0d0d0d;color:white;padding:0.65rem 1.5rem;border-radius:100px;font-size:0.85rem;font-weight:500;z-index:999;animation:fadeup 0.3s ease;pointer-events:none;}
@keyframes fadeup{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}

/* ── MOBILE ── */
@media(max-width:960px){
  .bd-page{grid-template-columns:1fr;}
  .bd-sidebar{position:fixed;bottom:0;top:auto;left:0;right:0;height:auto;flex-direction:row;padding:0;z-index:100;border-top:1px solid rgba(255,255,255,0.07);overflow-x:auto;gap:0;align-items:stretch;}
  .bd-logo,.bd-profile,.bd-sidebar-footer{display:none;}
  .bd-nav{flex-direction:row;width:100%;}
  .bd-nav-item{flex-direction:column;gap:0.12rem;padding:0.45rem 0.5rem;border-left:none!important;padding-left:0.5rem!important;flex:1;justify-content:center;align-items:center;}
  .bd-nav-item.active{background:rgba(255,255,255,0.09);border-bottom:2px solid #4ade80;}
  .bd-nav-icon{font-size:1.05rem;width:auto;}
  .bd-nav-label{font-size:0.58rem;text-align:center;}
  .bd-nav-count{font-size:0.52rem;padding:0.08rem 0.3rem;}
  .bd-main{padding-bottom:72px;}
  .bd-section{padding:1.4rem 1rem;}
  .bd-stats{grid-template-columns:repeat(2,1fr);gap:0.75rem;}
  .mini-grid{grid-template-columns:repeat(2,1fr);}
  .full-products-grid{grid-template-columns:repeat(2,1fr);}
  .full-services-grid{grid-template-columns:repeat(2,1fr);}
}
@media(max-width:520px){
  .full-products-grid{grid-template-columns:repeat(2,1fr);gap:0.7rem;}
  .full-services-grid{grid-template-columns:1fr;}
  .bd-section-header h1{font-size:1.35rem;}
  .inq-card{padding:1rem;}
  .inq-card-top{flex-direction:column;gap:0.6rem;}
  .bd-stats{grid-template-columns:repeat(2,1fr);}
}
`;