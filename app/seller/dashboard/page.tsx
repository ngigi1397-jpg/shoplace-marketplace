"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Tab = "overview" | "products" | "services" | "reviews" | "shops" | "verification";

const FREE_MAX_SHOPS    = 1;
const FREE_MAX_PRODUCTS = 5;
const FREE_MAX_SERVICES = 1;

// ── Verified badge ────────────────────────────
function VerifiedBadge({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: { padding:"0.15rem 0.5rem", fontSize:"0.62rem" }, md: { padding:"0.2rem 0.6rem", fontSize:"0.7rem" }, lg: { padding:"0.3rem 0.9rem", fontSize:"0.8rem" } };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem", background:"linear-gradient(135deg,rgba(255,128,64,0.15),rgba(255,40,128,0.15))", border:"1px solid rgba(255,128,64,0.4)", borderRadius:"100px", fontWeight:700, color:"#FF8040", ...sizes[size] }}>
      ✓ Verified
    </span>
  );
}

// ── Premium upsell banner ─────────────────────
function PremiumBanner({ reason }: { reason: string }) {
  return (
    <div className="premium-banner">
      <div className="premium-banner-left">
        <span className="premium-crown">👑</span>
        <div>
          <div className="premium-banner-title">Get Verified & Unlock Premium</div>
          <div className="premium-banner-sub">{reason}</div>
        </div>
      </div>
      <button className="premium-banner-btn" onClick={() => {}}>Request Verification →</button>
    </div>
  );
}

// ── Locked stat card ──────────────────────────
function LockedStat({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="sd-stat sd-stat-locked">
      <div className="sd-stat-ico" style={{ background:"rgba(13,13,13,0.04)", color:"rgba(13,13,13,0.2)" }}>{icon}</div>
      <div className="sd-stat-num sd-locked-num"><span className="sd-lock-icon">🔒</span></div>
      <div className="sd-stat-lbl">{label}</div>
      <span className="sd-lock-upgrade">Premium only</span>
    </div>
  );
}

