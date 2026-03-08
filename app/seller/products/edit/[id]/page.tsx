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

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [shopId, setShopId]         = useState<string>("");

  const [form, setForm] = useState({
    name: "", description: "", category: "", price: "",
    original_price: "", county: "", constituency: "",
    quantity: "", condition: "new", is_active: true,
  });

  const update = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = "/auth/login"; return; }

      // Load the product
      const { data: product, error: pErr } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .maybeSingle();

      if (pErr || !product) {
        setError("Product not found.");
        setLoading(false);
        return;
      }

      // Verify this product belongs to the logged-in seller
      const { data: shop } = await supabase
        .from("shops")
        .select("id, owner_id")
        .eq("id", product.shop_id)
        .maybeSingle();

      if (!shop || shop.owner_id !== session.user.id) {
        window.location.href = "/seller/dashboard";
        return;
      }

      setShopId(product.shop_id);
      setForm({
        name:           product.name || "",
        description:    product.description || "",
        category:       product.category || "",
        price:          product.price?.toString() || "",
        original_price: product.original_price?.toString() || "",
        county:         product.county || "",
        constituency:   product.constituency || "",
        quantity:       product.quantity?.toString() || "",
        condition:      product.condition || "new",
        is_active:      product.is_active ?? true,
      });
      if (product.image_url) setImagePreview(product.image_url);
      setLoading(false);
    });
  }, [params.id]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim())     { setError("Product name is required."); return; }
    if (!form.category)        { setError("Please select a category."); return; }
    if (!form.price)           { setError("Price is required."); return; }
    if (!form.county)          { setError("Please select a county."); return; }

    setSubmitting(true);
    try {
      let image_url: string | undefined = undefined;

      // Upload new image if selected
      if (imageFile) {
        const ext  = imageFile.name.split(".").pop();
        const path = `products/${shopId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, imageFile, { upsert: true });
        if (upErr) throw new Error("Image upload failed: " + upErr.message);
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        image_url = urlData.publicUrl;
      }

      const payload: any = {
        name:           form.name.trim(),
        description:    form.description.trim(),
        category:       form.category,
        price:          parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        county:         form.county,
        constituency:   form.constituency.trim(),
        quantity:       form.quantity ? parseInt(form.quantity) : null,
        condition:      form.condition,
        is_active:      form.is_active,
      };
      if (image_url) payload.image_url = image_url;

      const { error: updateErr } = await supabase
        .from("products")
        .update(payload)
        .eq("id", params.id);

      if (updateErr) throw new Error(updateErr.message);

      setSuccess(true);
      setTimeout(() => window.location.href = "/seller/dashboard", 1800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#f5f0e8", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"sans-serif", color:"rgba(13,13,13,0.35)" }}>Loading product...</div>
    </div>
  );

  if (success) return (
    <div style={{ minHeight:"100vh", background:"#f5f0e8", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center", fontFamily:"sans-serif" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>✅</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.3rem", fontWeight:800 }}>Product Updated!</div>
        <div style={{ color:"rgba(13,13,13,0.45)", marginTop:"0.5rem", fontSize:"0.9rem" }}>Redirecting to dashboard...</div>
      </div>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="ep-page">

        {/* NAV */}
        <nav className="ep-nav">
          <a href="/" className="ep-logo">Sho<span>place</span></a>
          <div className="ep-nav-right">
            <a href="/seller/dashboard" className="ep-back">← Back to Dashboard</a>
          </div>
        </nav>

        <div className="ep-wrap">
          <div className="ep-header">
            <h1>Edit Product</h1>
            <p>Update your product details below</p>
          </div>

          <div className="ep-grid">

            {/* LEFT — form */}
            <div className="ep-form">

              {error && <div className="ep-error">⚠️ {error}</div>}

              {/* Product name */}
              <div className="ep-field">
                <label>Product Name <span className="req">*</span></label>
                <input type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Samsung Galaxy A15" maxLength={100}/>
              </div>

              {/* Description */}
              <div className="ep-field">
                <label>Description</label>
                <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Describe your product — condition, features, what's included..." rows={4} maxLength={1000}/>
                <div className="ep-char">{form.description.length}/1000</div>
              </div>

              {/* Category + Condition */}
              <div className="ep-row">
                <div className="ep-field">
                  <label>Category <span className="req">*</span></label>
                  <select value={form.category} onChange={e => update("category", e.target.value)}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="ep-field">
                  <label>Condition <span className="req">*</span></label>
                  <select value={form.condition} onChange={e => update("condition", e.target.value)}>
                    <option value="new">✨ New</option>
                    <option value="used">♻️ Used</option>
                  </select>
                </div>
              </div>

              {/* Price + Original price */}
              <div className="ep-row">
                <div className="ep-field">
                  <label>Selling Price (KSh) <span className="req">*</span></label>
                  <input type="number" value={form.price} onChange={e => update("price", e.target.value)} placeholder="e.g. 12000" min="0"/>
                </div>
                <div className="ep-field">
                  <label>Original Price (KSh) <span style={{fontSize:"0.72rem",color:"rgba(13,13,13,0.35)"}}>optional — shows discount</span></label>
                  <input type="number" value={form.original_price} onChange={e => update("original_price", e.target.value)} placeholder="e.g. 15000" min="0"/>
                </div>
              </div>

              {/* County + Constituency */}
              <div className="ep-row">
                <div className="ep-field">
                  <label>County <span className="req">*</span></label>
                  <select value={form.county} onChange={e => update("county", e.target.value)}>
                    <option value="">Select county</option>
                    {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="ep-field">
                  <label>Constituency / Area <span style={{fontSize:"0.72rem",color:"rgba(13,13,13,0.35)"}}>optional</span></label>
                  <input type="text" value={form.constituency} onChange={e => update("constituency", e.target.value)} placeholder="e.g. Westlands"/>
                </div>
              </div>

              {/* Quantity */}
              <div className="ep-field" style={{ maxWidth:"200px" }}>
                <label>Quantity Available <span style={{fontSize:"0.72rem",color:"rgba(13,13,13,0.35)"}}>optional</span></label>
                <input type="number" value={form.quantity} onChange={e => update("quantity", e.target.value)} placeholder="e.g. 5" min="0"/>
              </div>

              {/* Status toggle */}
              <div className="ep-field">
                <label>Listing Status</label>
                <div className="ep-toggle-row">
                  <div className={"ep-toggle" + (form.is_active ? " ep-toggle-on" : "")} onClick={() => update("is_active", !form.is_active)}>
                    <div className="ep-toggle-thumb"/>
                  </div>
                  <div>
                    <div className="ep-toggle-label">{form.is_active ? "● Live — visible to buyers" : "● Draft — hidden from buyers"}</div>
                    <div className="ep-toggle-sub">{form.is_active ? "Buyers can see and contact you about this product" : "Only you can see this product"}</div>
                  </div>
                </div>
              </div>

              {/* Discount preview */}
              {form.price && form.original_price && parseFloat(form.original_price) > parseFloat(form.price) && (
                <div className="ep-discount-preview">
                  🎉 This shows a <strong>{Math.round((1 - parseFloat(form.price) / parseFloat(form.original_price)) * 100)}% discount</strong> badge to buyers
                </div>
              )}

              {/* Buttons */}
              <div className="ep-actions">
                <button className="btn-update" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Saving..." : "✓ Save Changes"}
                </button>
                <button className="btn-cancel" onClick={() => window.location.href = "/seller/dashboard"}>
                  Cancel
                </button>
              </div>
            </div>

            {/* RIGHT — image */}
            <div className="ep-right">
              <div className="ep-image-card">
                <div className="ep-image-label">Product Image</div>
                <div className="ep-image-box" onClick={() => document.getElementById("ep-img-input")?.click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview"/>
                  ) : (
                    <div className="ep-image-placeholder">
                      <div className="ep-image-icon">📷</div>
                      <div className="ep-image-hint">Click to upload image</div>
                      <div className="ep-image-sub">JPG, PNG or WEBP · Max 5MB</div>
                    </div>
                  )}
                </div>
                <input id="ep-img-input" type="file" accept="image/*" style={{ display:"none" }} onChange={handleImage}/>
                {imagePreview && (
                  <button className="ep-img-change" onClick={() => document.getElementById("ep-img-input")?.click()}>
                    Change Image
                  </button>
                )}
              </div>

              {/* Tips */}
              <div className="ep-tips">
                <div className="ep-tips-title">💡 Tips for more sales</div>
                <ul>
                  <li>Use a clear photo with good lighting</li>
                  <li>Write a detailed description including brand, size, colour</li>
                  <li>Set a competitive price and show the original if discounted</li>
                  <li>Keep your listing Active so buyers can find it</li>
                </ul>
              </div>
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

.ep-page{min-height:100vh;background:var(--cream);}

/* NAV */
.ep-nav{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:1rem 3rem;background:rgba(245,240,232,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);}
.ep-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.4rem;letter-spacing:-0.04em;color:var(--ink);}
.ep-logo span{color:var(--rust);}
.ep-back{font-size:0.84rem;color:rgba(13,13,13,0.5);transition:color .2s;}
.ep-back:hover{color:var(--ink);}

/* WRAP */
.ep-wrap{max-width:1000px;margin:0 auto;padding:2.5rem 2rem;}
.ep-header{margin-bottom:2rem;}
.ep-header h1{font-family:'Syne',sans-serif;font-size:1.75rem;font-weight:800;letter-spacing:-0.03em;}
.ep-header p{font-size:0.85rem;color:rgba(13,13,13,0.42);margin-top:0.3rem;}

/* GRID */
.ep-grid{display:grid;grid-template-columns:1fr 320px;gap:2rem;align-items:start;}

/* FORM */
.ep-form{display:flex;flex-direction:column;gap:1.3rem;}
.ep-error{background:rgba(200,75,49,0.07);border:1px solid rgba(200,75,49,0.2);border-radius:10px;padding:0.8rem 1rem;font-size:0.84rem;color:var(--rust);}
.ep-field{display:flex;flex-direction:column;gap:0.4rem;}
.ep-field label{font-size:0.78rem;font-weight:600;color:rgba(13,13,13,0.55);text-transform:uppercase;letter-spacing:0.04em;display:flex;align-items:center;gap:0.4rem;}
.req{color:var(--rust);}
.ep-field input,.ep-field select,.ep-field textarea{padding:0.75rem 0.95rem;background:white;border:1.5px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:0.9rem;color:var(--ink);outline:none;transition:border-color .2s;width:100%;}
.ep-field input:focus,.ep-field select:focus,.ep-field textarea:focus{border-color:var(--rust);}
.ep-field textarea{resize:vertical;min-height:100px;line-height:1.6;}
.ep-char{font-size:0.7rem;color:rgba(13,13,13,0.3);text-align:right;}
.ep-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}

/* TOGGLE */
.ep-toggle-row{display:flex;align-items:flex-start;gap:0.8rem;margin-top:0.2rem;}
.ep-toggle{width:44px;height:24px;background:rgba(13,13,13,0.12);border-radius:100px;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;margin-top:0.15rem;}
.ep-toggle-on{background:var(--rust);}
.ep-toggle-thumb{position:absolute;top:3px;left:3px;width:18px;height:18px;background:white;border-radius:50%;transition:transform .2s;box-shadow:0 1px 4px rgba(0,0,0,0.15);}
.ep-toggle-on .ep-toggle-thumb{transform:translateX(20px);}
.ep-toggle-label{font-size:0.84rem;font-weight:600;}
.ep-toggle-sub{font-size:0.74rem;color:rgba(13,13,13,0.4);margin-top:0.15rem;line-height:1.4;}

/* DISCOUNT PREVIEW */
.ep-discount-preview{background:rgba(52,199,123,0.07);border:1px solid rgba(52,199,123,0.2);border-radius:10px;padding:0.75rem 1rem;font-size:0.82rem;color:#168a4e;}

/* ACTIONS */
.ep-actions{display:flex;gap:0.8rem;padding-top:0.5rem;}
.btn-update{padding:0.7rem 2rem;background:var(--rust);color:white;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:700;cursor:pointer;transition:all .2s;}
.btn-update:hover:not(:disabled){background:#a83a22;transform:translateY(-1px);}
.btn-update:disabled{opacity:0.5;cursor:not-allowed;}
.btn-cancel{padding:0.7rem 1.5rem;background:transparent;border:1.5px solid var(--border);border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:500;color:rgba(13,13,13,0.5);cursor:pointer;transition:all .2s;}
.btn-cancel:hover{border-color:var(--ink);color:var(--ink);}

/* IMAGE CARD */
.ep-right{display:flex;flex-direction:column;gap:1rem;position:sticky;top:80px;}
.ep-image-card{background:white;border:1px solid var(--border);border-radius:16px;padding:1.3rem;}
.ep-image-label{font-size:0.78rem;font-weight:600;color:rgba(13,13,13,0.5);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:0.8rem;}
.ep-image-box{width:100%;aspect-ratio:1;background:#f0f2f0;border-radius:12px;border:2px dashed rgba(13,13,13,0.12);overflow:hidden;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .2s;}
.ep-image-box:hover{border-color:var(--rust);}
.ep-image-box img{width:100%;height:100%;object-fit:cover;}
.ep-image-placeholder{text-align:center;padding:1.5rem;}
.ep-image-icon{font-size:2rem;margin-bottom:0.5rem;}
.ep-image-hint{font-size:0.82rem;font-weight:500;color:rgba(13,13,13,0.45);}
.ep-image-sub{font-size:0.72rem;color:rgba(13,13,13,0.3);margin-top:0.3rem;}
.ep-img-change{width:100%;margin-top:0.8rem;padding:0.5rem;background:transparent;border:1.5px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:0.8rem;color:rgba(13,13,13,0.5);cursor:pointer;transition:all .2s;}
.ep-img-change:hover{border-color:var(--ink);color:var(--ink);}

/* TIPS */
.ep-tips{background:white;border:1px solid var(--border);border-radius:14px;padding:1.2rem;}
.ep-tips-title{font-family:'Syne',sans-serif;font-size:0.88rem;font-weight:700;margin-bottom:0.8rem;}
.ep-tips ul{list-style:none;display:flex;flex-direction:column;gap:0.5rem;}
.ep-tips li{font-size:0.78rem;color:rgba(13,13,13,0.5);padding-left:1rem;position:relative;line-height:1.5;}
.ep-tips li::before{content:'✓';position:absolute;left:0;color:var(--rust);font-weight:700;}

@media(max-width:768px){
  .ep-nav{padding:0.9rem 1rem;}
  .ep-wrap{padding:1.5rem 1rem;}
  .ep-grid{grid-template-columns:1fr;}
  .ep-right{position:static;}
  .ep-row{grid-template-columns:1fr;}
}
`;
