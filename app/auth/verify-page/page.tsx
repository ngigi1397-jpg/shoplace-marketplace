"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function VerifyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const role = searchParams.get("role") || "buyer";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const token = otp.join("");
    if (token.length !== 6) { setError("Please enter the full 6-digit code."); return; }
    setError("");
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });
      if (verifyError) throw new Error(verifyError.message);
      // Success — redirect to login
      router.push(`/auth/login?verified=true&role=${role}`);
    } catch (err: any) {
      setError(err.message || "Invalid or expired code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    setError("");
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw new Error(error.message);
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="verify-page">
        <div className="verify-card">

          <a href="/" className="verify-logo">Sho<span>place</span></a>

          <div className="verify-icon">📬</div>
          <h2>Check your email</h2>
          <p className="verify-sub">
            We sent a 6-digit verification code to<br />
            <strong>{email || "your email address"}</strong>
          </p>

          <div className="otp-row" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el; }}
                className={`otp-input ${digit ? "filled" : ""}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
              />
            ))}
          </div>

          {error && <div className="verify-error">⚠️ {error}</div>}

          <button className="btn-verify" onClick={handleVerify} disabled={loading || otp.join("").length !== 6}>
            {loading ? "Verifying..." : "Verify Email →"}
          </button>

          <div className="resend-row">
            <span>Didn't receive a code?</span>
            <button
              className="resend-btn"
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
            >
              {resending ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </button>
          </div>

          <a href="/auth/signup" className="back-link">← Back to Sign Up</a>
        </div>
      </div>
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f5f0e8" }} />}>
      <VerifyForm />
    </Suspense>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
:root{--ink:#0d0d0d;--cream:#f5f0e8;--rust:#c84b31;--border:rgba(13,13,13,0.1);}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);}
a{text-decoration:none;color:inherit;}
.verify-page{min-height:100vh;background:var(--cream);display:flex;align-items:center;justify-content:center;padding:2rem;}
.verify-card{background:white;border-radius:24px;border:1px solid var(--border);padding:3rem 2.5rem;text-align:center;width:100%;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,0.07);}
.verify-logo{font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:var(--ink);letter-spacing:-0.04em;display:block;margin-bottom:2rem;}
.verify-logo span{color:var(--rust);}
.verify-icon{font-size:3rem;margin-bottom:1rem;animation:bounce 1s ease infinite alternate;}
@keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-6px)}}
.verify-card h2{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;letter-spacing:-0.02em;margin-bottom:0.6rem;}
.verify-sub{font-size:0.85rem;color:rgba(13,13,13,0.45);line-height:1.7;margin-bottom:2rem;}
.verify-sub strong{color:var(--ink);font-weight:600;}
.otp-row{display:flex;gap:0.6rem;justify-content:center;margin-bottom:1.5rem;}
.otp-input{width:48px;height:56px;text-align:center;font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:700;border:2px solid var(--border);border-radius:12px;background:var(--cream);color:var(--ink);outline:none;transition:all .2s;-webkit-appearance:none;}
.otp-input:focus{border-color:var(--rust);background:white;box-shadow:0 0 0 3px rgba(200,75,49,0.1);}
.otp-input.filled{border-color:var(--rust);background:white;}
.verify-error{background:rgba(200,75,49,0.07);border:1px solid rgba(200,75,49,0.18);border-radius:8px;padding:0.65rem 0.9rem;font-size:0.8rem;color:var(--rust);margin-bottom:1rem;line-height:1.5;}
.btn-verify{width:100%;padding:0.85rem;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:600;background:var(--rust);color:white;cursor:pointer;transition:all .2s;margin-bottom:1.2rem;}
.btn-verify:hover:not(:disabled){background:#a83a22;transform:translateY(-1px);}
.btn-verify:disabled{opacity:0.45;cursor:not-allowed;transform:none;}
.resend-row{display:flex;align-items:center;justify-content:center;gap:0.4rem;font-size:0.8rem;color:rgba(13,13,13,0.4);margin-bottom:1.5rem;}
.resend-btn{background:none;border:none;font-family:'DM Sans',sans-serif;font-size:0.8rem;font-weight:600;color:var(--rust);cursor:pointer;padding:0;}
.resend-btn:disabled{color:rgba(13,13,13,0.3);cursor:not-allowed;}
.resend-btn:not(:disabled):hover{text-decoration:underline;}
.back-link{font-size:0.78rem;color:rgba(13,13,13,0.35);transition:color .2s;}
.back-link:hover{color:var(--ink);}
`;