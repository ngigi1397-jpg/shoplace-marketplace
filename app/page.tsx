"use client";
import { useState } from "react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        :root {
          --ink: #0d0d0d;
          --cream: #f5f0e8;
          --rust: #c84b31;
          --gold: #e8a020;
          --sage: #3d6b4f;
          --mist: #e8ede9;
        }
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--ink); overflow-x: hidden; }

        .sp-nav {
          position: fixed; top: 0; width: 100%; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.2rem 4rem;
          background: rgba(245,240,232,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(13,13,13,0.08);
        }
        .sp-logo { font-family:'Syne',sans-serif; font-weight:800; font-size:1.6rem; letter-spacing:-0.04em; color:var(--ink); text-decoration:none; }
        .sp-logo span { color: var(--rust); }
        .sp-nav-links { display:flex; gap:2.5rem; list-style:none; }
        .sp-nav-links a { font-size:0.9rem; font-weight:500; color:var(--ink); text-decoration:none; opacity:0.7; transition:opacity 0.2s; }
        .sp-nav-links a:hover { opacity:1; }
        .sp-nav-actions { display:flex; gap:1rem; align-items:center; }
        .btn-ghost { padding:0.5rem 1.2rem; border:1.5px solid var(--ink); border-radius:100px; font-family:'DM Sans',sans-serif; font-size:0.85rem; font-weight:500; background:transparent; cursor:pointer; transition:all 0.2s; }
        .btn-ghost:hover { background:var(--ink); color:var(--cream); }
        .btn-solid { padding:0.55rem 1.4rem; border:none; border-radius:100px; font-family:'DM Sans',sans-serif; font-size:0.85rem; font-weight:500; background:var(--rust); color:white; cursor:pointer; transition:all 0.2s; }
        .btn-solid:hover { background:#a83a22; transform:translateY(-1px); }

        .sp-hero { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; padding-top:80px; overflow:hidden; }
        .hero-left { display:flex; flex-direction:column; justify-content:center; padding:6rem 4rem 4rem; }
        .hero-badge { display:inline-flex; align-items:center; gap:0.5rem; padding:0.4rem 1rem; background:var(--mist); border:1px solid rgba(61,107,79,0.2); border-radius:100px; font-size:0.78rem; font-weight:500; color:var(--sage); width:fit-content; margin-bottom:2rem; }
        .hero-badge::before { content:''; width:7px; height:7px; background:var(--sage); border-radius:50%; animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        .hero-left h1 { font-family:'Syne',sans-serif; font-size:clamp(3rem,5vw,4.8rem); font-weight:800; line-height:1.05; letter-spacing:-0.03em; margin-bottom:1.5rem; }
        .hero-left h1 em { font-style:normal; color:var(--rust); }
        .hero-sub { font-size:1.05rem; line-height:1.7; color:rgba(13,13,13,0.6); max-width:460px; margin-bottom:2.5rem; }
        .hero-search { display:flex; background:white; border:1.5px solid rgba(13,13,13,0.15); border-radius:14px; overflow:hidden; max-width:480px; box-shadow:0 4px 24px rgba(0,0,0,0.06); }
        .hero-search input { flex:1; padding:1rem 1.2rem; border:none; outline:none; font-family:'DM Sans',sans-serif; font-size:0.95rem; background:transparent; }
        .hero-search button { padding:0.8rem 1.4rem; margin:0.3rem; background:var(--rust); color:white; border:none; border-radius:10px; font-family:'DM Sans',sans-serif; font-weight:500; cursor:pointer; }
        .hero-stats { display:flex; gap:2.5rem; margin-top:3rem; }
        .stat-item h3 { font-family:'Syne',sans-serif; font-size:1.8rem; font-weight:800; letter-spacing:-0.03em; }
        .stat-item p { font-size:0.82rem; color:rgba(13,13,13,0.5); margin-top:0.1rem; }

        .hero-right { background:var(--ink); position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .hero-right::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 30% 70%, rgba(200,75,49,0.3), transparent 60%), radial-gradient(circle at 80% 20%, rgba(232,160,32,0.2), transparent 50%); }
        .hero-visual { position:relative; z-index:2; width:75%; max-width:360px; }
        .product-card-float { background:rgba(255,255,255,0.06); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:1.5rem; color:white; margin-bottom:1rem; animation:floatCard 6s ease-in-out infinite; }
        .product-card-float:nth-child(2) { animation-delay:-2s; margin-left:2rem; }
        .product-card-float:nth-child(3) { animation-delay:-4s; margin-left:1rem; }
        @keyframes floatCard { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        .float-tag { font-size:0.7rem; font-weight:500; opacity:0.5; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:0.4rem; }
        .float-name { font-family:'Syne',sans-serif; font-size:1rem; font-weight:700; margin-bottom:0.3rem; }
        .float-price { font-size:0.85rem; color:var(--gold); font-weight:500; }
        .float-shop { font-size:0.75rem; opacity:0.5; margin-top:0.3rem; }

        .sp-section { padding:6rem 4rem; }
        .section-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:3rem; }
        .section-title { font-family:'Syne',sans-serif; font-size:2.2rem; font-weight:800; letter-spacing:-0.03em; }
        .section-link { font-size:0.9rem; color:var(--rust); text-decoration:none; font-weight:500; }

        .categories-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:1rem; }
        .cat-card { background:white; border-radius:16px; padding:1.8rem 1.2rem; text-align:center; cursor:pointer; border:1.5px solid transparent; transition:all 0.25s; }
        .cat-card:hover { border-color:var(--rust); transform:translateY(-3px); box-shadow:0 8px 24px rgba(200,75,49,0.12); }
        .cat-icon { font-size:2.2rem; margin-bottom:0.8rem; }
        .cat-name { font-size:0.82rem; font-weight:500; }
        .cat-count { font-size:0.72rem; color:rgba(13,13,13,0.4); margin-top:0.2rem; }

        .products-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.5rem; }
        .product-card { background:white; border-radius:20px; overflow:hidden; cursor:pointer; transition:all 0.25s; border:1px solid rgba(13,13,13,0.06); }
        .product-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,0.1); }
        .product-img { height:200px; background:var(--mist); display:flex; align-items:center; justify-content:center; font-size:3.5rem; position:relative; }
        .product-badge { position:absolute; top:1rem; right:1rem; background:var(--rust); color:white; font-size:0.7rem; font-weight:600; padding:0.25rem 0.6rem; border-radius:100px; }
        .product-info { padding:1.2rem; }
        .product-shop { font-size:0.75rem; color:var(--sage); font-weight:500; margin-bottom:0.3rem; }
        .product-name { font-family:'Syne',sans-serif; font-size:1rem; font-weight:700; margin-bottom:0.5rem; }
        .product-price { font-size:1.1rem; font-weight:600; color:var(--rust); }
        .product-location { font-size:0.75rem; color:rgba(13,13,13,0.4); margin-top:0.4rem; }

        .shops-section { background:var(--ink); color:white; }
        .shops-section .section-title { color:white; }
        .shops-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
        .shop-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:2rem; transition:all 0.25s; cursor:pointer; }
        .shop-card:hover { background:rgba(255,255,255,0.09); border-color:var(--gold); }
        .shop-top { display:flex; align-items:center; gap:1rem; margin-bottom:1.2rem; }
        .shop-avatar { width:52px; height:52px; background:var(--rust); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; }
        .shop-number { font-size:0.72rem; color:var(--gold); font-weight:600; margin-bottom:0.2rem; }
        .shop-name { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:700; color:white; }
        .shop-county { font-size:0.78rem; color:rgba(255,255,255,0.4); }
        .shop-stats { display:flex; gap:1.5rem; }
        .shop-stat { font-size:0.8rem; color:rgba(255,255,255,0.5); }
        .shop-stat span { display:block; font-size:1.1rem; font-weight:700; color:white; font-family:'Syne',sans-serif; }

        .services-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
        .service-card { background:white; border-radius:20px; padding:2rem; border:1.5px solid rgba(13,13,13,0.08); transition:all 0.25s; cursor:pointer; }
        .service-card:hover { border-color:var(--sage); transform:translateY(-3px); box-shadow:0 12px 32px rgba(61,107,79,0.1); }
        .service-icon { font-size:2rem; margin-bottom:1rem; }
        .service-name { font-family:'Syne',sans-serif; font-size:1.05rem; font-weight:700; margin-bottom:0.5rem; }
        .service-desc { font-size:0.85rem; color:rgba(13,13,13,0.55); line-height:1.6; margin-bottom:1rem; }
        .service-price { font-size:0.9rem; font-weight:600; color:var(--sage); }
        .service-location { font-size:0.75rem; color:rgba(13,13,13,0.4); margin-top:0.3rem; }

        .seller-banner { background:linear-gradient(135deg,var(--rust),#a83a22); border-radius:24px; padding:3rem 4rem; display:flex; align-items:center; justify-content:space-between; margin:0 4rem 6rem; }
        .seller-banner h2 { font-family:'Syne',sans-serif; font-size:2rem; font-weight:800; color:white; letter-spacing:-0.03em; }
        .seller-banner p { font-size:0.95rem; color:rgba(255,255,255,0.7); margin-top:0.5rem; max-width:400px; line-height:1.6; }
        .btn-white { padding:0.9rem 2rem; background:white; color:var(--rust); border:none; border-radius:100px; font-family:'DM Sans',sans-serif; font-weight:600; font-size:0.9rem; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
        .btn-white:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.2); }

        footer { background:var(--ink); color:white; padding:4rem; }
        .footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:4rem; margin-bottom:3rem; }
        .footer-brand p { font-size:0.85rem; color:rgba(255,255,255,0.4); line-height:1.7; max-width:260px; margin-top:1rem; }
        .footer-col h4 { font-family:'Syne',sans-serif; font-size:0.85rem; font-weight:700; margin-bottom:1.2rem; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:0.08em; }
        .footer-col ul { list-style:none; }
        .footer-col li { margin-bottom:0.6rem; }
        .footer-col a { font-size:0.85rem; color:rgba(255,255,255,0.6); text-decoration:none; transition:color 0.2s; }
        .footer-col a:hover { color:white; }
        .footer-bottom { border-top:1px solid rgba(255,255,255,0.08); padding-top:2rem; display:flex; justify-content:space-between; align-items:center; }
        .footer-bottom p { font-size:0.8rem; color:rgba(255,255,255,0.3); }
      `}</style>

      {/* NAV */}
      <nav className="sp-nav">
        <a href="/" className="sp-logo">Sho<span>place</span></a>
        <ul className="sp-nav-links">
          <li><a href="/products">Browse</a></li>
          <li><a href="/services">Services</a></li>
          <li><a href="/shops">Shops</a></li>
          <li><a href="/counties">Counties</a></li>
        </ul>
        <div className="sp-nav-actions">
          <button className="btn-ghost" onClick={() => window.location.href = "/auth/login"}>Login</button>
          <button className="btn-solid" onClick={() => window.location.href = "/seller/register"}>Open Shop</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="sp-hero">
        <div className="hero-left">
          <div className="hero-badge">Kenya&apos;s Local Marketplace</div>
          <h1>Shop <em>local.</em><br />Sell anywhere.</h1>
          <p className="hero-sub">Discover products and services from verified sellers across all 47 counties. From Nairobi to Mombasa — your community marketplace.</p>
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
          <div className="hero-stats">
            <div className="stat-item"><h3>12K+</h3><p>Active Sellers</p></div>
            <div className="stat-item"><h3>47</h3><p>Counties</p></div>
            <div className="stat-item"><h3>80K+</h3><p>Listings</p></div>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-visual">
            <div className="product-card-float">
              <div className="float-tag">Electronics</div>
              <div className="float-name">Samsung Galaxy A54</div>
              <div className="float-price">KSh 42,000</div>
              <div className="float-shop">TechHub Nairobi · Shop #00124</div>
            </div>
            <div className="product-card-float">
              <div className="float-tag">Fashion</div>
              <div className="float-name">African Print Dress</div>
              <div className="float-price">KSh 3,500</div>
              <div className="float-shop">Mama Zawadi · Shop #00089</div>
            </div>
            <div className="product-card-float">
              <div className="float-tag">Service</div>
              <div className="float-name">Home Plumbing Repair</div>
              <div className="float-price">From KSh 800</div>
              <div className="float-shop">ProFix Kenya · Shop #00347</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="sp-section">
        <div className="section-header">
          <h2 className="section-title">Browse Categories</h2>
          <a href="/products" className="section-link">View all →</a>
        </div>
        <div className="categories-grid">
          {[
            { icon: "📱", name: "Electronics", count: "14,200 items" },
            { icon: "👗", name: "Fashion", count: "28,500 items" },
            { icon: "🏠", name: "Home & Living", count: "9,800 items" },
            { icon: "🌾", name: "Agriculture", count: "6,400 items" },
            { icon: "🔧", name: "Services", count: "11,000+" },
            { icon: "🍎", name: "Food & Groceries", count: "7,200 items" },
          ].map((cat) => (
            <div className="cat-card" key={cat.name} onClick={() => window.location.assign(`/products?category=${cat.name}`)}>
              <div className="cat-icon">{cat.icon}</div>
              <div className="cat-name">{cat.name}</div>
              <div className="cat-count">{cat.count}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="sp-section" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <a href="/products" className="section-link">View all →</a>
        </div>
        <div className="products-grid">
          {[
            { emoji: "📱", badge: "New", shop: "TechHub Nairobi", name: "iPhone 13 Pro Max", price: "KSh 98,000", location: "Westlands, Nairobi" },
            { emoji: "👟", badge: null, shop: "SneakerVault", name: "Nike Air Max 270", price: "KSh 12,500", location: "CBD, Nairobi" },
            { emoji: "🛋️", badge: "Sale", shop: "FurniCraft Kenya", name: "3-Seater L-Shaped Sofa", price: "KSh 38,000", location: "Industrial Area, Nairobi" },
            { emoji: "🌱", badge: null, shop: "AgriDirect Farm", name: "Organic Avocados (10kg)", price: "KSh 800", location: "Murang'a County" },
          ].map((p) => (
            <div className="product-card" key={p.name}>
              <div className="product-img">
                {p.emoji}
                {p.badge && <div className="product-badge">{p.badge}</div>}
              </div>
              <div className="product-info">
                <div className="product-shop">{p.shop}</div>
                <div className="product-name">{p.name}</div>
                <div className="product-price">{p.price}</div>
                <div className="product-location">📍 {p.location}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOP SHOPS */}
      <section className="sp-section shops-section">
        <div className="section-header">
          <h2 className="section-title">Top Shops</h2>
          <a href="/shops" style={{ color: "var(--gold)", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none" }}>Browse all shops →</a>
        </div>
        <div className="shops-grid">
          {[
            { avatar: "🖥️", bg: "var(--rust)", num: "#00124", name: "TechHub Nairobi", loc: "Nairobi · Westlands", products: 247, rating: "4.9★", sales: "3.2K" },
            { avatar: "👗", bg: "var(--sage)", num: "#00089", name: "Mama Zawadi Fashions", loc: "Mombasa · Nyali", products: 89, rating: "4.8★", sales: "1.8K" },
            { avatar: "🔧", bg: "var(--gold)", num: "#00347", name: "ProFix Kenya", loc: "Kisumu · Milimani", products: 12, rating: "4.7★", sales: "920" },
          ].map((s) => (
            <div className="shop-card" key={s.num} onClick={() => window.location.assign(`/shops/${s.num}`)}>
              <div className="shop-top">
                <div className="shop-avatar" style={{ background: s.bg }}>{s.avatar}</div>
                <div>
                  <div className="shop-number">SHOP {s.num}</div>
                  <div className="shop-name">{s.name}</div>
                  <div className="shop-county">{s.loc}</div>
                </div>
              </div>
              <div className="shop-stats">
                <div className="shop-stat"><span>{s.products}</span>Products</div>
                <div className="shop-stat"><span>{s.rating}</span>Rating</div>
                <div className="shop-stat"><span>{s.sales}</span>Sales</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED SERVICES */}
      <section className="sp-section">
        <div className="section-header">
          <h2 className="section-title">Featured Services</h2>
          <a href="/services" className="section-link">View all →</a>
        </div>
        <div className="services-grid">
          {[
            { icon: "🔧", name: "Home Plumbing Repair", desc: "Expert plumbing services for leaks, pipes, and bathroom fittings. Same-day service available.", price: "From KSh 800 / visit", loc: "Nairobi County" },
            { icon: "💻", name: "Website Design & Dev", desc: "Professional websites for businesses. E-commerce, landing pages, and custom web apps.", price: "From KSh 15,000 / project", loc: "Nairobi · Remote" },
            { icon: "🚚", name: "Furniture Delivery & Moving", desc: "Safe, insured moving services within Nairobi and nationwide for large items and full homes.", price: "From KSh 2,500 / move", loc: "Nationwide" },
          ].map((sv) => (
            <div className="service-card" key={sv.name}>
              <div className="service-icon">{sv.icon}</div>
              <div className="service-name">{sv.name}</div>
              <div className="service-desc">{sv.desc}</div>
              <div className="service-price">{sv.price}</div>
              <div className="service-location">📍 {sv.loc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SELLER BANNER */}
      <div className="seller-banner">
        <div>
          <h2>Ready to start selling?</h2>
          <p>Join thousands of sellers across Kenya. Get your unique shop number, list your products and services, and reach buyers in your county and beyond.</p>
        </div>
        <button className="btn-white" onClick={() => window.location.href = "/seller/register"}>Open Your Shop Today →</button>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="sp-logo">Sho<span>place</span></a>
            <p>Kenya&apos;s trusted local marketplace connecting buyers, sellers, and service providers across all 47 counties.</p>
          </div>
          <div className="footer-col">
            <h4>Marketplace</h4>
            <ul>
              <li><a href="/products">Browse Products</a></li>
              <li><a href="/services">Browse Services</a></li>
              <li><a href="/shops">Find Shops</a></li>
              <li><a href="/counties">By County</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Sellers</h4>
            <ul>
              <li><a href="/seller/register">Open a Shop</a></li>
              <li><a href="/seller/guide">Seller Guide</a></li>
              <li><a href="/seller/dashboard">Seller Dashboard</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="/help">Help Center</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Shoplace. All rights reserved.</p>
          <p>Built with ❤️ for Kenya</p>
        </div>
      </footer>
    </>
  );
}