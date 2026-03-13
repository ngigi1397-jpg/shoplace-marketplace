"use client";
import { useState, Suspense } from "react";
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      if (error) throw new Error(error.message);
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
      setGoogleLoading(false);
    }
  };

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

          {/* LEFT - hidden on mobile */}
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
              <a href="/" className="mobile-logo">Sho<span>place</span></a>

              <h3>Sign in to your account</h3>
              <p className="form-sub">
                {redirect !== "/" && redirect !== ""
                  ? <span className="redirect-notice">🔒 Sign in to access this page</span>
                  : "Good to have you back!"}
              </p>

              {/* GOOGLE BUTTON */}
              <button className="btn-google" onClick={handleGoogleLogin} disabled={googleLoading}>
                {googleLoading ? <span className="google-spinner" /> : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                    <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                )}
                {googleLoading ? "Redirecting..." : "Continue with Google"}
              </button>

              <div className="divider"><span>or sign in with email</span></div>

              <div className="fg">
                <label>Email Address</label>
                <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} autoFocus />
              </div>

              <div className="fg">
                <label>Password</label>
                <input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                <div className="fg-footer">
                  <a href="/auth/forgot-password" className="forgot-link">Forgot password?</a>
                </div>
              </div>

              {error && <div className="form-error">⚠️ {error}</div>}

              <button className="btn-solid btn-full" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in..." : "Sign In →"}
              </button>

              <div className="signup-prompt">
                Don&apos;t have an account yet?{" "}
                <a href="/auth/signup">Create a free account →</a>
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
.auth-right{background:var(--cream);padding:3rem;display:flex;align-items:center;justify-content:center;}
.auth-form-wrap{width:100%;max-width:420px;}
.mobile-logo{display:none;font-family:'Syne',sans-serif;font-weight:800;font-size:1.6rem;letter-spacing:-.04em;color:var(--ink);margin-bottom:1.8rem;}
.mobile-logo span{color:var(--rust);}
.auth-form-wrap h3{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;letter-spacing:-.02em;margin-bottom:.3rem;}
.form-sub{font-size:.85rem;color:rgba(13,13,13,.42);margin-bottom:1.5rem;}
.redirect-notice{background:rgba(200,75,49,.07);border:1px solid rgba(200,75,49,.15);color:var(--rust);padding:.35rem .75rem;border-radius:6px;font-size:.8rem;}
.btn-google{width:100%;display:flex;align-items:center;justify-content:center;gap:0.65rem;padding:0.78rem 1rem;background:white;border:1.5px solid rgba(13,13,13,0.15);border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:600;color:var(--ink);cursor:pointer;transition:all .2s;margin-bottom:0.3rem;}
.btn-google:hover:not(:disabled){border-color:rgba(13,13,13,0.35);box-shadow:0 2px 12px rgba(0,0,0,0.08);transform:translateY(-1px);}
.btn-google:disabled{opacity:0.6;cursor:not-allowed;}
.google-spinner{width:18px;height:18px;border:2px solid rgba(13,13,13,0.15);border-top-color:var(--rust);border-radius:50%;animation:spin 0.7s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg)}}
.divider{display:flex;align-items:center;gap:1rem;margin:1rem 0;color:rgba(13,13,13,.28);font-size:.75rem;}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border);}
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
.signup-prompt{text-align:center;font-size:.85rem;color:rgba(13,13,13,.5);margin-top:1.2rem;}
.signup-prompt a{color:var(--rust);font-weight:600;}
.admin-note{text-align:center;font-size:.76rem;color:rgba(13,13,13,.28);margin-top:1.2rem;}
.admin-note a{color:rgba(13,13,13,.4);font-weight:500;}
.admin-note a:hover{color:var(--ink);}
@media(max-width:768px){
  .auth-split{grid-template-columns:1fr;}
  .auth-left{display:none;}
  .auth-right{padding:2rem 1.5rem;align-items:flex-start;min-height:100vh;}
  .mobile-logo{display:block;}
  .auth-form-wrap h3{font-size:1.4rem;}
}
`;