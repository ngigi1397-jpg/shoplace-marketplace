"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if user has a valid reset session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      }
      setChecking(false);
    });

    // Listen for the password recovery event
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidSession(true);
        setChecking(false);
      }
    });
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (!password || !confirm) { setError("Please fill in both fields."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <div style={{ minHeight: "100vh", background: "#f5f0e8" }} />;

  return (
    <>
      <style>{css}</style>
      <div className="auth-page">
        <div className="auth-card">
          <a href="/" className="auth-logo">Sho<span>place</span></a>

          {success ? (
            <>
              <div className="card-icon">✅</div>
              <h2>Password Reset!</h2>
              <p>Your password has been updated successfully. You can now log in with your new password.</p>
              <a href="/auth/login" className="btn-solid btn-full">Login with New Password →</a>
            </>
          ) : !validSession ? (
            <>
              <div className="card-icon">⚠️</div>
              <h2>Invalid or Expired Link</h2>
              <p>This password reset link is invalid or has expired. Please request a new one.</p>
              <a href="/auth/forgot-password" className="btn-solid btn-full">Request New Link →</a>
              <div className="back-link"><a href="/auth/login">← Back to Login</a></div>
            </>
          ) : (
            <>
              <div className="card-icon">🔒</div>
              <h2>Set New Password</h2>
              <p>Choose a strong password for your Shoplace account.</p>

              <div className="fg">
                <label>New Password</label>
                <div className="pw-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="fg">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
              </div>

              {/* PASSWORD STRENGTH */}
              {password.length > 0 && (
                <div className="strength-bar">
                  <div className="strength-track">
                    <div
                      className="strength-fill"
                      style={{
                        width: password.length < 8 ? "33%" : password.length < 12 ? "66%" : "100%",
                        background: password.length < 8 ? "#ff4f4f" : password.length < 12 ? "#f5a623" : "#34c77b"
                      }}
                    />
                  </div>
                  <div className="strength-label" style={{ color: password.length < 8 ? "#ff4f4f" : password.length < 12 ? "#f5a623" : "#34c77b" }}>
                    {password.length < 8 ? "Weak" : password.length < 12 ? "Good" : "Strong"}
                  </div>
                </div>
              )}

              {error && <div className="form-error">⚠️ {error}</div>}

              <button className="btn-solid btn-full" onClick={handleSubmit} disabled={loading}>
                {loading ? "Updating Password..." : "Set New Password →"}
              </button>

              <div className="back-link"><a href="/auth/login">← Back to Login</a></div>
            </>
          )}
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
.pw-wrap{position:relative;}
.pw-wrap input{width:100%;padding-right:3.5rem;}
.pw-toggle{position:absolute;right:0.8rem;top:50%;transform:translateY(-50%);background:none;border:none;font-size:0.74rem;font-weight:600;color:rgba(13,13,13,0.3);cursor:pointer;font-family:'DM Sans',sans-serif;}
.pw-toggle:hover{color:var(--rust);}
.strength-bar{display:flex;align-items:center;gap:0.7rem;margin-bottom:1rem;}
.strength-track{flex:1;height:4px;background:rgba(13,13,13,0.08);border-radius:100px;overflow:hidden;}
.strength-fill{height:100%;border-radius:100px;transition:all .3s;}
.strength-label{font-size:0.72rem;font-weight:600;min-width:40px;}
.form-error{background:rgba(200,75,49,0.07);border:1px solid rgba(200,75,49,0.18);border-radius:8px;padding:0.65rem 0.9rem;font-size:0.8rem;color:var(--rust);margin-bottom:1rem;line-height:1.5;text-align:left;}
.btn-solid{padding:0.8rem 1.5rem;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:600;background:var(--rust);color:white;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;}
.btn-solid:hover:not(:disabled){background:#a83a22;transform:translateY(-1px);}
.btn-solid:disabled{opacity:0.6;cursor:not-allowed;}
.btn-full{width:100%;}
.back-link{margin-top:1.2rem;font-size:0.82rem;}
.back-link a{color:var(--rust);font-weight:500;}
`;
