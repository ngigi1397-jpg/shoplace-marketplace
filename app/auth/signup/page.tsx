"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

function SignUpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = searchParams.get("role") as "buyer" | "seller" | null;

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", password: "", confirm_password: "",
    county: "", constituency: "", role: roleParam || "buyer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (roleParam) setForm(prev => ({ ...prev, role: roleParam }));
  }, [roleParam]);

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.full_name || !form.email || !form.phone || !form.password || !form.county) {
      setError("Please fill in all required fields."); return;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            phone: form.phone,
            role: form.role,
            county: form.county,
            constituency: form.constituency,
          }
        }
      });
      if (signUpError) throw new Error(signUpError.message);
      if (!data.user) throw new Error("Failed to create account.");

      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        county: form.county,
        constituency: form.constituency,
        is_verified: false,
        is_suspended: false,
      });
      if (profileError) throw new Error(profileError.message);

      router.push(`/auth/verify?email=${encodeURIComponent(form.email)}&role=${form.role}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="auth-page">
        <div className="auth-grid">

          {/* LEFT - hidden on mobile */}
          <div className="auth-left">
            <a href="/" className="auth-logo">Sho<span>place</span></a>
            <div className="auth-left-body">
              <div className="role-pill">
                {form.role === "seller" ? "🏪 Seller Account" : "🛍️ Buyer Account"}
              </div>
              <h2>Create your<br />free account</h2>
              <p>Join Kenyans buying and selling on Shoplace.</p>
              <ul className="perks">
                {form.role === "seller" ? (
                  <>
                    <li>✓ Get a unique shop number</li>
                    <li>✓ List unlimited products</li>
                    <li>✓ Offer your services</li>
                    <li>✓ Reach buyers in your county</li>
                    <li>✓ 100% free to start</li>
                  </>
                ) : (
                  <>
                    <li>✓ Browse products from all 47 counties</li>
                    <li>✓ Contact sellers directly via WhatsApp</li>
                    <li>✓ Find services near you</li>
                    <li>✓ Completely free to join</li>
                  </>
                )}
              </ul>
              <div className="switch-role">
                {form.role === "seller"
                  ? <><span>Want to buy instead?</span> <a href="/auth/signup?role=buyer">Switch to Buyer →</a></>
                  : <><span>Want to sell?</span> <a href="/auth/signup?role=seller">Switch to Seller →</a></>
                }
              </div>
            </div>
            <div className="auth-left-footer">
              Already have an account? <a href="/auth/login">Sign in →</a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="auth-right">
            <div className="form-wrap">

              {/* Mobile-only logo */}
              <a href="/" className="mobile-logo">Sho<span>place</span></a>

              <h3>Create Account</h3>
              <p className="form-sub">Fill in your details below to get started</p>

              <div className="role-toggle">
                <div className={`rtab ${form.role === "buyer" ? "active" : ""}`} onClick={() => update("role", "buyer")}>
                  🛍️ I want to Buy
                </div>
                <div className={`rtab ${form.role === "seller" ? "active" : ""}`} onClick={() => update("role", "seller")}>
                  🏪 I want to Sell
                </div>
              </div>

              <div className="fg">
                <label>Full Name *</label>
                <input type="text" placeholder="e.g. John Kamau" value={form.full_name} onChange={e => update("full_name", e.target.value)} />
              </div>

              <div className="fg">
                <label>Email Address *</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => update("email", e.target.value)} />
              </div>

              <div className="fg">
                <label>Phone Number *</label>
                <input type="tel" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={e => update("phone", e.target.value)} />
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
                  <input type="text" placeholder="e.g. Westlands" value={form.constituency} onChange={e => update("constituency", e.target.value)} />
                </div>
              </div>

              <div className="fg">
                <label>Password *</label>
                <div className="pw-wrap">
                  <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={e => update("password", e.target.value)} />
                  <button className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
                </div>
              </div>

              <div className="fg">
                <label>Confirm Password *</label>
                <input type="password" placeholder="Repeat your password" value={form.confirm_password} onChange={e => update("confirm_password", e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              </div>

              {error && <div className="form-error">⚠️ {error}</div>}

              <button className="btn-solid btn-full" onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating Account..." : `Create ${form.role === "seller" ? "Seller" : "Buyer"} Account →`}
              </button>

              <p className="form-terms">
                By signing up you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
              </p>

              <div className="signin-prompt">
                Already have an account? <a href="/auth/login">Sign in →</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f5f0e8" }} />}>
      <SignUpForm />
    </Suspense>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
:root{--ink:#0d0d0d;--cream:#f5f0e8;--rust:#c84b31;--border:rgba(13,13,13,0.1);}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);}
a{text-decoration:none;color:inherit;}
.auth-page{min-height:100vh;background:var(--cream);}
.auth-grid{display:grid;grid-template-columns:1fr 1.2fr;min-height:100vh;}
.auth-left{background:var(--ink);padding:3rem;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.auth-left::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 70%,rgba(200,75,49,0.2),transparent 55%);}
.auth-logo{position:relative;z-index:1;font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800;color:white;letter-spacing:-0.04em;margin-bottom:2.5rem;}
.auth-logo span{color:var(--rust);}
.auth-left-body{position:relative;z-index:1;flex:1;}
.role-pill{display:inline-flex;padding:0.35rem 1rem;background:rgba(200,75,49,0.15);border:1px solid rgba(200,75,49,0.25);border-radius:100px;font-size:0.78rem;font-weight:600;color:#f87171;margin-bottom:1.5rem;}
.auth-left h2{font-family:'Syne',sans-serif;font-size:1.9rem;font-weight:800;color:white;line-height:1.1;letter-spacing:-0.03em;margin-bottom:0.8rem;}
.auth-left p{font-size:0.85rem;color:rgba(255,255,255,0.38);line-height:1.7;margin-bottom:1.5rem;}
.perks{list-style:none;display:flex;flex-direction:column;gap:0.5rem;margin-bottom:2rem;}
.perks li{font-size:0.82rem;color:rgba(255,255,255,0.45);}
.switch-role{font-size:0.78rem;color:rgba(255,255,255,0.28);}
.switch-role a{color:var(--rust);font-weight:500;}
.auth-left-footer{position:relative;z-index:1;margin-top:2rem;font-size:0.78rem;color:rgba(255,255,255,0.25);}
.auth-left-footer a{color:rgba(255,255,255,0.5);font-weight:500;}
.auth-right{background:white;padding:3rem;overflow-y:auto;}
.form-wrap{max-width:400px;margin:0 auto;padding:1rem 0;}
.mobile-logo{display:none;font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;letter-spacing:-0.04em;color:var(--ink);margin-bottom:1.8rem;}
.mobile-logo span{color:var(--rust);}
.form-wrap h3{font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800;letter-spacing:-0.02em;margin-bottom:0.3rem;}
.form-sub{font-size:0.82rem;color:rgba(13,13,13,0.4);margin-bottom:1.5rem;}
.role-toggle{display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;background:var(--cream);border-radius:10px;padding:0.3rem;margin-bottom:1.3rem;}
.rtab{padding:0.6rem;text-align:center;border-radius:7px;font-size:0.82rem;font-weight:500;color:rgba(13,13,13,0.4);cursor:pointer;transition:all .2s;}
.rtab.active{background:white;color:var(--ink);font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.07);}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;}
.fg{margin-bottom:0.9rem;}
.fg label{display:block;font-size:0.71rem;font-weight:600;color:rgba(13,13,13,0.42);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.3rem;}
.fg input,.fg select{width:100%;padding:0.68rem 0.85rem;background:var(--cream);border:1.5px solid var(--border);border-radius:9px;font-family:'DM Sans',sans-serif;font-size:0.87rem;color:var(--ink);outline:none;transition:border-color .2s;-webkit-appearance:none;}
.fg input:focus,.fg select:focus{border-color:var(--rust);background:white;}
.pw-wrap{position:relative;}
.pw-wrap input{width:100%;padding-right:3.5rem;}
.pw-toggle{position:absolute;right:0.8rem;top:50%;transform:translateY(-50%);background:none;border:none;font-size:0.74rem;font-weight:600;color:rgba(13,13,13,0.3);cursor:pointer;font-family:'DM Sans',sans-serif;}
.pw-toggle:hover{color:var(--rust);}
.form-error{background:rgba(200,75,49,0.07);border:1px solid rgba(200,75,49,0.18);border-radius:8px;padding:0.65rem 0.9rem;font-size:0.8rem;color:var(--rust);margin-bottom:0.9rem;line-height:1.5;}
.btn-solid{padding:0.75rem 1.5rem;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:600;background:var(--rust);color:white;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;}
.btn-solid:hover:not(:disabled){background:#a83a22;transform:translateY(-1px);}
.btn-solid:disabled{opacity:0.6;cursor:not-allowed;}
.btn-full{width:100%;padding:0.85rem;}
.form-terms{font-size:0.72rem;color:rgba(13,13,13,0.28);text-align:center;margin-top:0.9rem;line-height:1.5;}
.form-terms a{color:var(--rust);}
.signin-prompt{text-align:center;font-size:0.82rem;color:rgba(13,13,13,0.4);margin-top:1rem;}
.signin-prompt a{color:var(--rust);font-weight:600;}

@media(max-width:768px){
  .auth-grid{grid-template-columns:1fr;}
  .auth-left{display:none;}
  .auth-right{padding:2rem 1.5rem;background:var(--cream);}
  .form-wrap{padding:0;}
  .mobile-logo{display:block;}
  .form-row{grid-template-columns:1fr;}
  .form-wrap h3{font-size:1.4rem;}
}
`;