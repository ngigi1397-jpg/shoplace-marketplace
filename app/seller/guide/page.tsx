"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SellerGuidePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  return (
    <>
      <style>{css}</style>
      <div className="page-wrap">
        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <ul className="sp-nav-links">
            <li><a href="/products">Browse</a></li>
            <li><a href="/shops">Shops</a></li>
            <li><a href="/services">Services</a></li>
          </ul>
          <div className="sp-nav-actions">
            {user ? (
              <>
                <a href="/seller/dashboard" className="btn-ghost">My Dashboard</a>
                <a href="/seller/register" className="btn-solid">Open a Shop</a>
              </>
            ) : (
              <>
                <a href="/auth/login" className="btn-ghost">Login</a>
                <a href="/auth/signup" className="btn-solid">Get Started</a>
              </>
            )}
          </div>
        </nav>

        {/* HERO */}
        <div className="guide-hero">
          <div className="guide-hero-inner">
            <div className="guide-badge">Seller Guide</div>
            <h1>Everything you need to<br />start selling on Shoplace</h1>
            <p>From opening your shop to getting your first buyer — we walk you through every step.</p>
            <a href={user ? "/seller/register" : "/auth/signup?next=seller"} className="btn-solid btn-lg">
              {user ? "Open Your Shop Now →" : "Sign Up & Start Selling →"}
            </a>
          </div>
        </div>

        <div className="guide-content">

          {/* STEPS */}
          <section className="guide-section">
            <h2>How to Start Selling</h2>
            <div className="steps-grid">
              {[
                { n: "01", icon: "👤", title: "Create a free account", desc: "Sign up at shoplace.co.ke with your email. Choose 'I want to sell' during registration. It takes less than 2 minutes.", link: user ? null : "/auth/signup", linkLabel: "Sign up free →" },
                { n: "02", icon: "🏪", title: "Open your shop", desc: "Fill in your shop name, category, county, and contact details. Submit your application and get a unique shop number like #00001.", link: user ? "/seller/register" : null, linkLabel: "Open a shop →" },
                { n: "03", icon: "⏳", title: "Wait for approval", desc: "Our team reviews every shop within 24 hours to ensure quality. You'll be notified by email once your shop is approved and live.", link: null, linkLabel: null },
                { n: "04", icon: "📦", title: "List your products", desc: "Once approved, go to your dashboard and start adding products and services. Include clear photos, descriptions, and prices.", link: user ? "/seller/dashboard" : null, linkLabel: "Go to dashboard →" },
                { n: "05", icon: "📣", title: "Share your shop", desc: "Share your shop link and shop number with friends, family, and on social media to get your first buyers.", link: null, linkLabel: null },
                { n: "06", icon: "🤝", title: "Connect with buyers", desc: "Buyers contact you directly via phone or WhatsApp. You handle the sale, delivery, and payment your own way.", link: null, linkLabel: null },
              ].map(s => (
                <div className="step-card" key={s.n}>
                  <div className="step-n">{s.n}</div>
                  <div className="step-icon">{s.icon}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                  {s.link && <a href={s.link} className="step-link">{s.linkLabel}</a>}
                </div>
              ))}
            </div>
          </section>

          {/* WHAT YOU CAN SELL */}
          <section className="guide-section alt-section">
            <h2>What Can You Sell?</h2>
            <p className="section-sub">Shoplace supports all legal products and services across Kenya</p>
            <div className="sell-grid">
              {[
                { icon: "📱", title: "Electronics", examples: "Phones, laptops, accessories, gadgets" },
                { icon: "👗", title: "Fashion", examples: "Clothes, shoes, bags, jewellery" },
                { icon: "🏠", title: "Home & Living", examples: "Furniture, decor, kitchen, bedding" },
                { icon: "🌾", title: "Agriculture", examples: "Produce, seeds, tools, livestock" },
                { icon: "🍎", title: "Food & Groceries", examples: "Fresh food, packaged goods, snacks" },
                { icon: "🔧", title: "Services", examples: "Plumbing, design, delivery, tutoring" },
                { icon: "💄", title: "Health & Beauty", examples: "Skincare, haircare, supplements" },
                { icon: "📚", title: "Books & Education", examples: "Textbooks, courses, stationery" },
              ].map(c => (
                <div className="sell-card" key={c.title}>
                  <div className="sell-icon">{c.icon}</div>
                  <div className="sell-title">{c.title}</div>
                  <div className="sell-examples">{c.examples}</div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="guide-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {[
                { q: "Is it free to open a shop?", a: "Yes. Opening a shop on Shoplace is 100% free. There are no monthly fees or listing fees." },
                { q: "How long does shop approval take?", a: "Our team reviews applications within 24 hours. You will receive an email notification once approved." },
                { q: "How do buyers pay me?", a: "Buyers contact you directly via phone or WhatsApp. You agree on payment method — cash, M-Pesa, or bank transfer — directly with the buyer." },
                { q: "Can I sell services instead of products?", a: "Yes! You can list services like plumbing, design, delivery, tutoring, or any skill you offer alongside or instead of products." },
                { q: "What happens if my shop is rejected?", a: "You will be notified with a reason. Common reasons include incomplete information or prohibited items. You can reapply after making corrections." },
                { q: "Can I have more than one shop?", a: "Currently each account can have one shop. You can list multiple categories and products within that shop." },
                { q: "How do I get more buyers?", a: "Share your unique shop number and link on social media, WhatsApp groups, and with your network. Active shops with good photos and descriptions get more views." },
                { q: "Is my shop visible to everyone?", a: "Your shop is visible to all logged-in Shoplace users. Buyers must create a free account to browse and contact sellers." },
              ].map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="guide-cta">
            <h2>Ready to start selling?</h2>
            <p>Join sellers across Kenya who are reaching new buyers every day on Shoplace.</p>
            <a href={user ? "/seller/register" : "/auth/signup?next=seller"} className="btn-solid btn-lg">
              {user ? "Open Your Shop →" : "Create Free Account →"}
            </a>
          </section>

        </div>

        <footer className="guide-footer">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <p>© 2025 Shoplace. Kenya&apos;s local marketplace.</p>
        </footer>
      </div>
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
      <div className="faq-q">
        <span>{q}</span>
        <span className="faq-chevron">{open ? "▲" : "▼"}</span>
      </div>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
:root{--ink:#0d0d0d;--cream:#f5f0e8;--rust:#c84b31;--sage:#3d6b4f;--mist:#e8ede9;--border:rgba(13,13,13,0.1);}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);}
a{text-decoration:none;color:inherit;}
.sp-nav{position:fixed;top:0;width:100%;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1rem 4rem;background:rgba(245,240,232,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);}
.sp-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.5rem;letter-spacing:-0.04em;color:var(--ink);}
.sp-logo span{color:var(--rust);}
.sp-nav-links{display:flex;gap:2rem;list-style:none;}
.sp-nav-links a{font-size:0.88rem;font-weight:500;color:rgba(13,13,13,0.6);transition:opacity .2s;}
.sp-nav-links a:hover{color:var(--ink);}
.sp-nav-actions{display:flex;gap:0.65rem;align-items:center;}
.btn-ghost{padding:0.45rem 1rem;border:1.5px solid rgba(13,13,13,0.25);border-radius:100px;font-size:0.82rem;font-weight:500;color:var(--ink);background:transparent;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-ghost:hover{background:var(--ink);color:var(--cream);}
.btn-solid{padding:0.55rem 1.3rem;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.83rem;font-weight:600;background:var(--rust);color:white;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-solid:hover{background:#a83a22;transform:translateY(-1px);}
.btn-lg{padding:0.8rem 2rem!important;font-size:0.95rem!important;}
.page-wrap{min-height:100vh;background:var(--cream);}
.guide-hero{background:var(--ink);padding:8rem 4rem 5rem;margin-bottom:0;position:relative;overflow:hidden;}
.guide-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 20% 50%,rgba(200,75,49,0.25),transparent 50%);}
.guide-hero-inner{position:relative;z-index:1;max-width:600px;}
.guide-badge{display:inline-flex;padding:0.3rem 0.9rem;background:rgba(200,75,49,0.2);border:1px solid rgba(200,75,49,0.3);border-radius:100px;font-size:0.75rem;font-weight:600;color:#f87171;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1.5rem;}
.guide-hero h1{font-family:'Syne',sans-serif;font-size:clamp(2rem,4vw,3.2rem);font-weight:800;color:white;line-height:1.1;letter-spacing:-0.03em;margin-bottom:1rem;}
.guide-hero p{font-size:1rem;color:rgba(255,255,255,0.45);line-height:1.7;max-width:460px;margin-bottom:2rem;}
.guide-content{max-width:1100px;margin:0 auto;padding:0 4rem;}
.guide-section{padding:5rem 0;}
.guide-section h2{font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;letter-spacing:-0.03em;margin-bottom:0.5rem;}
.section-sub{font-size:0.9rem;color:rgba(13,13,13,0.45);margin-bottom:2.5rem;}
.alt-section{background:white;margin:0 -4rem;padding:5rem 4rem;}
.steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-top:2.5rem;}
.step-card{background:white;border-radius:18px;padding:1.8rem;border:1px solid var(--border);transition:all .25s;}
.step-card:hover{border-color:rgba(200,75,49,0.2);transform:translateY(-2px);}
.step-n{font-family:'Syne',sans-serif;font-size:0.68rem;font-weight:800;color:rgba(13,13,13,0.18);letter-spacing:0.1em;margin-bottom:0.8rem;}
.step-icon{font-size:1.8rem;margin-bottom:0.7rem;}
.step-title{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;margin-bottom:0.5rem;}
.step-desc{font-size:0.82rem;color:rgba(13,13,13,0.52);line-height:1.65;margin-bottom:0.8rem;}
.step-link{font-size:0.8rem;color:var(--rust);font-weight:600;}
.sell-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.2rem;margin-top:2.5rem;}
.sell-card{background:var(--cream);border-radius:14px;padding:1.4rem;border:1px solid var(--border);}
.sell-icon{font-size:1.8rem;margin-bottom:0.6rem;}
.sell-title{font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:700;margin-bottom:0.3rem;}
.sell-examples{font-size:0.78rem;color:rgba(13,13,13,0.45);line-height:1.5;}
.faq-list{margin-top:2rem;display:flex;flex-direction:column;gap:0.6rem;}
.faq-item{background:white;border-radius:12px;padding:1.2rem 1.4rem;border:1px solid var(--border);cursor:pointer;transition:border-color .2s;}
.faq-item:hover{border-color:rgba(200,75,49,0.2);}
.faq-item.open{border-color:var(--rust);}
.faq-q{display:flex;justify-content:space-between;align-items:center;font-size:0.9rem;font-weight:500;}
.faq-chevron{font-size:0.65rem;color:rgba(13,13,13,0.35);margin-left:1rem;flex-shrink:0;}
.faq-a{font-size:0.83rem;color:rgba(13,13,13,0.55);line-height:1.7;margin-top:0.8rem;padding-top:0.8rem;border-top:1px solid var(--border);}
.guide-cta{background:linear-gradient(135deg,var(--rust),#a83a22);border-radius:22px;padding:3.5rem;text-align:center;margin-bottom:4rem;}
.guide-cta h2{font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;color:white;letter-spacing:-0.03em;margin-bottom:0.6rem;}
.guide-cta p{font-size:0.9rem;color:rgba(255,255,255,0.6);margin-bottom:1.8rem;}
.guide-cta .btn-solid{background:white;color:var(--rust);margin:0 auto;}
.guide-cta .btn-solid:hover{background:var(--cream);}
.guide-footer{background:var(--ink);padding:2.5rem 4rem;display:flex;justify-content:space-between;align-items:center;}
.guide-footer .sp-logo{color:white;}
.guide-footer p{font-size:0.8rem;color:rgba(255,255,255,0.3);}
`;