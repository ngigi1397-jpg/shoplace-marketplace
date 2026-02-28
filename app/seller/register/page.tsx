"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const KENYA_COUNTIES = [
  "Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa",
  "Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi",
  "Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu","Machakos",
  "Makueni","Mandera","Marsabit","Meru","Migori","Mombasa","Murang'a",
  "Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua","Nyeri",
  "Samburu","Siaya","Taita-Taveta","Tana River","Tharaka-Nithi","Trans Nzoia",
  "Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot"
];

const CATEGORIES = [
  "Electronics","Fashion & Clothing","Home & Living","Agriculture & Farming",
  "Food & Groceries","Health & Beauty","Sports & Outdoors","Automotive",
  "Books & Education","Services","Other"
];

export default function SellerRegisterPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [shopNumber, setShopNumber] = useState("");

  const [form, setForm] = useState({
    shop_name: "",
    description: "",
    category: "",
    county: "",
    constituency: "",
    address: "",
    phone: "",
    whatsapp: "",
    instagram: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = "/auth/login?redirect=/seller/register";
        return;
      }
      setUser(session.user);
      setLoading(false);
    });
  }, []);

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.shop_name || !form.category || !form.county || !form.phone) {
      setError("Please fill in all required fields."); return;
    }
    setSubmitting(true);
    try {
      // Generate unique shop number
      const { count } = await supabase.from("shops").select("*", { count: "exact", head: true });
      const newShopNumber = String((count || 0) + 1).padStart(5, "0");

      // Update user role to seller
      await supabase.from("users").update({ role: "seller" }).eq("id", user.id);

      // Create the shop
      const { error: shopError } = await supabase.from("shops").insert({
        owner_id: user.id,
        shop_name: form.shop_name,
        shop_number: newShopNumber,
        description: form.description,
        category: form.category,
        county: form.county,
        constituency: form.constituency,
        address: form.address,
        phone: form.phone,
        whatsapp: form.whatsapp,
        instagram: form.instagram,
        approval_status: "pending",
        is_active: false,
      });

      if (shopError) throw new Error(shopError.message);
      setShopNumber(newShopNumber);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to create shop. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#f5f0e8" }} />;

  if (success) {
    return (
      <>
        <style>{css}</style>
        <div className="auth-page">
          <div className="success-wrap">
            <div className="success-card">
              <div className="s-icon">🎉</div>
              <h2>Shop Application Submitted!</h2>
              <div className="shop-num-badge">SHOP #{shopNumber}</div>
              <p>Your shop has been registered and is pending admin approval. You will be notified once approved. In the meantime you can set up your seller dashboard.</p>
              <div className="s-btns">
                <a href="/seller/dashboard" className="btn-solid">Go to Dashboard →</a>
                <a href="/" className="btn-ghost">Back to Home</a>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="reg-page">

        {/* NAV */}
        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <div className="sp-nav-actions">
            <span className="nav-hi">Hi, {user?.email?.split("@")[0]} 👋</span>
            <a href="/" className="btn-ghost">← Back to Home</a>
          </div>
        </nav>

        <div className="reg-layout">
          {/* LEFT — info */}
          <div className="reg-left">
            <div className="reg-left-inner">
              <div className="reg-step-label">Step 1 of 1</div>
              <h2>Open your Shoplace shop</h2>
              <p>Fill in your shop details to get started. Your application will be reviewed by our team within 24 hours.</p>
              <div className="reg-perks">
                <div className="perk">🏪 Get a unique shop number</div>
                <div className="perk">📦 List unlimited products</div>
                <div className="perk">⚙️ Offer your services</div>
                <div className="perk">📍 Reach buyers in your county</div>
                <div className="perk">✅ Verified seller badge</div>
                <div className="perk">💰 Free to start</div>
              </div>
            </div>
          </div>

          {/* RIGHT — form */}
          <div className="reg-right">
            <div className="reg-form">
              <h3>Shop Details</h3>
              <p className="form-sub">All fields marked * are required</p>

              <div className="fg">
                <label>Shop Name *</label>
                <input type="text" placeholder="e.g. TechHub Nairobi" value={form.shop_name} onChange={e => update("shop_name", e.target.value)} />
              </div>

              <div className="fg">
                <label>Shop Description</label>
                <textarea placeholder="Describe what you sell or offer..." value={form.description} onChange={e => update("description", e.target.value)} rows={3} />
              </div>

              <div className="form-row">
                <div className="fg">
                  <label>Category *</label>
                  <select value={form.category} onChange={e => update("category", e.target.value)}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>County *</label>
                  <select value={form.county} onChange={e => update("county", e.target.value)}>
                    <option value="">Select county</option>
                    {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="fg">
                  <label>Constituency</label>
                  <input type="text" placeholder="e.g. Westlands" value={form.constituency} onChange={e => update("constituency", e.target.value)} />
                </div>
                <div className="fg">
                  <label>Physical Address</label>
                  <input type="text" placeholder="e.g. Westlands Mall, 2nd Floor" value={form.address} onChange={e => update("address", e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="fg">
                  <label>Phone Number *</label>
                  <input type="tel" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={e => update("phone", e.target.value)} />
                </div>
                <div className="fg">
                  <label>WhatsApp Number</label>
                  <input type="tel" placeholder="+254 7XX XXX XXX" value={form.whatsapp} onChange={e => update("whatsapp", e.target.value)} />
                </div>
              </div>

              <div className="fg">
                <label>Instagram Handle</label>
                <input type="text" placeholder="@yourshop" value={form.instagram} onChange={e => update("instagram", e.target.value)} />
              </div>

              {error && <div className="form-error">⚠️ {error}</div>}

              <button className="btn-solid btn-full" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting Application..." : "Submit Shop Application →"}
              </button>

              <p className="form-terms">
                By opening a shop you agree to our <a href="/terms">Seller Terms</a>. Your shop will be reviewed before going live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
:root{--ink:#0d0d0d;--cream:#f5f0e8;--rust:#c84b31;--sage:#3d6b4f;--mist:#e8ede9;--border:rgba(13,13,13,0.12);}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);}
a{text-decoration:none;color:inherit;}
.sp-nav{position:fixed;top:0;width:100%;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.1rem 4rem;background:rgba(245,240,232,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);}
.sp-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.5rem;letter-spacing:-0.04em;color:var(--ink);}
.sp-logo span{color:var(--rust);}
.sp-nav-actions{display:flex;gap:0.75rem;align-items:center;}
.nav-hi{font-size:0.83rem;color:var(--sage);font-weight:500;}
.btn-ghost{padding:0.48rem 1.1rem;border:1.5px solid rgba(13,13,13,0.3);border-radius:100px;font-size:0.83rem;font-weight:500;color:var(--ink);background:transparent;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-ghost:hover{background:var(--ink);color:var(--cream);}
.btn-solid{padding:0.7rem 1.6rem;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:600;background:var(--rust);color:white;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;}
.btn-solid:hover:not(:disabled){background:#a83a22;transform:translateY(-1px);}
.btn-solid:disabled{opacity:0.6;cursor:not-allowed;}
.btn-full{width:100%;padding:.88rem;}
.reg-page{min-height:100vh;background:var(--cream);}
.reg-layout{display:grid;grid-template-columns:1fr 1.4fr;min-height:100vh;padding-top:72px;}
.reg-left{background:var(--ink);color:white;padding:4rem 3rem;display:flex;align-items:center;justify-content:center;}
.reg-left-inner{max-width:320px;}
.reg-step-label{font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1.5rem;}
.reg-left h2{font-family:'Syne',sans-serif;font-size:1.9rem;font-weight:800;line-height:1.15;letter-spacing:-0.03em;margin-bottom:1rem;}
.reg-left p{font-size:0.88rem;color:rgba(255,255,255,0.42);line-height:1.7;margin-bottom:2rem;}
.reg-perks{display:flex;flex-direction:column;gap:0.7rem;}
.perk{font-size:0.85rem;color:rgba(255,255,255,0.55);}
.reg-right{padding:3rem;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;}
.reg-form{width:100%;max-width:560px;padding-top:1rem;}
.reg-form h3{font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800;letter-spacing:-0.02em;margin-bottom:0.3rem;}
.form-sub{font-size:0.83rem;color:rgba(13,13,13,0.42);margin-bottom:1.8rem;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:0.9rem;}
.fg{margin-bottom:1rem;}
.fg label{display:block;font-size:0.74rem;font-weight:600;color:rgba(13,13,13,0.48);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.38rem;}
.fg input,.fg select,.fg textarea{width:100%;padding:0.75rem 0.9rem;background:white;border:1.5px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:0.88rem;color:var(--ink);outline:none;transition:border-color .2s;-webkit-appearance:none;resize:vertical;}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:var(--rust);}
.form-error{background:rgba(200,75,49,0.08);border:1px solid rgba(200,75,49,0.2);border-radius:8px;padding:0.75rem 1rem;font-size:0.82rem;color:var(--rust);margin-bottom:1rem;}
.form-terms{font-size:0.75rem;color:rgba(13,13,13,0.35);text-align:center;margin-top:1rem;line-height:1.5;}
.form-terms a{color:var(--rust);}
.auth-page{min-height:100vh;background:var(--cream);display:flex;align-items:center;justify-content:center;}
.success-wrap{padding:2rem;}
.success-card{background:white;border-radius:24px;border:1px solid var(--border);padding:3.5rem;text-align:center;max-width:480px;}
.s-icon{font-size:3.5rem;margin-bottom:1.2rem;}
.success-card h2{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;letter-spacing:-0.02em;margin-bottom:1rem;}
.shop-num-badge{display:inline-block;background:var(--ink);color:white;font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:800;padding:0.5rem 1.5rem;border-radius:100px;margin-bottom:1.2rem;letter-spacing:0.05em;}
.success-card p{font-size:0.88rem;color:rgba(13,13,13,0.52);line-height:1.7;margin-bottom:1.8rem;}
.s-btns{display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;}
`;