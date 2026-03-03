"use client";
import { useState } from "react";

export default function GetStartedPage() {
  const [selected, setSelected] = useState<"buyer" | "seller" | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    window.location.href = `/auth/signup?role=${selected}`;
  };

  return (
    <>
      <style>{css}</style>
      <div className="page">

        {/* NAV */}
        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <div className="sp-nav-actions">
            <a href="/auth/login" className="btn-ghost">Already have an account? Login →</a>
          </div>
        </nav>

        <div className="page-content">
          <div className="gs-header">
            <div className="gs-badge">Join Shoplace</div>
            <h1>How do you want to<br />use Shoplace?</h1>
            <p>Choose your account type to get started. You can always switch later.</p>
          </div>

          <div className="options-grid">

            {/* BUYER */}
            <div
              className={`option-card ${selected === "buyer" ? "selected" : ""}`}
              onClick={() => setSelected("buyer")}
            >
              <div className="option-check">{selected === "buyer" ? "✓" : ""}</div>
              <div className="option-icon">🛍️</div>
              <div className="option-title">I want to Buy</div>
              <div className="option-sub">Browse products and services from verified sellers across Kenya</div>
              <ul className="option-perks">
                <li>✓ Browse thousands of products</li>
                <li>✓ Find services near you</li>
                <li>✓ Contact sellers directly</li>
                <li>✓ Shop from all 47 counties</li>
              </ul>
              <div className="option-cta">Create Buyer Account</div>
            </div>

            {/* SELLER */}
            <div
              className={`option-card ${selected === "seller" ? "selected" : ""}`}
              onClick={() => setSelected("seller")}
            >
              <div className="option-check">{selected === "seller" ? "✓" : ""}</div>
              <div className="option-icon">🏪</div>
              <div className="option-title">I want to Sell</div>
              <div className="option-sub">Open a shop, list products and services, reach buyers across Kenya</div>
              <ul className="option-perks">
                <li>✓ Get a unique shop number</li>
                <li>✓ List unlimited products</li>
                <li>✓ Offer your services</li>
                <li>✓ Reach buyers in your county</li>
              </ul>
              <div className="option-cta">Create Seller Account</div>
            </div>

          </div>

          {/* CONTINUE BUTTON */}
          <div className="gs-footer">
            <button
              className={`btn-continue ${selected ? "active" : ""}`}
              onClick={handleContinue}
              disabled={!selected}
            >
              {selected
                ? `Continue as ${selected === "buyer" ? "Buyer" : "Seller"} →`
                : "Select an option above to continue"}
            </button>
            <p className="gs-note">
              Already have an account? <a href="/auth/login">Sign in here →</a>
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="gs-bottom">
          <p>Free to join · No credit card required · Kenya&apos;s local marketplace</p>
        </div>
      </div>
    </>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
:root{--ink:#0d0d0d;--cream:#f5f0e8;--rust:#c84b31;--sage:#3d6b4f;--mist:#e8ede9;--border:rgba(13,13,13,0.1);}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);}
a{text-decoration:none;color:inherit;}

/* NAV */
.sp-nav{position:fixed;top:0;width:100%;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.1rem 4rem;background:rgba(245,240,232,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);}
.sp-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.5rem;letter-spacing:-0.04em;color:var(--ink);}
.sp-logo span{color:var(--rust);}
.sp-nav-actions{display:flex;gap:0.65rem;align-items:center;}
.btn-ghost{padding:0.45rem 1rem;border:1.5px solid rgba(13,13,13,0.25);border-radius:100px;font-size:0.82rem;font-weight:500;color:var(--ink);background:transparent;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-ghost:hover{background:var(--ink);color:var(--cream);}

/* PAGE */
.page{min-height:100vh;background:var(--cream);display:flex;flex-direction:column;}
.page-content{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8rem 4rem 4rem;}

/* HEADER */
.gs-header{text-align:center;margin-bottom:3rem;}
.gs-badge{display:inline-flex;padding:0.3rem 1rem;background:var(--mist);border:1px solid rgba(61,107,79,0.2);border-radius:100px;font-size:0.75rem;font-weight:600;color:var(--sage);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1.2rem;}
.gs-header h1{font-family:'Syne',sans-serif;font-size:clamp(1.8rem,3.5vw,2.8rem);font-weight:800;line-height:1.1;letter-spacing:-0.03em;margin-bottom:0.8rem;}
.gs-header p{font-size:0.95rem;color:rgba(13,13,13,0.48);max-width:380px;margin:0 auto;line-height:1.6;}

/* OPTIONS */
.options-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;max-width:720px;width:100%;margin-bottom:2.5rem;}
.option-card{background:white;border-radius:22px;padding:2.2rem;border:2px solid var(--border);cursor:pointer;transition:all .25s;position:relative;overflow:hidden;}
.option-card:hover{border-color:rgba(200,75,49,0.3);transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.08);}
.option-card.selected{border-color:var(--rust);background:white;box-shadow:0 12px 40px rgba(200,75,49,0.12);}
.option-card.selected::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--rust);}
.option-check{position:absolute;top:1.2rem;right:1.2rem;width:26px;height:26px;border-radius:50%;background:var(--rust);color:white;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;opacity:0;transition:opacity .2s;}
.option-card.selected .option-check{opacity:1;}
.option-icon{font-size:2.5rem;margin-bottom:1rem;}
.option-title{font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;letter-spacing:-0.02em;margin-bottom:0.5rem;}
.option-sub{font-size:0.85rem;color:rgba(13,13,13,0.5);line-height:1.6;margin-bottom:1.3rem;}
.option-perks{list-style:none;display:flex;flex-direction:column;gap:0.45rem;margin-bottom:1.5rem;}
.option-perks li{font-size:0.82rem;color:rgba(13,13,13,0.55);}
.option-card.selected .option-perks li{color:rgba(13,13,13,0.7);}
.option-cta{font-size:0.83rem;font-weight:600;color:rgba(13,13,13,0.3);transition:color .2s;}
.option-card.selected .option-cta{color:var(--rust);}
.option-card:hover .option-cta{color:var(--rust);}

/* CONTINUE */
.gs-footer{text-align:center;width:100%;max-width:720px;}
.btn-continue{width:100%;padding:1rem;border:none;border-radius:14px;font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:600;background:rgba(13,13,13,0.08);color:rgba(13,13,13,0.3);cursor:not-allowed;transition:all .3s;}
.btn-continue.active{background:var(--rust);color:white;cursor:pointer;}
.btn-continue.active:hover{background:#a83a22;transform:translateY(-1px);box-shadow:0 8px 24px rgba(200,75,49,0.25);}
.gs-note{font-size:0.82rem;color:rgba(13,13,13,0.38);margin-top:1rem;}
.gs-note a{color:var(--rust);font-weight:500;}

/* BOTTOM */
.gs-bottom{text-align:center;padding:1.5rem;border-top:1px solid var(--border);}
.gs-bottom p{font-size:0.78rem;color:rgba(13,13,13,0.3);}
`;