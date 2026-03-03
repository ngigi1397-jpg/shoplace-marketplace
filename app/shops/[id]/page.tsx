"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ShopPage() {
  const params = useParams();
  const shopId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"products" | "services">("products");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = `/auth/login?redirect=/shops/${shopId}`; return; }
      setUser(session.user);

      // Load shop
      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("id", shopId)
        .single();

      if (!shopData) { setNotFound(true); setLoading(false); return; }
      setShop(shopData);

      // Load owner info
      const { data: ownerData } = await supabase
        .from("users")
        .select("full_name, county, created_at")
        .eq("id", shopData.owner_id)
        .single();
      setOwner(ownerData);

      // Load products
      const { data: productData } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setProducts(productData || []);

      // Load services
      const { data: serviceData } = await supabase
        .from("services")
        .select("*")
        .eq("shop_id", shopId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setServices(serviceData || []);

      setLoading(false);
    });
  }, [shopId]);

  const whatsappLink = (phone: string, shopName: string) => {
    const clean = phone?.replace(/\D/g, "");
    const num = clean?.startsWith("0") ? "254" + clean.slice(1) : clean;
    return `https://wa.me/${num}?text=Hi, I found your shop ${shopName} on Shoplace and I'm interested in your products.`;
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#f5f0e8" }} />;

  if (notFound) return (
    <>
      <style>{css}</style>
      <div className="page-wrap">
        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <a href="/shops" className="btn-ghost">← Back to Shops</a>
        </nav>
        <div className="not-found">
          <div className="nf-icon">🏪</div>
          <h2>Shop not found</h2>
          <p>This shop may have been removed or the link is incorrect.</p>
          <a href="/shops" className="btn-solid">Browse All Shops →</a>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="page-wrap">

        {/* NAV */}
        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <ul className="sp-nav-links">
            <li><a href="/products">Products</a></li>
            <li><a href="/shops">Shops</a></li>
            <li><a href="/services">Services</a></li>
          </ul>
          <div className="sp-nav-actions">
            <a href="/shops" className="btn-ghost">← All Shops</a>
            <button className="btn-rust-outline" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>Sign Out</button>
          </div>
        </nav>

        {/* SHOP HEADER */}
        <div className="shop-hero">
          <div className="shop-hero-inner">
            <div className="shop-hero-left">
              <div className="shop-avatar-lg">{shop?.shop_name?.[0] || "S"}</div>
              <div className="shop-hero-info">
                <div className="shop-hero-num">SHOP #{String(shop?.shop_number || "").padStart(5, "0")}</div>
                <h1 className="shop-hero-name">{shop?.shop_name}</h1>
                <div className="shop-hero-meta">
                  <span>📍 {shop?.county}{shop?.constituency ? `, ${shop?.constituency}` : ""}</span>
                  <span>·</span>
                  <span>🏷️ {shop?.category}</span>
                  {owner?.created_at && (
                    <>
                      <span>·</span>
                      <span>📅 Joined {new Date(owner.created_at).toLocaleDateString("en-KE", { month: "long", year: "numeric" })}</span>
                    </>
                  )}
                </div>
                {shop?.description && <p className="shop-hero-desc">{shop.description}</p>}
              </div>
            </div>

            {/* CONTACT ACTIONS */}
            <div className="shop-contact-card">
              <div className="contact-title">Contact Seller</div>
              {shop?.phone && (
                <a href={`tel:${shop.phone}`} className="contact-btn-full phone">
                  📞 Call {shop.phone}
                </a>
              )}
              {shop?.whatsapp && (
                <a href={whatsappLink(shop.whatsapp, shop.shop_name)} target="_blank" className="contact-btn-full whatsapp">
                  💬 WhatsApp
                </a>
              )}
              {shop?.instagram && (
                <a href={`https://instagram.com/${shop.instagram.replace("@", "")}`} target="_blank" className="contact-btn-full instagram">
                  📸 {shop.instagram}
                </a>
              )}
              {shop?.address && (
                <div className="shop-address">
                  📌 {shop.address}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="shop-content">

          {/* TABS */}
          <div className="tabs-bar">
            <button
              className={`tab-btn ${tab === "products" ? "active" : ""}`}
              onClick={() => setTab("products")}
            >
              📦 Products ({products.length})
            </button>
            <button
              className={`tab-btn ${tab === "services" ? "active" : ""}`}
              onClick={() => setTab("services")}
            >
              ⚙️ Services ({services.length})
            </button>
          </div>

          {/* PRODUCTS TAB */}
          {tab === "products" && (
            <div>
              {products.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-ico">📦</div>
                  <div className="empty-title">No products listed yet</div>
                  <div className="empty-sub">This shop hasn&apos;t added any products yet. Check back soon or contact the seller directly.</div>
                  {shop?.whatsapp && (
                    <a href={whatsappLink(shop.whatsapp, shop.shop_name)} target="_blank" className="btn-solid" style={{ marginTop: "1.5rem", display: "inline-flex" }}>
                      💬 Ask Seller on WhatsApp
                    </a>
                  )}
                </div>
              ) : (
                <div className="products-grid">
                  {products.map(p => (
                    <div className="product-card" key={p.id}>
                      <div className="product-img">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name} />
                          : <span>📦</span>}
                      </div>
                      <div className="product-body">
                        <div className="product-condition">{p.condition === "new" ? "✨ New" : `Used — ${p.condition?.split("_").slice(1).join(" ")}`}</div>
                        <div className="product-name">{p.name}</div>
                        <div className="product-price-row">
                          <div className="product-price">KSh {p.price?.toLocaleString()}</div>
                          {p.original_price && p.original_price > p.price && (
                            <>
                              <div className="product-original">KSh {p.original_price?.toLocaleString()}</div>
                              <div className="product-discount">-{Math.round((1 - p.price / p.original_price) * 100)}%</div>
                            </>
                          )}
                        </div>
                        {p.description && <div className="product-desc">{p.description.slice(0, 80)}{p.description.length > 80 ? "..." : ""}</div>}
                        <div className="product-actions">
                          {shop?.phone && <a href={`tel:${shop.phone}`} className="pact-btn">📞 Call</a>}
                          {shop?.whatsapp && (
                            <a
                              href={`https://wa.me/${shop.whatsapp?.replace(/\D/g, "").replace(/^0/, "254")}?text=Hi, I'm interested in your ${p.name} listed on Shoplace.`}
                              target="_blank"
                              className="pact-btn wa"
                            >
                              💬 WhatsApp
                            </a>
                          )}
                        </div>
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
              {services.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-ico">⚙️</div>
                  <div className="empty-title">No services listed yet</div>
                  <div className="empty-sub">This shop hasn&apos;t added any services yet. Contact the seller directly to ask about services.</div>
                  {shop?.whatsapp && (
                    <a href={whatsappLink(shop.whatsapp, shop.shop_name)} target="_blank" className="btn-solid" style={{ marginTop: "1.5rem", display: "inline-flex" }}>
                      💬 Ask Seller on WhatsApp
                    </a>
                  )}
                </div>
              ) : (
                <div className="services-grid">
                  {services.map(s => (
                    <div className="service-card" key={s.id}>
                      <div className="service-top">
                        <div className="service-icon">⚙️</div>
                        <div className="service-cat">{s.category}</div>
                      </div>
                      <div className="service-name">{s.name}</div>
                      {s.description && <div className="service-desc">{s.description}</div>}
                      <div className="service-price">
                        {s.price ? `From KSh ${s.price.toLocaleString()}` : "Price on request"}
                      </div>
                      <div className="product-actions" style={{ marginTop: "1rem" }}>
                        {shop?.phone && <a href={`tel:${shop.phone}`} className="pact-btn">📞 Call</a>}
                        {shop?.whatsapp && (
                          <a
                            href={`https://wa.me/${shop.whatsapp?.replace(/\D/g, "").replace(/^0/, "254")}?text=Hi, I'm interested in your ${s.name} service listed on Shoplace.`}
                            target="_blank"
                            className="pact-btn wa"
                          >
                            💬 WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
:root{--ink:#0d0d0d;--cream:#f5f0e8;--rust:#c84b31;--sage:#3d6b4f;--gold:#e8a020;--border:rgba(13,13,13,0.1);}
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

/* HERO */
.shop-hero{background:var(--ink);padding:6.5rem 4rem 2.5rem;margin-bottom:0;}
.shop-hero-inner{max-width:1100px;margin:0 auto;display:flex;align-items:flex-start;justify-content:space-between;gap:3rem;}
.shop-hero-left{display:flex;align-items:flex-start;gap:1.8rem;flex:1;}
.shop-avatar-lg{width:72px;height:72px;background:var(--rust);border-radius:18px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;color:white;flex-shrink:0;}
.shop-hero-num{font-size:0.7rem;font-weight:600;color:var(--gold);letter-spacing:0.1em;margin-bottom:0.4rem;}
.shop-hero-name{font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;color:white;letter-spacing:-0.03em;margin-bottom:0.6rem;}
.shop-hero-meta{display:flex;align-items:center;gap:0.6rem;font-size:0.82rem;color:rgba(255,255,255,0.4);flex-wrap:wrap;margin-bottom:0.8rem;}
.shop-hero-desc{font-size:0.88rem;color:rgba(255,255,255,0.38);line-height:1.7;max-width:500px;}

/* CONTACT CARD */
.shop-contact-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:1.5rem;min-width:240px;flex-shrink:0;}
.contact-title{font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1rem;}
.contact-btn-full{display:flex;align-items:center;gap:0.6rem;padding:0.7rem 1rem;border-radius:10px;font-size:0.85rem;font-weight:500;margin-bottom:0.6rem;transition:all .2s;cursor:pointer;}
.contact-btn-full.phone{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.1);}
.contact-btn-full.phone:hover{background:rgba(255,255,255,0.14);color:white;}
.contact-btn-full.whatsapp{background:rgba(37,211,102,0.1);color:#4ade80;border:1px solid rgba(37,211,102,0.2);}
.contact-btn-full.whatsapp:hover{background:rgba(37,211,102,0.18);}
.contact-btn-full.instagram{background:rgba(225,48,108,0.1);color:#f472b6;border:1px solid rgba(225,48,108,0.15);}
.contact-btn-full.instagram:hover{background:rgba(225,48,108,0.18);}
.shop-address{font-size:0.78rem;color:rgba(255,255,255,0.3);margin-top:0.5rem;line-height:1.5;}

/* CONTENT */
.shop-content{max-width:1100px;margin:0 auto;padding:2.5rem 4rem 4rem;}
.tabs-bar{display:flex;gap:0.5rem;margin-bottom:2rem;border-bottom:1px solid var(--border);padding-bottom:0;}
.tab-btn{padding:0.7rem 1.5rem;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:500;color:rgba(13,13,13,0.45);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .2s;}
.tab-btn:hover{color:var(--ink);}
.tab-btn.active{color:var(--rust);border-bottom-color:var(--rust);}

/* PRODUCTS GRID */
.products-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.3rem;}
.product-card{background:white;border-radius:18px;overflow:hidden;border:1px solid var(--border);transition:all .25s;}
.product-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,0.09);}
.product-img{height:190px;background:#e8ede9;display:flex;align-items:center;justify-content:center;font-size:3rem;overflow:hidden;}
.product-img img{width:100%;height:100%;object-fit:cover;}
.product-body{padding:1.1rem;}
.product-condition{font-size:0.68rem;font-weight:600;color:var(--sage);margin-bottom:0.3rem;}
.product-name{font-family:'Syne',sans-serif;font-size:0.92rem;font-weight:700;margin-bottom:0.4rem;line-height:1.3;}
.product-price-row{display:flex;align-items:center;gap:0.4rem;margin-bottom:0.4rem;}
.product-price{font-size:1rem;font-weight:700;color:var(--rust);}
.product-original{font-size:0.75rem;color:rgba(13,13,13,0.3);text-decoration:line-through;}
.product-discount{font-size:0.68rem;font-weight:600;background:rgba(200,75,49,0.1);color:var(--rust);padding:0.1rem 0.35rem;border-radius:4px;}
.product-desc{font-size:0.75rem;color:rgba(13,13,13,0.45);line-height:1.5;margin-bottom:0.7rem;}
.product-actions{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-top:0.6rem;}
.pact-btn{padding:0.5rem;border-radius:8px;font-size:0.76rem;font-weight:500;text-align:center;border:1.5px solid var(--border);color:rgba(13,13,13,0.55);transition:all .2s;display:flex;align-items:center;justify-content:center;gap:0.3rem;}
.pact-btn:hover{border-color:var(--sage);color:var(--sage);}
.pact-btn.wa{background:rgba(37,211,102,0.06);border-color:rgba(37,211,102,0.25);color:#128C7E;}
.pact-btn.wa:hover{background:rgba(37,211,102,0.12);}

/* SERVICES GRID */
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.3rem;}
.service-card{background:white;border-radius:18px;padding:1.6rem;border:1px solid var(--border);transition:all .25s;}
.service-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,0.07);}
.service-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.8rem;}
.service-icon{font-size:1.6rem;}
.service-cat{font-size:0.7rem;background:rgba(13,13,13,0.06);padding:0.2rem 0.6rem;border-radius:100px;color:rgba(13,13,13,0.45);font-weight:500;}
.service-name{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;margin-bottom:0.5rem;}
.service-desc{font-size:0.82rem;color:rgba(13,13,13,0.5);line-height:1.6;margin-bottom:0.6rem;}
.service-price{font-size:0.9rem;font-weight:600;color:var(--rust);}

/* EMPTY */
.empty-state{background:white;border-radius:18px;padding:5rem 2rem;text-align:center;border:1px solid var(--border);}
.empty-ico{font-size:2.5rem;margin-bottom:1rem;}
.empty-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;}
.empty-sub{font-size:0.85rem;color:rgba(13,13,13,0.42);line-height:1.6;max-width:380px;margin:0 auto;}

/* NOT FOUND */
.not-found{min-height:calc(100vh - 68px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4rem;}
.nf-icon{font-size:3rem;margin-bottom:1rem;}
.not-found h2{font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800;margin-bottom:0.6rem;}
.not-found p{font-size:0.88rem;color:rgba(13,13,13,0.45);margin-bottom:1.5rem;}
`;
