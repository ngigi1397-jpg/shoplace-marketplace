"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SERVICE_CATS = [
  "Plumbing","Electrical","Carpentry","Painting","Cleaning","Delivery",
  "Design","Tutoring","Photography","Catering","Beauty & Hair","IT & Tech",
  "Farming & Agriculture","Transport","Security","Events","Other"
];

const KENYA_COUNTIES = [
  "Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa",
  "Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi",
  "Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu","Machakos",
  "Makueni","Mandera","Marsabit","Meru","Migori","Mombasa","Murang'a",
  "Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua","Nyeri",
  "Samburu","Siaya","Taita-Taveta","Tana River","Tharaka-Nithi","Trans Nzoia",
  "Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot"
];

export default function AddServicePage() {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    price_type: "fixed",
    county: "",
    constituency: "",
    is_active: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.href = "/auth/login?redirect=/seller/services/new";
        return;
      }

      // Use array query — avoids .single() crash
      const { data: shopList, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: false });

      if (shopError) {
        setError("Could not load your shop: " + shopError.message);
        setLoading(false);
        return;
      }

      const shopData = shopList && shopList.length > 0 ? shopList[0] : null;

      if (!shopData) {
        window.location.href = "/seller/register";
        return;
      }

      setShop(shopData);
      setForm(prev => ({ ...prev, county: shopData.county || "" }));
      setLoading(false);
    });
  }, []);

  const update = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError("");

    if (!form.name.trim()) { setError("Please enter a service name."); return; }
    if (!form.category) { setError("Please select a category."); return; }
    if (!form.county) { setError("Please select a county."); return; }

    setSubmitting(true);

    try {
      const insertData: any = {
        shop_id: shop.id,
        name: form.name.trim(),
        category: form.category,
        county: form.county,
        is_active: form.is_active,
      };

      // Only add optional fields if they have values
      if (form.description.trim()) insertData.description = form.description.trim();
      if (form.price_type) insertData.price_type = form.price_type;
      if (form.constituency.trim()) insertData.constituency = form.constituency.trim();
      if (form.price && form.price_type !== "free" && form.price_type !== "negotiable") {
        insertData.price = parseFloat(form.price);
      }

      const { error: serviceError } = await supabase
        .from("services")
        .insert(insertData);

      if (serviceError) {
        throw new Error(serviceError.message);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to add service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setForm({
      name: "", description: "", category: "", price: "",
      price_type: "fixed", county: shop?.county || "", constituency: "", is_active: true,
    });
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "sans-serif", color: "rgba(13,13,13,0.4)" }}>Loading your shop...</div>
    </div>
  );

  if (success) {
    return (
      <>
        <style>{css}</style>
        <div className="auth-page">
          <div className="success-card">
            <div className="s-icon">✅</div>
            <h2>Service Added!</h2>
            <p>Your service is now visible to buyers on Shoplace.</p>
            <div className="s-btns">
              <button className="btn-solid" onClick={resetForm}>+ Add Another Service</button>
              <a href="/seller/dashboard" className="btn-ghost">Go to Dashboard</a>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="page-wrap">

        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <div className="sp-nav-actions">
            <a href="/seller/dashboard" className="btn-ghost">← Dashboard</a>
          </div>
        </nav>

        <div className="add-layout">

          {/* FORM SIDE */}
          <div className="form-side">
            <div className="form-wrap">
              <div className="form-header">
                <h2>Add a Service</h2>
                <p>Shop: <strong>{shop?.shop_name}</strong> · #{String(shop?.shop_number || "").padStart(5, "0")}</p>
              </div>

              {shop?.approval_status !== "approved" && (
                <div className="pending-warn">
                  ⏳ Your shop is pending approval. You can add services now but they will not be visible to buyers until your shop is approved.
                </div>
              )}

              <div className="fg">
                <label>Service Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Home Plumbing Repair"
                  value={form.name}
                  onChange={e => update("name", e.target.value)}
                />
              </div>

              <div className="fg">
                <label>Category *</label>
                <select value={form.category} onChange={e => update("category", e.target.value)}>
                  <option value="">Select category</option>
                  {SERVICE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="fg">
                <label>Description</label>
                <textarea
                  placeholder="Describe what your service includes, your experience, area you cover..."
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="fg">
                <label>Pricing Type</label>
                <div className="price-type-row">
                  {[
                    { value: "fixed", label: "Fixed Price" },
                    { value: "hourly", label: "Per Hour" },
                    { value: "negotiable", label: "Negotiable" },
                    { value: "free", label: "Free" },
                  ].map(pt => (
                    <div
                      key={pt.value}
                      className={"price-type-btn" + (form.price_type === pt.value ? " active" : "")}
                      onClick={() => update("price_type", pt.value)}
                    >
                      {pt.label}
                    </div>
                  ))}
                </div>
              </div>

              {form.price_type !== "free" && form.price_type !== "negotiable" && (
                <div className="fg">
                  <label>Price (KSh) {form.price_type === "hourly" ? "— per hour" : ""}</label>
                  <div className="price-input-wrap">
                    <span className="price-prefix">KSh</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.price}
                      onChange={e => update("price", e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="fg">
                  <label>County *</label>
                  <select value={form.county} onChange={e => update("county", e.target.value)}>
                    <option value="">Select county</option>
                    {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Constituency</label>
                  <input
                    type="text"
                    placeholder="e.g. Westlands"
                    value={form.constituency}
                    onChange={e => update("constituency", e.target.value)}
                  />
                </div>
              </div>

              <div className="status-toggle">
                <div className="status-info">
                  <div className="status-title">Listing Status</div>
                  <div className="status-sub">{form.is_active ? "Visible to buyers" : "Saved as draft"}</div>
                </div>
                <div className={"toggle " + (form.is_active ? "on" : "off")} onClick={() => update("is_active", !form.is_active)}>
                  <div className="toggle-thumb" />
                </div>
              </div>

              {error && <div className="form-error">⚠️ {error}</div>}

              <button className="btn-solid btn-full" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Adding service..." : "Add Service to Shop →"}
              </button>
            </div>
          </div>

          {/* PREVIEW SIDE */}
          <div className="preview-side">
            <div className="preview-wrap">
              <div className="preview-label">Live Preview</div>
              <div className="service-preview-card">
                <div className="preview-top">
                  <div className="preview-icon">⚙️</div>
                  <div className="preview-cat">{form.category || "Category"}</div>
                </div>
                <div className="preview-name">{form.name || "Service name"}</div>
                <div className="preview-shop">{shop?.shop_name} · #{String(shop?.shop_number || "").padStart(5, "0")}</div>
                {form.description && (
                  <div className="preview-desc">
                    {form.description.slice(0, 100)}{form.description.length > 100 ? "..." : ""}
                  </div>
                )}
                <div className="preview-price">
                  {form.price_type === "free" ? "Free" :
                   form.price_type === "negotiable" ? "Price negotiable" :
                   form.price ? `From KSh ${parseFloat(form.price).toLocaleString()}${form.price_type === "hourly" ? "/hr" : ""}` :
                   "Price on request"}
                </div>
                {form.county && (
                  <div className="preview-loc">📍 {form.county}{form.constituency ? `, ${form.constituency}` : ""}</div>
                )}
                <div className="preview-actions">
                  <div className="preview-btn">📞 Call</div>
                  <div className="preview-btn wa">💬 WhatsApp</div>
                </div>
              </div>
              <p className="preview-note">This is how buyers will see your service</p>
            </div>
          </div>

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
.sp-nav-actions{display:flex;gap:0.65rem;}
.btn-ghost{padding:0.45rem 1rem;border:1.5px solid rgba(13,13,13,0.25);border-radius:100px;font-size:0.82rem;font-weight:500;color:var(--ink);background:transparent;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;}
.btn-ghost:hover{background:var(--ink);color:var(--cream);}
.btn-solid{padding:0.7rem 1.5rem;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:600;background:var(--rust);color:white;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;}
.btn-solid:hover:not(:disabled){background:#a83a22;transform:translateY(-1px);}
.btn-solid:disabled{opacity:0.6;cursor:not-allowed;}
.btn-full{width:100%;padding:0.9rem;}
.page-wrap{min-height:100vh;background:var(--cream);}
.add-layout{display:grid;grid-template-columns:1.1fr 0.9fr;min-height:100vh;padding-top:68px;}
.form-side{padding:2.5rem 3rem;overflow-y:auto;}
.form-wrap{max-width:520px;}
.form-header{margin-bottom:1.8rem;}
.form-header h2{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;letter-spacing:-0.02em;margin-bottom:0.3rem;}
.form-header p{font-size:0.85rem;color:rgba(13,13,13,0.45);}
.form-header strong{color:var(--rust);}
.pending-warn{background:rgba(245,166,35,0.08);border:1px solid rgba(245,166,35,0.25);border-radius:10px;padding:0.9rem 1rem;font-size:0.82rem;color:#92660a;line-height:1.6;margin-bottom:1.5rem;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:0.9rem;}
.fg{margin-bottom:1.1rem;}
.fg label{display:block;font-size:0.73rem;font-weight:600;color:rgba(13,13,13,0.45);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.38rem;}
.fg input,.fg select,.fg textarea{width:100%;padding:0.75rem 0.9rem;background:white;border:1.5px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:0.88rem;color:var(--ink);outline:none;transition:border-color .2s;-webkit-appearance:none;resize:vertical;}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:var(--rust);}
.price-type-row{display:flex;gap:0.5rem;flex-wrap:wrap;}
.price-type-btn{padding:0.45rem 0.9rem;border:1.5px solid var(--border);border-radius:100px;font-size:0.8rem;font-weight:500;cursor:pointer;transition:all .2s;background:white;color:rgba(13,13,13,0.55);}
.price-type-btn:hover{border-color:var(--rust);color:var(--rust);}
.price-type-btn.active{background:var(--rust);border-color:var(--rust);color:white;}
.price-input-wrap{display:flex;align-items:center;background:white;border:1.5px solid var(--border);border-radius:10px;overflow:hidden;transition:border-color .2s;}
.price-input-wrap:focus-within{border-color:var(--rust);}
.price-prefix{padding:0.75rem 0.75rem 0.75rem 0.9rem;font-size:0.83rem;font-weight:600;color:rgba(13,13,13,0.4);background:rgba(13,13,13,0.03);border-right:1px solid var(--border);}
.price-input-wrap input{border:none!important;border-radius:0!important;flex:1;}
.status-toggle{display:flex;align-items:center;justify-content:space-between;background:white;border:1.5px solid var(--border);border-radius:12px;padding:1rem 1.2rem;margin-bottom:1.2rem;}
.status-title{font-size:0.88rem;font-weight:500;}
.status-sub{font-size:0.75rem;color:rgba(13,13,13,0.4);margin-top:0.15rem;}
.toggle{width:46px;height:26px;border-radius:100px;cursor:pointer;transition:background .2s;position:relative;flex-shrink:0;}
.toggle.on{background:var(--sage);}
.toggle.off{background:rgba(13,13,13,0.15);}
.toggle-thumb{position:absolute;top:3px;width:20px;height:20px;background:white;border-radius:50%;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,0.2);}
.toggle.on .toggle-thumb{left:23px;}
.toggle.off .toggle-thumb{left:3px;}
.form-error{background:rgba(200,75,49,0.08);border:1px solid rgba(200,75,49,0.2);border-radius:8px;padding:0.75rem 1rem;font-size:0.82rem;color:var(--rust);margin-bottom:1rem;line-height:1.5;}
.preview-side{background:white;border-left:1px solid var(--border);padding:2.5rem 2rem;position:sticky;top:68px;height:calc(100vh - 68px);overflow-y:auto;}
.preview-wrap{max-width:300px;margin:0 auto;}
.preview-label{font-size:0.72rem;font-weight:600;color:rgba(13,13,13,0.35);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1rem;}
.service-preview-card{background:var(--cream);border-radius:18px;padding:1.5rem;border:1px solid var(--border);}
.preview-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.8rem;}
.preview-icon{font-size:1.8rem;}
.preview-cat{font-size:0.7rem;background:rgba(13,13,13,0.06);padding:0.2rem 0.6rem;border-radius:100px;color:rgba(13,13,13,0.4);font-weight:500;}
.preview-name{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;margin-bottom:0.25rem;}
.preview-shop{font-size:0.72rem;color:var(--sage);font-weight:500;margin-bottom:0.6rem;}
.preview-desc{font-size:0.78rem;color:rgba(13,13,13,0.45);line-height:1.5;margin-bottom:0.6rem;}
.preview-price{font-size:0.95rem;font-weight:600;color:var(--rust);margin-bottom:0.3rem;}
.preview-loc{font-size:0.72rem;color:rgba(13,13,13,0.35);margin-bottom:1rem;}
.preview-actions{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;}
.preview-btn{padding:0.5rem;border-radius:8px;font-size:0.75rem;font-weight:500;text-align:center;border:1.5px solid var(--border);cursor:not-allowed;color:rgba(13,13,13,0.3);display:flex;align-items:center;justify-content:center;gap:0.3rem;}
.preview-btn.wa{background:rgba(37,211,102,0.06);border-color:rgba(37,211,102,0.2);color:rgba(18,140,126,0.35);}
.preview-note{font-size:0.72rem;color:rgba(13,13,13,0.3);text-align:center;margin-top:0.8rem;}
.auth-page{min-height:100vh;background:var(--cream);display:flex;align-items:center;justify-content:center;padding:2rem;}
.success-card{background:white;border-radius:24px;border:1px solid var(--border);padding:3.5rem;text-align:center;max-width:420px;box-shadow:0 16px 48px rgba(0,0,0,0.07);}
.s-icon{font-size:3rem;margin-bottom:1.2rem;}
.success-card h2{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;margin-bottom:0.8rem;}
.success-card p{font-size:0.88rem;color:rgba(13,13,13,0.5);line-height:1.7;margin-bottom:1.8rem;}
.s-btns{display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;}
@media(max-width:768px){
  .sp-nav{padding:0.9rem 1.2rem;}
  .add-layout{grid-template-columns:1fr;}
  .preview-side{display:none;}
  .form-side{padding:5rem 1.5rem 3rem;}
}
`;
