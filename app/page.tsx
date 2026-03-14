"use client";

import { useState, useEffect } from "react";
import { createClient, User } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type UserRole = "buyer" | "seller" | "admin" | null;

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: prof } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single<{ role: UserRole }>();
        setRole(prof?.role ?? null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  const goToShops = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = user ? "/shops" : "/auth/login?redirect=/shops";
  };

  const goToCategory = (slug: string) => {
    window.location.href = user
      ? `/products?category=${slug}`
      : `/auth/login?redirect=/products?category=${slug}`;
  };

  const categories = [
    { icon: "📱", name: "Electronics", slug: "electronics" },
    { icon: "👗", name: "Fashion", slug: "fashion" },
    { icon: "🏠", name: "Home & Living", slug: "home" },
    { icon: "🌾", name: "Agriculture", slug: "agriculture" },
    { icon: "🔧", name: "Services", slug: "services" },
    { icon: "🍎", name: "Food & Groceries", slug: "food" },
  ];

  const howCards = [
    { n: "01", icon: "👤", title: "Create Account", desc: "Sign up free. Choose your county and constituency to connect with local sellers.", link: "/get-started", label: "Sign up →" },
    { n: "02", icon: "🔍", title: "Browse & Discover", desc: "Search products and services from verified shops near you. Filter by county or category.", link: "/products", label: "Browse →" },
    { n: "03", icon: "🏪", title: "Open Your Shop", desc: "Sellers get a unique shop number. List products and services, reach buyers across Kenya.", link: "/seller/register", label: "Sell now →" },
    { n: "04", icon: "🤝", title: "Connect & Trade", desc: "Contact sellers directly. Build trust through verified profiles and honest reviews.", link: "#", label: "Learn more →" },
  ];

  const heroCards = [
    { icon: "🛍️", title: "Buy from local sellers", sub: "Browse thousands of products from verified shops across Kenya" },
    { icon: "🏪", title: "Open your own shop", sub: "Get a unique shop number and start selling to buyers in your county" },
    { icon: "⚙️", title: "Offer your services", sub: "List plumbing, design, delivery and any skill — reach local clients" },
  ];

  return (
    <>
      <style>{css}</style>

      {/* DESKTOP NAV */}
      <nav className="sp-nav">
        <a href="/" className="sp-logo">Sho<span>place</span></a>
        <ul className="sp-nav-links">
          <li><a href="/products">Browse</a></li>
          <li><a href="/services">Services</a></li>
          <li><a href="#" onClick={goToShops}>Shops</a></li>
          <li><a href="/counties">Counties</a></li>
        </ul>
        <div className="sp-nav-actions">
          {loading ? (
            <div className="nav-skeleton" />
          ) : user ? (
            <>
              <span className="nav-hi">Hi, {user.email?.split("@")[0]} 👋</span>
              <a href={role === "buyer" ? "/buyer/saved" : "/seller/dashboard"} className="btn-ghost">
                {role === "buyer" ? "My Saved" : "My Shop"}
              </a>
              <button className="btn-rust-outline" onClick={handleSignOut}>Sign Out</button>
            </>
          ) : (
            <>
              <a href="/auth/login" className="btn-ghost">Login</a>
              <a href="/get-started" className="btn-solid">Get Started</a>
            </>
          )}
        </div>
      </nav>

      {/* MOBILE TOP BAR */}
      <div className="mobile-topbar">
        <a href="/" className="sp-logo">Sho<span>place</span></a>
        <div className="mobile-topbar-actions">
          {loading ? <div className="nav-skeleton-sm" /> : user ? (
            <>
              <span className="mobile-hi">Hi, {user.email?.split("@")[0]} 👋</span>
              <button className="mobile-signout" onClick={handleSignOut}>Sign Out</button>
            </>
          ) : (
            <a href="/auth/login" className="btn-solid" style={{fontSize:"0.78rem",padding:"0.42rem 1rem"}}>Sign In</a>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-bottom-nav">
        <a href="/" className="mbn-item active"><span>🏠</span><span>Home</span></a>
        <a href="/products" className="mbn-item"><span>📦</span><span>Browse</span></a>
        <a href="/services" className="mbn-item"><span>⚙️</span><span>Services</span></a>
        <a href="/shops" className="mbn-item"><span>🏬</span><span>Shops</span></a>
        {user ? (
          role === "seller" ? (
            <a href="/seller/dashboard" className="mbn-item mbn-highlight"><span>🏪</span><span>My Shop</span></a>
          ) : (
            <a href="/buyer/saved" className="mbn-item mbn-highlight"><span>❤️</span><span>My Saved</span></a>
          )
        ) : (
          <a href="/auth/login" className="mbn-item mbn-highlight"><span>👤</span><span>Sign In</span></a>
        )}
      </nav>

      {/* HERO */}
      <section className="sp-hero">
        <div className="hero-left">
          <div className="hero-badge">Kenya&apos;s Local Marketplace</div>
          <h1>Shop <em>local.</em><br />Sell anywhere.</h1>
          <p className="hero-sub">
            Discover products and services from verified sellers across all 47 counties. Sign in to browse shops, contact sellers, and start trading.
          </p>
          <div className="hero-search">
            <input
              type="text"
              placeholder="Search products, shops, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && window.location.assign(`/search?q=${searchQuery}`)}
            />
            <button onClick={() => window.location.assign(`/search?q=${searchQuery}`)}>Search</button>
          </div>
          <div className="hero-btns">
            {!user && <a href="/get-started" className="btn-solid btn-lg">Join Free →</a>}
            <a href="/products" className="btn-ghost btn-lg">Browse Products</a>
          </div>
          <div className="hero-stats">
            <div className="stat-item"><h3>47</h3><p>Counties</p></div>
            <div className="stat-item"><h3>Free</h3><p>To Join</p></div>
            <div className="stat-item"><h3>🔒</h3><p>Verified Sellers</p></div>
          </div>

        </div>
        <div className="hero-right">
          <div className="hero-cards">
            {heroCards.map((c, i) => (
              <div className="h-card" key={i} style={{ animationDelay: `${-i * 2}s`, marginLeft: i === 1 ? "1.5rem" : i === 2 ? "0.75rem" : "0" }}>
                <span className="h-card-icon">{c.icon}</span>
                <div>
                  <div className="h-card-title">{c.title}</div>
                  <div className="h-card-sub">{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="sp-section white-section">
        <div className="sec-head center">
          <h2 className="sec-title">How Shoplace Works</h2>
          <p className="sec-sub">Simple steps to start buying or selling today</p>
        </div>
        <div className="how-grid">
          {howCards.map((h) => (
            <div className="how-card" key={h.n}>
              <div className="how-n">{h.n}</div>
              <div className="how-ico">{h.icon}</div>
              <div className="how-title">{h.title}</div>
              <div className="how-desc">{h.desc}</div>
              <a href={h.link} className="how-lnk">{h.label}</a>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="sp-section">
        <div className="sec-head">
          <h2 className="sec-title">Browse Categories</h2>
          <a href="/products" className="sec-link">View all →</a>
        </div>
        <div className="cat-grid">
          {categories.map((c) => (
            <div className="cat-card" key={c.name} onClick={() => goToCategory(c.slug)}>
              <div className="cat-ico">{c.icon}</div>
              <div className="cat-name">{c.name}</div>
              {!user && <div className="cat-lock">🔒 Login to browse</div>}
            </div>
          ))}
        </div>
      </section>

      {/* LOGIN GATE */}
      {!user && !loading && (
        <section className="gate-section">
          <div className="gate-card">
            <div className="gate-ico">🔒</div>
            <h2>Sign in to browse shops &amp; products</h2>
            <p>Create a free account to view sellers, browse all products, contact shops, and access every marketplace feature.</p>
            <div className="gate-btns">
              <a href="/get-started" className="btn-solid btn-lg">Create Free Account</a>
              <a href="/auth/login" className="btn-ghost-white btn-lg">I already have an account</a>
            </div>
            <div className="gate-perks">
              <span>✓ Browse all products</span>
              <span>✓ Contact sellers directly</span>
              <span>✓ Open your own shop</span>
              <span>✓ 100% free forever</span>
            </div>
          </div>
        </section>
      )}

      {/* SELLER BANNER */}
      <div className="sell-banner">
        <div>
          <h2>Ready to start selling?</h2>
          <p>Get your unique shop number, list your products and services, and reach buyers across Kenya. Free to start.</p>
        </div>
        <a href={user ? "/seller/register" : "/get-started"} className="btn-white">Open Your Shop Today →</a>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="foot-grid">
          <div className="foot-brand">
            <a href="/" className="sp-logo">Sho<span>place</span></a>
            <p>Kenya&apos;s trusted local marketplace connecting buyers, sellers, and service providers across all 47 counties.</p>
          </div>
          <div className="foot-col">
            <h4>Marketplace</h4>
            <ul>
              <li><a href="/products">Browse Products</a></li>
              <li><a href="/services">Browse Services</a></li>
              <li><a href="#" onClick={goToShops}>Find Shops</a></li>
              <li><a href="/counties">By County</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>Sellers</h4>
            <ul>
              <li><a href={user ? "/seller/register" : "/get-started"}>Open a Shop</a></li>
              <li><a href="/seller/guide">Seller Guide</a></li>
              <li><a href={user ? (role === "buyer" ? "/buyer/saved" : "/seller/dashboard") : "/auth/login"}>{role === "buyer" ? "My Dashboard" : "Seller Dashboard"}</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>Support</h4>
            <ul>
              <li><a href="/help">Help Center: shoplacekenya@gmail.com</a></li>
              <li><a href="/contact">Contact Us: shoplacekenya@gmail.com</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <p>© 2025 Shoplace. All rights reserved.</p>
          <p>❤️ for Kenya</p>
        </div>
      </footer>

      <div className="mobile-bottom-spacer" />

    
    </>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
:root{--ink:#0d0d0d;--cream:#f5f0e8;--rust:#c84b31;--gold:#e8a020;--sage:#3d6b4f;--mist:#e8ede9;}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);overflow-x:hidden;}
a{text-decoration:none;}

/* DESKTOP NAV */
.sp-nav{position:fixed;top:0;width:100%;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.1rem 4rem;background:rgba(245,240,232,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(13,13,13,0.08);}
.sp-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.5rem;letter-spacing:-0.04em;color:var(--ink);}
.sp-logo span{color:var(--rust);}
.sp-nav-links{display:flex;gap:2rem;list-style:none;}
.sp-nav-links a{font-size:0.88rem;font-weight:500;color:var(--ink);opacity:0.65;transition:opacity 0.2s;}
.sp-nav-links a:hover{opacity:1;}
.sp-nav-actions{display:flex;gap:0.65rem;align-items:center;}
.nav-hi{font-size:0.83rem;color:var(--sage);font-weight:500;}
.nav-skeleton{width:160px;height:34px;background:rgba(13,13,13,0.07);border-radius:100px;animation:pulse 1.5s infinite;}
.nav-skeleton-sm{width:60px;height:28px;background:rgba(13,13,13,0.07);border-radius:100px;animation:pulse 1.5s infinite;}
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}

/* MOBILE TOP BAR */
.mobile-topbar{display:none;position:fixed;top:0;left:0;right:0;z-index:100;padding:0.8rem 1.2rem;background:rgba(245,240,232,0.97);backdrop-filter:blur(12px);border-bottom:1px solid rgba(13,13,13,0.08);align-items:center;justify-content:space-between;}
.mobile-topbar-actions{display:flex;align-items:center;gap:0.5rem;}
.mobile-hi{font-size:0.75rem;color:var(--sage);font-weight:500;}
.mobile-signout{background:none;border:1.5px solid var(--rust);border-radius:100px;padding:0.3rem 0.7rem;font-size:0.72rem;font-weight:600;color:var(--rust);cursor:pointer;font-family:'DM Sans',sans-serif;}

/* MOBILE BOTTOM NAV */
.mobile-bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:100;background:white;border-top:1px solid rgba(13,13,13,0.1);padding:0.5rem 0 0.8rem;box-shadow:0 -4px 20px rgba(0,0,0,0.08);}
.mbn-item{display:flex;flex-direction:column;align-items:center;gap:0.2rem;font-size:0.65rem;font-weight:600;color:rgba(13,13,13,0.4);text-decoration:none;flex:1;padding:0.3rem 0;transition:color 0.2s;}
.mbn-item span:first-child{font-size:1.3rem;}
.mbn-item.active{color:var(--rust);}
.mbn-item.mbn-highlight{color:var(--rust);}
.mbn-item:hover{color:var(--rust);}
.mobile-bottom-spacer{display:none;height:70px;}

/* BUTTONS */
.btn-ghost{padding:0.48rem 1.1rem;border:1.5px solid rgba(13,13,13,0.3);border-radius:100px;font-size:0.83rem;font-weight:500;color:var(--ink);background:transparent;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-ghost:hover{background:var(--ink);color:var(--cream);border-color:var(--ink);}
.btn-solid{padding:0.5rem 1.3rem;border:none;border-radius:100px;font-size:0.83rem;font-weight:500;background:var(--rust);color:white;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-solid:hover{background:#a83a22;transform:translateY(-1px);}
.btn-rust-outline{padding:0.48rem 1.1rem;border:1.5px solid var(--rust);border-radius:100px;font-size:0.83rem;font-weight:500;background:transparent;color:var(--rust);cursor:pointer;transition:all .2s;}
.btn-rust-outline:hover{background:var(--rust);color:white;}
.btn-lg{padding:.75rem 1.7rem!important;font-size:.93rem!important;}
.btn-white{padding:.85rem 2rem;background:white;color:var(--rust);border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.9rem;cursor:pointer;transition:all .2s;white-space:nowrap;display:inline-flex;align-items:center;}
.btn-white:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.2);}
.btn-ghost-white{padding:.75rem 1.7rem;border:1.5px solid rgba(255,255,255,.25);border-radius:100px;font-size:.93rem;font-weight:500;color:white;background:transparent;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-ghost-white:hover{background:rgba(255,255,255,.1);}

/* HERO */
.sp-hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;padding-top:76px;overflow:hidden;}
.hero-left{display:flex;flex-direction:column;justify-content:center;padding:5rem 4rem 4rem;}
.hero-badge{display:inline-flex;align-items:center;gap:.5rem;padding:.35rem 1rem;background:var(--mist);border:1px solid rgba(61,107,79,.2);border-radius:100px;font-size:.76rem;font-weight:500;color:var(--sage);width:fit-content;margin-bottom:1.8rem;}
.hero-badge::before{content:'';width:6px;height:6px;background:var(--sage);border-radius:50%;animation:dot 2s infinite;}
@keyframes dot{0%,100%{opacity:1}50%{opacity:.4}}
.hero-left h1{font-family:'Syne',sans-serif;font-size:clamp(2.8rem,4.5vw,4.5rem);font-weight:800;line-height:1.05;letter-spacing:-.03em;margin-bottom:1.2rem;}
.hero-left h1 em{font-style:normal;color:var(--rust);}
.hero-sub{font-size:1rem;line-height:1.7;color:rgba(13,13,13,.58);max-width:440px;margin-bottom:1.5rem;}
.hero-search{display:flex;background:white;border:1.5px solid rgba(13,13,13,.12);border-radius:13px;overflow:hidden;max-width:460px;box-shadow:0 4px 20px rgba(0,0,0,.06);margin-bottom:1.4rem;}
.hero-search input{flex:1;padding:.9rem 1.1rem;border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:.93rem;background:transparent;}
.hero-search button{padding:.75rem 1.3rem;margin:.28rem;background:var(--rust);color:white;border:none;border-radius:9px;font-weight:500;cursor:pointer;font-size:.85rem;}
.hero-btns{display:flex;gap:.7rem;margin-bottom:2.2rem;flex-wrap:wrap;}
.hero-stats{display:flex;gap:2.2rem;margin-bottom:2rem;}
.stat-item h3{font-family:'Syne',sans-serif;font-size:1.7rem;font-weight:800;letter-spacing:-.03em;}
.stat-item p{font-size:.8rem;color:rgba(13,13,13,.45);margin-top:.1rem;}

.hero-right{background:var(--ink);position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;}
.hero-right::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 70%,rgba(200,75,49,.3),transparent 60%),radial-gradient(circle at 80% 20%,rgba(232,160,32,.2),transparent 50%);}
.hero-cards{position:relative;z-index:2;width:80%;max-width:370px;display:flex;flex-direction:column;gap:.9rem;}
.h-card{background:rgba(255,255,255,.07);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.11);border-radius:16px;padding:1.2rem 1.3rem;color:white;display:flex;align-items:flex-start;gap:.9rem;animation:float 6s ease-in-out infinite;}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.h-card-icon{font-size:1.6rem;flex-shrink:0;}
.h-card-title{font-family:'Syne',sans-serif;font-size:.9rem;font-weight:700;margin-bottom:.25rem;}
.h-card-sub{font-size:.75rem;opacity:.45;line-height:1.5;}

/* SECTIONS */
.sp-section{padding:5.5rem 4rem;}
.white-section{background:white;}
.sec-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:2.5rem;}
.sec-head.center{display:block;text-align:center;margin-bottom:3rem;}
.sec-title{font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;letter-spacing:-.03em;}
.sec-sub{font-size:.9rem;color:rgba(13,13,13,.48);margin-top:.4rem;}
.sec-link{font-size:.88rem;color:var(--rust);font-weight:500;}

/* HOW IT WORKS */
.how-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.3rem;}
.how-card{padding:1.8rem 1.4rem;border:1.5px solid rgba(13,13,13,.08);border-radius:18px;transition:all .25s;}
.how-card:hover{border-color:var(--rust);transform:translateY(-3px);box-shadow:0 10px 28px rgba(200,75,49,.08);}
.how-n{font-family:'Syne',sans-serif;font-size:.68rem;font-weight:800;color:rgba(13,13,13,.18);letter-spacing:.1em;margin-bottom:.8rem;}
.how-ico{font-size:1.8rem;margin-bottom:.7rem;}
.how-title{font-family:'Syne',sans-serif;font-size:.95rem;font-weight:700;margin-bottom:.5rem;}
.how-desc{font-size:.8rem;color:rgba(13,13,13,.52);line-height:1.6;margin-bottom:.9rem;}
.how-lnk{font-size:.8rem;color:var(--rust);font-weight:600;}

/* CATEGORIES */
.cat-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:.9rem;}
.cat-card{background:white;border-radius:14px;padding:1.6rem .9rem;text-align:center;cursor:pointer;border:1.5px solid transparent;transition:all .25s;}
.cat-card:hover{border-color:var(--rust);transform:translateY(-3px);box-shadow:0 8px 22px rgba(200,75,49,.1);}
.cat-ico{font-size:2rem;margin-bottom:.7rem;}
.cat-name{font-size:.8rem;font-weight:500;}
.cat-lock{font-size:.66rem;color:rgba(13,13,13,.3);margin-top:.35rem;}

/* LOGIN GATE */
.gate-section{padding:1rem 4rem 5.5rem;}
.gate-card{background:var(--ink);color:white;border-radius:22px;padding:3.5rem 3rem;text-align:center;max-width:660px;margin:0 auto;}
.gate-ico{font-size:2.8rem;margin-bottom:1.2rem;}
.gate-card h2{font-family:'Syne',sans-serif;font-size:1.65rem;font-weight:800;letter-spacing:-.02em;margin-bottom:.8rem;}
.gate-card p{font-size:.9rem;color:rgba(255,255,255,.45);line-height:1.7;max-width:440px;margin:0 auto 1.8rem;}
.gate-btns{display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap;margin-bottom:1.8rem;}
.gate-perks{display:flex;gap:1.2rem;justify-content:center;flex-wrap:wrap;}
.gate-perks span{font-size:.78rem;color:rgba(255,255,255,.35);}

/* SELL BANNER */
.sell-banner{background:linear-gradient(135deg,var(--rust),#a83a22);border-radius:22px;padding:2.8rem 3.5rem;display:flex;align-items:center;justify-content:space-between;margin:0 4rem 5.5rem;gap:2rem;}
.sell-banner h2{font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;color:white;letter-spacing:-.03em;}
.sell-banner p{font-size:.9rem;color:rgba(255,255,255,.65);margin-top:.45rem;max-width:400px;line-height:1.6;}

/* FOOTER */
footer{background:var(--ink);color:white;padding:4rem;}
.foot-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3.5rem;margin-bottom:2.5rem;}
.foot-brand p{font-size:.83rem;color:rgba(255,255,255,.38);line-height:1.7;max-width:250px;margin-top:.9rem;}
.foot-col h4{font-family:'Syne',sans-serif;font-size:.8rem;font-weight:700;margin-bottom:1.1rem;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.08em;}
.foot-col ul{list-style:none;}
.foot-col li{margin-bottom:.55rem;}
.foot-col a{font-size:.83rem;color:rgba(255,255,255,.55);transition:color .2s;}
.foot-col a:hover{color:white;}
.foot-bottom{border-top:1px solid rgba(255,255,255,.07);padding-top:1.8rem;display:flex;justify-content:space-between;align-items:center;}
.foot-bottom p{font-size:.78rem;color:rgba(255,255,255,.28);}

/* MOBILE */
@media(max-width:768px){
  .sp-nav{display:none;}
  .mobile-topbar{display:flex;}
  .mobile-bottom-nav{display:flex;}
  .mobile-bottom-spacer{display:block;}
  .sp-hero{grid-template-columns:1fr;min-height:auto;padding-top:60px;}
  .hero-left{padding:2.5rem 1.2rem 2rem;}
  .hero-left h1{font-size:2rem;}
  .hero-sub{font-size:0.88rem;}
  .hero-right{display:none;}
  .hero-search{max-width:100%;}
  .hero-btns{flex-wrap:wrap;}
  .hero-stats{gap:1.2rem;}
  .shopi-teaser{max-width:100%;}
  .how-grid{grid-template-columns:1fr;gap:1rem;}
  .cat-grid{grid-template-columns:repeat(3,1fr);}
  .sell-banner{flex-direction:column;text-align:center;padding:2rem 1.2rem;gap:1.2rem;margin:0 1.2rem 3rem;}
  .foot-grid{grid-template-columns:repeat(2,1fr);gap:1.5rem;}
  section{padding:3rem 1.2rem!important;}
  .gate-section{padding:1rem 1.2rem 3rem!important;}
}
@media(max-width:480px){
  .hero-left{padding:2rem 1rem 1.5rem;}
  .hero-left h1{font-size:1.7rem;}
  .cat-grid{grid-template-columns:repeat(2,1fr);}
  .foot-grid{grid-template-columns:1fr;}
  .hero-stats{flex-direction:column;gap:0.8rem;}
}
`;