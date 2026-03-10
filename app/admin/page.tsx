"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Page = "dashboard" | "users" | "shops" | "products" | "services" | "verifications" | "reports";

function ShopNum({ num }: { num: string | number }) {
  const n = String(num).replace(/^#/, "").padStart(5, "0");
  return <span style={{ fontFamily:"monospace", fontSize:"0.78rem", color:"#4f7cff", background:"rgba(79,124,255,0.08)", padding:"0.2rem 0.5rem", borderRadius:"4px" }}>#{n}</span>;
}

function Pill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:    "background:rgba(52,199,123,0.1);color:#34c77b",
    approved:  "background:rgba(52,199,123,0.1);color:#34c77b",
    verified:  "background:rgba(255,128,64,0.12);color:#FF8040",
    suspended: "background:rgba(255,79,79,0.1);color:#ff4f4f",
    pending:   "background:rgba(245,166,35,0.1);color:#f5a623",
    review:    "background:rgba(245,166,35,0.1);color:#f5a623",
    rejected:  "background:rgba(255,79,79,0.1);color:#ff4f4f",
    high:      "background:rgba(255,79,79,0.1);color:#ff4f4f",
    medium:    "background:rgba(245,166,35,0.1);color:#f5a623",
  };
  const s = map[status?.toLowerCase()] || "background:rgba(255,255,255,0.06);color:rgba(232,234,240,0.4)";
  return <span dangerouslySetInnerHTML={{ __html: `<span style="display:inline-flex;align-items:center;gap:0.3rem;padding:0.22rem 0.6rem;border-radius:100px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;${s}">● ${status}</span>` }} />;
}

function ProductImage({ url, name }: { url: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) return <div className="product-thumb-fallback">📦</div>;
  return <img src={url} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", borderRadius:"8px" }} onError={() => setFailed(true)} />;
}

function Empty({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div style={{ padding:"4rem 2rem", textAlign:"center", color:"rgba(232,234,240,0.3)" }}>
      <div style={{ fontSize:"2.5rem", marginBottom:"1rem" }}>{icon}</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1rem", fontWeight:700, color:"rgba(232,234,240,0.5)", marginBottom:"0.4rem" }}>{title}</div>
      <div style={{ fontSize:"0.82rem", lineHeight:1.6 }}>{sub}</div>
    </div>
  );
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  return <div style={{ position:"fixed", bottom:"2rem", left:"50%", transform:"translateX(-50%)", background:"#1a3326", color:"white", padding:"0.65rem 1.5rem", borderRadius:"100px", fontSize:"0.84rem", fontWeight:600, zIndex:9999, border:"1px solid rgba(52,199,123,0.3)", whiteSpace:"nowrap" }}>{msg}</div>;
}

