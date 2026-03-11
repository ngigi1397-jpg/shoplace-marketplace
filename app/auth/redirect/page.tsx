"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function CallbackHandler() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "buyer";
  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setTimeout(async () => {
          const { data: { session: s2 } } = await supabase.auth.getSession();
          if (s2?.user) await createProfileIfNeeded(s2.user, role, redirect);
          else window.location.href = "/auth/login?error=oauth-failed";
        }, 1500);
        return;
      }
      await createProfileIfNeeded(session.user, role, redirect);
    };
    handleCallback();
  }, []);

  const createProfileIfNeeded = async (user: any, userRole: string, redirectTo: string) => {
    const { data: existing } = await supabase.from("users").select("id, role").eq("id", user.id).maybeSingle();
    if (!existing) {
      await supabase.from("users").insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        email: user.email, phone: "", role: userRole,
        county: "", constituency: "", is_verified: false, is_suspended: false,
      });
    }
    const finalRole = existing?.role || userRole;
    if (redirectTo && redirectTo !== "/") window.location.href = redirectTo;
    else if (finalRole === "seller") window.location.href = "/seller/dashboard";
    else window.location.href = "/";
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f5f0e8", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1rem" }}>
      <div style={{ width:"40px", height:"40px", border:"3px solid rgba(13,13,13,0.1)", borderTopColor:"#c84b31", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <p style={{ fontFamily:"sans-serif", fontSize:"0.9rem", color:"rgba(13,13,13,0.45)" }}>Signing you in...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh", background:"#f5f0e8" }} />}>
      <CallbackHandler />
    </Suspense>
  );
}