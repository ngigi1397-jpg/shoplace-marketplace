"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIES = [
  "Electronics","Fashion & Clothing","Home & Living","Agriculture & Farming",
  "Food & Groceries","Health & Beauty","Sports & Outdoors","Automotive",
  "Books & Education","Other"
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

export default function AddProductPage() {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    original_price: "",
    county: "",
    constituency: "",
    quantity: "",
    condition: "new",
    is_active: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.href = "/auth/login?redirect=/seller/products/new";
        return;
      }

      const { data: shopList, error: shopErr } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: false });

      if (shopErr) {
        setError("Could not load your shop: " + shopErr.message);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.name.trim()) { setError("Please enter a product name."); return; }
    if (!form.category) { setError("Please select a category."); return; }
    if (!form.price) { setError("Please enter a price."); return; }
    if (!form.county) { setError("Please select a county."); return; }

    setSubmitting(true);

    try {
      let image_url = null;

      // Upload image if provided
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const fileName = `${shop.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) {
          // If storage bucket doesn't exist, skip image but don't fail
          console.warn("Image upload skipped:", uploadError.message);
        } else {
          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);
          image_url = urlData.publicUrl;
        }
      }

      const insertData: any = {
        shop_id: shop.id,
        name: form.name.trim(),
        category: form.category,
        price: parseFloat(form.price),
        county: form.county,
        condition: form.condition,
        is_active: form.is_active,
      };

      if (form.description.trim()) insertData.description = form.description.trim();
      if (form.original_price) insertData.original_price = parseFloat(form.original_price);
      if (form.constituency.trim()) insertData.constituency = form.constituency.trim();
      if (form.quantity) insertData.quantity = parseInt(form.quantity);
      if (image_url) insertData.image_url = image_url;

      const { error: productError } = await supabase
        .from("products")
        .insert(insertData);

      if (productError) throw new Error(productError.message);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to add product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setError("");
    setImagePreview(null);
    setImageFile(null);
    setForm({
      name: "", description: "", category: "", price: "",
      original_price: "", county: shop?.county || "",
      constituency: "", quantity: "", condition: "new", is_active: true,
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
            <div className="s-icon">🎉</div>
            <h2>Product Listed!</h2>
            <p>Your product has been added to your shop and is now visible to buyers.</p>
            <div className="s-btns">
              <button className="btn-solid" onClick={resetForm}>+ Add Another Product</button>
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

          {/* FORM */}
          <div className="form-side">
            <div className="form-wrap">

              <div className="form-header">
                <h2>Add a Product</h2>
                <p>Shop: <strong>{shop?.shop_name}</strong> · #{String(shop?.shop_number || "").padStart(5, "0")}</p>
              </div>

              {shop?.approval_status !== "approved" && (
                <div className="pending-warn">
                  ⏳ Your shop is pending approval. You can fill in details now — your product will go live once your shop is approved.
                </div>
              )}

              {/* IMAGE UPLOAD */}
              <div className="fg">
                <label>Product Photo</label>
                <div className="img-upload" onClick={() => document.getElementById("img-input")?.click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" />
                  ) : (
                    <div className="img-placeholder">
                      <span>📷</span>
                      <div>Click to upload photo</div>
                      <div className="img-hint">JPG, PNG · max 5MB</div>
                    </div>
                  )}
                </div>
                <input
                  id="img-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <button className="remove-img" onClick={() => { setImagePreview(null); setImageFile(null); }}>
                    ✕ Remove photo
                  </button>
                )}
              </div>

              <div className="fg">
                <label>Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Samsung Galaxy A55 5G"
                  value={form.name}
                  onChange={e => update("name", e.target.value)}
                />
              </div>

              <div className="fg">
                <label>Category *</label>
                <select value={form.category} onChange={e => update("category", e.target.value)}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="fg">
                <label>Description</label>
                <textarea
                  placeholder="Describe your product — brand, model, features, condition details..."
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="fg">
                  <label>Selling Price (KSh) *</label>
                  <div className="price-wrap">
                    <span className="price-prefix">KSh</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.price}
                      onChange={e => update("price", e.target.value)}
                    />
                  </div>
                </div>
                <div className="fg">
                  <label>Original Price (optional)</label>
                  <div className="price-wrap">
                    <span className="price-prefix">KSh</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.original_price}
                      onChange={e => update("original_price", e.target.value)}
                    />
                  </div>
                  <div className="field-hint">Shows as crossed out — discount badge auto-calculates</div>
                </div>
              </div>

              <div className="fg">
                <label>Condition</label>
                <div className="cond-row">
                  {[
                    { value: "new", label: "✨ New", desc: "Brand new, unused" },
                    { value: "used", label: "♻️ Used", desc: "Pre-owned, good condition" },
                  ].map(c => (
                    <div
                      key={c.value}
                      className={"cond-btn" + (form.condition === c.value ? " active" : "")}
                      onClick={() => update("condition", c.value)}
                    >
                      <div className="cond-label">{c.label}</div>
                      <div className="cond-desc">{c.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

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

              <div className="fg">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  placeholder="Leave blank if unlimited"
                  value={form.quantity}
                  onChange={e => update("quantity", e.target.value)}
                />
              </div>

              <div className="status-toggle">
                <div className="status-info">
                  <div className="status-title">Listing Status</div>
                  <div className="status-sub">{form.is_active ? "Active — visible to buyers" : "Draft — hidden from buyers"}</div>
                </div>
                <div className={"toggle " + (form.is_active ? "on" : "off")} onClick={() => update("is_active", !form.is_active)}>
                  <div className="toggle-thumb" />
                </div>
              </div>

              {error && <div className="form-error">⚠️ {error}</div>}

              <button className="btn-solid btn-full" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Adding product..." : "Add Product to Shop →"}
              </button>

            </div>
          </div>

          {/* PREVIEW */}
          <div className="preview-side">
            <div className="preview-wrap">
              <div className="preview-label">Live Preview</div>
              <div className="product-preview-card">
                <div className="preview-img">
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" />
                    : <span>📦</span>}
                  {form.original_price && form.price && parseFloat(form.original_price) > parseFloat(form.price) && (
                    <div className="discount-tag">
                      -{Math.round((1 - parseFloat(form.price) / parseFloat(form.original_price)) * 100)}%
                    </div>
                  )}
                </div>
                <div className="preview-body">
                  <div className="preview-shop-name">{shop?.shop_name}</div>
                  <div className="preview-prod-name">{form.name || "Product name"}</div>
                  <div className="preview-price-row">
                    <div className="preview-price">
                      {form.price ? `KSh ${parseFloat(form.price).toLocaleString()}` : "KSh 0"}
                    </div>
                    {form.original_price && parseFloat(form.original_price) > parseFloat(form.price || "0") && (
                      <div className="preview-original">KSh {parseFloat(form.original_price).toLocaleString()}</div>
                    )}
                  </div>
                  <div className="preview-meta">
                    <span>📍 {form.county || "County"}</span>
                    <span>· {form.condition === "new" ? "✨ New" : "♻️ Used"}</span>
                  </div>
                </div>
              </div>
              <p className="preview-note">This is how buyers will see your product</p>
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
.add-layout{display:grid;grid-template-columns:1.2fr 0.8fr;min-height:100vh;padding-top:68px;}
.form-side{padding:2.5rem 3rem;overflow-y:auto;}
.form-wrap{max-width:540px;}
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
.field-hint{font-size:0.7rem;color:rgba(13,13,13,0.35);margin-top:0.3rem;}
.img-upload{width:100%;height:180px;background:white;border:2px dashed rgba(13,13,13,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;transition:border-color .2s;}
.img-upload:hover{border-color:var(--rust);}
.img-upload img{width:100%;height:100%;object-fit:cover;}
.img-placeholder{text-align:center;display:flex;flex-direction:column;align-items:center;gap:0.4rem;}
.img-placeholder span{font-size:2rem;}
.img-placeholder div{font-size:0.83rem;color:rgba(13,13,13,0.4);}
.img-hint{font-size:0.72rem;color:rgba(13,13,13,0.25)!important;}
.remove-img{background:none;border:none;font-size:0.75rem;color:var(--rust);cursor:pointer;margin-top:0.4rem;padding:0;}
.price-wrap{display:flex;align-items:center;background:white;border:1.5px solid var(--border);border-radius:10px;overflow:hidden;transition:border-color .2s;}
.price-wrap:focus-within{border-color:var(--rust);}
.price-prefix{padding:0.75rem 0.75rem 0.75rem 0.9rem;font-size:0.83rem;font-weight:600;color:rgba(13,13,13,0.4);background:rgba(13,13,13,0.03);border-right:1px solid var(--border);white-space:nowrap;}
.price-wrap input{border:none!important;border-radius:0!important;flex:1;min-width:0;}
.cond-row{display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;}
.cond-btn{padding:0.8rem 1rem;background:white;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;transition:all .2s;}
.cond-btn:hover{border-color:var(--rust);}
.cond-btn.active{border-color:var(--rust);background:rgba(200,75,49,0.04);}
.cond-label{font-size:0.85rem;font-weight:600;margin-bottom:0.15rem;}
.cond-desc{font-size:0.72rem;color:rgba(13,13,13,0.38);}
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
.preview-wrap{max-width:280px;margin:0 auto;}
.preview-label{font-size:0.72rem;font-weight:600;color:rgba(13,13,13,0.35);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1rem;}
.product-preview-card{background:var(--cream);border-radius:18px;overflow:hidden;border:1px solid var(--border);}
.preview-img{height:160px;background:#e8ede9;display:flex;align-items:center;justify-content:center;font-size:3rem;overflow:hidden;position:relative;}
.preview-img img{width:100%;height:100%;object-fit:cover;}
.discount-tag{position:absolute;top:0.5rem;left:0.5rem;background:var(--rust);color:white;font-size:0.65rem;font-weight:700;padding:0.18rem 0.45rem;border-radius:5px;}
.preview-body{padding:0.9rem;}
.preview-shop-name{font-size:0.7rem;color:var(--sage);font-weight:500;margin-bottom:0.2rem;}
.preview-prod-name{font-family:'Syne',sans-serif;font-size:0.88rem;font-weight:700;margin-bottom:0.35rem;line-height:1.3;}
.preview-price-row{display:flex;align-items:center;gap:0.4rem;margin-bottom:0.25rem;}
.preview-price{font-size:0.9rem;font-weight:700;color:var(--rust);}
.preview-original{font-size:0.7rem;color:rgba(13,13,13,0.3);text-decoration:line-through;}
.preview-meta{font-size:0.7rem;color:rgba(13,13,13,0.38);display:flex;gap:0.25rem;flex-wrap:wrap;}
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
  .form-row{grid-template-columns:1fr;}
}
`;