export default function AdminDashboard() {
  const [page, setPage] = useState<Page>("dashboard");
  const [toast, setToast] = useState("");

  const [stats, setStats] = useState({ users:0, sellers:0, shops:0, products:0, services:0, pendingShops:0, pendingVerifications:0, reports:0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [verFilter, setVerFilter] = useState<"pending"|"approved"|"rejected"|"all">("pending");

  const showToast = (msg: string) => setToast(msg);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const [
        { count: u }, { count: sel }, { count: sh },
        { count: pr }, { count: sv },
        { count: ps }, { count: pv }, { count: rep },
      ] = await Promise.all([
        supabase.from("users").select("*", { count:"exact", head:true }),
        supabase.from("users").select("*", { count:"exact", head:true }).eq("role","seller"),
        supabase.from("shops").select("*", { count:"exact", head:true }),
        supabase.from("products").select("*", { count:"exact", head:true }),
        supabase.from("services").select("*", { count:"exact", head:true }),
        supabase.from("shops").select("*", { count:"exact", head:true }).eq("approval_status","pending"),
        supabase.from("verification_requests").select("*", { count:"exact", head:true }).eq("status","pending"),
        supabase.from("reports").select("*", { count:"exact", head:true }).eq("status","pending"),
      ]);
      setStats({ users:u||0, sellers:sel||0, shops:sh||0, products:pr||0, services:sv||0, pendingShops:ps||0, pendingVerifications:pv||0, reports:rep||0 });
    } finally { setStatsLoading(false); }
  };

  const loadUsers = async () => {
    setDataLoading(true);
    const { data } = await supabase.from("users").select("*").order("created_at",{ascending:false}).limit(200);
    setUsers(data||[]);
    setDataLoading(false);
  };

  const loadShops = async () => {
    setDataLoading(true);
    const { data } = await supabase.from("shops").select("*, users(full_name,email,is_verified)").order("created_at",{ascending:false}).limit(200);
    setShops(data||[]);
    setDataLoading(false);
  };

  const loadProducts = async () => {
    setDataLoading(true);
    const { data } = await supabase.from("products").select("*, shops(shop_name,shop_number), users(is_verified)").order("created_at",{ascending:false}).limit(200);
    setProducts(data||[]);
    setDataLoading(false);
  };

  const loadServices = async () => {
    setDataLoading(true);
    const { data } = await supabase.from("services").select("*, shops(shop_name,shop_number), users(is_verified)").order("created_at",{ascending:false}).limit(200);
    setServices(data||[]);
    setDataLoading(false);
  };

  const loadVerifications = async () => {
    setDataLoading(true);
    const { data } = await supabase
      .from("verification_requests")
      .select("*, users(full_name,email,role,county,is_verified)")
      .order("submitted_at",{ascending:false});
    setVerifications(data||[]);
    setDataLoading(false);
  };

  const loadReports = async () => {
    setDataLoading(true);
    const { data } = await supabase.from("reports").select("*").eq("status","pending").order("created_at",{ascending:false});
    setReports(data||[]);
    setDataLoading(false);
  };

  useEffect(() => { loadStats(); }, []);

  useEffect(() => {
    setSearch("");
    if (page==="users")         loadUsers();
    if (page==="shops")         loadShops();
    if (page==="products")      loadProducts();
    if (page==="services")      loadServices();
    if (page==="verifications") loadVerifications();
    if (page==="reports")       loadReports();
  }, [page]);

  const verifySeller = async (userId: string, verReqId: string) => {
    await Promise.all([
      supabase.from("users").update({ is_verified:true, is_premium:true }).eq("id", userId),
      supabase.from("verification_requests").update({ status:"approved", reviewed_at: new Date().toISOString() }).eq("id", verReqId),
    ]);
    showToast("✓ Seller verified!");
    loadVerifications(); loadStats();
  };

  const rejectVerification = async (verReqId: string) => {
    await supabase.from("verification_requests").update({ status:"rejected", reviewed_at: new Date().toISOString() }).eq("id", verReqId);
    showToast("Verification request rejected.");
    loadVerifications(); loadStats();
  };

  const revokeVerification = async (userId: string) => {
    if (!confirm("Revoke this seller's verification?")) return;
    await supabase.from("users").update({ is_verified:false, is_premium:false }).eq("id", userId);
    showToast("Verification revoked.");
    loadUsers();
  };

  const suspendUser = async (id: string) => { await supabase.from("users").update({ is_suspended:true }).eq("id", id); loadUsers(); showToast("User suspended."); };
  const restoreUser = async (id: string) => { await supabase.from("users").update({ is_suspended:false }).eq("id", id); loadUsers(); showToast("User restored."); };
  const approveShop = async (id: string) => { await supabase.from("shops").update({ approval_status:"approved" }).eq("id", id); loadShops(); loadStats(); showToast("Shop approved."); };
  const suspendShop = async (id: string) => { await supabase.from("shops").update({ approval_status:"suspended" }).eq("id", id); loadShops(); showToast("Shop suspended."); };
  const deleteProduct = async (id: string) => { if (!confirm("Delete product?")) return; await supabase.from("products").delete().eq("id", id); setProducts(p => p.filter(x => x.id !== id)); showToast("Product deleted."); };
  const deleteService = async (id: string) => { if (!confirm("Delete service?")) return; await supabase.from("services").delete().eq("id", id); setServices(s => s.filter(x => x.id !== id)); showToast("Service deleted."); };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-KE", { day:"numeric", month:"short", year:"numeric" }) : "—";
  const filter = (items: any[], fields: string[]) => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(i => fields.some(f => String(i[f]||"").toLowerCase().includes(q)));
  };

  const verFiltered = verifications.filter(v => verFilter === "all" ? true : v.status === verFilter);

  return (
    <>
      <style>{css}</style>
      {toast && <Toast msg={toast} onDone={()=>setToast("")}/>}

      <div style={{display:"flex"}}>
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">Shoplace <span className="tag">Admin</span></div>

          <div className="nav-section">
            <div className="nav-label">Overview</div>
            <div className={`nav-item ${page==="dashboard"?"active":""}`} onClick={()=>setPage("dashboard")}><span>⬛</span> Dashboard</div>
          </div>

          <div className="nav-section">
            <div className="nav-label">People</div>
            <div className={`nav-item ${page==="users"?"active":""}`} onClick={()=>setPage("users")}><span>👤</span> All Users {stats.users>0&&<b className="nav-count blue">{stats.users}</b>}</div>
            <div className={`nav-item ${page==="shops"?"active":""}`} onClick={()=>setPage("shops")}><span>🏬</span> All Shops {stats.pendingShops>0&&<b className="nav-count">{stats.pendingShops}</b>}</div>
          </div>

          <div className="nav-section">
            <div className="nav-label">Verification</div>
            <div className={`nav-item ${page==="verifications"?"active":""}`} onClick={()=>setPage("verifications")}>
              <span>✅</span> Verification
              {stats.pendingVerifications>0 && <b className="nav-count orange">{stats.pendingVerifications}</b>}
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-label">Content</div>
            <div className={`nav-item ${page==="products"?"active":""}`} onClick={()=>setPage("products")}><span>📦</span> Products {stats.products>0&&<b className="nav-count blue">{stats.products}</b>}</div>
            <div className={`nav-item ${page==="services"?"active":""}`} onClick={()=>setPage("services")}><span>⚙️</span> Services {stats.services>0&&<b className="nav-count blue">{stats.services}</b>}</div>
            <div className={`nav-item ${page==="reports"?"active":""}`} onClick={()=>setPage("reports")}><span>🚨</span> Reports {stats.reports>0&&<b className="nav-count">{stats.reports}</b>}</div>
          </div>

          <div className="sidebar-footer">
            <div className="admin-profile">
              <div className="admin-av">AD</div>
              <div><div className="admin-name">Administrator</div><div className="admin-role">Shoplace Admin</div></div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">

          {/* DASHBOARD */}
          {page === "dashboard" && (
            <div>
              <div className="page-header">
                <div><div className="page-title">Dashboard</div><div className="page-sub">Live platform overview — Shoplace Kenya</div></div>
                <button className="btn-sm" onClick={loadStats}>↻ Refresh</button>
              </div>
              <div className="stats-grid">
                {[
                  { icon:"👤", val:stats.users,    label:"Total Users",    color:"#4f7cff" },
                  { icon:"🏬", val:stats.shops,    label:"Total Shops",    color:"#34c77b" },
                  { icon:"📦", val:stats.products, label:"Total Products", color:"#f5a623" },
                  { icon:"⚙️",  val:stats.services, label:"Total Services", color:"#ff4f4f" },
                ].map(s => (
                  <div className="stat-card" key={s.label} style={{"--c":s.color} as any}>
                    <div className="stat-icon">{s.icon}</div>
                    {statsLoading ? <div className="stat-skel"/> : <div className="stat-val">{s.val.toLocaleString()}</div>}
                    <div className="stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
              {stats.pendingVerifications > 0 && (
                <div className="alert-card orange" onClick={()=>setPage("verifications")} style={{cursor:"pointer"}}>
                  <div className="alert-icon">✅</div>
                  <div className="alert-body">
                    <div className="alert-title">{stats.pendingVerifications} Seller Verification Request{stats.pendingVerifications>1?"s":""} Pending</div>
                    <div className="alert-sub">Sellers are waiting for verification. Click to review →</div>
                  </div>
                </div>
              )}
              {stats.pendingShops > 0 && (
                <div className="alert-card yellow" onClick={()=>setPage("shops")} style={{cursor:"pointer"}}>
                  <div className="alert-icon">🏬</div>
                  <div className="alert-body">
                    <div className="alert-title">{stats.pendingShops} Shop{stats.pendingShops>1?"s":""} Awaiting Approval</div>
                    <div className="alert-sub">New shops need to be reviewed before going live. Click to review →</div>
                  </div>
                </div>
              )}
              {stats.reports > 0 && (
                <div className="alert-card red" onClick={()=>setPage("reports")} style={{cursor:"pointer"}}>
                  <div className="alert-icon">🚨</div>
                  <div className="alert-body">
                    <div className="alert-title">{stats.reports} Report{stats.reports>1?"s":""} Need Attention</div>
                    <div className="alert-sub">Reported listings require moderation. Click to review →</div>
                  </div>
                </div>
              )}
              {stats.pendingVerifications===0 && stats.pendingShops===0 && stats.reports===0 && !statsLoading && (
                <div className="alert-card green">
                  <div className="alert-icon">✅</div>
                  <div className="alert-body">
                    <div className="alert-title">All clear — no pending actions</div>
                    <div className="alert-sub">No verification requests, shop approvals or reports waiting.</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* USERS */}
          {page === "users" && (
            <div>
              <div className="page-header">
                <div><div className="page-title">All Users</div><div className="page-sub">{dataLoading?"Loading...":users.length+" users"}</div></div>
              </div>
              <div className="table-card">
                <div className="table-header">
                  <div className="table-title">User Directory</div>
                  <div className="tsearch"><span>🔍</span><input placeholder="Search name or email..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
                </div>
                {dataLoading ? <Empty icon="⏳" title="Loading..." sub="Fetching users"/> :
                 users.length===0 ? <Empty icon="👤" title="No users yet" sub="Users will appear here once they sign up."/> :
                 <table>
                   <thead><tr><th>User</th><th>Phone</th><th>Role</th><th>County</th><th>Verified</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
                   <tbody>
                     {filter(users,["full_name","email","county","role"]).map(u=>(
                       <tr key={u.id}>
                         <td><div className="ucell"><div className="uav">{(u.full_name||u.email||"?")[0].toUpperCase()}</div><div><div className="uname">{u.full_name||"—"}</div><div className="uemail">{u.email}</div></div></div></td>
                         <td style={{fontSize:"0.82rem"}}>{u.phone||"—"}</td>
                         <td><span className={`role-tag ${u.role||"buyer"}`}>{u.role||"buyer"}</span></td>
                         <td style={{fontSize:"0.82rem"}}>{u.county||"—"}</td>
                         <td>{u.is_verified ? <span className="ver-badge">✓ Verified</span> : <span style={{fontSize:"0.72rem",color:"rgba(232,234,240,0.25)"}}>—</span>}</td>
                         <td style={{fontSize:"0.75rem",color:"rgba(232,234,240,0.35)"}}>{fmtDate(u.created_at)}</td>
                         <td><Pill status={u.is_suspended?"suspended":"active"}/></td>
                         <td>
                           {u.is_verified && <button className="action-btn warn" onClick={()=>revokeVerification(u.id)}>Revoke ✓</button>}
                           {u.is_suspended ? <button className="action-btn success" onClick={()=>restoreUser(u.id)}>Restore</button> : <button className="action-btn danger" onClick={()=>suspendUser(u.id)}>Suspend</button>}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>}
              </div>
            </div>
          )}

          {/* SHOPS */}
          {page === "shops" && (
            <div>
              <div className="page-header">
                <div><div className="page-title">All Shops</div><div className="page-sub">{dataLoading?"Loading...":shops.length+" shops"}</div></div>
              </div>
              <div className="table-card">
                <div className="table-header">
                  <div className="table-title">Shop Directory</div>
                  <div className="tsearch"><span>🔍</span><input placeholder="Search name or county..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
                </div>
                {dataLoading ? <Empty icon="⏳" title="Loading..." sub="Fetching shops"/> :
                 shops.length===0 ? <Empty icon="🏬" title="No shops yet" sub="Shops will appear once sellers register."/> :
                 <table>
                   <thead><tr><th>Shop #</th><th>Shop Name</th><th>Owner</th><th>County</th><th>Seller Verified</th><th>Status</th><th>Actions</th></tr></thead>
                   <tbody>
                     {filter(shops,["shop_name","county"]).map(s=>(
                       <tr key={s.id}>
                         <td><ShopNum num={s.shop_number}/></td>
                         <td><div style={{fontWeight:500}}>{s.shop_name}</div><div style={{fontSize:"0.72rem",color:"rgba(232,234,240,0.4)"}}>{s.category||"—"}</div></td>
                         <td style={{fontSize:"0.8rem",color:"rgba(232,234,240,0.5)"}}>{s.users?.full_name||s.users?.email||"—"}</td>
                         <td style={{fontSize:"0.82rem"}}>{s.county||"—"}</td>
                         <td>{s.users?.is_verified ? <span className="ver-badge">✓ Verified</span> : <span style={{fontSize:"0.72rem",color:"rgba(232,234,240,0.25)"}}>Not verified</span>}</td>
                         <td><Pill status={s.approval_status||"pending"}/></td>
                         <td>
                           {s.approval_status==="pending" && <button className="action-btn success" onClick={()=>approveShop(s.id)}>Approve</button>}
                           {s.approval_status==="approved" && <button className="action-btn danger" onClick={()=>suspendShop(s.id)}>Suspend</button>}
                           {s.approval_status==="suspended" && <button className="action-btn success" onClick={()=>approveShop(s.id)}>Restore</button>}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>}
              </div>
            </div>
          )}

          {/* VERIFICATIONS */}
          {page === "verifications" && (
            <div>
              <div className="page-header">
                <div>
                  <div className="page-title">Seller Verifications</div>
                  <div className="page-sub">{dataLoading?"Loading...":`${verifications.filter(v=>v.status==="pending").length} pending · ${verifications.filter(v=>v.status==="approved").length} approved · ${verifications.filter(v=>v.status==="rejected").length} rejected`}</div>
                </div>
                <button className="btn-sm" onClick={loadVerifications}>↻ Refresh</button>
              </div>
              <div className="filter-tabs">
                {(["pending","approved","rejected","all"] as const).map(f=>(
                  <button key={f} className={`filter-tab ${verFilter===f?"active":""}`} onClick={()=>setVerFilter(f)}>
                    {f==="pending"?`⏳ Pending (${verifications.filter(v=>v.status==="pending").length})`:
                     f==="approved"?`✓ Approved (${verifications.filter(v=>v.status==="approved").length})`:
                     f==="rejected"?`✗ Rejected (${verifications.filter(v=>v.status==="rejected").length})`:
                     `All (${verifications.length})`}
                  </button>
                ))}
              </div>
              {dataLoading ? <Empty icon="⏳" title="Loading..." sub="Fetching verification requests"/> :
               verFiltered.length===0 ? <Empty icon="✅" title={`No ${verFilter==="all"?"":verFilter} requests`} sub="Nothing to show here."/> :
               <div className="ver-list">
                 {verFiltered.map(v=>(
                   <div key={v.id} className={`ver-card ${v.status}`}>
                     <div className="ver-card-top">
                       <div className="ver-av">{(v.full_name||v.users?.email||"?")[0].toUpperCase()}</div>
                       <div className="ver-identity">
                         <div className="ver-name">{v.full_name || v.users?.full_name || "—"}</div>
                         <div className="ver-email">{v.users?.email||"—"}</div>
                         <div className="ver-meta">{v.county||v.users?.county||"—"} · Submitted {fmtDate(v.submitted_at)}</div>
                       </div>
                       <div style={{marginLeft:"auto",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"0.5rem"}}>
                         <Pill status={v.status}/>
                         {v.users?.is_verified && <span className="ver-badge">✓ Currently Verified</span>}
                       </div>
                     </div>
                     <div className="ver-details">
                       {[["ID / Passport",v.id_number],["Business Name",v.business_name],["Business Type",v.business_type],["Phone",v.phone],["Reason",v.reason]].filter(([,val])=>val).map(([label,val])=>(
                         <div key={label} className="ver-detail-row"><span className="ver-detail-label">{label}</span><span className="ver-detail-val">{val}</span></div>
                       ))}
                     </div>
                     {v.status==="pending" && <div className="ver-actions"><button className="btn-verify" onClick={()=>verifySeller(v.user_id,v.id)}>✓ Approve & Verify Seller</button><button className="btn-reject" onClick={()=>rejectVerification(v.id)}>✗ Reject</button></div>}
                     {v.status==="approved" && <div className="ver-actions"><span style={{fontSize:"0.78rem",color:"rgba(232,234,240,0.4)"}}>Approved on {fmtDate(v.reviewed_at)}</span><button className="btn-reject" onClick={()=>revokeVerification(v.user_id)}>Revoke Verification</button></div>}
                     {v.status==="rejected" && <div className="ver-actions"><span style={{fontSize:"0.78rem",color:"rgba(232,234,240,0.4)"}}>Rejected on {fmtDate(v.reviewed_at)}</span><button className="btn-verify" onClick={()=>verifySeller(v.user_id,v.id)}>Override — Verify Anyway</button></div>}
                   </div>
                 ))}
               </div>}
            </div>
          )}

          {/* PRODUCTS */}
          {page === "products" && (
            <div>
              <div className="page-header">
                <div><div className="page-title">Products</div><div className="page-sub">{dataLoading?"Loading...":products.length+" products"}</div></div>
                <button className="btn-sm" onClick={loadProducts}>↻ Refresh</button>
              </div>
              <div className="table-card">
                <div className="table-header">
                  <div className="table-title">All Products</div>
                  <div className="tsearch"><span>🔍</span><input placeholder="Search name, category..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
                </div>
                {dataLoading ? <Empty icon="⏳" title="Loading..." sub="Fetching products"/> :
                 products.length===0 ? <Empty icon="📦" title="No products yet" sub="Products appear once sellers add them."/> :
                 <table>
                   <thead><tr><th>Product</th><th>Shop</th><th>Category</th><th>Price</th><th>County</th><th>Status</th><th>Posted</th><th>Actions</th></tr></thead>
                   <tbody>
                     {filter(products,["name","category","county"]).map(p=>(
                       <tr key={p.id}>
                         <td><div className="product-cell"><div className="product-thumb"><ProductImage url={p.image_url} name={p.name}/></div><div><div className="product-name">{p.name}</div><div className="product-meta">{p.condition==="new"?"✨ New":"♻️ Used"}</div></div></div></td>
                         <td><div style={{fontSize:"0.82rem"}}>{p.shops?.shop_name||"—"}</div>{p.shops?.shop_number&&<ShopNum num={p.shops.shop_number}/>}</td>
                         <td><span className="cat-pill">{p.category||"—"}</span></td>
                         <td style={{fontFamily:"monospace",fontWeight:700,color:"#f5a623",fontSize:"0.88rem"}}>KSh {p.price?.toLocaleString()}</td>
                         <td style={{fontSize:"0.82rem"}}>{p.county||"—"}</td>
                         <td><Pill status={p.is_active?"active":"pending"}/></td>
                         <td style={{fontSize:"0.75rem",color:"rgba(232,234,240,0.35)"}}>{fmtDate(p.created_at)}</td>
                         <td><button className="action-btn danger" onClick={()=>deleteProduct(p.id)}>Delete</button></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>}
              </div>
            </div>
          )}

          {/* SERVICES */}
          {page === "services" && (
            <div>
              <div className="page-header">
                <div><div className="page-title">Services</div><div className="page-sub">{dataLoading?"Loading...":services.length+" services"}</div></div>
                <button className="btn-sm" onClick={loadServices}>↻ Refresh</button>
              </div>
              <div className="table-card">
                <div className="table-header">
                  <div className="table-title">All Services</div>
                  <div className="tsearch"><span>🔍</span><input placeholder="Search name, category..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
                </div>
                {dataLoading ? <Empty icon="⏳" title="Loading..." sub="Fetching services"/> :
                 services.length===0 ? <Empty icon="⚙️" title="No services yet" sub="Services appear once sellers add them."/> :
                 <table>
                   <thead><tr><th>Service</th><th>Shop</th><th>Category</th><th>Price</th><th>County</th><th>Posted</th><th>Actions</th></tr></thead>
                   <tbody>
                     {filter(services,["name","category","county"]).map(s=>(
                       <tr key={s.id}>
                         <td><div className="product-cell"><div className="product-thumb" style={{background:"rgba(139,92,246,0.1)"}}><div className="product-thumb-fallback" style={{color:"#7c3aed"}}>⚙️</div></div><div><div className="product-name">{s.name}</div><div className="product-meta">{s.price_type||"fixed"}</div></div></div></td>
                         <td><div style={{fontSize:"0.82rem"}}>{s.shops?.shop_name||"—"}</div>{s.shops?.shop_number&&<ShopNum num={s.shops.shop_number}/>}</td>
                         <td><span className="cat-pill">{s.category||"—"}</span></td>
                         <td style={{fontFamily:"monospace",fontWeight:700,color:"#f5a623",fontSize:"0.88rem"}}>{s.price_type==="free"?"Free":s.price_type==="negotiable"?"Negotiable":s.price?`KSh ${s.price.toLocaleString()}`:"—"}</td>
                         <td style={{fontSize:"0.82rem"}}>{s.county||"—"}</td>
                         <td style={{fontSize:"0.75rem",color:"rgba(232,234,240,0.35)"}}>{fmtDate(s.created_at)}</td>
                         <td><button className="action-btn danger" onClick={()=>deleteService(s.id)}>Delete</button></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {page === "reports" && (
            <div>
              <div className="page-header">
                <div><div className="page-title">Reports</div><div className="page-sub">{dataLoading?"Loading...":reports.length+" pending"}</div></div>
              </div>
              <div className="table-card">
                <div className="table-header"><div className="table-title">🚨 Pending Reports</div></div>
                {dataLoading ? <Empty icon="⏳" title="Loading..." sub="Fetching reports"/> :
                 reports.length===0 ? <Empty icon="✅" title="No reports" sub="No listings reported yet."/> :
                 <table>
                   <thead><tr><th>Listing ID</th><th>Type</th><th>Reason</th><th>Reported</th><th>Actions</th></tr></thead>
                   <tbody>
                     {reports.map(r=>(
                       <tr key={r.id}>
                         <td style={{fontFamily:"monospace",fontSize:"0.78rem"}}>{r.listing_id?.slice(0,8)}...</td>
                         <td><span className="cat-pill">{r.listing_type}</span></td>
                         <td style={{fontSize:"0.82rem"}}>{r.reason}</td>
                         <td style={{fontSize:"0.75rem",color:"rgba(232,234,240,0.4)"}}>{fmtDate(r.created_at)}</td>
                         <td>
                           <button className="action-btn danger" onClick={async()=>{await supabase.from("reports").update({status:"actioned"}).eq("id",r.id);loadReports();}}>Action</button>
                           <button className="action-btn" onClick={async()=>{await supabase.from("reports").update({status:"dismissed"}).eq("id",r.id);loadReports();}}>Dismiss</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>}
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
:root{--bg:#0a0b0d;--surface:#111317;--surface2:#181b20;--border:rgba(255,255,255,0.07);--text:#e8eaf0;--muted:rgba(232,234,240,0.4);--accent:#4f7cff;--danger:#ff4f4f;--success:#34c77b;--warn:#f5a623;--orange:#FF8040;}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
.sidebar{width:248px;min-height:100vh;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:1.4rem 0;position:fixed;top:0;left:0;bottom:0;z-index:50;overflow-y:auto;}
.sidebar-logo{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:800;padding:0 1.4rem 1.4rem;border-bottom:1px solid var(--border);margin-bottom:1.2rem;}
.sidebar-logo .tag{display:inline-block;font-size:0.58rem;background:var(--accent);color:white;padding:0.12rem 0.38rem;border-radius:3px;margin-left:0.4rem;text-transform:uppercase;letter-spacing:0.06em;}
.nav-section{padding:0 0.9rem;margin-bottom:0.6rem;}
.nav-label{font-size:0.62rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;padding:0 0.5rem;margin-bottom:0.35rem;}
.nav-item{display:flex;align-items:center;gap:0.65rem;padding:0.62rem 0.85rem;border-radius:9px;font-size:0.84rem;color:var(--muted);cursor:pointer;transition:all 0.15s;margin-bottom:0.06rem;}
.nav-item:hover{background:var(--surface2);color:var(--text);}
.nav-item.active{background:rgba(79,124,255,0.12);color:var(--accent);}
.nav-count{margin-left:auto;color:white;font-size:0.62rem;font-weight:700;padding:0.08rem 0.42rem;border-radius:100px;background:var(--danger);}
.nav-count.blue{background:var(--accent);}
.nav-count.orange{background:var(--orange);}
.sidebar-footer{margin-top:auto;padding:1.2rem 1.4rem;border-top:1px solid var(--border);}
.admin-profile{display:flex;align-items:center;gap:0.7rem;}
.admin-av{width:32px;height:32px;background:var(--accent);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;color:white;}
.admin-name{font-size:0.82rem;font-weight:500;}
.admin-role{font-size:0.68rem;color:var(--muted);}
.main{margin-left:248px;flex:1;padding:2rem 2.5rem;min-height:100vh;}
.page-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.8rem;}
.page-title{font-family:'Syne',sans-serif;font-size:1.55rem;font-weight:800;letter-spacing:-0.02em;}
.page-sub{font-size:0.83rem;color:var(--muted);margin-top:0.2rem;}
.btn-sm{padding:0.45rem 1rem;border-radius:7px;border:1px solid var(--border);font-family:'DM Sans',sans-serif;font-size:0.8rem;font-weight:500;background:var(--surface2);color:var(--text);cursor:pointer;transition:all 0.15s;}
.btn-sm:hover{border-color:var(--accent);color:var(--accent);}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.2rem;margin-bottom:1.8rem;}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:1.4rem;position:relative;overflow:hidden;}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--c,var(--accent));}
.stat-icon{font-size:1.4rem;margin-bottom:0.7rem;}
.stat-val{font-family:'Syne',sans-serif;font-size:1.9rem;font-weight:800;letter-spacing:-0.03em;}
.stat-lbl{font-size:0.78rem;color:var(--muted);margin-top:0.2rem;}
.stat-skel{height:2rem;background:rgba(255,255,255,0.06);border-radius:6px;margin:0.3rem 0;animation:shimmer 1.5s infinite;}
@keyframes shimmer{0%,100%{opacity:.4}50%{opacity:.9}}
.alert-card{display:flex;align-items:center;gap:1.2rem;padding:1.2rem 1.5rem;border-radius:14px;margin-bottom:1rem;border:1px solid;transition:all 0.2s;}
.alert-card.orange{background:rgba(255,128,64,0.07);border-color:rgba(255,128,64,0.2);}
.alert-card.yellow{background:rgba(245,166,35,0.07);border-color:rgba(245,166,35,0.2);}
.alert-card.red{background:rgba(255,79,79,0.07);border-color:rgba(255,79,79,0.2);}
.alert-card.green{background:rgba(52,199,123,0.07);border-color:rgba(52,199,123,0.2);}
.alert-card:hover{transform:translateY(-1px);}
.alert-icon{font-size:1.8rem;}
.alert-title{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;margin-bottom:0.25rem;}
.alert-sub{font-size:0.8rem;color:var(--muted);}
.table-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:1.5rem;}
.table-header{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 1.4rem;border-bottom:1px solid var(--border);}
.table-title{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;}
.tsearch{display:flex;align-items:center;gap:0.5rem;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:0.38rem 0.75rem;}
.tsearch input{background:none;border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:0.82rem;color:var(--text);width:200px;}
.tsearch input::placeholder{color:var(--muted);}
table{width:100%;border-collapse:collapse;}
thead th{padding:0.68rem 1.4rem;text-align:left;font-size:0.68rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;background:rgba(255,255,255,0.02);border-bottom:1px solid var(--border);}
tbody tr{border-bottom:1px solid rgba(255,255,255,0.03);transition:background 0.1s;}
tbody tr:hover{background:rgba(255,255,255,0.02);}
tbody tr:last-child{border-bottom:none;}
td{padding:0.82rem 1.4rem;font-size:0.845rem;vertical-align:middle;}
.ucell{display:flex;align-items:center;gap:0.7rem;}
.uav{width:30px;height:30px;border-radius:7px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:600;flex-shrink:0;}
.uname{font-weight:500;font-size:0.845rem;}
.uemail{font-size:0.72rem;color:var(--muted);}
.role-tag{display:inline-block;padding:0.16rem 0.5rem;border-radius:5px;font-size:0.67rem;font-weight:700;text-transform:uppercase;background:rgba(79,124,255,0.1);color:var(--accent);}
.role-tag.buyer{background:rgba(255,255,255,0.05);color:var(--muted);}
.role-tag.admin{background:rgba(255,128,64,0.12);color:#FF8040;}
.ver-badge{display:inline-flex;align-items:center;gap:0.2rem;font-size:0.68rem;font-weight:700;color:var(--orange);background:rgba(255,128,64,0.1);border:1px solid rgba(255,128,64,0.25);padding:0.15rem 0.5rem;border-radius:100px;}
.action-btn{padding:0.26rem 0.62rem;border-radius:5px;border:1px solid var(--border);background:none;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.72rem;cursor:pointer;transition:all 0.15s;margin-right:0.3rem;}
.action-btn:hover{border-color:var(--accent);color:var(--accent);}
.action-btn.danger:hover{border-color:var(--danger);color:var(--danger);}
.action-btn.success:hover{border-color:var(--success);color:var(--success);}
.action-btn.warn:hover{border-color:var(--warn);color:var(--warn);}
.product-cell{display:flex;align-items:center;gap:0.8rem;}
.product-thumb{width:46px;height:46px;border-radius:9px;background:rgba(255,255,255,0.05);border:1px solid var(--border);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.product-thumb-fallback{font-size:1.3rem;color:rgba(232,234,240,0.3);}
.product-name{font-weight:500;font-size:0.845rem;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.product-meta{font-size:0.7rem;color:var(--muted);margin-top:0.1rem;}
.cat-pill{font-size:0.68rem;background:rgba(255,255,255,0.06);color:rgba(232,234,240,0.55);padding:0.16rem 0.52rem;border-radius:100px;white-space:nowrap;}
.filter-tabs{display:flex;gap:0.5rem;margin-bottom:1.2rem;flex-wrap:wrap;}
.filter-tab{padding:0.45rem 1rem;border:1px solid var(--border);border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.8rem;font-weight:500;background:var(--surface2);color:var(--muted);cursor:pointer;transition:all 0.15s;}
.filter-tab:hover{border-color:var(--accent);color:var(--text);}
.filter-tab.active{background:rgba(79,124,255,0.12);border-color:var(--accent);color:var(--accent);font-weight:600;}
.ver-list{display:flex;flex-direction:column;gap:1rem;}
.ver-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:1.5rem;}
.ver-card.pending{border-left:3px solid var(--warn);}
.ver-card.approved{border-left:3px solid var(--orange);}
.ver-card.rejected{border-left:3px solid var(--danger);opacity:0.7;}
.ver-card-top{display:flex;align-items:flex-start;gap:1rem;margin-bottom:1.2rem;}
.ver-av{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#c84b31,#ff6b35);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:800;color:white;flex-shrink:0;}
.ver-name{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;margin-bottom:0.15rem;}
.ver-email{font-size:0.78rem;color:var(--muted);margin-bottom:0.2rem;}
.ver-meta{font-size:0.73rem;color:rgba(232,234,240,0.3);}
.ver-details{display:grid;grid-template-columns:repeat(2,1fr);gap:0.6rem 2rem;margin-bottom:1.2rem;background:rgba(255,255,255,0.02);border-radius:10px;padding:1rem;}
.ver-detail-row{display:flex;flex-direction:column;gap:0.15rem;}
.ver-detail-label{font-size:0.68rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;}
.ver-detail-val{font-size:0.84rem;color:var(--text);}
.ver-actions{display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;}
.btn-verify{padding:0.55rem 1.3rem;background:linear-gradient(135deg,#FF8040,#ff5500);border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.84rem;font-weight:700;color:white;cursor:pointer;transition:all 0.2s;}
.btn-verify:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(255,128,64,0.3);}
.btn-reject{padding:0.52rem 1.1rem;background:rgba(255,79,79,0.08);border:1px solid rgba(255,79,79,0.2);border-radius:100px;font-family:'DM Sans',sans-serif;font-size:0.84rem;font-weight:600;color:var(--danger);cursor:pointer;transition:all 0.2s;}
.btn-reject:hover{background:rgba(255,79,79,0.15);}
`;