"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SellerDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "products" | "services">("overview");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = "/auth/login?redirect=/seller/dashboard"; return; }
      setUser(session.user);
      // Load shop
      const { data: shopData } = await supabase.from("shops").select("*").eq("owner_id", session.user.id).single();
      if (!shopData) { window.location.href = "/seller/register"; return; }
      setShop(shopData);
      // Load products
      const { data: productData } = await supabase.from("products").select("*").eq("shop_id", shopData.id).order("created_at", { ascending: false });
      setProducts(productData || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontFamily: "sans-serif", color: "rgba(13,13,13,0.4)" }}>Loading your dashboard...</div></div>;

  const statusColor = shop?.approval_status === "approved" ? "#34c77b" : shop?.approval_status === "suspended" ? "#ff4f4f" : "#f5a623";
  const statusBg = shop?.approval_status === "approved" ? "rgba(52,199,123,0.1)" : shop?.approval_status === "suspended" ? "rgba(255,79,79,0.1)" : "rgba(245,166,35,0.1)";

  return (
    <>
      <style>{css}</style>
      <div className="dash-page">

        {/* NAV */}
        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <div className="sp-nav-actions">
            <a href="/" className="btn-ghost">← Marketplace</a>
            <button className="btn-rust-outline" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>Sign Out</button>
          </div>
        </nav>

        <div className="dash-layout">

          {/* SIDEBAR */}
          <aside className="dash-sidebar">
            <div className="shop-identity">
              <div className="shop-avatar">{shop?.shop_name?.[0] || "S"}</div>
              <div>
                <div className="shop-name">{shop?.shop_name}</div>
                <div className="shop-num">SHOP #{shop?.shop_number}</div>
              </div>
            </div>
            <div className="shop-status" style={{ background: statusBg, color: statusColor }}>
              ● {shop?.approval_status?.toUpperCase()}
            </div>
            {shop?.approval_status === "pending" && (
              <div className="pending-notice">⏳ Your shop is under review. You can set it up while you wait.</div>
            )}
            <nav className="dash-nav">
              <div className={`dash-nav-item ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>⬛ Overview</div>
              <div className={`dash-nav-item ${tab === "products" ? "active" : ""}`} onClick={() => setTab("products")}>📦 Products ({products.length})</div>
              <div className={`dash-nav-item ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>⚙️ Services</div>
            </nav>
          </aside>

          {/* MAIN */}
          <main className="dash-main">

            {/* OVERVIEW TAB */}
            {tab === "overview" && (
              <div>
                <div className="dash-header">
                  <div>
                    <div className="dash-title">Dashboard</div>
                    <div className="dash-sub">Welcome back, {user?.email?.split("@")[0]}</div>
                  </div>
                  <button className="btn-solid" onClick={() => setTab("products")}>+ Add Product</button>
                </div>

                <div className="stats-row">
                  <div className="stat-card">
                    <div className="stat-ico">📦</div>
                    <div className="stat-val">{products.length}</div>
                    <div className="stat-lbl">Total Products</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-ico">👁️</div>
                    <div className="stat-val">0</div>
                    <div className="stat-lbl">Profile Views</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-ico">💬</div>
                    <div className="stat-val">0</div>
                    <div className="stat-lbl">Inquiries</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-ico">⭐</div>
                    <div className="stat-val">—</div>
                    <div className="stat-lbl">Rating</div>
                  </div>
                </div>

                <div className="info-card">
                  <h4>Shop Information</h4>
                  <div className="info-grid">
                    <div className="info-row"><span>Shop Name</span><span>{shop?.shop_name}</span></div>
                    <div className="info-row"><span>Shop Number</span><span>#{shop?.shop_number}</span></div>
                    <div className="info-row"><span>Category</span><span>{shop?.category || "—"}</span></div>
                    <div className="info-row"><span>County</span><span>{shop?.county || "—"}</span></div>
                    <div className="info-row"><span>Phone</span><span>{shop?.phone || "—"}</span></div>
                    <div className="info-row"><span>WhatsApp</span><span>{shop?.whatsapp || "—"}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {tab === "products" && (
              <div>
                <div className="dash-header">
                  <div>
                    <div className="dash-title">Products</div>
                    <div className="dash-sub">{products.length} product{products.length !== 1 ? "s" : ""} listed</div>
                  </div>
                  <button className="btn-solid" onClick={() => window.location.href = "/seller/products/new"}>+ Add Product</button>
                </div>

                {products.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-ico">📦</div>
                    <div className="empty-title">No products yet</div>
                    <div className="empty-sub">Start adding products to your shop so buyers can find them.</div>
                    <button className="btn-solid" style={{ marginTop: "1.5rem" }} onClick={() => window.location.href = "/seller/products/new"}>Add Your First Product →</button>
                  </div>
                ) : (
                  <div className="products-list">
                    {products.map(p => (
                      <div className="product-row" key={p.id}>
                        <div className="product-emoji">📦</div>
                        <div className="product-info">
                          <div className="product-name">{p.name}</div>
                          <div className="product-meta">{p.category} · {p.county}</div>
                        </div>
                        <div className="product-price">KSh {p.price?.toLocaleString()}</div>
                        <div className="product-status" style={{ color: p.is_active ? "#34c77b" : "#f5a623" }}>
                          {p.is_active ? "● Active" : "● Draft"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SERVICES TAB */}
            {tab === "services" && (
              <div>
                <div className="dash-header">
                  <div>
                    <div className="dash-title">Services</div>
                    <div className="dash-sub">Services you offer to buyers</div>
                  </div>
                  <button className="btn-solid" onClick={() => window.location.href = "/seller/services/new"}>+ Add Service</button>
                </div>
                <div className="empty-state">
                  <div className="empty-ico">⚙️</div>
                  <div className="empty-title">No services yet</div>
                  <div className="empty-sub">Add services like delivery, installation, or any skill you offer.</div>
                  <button className="btn-solid" style={{ marginTop: "1.5rem" }} onClick={() => window.location.href = "/seller/services/new"}>Add Your First Service →</button>
                </div>
              </div>
            )}

          </main>
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
.sp-nav{position:fixed;top:0;width:100%;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1rem 3rem;background:rgba(245,240,232,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);}
.sp-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.4rem;letter-spacing:-0.04em;color:var(--ink);}
.sp-logo span{color:var(--rust);}
.sp-nav-actions{display:flex;gap:0.65rem;align-items:center;}
.btn-ghost{padding:0.45rem 1rem;border:1.5px solid rgba(13,13,13,0.25);border-radius:100px;font-size:0.82rem;font-weight:500;color:var(--ink);background:transparent;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-ghost:hover{background:var(--ink);color:var(--cream);}
.btn-solid{padding:0.6rem 1.4rem;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:600;background:var(--rust);color:white;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:0.3rem;}
.btn-solid:hover{background:#a83a22;transform:translateY(-1px);}
.btn-rust-outline{padding:0.45rem 1rem;border:1.5px solid var(--rust);border-radius:100px;font-size:0.82rem;font-weight:500;background:transparent;color:var(--rust);cursor:pointer;transition:all .2s;}
.btn-rust-outline:hover{background:var(--rust);color:white;}
.dash-page{min-height:100vh;background:var(--cream);}
.dash-layout{display:grid;grid-template-columns:260px 1fr;min-height:100vh;padding-top:68px;}
.dash-sidebar{background:white;border-right:1px solid var(--border);padding:2rem 1.5rem;position:sticky;top:68px;height:calc(100vh - 68px);overflow-y:auto;}
.shop-identity{display:flex;align-items:center;gap:0.9rem;margin-bottom:1rem;}
.shop-avatar{width:44px;height:44px;background:var(--rust);border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:800;color:white;flex-shrink:0;}
.shop-name{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;}
.shop-num{font-size:0.72rem;color:rgba(13,13,13,0.4);margin-top:0.1rem;}
.shop-status{display:inline-flex;padding:0.25rem 0.75rem;border-radius:100px;font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:1rem;}
.pending-notice{background:rgba(245,166,35,0.08);border:1px solid rgba(245,166,35,0.2);border-radius:8px;padding:0.75rem;font-size:0.78rem;color:#b8830a;line-height:1.5;margin-bottom:1.2rem;}
.dash-nav{display:flex;flex-direction:column;gap:0.2rem;margin-top:1rem;}
.dash-nav-item{padding:0.65rem 0.9rem;border-radius:10px;font-size:0.875rem;color:rgba(13,13,13,0.5);cursor:pointer;transition:all .15s;}
.dash-nav-item:hover{background:var(--cream);color:var(--ink);}
.dash-nav-item.active{background:rgba(200,75,49,0.08);color:var(--rust);font-weight:500;}
.dash-main{padding:2.5rem 3rem;min-height:100%;}
.dash-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;}
.dash-title{font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800;letter-spacing:-0.02em;}
.dash-sub{font-size:0.83rem;color:rgba(13,13,13,0.45);margin-top:0.2rem;}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:1.2rem;margin-bottom:2rem;}
.stat-card{background:white;border-radius:14px;padding:1.4rem;border:1px solid var(--border);}
.stat-ico{font-size:1.4rem;margin-bottom:0.6rem;}
.stat-val{font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;letter-spacing:-0.03em;}
.stat-lbl{font-size:0.78rem;color:rgba(13,13,13,0.42);margin-top:0.2rem;}
.info-card{background:white;border-radius:14px;padding:1.8rem;border:1px solid var(--border);}
.info-card h4{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;margin-bottom:1.2rem;}
.info-grid{display:flex;flex-direction:column;gap:0;}
.info-row{display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid rgba(13,13,13,0.06);font-size:0.875rem;}
.info-row:last-child{border-bottom:none;}
.info-row span:first-child{color:rgba(13,13,13,0.45);}
.info-row span:last-child{font-weight:500;}
.empty-state{background:white;border-radius:14px;padding:4rem 2rem;text-align:center;border:1px solid var(--border);}
.empty-ico{font-size:2.5rem;margin-bottom:1rem;}
.empty-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;}
.empty-sub{font-size:0.85rem;color:rgba(13,13,13,0.45);line-height:1.6;max-width:360px;margin:0 auto;}
.products-list{display:flex;flex-direction:column;gap:0.75rem;}
.product-row{background:white;border-radius:12px;padding:1.1rem 1.4rem;border:1px solid var(--border);display:flex;align-items:center;gap:1rem;}
.product-emoji{font-size:1.5rem;flex-shrink:0;}
.product-info{flex:1;}
.product-name{font-weight:500;font-size:0.9rem;}
.product-meta{font-size:0.75rem;color:rgba(13,13,13,0.4);margin-top:0.2rem;}
.product-price{font-family:'Syne',sans-serif;font-weight:700;font-size:0.95rem;color:var(--rust);}
.product-status{font-size:0.75rem;font-weight:600;margin-left:1rem;}
`;