export default function SellerDashboard() {
  const [user,          setUser]          = useState<any>(null);
  const [profile,       setProfile]       = useState<any>(null); // from users table
  const [shop,          setShop]          = useState<any>(null);
  const [allShops,      setAllShops]      = useState<any[]>([]);
  const [products,      setProducts]      = useState<any[]>([]);
  const [services,      setServices]      = useState<any[]>([]);
  const [reviews,       setReviews]       = useState<any[]>([]);
  const [profileViews,  setProfileViews]  = useState(0);
  const [rating,        setRating]        = useState<number | null>(null);
  const [reviewCount,   setReviewCount]   = useState(0);
  const [inquiryCount,  setInquiryCount]  = useState(0);
  const [tab,           setTab]           = useState<Tab>("overview");
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState("");
  const [toastType,     setToastType]     = useState<"info"|"success"|"error">("info");

  // Verification request form state
  const [verReq,        setVerReq]        = useState<any>(null); // existing request
  const [verForm,       setVerForm]       = useState({ full_name:"", id_number:"", business_name:"", business_type:"", phone:"", county:"", reason:"" });
  const [verSubmitting, setVerSubmitting] = useState(false);

  const showToast = (msg: string, type: "info"|"success"|"error" = "info") => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(""), 3000);
  };

  // Verification is on the USER, not the shop
  const isVerified = profile?.is_verified === true;
  const isPremium  = isVerified; // verified = premium

  const canAddProduct = isPremium || products.length < FREE_MAX_PRODUCTS;
  const canAddService = isPremium || services.length < FREE_MAX_SERVICES;
  const canAddShop    = isPremium || allShops.length < FREE_MAX_SHOPS;

  const loadShopData = async (shopData: any) => {
    const [
      { data: prods },
      { data: svcs },
      { count: views },
      { data: revData },
      { count: inqs },
    ] = await Promise.all([
      supabase.from("products").select("*").eq("shop_id", shopData.id).order("created_at", { ascending:false }),
      supabase.from("services").select("*").eq("shop_id", shopData.id).order("created_at", { ascending:false }),
      supabase.from("shop_views").select("*", { count:"exact", head:true }).eq("shop_id", shopData.id),
      supabase.from("shop_reviews").select("*, users(full_name,email)").eq("shop_id", shopData.id).order("created_at", { ascending:false }),
      supabase.from("inquiries").select("*", { count:"exact", head:true }).eq("shop_id", shopData.id),
    ]);
    setProducts(prods || []);
    setServices(svcs || []);
    setProfileViews(views || 0);
    setInquiryCount(inqs || 0);
    const revs = revData || [];
    setReviews(revs);
    setReviewCount(revs.length);
    if (revs.length > 0) {
      const avg = revs.reduce((s: number, r: any) => s + r.rating, 0) / revs.length;
      setRating(Math.round(avg * 10) / 10);
    } else { setRating(null); }
  };

  const loadVerificationRequest = async (userId: string) => {
    const { data } = await supabase.from("verification_requests").select("*").eq("user_id", userId).maybeSingle();
    setVerReq(data);
    if (data) setVerForm({ full_name: data.full_name||"", id_number: data.id_number||"", business_name: data.business_name||"", business_type: data.business_type||"", phone: data.phone||"", county: data.county||"", reason: data.reason||"" });
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = "/auth/login?redirect=/seller/dashboard"; return; }
      setUser(session.user);
      // Load full profile including is_verified from users table
      const { data: prof } = await supabase.from("users").select("*").eq("id", session.user.id).maybeSingle();
      if (prof?.role === "buyer") { window.location.href = "/buyer/saved"; return; }
      setProfile(prof);
      // Pre-fill verification form with existing user info
      setVerForm(f => ({ ...f, full_name: prof?.full_name || "", phone: prof?.phone || "", county: prof?.county || "" }));
      const { data: shopList } = await supabase.from("shops").select("*").eq("owner_id", session.user.id).order("created_at", { ascending:false });
      if (!shopList || shopList.length === 0) { window.location.href = "/seller/register"; return; }
      setAllShops(shopList);
      setShop(shopList[0]);
      await loadShopData(shopList[0]);
      await loadVerificationRequest(session.user.id);
      setLoading(false);
    });
  }, []);

  const switchShop = async (s: any) => {
    setShop(s); setTab("overview");
    await loadShopData(s);
    showToast(`Switched to ${s.shop_name}`);
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(p => p.filter(x => x.id !== id));
    showToast("Product deleted");
  };

  const deleteService = async (id: string) => {
    await supabase.from("services").delete().eq("id", id);
    setServices(s => s.filter(x => x.id !== id));
    showToast("Service deleted");
  };

  const handleAddProduct = () => {
    if (!canAddProduct) { showToast(`⚠️ Free plan: max ${FREE_MAX_PRODUCTS} products. Get verified to add unlimited.`, "error"); return; }
    window.location.href = "/seller/products/new";
  };

  const handleAddService = () => {
    if (!canAddService) { showToast(`⚠️ Free plan: max ${FREE_MAX_SERVICES} service. Get verified to add unlimited.`, "error"); return; }
    window.location.href = "/seller/services/new";
  };

  const handleAddShop = () => {
    if (!canAddShop) { showToast("⚠️ Free plan: 1 shop only. Get verified to open more.", "error"); return; }
    window.location.href = "/seller/register";
  };

  const submitVerificationRequest = async () => {
    if (!verForm.full_name || !verForm.id_number || !verForm.phone) {
      showToast("Please fill in name, ID number and phone.", "error"); return;
    }
    setVerSubmitting(true);
    try {
      const payload = { ...verForm, user_id: user.id, status: "pending", submitted_at: new Date().toISOString() };
      if (verReq) {
        const { error } = await supabase.from("verification_requests").update({ ...payload, status:"pending" }).eq("id", verReq.id);
        if (error) throw error;
        showToast("✓ Verification request updated!", "success");
      } else {
        const { error } = await supabase.from("verification_requests").insert(payload);
        if (error) throw error;
        showToast("✓ Verification request submitted! We'll review within 24–48 hours.", "success");
      }
      await loadVerificationRequest(user.id);
    } catch (err: any) {
      showToast("Error: " + err.message, "error");
    } finally { setVerSubmitting(false); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-KE", { day:"numeric", month:"short", year:"numeric" });

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#f5f0e8", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"sans-serif", color:"rgba(13,13,13,0.35)", fontSize:"0.9rem" }}>Loading your dashboard...</div>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      {toast && (
        <div className="sd-toast" style={{ background: toastType==="error"?"#dc2626":toastType==="success"?"#16a34a":"#0d0d0d" }}>
          {toast}
        </div>
      )}

      <div className="sd-page">

        {/* ═══ SIDEBAR ═══ */}
        <aside className="sd-sidebar">
          <a href="/" className="sd-logo">Sho<span>place</span></a>

          {/* Seller identity — shows verified badge if verified */}
          <div className="sd-seller-card">
            <div className={"sd-seller-av" + (isVerified ? " sd-seller-av-v" : "")}>
              {(profile?.full_name || user?.email || "S")[0].toUpperCase()}
            </div>
            <div className="sd-seller-info">
              <div className="sd-seller-name">{profile?.full_name || user?.email?.split("@")[0]}</div>
              <div className="sd-seller-tag">
                {isVerified ? <span style={{color:"#FF8040",fontWeight:700}}>✓ Verified Seller</span> : "Free Plan"}
              </div>
            </div>
          </div>

          {/* Verification status strip */}
          {isVerified ? (
            <div className="sd-verified-strip">
              <span>✓</span> Verified · All premium features unlocked
            </div>
          ) : verReq?.status === "pending" ? (
            <div className="sd-pending-strip">
              ⏳ Verification under review
            </div>
          ) : (
            <div className="sd-free-strip">
              Free Plan · <span onClick={() => setTab("verification")} style={{color:"#FF8040",cursor:"pointer",fontWeight:600}}>Get Verified →</span>
            </div>
          )}

          {/* Current shop */}
          <div className="sd-current-shop">
            <div className="sd-section-label">Active Shop</div>
            <div className="sd-active-shop-card">
              <div className={"sd-shop-av" + (isVerified ? " sd-shop-av-v" : "")}>
                {shop?.shop_name?.[0]?.toUpperCase()}
              </div>
              <div className="sd-active-info">
                <div className="sd-active-name">
                  {shop?.shop_name}
                  {isVerified && <span style={{marginLeft:"0.4rem",fontSize:"0.55rem",background:"linear-gradient(135deg,#FF8040,#FF2880)",color:"white",padding:"0.1rem 0.35rem",borderRadius:"100px",fontWeight:700}}>✓</span>}
                </div>
                <div className="sd-active-num">#{String(shop?.shop_number || "").padStart(5, "0")}</div>
              </div>
            </div>
            {shop?.approval_status === "pending" && <div className="sd-tag-pill pending">⏳ Shop Pending Approval</div>}
          </div>

          {/* Nav */}
          <nav className="sd-nav">
            <div className="sd-section-label">Dashboard</div>
            {([
              { id:"overview",      icon:"⬛", label:"Overview" },
              { id:"products",      icon:"📦", label:"Products",    count: products.length },
              { id:"services",      icon:"⚙️",  label:"Services",    count: services.length },
              { id:"reviews",       icon:"⭐",  label:"Reviews",     count: reviewCount },
              { id:"shops",         icon:"🏪",  label:"All My Shops", count: allShops.length },
              { id:"verification",  icon:"✅",  label:"Verification", badge: isVerified ? null : verReq?.status === "pending" ? "⏳" : "!" },
            ] as {id:Tab,icon:string,label:string,count?:number,badge?:string|null}[]).map(item => (
              <div key={item.id} className={"sd-nav-item" + (tab===item.id?" active":"")} onClick={() => setTab(item.id as Tab)}>
                <span className="sd-nav-icon">{item.icon}</span>
                <span className="sd-nav-label">{item.label}</span>
                {item.count !== undefined && item.count > 0 && <span className="sd-nav-badge">{item.count}</span>}
                {item.badge && <span className="sd-nav-badge" style={{background:"#FF8040"}}>{item.badge}</span>}
                {isVerified && item.id === "verification" && <span style={{marginLeft:"auto",fontSize:"0.6rem",color:"#FF8040",fontWeight:700}}>✓</span>}
              </div>
            ))}
          </nav>

          {/* Quick actions */}
          <div className="sd-quick">
            <div className="sd-section-label">Quick Actions</div>
            <button onClick={handleAddProduct} className={"sd-quick-btn" + (!canAddProduct?" sd-quick-btn-locked":"")}>
              {!canAddProduct ? "🔒" : "+"} Add Product {!canAddProduct ? `(${products.length}/${FREE_MAX_PRODUCTS})` : ""}
            </button>
            <button onClick={handleAddService} className={"sd-quick-btn" + (!canAddService?" sd-quick-btn-locked":"")}>
              {!canAddService ? "🔒" : "+"} Add Service {!canAddService ? `(${services.length}/${FREE_MAX_SERVICES})` : ""}
            </button>
            <button onClick={handleAddShop} className={"sd-quick-btn sd-quick-btn-ghost" + (!canAddShop?" sd-quick-btn-locked":"")}>
              {!canAddShop ? "🔒" : "+"} Open New Shop
            </button>
            {!isVerified && (
              <button onClick={() => setTab("verification")} className="sd-quick-btn sd-premium-btn">
                ✓ Get Verified (Free)
              </button>
            )}
          </div>

          <button className="sd-signout" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>
            Sign Out
          </button>
        </aside>

        {/* ═══ MAIN ═══ */}
        <main className="sd-main">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="sd-section">
              <div className="sd-header">
                <div>
                  <h1>
                    {shop?.shop_name}
                    {isVerified && <VerifiedBadge size="md" />}
                  </h1>
                  <p>Shop #{String(shop?.shop_number||"").padStart(5,"0")} · {shop?.county} · {shop?.category}</p>
                </div>
                <button className={"btn-rust" + (!canAddProduct?" btn-locked":"")} onClick={handleAddProduct}>
                  {canAddProduct ? "+ Add Product" : `🔒 Limit (${products.length}/${FREE_MAX_PRODUCTS})`}
                </button>
              </div>

              {!isVerified && (
                <div className="sd-verify-cta">
                  <div className="sd-verify-cta-left">
                    <div className="sd-verify-cta-title">✓ Get Your Seller Verification</div>
                    <div className="sd-verify-cta-sub">
                      Free · Unlimited products, services & shops · Verified badge on all your listings · Access to reviews & analytics
                    </div>
                  </div>
                  <button className="premium-banner-btn" onClick={() => setTab("verification")}>
                    {verReq?.status === "pending" ? "⏳ Under Review" : "Apply Now →"}
                  </button>
                </div>
              )}

              <div className="sd-stats">
                <div className="sd-stat">
                  <div className="sd-stat-ico" style={{background:"rgba(200,75,49,0.08)",color:"#c84b31"}}>📦</div>
                  <div className="sd-stat-num">{products.length}{!isPremium&&<span className="sd-stat-limit">/{FREE_MAX_PRODUCTS}</span>}</div>
                  <div className="sd-stat-lbl">Products</div>
                </div>
                {isPremium ? (
                  <div className="sd-stat">
                    <div className="sd-stat-ico" style={{background:"rgba(61,107,79,0.08)",color:"#3d6b4f"}}>👁️</div>
                    <div className="sd-stat-num">{profileViews}</div>
                    <div className="sd-stat-lbl">Profile Views</div>
                  </div>
                ) : <LockedStat icon="👁️" label="Profile Views" />}
                {isPremium ? (
                  <div className="sd-stat">
                    <div className="sd-stat-ico" style={{background:"rgba(245,166,35,0.08)",color:"#f59e0b"}}>⭐</div>
                    <div className="sd-stat-num">{rating !== null ? `${rating}★` : "—"}</div>
                    <div className="sd-stat-lbl">Rating {reviewCount > 0 ? `(${reviewCount})` : ""}</div>
                  </div>
                ) : <LockedStat icon="⭐" label="Rating" />}
                <div className="sd-stat">
                  <div className="sd-stat-ico" style={{background:"rgba(139,92,246,0.08)",color:"#7c3aed"}}>⚙️</div>
                  <div className="sd-stat-num">{services.length}{!isPremium&&<span className="sd-stat-limit">/{FREE_MAX_SERVICES}</span>}</div>
                  <div className="sd-stat-lbl">Services</div>
                </div>
                <div className="sd-stat">
                  <div className="sd-stat-ico" style={{background:"rgba(236,72,153,0.08)",color:"#db2777"}}>🏪</div>
                  <div className="sd-stat-num">{allShops.length}{!isPremium&&<span className="sd-stat-limit">/{FREE_MAX_SHOPS}</span>}</div>
                  <div className="sd-stat-lbl">Total Shops</div>
                </div>
                <div className="sd-stat">
                  <div className="sd-stat-ico" style={{background:"rgba(79,124,255,0.08)",color:"#4f7cff"}}>💬</div>
                  <div className="sd-stat-num">{inquiryCount}</div>
                  <div className="sd-stat-lbl">Inquiries</div>
                </div>
              </div>

              {/* Shop info */}
              <div className="sd-card">
                <div className="sd-card-title">
                  Shop Information
                  {isVerified && <VerifiedBadge size="sm" />}
                </div>
                <div className="sd-info-grid">
                  {[
                    ["Shop Name",    shop?.shop_name],
                    ["Shop Number",  `#${String(shop?.shop_number||"").padStart(5,"0")}`],
                    ["Category",     shop?.category||"—"],
                    ["County",       shop?.county||"—"],
                    ["Phone",        shop?.phone||"—"],
                    ["WhatsApp",     shop?.whatsapp||shop?.phone||"—"],
                    ["Status",       shop?.approval_status||"—"],
                    ["Seller Status",isVerified?"✓ Verified Seller":"Free Plan"],
                    ["Description",  shop?.description||"—"],
                  ].map(([label, val]) => (
                    <div className="sd-info-row" key={label}>
                      <span className="sd-info-label">{label}</span>
                      <span className="sd-info-val" style={label==="Seller Status"&&isVerified?{color:"#FF8040",fontWeight:700}:{}}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {products.length > 0 && (
                <div className="sd-card" style={{marginTop:"1.5rem"}}>
                  <div className="sd-card-title">Recent Products <span className="sd-card-link" onClick={() => setTab("products")}>View all →</span></div>
                  <div className="sd-products-list">
                    {products.slice(0,4).map(p => (
                      <div className="sd-product-row" key={p.id}>
                        <div className="sd-product-img">{p.image_url ? <img src={p.image_url} alt={p.name}/> : "📦"}</div>
                        <div className="sd-product-info">
                          <div className="sd-product-name">{p.name}</div>
                          <div className="sd-product-meta">{p.category} · {p.condition==="new"?"New":"Used"}</div>
                        </div>
                        <div className="sd-product-price">KSh {p.price?.toLocaleString()}</div>
                        <div className="sd-product-status" style={{color:p.is_active?"#34c77b":"#f5a623"}}>
                          {p.is_active?"● Live":"● Draft"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {tab === "products" && (
            <div className="sd-section">
              <div className="sd-header">
                <div>
                  <h1>Products</h1>
                  <p>{products.length} product{products.length!==1?"s":""} in {shop?.shop_name}
                    {!isPremium && <span style={{color:"rgba(13,13,13,0.35)",marginLeft:"0.5rem"}}>· Free: {products.length}/{FREE_MAX_PRODUCTS}</span>}
                  </p>
                </div>
                <button className={"btn-rust" + (!canAddProduct?" btn-locked":"")} onClick={handleAddProduct}>
                  {canAddProduct ? "+ Add Product" : "🔒 Limit Reached"}
                </button>
              </div>
              {!isPremium && products.length >= FREE_MAX_PRODUCTS && (
                <PremiumBanner reason="You've reached 5 products on the free plan. Get verified for unlimited products." />
              )}
              {!isPremium && products.length > 0 && products.length < FREE_MAX_PRODUCTS && (
                <div className="sd-limit-bar">
                  <div className="sd-limit-bar-fill" style={{width:`${(products.length/FREE_MAX_PRODUCTS)*100}%`}}/>
                  <span>{products.length}/{FREE_MAX_PRODUCTS} used · <span onClick={() => setTab("verification")} style={{color:"#c84b31",cursor:"pointer",fontWeight:600}}>Get verified for unlimited →</span></span>
                </div>
              )}
              {products.length === 0 ? (
                <div className="sd-empty">
                  <div className="sd-empty-ico">📦</div>
                  <div className="sd-empty-title">No products yet</div>
                  <div className="sd-empty-sub">Add your first product so buyers can find your shop.</div>
                  <button className="btn-rust" style={{marginTop:"1.2rem"}} onClick={handleAddProduct}>Add First Product →</button>
                </div>
              ) : (
                <div className="sd-products-full">
                  {products.map(p => (
                    <div className="sd-product-card" key={p.id}>
                      <div className="sd-product-card-img">{p.image_url ? <img src={p.image_url} alt={p.name}/> : "📦"}</div>
                      <div className="sd-product-card-body">
                        <div className="sd-product-card-top">
                          <div>
                            <div className="sd-product-card-name">{p.name}</div>
                            <div className="sd-product-card-meta">{p.category} · {p.condition==="new"?"✨ New":"♻️ Used"} · 📍 {p.county}</div>
                          </div>
                          <div className="sd-product-status-pill" style={{background:p.is_active?"rgba(52,199,123,0.1)":"rgba(245,166,35,0.1)",color:p.is_active?"#34c77b":"#f5a623"}}>
                            {p.is_active?"● Live":"● Draft"}
                          </div>
                        </div>
                        <div className="sd-product-card-price">KSh {p.price?.toLocaleString()}
                          {p.original_price > p.price && <span className="sd-product-original">KSh {p.original_price?.toLocaleString()}</span>}
                        </div>
                        {p.description && <div className="sd-product-desc">{p.description?.slice(0,80)}{p.description?.length>80?"...":""}</div>}
                        <div className="sd-product-actions">
                          <button className="btn-sm-ghost" onClick={() => window.location.href=`/shops/${shop?.id}`}>View Live →</button>
                          <button className="btn-sm-danger" onClick={() => deleteProduct(p.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SERVICES ── */}
          {tab === "services" && (
            <div className="sd-section">
              <div className="sd-header">
                <div>
                  <h1>Services</h1>
                  <p>{services.length} service{services.length!==1?"s":""} in {shop?.shop_name}
                    {!isPremium && <span style={{color:"rgba(13,13,13,0.35)",marginLeft:"0.5rem"}}>· Free: {services.length}/{FREE_MAX_SERVICES}</span>}
                  </p>
                </div>
                <button className={"btn-rust" + (!canAddService?" btn-locked":"")} onClick={handleAddService}>
                  {canAddService ? "+ Add Service" : "🔒 Limit Reached"}
                </button>
              </div>
              {!isPremium && services.length >= FREE_MAX_SERVICES && (
                <PremiumBanner reason="You've reached 1 service on the free plan. Get verified for unlimited services." />
              )}
              {services.length === 0 ? (
                <div className="sd-empty">
                  <div className="sd-empty-ico">⚙️</div>
                  <div className="sd-empty-title">No services yet</div>
                  <div className="sd-empty-sub">Add services like delivery, repair, installation or any skill you offer.</div>
                  <button className="btn-rust" style={{marginTop:"1.2rem"}} onClick={handleAddService}>Add First Service →</button>
                </div>
              ) : (
                <div className="sd-services-full">
                  {services.map(s => (
                    <div className="sd-service-card" key={s.id}>
                      <div className="sd-service-top"><span className="sd-service-cat">{s.category}</span></div>
                      <div className="sd-service-name">{s.name}</div>
                      <div className="sd-service-price">
                        {s.price_type==="free"?"Free":s.price_type==="negotiable"?"Negotiable":s.price?`KSh ${s.price.toLocaleString()}${s.price_type==="hourly"?"/hr":""}` : "Price on request"}
                      </div>
                      {s.description && <div className="sd-service-desc">{s.description?.slice(0,80)}{s.description?.length>80?"...":""}</div>}
                      <div className="sd-service-actions">
                        <button className="btn-sm-danger" onClick={() => deleteService(s.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REVIEWS ── */}
          {tab === "reviews" && (
            <div className="sd-section">
              <div className="sd-header">
                <div>
                  <h1>Customer Reviews</h1>
                  <p>{isPremium ? `${reviewCount} review${reviewCount!==1?"s":""} · ${rating?`${rating}★ average`:"No rating yet"}` : "Verified sellers only"}</p>
                </div>
              </div>
              {!isPremium ? (
                <div className="sd-locked-section">
                  <div className="sd-locked-ico">⭐</div>
                  <div className="sd-locked-title">Reviews are for Verified Sellers</div>
                  <div className="sd-locked-sub">Get verified to see customer reviews, your average rating, and respond to feedback.</div>
                  <button className="btn-rust" style={{marginTop:"1.5rem"}} onClick={() => setTab("verification")}>Get Verified →</button>
                </div>
              ) : (
                <>
                  {reviewCount > 0 && (
                    <div className="sd-rating-summary">
                      <div className="sd-rating-big">{rating}★</div>
                      <div className="sd-rating-info">
                        <div className="sd-rating-stars">
                          {[1,2,3,4,5].map(s => <span key={s} style={{color:s<=Math.round(rating||0)?"#f59e0b":"rgba(13,13,13,0.15)",fontSize:"1.4rem"}}>★</span>)}
                        </div>
                        <div className="sd-rating-count">Based on {reviewCount} review{reviewCount!==1?"s":""}</div>
                        {[5,4,3,2,1].map(star => {
                          const count = reviews.filter(r => r.rating===star).length;
                          const pct = reviewCount>0?(count/reviewCount)*100:0;
                          return (
                            <div key={star} className="sd-rating-bar-row">
                              <span>{star}★</span>
                              <div className="sd-rating-bar"><div className="sd-rating-bar-fill" style={{width:`${pct}%`}}/></div>
                              <span>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {reviews.length === 0 ? (
                    <div className="sd-empty">
                      <div className="sd-empty-ico">⭐</div>
                      <div className="sd-empty-title">No reviews yet</div>
                      <div className="sd-empty-sub">When buyers visit your shop and leave a rating, it will appear here.</div>
                    </div>
                  ) : (
                    <div className="sd-reviews-list">
                      {reviews.map(r => (
                        <div className="sd-review-card" key={r.id}>
                          <div className="sd-review-top">
                            <div className="sd-review-left">
                              <div className="sd-review-av">{(r.users?.full_name||r.users?.email||"B")[0].toUpperCase()}</div>
                              <div>
                                <div className="sd-review-name">{r.users?.full_name||r.users?.email?.split("@")[0]||"Buyer"}</div>
                                <div className="sd-review-date">{fmtDate(r.created_at)}</div>
                              </div>
                            </div>
                            <div className="sd-review-stars">
                              {[1,2,3,4,5].map(s => <span key={s} style={{color:s<=r.rating?"#f59e0b":"rgba(13,13,13,0.15)"}}>★</span>)}
                            </div>
                          </div>
                          {r.comment && <div className="sd-review-comment">{r.comment}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── ALL SHOPS ── */}
          {tab === "shops" && (
            <div className="sd-section">
              <div className="sd-header">
                <div>
                  <h1>All My Shops</h1>
                  <p>{allShops.length} shop{allShops.length!==1?"s":""} on Shoplace
                    {!isPremium && <span style={{color:"rgba(13,13,13,0.35)",marginLeft:"0.5rem"}}>· Free: {allShops.length}/{FREE_MAX_SHOPS}</span>}
                  </p>
                </div>
                <button className={"btn-rust" + (!canAddShop?" btn-locked":"")} onClick={handleAddShop}>
                  {canAddShop ? "+ Open New Shop" : "🔒 Upgrade to Add More"}
                </button>
              </div>
              <div className="sd-all-shops">
                {allShops.map(s => (
                  <div key={s.id} className={"sd-shop-card" + (s.id===shop?.id?" sd-shop-card-active":"") + (isVerified?" sd-shop-card-v":"")}>
                    {isVerified && <div className="sd-shop-v-ribbon">✓ Verified Seller</div>}
                    <div className="sd-shop-card-top">
                      <div className={"sd-shop-card-av" + (isVerified?" sd-shop-card-av-v":"")} onClick={() => switchShop(s)}>
                        {s.shop_name?.[0]?.toUpperCase()}
                      </div>
                      <div className="sd-shop-card-info">
                        <div className="sd-shop-card-name">
                          {s.shop_name}
                          {s.id === shop?.id && <span className="sd-active-pill">Active</span>}
                          {isVerified && <VerifiedBadge size="sm" />}
                        </div>
                        <div className="sd-shop-card-meta">#{String(s.shop_number||"").padStart(5,"0")} · {s.county} · {s.category}</div>
                        <div className="sd-shop-card-status" style={{color:s.approval_status==="approved"?"#34c77b":s.approval_status==="pending"?"#f5a623":"#ff4f4f"}}>
                          ● {s.approval_status || "pending"}
                        </div>
                      </div>
                    </div>
                    {s.description && <div className="sd-shop-card-desc">{s.description?.slice(0,100)}{s.description?.length>100?"...":""}</div>}
                    <div className="sd-shop-card-actions">
                      {s.id !== shop?.id && <button className="btn-rust" onClick={() => switchShop(s)}>Switch to this shop</button>}
                      <button className="btn-sm-ghost" onClick={() => window.location.href=`/shops/${s.id}`}>View Live →</button>
                    </div>
                  </div>
                ))}
                {/* Add new shop card */}
                <div className={"sd-new-shop-card" + (!canAddShop?" sd-new-shop-locked":"")} onClick={handleAddShop}>
                  <div className="sd-new-shop-ico">{canAddShop ? "+" : "🔒"}</div>
                  <div className="sd-new-shop-label">{canAddShop ? "Open a New Shop" : "Verified Sellers Only"}</div>
                  <div className="sd-new-shop-sub">{canAddShop ? "Expand your presence on Shoplace" : "Get verified to open multiple shops"}</div>
                </div>
              </div>
            </div>
          )}

          {/* ── VERIFICATION ── */}
          {tab === "verification" && (
            <div className="sd-section">
              <div className="sd-header">
                <div>
                  <h1>Seller Verification</h1>
                  <p>{isVerified ? "You are a verified seller on Shoplace" : "Submit your details to get verified"}</p>
                </div>
                {isVerified && <VerifiedBadge size="lg" />}
              </div>

              {/* Already verified */}
              {isVerified ? (
                <div className="sd-verified-full">
                  <div className="sd-verified-icon">✓</div>
                  <div className="sd-verified-title">You're a Verified Seller!</div>
                  <div className="sd-verified-sub">
                    Your verification is active. All your shops, products and services carry the verified badge.
                    You have access to unlimited products, services, multiple shops, reviews, and analytics.
                  </div>
                  <div className="sd-verified-perks">
                    {["✓ Unlimited products", "✓ Unlimited services", "✓ Multiple shops", "✓ Reviews & ratings visible", "✓ Profile view analytics", "✓ Verified badge on all listings", "✓ Priority in search results"].map(p => (
                      <div key={p} className="sd-perk-item">{p}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Pending notice */}
                  {verReq?.status === "pending" && (
                    <div className="sd-pending-notice">
                      <div style={{fontSize:"1.5rem",marginBottom:"0.5rem"}}>⏳</div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:"0.4rem"}}>Verification Under Review</div>
                      <div style={{fontSize:"0.84rem",color:"rgba(13,13,13,0.5)",lineHeight:1.6}}>
                        We received your application on {fmtDate(verReq.submitted_at)}. We review all requests within 24–48 hours. You'll be notified once approved.
                      </div>
                    </div>
                  )}

                  {/* What you get */}
                  <div className="sd-card" style={{marginBottom:"1.5rem"}}>
                    <div className="sd-card-title">What Verification Unlocks</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem",marginTop:"0.5rem"}}>
                      {[
                        { icon:"📦", title:"Unlimited Products", sub:"No 5-product cap" },
                        { icon:"⚙️", title:"Unlimited Services", sub:"List as many as you offer" },
                        { icon:"🏪", title:"Multiple Shops", sub:"Expand to more locations" },
                        { icon:"⭐", title:"Reviews Visible", sub:"Buyers can rate & review you" },
                        { icon:"👁️", title:"Analytics", sub:"See who visits your shop" },
                        { icon:"✓",  title:"Verified Badge", sub:"On all your listings" },
                      ].map(perk => (
                        <div key={perk.title} style={{background:"rgba(13,13,13,0.02)",border:"1px solid rgba(13,13,13,0.07)",borderRadius:"12px",padding:"1rem",textAlign:"center"}}>
                          <div style={{fontSize:"1.5rem",marginBottom:"0.4rem"}}>{perk.icon}</div>
                          <div style={{fontFamily:"'Syne',sans-serif",fontSize:"0.84rem",fontWeight:700,marginBottom:"0.2rem"}}>{perk.title}</div>
                          <div style={{fontSize:"0.72rem",color:"rgba(13,13,13,0.4)"}}>{perk.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form */}
                  <div className="sd-card">
                    <div className="sd-card-title">
                      {verReq?.status === "pending" ? "Your Submitted Details" : "Verification Application"}
                    </div>
                    <div className="sd-ver-form">
                      <div className="sd-form-row">
                        <div className="sd-form-group">
                          <label>Full Name *</label>
                          <input value={verForm.full_name} onChange={e => setVerForm(f=>({...f,full_name:e.target.value}))} placeholder="Your legal full name"/>
                        </div>
                        <div className="sd-form-group">
                          <label>ID / Passport Number *</label>
                          <input value={verForm.id_number} onChange={e => setVerForm(f=>({...f,id_number:e.target.value}))} placeholder="National ID or Passport"/>
                        </div>
                      </div>
                      <div className="sd-form-row">
                        <div className="sd-form-group">
                          <label>Business / Shop Name</label>
                          <input value={verForm.business_name} onChange={e => setVerForm(f=>({...f,business_name:e.target.value}))} placeholder="Official business name"/>
                        </div>
                        <div className="sd-form-group">
                          <label>Business Type</label>
                          <select value={verForm.business_type} onChange={e => setVerForm(f=>({...f,business_type:e.target.value}))}>
                            <option value="">Select type</option>
                            <option>Sole Proprietor</option>
                            <option>Partnership</option>
                            <option>Limited Company</option>
                            <option>Individual Seller</option>
                          </select>
                        </div>
                      </div>
                      <div className="sd-form-row">
                        <div className="sd-form-group">
                          <label>Phone Number *</label>
                          <input value={verForm.phone} onChange={e => setVerForm(f=>({...f,phone:e.target.value}))} placeholder="+254 7XX XXX XXX"/>
                        </div>
                        <div className="sd-form-group">
                          <label>County</label>
                          <input value={verForm.county} onChange={e => setVerForm(f=>({...f,county:e.target.value}))} placeholder="e.g. Nairobi"/>
                        </div>
                      </div>
                      <div className="sd-form-group" style={{gridColumn:"1/-1"}}>
                        <label>Why do you want to be verified? (optional)</label>
                        <textarea value={verForm.reason} onChange={e => setVerForm(f=>({...f,reason:e.target.value}))} placeholder="Tell us about your business and what you sell..." rows={3}/>
                      </div>
                      <div style={{marginTop:"0.5rem",display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap"}}>
                        <button className="btn-rust" onClick={submitVerificationRequest} disabled={verSubmitting}>
                          {verSubmitting ? "Submitting..." : verReq ? "Update Request" : "Submit Verification Request →"}
                        </button>
                        <span style={{fontSize:"0.76rem",color:"rgba(13,13,13,0.38)"}}>
                          Free · Reviewed within 24–48 hours · No payment required
                        </span>
                      </div>
                    </div>
                  </div>
                </>
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

.sd-page{display:grid;grid-template-columns:265px 1fr;min-height:100vh;}

/* ── SIDEBAR ── */
.sd-sidebar{background:linear-gradient(160deg,#1a3326 0%,#0f2318 100%);padding:1.8rem 1.4rem;display:flex;flex-direction:column;gap:1rem;position:sticky;top:0;height:100vh;overflow-y:auto;}
.sd-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.4rem;letter-spacing:-0.04em;color:white;}
.sd-logo span{color:#ff8c42;}
.sd-seller-card{display:flex;align-items:center;gap:0.7rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:0.85rem;}
.sd-seller-av{width:36px;height:36px;background:linear-gradient(135deg,#c84b31,#ff6b35);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:800;color:white;flex-shrink:0;}
.sd-seller-av-v{background:linear-gradient(135deg,#FF8040,#FF2880);}
.sd-seller-name{font-size:0.82rem;font-weight:600;color:white;}
.sd-seller-tag{font-size:0.68rem;color:rgba(255,255,255,0.42);margin-top:0.05rem;}
.sd-section-label{font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.3);margin-bottom:0.4rem;}

/* strips */
.sd-verified-strip{font-size:0.68rem;font-weight:700;color:#FF8040;background:rgba(255,128,64,0.1);border:1px solid rgba(255,128,64,0.2);border-radius:7px;padding:0.35rem 0.7rem;}
.sd-pending-strip{font-size:0.68rem;color:#ffd470;background:rgba(245,166,35,0.08);border:1px solid rgba(245,166,35,0.18);border-radius:7px;padding:0.35rem 0.7rem;}
.sd-free-strip{font-size:0.68rem;color:rgba(255,255,255,0.3);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:7px;padding:0.35rem 0.7rem;}

.sd-current-shop{}
.sd-active-shop-card{display:flex;align-items:center;gap:0.7rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:0.75rem;}
.sd-shop-av{width:34px;height:34px;background:var(--rust);border-radius:9px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:800;color:white;flex-shrink:0;}
.sd-shop-av-v{background:linear-gradient(135deg,#FF8040,#FF2880);}
.sd-active-info{flex:1;}
.sd-active-name{font-size:0.82rem;font-weight:600;color:white;display:flex;align-items:center;gap:0.3rem;}
.sd-active-num{font-size:0.65rem;color:rgba(255,255,255,0.3);margin-top:0.05rem;}
.sd-tag-pill{margin-top:0.45rem;font-size:0.68rem;border-radius:6px;padding:0.28rem 0.6rem;display:inline-block;}
.sd-tag-pill.pending{color:#ffd470;background:rgba(245,166,35,0.08);border:1px solid rgba(245,166,35,0.18);}

.sd-nav{display:flex;flex-direction:column;gap:0.12rem;}
.sd-nav-item{display:flex;align-items:center;gap:0.65rem;padding:0.62rem 0.8rem;border-radius:9px;cursor:pointer;transition:all .15s;color:rgba(255,255,255,0.45);}
.sd-nav-item:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.8);}
.sd-nav-item.active{background:rgba(255,255,255,0.11);color:white;border-left:3px solid #4ade80;padding-left:calc(0.8rem - 3px);}
.sd-nav-icon{font-size:0.85rem;width:18px;text-align:center;flex-shrink:0;}
.sd-nav-label{flex:1;font-size:0.84rem;font-weight:500;}
.sd-nav-badge{background:#c84b31;color:white;font-size:0.6rem;font-weight:700;padding:0.1rem 0.4rem;border-radius:100px;min-width:18px;text-align:center;}
.sd-quick{display:flex;flex-direction:column;gap:0.4rem;}
.sd-quick-btn{display:block;width:100%;padding:0.5rem 0.8rem;background:rgba(200,75,49,0.15);border:1px solid rgba(200,75,49,0.25);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:0.78rem;font-weight:600;color:#ff8c72;text-align:center;transition:all .2s;cursor:pointer;}
.sd-quick-btn:hover{background:rgba(200,75,49,0.25);}
.sd-quick-btn-ghost{background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.1);color:rgba(255,255,255,0.45);}
.sd-quick-btn-ghost:hover{background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);}
.sd-quick-btn-locked{background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.06);color:rgba(255,255,255,0.25);cursor:not-allowed;}
.sd-quick-btn-locked:hover{background:rgba(255,255,255,0.03);}
.sd-premium-btn{background:linear-gradient(135deg,rgba(255,140,66,0.2),rgba(255,40,128,0.2));border-color:rgba(255,140,66,0.35);color:#ff8c42;font-weight:700;}
.sd-premium-btn:hover{background:linear-gradient(135deg,rgba(255,140,66,0.3),rgba(255,40,128,0.3));}
.sd-signout{margin-top:auto;padding:0.55rem;border:1px solid rgba(255,255,255,0.08);border-radius:9px;background:transparent;color:rgba(255,255,255,0.28);font-family:'DM Sans',sans-serif;font-size:0.78rem;cursor:pointer;transition:all .2s;}
.sd-signout:hover{background:rgba(255,80,80,0.1);border-color:rgba(255,80,80,0.2);color:rgba(255,120,120,0.7);}

/* ── MAIN ── */
.sd-main{background:var(--cream);overflow-y:auto;}
.sd-section{padding:2.5rem 3rem;max-width:1100px;}
.sd-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.5rem;gap:1rem;}
.sd-header h1{font-family:'Syne',sans-serif;font-size:1.75rem;font-weight:800;letter-spacing:-0.03em;display:flex;align-items:center;gap:0.6rem;}
.sd-header p{font-size:0.84rem;color:rgba(13,13,13,0.42);margin-top:0.3rem;}

/* ── VERIFY CTA ── */
.sd-verify-cta{display:flex;align-items:center;justify-content:space-between;gap:1rem;background:linear-gradient(135deg,#0a1a0f,#1a0a20);border:1px solid rgba(255,128,64,0.25);border-radius:14px;padding:1.2rem 1.5rem;margin-bottom:1.5rem;}
.sd-verify-cta-left{flex:1;}
.sd-verify-cta-title{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:800;color:white;margin-bottom:0.3rem;}
.sd-verify-cta-sub{font-size:0.76rem;color:rgba(255,200,150,0.55);line-height:1.5;}

/* ── PREMIUM BANNER ── */
.premium-banner{display:flex;align-items:center;justify-content:space-between;gap:1rem;background:linear-gradient(135deg,#1a0a00,#2a0d18);border:1px solid rgba(255,140,66,0.25);border-radius:14px;padding:1.1rem 1.4rem;margin-bottom:1.5rem;}
.premium-banner-left{display:flex;align-items:center;gap:0.8rem;}
.premium-crown{font-size:1.4rem;}
.premium-banner-title{font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:700;color:white;}
.premium-banner-sub{font-size:0.75rem;color:rgba(255,200,150,0.6);margin-top:0.1rem;}
.premium-banner-btn{padding:0.5rem 1.2rem;background:linear-gradient(135deg,#FF8040,#FF2880);color:white;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.8rem;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .2s;}
.premium-banner-btn:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(255,80,128,0.3);}

/* ── STATS ── */
.sd-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem;}
.sd-stat{background:white;border:1px solid var(--border);border-radius:14px;padding:1.3rem;transition:all .2s;position:relative;}
.sd-stat:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.07);}
.sd-stat-locked{background:rgba(13,13,13,0.02);border-style:dashed;}
.sd-stat-ico{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;margin-bottom:0.7rem;}
.sd-stat-num{font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;letter-spacing:-0.03em;color:var(--rust);}
.sd-stat-limit{font-size:1rem;font-weight:500;color:rgba(13,13,13,0.3);}
.sd-locked-num{font-size:1.4rem;}
.sd-lock-icon{font-size:1.2rem;}
.sd-stat-lbl{font-size:0.76rem;color:rgba(13,13,13,0.42);margin-top:0.18rem;}
.sd-lock-upgrade{display:block;margin-top:0.4rem;font-size:0.68rem;font-weight:700;color:#FF8040;}

/* ── LIMIT BAR ── */
.sd-limit-bar{position:relative;background:rgba(13,13,13,0.06);border-radius:8px;height:6px;margin-bottom:2rem;overflow:hidden;}
.sd-limit-bar-fill{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#34c77b,#f5a623);border-radius:8px;}
.sd-limit-bar span{position:absolute;top:10px;left:0;font-size:0.72rem;color:rgba(13,13,13,0.4);}

/* ── LOCKED SECTION ── */
.sd-locked-section{background:white;border:2px dashed rgba(13,13,13,0.1);border-radius:16px;padding:4rem 2rem;text-align:center;}
.sd-locked-ico{font-size:3rem;margin-bottom:1rem;}
.sd-locked-title{font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:800;margin-bottom:0.6rem;}
.sd-locked-sub{font-size:0.85rem;color:rgba(13,13,13,0.45);line-height:1.7;max-width:400px;margin:0 auto;}

/* ── CARDS ── */
.sd-card{background:white;border:1px solid var(--border);border-radius:16px;padding:1.5rem;}
.sd-card-title{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;margin-bottom:1rem;display:flex;align-items:center;gap:0.6rem;justify-content:space-between;}
.sd-card-link{font-size:0.78rem;font-weight:500;color:var(--rust);cursor:pointer;}
.sd-info-grid{display:flex;flex-direction:column;}
.sd-info-row{display:flex;justify-content:space-between;padding:0.65rem 0;border-bottom:1px solid rgba(13,13,13,0.05);font-size:0.855rem;}
.sd-info-row:last-child{border-bottom:none;}
.sd-info-label{color:rgba(13,13,13,0.42);}
.sd-info-val{font-weight:500;}

/* ── PRODUCTS ── */
.sd-products-list{display:flex;flex-direction:column;gap:0.7rem;margin-top:0.5rem;}
.sd-product-row{display:flex;align-items:center;gap:1rem;padding:0.8rem;background:rgba(13,13,13,0.02);border-radius:10px;}
.sd-product-img{width:42px;height:42px;background:#e8ede9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;overflow:hidden;flex-shrink:0;}
.sd-product-img img{width:100%;height:100%;object-fit:cover;}
.sd-product-info{flex:1;}
.sd-product-name{font-size:0.875rem;font-weight:500;}
.sd-product-meta{font-size:0.72rem;color:rgba(13,13,13,0.38);margin-top:0.08rem;}
.sd-product-price{font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:700;color:var(--rust);}
.sd-product-status{font-size:0.72rem;font-weight:600;margin-left:0.8rem;white-space:nowrap;}
.sd-products-full{display:flex;flex-direction:column;gap:1rem;}
.sd-product-card{background:white;border:1px solid var(--border);border-radius:14px;display:flex;gap:1rem;overflow:hidden;}
.sd-product-card-img{width:120px;min-height:100px;background:#e8ede9;display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0;overflow:hidden;}
.sd-product-card-img img{width:100%;height:100%;object-fit:cover;}
.sd-product-card-body{flex:1;padding:1.2rem 1.2rem 1.2rem 0;}
.sd-product-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:0.5rem;margin-bottom:0.4rem;}
.sd-product-card-name{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;}
.sd-product-card-meta{font-size:0.72rem;color:rgba(13,13,13,0.38);margin-top:0.15rem;}
.sd-product-status-pill{font-size:0.68rem;font-weight:600;padding:0.2rem 0.55rem;border-radius:100px;flex-shrink:0;}
.sd-product-card-price{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;color:var(--rust);margin-bottom:0.35rem;}
.sd-product-original{font-size:0.72rem;color:rgba(13,13,13,0.28);text-decoration:line-through;margin-left:0.4rem;font-family:'DM Sans',sans-serif;font-weight:400;}
.sd-product-desc{font-size:0.78rem;color:rgba(13,13,13,0.42);line-height:1.5;margin-bottom:0.6rem;}
.sd-product-actions{display:flex;gap:0.5rem;}

/* ── SERVICES ── */
.sd-services-full{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;}
.sd-service-card{background:white;border:1px solid var(--border);border-radius:14px;padding:1.3rem;display:flex;flex-direction:column;gap:0.5rem;}
.sd-service-top{display:flex;align-items:center;gap:0.5rem;}
.sd-service-cat{font-size:0.68rem;background:rgba(13,13,13,0.05);padding:0.18rem 0.55rem;border-radius:100px;color:rgba(13,13,13,0.45);}
.sd-service-name{font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:700;}
.sd-service-price{font-size:0.9rem;font-weight:700;color:var(--rust);}
.sd-service-desc{font-size:0.76rem;color:rgba(13,13,13,0.42);line-height:1.5;}
.sd-service-actions{display:flex;gap:0.5rem;margin-top:0.3rem;}

/* ── REVIEWS ── */
.sd-rating-summary{background:white;border:1px solid var(--border);border-radius:16px;padding:1.5rem;display:flex;gap:2rem;margin-bottom:1.5rem;}
.sd-rating-big{font-family:'Syne',sans-serif;font-size:3.5rem;font-weight:800;color:var(--rust);line-height:1;}
.sd-rating-info{flex:1;}
.sd-rating-stars{margin-bottom:0.3rem;}
.sd-rating-count{font-size:0.78rem;color:rgba(13,13,13,0.42);margin-bottom:0.8rem;}
.sd-rating-bar-row{display:flex;align-items:center;gap:0.6rem;font-size:0.72rem;color:rgba(13,13,13,0.45);margin-bottom:0.3rem;}
.sd-rating-bar{flex:1;height:6px;background:rgba(13,13,13,0.07);border-radius:100px;overflow:hidden;}
.sd-rating-bar-fill{height:100%;background:#f59e0b;border-radius:100px;}
.sd-reviews-list{display:flex;flex-direction:column;gap:1rem;}
.sd-review-card{background:white;border:1px solid var(--border);border-radius:14px;padding:1.3rem;}
.sd-review-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.7rem;}
.sd-review-left{display:flex;align-items:center;gap:0.7rem;}
.sd-review-av{width:34px;height:34px;background:var(--rust);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:0.85rem;font-weight:800;color:white;flex-shrink:0;}
.sd-review-name{font-size:0.875rem;font-weight:600;}
.sd-review-date{font-size:0.68rem;color:rgba(13,13,13,0.3);}
.sd-review-stars{display:flex;gap:1px;font-size:1rem;}
.sd-review-comment{font-size:0.84rem;color:rgba(13,13,13,0.55);line-height:1.6;background:rgba(13,13,13,0.02);border-radius:8px;padding:0.7rem 0.9rem;}

/* ── ALL SHOPS ── */
.sd-all-shops{display:flex;flex-direction:column;gap:1rem;}
.sd-shop-card{background:white;border:1px solid var(--border);border-radius:16px;padding:1.4rem;transition:all .2s;}
.sd-shop-card-active{border-color:rgba(200,75,49,0.3);box-shadow:0 4px 16px rgba(200,75,49,0.08);}
.sd-shop-card-v{background:linear-gradient(150deg,#1a0a00,#1f0d08);border-color:rgba(255,120,60,0.22);}
.sd-shop-v-ribbon{display:inline-flex;padding:0.2rem 0.65rem;background:linear-gradient(135deg,#ff8c42,#ff4e8c);border-radius:100px;font-size:0.6rem;font-weight:700;color:white;margin-bottom:0.8rem;}
.sd-shop-card-top{display:flex;gap:1rem;margin-bottom:0.9rem;}
.sd-shop-card-av{width:50px;height:50px;background:var(--rust);border-radius:13px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;color:white;flex-shrink:0;cursor:pointer;}
.sd-shop-card-av-v{background:linear-gradient(135deg,#FF8040,#FF2880);}
.sd-shop-card-info{flex:1;}
.sd-shop-card-name{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem;}
.sd-shop-card-v .sd-shop-card-name{color:white;}
.sd-active-pill{font-size:0.62rem;font-weight:600;color:#4ade80;background:rgba(74,222,128,0.1);padding:0.12rem 0.45rem;border-radius:100px;}
.sd-shop-card-meta{font-size:0.74rem;color:rgba(13,13,13,0.38);margin-bottom:0.2rem;}
.sd-shop-card-v .sd-shop-card-meta{color:rgba(255,255,255,0.3);}
.sd-shop-card-status{font-size:0.72rem;font-weight:600;}
.sd-shop-card-desc{font-size:0.78rem;color:rgba(13,13,13,0.42);line-height:1.5;margin-bottom:0.9rem;}
.sd-shop-card-v .sd-shop-card-desc{color:rgba(255,255,255,0.28);}
.sd-shop-card-actions{display:flex;gap:0.6rem;flex-wrap:wrap;}
.sd-new-shop-card{background:white;border:2px dashed rgba(13,13,13,0.12);border-radius:16px;padding:2.5rem;text-align:center;cursor:pointer;transition:all .2s;}
.sd-new-shop-card:hover{border-color:var(--rust);background:rgba(200,75,49,0.02);}
.sd-new-shop-locked{border-color:rgba(13,13,13,0.06);cursor:not-allowed;}
.sd-new-shop-locked:hover{border-color:rgba(13,13,13,0.06);background:white;}
.sd-new-shop-ico{font-size:2rem;color:rgba(13,13,13,0.2);margin-bottom:0.6rem;}
.sd-new-shop-label{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;color:rgba(13,13,13,0.5);}
.sd-new-shop-sub{font-size:0.78rem;color:rgba(13,13,13,0.3);margin-top:0.3rem;}

/* ── VERIFICATION PAGE ── */
.sd-pending-notice{background:#fffbeb;border:1px solid rgba(245,166,35,0.3);border-radius:14px;padding:1.5rem;text-align:center;margin-bottom:1.5rem;}
.sd-verified-full{background:white;border:2px solid rgba(255,128,64,0.25);border-radius:20px;padding:3rem 2rem;text-align:center;}
.sd-verified-icon{width:72px;height:72px;background:linear-gradient(135deg,#FF8040,#FF2880);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;color:white;font-weight:900;margin:0 auto 1.2rem;}
.sd-verified-title{font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800;margin-bottom:0.7rem;color:var(--ink);}
.sd-verified-sub{font-size:0.88rem;color:rgba(13,13,13,0.5);line-height:1.7;max-width:480px;margin:0 auto 1.5rem;}
.sd-verified-perks{display:inline-flex;flex-wrap:wrap;gap:0.6rem;justify-content:center;}
.sd-perk-item{font-size:0.78rem;font-weight:600;color:#FF8040;background:rgba(255,128,64,0.08);border:1px solid rgba(255,128,64,0.2);padding:0.3rem 0.8rem;border-radius:100px;}

/* ── VER FORM ── */
.sd-ver-form{display:flex;flex-direction:column;gap:1rem;}
.sd-form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
.sd-form-group{display:flex;flex-direction:column;gap:0.35rem;}
.sd-form-group label{font-size:0.74rem;font-weight:600;color:rgba(13,13,13,0.5);text-transform:uppercase;letter-spacing:0.05em;}
.sd-form-group input,.sd-form-group select,.sd-form-group textarea{padding:0.7rem 0.9rem;background:#f9f8f6;border:1.5px solid rgba(13,13,13,0.1);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:0.875rem;color:var(--ink);outline:none;transition:border-color .2s;resize:vertical;}
.sd-form-group input:focus,.sd-form-group select:focus,.sd-form-group textarea:focus{border-color:var(--rust);}

/* ── EMPTY ── */
.sd-empty{background:white;border:1px solid var(--border);border-radius:16px;padding:4rem 2rem;text-align:center;}
.sd-empty-ico{font-size:2.5rem;margin-bottom:1rem;}
.sd-empty-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;}
.sd-empty-sub{font-size:0.84rem;color:rgba(13,13,13,0.42);line-height:1.6;max-width:360px;margin:0 auto;}

/* ── BUTTONS ── */
.btn-rust{padding:0.55rem 1.3rem;background:var(--rust);color:white;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.84rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;}
.btn-rust:hover:not(:disabled){background:#a83a22;transform:translateY(-1px);}
.btn-rust:disabled{opacity:0.6;cursor:not-allowed;}
.btn-locked{background:rgba(13,13,13,0.08)!important;color:rgba(13,13,13,0.35)!important;cursor:not-allowed!important;transform:none!important;}
.btn-sm-ghost{padding:0.38rem 0.85rem;background:transparent;border:1.5px solid var(--border);border-radius:7px;font-family:'DM Sans',sans-serif;font-size:0.76rem;font-weight:500;color:rgba(13,13,13,0.6);cursor:pointer;transition:all .2s;}
.btn-sm-ghost:hover{border-color:var(--ink);color:var(--ink);}
.btn-sm-danger{padding:0.38rem 0.85rem;background:transparent;border:1.5px solid rgba(220,38,38,0.2);border-radius:7px;font-family:'DM Sans',sans-serif;font-size:0.76rem;font-weight:500;color:rgba(220,38,38,0.6);cursor:pointer;transition:all .2s;}
.btn-sm-danger:hover{background:rgba(220,38,38,0.05);border-color:#dc2626;color:#dc2626;}

/* ── TOAST ── */
.sd-toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);color:white;padding:0.65rem 1.5rem;border-radius:100px;font-size:0.84rem;font-weight:500;z-index:999;animation:fadeup .3s ease;pointer-events:none;white-space:nowrap;}
@keyframes fadeup{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}

/* ── MOBILE ── */
@media(max-width:960px){
  .sd-page{grid-template-columns:1fr;}
  .sd-sidebar{position:fixed;bottom:0;top:auto;left:0;right:0;height:auto;flex-direction:row;padding:0;z-index:100;border-top:1px solid rgba(255,255,255,0.07);overflow-x:auto;gap:0;}
  .sd-logo,.sd-seller-card,.sd-verified-strip,.sd-pending-strip,.sd-free-strip,.sd-current-shop,.sd-quick,.sd-signout{display:none;}
  .sd-nav{flex-direction:row;width:100%;}
  .sd-nav-item{flex-direction:column;gap:0.1rem;padding:0.45rem 0.5rem;border-left:none!important;padding-left:0.5rem!important;flex:1;justify-content:center;align-items:center;}
  .sd-nav-item.active{background:rgba(255,255,255,0.09);border-bottom:2px solid #4ade80;}
  .sd-nav-icon{font-size:1rem;width:auto;}
  .sd-nav-label{font-size:0.58rem;}
  .sd-main{padding-bottom:72px;}
  .sd-section{padding:1.4rem 1rem;}
  .sd-stats{grid-template-columns:repeat(2,1fr);}
  .sd-services-full{grid-template-columns:1fr;}
  .sd-product-card-img{width:80px;}
  .sd-form-row{grid-template-columns:1fr;}
}
`;