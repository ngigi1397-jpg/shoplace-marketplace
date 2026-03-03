"use client";

export default function CountiesPage() {
  return (
    <>
      <style>{css}</style>
      <div className="page">
        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <div className="sp-nav-actions">
            <a href="/products" className="btn-ghost">Browse Products</a>
            <a href="/shops" className="btn-ghost">Browse Shops</a>
          </div>
        </nav>

        <div className="content">
          <div className="coming-card">
            <div className="cs-icon">📍</div>
            <div className="cs-badge">Coming Soon</div>
            <h1>Browse by County</h1>
            <p>
              We are working on bringing you a full county-by-county directory of
              sellers and products from all 47 counties across Kenya.
            </p>
            <p className="cs-note">
              This feature will be available once we have enough sellers in each county.
              We will update it regularly as our community grows.
            </p>
            <div className="cs-counties">
              {["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Kisii","Thika","Nyeri","Machakos","Meru"].map(c => (
                <div className="cs-county-pill" key={c}>📍 {c}</div>
              ))}
              <div className="cs-county-pill muted">+ 37 more counties</div>
            </div>
            <div className="cs-actions">
              <a href="/shops" className="btn-solid">Browse All Shops →</a>
              <a href="/products" className="btn-ghost">Browse Products</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
:root{--ink:#0d0d0d;--cream:#f5f0e8;--rust:#c84b31;--border:rgba(13,13,13,0.1);}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);}
a{text-decoration:none;color:inherit;}
.sp-nav{position:fixed;top:0;width:100%;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1rem 4rem;background:rgba(245,240,232,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);}
.sp-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.5rem;letter-spacing:-0.04em;}
.sp-logo span{color:var(--rust);}
.sp-nav-actions{display:flex;gap:0.65rem;}
.btn-ghost{padding:0.45rem 1rem;border:1.5px solid rgba(13,13,13,0.25);border-radius:100px;font-size:0.82rem;font-weight:500;color:var(--ink);background:transparent;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-ghost:hover{background:var(--ink);color:var(--cream);}
.btn-solid{padding:0.65rem 1.5rem;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:600;background:var(--rust);color:white;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-solid:hover{background:#a83a22;transform:translateY(-1px);}
.page{min-height:100vh;background:var(--cream);}
.content{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:6rem 2rem 3rem;}
.coming-card{background:white;border-radius:28px;border:1px solid var(--border);padding:4rem 3.5rem;max-width:580px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.06);}
.cs-icon{font-size:3.5rem;margin-bottom:1.2rem;}
.cs-badge{display:inline-flex;padding:0.3rem 1rem;background:rgba(200,75,49,0.08);border:1px solid rgba(200,75,49,0.18);border-radius:100px;font-size:0.72rem;font-weight:700;color:var(--rust);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1.2rem;}
.coming-card h1{font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;letter-spacing:-0.03em;margin-bottom:1rem;}
.coming-card p{font-size:0.88rem;color:rgba(13,13,13,0.5);line-height:1.75;margin-bottom:0.8rem;max-width:420px;margin-left:auto;margin-right:auto;}
.cs-note{font-size:0.82rem!important;color:rgba(13,13,13,0.35)!important;font-style:italic;line-height:1.7;margin-bottom:2rem!important;}
.cs-counties{display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:center;margin-bottom:2.5rem;}
.cs-county-pill{padding:0.3rem 0.8rem;background:var(--cream);border:1px solid var(--border);border-radius:100px;font-size:0.75rem;color:rgba(13,13,13,0.5);}
.cs-county-pill.muted{color:rgba(13,13,13,0.3);border-style:dashed;}
.cs-actions{display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;}
`;