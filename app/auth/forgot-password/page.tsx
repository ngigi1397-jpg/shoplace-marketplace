"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw new Error(error.message);
      setSent(true);
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
        <div className="auth-card">

          {/* LOGO */}
          <a href="/" className="auth-logo">Sho<span>place</span></a>

          {!sent ? (
            <>
              <div className="card-icon">🔑</div>
              <h2>Forgot Password?</h2>
              <p>Enter the email address you used to create your account. We will send you a link to reset your password.</p>

              <div className="fg">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  autoFocus
                />
              </div>

              {error && <div className="form-error">⚠️ {error}</div>}

              <button className="btn-solid btn-full" onClick={handleSubmit} disabled={loading}>
                {loading ? "Sending Reset Link..." : "Send Reset Link →"}
              </button>

              <div className="back-link">
                <a href="/auth/login">← Back to Login</a>
              </div>
            </>
          ) : (
            <>
              <div className="card-icon">📧</div>
              <h2>Check Your Email</h2>
              <div className="sent-email">{email}</div>
              <p>We have sent a password reset link to the email above. Click the link in the email to set a new password.</p>
              <div className="sent-notes">
                <div className="sent-note">📬 Check your spam folder if you don&apos;t see it</div>
                <div className="sent-note">⏱️ The link expires in 1 hour</div>
                <div className="sent-note">🔄 <span className="resend-link" onClick={() => { setSent(false); }}>Send again with a different email</span></div>
              </div>
              <a href="/auth/login" className="btn-solid btn-full" style={{ marginTop: "1.5rem" }}>
                Back to Login →
              </a>
            </>
          )}
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
.auth-page{min-height:100vh;background:var(--cream);display:flex;align-items:center;justify-content:center;padding:2rem;}
.auth-card{background:white;border-radius:24px;border:1px solid var(--border);padding:3rem;width:100%;max-width:440px;box-shadow:0 16px 48px rgba(0,0,0,0.07);text-align:center;}
.auth-logo{font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:var(--ink);letter-spacing:-0.04em;display:block;margin-bottom:2rem;}
.auth-logo span{color:var(--rust);}
.card-icon{font-size:2.8rem;margin-bottom:1rem;}
.auth-card h2{font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800;letter-spacing:-0.02em;margin-bottom:0.7rem;}
.auth-card p{font-size:0.85rem;color:rgba(13,13,13,0.48);line-height:1.7;margin-bottom:1.8rem;}
.fg{text-align:left;margin-bottom:1rem;}
.fg label{display:block;font-size:0.72rem;font-weight:600;color:rgba(13,13,13,0.42);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.35rem;}
.fg input{width:100%;padding:0.75rem 0.9rem;background:var(--cream);border:1.5px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:0.88rem;color:var(--ink);outline:none;transition:border-color .2s;}
.fg input:focus{border-color:var(--rust);background:white;}
.form-error{background:rgba(200,75,49,0.07);border:1px solid rgba(200,75,49,0.18);border-radius:8px;padding:0.65rem 0.9rem;font-size:0.8rem;color:var(--rust);margin-bottom:1rem;line-height:1.5;text-align:left;}
.btn-solid{padding:0.8rem 1.5rem;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:600;background:var(--rust);color:white;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;}
.btn-solid:hover:not(:disabled){background:#a83a22;transform:translateY(-1px);}
.btn-solid:disabled{opacity:0.6;cursor:not-allowed;}
.btn-full{width:100%;}
.back-link{margin-top:1.2rem;font-size:0.82rem;}
.back-link a{color:var(--rust);font-weight:500;}
.sent-email{display:inline-flex;padding:0.4rem 1.1rem;background:rgba(200,75,49,0.07);border:1px solid rgba(200,75,49,0.15);border-radius:100px;font-size:0.85rem;font-weight:600;color:var(--rust);margin-bottom:1.2rem;}
.sent-notes{display:flex;flex-direction:column;gap:0.6rem;margin-bottom:0.5rem;text-align:left;background:var(--cream);border-radius:12px;padding:1rem 1.2rem;}
.sent-note{font-size:0.82rem;color:rgba(13,13,13,0.48);line-height:1.5;}
.resend-link{color:var(--rust);font-weight:500;cursor:pointer;text-decoration:underline;}
`;
