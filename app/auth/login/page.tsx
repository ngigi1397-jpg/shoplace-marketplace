"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw new Error(authError.message);
      window.location.href = redirect;
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="auth-page">
        <div className="auth-split">

          {/* LEFT */}
          <div className="auth-left">
            <a href="/" className="sp-logo">Sho<span>place</span></a>
            <div className="auth-left-content">
              <h2>Welcome back to Shoplace</h2>
              <p>Kenya&apos;s local marketplace connecting buyers and sellers across all 47 counties.</p>
              <div className="auth-perks">
                <div className="perk">🛍️ Browse verified products</div>
                <div className="perk">🏪 Manage your shop</div>
                <div className="perk">⚙️ Access your services</div>
                <div className="perk">📍 Connect with local sellers</div>
              </div>
            </div>
            <div className="auth-left-footer">
              Don&apos;t have an account? <a href="/auth/signup">Sign up free →</a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="auth-right">
            <div className="auth-form-wrap">
              <h3>Sign in to your account</h3>
              <p className="form-sub">
                {redirect !== "/" && redirect !== "" ? (
                  <span className="redirect-notice">🔒 Sign in to access this page</span>
                ) : "Good to have you back!"}
              </p>

              <div className="fg">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  autoFocus
                />
              </div>

              <div className="fg">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                <div style={{ textAlign: "right", marginTop: "-0.5rem", marginBottom: "0.8rem" }}>
                  <a href="/auth/forgot-password" style={{ fontSize: "0.78rem", color: "#c84b31", fontWeight: 500 }}>
                    Forgot password?
                  </a>
                </div>
              </div>

              {error && <div className="form-error">⚠️ {error}</div>}

              <button className="btn-solid btn-full" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in..." : "Sign In →"}
              </button>

              <div className="divider"><span>or</span></div>

              <div className="signup-prompt">
                Don&apos;t have an account yet?{" "}
                <a href="/auth/signup">Create a free account →</a>
              </div>

              <div className="admin-note">
                Admin? <a href="/admin/login">Go to Admin Portal →</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f5f0e8" }} />}>
      <LoginForm />
    </Suspense>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
:root{--ink:#0d0d0d;--cream:#f5f0e8;--rust:#c84b31;--border:rgba(13,13,13,0.12);}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);}
a{text-decoration:none;color:inherit;}
.auth-page{min-height:100vh;}
.auth-split{display:grid;grid-template-columns:1fr 1.3fr;min-height:100vh;}
.auth-left{background:var(--ink);color:white;padding:3rem;display:flex;flex-direction:column;justify-content:space-between;}
.sp-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.5rem;letter-spacing:-.04em;color:white;}
.sp-logo span{color:#f87171;}
.auth-left-content{flex:1;display:flex;flex-direction:column;justify-content:center;max-width:320px;}
.auth-left h2{font-family:'Syne',sans-serif;font-size:1.9rem;font-weight:800;line-height:1.15;letter-spacing:-.03em;margin-bottom:1rem;}
.auth-left p{font-size:.9rem;color:rgba(255,255,255,.42);line-height:1.7;margin-bottom:2rem;}
.auth-perks{display:flex;flex-direction:column;gap:.7rem;}
.perk{font-size:.85rem;color:rgba(255,255,255,.5);}
.auth-left-footer{font-size:.83rem;color:rgba(255,255,255,.32);}
.auth-left-footer a{color:rgba(255,255,255,.65);font-weight:500;}
.auth-left-footer a:hover{color:white;}
.auth-right{background:var(--cream);padding:3rem;display:flex;align-items:center;justify-content:center;}
.auth-form-wrap{width:100%;max-width:420px;}
.auth-form-wrap h3{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;letter-spacing:-.02em;margin-bottom:.3rem;}
.form-sub{font-size:.85rem;color:rgba(13,13,13,.42);margin-bottom:2rem;}
.redirect-notice{background:rgba(200,75,49,.07);border:1px solid rgba(200,75,49,.15);color:var(--rust);padding:.35rem .75rem;border-radius:6px;font-size:.8rem;}
.fg{margin-bottom:1.1rem;}
.fg label{display:block;font-size:.74rem;font-weight:600;color:rgba(13,13,13,.48);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.38rem;}
.fg input{width:100%;padding:.78rem .95rem;background:white;border:1.5px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.9rem;color:var(--ink);outline:none;transition:border-color .2s;}
.fg input:focus{border-color:var(--rust);}
.fg-footer{text-align:right;margin-top:.4rem;}
.forgot-link{font-size:.78rem;color:var(--rust);font-weight:500;}
.form-error{background:rgba(200,75,49,.08);border:1px solid rgba(200,75,49,.2);border-radius:8px;padding:.75rem 1rem;font-size:.82rem;color:var(--rust);margin-bottom:1rem;}
.btn-solid{padding:.7rem 1.4rem;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:600;background:var(--rust);color:white;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;}
.btn-solid:hover:not(:disabled){background:#a83a22;transform:translateY(-1px);}
.btn-solid:disabled{opacity:.6;cursor:not-allowed;}
.btn-full{width:100%;padding:.88rem;}
.divider{display:flex;align-items:center;gap:1rem;margin:1.3rem 0;color:rgba(13,13,13,.28);font-size:.8rem;}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border);}
.signup-prompt{text-align:center;font-size:.85rem;color:rgba(13,13,13,.5);}
.signup-prompt a{color:var(--rust);font-weight:600;}
.admin-note{text-align:center;font-size:.76rem;color:rgba(13,13,13,.28);margin-top:1.2rem;}
.admin-note a{color:rgba(13,13,13,.4);font-weight:500;}
.admin-note a:hover{color:var(--ink);}
`;